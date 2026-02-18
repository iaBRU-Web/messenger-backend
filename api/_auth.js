// api/_auth.js — JWT helpers
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'brumessenger-secret-2026';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromReq(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export function requireAuth(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  return verifyToken(token);
}
