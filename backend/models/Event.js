import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    societyName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Technical', 'Cultural', 'Sports', 'Literary', 'Workshops', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
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
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'DRAFT',
    },
    approvalRemarks: {
      type: String,
      default: '',
    },
    proposalPdfUrl: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants is required'],
      min: 1,
    },
    registeredParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    prizes: [
      {
        position: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: '',
        },
      },
    ],
    winners: {
      type: Map,
      of: mongoose.Schema.Types.ObjectId,
      default: new Map(),
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    roomName: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ status: 1, startDateTime: 1 });
eventSchema.index({ societyId: 1 });
eventSchema.index({ category: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
