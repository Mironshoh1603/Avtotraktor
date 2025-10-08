import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  getFileUrl(filename: string): string {
    return `/uploads/${filename}`; // 🌍 Foydalanuvchiga qaytariladigan URL
  }
}
