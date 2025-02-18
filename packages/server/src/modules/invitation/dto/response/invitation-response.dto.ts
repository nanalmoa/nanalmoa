import { ApiProperty } from '@nestjs/swagger'
import { InvitationType } from '@/common/enums/invitation-type.enum'
import { InvitationStatus } from '@/common/enums/invitation-status.enum'

export class InvitationResponseDto {
  @ApiProperty({
    example: 1,
    description: '초대장 ID',
  })
  invitationId: number

  @ApiProperty({
    enum: InvitationType,
    example: 'GROUP',
    description: '초대 유형 (GROUP/MANAGER)',
  })
  invitationType: InvitationType

  @ApiProperty({
    enum: InvitationStatus,
    example: 'PENDING',
    description: '초대 상태',
  })
  status: InvitationStatus

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: '초대한 사용자 UUID',
  })
  inviterUuid: string

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: '초대받은 사용자 UUID',
  })
  inviteeUuid: string

  @ApiProperty({
    example: 1,
    description: '그룹 ID (그룹 초대인 경우)',
    required: false,
  })
  groupId?: number

  @ApiProperty({
    example: '2024-02-12T12:00:00Z',
    description: '초대장 생성 시간',
  })
  createdAt: Date

  @ApiProperty({
    example: '2024-02-12T12:00:00Z',
    description: '초대장 수정 시간',
  })
  updatedAt: Date

  @ApiProperty({
    example: '홍길동',
    description: '초대한 사용자 이름',
    required: false,
  })
  inviterName?: string

  @ApiProperty({
    example: '김철수',
    description: '초대받은 사용자 이름',
    required: false,
  })
  inviteeName?: string

  @ApiProperty({
    example: '개발팀',
    description: '그룹 이름 (그룹 초대인 경우)',
    required: false,
  })
  groupName?: string
}
