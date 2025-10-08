import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads', // Fayl qayerga saqlansin
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExt = extname(file.originalname); // 📌 Fayl kengaytmasini olish
      const newFilename = `${uniqueSuffix}${fileExt}`; // 📌 To'g'ri nom bilan saqlash
      callback(null, newFilename);
    },
  }),
};
