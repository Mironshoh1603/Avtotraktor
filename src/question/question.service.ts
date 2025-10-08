import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '../entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Answer } from 'src/entities/answer.entity';
import { Category } from 'src/entities/category.entity';
import { Template } from 'src/entities/template.entity';
import * as fs from 'fs';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { LangEnum } from 'src/entities/lang.enum';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const question = new Question();
    question.question = createQuestionDto.question;
    question.options = createQuestionDto.options;
    question.correct_option = createQuestionDto.correct_option;
    question.image_path = createQuestionDto.image_path;
    question.lang = createQuestionDto.lang;

    // `answers` massivini yaratamiz
    question.answers = createQuestionDto.answers.map((answerDto) => {
      const answer = new Answer();
      answer.letter = answerDto.letter;
      answer.value = answerDto.value;
      answer.correct = answerDto.correct || false;
      return answer;
    });

    return await this.questionRepository.save(question);
  }
  async getAllQuestions(page: number, lang?: string) {
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    const query = this.questionRepository
      .createQueryBuilder('question')
      .orderBy('question.id', 'ASC') // 🟢 ID bo‘yicha sortlash (o‘sish tartibida)
      .skip(skip)
      .take(pageSize);

    if (lang) {
      query.andWhere('question.lang = :lang', { lang });
    }

    const [questions, total] = await query.getManyAndCount();

    return {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      data: questions,
    };
  }

  async createBulk(questions: CreateQuestionDto[]): Promise<Question[]> {
    return await this.questionRepository.save(questions);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({ relations: ['answers'] });
  }

  async findOne(id: number): Promise<Question> {
    return this.questionRepository.findOne({
      where: { id },
      relations: ['answers'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.questionRepository.delete(id);
  }
  async importQuestionsFromJson(filePath: string): Promise<void> {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const questions: Partial<Question>[] = JSON.parse(jsonData);

    await this.questionRepository.save(questions);
    console.log('Savollar bazaga saqlandi');
  }
  async getRandomQuestions(lang:LangEnum): Promise<Question[]> {
    const questions = await this.questionRepository
      .createQueryBuilder('question')
      .andWhere('question.lang = :lang', { lang })
      .orderBy('RANDOM()') // PostgreSQL uchun random order
      .limit(50) // 50 ta savol olish
      .getMany();

    return questions;
  }
  async update(
    id: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.findOne(id);

    Object.assign(question, updateQuestionDto);
    return await this.questionRepository.save(question);
  }

  async updateCorrectOption(
    id: number,
    correct_option: string,
  ): Promise<Question> {
    const question = await this.findOne(id);
    question.correct_option = correct_option;
    return await this.questionRepository.save(question);
  }

  async updateImagePath(id: number, image_path: string): Promise<Question> {
    const question = await this.findOne(id);
    question.image_path = image_path;
    return await this.questionRepository.save(question);
  }
}
