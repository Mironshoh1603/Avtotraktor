import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserResult } from '../entities/user-result.entity';
import { Question } from '../entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserResult, Question]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}