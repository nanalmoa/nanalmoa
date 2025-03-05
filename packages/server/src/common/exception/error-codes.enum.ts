import { HttpStatus } from '@nestjs/common'

/**
 * 서비스 에러 코드 형식:
 * - 첫 글자: 서비스 영역 (G: 글로벌, A: 인증/인가, U: 사용자, S: 스케줄, P: 결제, N: 알림 등)
 * - 세 자리 숫자: 해당 서비스 내의 에러 번호
 */
export enum ErrorCode {
  // 글로벌/시스템 관련 에러 (G000 ~ G999)
  G000 = 'G000', // 알 수 없는 시스템 에러
  G001 = 'G001', // 예상치 못한 에러
  G002 = 'G002', // 데이터베이스 에러
  G003 = 'G003', // 외부 API 에러

  // 인증/인가 관련 에러 (A000 ~ A999)
  A000 = 'A000', // 일반 인증 에러
  A001 = 'A001', // 유효하지 않은 토큰
  A002 = 'A002', // 토큰 만료
  A003 = 'A003', // 권한 부족

  // 사용자 관련 에러 (U000 ~ U999)
  U000 = 'U000', // 일반 사용자 에러
  U001 = 'U001', // 사용자 없음
  U002 = 'U002', // 중복된 사용자

  // 스케줄 관련 에러 (S000 ~ S999)
  S000 = 'S000', // 일반 스케줄 에러
  S001 = 'S001', // 스케줄 없음
  S002 = 'S002', // 중복된 스케줄

  // 입력값 검증 관련 에러 (V000 ~ V999)
  V000 = 'V000', // 일반 검증 에러
  V001 = 'V001', // 유효하지 않은 입력
  V002 = 'V002', // 필수 필드 누락
}

// HTTP 상태 코드와 에러 코드 매핑
export const ErrorHttpStatusMap: Record<ErrorCode, HttpStatus> = {
  // 글로벌/시스템 관련 에러
  [ErrorCode.G000]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.G001]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.G002]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.G003]: HttpStatus.BAD_GATEWAY,

  // 인증/인가 관련 에러
  [ErrorCode.A000]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.A001]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.A002]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.A003]: HttpStatus.FORBIDDEN,

  // 사용자 관련 에러
  [ErrorCode.U000]: HttpStatus.BAD_REQUEST,
  [ErrorCode.U001]: HttpStatus.NOT_FOUND,
  [ErrorCode.U002]: HttpStatus.CONFLICT,

  // 스케줄 관련 에러
  [ErrorCode.S000]: HttpStatus.BAD_REQUEST,
  [ErrorCode.S001]: HttpStatus.NOT_FOUND,
  [ErrorCode.S002]: HttpStatus.CONFLICT,

  // 입력값 검증 관련 에러
  [ErrorCode.V000]: HttpStatus.BAD_REQUEST,
  [ErrorCode.V001]: HttpStatus.BAD_REQUEST,
  [ErrorCode.V002]: HttpStatus.BAD_REQUEST,
}

// 에러 메시지 매핑
export const ErrorMessageMap: Record<ErrorCode, string> = {
  // 글로벌/시스템 관련 에러
  [ErrorCode.G000]: '시스템 오류가 발생했습니다.',
  [ErrorCode.G001]: '예상치 못한 오류가 발생했습니다.',
  [ErrorCode.G002]: '데이터베이스 오류가 발생했습니다.',
  [ErrorCode.G003]: '외부 API 호출 중 오류가 발생했습니다.',

  // 인증/인가 관련 에러
  [ErrorCode.A000]: '인증이 필요합니다.',
  [ErrorCode.A001]: '유효하지 않은 토큰입니다.',
  [ErrorCode.A002]: '토큰이 만료되었습니다.',
  [ErrorCode.A003]: '접근 권한이 없습니다.',

  // 사용자 관련 에러
  [ErrorCode.U000]: '사용자 관련 오류가 발생했습니다.',
  [ErrorCode.U001]: '사용자를 찾을 수 없습니다.',
  [ErrorCode.U002]: '이미 존재하는 사용자입니다.',

  // 스케줄 관련 에러
  [ErrorCode.S000]: '스케줄 관련 오류가 발생했습니다.',
  [ErrorCode.S001]: '스케줄을 찾을 수 없습니다.',
  [ErrorCode.S002]: '중복된 스케줄이 존재합니다.',

  // 입력값 검증 관련 에러
  [ErrorCode.V000]: '입력값 검증에 실패했습니다.',
  [ErrorCode.V001]: '유효하지 않은 입력값입니다.',
  [ErrorCode.V002]: '필수 필드가 누락되었습니다.',
}
