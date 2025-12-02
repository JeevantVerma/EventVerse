import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['STUDENT', 'SOCIETY_ADMIN', 'SUPER_ADMIN'],
      default: 'STUDENT',
    },
    societyName: {
      type: String,
      default: null,
      // Only applicable for SOCIETY_ADMIN role
    },
    favoriteCategories: {
      type: [String],
      default: [],
      // For STUDENT role - used for personalized recommendations
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
      // XP accumulation for STUDENT role
    },
    badges: {
      type: [String],
      default: [],
      // Badge labels like 'Active Participant', 'Event Enthusiast', etc.
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Award XP and update badges
userSchema.methods.awardXP = function (points) {
  this.xp += points;
  
  // Badge milestone logic
  const badges = [];
  if (this.xp >= 50 && !this.badges.includes('Newcomer')) {
    badges.push('Newcomer');
  }
  if (this.xp >= 100 && !this.badges.includes('Active Participant')) {
    badges.push('Active Participant');
  }
  if (this.xp >= 250 && !this.badges.includes('Event Enthusiast')) {
    badges.push('Event Enthusiast');
  }
  if (this.xp >= 500 && !this.badges.includes('Campus Legend')) {
    badges.push('Campus Legend');
  }
  
  // Add new badges
  badges.forEach(badge => {
    if (!this.badges.includes(badge)) {
      this.badges.push(badge);
    }
  });
  
  return this;
};

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Hide sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
