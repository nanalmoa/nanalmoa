// src/invitations/dto/create-invitation.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { InvitationType } from '@/common/enums/invitation-type.enum'

export class CreateInvitationDto {
  @ApiProperty({
    enum: InvitationType,
    description: '초대 유형 (GROUP: 그룹 초대, MANAGER: 매니저 초대)',
    example: 'GROUP',
  })
  @IsEnum(InvitationType)
  @IsNotEmpty()
  invitationType: InvitationType

  @ApiProperty({
    description: '초대받는 사용자의 UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  inviteeUuid: string

  @ApiProperty({
    description: '그룹 ID (그룹 초대인 경우에만 필요)',
    required: false,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  groupId?: number
}
