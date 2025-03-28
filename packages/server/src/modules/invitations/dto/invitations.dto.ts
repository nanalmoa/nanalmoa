import { InvitationStatus } from '@/common/enums/invitation-status.enum'
import { ApiProperty } from '@nestjs/swagger'

export enum InvitationsType {
  GROUP = 'GROUP',
  MANAGER = 'MANAGER',
}

export enum InvitationsRole {
  GROUP_ADMIN = 'GROUP_ADMIN',
  GROUP_MEMBER = 'GROUP_MEMBER',
  MANAGER = 'MANAGER',
  SUBORDINATE = 'SUBORDINATE',
}

export class InvitationsDto {
  @ApiProperty() id: number
  @ApiProperty({ enum: InvitationsType }) type: InvitationsType
  @ApiProperty({ enum: InvitationsRole }) role: InvitationsRole
  @ApiProperty({ enum: InvitationStatus }) status: InvitationStatus
  @ApiProperty() createdAt: Date
  @ApiProperty() updatedAt: Date
  @ApiProperty() inviterUuid: string
  @ApiProperty() inviterName: string
  @ApiProperty() inviteeUuid: string
  @ApiProperty() inviteeName: string
  @ApiProperty({ required: false }) groupId?: number
  @ApiProperty({ required: false }) groupName?: string
}
