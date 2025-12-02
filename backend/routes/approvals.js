import express from 'express';
import Event from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/approvals/events
 * @desc    Get all events pending approval (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.get('/events', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const pendingEvents = await Event.find({ status: 'PENDING_APPROVAL' })
      .populate('createdBy', 'name email')
      .populate('societyId', 'name societyName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingEvents.length,
      events: pendingEvents,
    });
  } catch (error) {
    console.error('Get pending events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending events.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/approvals/events/:id/approve
 * @desc    Approve an event (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.post('/events/:id/approve', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { remarks } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: 'Event is not pending approval.',
      });
    }

    event.status = 'APPROVED';
    if (remarks) {
      event.approvalRemarks = remarks;
    }

    await event.save();

    res.json({
      success: true,
      message: 'Event approved successfully.',
      event,
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving event.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/approvals/events/:id/reject
 * @desc    Reject an event (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.post('/events/:id/reject', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({
        success: false,
        message: 'Rejection remarks are required.',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: 'Event is not pending approval.',
      });
    }

    event.status = 'REJECTED';
    event.approvalRemarks = remarks;

    await event.save();

    res.json({
      success: true,
      message: 'Event rejected.',
      event,
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting event.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/approvals/events/all
 * @desc    Get all events for super admin (all statuses)
 * @access  Private (SUPER_ADMIN)
 */
router.get('/events/all', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .populate('societyId', 'name societyName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events.',
      error: error.message,
    });
  }
});

export default router;
