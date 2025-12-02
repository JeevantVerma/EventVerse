import express from 'express';
import Room from '../models/Room.js';
import RoomBooking from '../models/RoomBooking.js';
import Event from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { checkRoomClashes, getAvailableRooms } from '../utils/clashDetection.js';

const router = express.Router();

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });

    res.json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/rooms
 * @desc    Create a new room (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.post('/', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { name, location, capacity, resources } = req.body;

    if (!name || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, location, and capacity.',
      });
    }

    const room = new Room({
      name,
      location,
      capacity: parseInt(capacity),
      resources: resources || [],
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room.',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/rooms/:id
 * @desc    Update a room (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.put('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { name, location, capacity, resources } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    if (name) room.name = name;
    if (location) room.location = location;
    if (capacity) room.capacity = parseInt(capacity);
    if (resources !== undefined) room.resources = resources;

    await room.save();

    res.json({
      success: true,
      message: 'Room updated successfully.',
      room,
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room.',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/rooms/:id
 * @desc    Delete a room (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Check if room has active bookings
    const activeBookings = await RoomBooking.countDocuments({
      roomId: req.params.id,
      status: 'CONFIRMED',
      endDateTime: { $gte: new Date() },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings.',
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Room deleted successfully.',
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/rooms/availability
 * @desc    Get available rooms for a time slot
 * @access  Public
 */
router.get('/availability', async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.query;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDateTime and endDateTime.',
      });
    }

    const availableRooms = await getAvailableRooms(
      new Date(startDateTime),
      new Date(endDateTime)
    );

    res.json({
      success: true,
      count: availableRooms.length,
      rooms: availableRooms,
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching availability.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/rooms/bookings/my-bookings
 * @desc    Get all bookings for the current user
 * @access  Private (SOCIETY_ADMIN)
 */
router.get('/bookings/my-bookings', authenticate, authorize('SOCIETY_ADMIN'), async (req, res) => {
  try {
    const bookings = await RoomBooking.find({ bookedBy: req.user._id })
      .populate('roomId', 'name location capacity resources')
      .populate('eventId', 'name startDate endDate')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your bookings.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/rooms/bookings/pending
 * @desc    Get all pending room bookings for approval (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.get('/bookings/pending', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const bookings = await RoomBooking.find({ status: 'PENDING_APPROVAL' })
      .populate('roomId', 'name location capacity resources')
      .populate('eventId', 'name startDate endDate description')
      .populate('bookedBy', 'name email society')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending bookings.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/rooms/bookings/:id/approve
 * @desc    Approve a room booking (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.post('/bookings/:id/approve', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const booking = await RoomBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been processed.',
      });
    }

    booking.status = 'CONFIRMED';
    booking.approvedBy = req.user._id;
    booking.approvedAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Room booking approved successfully.',
      booking,
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving booking.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/rooms/bookings/:id/reject
 * @desc    Reject a room booking (SUPER_ADMIN only)
 * @access  Private (SUPER_ADMIN)
 */
router.post('/bookings/:id/reject', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const booking = await RoomBooking.findById(req.params.id).populate('eventId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been processed.',
      });
    }

    booking.status = 'REJECTED';
    booking.rejectedBy = req.user._id;
    booking.rejectedAt = new Date();
    if (remarks) {
      booking.remarks = remarks;
    }
    await booking.save();

    // Clear room info from event
    if (booking.eventId) {
      const event = await Event.findById(booking.eventId);
      if (event) {
        event.roomId = null;
        event.roomName = null;
        await event.save();
      }
    }

    res.json({
      success: true,
      message: 'Room booking rejected successfully.',
      booking,
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting booking.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/events/:id/book-room
 * @desc    Book a room for an event (SOCIETY_ADMIN owner only)
 * @access  Private (SOCIETY_ADMIN)
 */
router.post('/:eventId/book-room', authenticate, authorize('SOCIETY_ADMIN'), async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomId.',
      });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Check ownership
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to book a room for this event.',
      });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Check for room clashes
    const clashes = await checkRoomClashes(
      roomId,
      event.startDateTime,
      event.endDateTime
    );

    if (clashes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected time slot.',
        clashes,
      });
    }

    // Create booking
    const booking = new RoomBooking({
      eventId: event._id,
      roomId,
      bookedBy: req.user._id,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      status: 'PENDING_APPROVAL',
    });

    await booking.save();

    // Update event with room info
    event.roomId = roomId;
    event.roomName = room.name;
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Room booked successfully.',
      booking,
    });
  } catch (error) {
    console.error('Book room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking room.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/events/:id/bookings
 * @desc    Get booking details for an event
 * @access  Public
 */
router.get('/:eventId/bookings', async (req, res) => {
  try {
    const bookings = await RoomBooking.find({ eventId: req.params.eventId })
      .populate('roomId', 'name location capacity')
      .populate('bookedBy', 'name email');

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings.',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel a room booking (SOCIETY_ADMIN owner only)
 * @access  Private (SOCIETY_ADMIN)
 */
router.delete('/bookings/:id', authenticate, authorize('SOCIETY_ADMIN'), async (req, res) => {
  try {
    const booking = await RoomBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Check ownership
    if (booking.bookedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this booking.',
      });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    // Update event to remove room
    const event = await Event.findById(booking.eventId);
    if (event) {
      event.roomId = null;
      event.roomName = null;
      await event.save();
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking.',
      error: error.message,
    });
  }
});

export default router;
