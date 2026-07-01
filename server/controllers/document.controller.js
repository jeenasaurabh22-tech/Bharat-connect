import documentRepository from '../repositories/DocumentRepository.js';
import { addOcrJob } from '../queues/ocr.queue.js';
import ApiError from '../utils/ApiError.js';
import auditLogRepository from '../repositories/AuditLogRepository.js';
import fs from 'fs';
import { isCloudinaryActive } from '../config/storage.js';

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'No document file uploaded'));
    }

    const { documentType } = req.body;
    if (!documentType) {
      // Cleanup uploaded local file if request validation fails
      if (!isCloudinaryActive && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(new ApiError(400, 'Document type is required'));
    }

    const citizenId = req.user._id;
    let fileUrl = req.file.path; // Holds local path or Cloudinary URL
    let publicId = req.file.filename || req.file.public_id || `local-${Date.now()}`;

    // If local storage, build fully qualified URL to access via static server routes
    if (!isCloudinaryActive) {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Check if user already has this type of document active
    let document = await documentRepository.findCitizenDocumentByType(citizenId, documentType);

    if (document) {
      // Document versioning: save old file into versionHistory list
      const oldVersionNumber = document.versionHistory.length > 0 
        ? Math.max(...document.versionHistory.map(v => v.versionNumber)) 
        : 1;

      document.versionHistory.push({
        cloudinaryUrl: document.cloudinaryUrl,
        cloudinaryPublicId: document.cloudinaryPublicId,
        uploadedAt: document.updatedAt || new Date(),
        versionNumber: oldVersionNumber,
      });

      // Update active properties with new upload, resetting OCR properties for the new scan
      document.cloudinaryUrl = fileUrl;
      document.cloudinaryPublicId = publicId;
      document.verifiedStatus = 'Pending';
      document.ocrMetadata = {
        parsedFields: new Map(),
        confidence: 0,
        rawText: '',
        missingInfoDetected: [],
      };

      await document.save();
    } else {
      // Create new document record
      document = await documentRepository.create({
        citizen: citizenId,
        documentType,
        cloudinaryUrl: fileUrl,
        cloudinaryPublicId: publicId,
        verifiedStatus: 'Pending',
        ocrMetadata: {
          parsedFields: new Map(),
          confidence: 0,
          rawText: '',
          missingInfoDetected: [],
        },
      });
    }

    // Queue OCR Process in BullMQ background job
    await addOcrJob({
      documentId: document._id,
      filePath: req.file.path,
      documentType,
    });

    // Log upload audit log
    await auditLogRepository.create({
      action: 'DOCUMENT_UPLOAD',
      actor: citizenId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { documentId: document._id, documentType },
    });

    res.status(202).json({
      message: 'Document uploaded successfully. Processing OCR analysis in background.',
      document,
    });
  } catch (error) {
    // Clean up local temp file on error if disk storage was used
    if (req.file && !isCloudinaryActive && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await documentRepository.findActiveByCitizenId(req.user._id);
    res.status(200).json({ documents });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await documentRepository.findById(id);

    if (!document) {
      return next(new ApiError(404, 'Document not found'));
    }

    // Ensure user owns this document or is an admin
    if (document.citizen.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Unauthorized to delete this document'));
    }

    // Soft-delete: mark active as false
    document.isActive = false;
    await document.save();

    // Log delete audit log
    await auditLogRepository.create({
      action: 'DOCUMENT_DELETE',
      actor: req.user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { documentId: id, documentType: document.documentType },
    });

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Officer/Admin: get ALL citizen documents with citizen info
export const getAllDocuments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { isActive: true };
    if (status) filter.verifiedStatus = status;

    const documents = await documentRepository.find(
      filter,
      'citizen',   // populate citizen name + email
      { createdAt: -1 },
      50
    );
    res.status(200).json({ documents });
  } catch (error) {
    next(error);
  }
};

// Officer/Admin: verify or reject a citizen document
export const verifyDocumentByOfficer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['Verified', 'Failed'].includes(status)) {
      return next(new ApiError(400, 'Status must be Verified or Failed'));
    }

    const document = await documentRepository.findById(id);
    if (!document) return next(new ApiError(404, 'Document not found'));

    document.verifiedStatus = status;
    document.officerNote = note || '';
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    await document.save();

    await auditLogRepository.create({
      action: 'DOCUMENT_VERIFY',
      actor: req.user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { documentId: id, documentType: document.documentType, status, note },
    });

    res.status(200).json({ message: `Document ${status}`, document });
  } catch (error) {
    next(error);
  }
};
