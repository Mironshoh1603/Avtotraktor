import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      "https://doc.mironshokh.uz",
      "https://api.mironshokh.uz",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  });

  // ✅ Swagger sozlamalari
  const config = new DocumentBuilder()
    .setTitle("Autotest API")
    .setDescription("Autotest API")
    .setVersion("1.0")
    .addServer("https://api.mironshokh.uz") // Lokal server qo'shish
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(3003);
}
bootstrap();
