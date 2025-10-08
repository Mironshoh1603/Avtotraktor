import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
  import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors(); // CORS yoqish
  console.log('Fayllar serve qilinayotgan joy: ', path.resolve(process.cwd(), 'uploads'));
  

  // ✅ Swagger sozlamalari
  const config = new DocumentBuilder()
    .setTitle('Upload API')
    .setDescription('Fayllarni yuklash API')
    .setVersion('1.0')
    .addServer('http://localhost:3001') // Lokal server qo'shish
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
  
}
bootstrap();
