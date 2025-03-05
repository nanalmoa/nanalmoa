import { ApiProperty } from '@nestjs/swagger'
import { ErrorCode } from './error-codes.enum'

// 필드 에러를 위한 인터페이스
export interface FieldError {
  field: string
  message: string
}

// 유효성 검증 에러 상세 정보를 위한 인터페이스
export interface ValidationErrorDetails {
  fieldErrors: FieldError[]
}

// 에러 상세 정보의 타입 유니온
export type ErrorDetails = ValidationErrorDetails | Record<string, unknown>

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400,
  })
  statusCode: number

  @ApiProperty({
    description: '서비스 자체 에러 코드',
    example: 'V001',
    enum: ErrorCode,
  })
  errorCode: ErrorCode

  @ApiProperty({
    description: '에러 메시지',
    example: '유효하지 않은 입력값입니다.',
  })
  message: string

  @ApiProperty({
    description: '에러 발생 시간',
    example: '2023-10-31T12:34:56.789Z',
  })
  timestamp: string

  @ApiProperty({
    description: '상세 에러 내용 (선택적)',
    required: false,
    example: {
      fieldErrors: [
        {
          field: 'email',
          message: '유효한 이메일 형식이 아닙니다.',
        },
      ],
    },
  })
  details?: ErrorDetails

  constructor(
    statusCode: number,
    errorCode: ErrorCode,
    message: string,
    details?: ErrorDetails,
  ) {
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.message = message
    this.timestamp = new Date().toISOString()

    if (details) {
      this.details = details
    }
  }

  /**
   * 에러 응답 객체를 생성하는 정적 팩토리 메서드
   */
  static create(
    statusCode: number,
    errorCode: ErrorCode,
    message: string,
    details?: ErrorDetails,
  ): ErrorResponseDto {
    return new ErrorResponseDto(statusCode, errorCode, message, details)
  }

  /**
   * 유효성 검증 에러에 대한 응답을 생성하는 팩토리 메서드
   */
  static createValidationError(
    statusCode: number,
    errorCode: ErrorCode,
    message: string,
    fieldErrors: FieldError[],
  ): ErrorResponseDto {
    return new ErrorResponseDto(statusCode, errorCode, message, { fieldErrors })
  }
}
