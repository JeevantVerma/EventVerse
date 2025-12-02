import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    resources: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
