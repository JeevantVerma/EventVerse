import Event from '../models/Event.js';
import RoomBooking from '../models/RoomBooking.js';

/**
 * Check for time clashes between events
 * @param {Date} startDateTime - Start time of the new/updated event
 * @param {Date} endDateTime - End time of the new/updated event
 * @param {String} excludeEventId - Event ID to exclude from check (for updates)
 * @returns {Array} - Array of clashing events
 */
export const checkEventTimeClashes = async (startDateTime, endDateTime, excludeEventId = null) => {
  try {
    const query = {
      status: { $in: ['APPROVED', 'PENDING_APPROVAL'] },
      $or: [
        // New event starts during existing event
        {
          startDateTime: { $lte: startDateTime },
          endDateTime: { $gt: startDateTime },
        },
        // New event ends during existing event
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gte: endDateTime },
        },
        // New event completely contains existing event
        {
          startDateTime: { $gte: startDateTime },
          endDateTime: { $lte: endDateTime },
        },
      ],
    };

    if (excludeEventId) {
      query._id = { $ne: excludeEventId };
    }

    const clashingEvents = await Event.find(query).select('title startDateTime endDateTime societyName');
    return clashingEvents;
  } catch (error) {
    console.error('Error checking event time clashes:', error);
    throw error;
  }
};

/**
 * Check for room booking clashes
 * @param {String} roomId - Room ID to check
 * @param {Date} startDateTime - Start time
 * @param {Date} endDateTime - End time
 * @param {String} excludeBookingId - Booking ID to exclude (for updates)
 * @returns {Array} - Array of clashing bookings
 */
export const checkRoomClashes = async (roomId, startDateTime, endDateTime, excludeBookingId = null) => {
  try {
    const query = {
      roomId,
      status: 'CONFIRMED',
      $or: [
        {
          startDateTime: { $lte: startDateTime },
          endDateTime: { $gt: startDateTime },
        },
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gte: endDateTime },
        },
        {
          startDateTime: { $gte: startDateTime },
          endDateTime: { $lte: endDateTime },
        },
      ],
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const clashingBookings = await RoomBooking.find(query).populate('eventId', 'title');
    return clashingBookings;
  } catch (error) {
    console.error('Error checking room clashes:', error);
    throw error;
  }
};

/**
 * Get available rooms for a given time slot
 * @param {Date} startDateTime - Start time
 * @param {Date} endDateTime - End time
 * @returns {Array} - Array of available room IDs
 */
export const getAvailableRooms = async (startDateTime, endDateTime) => {
  try {
    const { default: Room } = await import('../models/Room.js');
    
    // Get all rooms
    const allRooms = await Room.find();

    // Get booked room IDs for the time slot
    const bookedRooms = await RoomBooking.find({
      status: 'CONFIRMED',
      $or: [
        {
          startDateTime: { $lte: startDateTime },
          endDateTime: { $gt: startDateTime },
        },
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gte: endDateTime },
        },
        {
          startDateTime: { $gte: startDateTime },
          endDateTime: { $lte: endDateTime },
        },
      ],
    }).distinct('roomId');

    // Filter out booked rooms
    const availableRooms = allRooms.filter(
      room => !bookedRooms.some(bookedId => bookedId.toString() === room._id.toString())
    );

    return availableRooms;
  } catch (error) {
    console.error('Error getting available rooms:', error);
    throw error;
  }
};
