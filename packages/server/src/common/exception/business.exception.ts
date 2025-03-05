import { HttpException } from '@nestjs/common'
import {
  ErrorCode,
  ErrorHttpStatusMap,
  ErrorMessageMap,
} from './error-codes.enum'
import { ErrorDetails } from './error-response.dto'

export class BusinessException extends HttpException {
  private readonly errorCode: ErrorCode
  private readonly details?: ErrorDetails
  private readonly timestamp: string

  /**
   * 비즈니스 예외 생성자
   * @param errorCode 서비스 에러 코드
   * @param message 사용자 정의 에러 메시지 (제공하지 않으면 기본 메시지 사용)
   * @param details 상세 에러 정보
   */
  constructor(errorCode: ErrorCode, message?: string, details?: ErrorDetails) {
    // ErrorHttpStatusMap에서 HTTP 상태 코드를 가져오거나 기본값으로 INTERNAL_SERVER_ERROR 사용
    const statusCode = ErrorHttpStatusMap[errorCode] || 500

    // 메시지가 제공되지 않았다면 기본 에러 메시지 맵에서 가져옴
    const errorMessage =
      message || ErrorMessageMap[errorCode] || '알 수 없는 오류가 발생했습니다.'

    // HttpException 생성자 호출
    super(errorMessage, statusCode)

    this.errorCode = errorCode
    this.details = details
    this.timestamp = new Date().toISOString()

    // 프로토타입 체인 유지를 위한 설정
    Object.setPrototypeOf(this, BusinessException.prototype)
  }

  /**
   * 비즈니스 예외의 응답 객체를 가져오는 메서드
   */
  getErrorResponse(): {
    statusCode: number
    errorCode: ErrorCode
    message: string
    timestamp: string
    details?: ErrorDetails
  } {
    return {
      statusCode: this.getStatus(),
      errorCode: this.errorCode,
      message: this.message,
      timestamp: this.timestamp,
      ...(this.details && { details: this.details }),
    }
  }

  /**
   * ErrorCode 접근자
   */
  getErrorCode(): ErrorCode {
    return this.errorCode
  }

  /**
   * details 접근자
   */
  getDetails(): ErrorDetails | undefined {
    return this.details
  }

  /**
   * timestamp 접근자
   */
  getTimestamp(): string {
    return this.timestamp
  }

  /**
   * 특정 서비스 에러코드에 대한 비즈니스 예외를 생성하는 정적 팩토리 메서드
   */
  static fromCode(
    errorCode: ErrorCode,
    details?: ErrorDetails,
  ): BusinessException {
    return new BusinessException(errorCode, undefined, details)
  }

  /**
   * 사용자 정의 메시지를 가진 비즈니스 예외를 생성하는 정적 팩토리 메서드
   */
  static fromMessage(
    errorCode: ErrorCode,
    message: string,
    details?: ErrorDetails,
  ): BusinessException {
    return new BusinessException(errorCode, message, details)
  }
}
