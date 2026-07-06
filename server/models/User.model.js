import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new mongoose.Schema(
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
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['citizen', 'officer', 'admin'],
      default: 'citizen',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profile: {
      age: { type: Number, min: 0 },
      gender: { type: String, enum: ['Male', 'Female', 'Transgender', 'Other', 'Prefer not to say'] },
      annualIncome: { type: Number, min: 0 },
      occupation: { type: String, trim: true },
      education: { type: String, trim: true },
      state: { type: String, trim: true },
      district: { type: String, trim: true },
      category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS'], default: 'General' },
      isDisabled: { type: Boolean, default: false },
      disabilityDetails: { type: String, trim: true },
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model('User', UserSchema);
export default User;