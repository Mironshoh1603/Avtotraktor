import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";
import { Question } from "./question.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("categories")
export class Category {
  @ApiProperty({ example: 1, description: "Unique ID of the category" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: "Yo'l belgilari", description: "Category name" })
  @Column()
  name: string;

  @ApiProperty({
    example: "Yo'l harakati belgilari haqida savollar",
    description: "Category description",
    nullable: true,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ example: 1, description: "Category status (1 = active)" })
  @Index()
  @Column({ default: 1 })
  status: number;

  @ApiProperty({
    type: () => [Question],
    description: "Questions in this category",
  })
  @OneToMany(() => Question, (question) => question.category)
  questions: Question[];
}
