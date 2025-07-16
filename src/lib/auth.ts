// src/lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface UserPayload {
  userId: number;
  iat: number;
  exp: number;
}

export function getUserIdFromToken(req: NextRequest): number | null {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}