import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { authenticate, authorize, checkEventOwnership } from '../middleware/auth.js';
import { uploadProposal } from '../config/multer.js';
import { checkEventTimeClashes } from '../utils/clashDetection.js';
import { calculateXP, awardXPToUsers } from '../utils/xpSystem.js';

const router = express.Router();

/**
 * @route   POST /api/events
 * @desc    Create a new event (SOCIETY_ADMIN only)
 * @access  Private (SOCIETY_ADMIN)
 */
router.post('/', authenticate, authorize('SOCIETY_ADMIN'), uploadProposal.single('proposalPdf'), async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      startDateTime,
      endDateTime,
      maxParticipants,
      prizes,
      submitForApproval,
    } = req.body;

    // Validate required fields
    if (!title || !category || !description || !startDateTime || !endDateTime || !maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    // Parse prizes if sent as JSON string
    let parsedPrizes = [];
    if (prizes) {
      try {
        parsedPrizes = typeof prizes === 'string' ? JSON.parse(prizes) : prizes;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prizes format.',
        });
      }
    }

    // Check for time clashes (warning only)
    const clashes = await checkEventTimeClashes(new Date(startDateTime), new Date(endDateTime));
    
    // Determine status - events with proposal PDF go directly to pending approval
    let status = 'DRAFT';
    if (req.file) {
      status = 'PENDING_APPROVAL';
    } else if (submitForApproval) {
      return res.status(400).json({
        success: false,
        message: 'Proposal PDF is required for submitting for approval.',
      });
    }

    // Create event
    const event = new Event({
      title,
      societyId: req.user._id,
      societyName: req.user.societyName,
      category,
      description,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      maxParticipants: parseInt(maxParticipants),
      prizes: parsedPrizes,
      proposalPdfUrl: req.file ? `/uploads/proposals/${req.file.filename}` : null,
      status,
      createdBy: req.user._id,
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event,
      clashes: clashes.length > 0 ? clashes : null,
      warning: clashes.length > 0 ? 'This event has time clashes with existing events.' : null,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/events
 * @desc    Get list of events with filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { status, category, societyName, startDate, endDate, search } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (societyName) {
      query.societyName = new RegExp(societyName, 'i');
    }

    if (startDate || endDate) {
      query.startDateTime = {};
      if (startDate) {
        query.startDateTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDateTime.$lte = new Date(endDate);
      }
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDateTime: 1 });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get single event details
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registeredParticipants', 'name email xp')
      .populate('roomId', 'name location capacity');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event.',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event (only by owning SOCIETY_ADMIN)
 * @access  Private (SOCIETY_ADMIN owner)
 */
router.put('/:id', authenticate, authorize('SOCIETY_ADMIN'), checkEventOwnership, uploadProposal.single('proposalPdf'), async (req, res) => {
  try {
    const event = req.event;

    // Don't allow editing completed events
    if (event.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a completed event.',
      });
    }

    const {
      title,
      category,
      description,
      startDateTime,
      endDateTime,
      maxParticipants,
      prizes,
      submitForApproval,
    } = req.body;

    // Update fields
    if (title) event.title = title;
    if (category) event.category = category;
    if (description) event.description = description;
    if (maxParticipants) event.maxParticipants = parseInt(maxParticipants);

    // Parse and update prizes
    if (prizes) {
      try {
        event.prizes = typeof prizes === 'string' ? JSON.parse(prizes) : prizes;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prizes format.',
        });
      }
    }

    // Update date/time and check clashes
    let clashes = [];
    if (startDateTime || endDateTime) {
      const newStartDate = startDateTime ? new Date(startDateTime) : event.startDateTime;
      const newEndDate = endDateTime ? new Date(endDateTime) : event.endDateTime;

      if (newEndDate <= newStartDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date.',
        });
      }

      clashes = await checkEventTimeClashes(newStartDate, newEndDate, event._id);
      
      event.startDateTime = newStartDate;
      event.endDateTime = newEndDate;
    }

    // Update proposal PDF
    if (req.file) {
      event.proposalPdfUrl = `/uploads/proposals/${req.file.filename}`;
    }

    // Update status if submitting for approval
    if (submitForApproval && event.proposalPdfUrl) {
      event.status = 'PENDING_APPROVAL';
    }

    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully.',
      event,
      clashes: clashes.length > 0 ? clashes : null,
      warning: clashes.length > 0 ? 'This event has time clashes with existing events.' : null,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event.',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event (only by owning SOCIETY_ADMIN)
 * @access  Private (SOCIETY_ADMIN owner)
 */
router.delete('/:id', authenticate, authorize('SOCIETY_ADMIN'), checkEventOwnership, async (req, res) => {
  try {
    const event = req.event;

    // Don't allow deleting approved or completed events
    if (['APPROVED', 'COMPLETED'].includes(event.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an approved or completed event.',
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/events/:id/register
 * @desc    Register for an event (STUDENT only)
 * @access  Private (STUDENT)
 */
router.post('/:id/register', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    console.log('Registration attempt:', {
      eventId: event._id,
      eventStatus: event.status,
      eventEndTime: event.endDateTime,
      currentTime: new Date(),
      userId: req.user._id,
      alreadyRegistered: event.registeredParticipants.includes(req.user._id),
      currentParticipants: event.registeredParticipants.length,
      maxParticipants: event.maxParticipants
    });

    // Check if event is approved
    if (event.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: `Event is not open for registration. Current status: ${event.status}`,
      });
    }

    // Check if event has already happened
    if (new Date() > event.endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Event has already ended.',
      });
    }

    // Check if already registered
    if (event.registeredParticipants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }

    // Check if event is full
    if (event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full.',
      });
    }

    // Register user
    event.registeredParticipants.push(req.user._id);
    await event.save();

    // Award XP for registration
    const student = await User.findById(req.user._id);
    student.awardXP(10); // 10 XP for registering
    await student.save();

    res.json({
      success: true,
      message: 'Successfully registered for event. +10 XP awarded!',
      event,
      user: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        xp: student.xp,
      },
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event.',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/events/:id/register
 * @desc    Cancel registration for an event (STUDENT only)
 * @access  Private (STUDENT)
 */
router.delete('/:id/register', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Check if registered
    if (!event.registeredParticipants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event.',
      });
    }

    // Check if event has started
    if (new Date() > event.startDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration after event has started.',
      });
    }

    // Remove registration
    event.registeredParticipants = event.registeredParticipants.filter(
      id => id.toString() !== req.user._id.toString()
    );
    await event.save();

    res.json({
      success: true,
      message: 'Registration cancelled successfully.',
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling registration.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/events/:id/conclude
 * @desc    Mark event as completed and assign winners (SOCIETY_ADMIN owner only)
 * @access  Private (SOCIETY_ADMIN owner)
 */
router.post('/:id/conclude', authenticate, authorize('SOCIETY_ADMIN'), checkEventOwnership, async (req, res) => {
  try {
    const event = req.event;
    const { winners } = req.body;

    // Validate event status
    if (event.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Event is already concluded.',
      });
    }

    if (event.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Only approved events can be concluded.',
      });
    }

    // Validate winners
    if (winners) {
      const winnersMap = new Map();
      for (const [position, userId] of Object.entries(winners)) {
        // Check if user is a participant
        if (!event.registeredParticipants.some(id => id.toString() === userId)) {
          return res.status(400).json({
            success: false,
            message: `User ${userId} is not a participant of this event.`,
          });
        }
        winnersMap.set(position, userId);
      }
      event.winners = winnersMap;

      // Award XP to winners
      for (const [position, userId] of winnersMap.entries()) {
        let xpType = 'participant';
        if (position.toLowerCase().includes('first')) xpType = 'winner_first';
        else if (position.toLowerCase().includes('second')) xpType = 'winner_second';
        else if (position.toLowerCase().includes('third')) xpType = 'winner_third';

        const xpPoints = calculateXP(xpType);
        await awardXPToUsers([userId], xpPoints);
      }
    }

    // Award base XP to all participants
    const participantIds = event.registeredParticipants.filter(
      id => !Array.from(event.winners.values()).includes(id.toString())
    );
    const baseXP = calculateXP('participant');
    await awardXPToUsers(participantIds, baseXP);

    // Mark as completed
    event.status = 'COMPLETED';
    await event.save();

    res.json({
      success: true,
      message: 'Event concluded successfully and XP awarded to participants.',
      event,
    });
  } catch (error) {
    console.error('Conclude event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error concluding event.',
      error: error.message,
    });
  }
});

export default router;
