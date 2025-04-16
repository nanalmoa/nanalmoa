export enum InvitationTypeEnum {
  Group = 'group',
  Manager = 'manager',
}

export enum InvitationRoleEnum {
  MANAGER = 'MANAGER',
  SUBORDINATE = 'SUBORDINATE',
  GROUP_ADMIN = 'GROUP_ADMIN',
  GROUP_MEMBER = 'GROUP_MEMBER',
}

export enum InvitationStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  REMOVED = 'REMOVED',
}

export interface IInvitation {
  sent: {
    groupInvitations: IGroupInvitations[]
    managerInvitations: IManagerInvitations[]
  }
  received: {
    groupInvitations: IGroupInvitations[]
    managerInvitations: IManagerInvitations[]
  }
}
export interface IGroupInvitations {
  invitationId: number
  invitationType: InvitationTypeEnum.Group
  status: InvitationStatusEnum
  inviterUuid: string
  inviteeUuid: string
  createdAt: Date
  updatedAt: Date
  inviterName: string
  inviteeName: string
  groupId: number
  groupName: string
}

export interface IManagerInvitations {
  invitationId: number
  invitationType: InvitationTypeEnum.Manager
  status: InvitationStatusEnum
  inviterUuid: string
  inviteeUuid: string
  createdAt: Date
  updatedAt: Date
  inviterName: string
  inviteeName: string
}

export interface IPostInvitation {
  invitationType: InvitationTypeEnum
  inviteeUuid: string
  groupId?: number
}

export interface GetInvitationsUserRes extends IInvitation {}

export interface IInvitationRes extends IManagerInvitations {
  groupId?: number
  groupName?: string
}
