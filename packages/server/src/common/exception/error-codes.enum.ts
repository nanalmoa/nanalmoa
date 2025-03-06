import { HttpStatus } from '@nestjs/common'

export class ErrorCode {
  // 생성자로 필요한 정보를 받음
  constructor(
    readonly status: HttpStatus,
    readonly code: string,
    readonly message: string,
  ) {}

  /**
   * Common Errors (C로 시작)
   */
  static readonly INVALID_INPUT_VALUE = new ErrorCode(
    HttpStatus.BAD_REQUEST,
    'C001',
    '잘못된 입력값입니다.',
  )
  static readonly INTERNAL_SERVER_ERROR = new ErrorCode(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'C002',
    '서버 에러가 발생했습니다.',
  )
  static readonly RESOURCE_NOT_FOUND = new ErrorCode(
    HttpStatus.NOT_FOUND,
    'C003',
    '요청한 리소스를 찾을 수 없습니다.',
  )
  static readonly METHOD_NOT_ALLOWED = new ErrorCode(
    HttpStatus.METHOD_NOT_ALLOWED,
    'C004',
    '허용되지 않은 메서드입니다.',
  )
  static readonly INVALID_TYPE_VALUE = new ErrorCode(
    HttpStatus.BAD_REQUEST,
    'C005',
    '잘못된 타입의 값입니다.',
  )
  static readonly HANDLE_ACCESS_DENIED = new ErrorCode(
    HttpStatus.FORBIDDEN,
    'C006',
    '접근이 거부되었습니다.',
  )

  /**
   * Authentication Errors (A로 시작)
   */
  static readonly UNAUTHORIZED = new ErrorCode(
    HttpStatus.UNAUTHORIZED,
    'A001',
    '인증이 필요합니다.',
  )
  static readonly INVALID_CREDENTIALS = new ErrorCode(
    HttpStatus.UNAUTHORIZED,
    'A002',
    '잘못된 인증 정보입니다.',
  )
  static readonly ACCOUNT_LOCKED = new ErrorCode(
    HttpStatus.UNAUTHORIZED,
    'A003',
    '계정이 잠겼습니다.',
  )

  /**
   * JWT Token Errors (J로 시작)
   */
  static readonly JWT_SIGNATURE_INVALID = new ErrorCode(
    HttpStatus.UNAUTHORIZED,
    'J001',
    '유효하지 않은 JWT 서명입니다.',
  )
  static readonly JWT_TOKEN_EXPIRED = new ErrorCode(
    HttpStatus.UNAUTHORIZED,
    'J002',
    '만료된 JWT 토큰입니다.',
  )
  static readonly JWT_TOKEN_UNSUPPORTED = new ErrorCode(
    HttpStatus.UNAUTHORIZED,
    'J003',
    '지원되지 않는 JWT 토큰 형식입니다.',
  )
  static readonly JWT_TOKEN_MALFORMED = new ErrorCode(
    HttpStatus.UNAUTHORIZED,
    'J004',
    '잘못된 형식의 JWT 토큰입니다.',
  )
  static readonly JWT_TOKEN_MISSING = new ErrorCode(
    HttpStatus.UNAUTHORIZED,
    'J005',
    'JWT 토큰이 제공되지 않았습니다.',
  )

  /**
   * User Errors (U로 시작)
   */
  static readonly USER_NOT_FOUND = new ErrorCode(
    HttpStatus.NOT_FOUND,
    'U001',
    '사용자를 찾을 수 없습니다.',
  )
  static readonly USER_ALREADY_EXISTS = new ErrorCode(
    HttpStatus.CONFLICT,
    'U002',
    '이미 존재하는 사용자입니다.',
  )
  static readonly USER_EMAIL_DUPLICATED = new ErrorCode(
    HttpStatus.CONFLICT,
    'U003',
    '이미 사용 중인 이메일입니다.',
  )

  /**
   * Schedule Errors (S로 시작)
   */
  static readonly SCHEDULE_NOT_FOUND = new ErrorCode(
    HttpStatus.NOT_FOUND,
    'S001',
    '일정을 찾을 수 없습니다.',
  )
  static readonly SCHEDULE_ALREADY_EXISTS = new ErrorCode(
    HttpStatus.CONFLICT,
    'S002',
    '이미 존재하는 일정입니다.',
  )
  static readonly SCHEDULE_INVALID_DATE_RANGE = new ErrorCode(
    HttpStatus.BAD_REQUEST,
    'S003',
    '유효하지 않은 일정 기간입니다.',
  )
  static readonly SCHEDULE_INVALID_RECURRING_CONFIG = new ErrorCode(
    HttpStatus.BAD_REQUEST,
    'S004',
    '유효하지 않은 반복 일정 설정입니다.',
  )
  static readonly SCHEDULE_ACCESS_DENIED = new ErrorCode(
    HttpStatus.FORBIDDEN,
    'S005',
    '해당 일정에 대한 접근 권한이 없습니다.',
  )
}
