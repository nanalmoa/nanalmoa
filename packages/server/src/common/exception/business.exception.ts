import { HttpException } from '@nestjs/common'
import { ErrorCode } from './error-codes.enum'
import { ErrorDetails } from './error-response.dto'

export class BusinessException extends HttpException {
  private readonly errorCode: ErrorCode
  private readonly details?: ErrorDetails
  private readonly timestamp: string

  /**
   * 비즈니스 예외 생성자
   * @param errorCode 에러 코드 객체
   * @param message 사용자 정의 에러 메시지 (제공하지 않으면 ErrorCode의 기본 메시지 사용)
   * @param details 상세 에러 정보
   */
  constructor(errorCode: ErrorCode, message?: string, details?: ErrorDetails) {
    // 메시지가 제공되지 않았다면 ErrorCode 객체의 기본 메시지 사용
    const errorMessage = message || errorCode.message

    // HttpException 생성자 호출
    super(errorMessage, errorCode.status)

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
    errorCode: string
    message: string
    timestamp: string
    details?: ErrorDetails
  } {
    return {
      statusCode: this.getStatus(),
      errorCode: this.errorCode.code,
      message: this.message,
      timestamp: this.timestamp,
      ...(this.details && { details: this.details }),
    }
  }

  /**
   * ErrorCode 객체 접근자
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
   * 기본 에러 코드만으로 비즈니스 예외를 생성하는 정적 팩토리 메서드
   */
  static fromCode(errorCode: ErrorCode): BusinessException {
    return new BusinessException(errorCode)
  }

  /**
   * 사용자 정의 메시지와 함께 비즈니스 예외를 생성하는 정적 팩토리 메서드
   */
  static fromMessage(errorCode: ErrorCode, message: string): BusinessException {
    return new BusinessException(errorCode, message)
  }

  /**
   * 상세 정보와 함께 비즈니스 예외를 생성하는 정적 팩토리 메서드
   */
  static fromDetails(
    errorCode: ErrorCode,
    details: ErrorDetails,
  ): BusinessException {
    return new BusinessException(errorCode, undefined, details)
  }

  /**
   * 사용자 정의 메시지와 상세 정보와 함께 비즈니스 예외를 생성하는 정적 팩토리 메서드
   */
  static fromMessageAndDetails(
    errorCode: ErrorCode,
    message: string,
    details: ErrorDetails,
  ): BusinessException {
    return new BusinessException(errorCode, message, details)
  }
}
