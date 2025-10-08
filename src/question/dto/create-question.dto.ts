import {
  IsString,
  IsArray,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LangEnum } from 'src/entities/lang.enum';

class AnswerDto {
  @IsString()
  letter: string;

  @IsString()
  value: string;

  @IsOptional()
  correct?: boolean;
}

class TemplateDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsNumber()
  status: number;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  updated_at?: string;

  @IsOptional()
  @IsNumber()
  questions_count?: number;
}

export class CreateQuestionDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  question: string;

  @IsArray()
  options: string[];

  @IsString()
  correct_option: string;

  @IsOptional()
  @IsString()
  image_path?: string;

  @IsEnum(LangEnum)
  lang: LangEnum;

  @IsOptional()
  @IsNumber()
  category_id?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  answer_description?: string;

  @IsOptional()
  @IsString()
  answer_video?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  static_order_answers?: number;

  @IsOptional()
  @IsBoolean()
  is_new?: boolean;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers?: AnswerDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateDto)
  templates?: TemplateDto[];
}
