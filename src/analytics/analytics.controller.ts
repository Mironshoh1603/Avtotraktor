import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('wrong-questions')
  @ApiOperation({ summary: 'Get most wrong answered questions (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of questions to return', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of questions with highest error rates',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question_id: { type: 'number' },
          question_text: { type: 'string' },
          wrong_count: { type: 'number' },
          total_attempts: { type: 'number' },
          error_percentage: { type: 'number' },
          category_name: { type: 'string' },
          language: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getMostWrongQuestions(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.analyticsService.getMostWrongQuestions(limitNum);
  }

  @Get('general')
  @ApiOperation({ summary: 'Get general platform analytics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'General platform statistics',
    schema: {
      type: 'object',
      properties: {
        total_users: { type: 'number' },
        total_tests_taken: { type: 'number' },
        average_score: { type: 'number' },
        most_popular_language: { type: 'string' },
        total_questions: { type: 'number' }
      }
    }
  })
  async getGeneralAnalytics() {
    return this.analyticsService.getGeneralAnalytics();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get analytics by category (Admin only)' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'Filter by specific category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category-wise analytics',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category_name: { type: 'string' },
          questions_count: { type: 'number' },
          total_attempts: { type: 'number' },
          wrong_count: { type: 'number' },
          error_percentage: { type: 'number' }
        }
      }
    }
  })
  async getCategoryAnalytics(@Query('categoryId') categoryId?: string) {
    const categoryIdNum = categoryId ? parseInt(categoryId) : undefined;
    return this.analyticsService.getQuestionAnalyticsByCategory(categoryIdNum);
  }
}