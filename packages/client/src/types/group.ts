export interface GetGroupUserRes {
  groupId: number
  groupName: string
  createdAt: Date
  memberCount: number
  isAdmin: boolean
}

export interface PostGroupReq {
  groupName: string
}

export interface PostGroupRes extends GetGroupUserRes {}

export interface GetGroupDetail extends GetGroupUserRes {
  members: {
    userUuid: string
    name: string
    isAdmin: boolean
    joinedAt: Date
  }[]
}

export enum GroupInvitationEnum {
  PENDING = '요청중',
}

export interface DeleteGroupUser {
  groupId: number
  memberUuid: string
}
