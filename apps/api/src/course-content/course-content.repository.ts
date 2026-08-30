import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, type Database, courseItems } from '@learn-english/db';
import { DRIZZLE } from '../database/database.module.js';

@Injectable()
export class CourseContentRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list() {
    return this.db
      .select()
      .from(courseItems)
      .orderBy(desc(courseItems.createdAt));
  }

  async add(data: { type: string; url: string; caption: string }) {
    const [row] = await this.db.insert(courseItems).values(data).returning();
    return row;
  }

  async remove(id: string) {
    await this.db.delete(courseItems).where(eq(courseItems.id, id));
  }
}
