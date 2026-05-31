import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateResultDto {
  @ApiProperty({ description: 'Total questions in test', example: 50 })
  @IsNumber()
  @IsNotEmpty()
  total_questions: number;

  @ApiProperty({ description: 'Correct answers count', example: 42 })
  @IsNumber()
  @IsNotEmpty()
  correct_answers: number;

  @ApiProperty({ description: 'Wrong answers count', example: 8 })
  @IsNumber()
  @IsNotEmpty()
  wrong_answers: number;

  @ApiProperty({ description: 'Test language', example: 'uz', required: false })
  @IsString()
  @IsOptional()
  test_language?: string;

  @ApiProperty({ description: 'Test duration in seconds', example: 1800, required: false })
  @IsNumber()
  @IsOptional()
  test_duration_seconds?: number;

  @ApiProperty({ 
    description: 'Question answers details', 
    example: [
      { question_id: 1, selected_answer: 'A', is_correct: true },
      { question_id: 2, selected_answer: 'B', is_correct: false }
    ],
    required: false 
  })
  @IsArray()
  @IsOptional()
  answers_detail?: any[];
}