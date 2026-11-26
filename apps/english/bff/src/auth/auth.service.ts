import { createHash, randomBytes } from 'node:crypto';
import { type AuthTokenUser, signAuthToken } from '@learn-english/bff';
import {
  type Db,
  passwordResetTokens,
  type User,
  users,
  userStats,
} from '@learn-english/db';
import type { AuthUser } from '@learn-english/english-contract';
import type { Logger } from '@learn-english/logging';
import { TRPCError } from '@trpc/server';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import type { ServerEnv } from '../server-env.js';
import type { EmailService } from './email.service.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

// A valid argon2id hash of no real password. A login with an unknown email
// still pays the full argon2.verify cost, so the timing does not reveal
// whether an email is registered.
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$nLTxinLslvuuggseiIbVdw$jNAObRq+JOTk+paEBRXs11IzPVkpYGKa1W5XDhpNfFQ';

type AuthResult = { user: AuthUser; token: string };

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function toAuthUser(user: User): AuthUser {
  return { id: user.id, email: user.email, isAdmin: user.isAdmin };
}

export class AuthService {
  private readonly db: Db;
  private readonly config: ServerEnv;
  private readonly logger: Logger;
  private readonly emailService: EmailService;

  constructor({
    db,
    config,
    logger,
    emailService,
  }: {
    db: Db;
    config: ServerEnv;
    logger: Logger;
    emailService: EmailService;
  }) {
    this.db = db;
    this.config = config;
    this.logger = logger;
    this.emailService = emailService;
  }

  private signIn(user: User): AuthResult {
    const authUser = toAuthUser(user);
    const tokenUser: AuthTokenUser = authUser;

    return {
      user: authUser,
      token: signAuthToken(
        this.config.JWT_SECRET,
        tokenUser,
        // The env schema checks the `<number><unit>` shape.
        this.config.JWT_EXPIRES_IN as `${number}d`,
      ),
    };
  }

  private async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ? toAuthUser(user) : null;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.findByEmail(email);

    const valid = await argon2.verify(
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      password,
    );

    if (!user || !valid) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password.',
      });
    }

    return this.signIn(user);
  }

  // The user and their stats row are created together, so every other
  // service can assume a stats row exists for a signed-in user.
  async register(email: string, password: string): Promise<AuthResult> {
    if (await this.findByEmail(email)) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `Email '${email}' is already registered.`,
      });
    }

    const passwordHash = await argon2.hash(password);
    const isAdmin = this.config.ADMIN_EMAILS.includes(email.toLowerCase());

    const user = await this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({ email, passwordHash, isAdmin })
        .returning();

      if (!created) throw new Error('The user insert returned no row');

      await tx
        .insert(userStats)
        .values({ userId: created.id })
        .onConflictDoNothing();

      return created;
    });

    return this.signIn(user);
  }

  // Resolves the same way whether or not the email exists, so the caller
  // cannot tell "sent" from "no such account". One live token per user.
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.findByEmail(email);

    if (!user) return;

    const rawToken = randomBytes(32).toString('hex');

    await this.db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    await this.db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${this.config.FRONTEND_URL}/reset-password?token=${rawToken}`;

    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      // A provider failure must not reach the client: it would reveal that
      // the email exists and gives the user nothing to act on.
      this.logger.warn(
        { err: error, 'user.id': user.id },
        'password reset email failed',
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const [record] = await this.db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, hashToken(token)))
      .limit(1);

    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This reset link is invalid or has expired.',
      });
    }

    await this.setPassword(record.userId, newPassword);

    await this.db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, record.userId));
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !(await argon2.verify(user.passwordHash, currentPassword))) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Current password is incorrect.',
      });
    }

    await this.setPassword(userId, newPassword);
  }

  private async setPassword(userId: string, password: string): Promise<void> {
    const passwordHash = await argon2.hash(password);

    await this.db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));
  }
}
