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
    example: 'C001',
  })
  errorCode: string

  @ApiProperty({
    description: '에러 메시지',
    example: '잘못된 입력값입니다.',
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
    errorCode: string,
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
   * ErrorCode 객체로부터 에러 응답 객체를 생성하는 정적 팩토리 메서드
   */
  static fromErrorCode(
    errorCode: ErrorCode,
    details?: ErrorDetails,
  ): ErrorResponseDto {
    return new ErrorResponseDto(
      errorCode.status,
      errorCode.code,
      errorCode.message,
      details,
    )
  }

  /**
   * 사용자 정의 메시지와 함께 에러 응답 객체를 생성하는 정적 팩토리 메서드
   */
  static fromErrorCodeWithMessage(
    errorCode: ErrorCode,
    message: string,
    details?: ErrorDetails,
  ): ErrorResponseDto {
    return new ErrorResponseDto(
      errorCode.status,
      errorCode.code,
      message,
      details,
    )
  }

  /**
   * 유효성 검증 에러에 대한 응답을 생성하는 팩토리 메서드
   */
  static createValidationError(fieldErrors: FieldError[]): ErrorResponseDto {
    return ErrorResponseDto.fromErrorCode(ErrorCode.INVALID_INPUT_VALUE, {
      fieldErrors,
    })
  }
}
