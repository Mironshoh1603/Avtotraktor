import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResult } from '../entities/user-result.entity';
import { Question } from '../entities/question.entity';

export interface WrongQuestionAnalytics {
  question_id: number;
  question_text: string;
  wrong_count: number;
  total_attempts: number;
  error_percentage: number;
  category_name?: string;
  language: string;
}

export interface GeneralAnalytics {
  total_users: number;
  total_tests_taken: number;
  average_score: number;
  most_popular_language: string;
  total_questions: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserResult)
    private userResultRepository: Repository<UserResult>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async getMostWrongQuestions(limit: number = 20): Promise<WrongQuestionAnalytics[]> {
    // UserResult entities dan answers_detail ma'lumotlarini olish
    const results = await this.userResultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.user', 'user')
      .where('result.answers_detail IS NOT NULL')
      .getMany();

    // Har bir savol uchun xato statistikasini hisoblash
    const questionStats = new Map<number, {
      wrong_count: number;
      total_attempts: number;
      question_data?: any;
    }>();

    // Barcha natijalarni ko'rib chiqish
    for (const result of results) {
      if (result.answers_detail && Array.isArray(result.answers_detail)) {
        for (const answer of result.answers_detail) {
          if (answer.question_id) {
            const questionId = answer.question_id;
            const isCorrect = answer.is_correct === true;
            
            if (!questionStats.has(questionId)) {
              questionStats.set(questionId, {
                wrong_count: 0,
                total_attempts: 0
              });
            }
            
            const stats = questionStats.get(questionId)!;
            stats.total_attempts++;
            if (!isCorrect) {
              stats.wrong_count++;
            }
          }
        }
      }
    }

    // Savollarning batafsil ma'lumotlarini olish
    const questionIds = Array.from(questionStats.keys());
    
    // Agar user_results ma'lumotlari yo'q bo'lsa, bo'sh array qaytarish
    if (questionIds.length === 0) {
      return [];
    }
    
    const questions = await this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .where('question.id IN (:...ids)', { ids: questionIds })
      .getMany();

    // Natijalarni shakllantirish
    const wrongQuestions: WrongQuestionAnalytics[] = [];
    
    for (const question of questions) {
      const stats = questionStats.get(question.id);
      if (stats && stats.total_attempts > 0) {
        const errorPercentage = (stats.wrong_count / stats.total_attempts) * 100;
        
        wrongQuestions.push({
          question_id: question.id,
          question_text: question.question,
          wrong_count: stats.wrong_count,
          total_attempts: stats.total_attempts,
          error_percentage: Number(errorPercentage.toFixed(2)),
          category_name: question.category?.name || 'Kategoriyasiz',
          language: question.lang
        });
      }
    }

    // Xato foizi bo'yicha saralash va limit qo'yish
    return wrongQuestions
      .sort((a, b) => b.error_percentage - a.error_percentage)
      .slice(0, limit);
  }

  async getGeneralAnalytics(): Promise<GeneralAnalytics> {
    // Umumiy statistikalarni olish
    const totalUsers = await this.userResultRepository
      .createQueryBuilder('result')
      .select('COUNT(DISTINCT result.user_id)', 'count')
      .getRawOne();

    const totalTests = await this.userResultRepository.count();

    const avgScore = await this.userResultRepository
      .createQueryBuilder('result')
      .select('AVG(result.score_percentage)', 'avg')
      .getRawOne();

    const mostPopularLang = await this.userResultRepository
      .createQueryBuilder('result')
      .select('result.test_language', 'language')
      .addSelect('COUNT(*)', 'count')
      .where('result.test_language IS NOT NULL')
      .groupBy('result.test_language')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    const totalQuestions = await this.questionRepository.count();

    return {
      total_users: parseInt(totalUsers?.count || '0'),
      total_tests_taken: totalTests,
      average_score: Number(avgScore?.avg || 0).toFixed(2) as any,
      most_popular_language: mostPopularLang?.language || 'uz',
      total_questions: totalQuestions
    };
  }

  async getQuestionAnalyticsByCategory(categoryId?: number) {
    let query = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category');

    if (categoryId) {
      query = query.where('question.category_id = :categoryId', { categoryId });
    }

    const questions = await query.getMany();
    
    // Her bir savol uchun xato statistikasi
    const results = await this.userResultRepository
      .createQueryBuilder('result')
      .where('result.answers_detail IS NOT NULL')
      .getMany();

    const categoryStats = new Map();

    for (const result of results) {
      if (result.answers_detail && Array.isArray(result.answers_detail)) {
        for (const answer of result.answers_detail) {
          const question = questions.find(q => q.id === answer.question_id);
          if (question) {
            const categoryName = question.category?.name || 'Kategoriyasiz';
            
            if (!categoryStats.has(categoryName)) {
              categoryStats.set(categoryName, {
                total_attempts: 0,
                wrong_count: 0,
                questions_count: 0
              });
            }
            
            const stats = categoryStats.get(categoryName);
            stats.total_attempts++;
            if (!answer.is_correct) {
              stats.wrong_count++;
            }
          }
        }
      }
    }

    // Kategoriya bo'yicha savollar sonini hisoblash
    const categoryCounts = questions.reduce((acc, question) => {
      const categoryName = question.category?.name || 'Kategoriyasiz';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    const result = Array.from(categoryStats.entries()).map(([categoryName, stats]) => ({
      category_name: categoryName,
      questions_count: categoryCounts[categoryName] || 0,
      total_attempts: stats.total_attempts,
      wrong_count: stats.wrong_count,
      error_percentage: stats.total_attempts > 0 
        ? Number(((stats.wrong_count / stats.total_attempts) * 100).toFixed(2))
        : 0
    }));

    return result.sort((a, b) => b.error_percentage - a.error_percentage);
  }
}