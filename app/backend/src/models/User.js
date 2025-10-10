import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2, index: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  // Account locking fields
  isLocked: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  // Session management fields
  currentSessionId: { type: String, default: null },
  sessionExpiresAt: { type: Date, default: null },
  lastTokenRefresh: { type: Date, default: null }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
