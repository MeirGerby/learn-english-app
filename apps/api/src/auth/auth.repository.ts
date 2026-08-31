import { Inject, Injectable } from '@nestjs/common';
import { eq, type Database, users, userStats, passwordResetTokens } from '@learn-english/db';
import { DRIZZLE } from '../database/database.module.js';

@Injectable()
export class AuthRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  // Creates the user and its (always-present-from-now-on) user_stats row
  // together, so every other module can assume a stats row exists for any
  // authenticated user without a separate "does it exist yet" check.
  async create(
    data: { email: string; passwordHash: string; isAdmin: boolean },
    handlers: { onEmailTaken: () => never },
  ) {
    const existing = await this.findByEmail(data.email);

    if (existing) {
      handlers.onEmailTaken();
    }

    return this.db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(data).returning();
      await tx
        .insert(userStats)
        .values({ userId: user.id })
        .onConflictDoNothing();
      return user;
    });
  }

  async updatePasswordHash(userId: string, passwordHash: string) {
    await this.db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  }

  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    const [row] = await this.db
      .insert(passwordResetTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();
    return row;
  }

  async findValidResetToken(tokenHash: string) {
    const [row] = await this.db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);
    return row ?? null;
  }

  async deleteAllResetTokensForUser(userId: string) {
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }
}
