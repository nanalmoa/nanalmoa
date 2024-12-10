import { ApiProperty } from '@nestjs/swagger'
import {
  IsDate,
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { GroupInfo, RecurringInfo } from './create-schedule.dto'

export class UpdateScheduleDto {
  @ApiProperty({
    description: '일정 시작 날짜 및 시간',
    example: '2024-10-15T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date

  @ApiProperty({
    description: '일정 종료 날짜 및 시간',
    example: '2024-10-15T01:00:00Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date

  @ApiProperty({
    description: '일정 제목',
    example: '팀 미팅',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({
    description: '일정 장소',
    example: '회의실 A',
    required: false,
  })
  @IsOptional()
  @IsString()
  place?: string

  @ApiProperty({
    description: '일정에 대한 메모',
    example: '프로젝트 진행 상황 논의',
    required: false,
  })
  @IsOptional()
  @IsString()
  memo?: string

  @ApiProperty({
    description: '종일 일정 여부',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean

  @ApiProperty({
    description: '일정 카테고리 ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number

  @ApiProperty({
    description: '반복 일정 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean

  @ApiProperty({
    description: '반복 일정 옵션',
    type: () => RecurringInfo,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringInfo)
  recurringOptions?: RecurringInfo

  @ApiProperty({
    description: '추가할 그룹 정보',
    type: [GroupInfo],
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GroupInfo)
  addGroupInfo?: GroupInfo[]

  @ApiProperty({
    description: '삭제할 그룹 정보',
    type: [GroupInfo],
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GroupInfo)
  deleteGroupInfo?: GroupInfo[]
}
