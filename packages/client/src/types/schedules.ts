import { Categories } from './category'

export type RecurringOptionValue =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'

export interface IGroupReq {
  groupId: number
  userUuids: string[]
}

export interface IGroupRes {
  groupId: number
  groupName: string
  users: {
    userUuid: string
    name: string
    profileImage: string
    email: string
    phoneNumber: string
  }[]
}

export interface ICategory {
  categoryId: number
  categoryName: Categories
}

export interface IRepeatInfo {
  recurringInterval?: number
  repeatEndDate?: Date
  recurringDaysOfWeek?: number[] | null
  recurringDayOfMonth?: number | null
  recurringMonthOfYear?: number | null
  repeatType?: RecurringOptionValue
  // groupInfo?: Array<IGroupReq>
}

export interface IRepeatInfoRes {
  dayOfMonth?: number | null
  daysOfWeek?: number[] | null
  interval?: number
  monthOfYear?: number | null
  repeatEndDate?: Date
  repeatType?: RecurringOptionValue
}

export interface ISchedule extends IRepeatInfo {
  scheduleId: number
  userUuid: string
  startDate: Date
  endDate: Date
  title: string
  place: string
  memo: string
  isAllDay: boolean
  category: ICategory
  isRecurring: boolean;
  groupInfo?: Array<IGroupRes>
  recurringInfo?: IRepeatInfoRes
}

export interface IMediaAnalysisResult extends IRepeatInfo {
  title: string
  place: string
  startDate: Date
  endDate: Date
  memo?: string
  isAllDay: boolean
  categoryId: number
  isRecurring: boolean
  repeatType: RecurringOptionValue
}

export interface GetScheduleByIdRes extends ISchedule {}

export interface GetSchedulesRes extends Array<ISchedule> {}

export interface PostUploadAudioFileReq {
  audio: File
  currentDateTime: Date
}

export interface PostUploadAudioFileRes extends Array<IMediaAnalysisResult> {}

export interface IPartialScheduleForm extends IRepeatInfo {
  startDate: Date
  endDate: Date
  title: string
  place: string
  memo: string
  isAllDay: boolean
  categoryId: number
  isRecurring: boolean
  recurringOptions: IRepeatInfo
  groupInfo?: Array<IGroupReq>
}

export interface PostSchedulesReq extends IRepeatInfo {
  startDate: Date
  endDate: Date
  title: string
  place?: string
  memo?: string
  isAllDay: boolean
  categoryId: number
  isRecurring: boolean
  repeatType?: RecurringOptionValue
  groupInfo?: Array<IGroupReq>
}

export interface PostSchedulesRes extends ISchedule {
  isGroupSchedule: boolean
}

export interface UpdateScheduleReq extends IRepeatInfo {
  categoryId?: number
  startDate?: Date
  endDate?: Date
  title?: string
  place?: string
  memo?: string
  isAllDay?: boolean
  isRecurring?: boolean
  addGroupInfo?: Array<IGroupReq>;
  deleteGroupInfo?: Array<IGroupReq>;
}

export interface UpdateScheduleRes extends ISchedule {}

export interface PostAnalyzeImageReq {
  image: File
  currentDateTime: Date
}

export interface PostAnalyzeImageRes extends Array<IMediaAnalysisResult> {}

