import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { Answer } from "./answer.entity";
import { LangEnum } from "./lang.enum";
import { Category } from "./category.entity";
import { Template } from "./template.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("questions")
export class Question {
  @ApiProperty({ example: 1, description: "Unique ID of the question" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: "NestJS nima?", description: "The question text" })
  @Column()
  question: string;

  @ApiProperty({
    example: [
      "A. Framework",
      "B. Library",
      "C. Database",
      "D. Operating System",
    ],
    description: "List of possible answer options",
  })
  @Column("text", { array: true })
  options: string[];

  @ApiProperty({
    example: "A",
    description: "Correct answer option",
    nullable: true,
  })
  @Column({ nullable: true })
  correct_option: string;

  @ApiProperty({
    example: "uploads/images/question1.png",
    description: "Image path for the question",
    nullable: true,
  })
  @Column({ nullable: true })
  image_path: string;

  @ApiProperty({
    example: LangEnum.UZ,
    description: "Language of the question",
    enum: LangEnum,
    default: LangEnum.KR,
  })
  @Column({
    type: "enum",
    enum: LangEnum,
    default: LangEnum.RU,
  })
  lang: LangEnum;

  @ApiProperty({
    example: 1,
    description: "Category ID",
    nullable: true,
  })
  @Column({ nullable: true })
  category_id: number;

  @ApiProperty({
    example: "image",
    description: "Question type (image or text)",
    nullable: true,
  })
  @Column({ nullable: true })
  type: string;

  @ApiProperty({
    example: "Bu javobning batafsil tushuntirishi",
    description: "Answer description/explanation",
    nullable: true,
  })
  @Column("text", { nullable: true })
  answer_description: string;

  @ApiProperty({
    example: "/test_files/testanswer/video.mp4",
    description: "Answer video path",
    nullable: true,
  })
  @Column({ nullable: true })
  answer_video: string;

  @ApiProperty({
    example: "Izoh",
    description: "Comment",
    nullable: true,
  })
  @Column("text", { nullable: true })
  comment: string;

  @ApiProperty({
    example: 0,
    description: "Static order answers (0 or 1)",
    default: 0,
  })
  @Column({ default: 0 })
  static_order_answers: number;

  @ApiProperty({
    example: false,
    description: "Is new question",
    default: false,
  })
  @Column({ default: false })
  is_new: boolean;

  @ApiProperty({
    example: 1,
    description: "Question status (1 = active)",
    default: 1,
  })
  @Column({ default: 1 })
  status: number;

  @ApiProperty({
    type: () => Category,
    description: "Question category",
  })
  @ManyToOne(() => Category, (category) => category.questions)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @ApiProperty({
    type: () => [Answer],
    description: "List of answers associated with this question",
  })
  @OneToMany(() => Answer, (answer) => answer.question, { cascade: true })
  answers: Answer[];

  @ApiProperty({
    type: () => [Template],
    description: "Templates associated with this question",
  })
  @ManyToMany(() => Template, (template) => template.questions)
  @JoinTable({
    name: "question_templates",
    joinColumn: { name: "question_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "template_id", referencedColumnName: "id" },
  })
  templates: Template[];
}
