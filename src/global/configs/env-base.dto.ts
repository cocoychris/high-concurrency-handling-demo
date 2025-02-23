import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import {
  stringToBoolean,
  stringToInteger,
} from 'libs/basic-utils/data/type-transform';

enum ContainerRestart {
  NO = 'no',
  ALWAYS = 'always',
  ON_FAILURE = 'on-failure',
  UNLESS_STOPPED = 'unless-stopped',
}
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

export class EnvBaseDto {
  /**
   * Docker 容器是否自動重啟
   *
   * `docker-compose.yml` 會用到此參數
   */
  @Expose()
  @IsEnum(ContainerRestart)
  @IsNotEmpty()
  CONTAINER_RESTART: ContainerRestart = ContainerRestart.ALWAYS;

  /**
   * Docker 容器公開埠號
   *
   * `docker-compose.yml` 會用到此參數
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  @Min(1)
  @Max(65535)
  CONTAINER_PORT: number;

  /**
   * PostgreSQL 使用者名稱
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;

  /**
   * PostgreSQL 使用者密碼
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;

  /**
   * PostgreSQL 資料庫名稱
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string;

  /**
   * PostgreSQL 伺服器位址
   *
   * `docker-compose.yml` 會用到此參數
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST: string;

  /**
   * PostgreSQL 連線埠號
   *
   * `docker-compose.yml` 會用到此參數
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_PORT: string;

  /**
   * 資料庫連線 URL
   *
   * 請確保此 URL 與`POSTGRES_USER`、`POSTGRES_PASSWORD`等欄位一致
   *
   * Drizzle 會使用此 URL 連線至資料庫
   * @example
   * `postgresql://username:password@localhost:5432/database`
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  /**
   * 環境變數
   *
   * 預設為 `development`
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  NODE_ENV: 'development' | 'production' = 'development';

  /**
   * 伺服器埠號
   *
   * 預設為 `3000`
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;
  /**
   * API 金鑰的 HTTP Header 名稱
   *
   * 預設為 `X-API-KEY`
   *
   * 當另一台伺服器要呼叫此伺服器的 API 時，需要在 HTTP Header 中加入此 Header，並填入 API 金鑰
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  API_KEY_HEADER: string = 'X-API-KEY';

  /**
   * API 金鑰
   *
   * 當另一台伺服器要呼叫此伺服器的 API 時，需要在 HTTP Header 中攜帶此金鑰。
   *
   * 此字串越長越好，生成方式請見範例。設為空字串代表不啟用 API 金鑰機制。
   * @example
   * ```ts
   * import { randomBytes } from 'crypto';
   * const API_KEY = randomBytes(32).toString('hex');
   * ```
   */
  @Expose()
  @IsString()
  @IsOptional()
  API_KEY?: string;

  /**
   * 全域路由前綴
   *
   * 會自動去除頭部及尾部斜線
   *
   * ## 用途說明
   * 舉例來說，我們有兩個專案想佈署在同一台主機上，並使用相同的網域 (Domain)。
   * 此時兩個專案的路徑很容易就會相撞。
   *
   * 例如網域為 `example.com`，專案 A 與 B 都擁有自己的 `/api` 路由。
   * - 專案 A: `example.com/api`
   * - 專案 B: `example.com/api`
   *
   * 此時很難在 Nginx 中設定路由，分別導向兩個不同專案。
   *
   * 因此我們可以使用此參數(全域路由前綴)，在路徑中分別加上 `prefix-a` 與 `prefix-b`：
   * - 專案 A: `example.com/prefix-a/api`
   * - 專案 B: `example.com/prefix-b/api`
   *
   */
  @Expose()
  @IsString()
  @Transform(({ value }: { value: string }) => {
    if (!value) {
      return '';
    }
    const result: string = value.trim().replace(/\/$/, '');
    if (result.startsWith('/')) {
      return result.slice(1);
    }
    return result;
  })
  APP_URL_GLOBAL_PREFIX!: string;

  /**
   * 伺服器對外公開的網址
   *
   * 會自動去除尾部斜線。此路徑不應包含 `APP_URL_GLOBAL_PREFIX`。
   *
   * 用於需要提供 callback URL 的情況。例如有另一台伺服器(B)要呼叫此伺服器(A)的 API，並且 A 需要在呼叫 B 的 API 時，提供該 callback URL。
   */
  @Expose()
  @IsUrl({
    require_protocol: true,
  })
  @Transform(({ value }: { value: string }) => {
    if (!value) {
      return '';
    }
    return value.trim().replace(/\/$/, '');
  })
  PUBLIC_BASE_URL!: string;

  /**
   * 啟用/停用 Swagger 線上文件
   */
  @Expose()
  @Transform(stringToBoolean)
  @IsBoolean()
  SWAGGER_ENABLED: boolean = true;

  /**
   * 時區
   *
   * 預設為 `Asia/Taipei`
   *
   * 用於設定 nestJS Cron(定時排程) 作業時校正時區
   */
  @Expose()
  @IsString()
  TIMEZONE: string = 'Asia/Taipei';

  /**
   * 是否啟用 HTTP 限流
   */
  @Expose()
  @Transform(stringToBoolean)
  @IsBoolean()
  THROTTLER_ENABLED: boolean = true;

  /**
   * 限流時間單位(秒)
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  THROTTLER_TTL_SEC: number = 60;

  /**
   * 於限流時間內的請求次數上限
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  THROTTLER_LIMIT: number = 10;

  /**
   * 阻擋時間(秒)
   *
   * 當超過限流次數時，將被阻擋的時間
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  THROTTLER_BLOCK_DURATION_SEC: number = 60;

  /**
   * Console 及 綜合(Combine)檔案的 Log Level
   *
   * Log Level 由低到高分別為：error/warn/info/http/verbose/debug/silly，預設為 info。
   * 使用較高的 Log Level 會包含較低的 Log。
   */
  @Expose()
  @IsEnum(LogLevel)
  @IsNotEmpty()
  LOGGER_LOG_LEVEL: LogLevel = LogLevel.INFO;

  /**
   * 是否寫入錯誤檔案 (只包含 Error Level)
   */
  @Expose()
  @Transform(stringToBoolean)
  @IsBoolean()
  LOGGER_LOG_TO_ERROR_FILE: boolean = true;

  /**
   * 是否寫入綜合(Combine)檔案
   */
  @Expose()
  @Transform(stringToBoolean)
  @IsBoolean()
  LOGGER_LOG_TO_COMBINE_FILE: boolean = true;

  /**
   * 是否在 Console 顯示 Log
   */
  @Expose()
  @Transform(stringToBoolean)
  @IsBoolean()
  LOGGER_LOG_TO_CONSOLE: boolean = true;

  /**
   * Log 檔案保留天數
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  LOGGER_FILE_RETENTION_DAYS: number = 30;

  /**
   * 是否在 Console 顯示時間戳記
   */
  @Expose()
  @Transform(stringToBoolean)
  @IsBoolean()
  LOGGER_CONSOLE_TIMESTAMP: boolean = true;
}
