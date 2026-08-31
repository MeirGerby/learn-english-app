import { Module } from '@nestjs/common';
import { FeedbackRouter } from './feedback.router.js';
import { FeedbackService } from './feedback.service.js';
import { FeedbackRepository } from './feedback.repository.js';

@Module({
  providers: [FeedbackRouter, FeedbackService, FeedbackRepository],
})
export class FeedbackModule {}
