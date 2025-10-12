import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppDataSource } from "./data-source";
import { Question } from "./entities/question.entity";
import { Answer } from "./entities/answer.entity";
import { Category } from "./entities/category.entity";
import { Template } from "./entities/template.entity";
// import { User } from './entities/user.entity';
// import { Course } from './entities/course.entity';
import { QuestionModule } from "./question/question.module";
import { UploadModule } from "./upload/upload.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from 'path';
console.log('Fayllar serve qilinayotgan joy: ', path.resolve(process.cwd(), 'uploads'));


@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options), // TypeORM konfiguratsiyasini ulash
    TypeOrmModule.forFeature([Answer, Question, Category, Template]),
    QuestionModule,
    ServeStaticModule.forRoot({
    rootPath: path.resolve(process.cwd(), 'uploads'),
    serveRoot: '/uploads',
}),
    UploadModule,
  ],
})
export class AppModule {}
