import mongoose from 'mongoose';

const roomBookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDateTime: {
      type: Date,
      required: [true, 'Start date and time is required'],
    },
    endDateTime: {
      type: Date,
      required: [true, 'End date and time is required'],
      validate: {
        validator: function (value) {
          return value > this.startDateTime;
        },
        message: 'End date must be after start date',
      },
    },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'CONFIRMED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING_APPROVAL',
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

roomBookingSchema.index({ roomId: 1, startDateTime: 1, endDateTime: 1, status: 1 });

const RoomBooking = mongoose.model('RoomBooking', roomBookingSchema);

export default RoomBooking;
