import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger();

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const statusCode = res.statusCode;
      if (statusCode >= 400) {
        this.logger.warn(
          `[${req.method}] ${req.url} - ${statusCode}: ${res.statusMessage}`,
        );
        return;
      }
      this.logger.log(
        `[${req.method}] ${req.url} - ${statusCode}: ${res.statusMessage}`,
      );
    });

    next();
  }
}
