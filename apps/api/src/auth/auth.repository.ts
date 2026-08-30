import { Inject, Injectable } from '@nestjs/common';
import { eq, type Database, users, userStats } from '@learn-english/db';
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
}
