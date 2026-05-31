import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResult } from '../entities/user-result.entity';
import { CreateResultDto } from './dto/create-result.dto';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(UserResult)
    private resultRepository: Repository<UserResult>,
  ) {}

  async create(userId: number, createResultDto: CreateResultDto): Promise<UserResult> {
    // Foizni hisoblash
    const scorePercentage = (createResultDto.correct_answers / createResultDto.total_questions) * 100;

    const result = this.resultRepository.create({
      user_id: userId,
      ...createResultDto,
      score_percentage: Number(scorePercentage.toFixed(2)),
    });

    return await this.resultRepository.save(result);
  }

  async findAllByUser(userId: number, requestingUserId: number, requestingUserRole: UserRole): Promise<UserResult[]> {
    // Faqat o'z natijalarini ko'rishi yoki admin bo'lishi kerak
    if (userId !== requestingUserId && requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Faqat o\'z natijalaringizni ko\'rishingiz mumkin');
    }

    return await this.resultRepository.find({
      where: { user_id: userId },
      relations: ['user'],
      order: { completed_at: 'DESC' }
    });
  }

  async findAllResults(page: number = 1, limit: number = 50): Promise<{ results: UserResult[], total: number }> {
    const [results, total] = await this.resultRepository.findAndCount({
      relations: ['user'],
      order: { completed_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { results, total };
  }

  async findOne(id: number, requestingUserId: number, requestingUserRole: UserRole): Promise<UserResult> {
    const result = await this.resultRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!result) {
      throw new NotFoundException('Natija topilmadi');
    }

    // Faqat o'z natijasini ko'rishi yoki admin bo'lishi kerak
    if (result.user_id !== requestingUserId && requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Faqat o\'z natijalaringizni ko\'rishingiz mumkin');
    }

    return result;
  }

  async getUserStatistics(userId: number, requestingUserId: number, requestingUserRole: UserRole) {
    // Faqat o'z statistikasini ko'rishi yoki admin bo'lishi kerak
    if (userId !== requestingUserId && requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Faqat o\'z statistikangizni ko\'rishingiz mumkin');
    }

    const results = await this.resultRepository.find({
      where: { user_id: userId },
      order: { completed_at: 'DESC' }
    });

    if (results.length === 0) {
      return {
        total_tests: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        total_questions_answered: 0,
        total_correct_answers: 0
      };
    }

    const totalTests = results.length;
    const averageScore = results.reduce((sum, result) => sum + result.score_percentage, 0) / totalTests;
    const highestScore = Math.max(...results.map(r => r.score_percentage));
    const lowestScore = Math.min(...results.map(r => r.score_percentage));
    const totalQuestionsAnswered = results.reduce((sum, result) => sum + result.total_questions, 0);
    const totalCorrectAnswers = results.reduce((sum, result) => sum + result.correct_answers, 0);

    return {
      total_tests: totalTests,
      average_score: Number(averageScore.toFixed(2)),
      highest_score: highestScore,
      lowest_score: lowestScore,
      total_questions_answered: totalQuestionsAnswered,
      total_correct_answers: totalCorrectAnswers
    };
  }

  async getUserWrongQuestions(userId: number) {
    const results = await this.resultRepository.find({
      where: { user_id: userId }
    });

    // Xato javoblarni yig'ish
    const wrongQuestions = new Map();

    for (const result of results) {
      if (result.answers_detail && Array.isArray(result.answers_detail)) {
        for (const answer of result.answers_detail) {
          if (!answer.is_correct) {
            const questionId = answer.question_id;
            if (wrongQuestions.has(questionId)) {
              wrongQuestions.get(questionId).wrong_count++;
              wrongQuestions.get(questionId).total_attempts++;
              wrongQuestions.get(questionId).last_wrong_answer = answer.selected_option;
            } else {
              wrongQuestions.set(questionId, {
                question_id: questionId,
                wrong_count: 1,
                total_attempts: 1,
                last_wrong_answer: answer.selected_option,
                correct_answer: answer.correct_option || null
              });
            }
          } else {
            // To'g'ri javob ham total_attempts ga qo'shiladi
            const questionId = answer.question_id;
            if (wrongQuestions.has(questionId)) {
              wrongQuestions.get(questionId).total_attempts++;
            }
          }
        }
      }
    }

    // Question ma'lumotlarini olish
    const questionIds = Array.from(wrongQuestions.keys());
    if (questionIds.length === 0) {
      return [];
    }

    const questions = await this.resultRepository.manager.query(`
      SELECT id, question FROM questions WHERE id = ANY($1)
    `, [questionIds]);

    // Natijani shakllantirish
    const result = [];
    for (const question of questions) {
      const stats = wrongQuestions.get(question.id);
      if (stats) {
        result.push({
          question_id: question.id,
          question_text: question.question,
          wrong_count: stats.wrong_count,
          total_attempts: stats.total_attempts,
          error_percentage: (stats.wrong_count / stats.total_attempts) * 100,
          last_wrong_answer: stats.last_wrong_answer,
          correct_answer: stats.correct_answer
        });
      }
    }

    // Xato foiziga ko'ra tartiblash
    return result.sort((a, b) => b.error_percentage - a.error_percentage);
  }
}