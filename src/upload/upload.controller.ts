import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { Express } from 'express';
import { multerConfig } from 'src/multer.config';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', multerConfig)) // 📌 Multer config ishlatamiz
  @ApiOperation({ summary: 'Fayl yuklash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // Swaggerda fayl yuklash opsiyasi
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Fayl muvaffaqiyatli yuklandi' })
  @ApiResponse({ status: 400, description: 'Xato! Fayl yuklanmadi' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = this.uploadService.getFileUrl(file.filename);
    return { url: fileUrl, originalName: file.originalname };
  }
}
