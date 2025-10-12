import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';
import { Category } from '../entities/category.entity';
import { Template } from '../entities/template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer, Category, Template])],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
