import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const generateToken = (payload: object) => {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
};