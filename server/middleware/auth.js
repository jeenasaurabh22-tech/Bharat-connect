import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { Citizen, Officer, Admin } from '../models/RoleModels.js';
const getModelByRole = (role) => {
  if (role === 'citizen') return Citizen;
  if (role === 'officer') return Officer;
  if (role === 'admin')   return Admin;
  return null;
};
export const protect = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return next(new ApiError(401, 'Please log in to access this resource.'));
    }
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next(new ApiError(401, 'Invalid or expired access token. Please log in again.'));
    }
    const Model = getModelByRole(decoded.role);
    if (!Model) {
      return next(new ApiError(401, 'Invalid token payload.'));
    }
    const currentUser = await Model.findById(decoded.id);
    if (!currentUser) {
      return next(new ApiError(401, 'Account no longer exists.'));
    }
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
};