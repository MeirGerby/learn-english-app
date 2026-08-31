import { Module } from '@nestjs/common';
import { CourseContentRouter } from './course-content.router.js';
import { CourseContentService } from './course-content.service.js';
import { CourseContentRepository } from './course-content.repository.js';

@Module({
  providers: [CourseContentRouter, CourseContentService, CourseContentRepository],
})
export class CourseContentModule {}
