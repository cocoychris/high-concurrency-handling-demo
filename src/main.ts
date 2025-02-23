import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_VERSION,
  ENV,
} from 'src/global/constant';
import { AppModule } from './app.module';

import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file'; // 要 import 這個套件，才能使用 DailyRotateFile
import * as TransportStream from 'winston-transport';
import { Console } from 'winston/lib/winston/transports';
import { AllExceptionsFilter } from './global/filters/all-exception.filter';
import moment from 'moment';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 設定 CORS 跨域請求
  // app.enableCors({
  //   origin: '*', // 最好還是設定成你的前端網址，這樣比較安全
  //   allowedHeaders: '*',
  //   exposedHeaders: '*',
  // });

  // 使用 Winson 作為 Logger 並按日切割 log 檔案
  useWinstonDailyRotateLogger(app);

  // 捕捉並記錄所有例外
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  // 設定全域路由前綴
  app.setGlobalPrefix(ENV.APP_URL_GLOBAL_PREFIX);

  // 自動驗證請求資料格式
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 移除 x-powered-by header
  app.disable('x-powered-by');

  // 使用 Swagger 產生線上 API 文件
  useSwagger(app);

  // 啟動應用程式
  await app.listen(ENV.PORT);

  // 紀錄 APP 基本資訊
  Logger.log(
    [
      `${APP_NAME} (${APP_VERSION})`,
      ...readableEnvStringList([
        'NODE_ENV',
        'PORT',
        'CONTAINER_PORT',
        'CONTAINER_RESTART',
        'SWAGGER_ENABLED',
        'THROTTLER_ENABLED',
        'LOGGER_LOG_TO_CONSOLE',
        'API_KEY_HEADER',
        'APP_URL_GLOBAL_PREFIX',
        'PUBLIC_BASE_URL',
      ]),
    ].join('\n'),
    'Bootstrap',
  );
}
void bootstrap();

function readableEnvStringList(propList: string[]) {
  return propList.map((prop) => `${prop} = ${ENV[prop]}`);
}

function useSwagger(app: NestExpressApplication) {
  if (!ENV.SWAGGER_ENABLED) {
    return;
  }
  const config = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setVersion(APP_VERSION)
    .setDescription(APP_DESCRIPTION)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    `${ENV.APP_URL_GLOBAL_PREFIX}/api-docs`,
    app,
    documentFactory,
  );
}

function useWinstonDailyRotateLogger(app: INestApplication) {
  // Winston
  const transportList: TransportStream[] = [];
  if (ENV.LOGGER_LOG_TO_CONSOLE) {
    transportList.push(
      new Console({
        level: ENV.LOGGER_LOG_LEVEL,
        format: format.combine(
          format.cli(),
          format.splat(),
          format.colorize({
            all: true,
          }),
          format.timestamp(),
          format.printf(getPrintfFormat(ENV.LOGGER_CONSOLE_TIMESTAMP)),
        ),
      }),
    );
  }
  const logFileFormat = format.combine(
    format.splat(),
    format.colorize({
      all: true,
    }),
    format.timestamp(),
    format.printf(getPrintfFormat(true)),
  );
  if (ENV.LOGGER_LOG_TO_ERROR_FILE) {
    transportList.push(
      // file on daily rotation (error only)
      new transports.DailyRotateFile({
        // %DATE will be replaced by the current date
        filename: `logs/%DATE%-error.log`,
        level: 'error',
        format: logFileFormat,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false, // don't want to zip our logs
        maxFiles: `${ENV.LOGGER_FILE_RETENTION_DAYS}d`, // will keep log until they are older than 30 days
      }),
    );
  }
  if (ENV.LOGGER_LOG_TO_COMBINE_FILE) {
    transportList.push(
      // same for all levels
      new transports.DailyRotateFile({
        filename: `logs/%DATE%-combined.log`,
        level: ENV.LOGGER_LOG_LEVEL,
        format: logFileFormat,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: `${ENV.LOGGER_FILE_RETENTION_DAYS}d`,
      }),
    );
  }
  app.useLogger(
    WinstonModule.createLogger({
      transports: transportList,
    }),
  );
}

function getPrintfFormat(withTimestamp: boolean) {
  return withTimestamp
    ? (info: any) => {
        return `${moment(info.timestamp).format(
          'YYYYMMDD HH:mm:ss',
        )} ${info.level} [${info.context as string}] ${info.message as string}`;
      }
    : (info: any) => {
        return `${info.level} [${info.context as string}] ${info.message as string}`;
      };
}
