import {
  AuthOutput,
  AuthUser,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  SuccessOutput,
} from '@learn-english/english-contract';
import { authedProcedure, publicProcedure, router } from '../trpc.js';

export const authRouter = router({
  register: publicProcedure
    .input(RegisterInput)
    .output(AuthOutput)
    .mutation(({ input, ctx }) =>
      ctx.cradle.authService.register(input.email, input.password),
    ),

  login: publicProcedure
    .input(LoginInput)
    .output(AuthOutput)
    .mutation(({ input, ctx }) =>
      ctx.cradle.authService.login(input.email, input.password),
    ),

  // Null when the token is valid but the user was deleted since.
  me: authedProcedure
    .output(AuthUser.nullable())
    .query(({ ctx }) => ctx.cradle.authService.findById(ctx.user.id)),

  // Succeeds whether or not the email exists (no account enumeration).
  requestPasswordReset: publicProcedure
    .input(RequestPasswordResetInput)
    .output(SuccessOutput)
    .mutation(async ({ input, ctx }) => {
      await ctx.cradle.authService.requestPasswordReset(input.email);

      return { success: true as const };
    }),

  resetPassword: publicProcedure
    .input(ResetPasswordInput)
    .output(SuccessOutput)
    .mutation(async ({ input, ctx }) => {
      await ctx.cradle.authService.resetPassword(
        input.token,
        input.newPassword,
      );

      return { success: true as const };
    }),

  changePassword: authedProcedure
    .input(ChangePasswordInput)
    .output(SuccessOutput)
    .mutation(async ({ input, ctx }) => {
      await ctx.cradle.authService.changePassword(
        ctx.user.id,
        input.currentPassword,
        input.newPassword,
      );

      return { success: true as const };
    }),
});
