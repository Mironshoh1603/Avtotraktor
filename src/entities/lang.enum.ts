import { ApiProperty } from '@nestjs/swagger';

export enum LangEnum {
  UZ = 'uz',
  KR = 'kr',
  RU = 'ru',
}

export class LangEnumDto {
  @ApiProperty({
    example: LangEnum.UZ,
    description: 'Language type',
    enum: LangEnum,
  })
  lang: LangEnum;
}
