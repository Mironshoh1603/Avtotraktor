import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as path from "path";

import { join } from "path";
import { existsSync } from "fs";

const ffprobeLocal = join(process.cwd(), "ffprobe.exe");

if (existsSync(ffprobeLocal)) {
  process.env.FFPROBE_PATH = ffprobeLocal;
  try {
    const ffmpeg = require("fluent-ffmpeg");
    ffmpeg.setFfprobePath(ffprobeLocal);
    console.log("ffprobe yo'li o'rnatildi:", ffprobeLocal);
  } catch {}
} else {
  console.warn("ffprobe.exe topilmadi!");
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors(); // CORS yoqish
  console.log(
    "Fayllar serve qilinayotgan joy: ",
    path.resolve(process.cwd(), "uploads")
  );

  // ✅ Swagger sozlamalari
  const config = new DocumentBuilder()
    .setTitle("Upload API")
    .setDescription("Fayllarni yuklash API")
    .setVersion("1.0")
    .addServer("http://localhost:3001") // Lokal server qo'shish
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(3001);
}
bootstrap();
