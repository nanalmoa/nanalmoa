import {
  IsNotEmpty,
  IsDate,
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { Category } from '@/entities/category.entity'
import { UserInfo } from '@/modules/users/dto/user-info-detail.dto'

export class ResponseGroupInfo {
  @ApiProperty({
    description: '그룹 ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  groupId: number

  @ApiProperty({
    description: '그룹 이름',
    example: '개발팀'
  })
  @IsString()
  @IsNotEmpty()
  groupName: string

  @ApiProperty({
    description: '그룹에 속한 사용자 정보 배열',
    type: () => [UserInfo]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserInfo)
  users: UserInfo[]
}

export class RecurringInfoResponse {
  @ApiProperty({
    description: '반복 유형',
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    example: 'weekly'
  })
  @IsEnum(['none', 'daily', 'weekly', 'monthly', 'yearly'])
  @IsNotEmpty()
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

  @ApiProperty({
    description: '반복 종료 날짜',
    example: '2024-12-31T23:59:59Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  repeatEndDate: Date

  @ApiProperty({
    description: '반복 간격 (일/주/월/년 단위)',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  interval?: number

  @ApiProperty({
    description: '주간 반복 시 반복할 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)',
    example: [1, 3, 5],
    required: false
  })
  @IsArray()
  @IsOptional()
  daysOfWeek?: number[]

  @ApiProperty({
    description: '월간 반복 시 반복할 날짜',
    example: 15,
    required: false
  })
  @IsNumber()
  @IsOptional()
  dayOfMonth?: number

  @ApiProperty({
    description: '연간 반복 시 반복할 월 (0-11)',
    example: 5,
    required: false
  })
  @IsNumber()
  @IsOptional()
  monthOfYear?: number
}

export class ResponseScheduleDto {
  @ApiProperty({
    description: '일정 ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  scheduleId: number

  @ApiProperty({
    description: '사용자 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID('4')
  @IsNotEmpty()
  userUuid: string

  @ApiProperty({
    description: '일정 카테고리 정보',
    type: () => Category
  })
  @ValidateNested()
  @Type(() => Category)
  @IsNotEmpty()
  category: Category

  @ApiProperty({
    description: '일정 제목',
    example: '팀 미팅'
  })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({
    description: '일정 장소',
    example: '회의실 A',
    required: false
  })
  @IsString()
  @IsOptional()
  place: string

  @ApiProperty({
    description: '일정 메모',
    example: '프로젝트 진행 상황 논의',
    required: false
  })
  @IsString()
  @IsOptional()
  memo: string

  @ApiProperty({
    description: '일정 시작 날짜 및 시간',
    example: '2024-10-15T09:00:00Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date

  @ApiProperty({
    description: '일정 종료 날짜 및 시간',
    example: '2024-10-15T10:00:00Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date

  @ApiProperty({
    description: '종일 일정 여부',
    example: false
  })
  @IsBoolean()
  isAllDay: boolean

  @ApiProperty({
    description: '반복 일정 정보',
    type: () => RecurringInfoResponse,
    required: false
  })
  @ValidateNested()
  @Type(() => RecurringInfoResponse)
  @IsOptional()
  recurringInfo?: RecurringInfoResponse

  @ApiProperty({
    description: '그룹 정보',
    type: () => [ResponseGroupInfo],
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseGroupInfo)
  @IsOptional()
  groupInfo?: ResponseGroupInfo[]

  constructor(params: {
    scheduleId: number
    userUuid: string
    category: Category
    title?: string
    place?: string
    memo?: string
    startDate: Date
    endDate: Date
    isAllDay?: boolean
    recurring?: {
      repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
      repeatEndDate?: Date
      recurringInterval?: number
      recurringDaysOfWeek?: number[]
      recurringDayOfMonth?: number
      recurringMonthOfYear?: number
    }
    groupInfo?: ResponseGroupInfo[]
  }) {
    this.scheduleId = params.scheduleId
    this.userUuid = params.userUuid
    this.category = params.category
    this.title = params.title || ''
    this.place = params.place || ''
    this.memo = params.memo || ''
    this.startDate = params.startDate
    this.endDate = params.endDate
    this.isAllDay = params.isAllDay || false

    if (params.recurring) {
      this.recurringInfo = {
        repeatType: params.recurring.repeatType,
        repeatEndDate: params.recurring.repeatEndDate,
        interval: params.recurring.recurringInterval,
        daysOfWeek: params.recurring.recurringDaysOfWeek,
        dayOfMonth: params.recurring.recurringDayOfMonth,
        monthOfYear: params.recurring.recurringMonthOfYear,
      }
    }

    this.groupInfo = params.groupInfo
  }
}