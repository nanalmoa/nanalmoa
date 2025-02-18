// src/invitations/dto/response/invitations-response.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { InvitationResponseDto } from './invitation-response.dto'

/**
 * 그룹 및 매니저 초대 그룹화 DTO
 */
export class InvitationGroup {
  @ApiProperty({
    type: [InvitationResponseDto],
    description: '그룹 초대 목록',
    example: [
      {
        invitationId: 1,
        invitationType: 'GROUP',
        status: 'PENDING',
        inviterUuid: '550e8400-e29b-41d4-a716-446655440000',
        inviteeUuid: '550e8400-e29b-41d4-a716-446655440001',
        groupId: 1,
        createdAt: '2024-02-12T12:00:00Z',
        updatedAt: '2024-02-12T12:00:00Z',
        inviterName: '홍길동',
        inviteeName: '김철수',
        groupName: '개발팀',
      },
    ],
  })
  groupInvitations: InvitationResponseDto[]

  @ApiProperty({
    type: [InvitationResponseDto],
    description: '매니저 초대 목록',
    example: [
      {
        invitationId: 2,
        invitationType: 'MANAGER',
        status: 'PENDING',
        inviterUuid: '550e8400-e29b-41d4-a716-446655440000',
        inviteeUuid: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2024-02-12T13:00:00Z',
        updatedAt: '2024-02-12T14:00:00Z',
        inviterName: '홍길동',
        inviteeName: '이영희',
      },
    ],
  })
  managerInvitations: InvitationResponseDto[]
}

/**
 * 전체 초대 목록 응답 DTO
 */
export class InvitationsResponseDto {
  @ApiProperty({
    type: InvitationGroup,
    description: '보낸 초대 목록',
  })
  sent: {
    groupInvitations: InvitationResponseDto[]
    managerInvitations: InvitationResponseDto[]
  }

  @ApiProperty({
    type: InvitationGroup,
    description: '받은 초대 목록',
  })
  received: {
    groupInvitations: InvitationResponseDto[]
    managerInvitations: InvitationResponseDto[]
  }
}
