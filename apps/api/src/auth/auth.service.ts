import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'node:crypto';
import { AuthRepository } from './auth.repository.js';
import { EmailService } from './email.service.js';
import type { LoginInput, RegisterInput, AuthUserOutput } from './dto/auth.dto.js';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyTakenError extends Error {
  constructor(public readonly email: string) {
    super(`Email '${email}' is already registered.`);
    this.name = 'EmailAlreadyTakenError';
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super('This reset link is invalid or has expired.');
    this.name = 'InvalidResetTokenError';
  }
}

export class UserNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`User '${userId}' was not found.`);
    this.name = 'UserNotFoundError';
  }
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// A valid argon2id hash that doesn't correspond to any real password - used
// so that logging in with an unknown email still pays the same argon2.verify
// cost as a real user, rather than short-circuiting and leaking via timing
// whether an email is registered.
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$nLTxinLslvuuggseiIbVdw$jNAObRq+JOTk+paEBRXs11IzPVkpYGKa1W5XDhpNfFQ';

export interface AuthResult {
  user: AuthUserOutput;
  token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private isAdminEmail(email: string): boolean {
    const admins = (this.configService.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return admins.includes(email.toLowerCase());
  }

  private sign(user: AuthUserOutput): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await this.authRepository.findByEmail(data.email);

    const passwordValid = await argon2.verify(
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      data.password,
    );

    if (!user || !passwordValid) {
      throw new InvalidCredentialsError();
    }

    const authUser: AuthUserOutput = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return { user: authUser, token: this.sign(authUser) };
  }

  async register(data: RegisterInput): Promise<AuthResult> {
    const passwordHash = await argon2.hash(data.password);
    const isAdmin = this.isAdminEmail(data.email);

    const user = await this.authRepository.create(
      { email: data.email, passwordHash, isAdmin },
      {
        onEmailTaken: () => {
          throw new EmailAlreadyTakenError(data.email);
        },
      },
    );

    const authUser: AuthUserOutput = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return { user: authUser, token: this.sign(authUser) };
  }

  // Always resolves successfully regardless of whether the email exists -
  // callers must never be able to distinguish "sent" from "no such
  // account" (email enumeration). Only one live token per user at a time.
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) return;

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.authRepository.deleteAllResetTokensForUser(user.id);
    await this.authRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173/learn-english-app';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      // Already logged inside EmailService - a transient email-provider
      // failure must not surface to the client (it would both leak that
      // the email exists and give the user nothing actionable to do).
      this.logger.warn(`Password reset email failed to send for user ${user.id}`, err);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const record = await this.authRepository.findValidResetToken(tokenHash);
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new InvalidResetTokenError();
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.authRepository.updatePasswordHash(record.userId, passwordHash);
    await this.authRepository.deleteAllResetTokensForUser(record.userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const passwordValid = await argon2.verify(user.passwordHash, currentPassword);
    if (!passwordValid) {
      throw new InvalidCredentialsError();
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.authRepository.updatePasswordHash(userId, passwordHash);
  }
}
