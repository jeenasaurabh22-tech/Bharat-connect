import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const addPasswordHooks = (schema) => {
  schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  schema.methods.comparePassword = async function (entered) {
    return bcrypt.compare(entered, this.password);
  };
};
const CitizenSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role:     { type: String, default: 'citizen', immutable: true },
    isVerified: { type: Boolean, default: false },
    otp:        { type: String, select: false },
    otpExpiry:  { type: Date,   select: false },
    profile: {
      age:              { type: Number, min: 0 },
      gender:           { type: String, enum: ['Male', 'Female', 'Transgender', 'Other', 'Prefer not to say'] },
      annualIncome:     { type: Number, min: 0 },
      occupation:       { type: String, trim: true },
      education:        { type: String, trim: true },
      state:            { type: String, trim: true },
      district:         { type: String, trim: true },
      category:         { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS'], default: 'General' },
      isDisabled:       { type: Boolean, default: false },
      disabilityDetails:{ type: String, trim: true },
    },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);
addPasswordHooks(CitizenSchema);
export const Citizen = mongoose.model('Citizen', CitizenSchema, 'citizens');
const OfficerSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, required: true, minlength: 6, select: false },
    role:       { type: String, default: 'officer', immutable: true },
    employeeId: { type: String, trim: true },
    department: { type: String, trim: true },
    state:      { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    otp:        { type: String, select: false },
    otpExpiry:  { type: Date,   select: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);
addPasswordHooks(OfficerSchema);
export const Officer = mongoose.model('Officer', OfficerSchema, 'officers');
const AdminSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 6, select: false },
    role:      { type: String, default: 'admin', immutable: true },
    isVerified:{ type: Boolean, default: false },
    otp:       { type: String, select: false },
    otpExpiry: { type: Date,   select: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);
addPasswordHooks(AdminSchema);
export const Admin = mongoose.model('Admin', AdminSchema, 'admins');