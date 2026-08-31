import { Injectable } from '@nestjs/common';
import { CourseContentRepository } from './course-content.repository.js';
import type { AddCourseItemInput, CourseItemOutput } from './dto/course-content.dto.js';

@Injectable()
export class CourseContentService {
  constructor(private readonly courseContentRepository: CourseContentRepository) {}

  async list(): Promise<CourseItemOutput[]> {
    const rows = await this.courseContentRepository.list();
    return rows.map((row) => ({
      id: row.id,
      type: row.type as CourseItemOutput['type'],
      url: row.url,
      caption: row.caption,
      createdAt: row.createdAt.getTime(),
    }));
  }

  async add(data: AddCourseItemInput): Promise<CourseItemOutput> {
    const row = await this.courseContentRepository.add(data);
    return {
      id: row.id,
      type: row.type as CourseItemOutput['type'],
      url: row.url,
      caption: row.caption,
      createdAt: row.createdAt.getTime(),
    };
  }

  async remove(id: string): Promise<void> {
    await this.courseContentRepository.remove(id);
  }
}
