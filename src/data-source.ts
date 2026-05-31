import "reflect-metadata";
import { DataSource } from "typeorm";
// import { User } from './entities/user.entity'; // Model (Entity) fayllarini import qiling
// import { Course } from './entities/course.entity';

import * as dotenv from "dotenv";
import { Answer } from "./entities/answer.entity";
import { Question } from "./entities/question.entity";
import { Category } from "./entities/category.entity";
import { Template } from "./entities/template.entity";
import { User } from "./entities/user.entity";
import { UserResult } from "./entities/user-result.entity";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "1234",
  database: process.env.DB_NAME || "quizes",

  entities: [Answer, Question, Category, Template, User, UserResult], // Entitylar ro'yxati
  synchronize: false, // Manual migration bilan ishlayapmiz
  logging: false, // Konsolda SQL so'rovlarini chiqaradi
  migrations: ["dist/migrations/*.js"], // Migratsiyalar yo'li
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log("📦 PostgreSQL bazasiga muvaffaqiyatli ulandi!");
  })
  .catch((error) => console.log("❌ PostgreSQL ulanishida xatolik:", error));
