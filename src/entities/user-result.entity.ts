import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('user_results')
export class UserResult {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Result ID' })
  id: number;

  @Column()
  @ApiProperty({ description: 'User ID' })
  user_id: number;

  @Column()
  @ApiProperty({ description: 'Total questions in test' })
  total_questions: number;

  @Column()
  @ApiProperty({ description: 'Correct answers count' })
  correct_answers: number;

  @Column()
  @ApiProperty({ description: 'Wrong answers count' })
  wrong_answers: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @ApiProperty({ description: 'Test score percentage' })
  score_percentage: number;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ description: 'Question answers details', type: 'object', additionalProperties: true })
  answers_detail: any;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Test language', required: false })
  test_language: string;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ description: 'Test duration in seconds', required: false })
  test_duration_seconds: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Test completion date' })
  completed_at: Date;

  @ManyToOne(() => User, user => user.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}