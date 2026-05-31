import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Test Results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  @ApiOperation({ summary: 'Submit test result' })
  @ApiResponse({ status: 201, description: 'Test result saved successfully' })
  create(@Request() req, @Body() createResultDto: CreateResultDto) {
    return this.resultService.create(req.user.userId, createResultDto);
  }

  @Get('my-results')
  @ApiOperation({ summary: 'Get current user test results' })
  @ApiResponse({ status: 200, description: 'User results retrieved successfully' })
  getMyResults(@Request() req) {
    return this.resultService.findAllByUser(req.user.userId, req.user.userId, req.user.role);
  }

  @Get('my-statistics')
  @ApiOperation({ summary: 'Get current user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  getMyStatistics(@Request() req) {
    return this.resultService.getUserStatistics(req.user.userId, req.user.userId, req.user.role);
  }

  @Get('my-wrong-questions')
  @ApiOperation({ summary: 'Get current user wrong questions analysis' })
  @ApiResponse({ status: 200, description: 'User wrong questions retrieved successfully' })
  getMyWrongQuestions(@Request() req) {
    return this.resultService.getUserWrongQuestions(req.user.userId);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user test results by user ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User results retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getUserResults(@Request() req, @Param('userId') userId: string) {
    return this.resultService.findAllByUser(+userId, req.user.userId, req.user.role);
  }

  @Get('user/:userId/statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user statistics by user ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getUserStatistics(@Request() req, @Param('userId') userId: string) {
    return this.resultService.getUserStatistics(+userId, req.user.userId, req.user.role);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all test results (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 50 })
  @ApiResponse({ status: 200, description: 'All results retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getAllResults(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    return this.resultService.findAllResults(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test result by ID' })
  @ApiResponse({ status: 200, description: 'Test result found' })
  @ApiResponse({ status: 404, description: 'Test result not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only view own results' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.resultService.findOne(+id, req.user.userId, req.user.role);
  }
}