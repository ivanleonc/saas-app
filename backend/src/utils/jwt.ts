import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const generateToken = (payload: object) => {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
};

export const generateResetToken = (userId: number, passwordHash: string) => {
  // Generamos una key secreta combinada. Si la clave del usuario cambia, este token se invalida automáticamente.
  const tempSecret = SECRET + passwordHash;
  return jwt.sign({ id: userId }, tempSecret, { expiresIn: '15m' });
};

export const verifyResetToken = (token: string, passwordHash: string) => {
  try {
    const tempSecret = SECRET + passwordHash;
    return jwt.verify(token, tempSecret) as { id: number };
  } catch (error) {
    return null;
  }
};