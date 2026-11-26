import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';

// The token payload. `sub` is the user id. Tokens signed by the earlier
// NestJS API carry the same fields, so signed-in users stay signed in.
const TokenPayload = z.object({
  sub: z.string(),
  email: z.string(),
  isAdmin: z.boolean(),
});

export const AuthTokenUser = z.object({
  id: z.string(),
  email: z.string(),
  isAdmin: z.boolean(),
});

export type AuthTokenUser = z.infer<typeof AuthTokenUser>;

export function signAuthToken(
  secret: string,
  user: AuthTokenUser,
  expiresIn: SignOptions['expiresIn'],
): string {
  return jwt.sign(
    { sub: user.id, email: user.email, isAdmin: user.isAdmin },
    secret,
    { expiresIn },
  );
}

export function verifyAuthToken(
  secret: string,
  token: string,
): AuthTokenUser | undefined {
  try {
    const payload = TokenPayload.safeParse(jwt.verify(token, secret));

    if (!payload.success) return undefined;

    const { sub, email, isAdmin } = payload.data;

    return { id: sub, email, isAdmin };
  } catch {
    return undefined;
  }
}
