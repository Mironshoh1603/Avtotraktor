import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserResult } from './user-result.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'User ID' })
  id: number;

  @Column({ unique: true, length: 50 })
  @ApiProperty({ description: 'Username', maxLength: 50 })
  username: string;

  @Column()
  password: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.USER 
  })
  @ApiProperty({ 
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ default: 1 })
  @ApiProperty({ description: 'User status (1 = active, 0 = inactive)', default: 1 })
  status: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation date' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update date' })
  updated_at: Date;

  @OneToMany(() => UserResult, userResult => userResult.user, { cascade: true })
  results: UserResult[];
}