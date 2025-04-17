export interface IManagerUser {
  userUuid: string
  name: string
  profileImage: string
  email: string
  isManager: boolean
}

export interface IGetMyManagersRes extends Array<IManagerUser> {}

export interface IGetMySubordinatesRes extends Array<IManagerUser> {}
