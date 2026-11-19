import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import firebaseConfig from '../../firebase-applet-config.json';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name: string;
  role: 'customer' | 'provider' | 'admin';
  city?: string;
  tier?: string;
  avatarUrl?: string;
  authType: 'firebase' | 'persona';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

const getSigningSecret = () =>
  process.env.SESSION_SECRET ||
  `${firebaseConfig.projectId}:${firebaseConfig.appId}:samay-workspace`;

export interface PersonaTokenPayload {
  uid: string;
  email: string;
  name: string;
  role: 'customer' | 'provider' | 'admin';
  city: string;
  tier: string;
  avatarUrl: string;
  exp: number;
}

export function signPersonaToken(payload: PersonaTokenPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `samay_persona.${encoded}.${sig}`;
}

export function verifyPersonaToken(token: string): PersonaTokenPayload | null {
  if (!token.startsWith('samay_persona.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [, encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as PersonaTokenPayload;
    if (parsed.exp && Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  const personaPayload = verifyPersonaToken(token);
  if (personaPayload) {
    req.user = {
      uid: personaPayload.uid,
      email: personaPayload.email,
      name: personaPayload.name,
      role: personaPayload.role,
      city: personaPayload.city,
      tier: personaPayload.tier,
      avatarUrl: personaPayload.avatarUrl,
      authType: 'persona',
    };
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || 'member@aurevia.in',
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Executive Member',
      role: 'customer',
      tier: 'Executive Tier',
      city: 'Bengaluru',
      avatarUrl: decodedToken.picture,
      authType: 'firebase',
    };
    return next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
