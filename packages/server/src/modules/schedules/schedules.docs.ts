import { applyDecorators } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { ResponseScheduleDto } from './dto/response-schedule.dto'
import { VoiceScheduleUploadDto } from './dto/voice-schedule-upload.dto'
import { OCRScheduleUploadDto } from './dto/ocr-schedule-upload.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'

export function ApplySchedulesDocs() {
  return applyDecorators(ApiTags('Schedules'), ApiBearerAuth('Access-Token'))
}

export function GetSchedulesByDateDocs() {
  return applyDecorators(
    ApiOperation({ summary: '특정 일의 일정 조회' }),
    ApiQuery({
      name: 'userUuid',
      required: false,
      type: String,
      description: '사용자의 UUID. 미입력시 본인 일정 조회',
    }),
    ApiQuery({
      name: 'date',
      required: true,
      type: String,
      description: '조회할 날짜 (YYYY-MM-DD)',
    }),
    ApiResponse({
      status: 200,
      description: '일정 조회 성공',
      type: [ResponseScheduleDto],
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '유효하지 않은 날짜 형식입니다.',
          },
        },
      },
    }),
  )
}

export function GetSchedulesByWeekDocs() {
  return applyDecorators(
    ApiOperation({ summary: '특정 주의 일정 조회' }),
    ApiQuery({
      name: 'userUuid',
      required: false,
      type: String,
      description: '사용자의 UUID',
    }),
    ApiQuery({
      name: 'date',
      required: true,
      type: String,
      description: '조회할 주 날짜 (YYYY-MM-DD)',
    }),
    ApiResponse({
      status: 200,
      description: '일정 조회 성공',
      type: [ResponseScheduleDto],
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '유효하지 않은 날짜 형식입니다.',
          },
        },
      },
    }),
  )
}

export function GetSchedulesByMonthDocs() {
  return applyDecorators(
    ApiOperation({ summary: '특정 월의 일정 조회' }),
    ApiQuery({
      name: 'userUuid',
      required: false,
      type: String,
      description: '사용자의 UUID',
    }),
    ApiQuery({
      name: 'year',
      required: true,
      type: Number,
      description: '조회할 연도',
    }),
    ApiQuery({
      name: 'month',
      required: true,
      type: Number,
      description: '조회할 월 (1-12)',
    }),
    ApiResponse({
      status: 200,
      description: '일정 조회 성공',
      type: [ResponseScheduleDto],
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '유효하지 않은 연도 또는 월입니다.',
          },
        },
      },
    }),
  )
}

export function GetSchedulesByYearDocs() {
  return applyDecorators(
    ApiOperation({ summary: '특정 연도의 일정 조회' }),
    ApiQuery({
      name: 'userUuid',
      required: false,
      type: String,
      description: '사용자의 UUID',
    }),
    ApiQuery({
      name: 'year',
      required: true,
      type: Number,
      description: '조회할 연도',
    }),
    ApiResponse({
      status: 200,
      description: '일정 조회 성공',
      type: [ResponseScheduleDto],
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '유효하지 않은 연도입니다.',
          },
        },
      },
    }),
  )
}

export function GetSchedulesByDateRangeDocs() {
  return applyDecorators(
    ApiOperation({ summary: '특정 날짜 범위의 일정 조회' }),
    ApiQuery({
      name: 'userUuid',
      required: false,
      type: String,
      description: '피관리자의 UUID (없으면 본인의 일정 조회)',
    }),
    ApiQuery({
      name: 'startDate',
      required: true,
      type: String,
      description: '시작 날짜 (YYYY-MM-DD)',
    }),
    ApiQuery({
      name: 'endDate',
      required: true,
      type: String,
      description: '종료 날짜 (YYYY-MM-DD)',
    }),
    ApiResponse({
      status: 200,
      description: '일정 조회 성공',
      type: [ResponseScheduleDto],
    }),
  )
}

export function GetAllSchedulesDocs() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자의 모든 일정 조회',
      description: '사용자의 반복 일정을 포함한 전후 1년의 일정을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '일정 조회 성공',
      type: [ResponseScheduleDto],
    }),
  )
}

export function GetScheduleByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: '일정 ID로 조회',
      description:
        '지정된 ID로 일정을 조회합니다. 반복 일정의 경우 첫 일정만 조회됩니다.',
    }),
    ApiResponse({
      status: 200,
      description: '일정 조회 성공',
      type: ResponseScheduleDto,
    }),
    ApiResponse({
      status: 404,
      description: '일정을 찾을 수 없음',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '해당 ID의 일정을 찾을 수 없습니다.',
          },
        },
      },
    }),
  )
}

export function CreateScheduleDocs() {
  return applyDecorators(
    ApiOperation({
      summary: '새 일정 생성 (일반 및 반복)',
      description: '새로운 일정을 생성합니다. 반복 일정도 이 API를 사용합니다.',
    }),
    ApiResponse({
      status: 201,
      description: '일정이 성공적으로 생성됨',
      type: ResponseScheduleDto,
    }),
  )
}

export function UpdateScheduleDocs() {
  return applyDecorators(
    ApiOperation({
      summary: '일정 수정',
      description:
        '기존 일정을 수정합니다. 단일 일정 또는 이후 모든 일정을 수정할 수 있습니다.',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: '수정할 일정의 ID',
    }),
    ApiQuery({
      name: 'instanceDate',
      required: true,
      type: String,
      description: '수정할 인스턴스의 날짜 (YYYY-MM-DD)',
    }),
    ApiQuery({
      name: 'updateType',
      required: false,
      type: String,
      enum: ['single', 'future'],
      description: '수정 유형 (단일 또는 이후 모든 일정)',
    }),
    ApiBody({ type: UpdateScheduleDto }),
    ApiResponse({
      status: 200,
      description: '일정이 성공적으로 수정됨',
      type: ResponseScheduleDto,
    }),
  )
}

export function DeleteScheduleDocs() {
  return applyDecorators(
    ApiOperation({ summary: '일정 삭제' }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: '삭제할 일정의 ID',
    }),
    ApiQuery({
      name: 'userUuid',
      required: false,
      type: String,
      description: '사용자의 UUID',
    }),
    ApiQuery({
      name: 'instanceDate',
      required: true,
      type: String,
      description: '삭제할 인스턴스의 날짜 (YYYY-MM-DD)',
    }),
    ApiQuery({
      name: 'deleteType',
      required: false,
      type: String,
      enum: ['single', 'future'],
      description: '삭제 유형 (단일 또는 이후 모든 일정)',
    }),
    ApiResponse({
      status: 200,
      description: '일정 삭제 성공',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '일정이 성공적으로 삭제되었습니다.',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '유효하지 않은 요청입니다.',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: '일정을 찾을 수 없음',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '해당 일정을 찾을 수 없습니다.',
          },
        },
      },
    }),
  )
}

export function UploadVoiceScheduleRTZRDocs() {
  return applyDecorators(
    ApiOperation({ summary: '음성 파일 업로드 및 일정 추출 (RTZR)' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: VoiceScheduleUploadDto }),
    ApiResponse({
      status: 200,
      description: '추출된 일정 정보',
      type: [CreateScheduleDto],
    }),
  )
}

export function UploadVoiceScheduleWhisperDocs() {
  return applyDecorators(
    ApiOperation({ summary: '음성 파일 업로드 및 일정 추출 (Whisper)' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: VoiceScheduleUploadDto }),
    ApiResponse({
      status: 200,
      description: '추출된 일정 정보',
      type: [CreateScheduleDto],
    }),
  )
}

export function UploadImageScheduleDocs() {
  return applyDecorators(
    ApiOperation({ summary: '이미지 파일 업로드 및 일정 추출' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: OCRScheduleUploadDto }),
    ApiResponse({
      status: 200,
      description: '추출된 일정 정보',
      type: [CreateScheduleDto],
    }),
  )
}
