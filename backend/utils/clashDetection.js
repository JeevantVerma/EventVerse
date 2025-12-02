import Event from '../models/Event.js';
import RoomBooking from '../models/RoomBooking.js';

export const checkEventTimeClashes = async (startDateTime, endDateTime, excludeEventId = null) => {
  try {
    const query = {
      status: { $in: ['APPROVED', 'PENDING_APPROVAL'] },
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

export const getAvailableRooms = async (startDateTime, endDateTime) => {
  try {
    const { default: Room } = await import('../models/Room.js');
    
    const allRooms = await Room.find();

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

    const availableRooms = allRooms.filter(
      room => !bookedRooms.some(bookedId => bookedId.toString() === room._id.toString())
    );

    return availableRooms;
  } catch (error) {
    console.error('Error getting available rooms:', error);
    throw error;
  }
};
