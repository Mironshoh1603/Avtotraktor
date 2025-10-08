import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Question } from "./question.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("templates")
export class Template {
  @ApiProperty({ example: 1, description: "Unique ID of the template" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: "Template 1", description: "Template name" })
  @Column()
  name: string;

  @ApiProperty({ example: 1, description: "Template status (1 = active)" })
  @Column({ default: 1 })
  status: number;

  @ApiProperty({ example: 50, description: "Questions count in template", nullable: true })
  @Column({ nullable: true })
  questions_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    type: () => [Question],
    description: "Questions associated with this template",
  })
  @ManyToMany(() => Question, (question) => question.templates)
  questions: Question[];
}
