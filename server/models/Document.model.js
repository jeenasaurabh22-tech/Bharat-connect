import mongoose from 'mongoose';
const DocumentSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: [
        'Aadhaar',
        'Aadhaar Card',
        'PAN',
        'PAN Card',
        'Voter ID',
        'Driving Licence',
        'Passport',
        'Income Certificate',
        'Caste Certificate',
        'Domicile',
        'Domicile Certificate',
        'Birth Certificate',
        'Death Certificate',
        'Marriage Certificate',
        'Disability Certificate',
        'Land Holding Documents',
        'Bank Passbook',
        'Ration Card',
        'Education Certificate',
        'Employment Certificate',
        'Address Proof',
        'Age Proof',
        'Project Report',
        'Business Registration',
        'Minority Proof',
        'School Admission Letter',
        'Admission Fee Slip',
        'Artisan Certificate',
        'Other',
      ],
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    verifiedStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Failed', 'Flagged'],
      default: 'Pending',
    },
    ocrMetadata: {
      parsedFields: {
        type: Map,
        of: String,
        default: {},
      },
      confidence: {
        type: Number,
        default: 0,
      },
      rawText: {
        type: String,
        default: '',
      },
      missingInfoDetected: [
        {
          type: String,
        },
      ],
    },
    versionHistory: [
      {
        cloudinaryUrl: { type: String, required: true },
        cloudinaryPublicId: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        versionNumber: { type: Number, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const Document = mongoose.model('Document', DocumentSchema);
export default Document;