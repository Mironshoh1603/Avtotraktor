import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Question } from "../entities/question.entity";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { Answer } from "src/entities/answer.entity";
import { Category } from "src/entities/category.entity";
import { Template } from "src/entities/template.entity";
import * as fs from "fs";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { LangEnum } from "src/entities/lang.enum";
// import { getVideoDurationInSeconds } from 'get-video-duration';
import * as path from "path";

// export async function getVideoDurationInSeconds(
//   filePath: string
// ): Promise<number> {
//   const mediainfo = new MediaInfo();

//   const fileBuffer = fs.readFileSync(filePath); // video faylni o‘qiymiz

//   const info = await mediainfo.analyzeData(() => fileBuffer);

//   // mediainfo formatida Duration millisekundalarda bo‘lishi mumkin, yoki sekund
//   // Ba’zan string bo‘lishi mumkin, shuning uchun parseFloat qilamiz
//   const durationStr = info.media?.track?.[0]?.Duration;
//   if (!durationStr) throw new Error("Duration topilmadi");

//   const duration = parseFloat(durationStr);

//   // Sekundga o‘girib, yaxlitlaymiz
//   return Math.round(duration);
// }

@Injectable()
export class QuestionService {
  // Video duration cache
  private videoDurationCache: Map<string, number | null> = new Map();

  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>
  ) { }

  /**
   * Video faylning duration'ini olish (cache bilan)
   */
  private async getVideoDuration(videoPath: string): Promise<number | null> {
    // Cache'dan tekshirish
    if (this.videoDurationCache.has(videoPath)) {
      return this.videoDurationCache.get(videoPath);
    }

    try {
      // Agar yo'l "uploads/" bilan boshlanmasa, "uploads/" qo'shish
      let fullPath: string;
      if (videoPath.startsWith("uploads/")) {
        fullPath = path.resolve(process.cwd(), videoPath);
      } else {
        fullPath = path.resolve(process.cwd(), "uploads", videoPath);
      }

      // Fayl mavjudligini tekshirish
      if (!fs.existsSync(fullPath)) {
        this.videoDurationCache.set(videoPath, null);
        return null;
      }

      // const duration = await getVideoDurationInSeconds(fullPath);
      // const roundedDuration = Math.round(duration);

      // Cache'ga saqlash
      // this.videoDurationCache.set(videoPath, roundedDuration);

      // return roundedDuration;
    } catch (error) {
      console.error(
        `Video duration olishda xatolik: ${videoPath}`,
        error.message
      );
      this.videoDurationCache.set(videoPath, null);
      return null;
    }
  }

  /**
   * Question'larga video duration qo'shish
   */
  private async addVideoDurationToQuestions(
    questions: Question[]
  ): Promise<Question[]> {
    // Bazadagi video_duration maydonini o'zida saqlaydi, hech narsa qilish shart emas
    return questions;
  }

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const question = new Question();
    question.question = createQuestionDto.question;
    question.options = createQuestionDto.options;
    question.correct_option = createQuestionDto.correct_option;
    question.image_path = createQuestionDto.image_path;
    question.lang = createQuestionDto.lang;
    // question.video_duration = createQuestionDto.video_duration;

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
  async getAllQuestions(page: number, limit: number = 50, lang?: string) {
    const skip = (page - 1) * limit;

    const query = this.questionRepository
      .createQueryBuilder("question")
      .orderBy("question.id", "ASC")
      .offset(skip)
      .limit(limit);

    if (lang) {
      query.andWhere("question.lang = :lang", { lang });
    }

    const [questions, total] = await query.getManyAndCount();
    // Bazadagi durationni qaytaradi
    return {
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      data: questions,
    };
  }

  async getQuestionsByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 50,
    lang?: string
  ) {
    const skip = (page - 1) * limit;

    const query = this.questionRepository
      .createQueryBuilder("question")
      .leftJoinAndSelect("question.category", "category")
      .where("question.category_id = :categoryId", { categoryId })
      .orderBy("question.id", "ASC")
      .offset(skip)
      .limit(limit);

    if (lang) {
      query.andWhere("question.lang = :lang", { lang });
    }

    const [questions, total] = await query.getManyAndCount();

    return {
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      data: questions,
    };
  }

  async createBulk(questions: CreateQuestionDto[]): Promise<Question[]> {
    return await this.questionRepository.save(questions);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({ relations: ["answers"] });
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ["answers"],
    });

    // Video duration bazadan olinadi
    return question;
  }

  async remove(id: number): Promise<void> {
    await this.questionRepository.delete(id);
  }
  async importQuestionsFromJson(filePath: string): Promise<void> {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const questionsData: any[] = JSON.parse(jsonData);

    console.log(`📥 ${questionsData.length} ta savol yuklanmoqda...`);

    // 1️⃣ Kategoriyalarni olish va yaratish
    const categoryIds = new Set<number>();
    questionsData.forEach((q) => {
      if (q.category_id) categoryIds.add(q.category_id);
    });

    console.log(`📂 ${categoryIds.size} ta kategoriya topildi...`);
    for (const catId of categoryIds) {
      try {
        let category = await this.categoryRepository.findOne({
          where: { id: catId },
        });

        if (!category) {
          // INSERT bilan to'g'ridan-to'g'ri ID ni belgilash
          await this.categoryRepository.query(
            `INSERT INTO categories (id, name, description, status) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
            [catId, `Kategoriya ${catId}`, null, 1]
          );
          console.log(`✅ Kategoriya ${catId} yaratildi`);
        }
      } catch (error) {
        console.error(
          `❌ Kategoriya ${catId} yaratishda xatolik:`,
          error.message
        );
      }
    }

    let savedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Mavjud ID larni olish
    console.log("🔍 Bazadagi mavjud savollar tekshirilmoqda...");
    const existingQuestions = await this.questionRepository.find({
      select: ["id"],
    });
    const existingIds = new Set(existingQuestions.map((q) => q.id));
    console.log(`📊 Bazada mavjud: ${existingIds.size} ta savol`);

    // 2️⃣ Savollarni yuklash
    for (const questionData of questionsData) {
      try {
        const isExisting = existingIds.has(questionData.id);

        // Template'larni olish yoki yaratish
        const templates: Template[] = [];
        try {
          if (questionData.templates && Array.isArray(questionData.templates)) {
            for (const templateData of questionData.templates) {
              let template = await this.templateRepository.findOne({
                where: { id: templateData.id },
              });

              if (!template) {
                template = this.templateRepository.create({
                  id: templateData.id,
                  name: templateData.name,
                  status: templateData.status || 1,
                  questions_count: templateData.questions_count || null,
                });
                await this.templateRepository.save(template);
              }
              templates.push(template);
            }
          }
        } catch (templateError) {
          // Templates jadvali mavjud bo'lmasa, davom ettiramiz
          console.warn(
            `⚠️ Template ${questionData.id} uchun yuklashda xatolik, o'tkazib yuborildi`
          );
        }

        // Savolni yaratish yoki yangilash
        const question = this.questionRepository.create({
          id: questionData.id,
          question: questionData.question,
          options: questionData.options,
          correct_option: questionData.correct_option,
          image_path: questionData.image_path,
          lang: questionData.lang,
          category_id: questionData.category_id,
          type: questionData.type,
          answer_description: questionData.answer_description,
          answer_video: questionData.answer_video,
          video_duration: questionData.video_duration,
          comment: questionData.comment,
          static_order_answers: questionData.static_order_answers || 0,
          is_new: questionData.is_new || false,
          status: questionData.status || 1,
          templates: templates,
        });

        await this.questionRepository.save(question);

        if (isExisting) {
          updatedCount++;
        } else {
          savedCount++;
        }

        if ((savedCount + updatedCount) % 100 === 0) {
          console.log(
            `✅ ${savedCount + updatedCount} ta savol qayta ishlandi...`
          );
        }
      } catch (error) {
        errorCount++;
        console.error(
          `❌ Savol ${questionData.id} saqlashda xatolik:`,
          error.message
        );
      }
    }

    console.log(`\n✅ Yangi savollar: ${savedCount} ta`);
    console.log(`🔄 Yangilangan savollar: ${updatedCount} ta`);
    console.log(`📊 Jami qayta ishlandi: ${savedCount + updatedCount} ta`);
    if (errorCount > 0) {
      console.log(`❌ Xatoliklar soni: ${errorCount} ta`);
    }

    // Oxirgi holat
    const finalCount = await this.questionRepository.count();
    console.log(`📊 Bazada hozir jami: ${finalCount} ta savol`);
  }
  async getRandomQuestions(
    lang: LangEnum,
    limit: number = 50
  ): Promise<Question[]> {
    // 1. Get only IDs of matching questions (much faster than getting full objects)
    const allIds = await this.questionRepository
      .createQueryBuilder("question")
      .select("question.id")
      .where("question.lang = :lang", { lang })
      .andWhere("question.status = 1")
      .getMany();

    if (allIds.length === 0) return [];

    // 2. Shuffle IDs and pick 'limit' number of IDs
    const shuffledIds = allIds
      .map((q) => q.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    // 3. Fetch full data for only those specific IDs
    const questions = await this.questionRepository
      .createQueryBuilder("question")
      .leftJoinAndSelect("question.category", "category")
      .whereInIds(shuffledIds)
      .getMany();

    // Final sort to maintain the random order from shuffledIds
    const orderedQuestions = shuffledIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => !!q);

    return orderedQuestions;
  }

  async calculateTicketCount(
    questionsPerTicket: number,
    lang?: LangEnum
  ): Promise<{
    totalQuestions: number;
    questionsPerTicket: number;
    totalTickets: number;
    lang?: string;
  }> {
    const totalQuestions = await this.questionRepository.count({
      where: lang ? { lang } : {},
    });

    const totalTickets = Math.ceil(totalQuestions / questionsPerTicket);

    return {
      totalQuestions,
      questionsPerTicket,
      totalTickets,
      ...(lang && { lang }),
    };
  }
  async update(
    id: number,
    updateQuestionDto: UpdateQuestionDto
  ): Promise<Question> {
    const question = await this.findOne(id);

    Object.assign(question, updateQuestionDto);
    return await this.questionRepository.save(question);
  }

  async updateCorrectOption(
    id: number,
    correct_option: string
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

  async cleanupAllData(): Promise<void> {
    console.log("🧹 Baza tozalanmoqda...");

    // 1. Question-templates junction table ni tozalash
    await this.questionRepository.query(
      "TRUNCATE TABLE question_templates CASCADE"
    );
    console.log("✅ question_templates tozalandi");

    // 2. Questions ni tozalash (answers avtomatik o'chadi - CASCADE)
    await this.questionRepository.query("TRUNCATE TABLE questions CASCADE");
    console.log("✅ questions tozalandi");

    // 3. Categories ni tozalash
    await this.categoryRepository.query("TRUNCATE TABLE categories CASCADE");
    console.log("✅ categories tozalandi");

    // 4. Templates ni tozalash
    await this.templateRepository.query("TRUNCATE TABLE templates CASCADE");
    console.log("✅ templates tozalandi");

    // 5. Answers ni tozalash (agar CASCADE ishlamagan bo'lsa)
    await this.answerRepository.query("TRUNCATE TABLE answers CASCADE");
    console.log("✅ answers tozalandi");

    console.log("✅ Baza to'liq tozalandi!");
  }
}
