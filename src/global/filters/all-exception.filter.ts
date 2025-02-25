import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
// import { AxiosError } from 'axios';
import { ENV } from 'src/global/constant';
import { CodedHttpException } from '../error/CodedHttpException';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): any {
    if (host.getType() !== 'http') {
      return;
    }
    const isDevelop = ENV.NODE_ENV === 'development';
    const { httpAdapter } = this.httpAdapterHost;
    let httpStatus: number;
    // if (exception instanceof AxiosError) {
    //   httpStatus =
    //     exception.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    // } else
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    const isInternalServerError = httpStatus >= 500 && httpStatus < 600;
    // 取得錯誤訊息
    let rawMessage: string | object;
    const resData = exception.response?.data;
    if (resData) {
      // AXIOS 錯誤訊息
      rawMessage = resData.message ?? resData;
    } else if (isInternalServerError) {
      // 5xx 及一般錯誤訊息
      exception = {
        name: exception.name || 'INTERNAL_SERVER_ERROR',
        message: exception.message,
        stack: exception.stack,
      } as Error;
      rawMessage =
        isInternalServerError && !isDevelop
          ? 'Internal Server Error'
          : exception.message;
    } else {
      // 4xx 錯誤訊息
      const exceptionRes = (exception as HttpException).getResponse();
      rawMessage = (exceptionRes as any)?.message ?? exceptionRes;
    }
    // 組合錯誤訊息
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const statusCode = httpStatus.toString();
    const message =
      rawMessage && rawMessage instanceof Object
        ? JSON.stringify(rawMessage)
        : String(rawMessage);
    const responseObj = {
      errorId: `E${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      statusCode,
      timestamp: new Date().toLocaleString(),
      method: request.method,
      path: request.url,
      name: exception.name,
      message,
      rawMessage: rawMessage !== message ? rawMessage : undefined,
      errorCode: (exception as CodedHttpException).code,
    };
    // 紀錄錯誤訊息
    if (isInternalServerError) {
      this.logger.error(JSON.stringify(responseObj, null, 2), exception.stack);
      if (!isDevelop) {
        responseObj.message = 'Internal Server Error';
        responseObj.rawMessage = undefined;
      }
    } else {
      this.logger.warn(JSON.stringify(responseObj, null, 2));
      if (isDevelop) {
        this.logger.warn(exception.stack);
      }
    }
    // 傳回錯誤訊息
    httpAdapter.reply(ctx.getResponse(), responseObj, httpStatus);
  }
}
