import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, type Database, materials } from '@learn-english/db';
import { DRIZZLE } from '../database/database.module.js';

@Injectable()
export class MaterialsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list() {
    return this.db
      .select({
        id: materials.id,
        filename: materials.filename,
        caption: materials.caption,
        fileSize: materials.fileSize,
        createdAt: materials.createdAt,
      })
      .from(materials)
      .orderBy(desc(materials.createdAt));
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(materials).where(eq(materials.id, id)).limit(1);
    return row ?? null;
  }

  async create(data: { filename: string; caption: string; fileSize: number; fileDataBase64: string }) {
    const [row] = await this.db
      .insert(materials)
      .values(data)
      .returning({
        id: materials.id,
        filename: materials.filename,
        caption: materials.caption,
        fileSize: materials.fileSize,
        createdAt: materials.createdAt,
      });
    return row;
  }

  async remove(id: string) {
    await this.db.delete(materials).where(eq(materials.id, id));
  }
}
