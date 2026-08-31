import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TRPCContext } from 'nestjs-trpc';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
}

export interface AppContextValue extends Record<string, unknown> {
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  user: { id: string; email: string; isAdmin: boolean } | null;
}

@Injectable()
export class AppContext implements TRPCContext {
  constructor(private readonly jwtService: JwtService) {}

  create(opts: CreateExpressContextOptions): AppContextValue {
    const authHeader = opts.req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let user: AppContextValue['user'] = null;
    if (token) {
      try {
        const payload = this.jwtService.verify<JwtPayload>(token);
        user = { id: payload.sub, email: payload.email, isAdmin: payload.isAdmin };
      } catch {
        user = null;
      }
    }

    return { req: opts.req, res: opts.res, user };
  }
}
