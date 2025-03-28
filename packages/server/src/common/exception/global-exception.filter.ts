import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { BusinessException } from './business.exception'
import { ErrorCode } from './error-codes.enum'
import {
  ErrorResponseDto,
  ValidationErrorDetails,
  FieldError,
} from './error-response.dto'
import { ValidationError } from 'class-validator'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const timestamp = new Date().toISOString()

    // 요청 정보 로깅
    const requestInfo = {
      path: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp,
    }

    let errorResponse: ErrorResponseDto

    // BusinessException 처리
    if (exception instanceof BusinessException) {
      const businessError = exception.getErrorResponse()

      errorResponse = new ErrorResponseDto(
        businessError.statusCode,
        businessError.errorCode,
        businessError.message,
        businessError.details,
      )

      this.logger.warn(
        `BusinessException: ${JSON.stringify({
          ...requestInfo,
          errorCode: businessError.errorCode,
          statusCode: businessError.statusCode,
          message: businessError.message,
        })}`,
      )
    }
    // NestJS HttpException 처리
    else if (exception instanceof HttpException) {
      const statusCode = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      let message: string
      let details: ValidationErrorDetails | undefined

      // ValidationPipe에서 발생한 예외 처리
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        if (
          Array.isArray(exceptionResponse['message']) &&
          exceptionResponse['message'].length > 0 &&
          typeof exceptionResponse['message'][0] === 'string'
        ) {
          // 단순 문자열 배열 메시지 처리
          message = exceptionResponse['message'].join(', ')
        } else if (
          Array.isArray(exceptionResponse['message']) &&
          exceptionResponse['message'].length > 0 &&
          typeof exceptionResponse['message'][0] === 'object'
        ) {
          // class-validator ValidationError 객체 배열 처리
          message = '입력값 검증에 실패했습니다.'
          const validationErrors = exceptionResponse[
            'message'
          ] as ValidationError[]

          // ValidationError 객체를 FieldError 형식으로 변환
          const fieldErrors: FieldError[] =
            this.flattenValidationErrors(validationErrors)

          details = { fieldErrors }
        } else {
          // 다른 형태의 메시지 처리
          message =
            typeof exceptionResponse['message'] === 'string'
              ? exceptionResponse['message']
              : JSON.stringify(exceptionResponse['message'])
        }
      } else {
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : 'HTTP 에러가 발생했습니다.'
      }

      // 상태 코드에 따른 에러 코드 매핑
      let errorCodeObj: ErrorCode
      switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
          errorCodeObj = ErrorCode.INVALID_INPUT_VALUE
          break
        case HttpStatus.UNAUTHORIZED:
          errorCodeObj = ErrorCode.UNAUTHORIZED
          break
        case HttpStatus.FORBIDDEN:
          errorCodeObj = ErrorCode.HANDLE_ACCESS_DENIED
          break
        case HttpStatus.NOT_FOUND:
          errorCodeObj = ErrorCode.RESOURCE_NOT_FOUND
          break
        case HttpStatus.METHOD_NOT_ALLOWED:
          errorCodeObj = ErrorCode.METHOD_NOT_ALLOWED
          break
        default:
          errorCodeObj = ErrorCode.INTERNAL_SERVER_ERROR
      }

      errorResponse = new ErrorResponseDto(
        statusCode,
        errorCodeObj.code,
        message,
        details,
      )

      this.logger.warn(
        `HttpException: ${JSON.stringify({
          ...requestInfo,
          statusCode,
          errorCode: errorCodeObj.code,
          message,
        })}`,
      )
    }
    // 그 외 모든 예외 처리 (500 Internal Server Error)
    else {
      const errorCodeObj = ErrorCode.INTERNAL_SERVER_ERROR

      // 예외 객체가 Error 인스턴스인 경우
      let message: string
      if (exception instanceof Error) {
        message = exception.message || errorCodeObj.message

        // 스택 트레이스 로깅
        this.logger.error(
          `Unhandled Error: ${exception.message}`,
          exception.stack,
        )

        // 추가된 코드
        this.logger.error(
          `Detailed error in /api/invitations/user: ${exception.message}`,
          exception.stack,
        )
      } else {
        message = errorCodeObj.message
        this.logger.error(`Unknown Exception: ${JSON.stringify(exception)}`)
      }

      errorResponse = new ErrorResponseDto(
        errorCodeObj.status,
        errorCodeObj.code,
        message,
      )

      this.logger.error(
        `InternalServerError: ${JSON.stringify({
          ...requestInfo,
          message,
        })}`,
      )
    }

    // 응답 반환 - timestamp 필드가 ErrorResponseDto 생성자에서 자동으로 추가됨
    response.status(errorResponse.statusCode).json({
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.errorCode,
      message: errorResponse.message,
      timestamp: errorResponse.timestamp,
      ...(errorResponse.details && { details: errorResponse.details }),
    })
  }

  /**
   * class-validator의 ValidationError 객체를 평탄화하여 FieldError 배열로 변환
   */
  private flattenValidationErrors(
    validationErrors: ValidationError[],
  ): FieldError[] {
    const fieldErrors: FieldError[] = []

    const extractErrors = (error: ValidationError, parentPath = ''): void => {
      const path = parentPath
        ? `${parentPath}.${error.property}`
        : error.property

      // 제약 조건 오류 추출
      if (error.constraints) {
        const message =
          Object.values(error.constraints)[0] || '유효하지 않은 값입니다.'
        fieldErrors.push({ field: path, message })
      }

      // 하위 오류 재귀적 처리
      if (error.children && error.children.length > 0) {
        error.children.forEach((child) => extractErrors(child, path))
      }
    }

    validationErrors.forEach((error) => extractErrors(error))

    return fieldErrors
  }
}
