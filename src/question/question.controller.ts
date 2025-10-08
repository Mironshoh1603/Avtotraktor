import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Question } from 'src/entities/question.entity';
import { LangEnum } from 'src/entities/lang.enum';
import { UpdateQuestionDto } from './dto/update-question.dto';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create questions' })
  @ApiResponse({ status: 201, description: 'Questions successfully created' })
  @ApiBody({
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/CreateQuestionDto' },
    },
  })
  async createBulk(@Body() questions: CreateQuestionDto[]) {
    return this.questionService.createBulk(questions);
  }

  @Get()
  @ApiOperation({ summary: 'Get all questions with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    type: String,
    example: 'uz',
    description: 'Filter questions by language',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated questions',
    type: [Question],
  })
  async getAllQuestions(
    @Query('page') page: number = 1,
    @Query('lang') lang?: LangEnum,
  ) {
    return this.questionService.getAllQuestions(page, lang);
  }

  @Get('random')
  @ApiOperation({ summary: 'Get 50 random questions' })
  @ApiQuery({
    name: 'lang',
    required: false,
    type: String,
    enum: LangEnum,
    example: 'uz',
    description: 'Filter questions by language',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns 50 random questions',
    type: [Question],
  })
  async getRandomQuestions( @Query('lang') lang: LangEnum=LangEnum.UZ) {
    return this.questionService.getRandomQuestions(lang);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one question by ID' })
  async findOne(@Param('id') id: number) {
    return this.questionService.findOne(id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a question' })
  @ApiResponse({
    status: 200,
    description: 'Question updated successfully',
    type: Question,
  })
  async update(
    @Param('id') id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Patch(':id/correct-option')
  @ApiOperation({ summary: 'Update correct option' })
  @ApiResponse({
    status: 200,
    description: 'Correct option updated',
    type: Question,
  })
  async updateCorrectOption(
    @Param('id') id: number,
    @Body('correct_option') correct_option: string,
  ): Promise<Question> {
    return this.questionService.updateCorrectOption(id, correct_option);
  }

  @Patch(':id/image-path')
  @ApiOperation({ summary: 'Update question image path' })
  @ApiResponse({
    status: 200,
    description: 'Image path updated',
    type: Question,
  })
  async updateImagePath(
    @Param('id') id: number,
    @Body('image_path') image_path: string,
  ): Promise<Question> {
    return this.questionService.updateImagePath(id, image_path);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question' })
  async remove(@Param('id') id: number) {
    return this.questionService.remove(id);
  }

  @Post('import')
  async importQuestions(): Promise<string> {
    await this.questionService.importQuestionsFromJson(
      './src/data/questions.json',
    );
    return 'Savollar muvaffaqiyatli yuklandi!';
  }
}
