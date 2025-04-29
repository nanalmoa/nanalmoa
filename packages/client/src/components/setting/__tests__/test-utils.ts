import {
  IGroupInvitations,
  IManagerInvitations,
  InvitationTypeEnum,
  InvitationStatusEnum,
} from '@/types/invitations'

export const createMockInvitation = (
  type: InvitationTypeEnum,
  status: InvitationStatusEnum,
  overrides?: Partial<IGroupInvitations | IManagerInvitations>,
) => {
  const baseInvitation = {
    invitationId: 1,
    inviterUuid: 'inviter-123',
    inviteeUuid: 'invitee-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    inviterName: '홍길동',
    inviteeName: '김철수',
    status,
  }

  if (type === InvitationTypeEnum.Group) {
    return {
      ...baseInvitation,
      invitationType: InvitationTypeEnum.Group,
      groupId: 1,
      groupName: '테스트 그룹',
      ...overrides,
    } as IGroupInvitations
  }

  return {
    ...baseInvitation,
    invitationType: InvitationTypeEnum.Manager,
    ...overrides,
  } as IManagerInvitations
}
