import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from "@nestjs/common";
import { QuestionService } from "./question.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { Question } from "src/entities/question.entity";
import { LangEnum } from "src/entities/lang.enum";
import { UpdateQuestionDto } from "./dto/update-question.dto";

@ApiTags("Questions")
@Controller("questions")
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @ApiOperation({ summary: "Create a question" })
  @ApiResponse({ status: 201, description: "Question created successfully" })
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }
  @Post("bulk")
  @ApiOperation({ summary: "Bulk create questions" })
  @ApiResponse({ status: 201, description: "Questions successfully created" })
  @ApiBody({
    schema: {
      type: "array",
      items: { $ref: "#/components/schemas/CreateQuestionDto" },
    },
  })
  async createBulk(@Body() questions: CreateQuestionDto[]) {
    return this.questionService.createBulk(questions);
  }

  @Get()
  @ApiOperation({ summary: "Get all questions with pagination" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "lang",
    required: false,
    type: String,
    example: "uz",
    description: "Filter questions by language",
  })
  @ApiResponse({
    status: 200,
    description: "Returns paginated questions",
    type: [Question],
  })
  async getAllQuestions(
    @Query("page") page: number = 1,
    @Query("lang") lang?: LangEnum
  ) {
    return this.questionService.getAllQuestions(page, lang);
  }

  @Get("random")
  @ApiOperation({ summary: "Get random questions" })
  @ApiQuery({
    name: "lang",
    required: false,
    type: String,
    enum: LangEnum,
    example: "uz",
    description: "Filter questions by language",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 20,
    description: "Number of questions to return (default: 50)",
  })
  @ApiResponse({
    status: 200,
    description: "Returns random questions",
    type: [Question],
  })
  async getRandomQuestions(
    @Query("lang") lang: LangEnum = LangEnum.UZ,
    @Query("limit") limit: number = 50
  ) {
    return this.questionService.getRandomQuestions(lang, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one question by ID" })
  async findOne(@Param("id") id: number) {
    return this.questionService.findOne(id);
  }
  @Patch(":id")
  @ApiOperation({ summary: "Update a question" })
  @ApiResponse({
    status: 200,
    description: "Question updated successfully",
    type: Question,
  })
  async update(
    @Param("id") id: number,
    @Body() updateQuestionDto: UpdateQuestionDto
  ): Promise<Question> {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Patch(":id/correct-option")
  @ApiOperation({ summary: "Update correct option" })
  @ApiResponse({
    status: 200,
    description: "Correct option updated",
    type: Question,
  })
  async updateCorrectOption(
    @Param("id") id: number,
    @Body("correct_option") correct_option: string
  ): Promise<Question> {
    return this.questionService.updateCorrectOption(id, correct_option);
  }

  @Patch(":id/image-path")
  @ApiOperation({ summary: "Update question image path" })
  @ApiResponse({
    status: 200,
    description: "Image path updated",
    type: Question,
  })
  async updateImagePath(
    @Param("id") id: number,
    @Body("image_path") image_path: string
  ): Promise<Question> {
    return this.questionService.updateImagePath(id, image_path);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a question" })
  async remove(@Param("id") id: number) {
    return this.questionService.remove(id);
  }

  @Post("import/lotin")
  @ApiOperation({ summary: "Import questions from lotin.json" })
  @ApiResponse({ status: 201, description: "Questions imported successfully" })
  async importLotinQuestions(): Promise<string> {
    await this.questionService.importQuestionsFromJson("./src/data/lotin.json");
    return "Lotin savollar muvaffaqiyatli yuklandi!";
  }

  @Post("import/rus")
  @ApiOperation({ summary: "Import questions from rus.json" })
  @ApiResponse({ status: 201, description: "Questions imported successfully" })
  async importRusQuestions(): Promise<string> {
    await this.questionService.importQuestionsFromJson("./src/data/rus.json");
    return "Rus savollar muvaffaqiyatli yuklandi!";
  }

  @Post("import/crill")
  @ApiOperation({ summary: "Import questions from crill.json" })
  @ApiResponse({ status: 201, description: "Questions imported successfully" })
  async importCrillQuestions(): Promise<string> {
    await this.questionService.importQuestionsFromJson("./src/data/crill.json");
    return "Crill savollar muvaffaqiyatli yuklandi!";
  }

  @Post("import/all")
  @ApiOperation({ summary: "Import all questions from all JSON files" })
  @ApiResponse({
    status: 201,
    description: "All questions imported successfully",
  })
  async importAllQuestions(): Promise<string> {
    const files = [
      "./src/data/lotin.json",
      "./src/data/rus.json",
      "./src/data/crill.json",
    ];
    let totalImported = 0;

    for (const file of files) {
      try {
        await this.questionService.importQuestionsFromJson(file);
        console.log(`✅ ${file} import qilindi`);
      } catch (error) {
        console.error(`❌ ${file} import qilishda xatolik:`, error.message);
      }
    }

    return "Barcha savollar muvaffaqiyatli yuklandi!";
  }

  @Delete("cleanup")
  @ApiOperation({ summary: "Clean all questions and related data" })
  @ApiResponse({ status: 200, description: "Database cleaned successfully" })
  async cleanupDatabase(): Promise<string> {
    await this.questionService.cleanupAllData();
    return "Baza tozalandi!";
  }
}
