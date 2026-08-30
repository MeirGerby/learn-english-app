import { Logger } from '@nestjs/common';
import { Router, Query, Mutation, Input, Ctx } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import {
  AuthService,
  EmailAlreadyTakenError,
  InvalidCredentialsError,
} from './auth.service.js';
import { requireUser } from '../common/trpc-guards.js';
import type { AppContextValue } from './trpc-context.js';
import {
  loginInputSchema,
  registerInputSchema,
  authOutputSchema,
  authUserOutputSchema,
  type LoginInput,
  type RegisterInput,
} from './dto/auth.dto.js';

@Router({ alias: 'auth' })
export class AuthRouter {
  private readonly logger = new Logger(AuthRouter.name);

  constructor(private readonly authService: AuthService) {}

  @Mutation({
    input: registerInputSchema,
    output: authOutputSchema,
  })
  async register(@Input() data: RegisterInput) {
    try {
      return await this.authService.register(data);
    } catch (error) {
      if (error instanceof EmailAlreadyTakenError) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: error.message,
        });
      }

      this.logger.error('Failed to register', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while registering.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: loginInputSchema,
    output: authOutputSchema,
  })
  async login(@Input() data: LoginInput) {
    try {
      return await this.authService.login(data);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message,
        });
      }

      this.logger.error('Failed to log in', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while logging in.',
        cause: error,
      });
    }
  }

  @Query({
    output: authUserOutputSchema,
  })
  me(@Ctx() ctx: AppContextValue) {
    return requireUser(ctx);
  }
}
