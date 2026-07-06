import mongoose from 'mongoose';
const SchemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Scheme title is required'],
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Scheme description is required'],
    },
    benefits: {
      type: String,
      required: [true, 'Benefits description is required'],
    },
    requiredDocuments: [
      {
        type: String,
        trim: true,
      },
    ],
    applicationLink: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    state: {
      type: String,
      default: 'Central',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    ministry: {
      type: String,
      default: 'Government of India',
    },
    tags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    eligibilityRules: {
      maxIncome: { type: Number, default: null },
      minAge: { type: Number, default: null },
      maxAge: { type: Number, default: null },
      genders: [{ type: String, enum: ['Male', 'Female', 'Transgender', 'All'] }],
      categories: [{ type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'All'] }],
      states: [{ type: String }],
      occupations: [{ type: String }],
      educationLevels: [{ type: String }],
      disabilityRequired: { type: Boolean, default: false },
    },
    embedding: {
      type: [Number],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);
SchemeSchema.index(
  { title: 'text', description: 'text', category: 'text', tags: 'text' },
  { weights: { title: 10, category: 5, tags: 3, description: 1 }, name: 'SchemeTextIndex' }
);
const Scheme = mongoose.model('Scheme', SchemeSchema);
export default Scheme;