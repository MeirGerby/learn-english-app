import { Injectable } from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository.js';
import type { CreateFeedbackInput, FeedbackOutput } from './dto/feedback.dto.js';

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}

  async list(): Promise<FeedbackOutput[]> {
    const rows = await this.feedbackRepository.list();
    return rows.map((row) => ({
      id: row.id,
      text: row.text,
      authorEmail: row.authorEmail,
      createdAt: row.createdAt.getTime(),
    }));
  }

  async create(authorId: string, data: CreateFeedbackInput): Promise<void> {
    await this.feedbackRepository.create({ text: data.text, authorId });
  }

  async remove(id: string): Promise<void> {
    await this.feedbackRepository.remove(id);
  }
}
