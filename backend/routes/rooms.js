import express from 'express';
import Room from '../models/Room.js';
import RoomBooking from '../models/RoomBooking.js';
import Event from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { checkRoomClashes, getAvailableRooms } from '../utils/clashDetection.js';

const router = express.Router();

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

router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

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

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to book a room for this event.',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

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

    const booking = new RoomBooking({
      eventId: event._id,
      roomId,
      bookedBy: req.user._id,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      status: 'PENDING_APPROVAL',
    });

    await booking.save();

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

router.delete('/bookings/:id', authenticate, authorize('SOCIETY_ADMIN'), async (req, res) => {
  try {
    const booking = await RoomBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.bookedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this booking.',
      });
    }

    booking.status = 'CANCELLED';
    await booking.save();

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
