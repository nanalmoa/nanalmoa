import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsEnum, IsOptional, IsNumber } from 'class-validator'
import { InvitationType } from '@/common/enums/invitation-type.enum'

export class CreateInvitationDto {
  @ApiProperty({ enum: InvitationType })
  @IsEnum(InvitationType)
  invitationType: InvitationType

  @ApiProperty()
  @IsUUID()
  inviteeUuid: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  groupId?: number
}
