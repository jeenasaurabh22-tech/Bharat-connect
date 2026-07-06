import jwt from 'jsonwebtoken';
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    }
  );
};
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    }
  );
};
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};