import {
  IsNotEmpty,
  IsDate,
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateIf,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class RecurringInfo {
  @ApiProperty({
    description: '반복 유형',
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    example: 'weekly',
  })
  @IsEnum(['none', 'daily', 'weekly', 'monthly', 'yearly'])
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

  @ApiProperty({
    description: '반복 종료 날짜',
    example: '2024-11-02T23:59:59Z',
  })
  @IsNotEmpty({ message: '반복 일정의 경우 반복 종료 날짜는 필수입니다.' })
  @Type(() => Date)
  @IsDate()
  repeatEndDate: Date

  @ApiProperty({
    description: '반복 간격 (일/주/월/년 단위)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  recurringInterval?: number

  @ApiProperty({
    description:
      '주간 반복 시 반복할 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)',
    example: [2, 4],
    required: false,
  })
  @IsArray()
  @IsOptional()
  recurringDaysOfWeek?: number[]

  @ApiProperty({
    description: '월간 반복 시 반복할 날짜',
    example: 15,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  recurringDayOfMonth?: number

  @ApiProperty({
    description: '연간 반복 시 반복할 월 (0-11)',
    example: 5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  recurringMonthOfYear?: number
}

export class GroupInfo {
  @ApiProperty({
    description: '그룹 ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  groupId: number

  @ApiProperty({
    description: '그룹에 속한 사용자 UUID 배열',
    example: ['9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  userUuids: string[]
}

export class CreateScheduleDto {
  @ApiProperty({
    description: '일정 시작 날짜 및 시간',
    example: '2024-10-15T00:00:00Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date

  @ApiProperty({
    description: '일정 종료 날짜 및 시간',
    example: '2024-10-15T01:00:00Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date

  @ApiProperty({
    description: '일정 제목',
    example: '팀 미팅',
    default: '새로운 일정',
  })
  @IsString()
  @IsOptional()
  title?: string = '새로운 일정'

  @ApiProperty({
    description: '일정 장소',
    example: '회의실 A',
    required: false,
  })
  @IsString()
  @IsOptional()
  place?: string = ''

  @ApiProperty({
    description: '일정에 대한 메모',
    example: '프로젝트 진행 상황 논의',
    required: false,
  })
  @IsString()
  @IsOptional()
  memo?: string = ''

  @ApiProperty({
    description: '종일 일정 여부',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean = false

  @ApiProperty({
    description: '일정 카테고리 ID',
    example: 1,
    default: 7,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number = 7

  @ApiProperty({ description: '반복 일정 여부', example: true })
  @IsBoolean()
  isRecurring: boolean = false

  @ApiProperty({
    description: '반복 일정 옵션',
    type: () => RecurringInfo,
    required: false,
  })
  @ValidateNested()
  @Type(() => RecurringInfo)
  @IsOptional()
  recurringOptions?: RecurringInfo

  @ApiProperty({
    description: '그룹 정보 배열',
    type: [GroupInfo],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupInfo)
  @IsOptional()
  groupInfo?: GroupInfo[]
}
