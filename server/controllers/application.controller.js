import applicationRepository from '../repositories/ApplicationRepository.js';
import schemeRepository from '../repositories/SchemeRepository.js';
import documentRepository from '../repositories/DocumentRepository.js';
import notificationService from '../services/notification.service.js';
import auditLogRepository from '../repositories/AuditLogRepository.js';
import ApiError from '../utils/ApiError.js';
export const submitApplication = async (req, res, next) => {
  try {
    const { schemeId } = req.body;
    if (!schemeId) {
      return next(new ApiError(400, 'Scheme ID is required'));
    }
    const citizenId = req.user._id;
    const scheme = await schemeRepository.findById(schemeId);
    if (!scheme) {
      return next(new ApiError(404, 'Scheme not found'));
    }
    const existingApp = await applicationRepository.findOne({
      citizen: citizenId,
      scheme: schemeId,
      status: { $ne: 'Draft' },
    });
    if (existingApp) {
      return next(new ApiError(400, `You have already submitted an application for ${scheme.title}`));
    }
    const citizenDocs = await documentRepository.findActiveByCitizenId(citizenId);
    const uploadedTypes = citizenDocs.map((doc) => doc.documentType);
    const missingDocs = scheme.requiredDocuments.filter(
      (reqDoc) => !uploadedTypes.includes(reqDoc)
    );
    if (missingDocs.length > 0) {
      return next(
        new ApiError(
          400,
          `Cannot apply. Missing required documents: [${missingDocs.join(', ')}]. Please upload them first.`
        )
      );
    }
    const submittedDocuments = scheme.requiredDocuments.map((reqDoc) => {
      const matchedDoc = citizenDocs.find((doc) => doc.documentType === reqDoc);
      return {
        documentRef: matchedDoc._id,
        documentType: reqDoc,
        isVerifiedByOfficer: matchedDoc.verifiedStatus === 'Verified',
      };
    });
    const autoFilledData = new Map();
    autoFilledData.set('name', req.user.name);
    autoFilledData.set('email', req.user.email);
    if (req.user.profile.age) autoFilledData.set('age', req.user.profile.age.toString());
    if (req.user.profile.gender) autoFilledData.set('gender', req.user.profile.gender);
    if (req.user.profile.annualIncome) autoFilledData.set('annualIncome', req.user.profile.annualIncome.toString());
    if (req.user.profile.state) autoFilledData.set('state', req.user.profile.state);
    if (req.user.profile.district) autoFilledData.set('district', req.user.profile.district);
    if (req.user.profile.category) autoFilledData.set('category', req.user.profile.category);
    citizenDocs.forEach((doc) => {
      if (doc.ocrMetadata && doc.ocrMetadata.parsedFields) {
        const fields = doc.ocrMetadata.parsedFields;
        if (fields instanceof Map || typeof fields.forEach === 'function') {
          fields.forEach((val, key) => {
            if (typeof val === 'string') {
              autoFilledData.set(`${doc.documentType.toLowerCase()}:${key}`, val);
            }
          });
        } else {
          for (const [key, value] of Object.entries(fields)) {
            if (typeof value === 'string') {
              autoFilledData.set(`${doc.documentType.toLowerCase()}:${key}`, value);
            }
          }
        }
      }
    });
    const application = await applicationRepository.create({
      citizen: citizenId,
      scheme: schemeId,
      status: 'Submitted',
      statusTimeline: [{ status: 'Submitted', comment: 'Application submitted by citizen' }],
      autoFilledData,
      submittedDocuments,
    });
    await notificationService.sendNotification(
      citizenId,
      'Application Status',
      `Your application for ${scheme.title} has been successfully submitted.`,
      { entityId: application._id, entityModel: 'Application' }
    );
    await auditLogRepository.create({
      action: 'APPLICATION_SUBMIT',
      actor: citizenId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { applicationId: application._id, schemeTitle: scheme.title },
    });
    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await applicationRepository.findByCitizenId(req.user._id);
    res.status(200).json({ applications });
  } catch (error) {
    next(error);
  }
};
export const getApplications = async (req, res, next) => {
  try {
    const { status, schemeId, state, limit = '10', page = '1' } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;
    const filter = {};
    if (status) filter.status = status;
    if (schemeId) filter.scheme = schemeId;
    if (state) {
      const schemesOfState = await schemeRepository.find({ state }, '_id');
      const schemeIds = schemesOfState.map((s) => s._id);
      filter.scheme = { $in: schemeIds };
    }
    const { applications, total } = await applicationRepository.getPaginatedApplications(
      filter,
      'citizen scheme',
      limitNum,
      skipNum
    );
    res.status(200).json({
      applications,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Populate nested citizen and scheme details, as well as documents
    const application = await applicationRepository.findById(id, 'citizen scheme submittedDocuments.documentRef');
    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }
    // Citizen can only view their own applications. Officers/Admins can view any.
    if (
      application.citizen._id.toString() !== req.user._id.toString() &&
      req.user.role === 'citizen'
    ) {
      return next(new ApiError(403, 'Unauthorized to view this application'));
    }
    res.status(200).json({ application });
  } catch (error) {
    next(error);
  }
};
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    if (!status) {
      return next(new ApiError(400, 'Status is required'));
    }
    const application = await applicationRepository.findById(id, 'citizen scheme');
    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }
    application.status = status;
    application.statusTimeline.push({
      status,
      comment: comment || `Status updated to ${status}`,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    });
    if (req.user.role === 'officer') {
      application.reviewedBy = req.user._id;
    }
    await application.save();
    await notificationService.sendNotification(
      application.citizen._id,
      'Application Status',
      `Your application for ${application.scheme.title} has been updated to "${status}".`,
      { entityId: application._id, entityModel: 'Application' }
    );
    await auditLogRepository.create({
      action: 'APPLICATION_STATUS_UPDATE',
      actor: req.user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { applicationId: id, newStatus: status, comment },
    });
    res.status(200).json({
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};