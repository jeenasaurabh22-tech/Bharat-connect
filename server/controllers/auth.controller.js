import { Citizen, Officer, Admin } from '../models/RoleModels.js';
import otpService from '../services/otp.service.js';
import { addEmailJob } from '../queues/email.queue.js';
import ApiError from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import auditLogRepository from '../repositories/AuditLogRepository.js';

// ── Route requests to the correct model based on role ─────────────────────────
const getModelByRole = (role) => {
  if (role === 'citizen') return Citizen;
  if (role === 'officer') return Officer;
  if (role === 'admin')   return Admin;
  return null;
};

// ── Cookie config ─────────────────────────────────────────────────────────────
const getCookieOptions = (expiryDays = 7) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: expiryDays * 24 * 60 * 60 * 1000,
});

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER — saves to correct collection based on role
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, employeeId, department, state } = req.body;

    // Validate role
    const Model = getModelByRole(role);
    if (!Model) {
      return next(new ApiError(400, 'Invalid role. Must be citizen, officer, or admin.'));
    }

    // Check if email already exists in that role's collection
    const existing = await Model.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new ApiError(400, `An ${role} account already exists with this email.`));
    }

    // Build user data (officer gets extra fields)
    const userData = { name, email, password };
    if (role === 'officer') {
      userData.employeeId = employeeId;
      userData.department = department;
      userData.state = state;
    }

    // Create in the correct collection
    const user = await Model.create(userData);

    // Generate & send OTP for email verification
    const otp = otpService.generateOTP();
    await otpService.storeOTP(`${role}:${email}`, otp); // namespace OTP by role
    await addEmailJob({ type: 'verification', email, otp, name, role });

    await auditLogRepository.create({
      action: 'USER_REGISTER',
      actor: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email, role },
    });

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully. Check your email for the OTP.`,
      email: user.email,
      role,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN — checks only the matching role's collection
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const Model = getModelByRole(role);
    if (!Model) {
      return next(new ApiError(400, 'Invalid role selected.'));
    }

    // Fetch from correct collection, explicitly include password
    const user = await Model.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      await auditLogRepository.create({
        action: 'USER_LOGIN_FAILED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { email, role },
      });
      return next(new ApiError(401, `Incorrect email or password for ${role} account.`));
    }

    if (!user.isVerified) {
      return next(new ApiError(403, 'Please verify your email before logging in.'));
    }

    // Issue tokens
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('accessToken',  accessToken,  getCookieOptions(0.01));
    res.cookie('refreshToken', refreshToken, getCookieOptions(7));

    await auditLogRepository.create({
      action: 'USER_LOGIN',
      actor: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { role },
    });

    user.password     = undefined;
    user.refreshToken = undefined;

    res.status(200).json({ message: 'Login successful', accessToken, user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp, role } = req.body;

    const Model = getModelByRole(role);
    if (!Model) return next(new ApiError(400, 'Invalid role.'));

    const isValid = await otpService.verifyOTP(`${role}:${email}`, otp);
    if (!isValid) return next(new ApiError(400, 'Invalid or expired OTP.'));

    const user = await Model.findOne({ email: email.toLowerCase() });
    if (!user) return next(new ApiError(404, 'Account not found.'));

    user.isVerified = true;
    await user.save();

    await auditLogRepository.create({
      action: 'USER_EMAIL_VERIFIED',
      actor: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { role },
    });

    res.status(200).json({ message: 'Email verified. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const Model = getModelByRole(role);

    if (Model) {
      const user = await Model.findOne({ email: email.toLowerCase() });
      if (user) {
        const otp = otpService.generateOTP();
        await otpService.storeOTP(`${role}:reset:${email}`, otp);
        await addEmailJob({ type: 'reset', email, otp, name: user.name, role });
        await auditLogRepository.create({
          action: 'PASSWORD_RESET_REQUESTED',
          actor: user._id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          details: { role },
        });
      }
    }

    // Always 200 to prevent account enumeration
    res.status(200).json({ message: 'If an account exists, a reset OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, role } = req.body;

    const Model = getModelByRole(role);
    if (!Model) return next(new ApiError(400, 'Invalid role.'));

    const isValid = await otpService.verifyOTP(`${role}:reset:${email}`, otp);
    if (!isValid) return next(new ApiError(400, 'Invalid or expired OTP.'));

    const user = await Model.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return next(new ApiError(404, 'Account not found.'));

    user.password     = newPassword;
    user.refreshToken = null;
    await user.save();

    await auditLogRepository.create({
      action: 'PASSWORD_RESET_SUCCESSFUL',
      actor: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { role },
    });

    res.status(200).json({ message: 'Password reset successful. Please log in.' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      const Model = getModelByRole(req.user.role);
      if (Model) {
        await Model.findByIdAndUpdate(req.user._id, { refreshToken: null });
      }
      await auditLogRepository.create({
        action: 'USER_LOGOUT',
        actor: req.user._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────────────────────────────────────
export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) return next(new ApiError(401, 'Refresh token missing.'));

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return next(new ApiError(401, 'Invalid or expired refresh token. Please sign in again.'));
    }

    const Model = getModelByRole(decoded.role);
    if (!Model) return next(new ApiError(401, 'Invalid token payload.'));

    const user = await Model.findOne({ _id: decoded.id, refreshToken }).select('+refreshToken');
    if (!user) return next(new ApiError(401, 'Session expired. Please sign in again.'));

    const newAccessToken = generateAccessToken(user);
    res.cookie('accessToken', newAccessToken, getCookieOptions(0.01));
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ME
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFILE (citizen only — has profile sub-document)
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, profile } = req.body;
    const Model = getModelByRole(req.user.role);
    const user  = await Model.findById(req.user._id);
    if (!user) return next(new ApiError(404, 'Account not found.'));

    if (name) user.name = name;

    if (profile && typeof profile === 'object' && req.user.role === 'citizen') {
      const allowed = [
        'age', 'gender', 'annualIncome', 'occupation',
        'education', 'state', 'district', 'category',
        'isDisabled', 'disabilityDetails',
      ];
      allowed.forEach((f) => {
        if (profile[f] !== undefined) user.profile[f] = profile[f];
      });
    }

    await user.save();

    await auditLogRepository.create({
      action: 'USER_PROFILE_UPDATE',
      actor: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Profile updated.', user });
  } catch (error) {
    next(error);
  }
};
