import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'Username', example: 'testuser', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: 'Password', example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER,
    required: false
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;
}