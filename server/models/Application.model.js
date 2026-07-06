import mongoose from 'mongoose';
const ApplicationSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      required: true,
      index: true,
    },
    scheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Action Required', 'Approved', 'Rejected'],
      default: 'Submitted',
      index: true,
    },
    statusTimeline: [
      {
        status: { type: String, required: true },
        comment: { type: String, trim: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    autoFilledData: {
      type: Map,
      of: String,
      default: {},
    },
    submittedDocuments: [
      {
        documentRef: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Document',
          required: true,
        },
        documentType: { type: String, required: true },
        isVerifiedByOfficer: { type: Boolean, default: false },
      },
    ],
    officerRemarks: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Officer',
    },
  },
  {
    timestamps: true,
  }
);
ApplicationSchema.index({ citizen: 1, scheme: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'Draft' } } });
const Application = mongoose.model('Application', ApplicationSchema);
export default Application;