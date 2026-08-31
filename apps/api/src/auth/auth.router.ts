import { Logger } from '@nestjs/common';
import { Router, Query, Mutation, Input, Ctx } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import {
  AuthService,
  EmailAlreadyTakenError,
  InvalidCredentialsError,
  InvalidResetTokenError,
} from './auth.service.js';
import { requireUser } from '../common/trpc-guards.js';
import type { AppContextValue } from './trpc-context.js';
import {
  loginInputSchema,
  registerInputSchema,
  authOutputSchema,
  authUserOutputSchema,
  requestPasswordResetInputSchema,
  resetPasswordInputSchema,
  changePasswordInputSchema,
  type LoginInput,
  type RegisterInput,
  type RequestPasswordResetInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
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

  // Always returns success, whether or not the email exists - the client
  // shows the same "check your email" message either way (no enumeration).
  @Mutation({
    input: requestPasswordResetInputSchema,
  })
  async requestPasswordReset(@Input() data: RequestPasswordResetInput) {
    try {
      await this.authService.requestPasswordReset(data.email);
    } catch (error) {
      this.logger.error('Failed to process password reset request', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing the request.',
        cause: error,
      });
    }
    return { success: true };
  }

  @Mutation({
    input: resetPasswordInputSchema,
  })
  async resetPassword(@Input() data: ResetPasswordInput) {
    try {
      await this.authService.resetPassword(data.token, data.newPassword);
      return { success: true };
    } catch (error) {
      if (error instanceof InvalidResetTokenError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }

      this.logger.error('Failed to reset password', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while resetting the password.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: changePasswordInputSchema,
  })
  async changePassword(@Input() data: ChangePasswordInput, @Ctx() ctx: AppContextValue) {
    const user = requireUser(ctx);
    try {
      await this.authService.changePassword(user.id, data.currentPassword, data.newPassword);
      return { success: true };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect.',
        });
      }

      this.logger.error('Failed to change password', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while changing the password.',
        cause: error,
      });
    }
  }
}
