import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @ApiProperty({
    example: 'uploads/images/updated_question.png',
    description: 'New image path',
    nullable: true,
  })
  image_path?: string;
}
