import { GroupSchedule } from '@/entities/group-schedule.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  ResponseGroupInfo,
  ResponseScheduleDto,
} from './dto/response-schedule.dto'
import { Schedule } from '@/entities/schedule.entity'
import { Period } from './types/period.enum'
import { DateRangeParams } from './types/date-range-params.interface'
import { DateRange } from './types/date-range.interface'

@Injectable()
export class ScheduleUtils {
  constructor(
    @InjectRepository(GroupSchedule)
    private readonly groupScheduleRepository: Repository<GroupSchedule>,
  ) {}

  /**
   * Schedule 엔티티를 ResponseScheduleDto로 변환합니다.
   * 그룹 일정 정보도 함께 포함됩니다.
   * @param schedule 변환할 Schedule 엔티티
   * @returns ResponseScheduleDto 형태로 변환된 일정 정보
   */
  public async convertToResponseDto(
    schedule: Schedule,
  ): Promise<ResponseScheduleDto> {
    const groupSchedules = await this.groupScheduleRepository.find({
      where: { schedule: { scheduleId: schedule.scheduleId } },
      relations: ['group', 'user'],
    })

    const groupInfo = this.mapGroupSchedulesToGroupInfo(groupSchedules)

    return new ResponseScheduleDto({
      scheduleId: schedule.scheduleId,
      userUuid: schedule.userUuid,
      category: schedule.category,
      title: schedule.title,
      place: schedule.place,
      memo: schedule.memo,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      isAllDay: schedule.isAllDay,
      recurring: schedule.recurring,
      groupInfo: groupInfo.length > 0 ? groupInfo : undefined,
    })
  }

  /**
   * GroupSchedule 배열을 ResponseGroupInfo 배열로 변환합니다.
   * @param groupSchedules 변환할 GroupSchedule 배열
   * @returns 그룹 정보가 담긴 ResponseGroupInfo 배열
   */
  private mapGroupSchedulesToGroupInfo(
    groupSchedules: GroupSchedule[],
  ): ResponseGroupInfo[] {
    const groupMap = new Map<number, ResponseGroupInfo>()

    groupSchedules.forEach((groupSchedule) => {
      const { group, user } = groupSchedule
      if (!groupMap.has(group.groupId)) {
        groupMap.set(group.groupId, {
          groupId: group.groupId,
          groupName: group.groupName,
          users: [],
        })
      }
      groupMap.get(group.groupId).users.push({
        userUuid: user.userUuid,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
      })
    })

    return Array.from(groupMap.values())
  }

  /**
   * 주어진 기간 유형과 params에 따라 날짜 범위를 계산합니다.
   * @param period 기간 유형 (일/주/월/년)
   * @param params 날짜 범위 계산에 필요한 파라미터
   * @returns 시작일과 종료일이 포함된 DateRange 객체
   */
  public calculateDateRange(
    period: Period,
    params: DateRangeParams,
  ): DateRange {
    switch (period) {
      case Period.DAY:
        return this.calculateDailyRange(new Date(params.date))
      case Period.WEEK:
        return this.calculateWeeklyRange(new Date(params.date))
      case Period.MONTH:
        return this.calculateMonthlyRange(params.year, params.month)
      case Period.YEAR:
        return this.calculateYearlyRange(params.year)
      default:
        throw new Error('Invalid Period!')
    }
  }

  /**
   * 종일 일정의 시작 및 종료 시간을 조정합니다.
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 조정된 시작 및 종료 날짜가 포함된 DateRange
   */
  public adjustDateForAllDay(startDate: Date, endDate: Date): Date[] {
    return [
      new Date(startDate.setUTCHours(0, 0, 0, 0)),
      new Date(endDate.setUTCHours(23, 59, 59, 999)),
    ]
  }

  /**
   * 하루 동안의 날짜 범위를 계산합니다.
   * @param date 기준 날짜
   * @returns 해당 날짜의 시작(00:00:00)과 끝(23:59:59)을 포함하는 DateRange
   */
  public calculateDailyRange(date: Date): DateRange {
    const startDate = new Date(date)
    startDate.setUTCHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setUTCHours(23, 59, 59, 999)

    return { startDate, endDate }
  }

  /**
   * 일주일 동안의 날짜 범위를 계산합니다.
   * 월요일부터 일요일까지를 한 주로 계산합니다.
   * @param date 기준 날짜
   * @returns 해당 주의 월요일부터 일요일까지의 DateRange
   */
  public calculateWeeklyRange(date: Date): DateRange {
    const startDate = new Date(date)
    startDate.setUTCHours(0, 0, 0, 0)

    const dayOfWeek = startDate.getDay()
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startDate.setDate(date.getDate() + daysToMonday)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setUTCHours(23, 59, 59, 999)

    return { startDate, endDate }
  }

  /**
   * 한 달 동안의 날짜 범위를 계산합니다.
   * @param year 연도
   * @param month 월(1-12)
   * @returns 해당 월의 첫날부터 마지막 날까지의 DateRange
   */
  public calculateMonthlyRange(year: number, month: number): DateRange {
    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
    return { startDate, endDate }
  }

  /**
   * 일년 동안의 날짜 범위를 계산합니다.
   * @param year 연도
   * @returns 해당 연도의 1월 1일부터 12월 31일까지의 DateRange
   */
  public calculateYearlyRange(year: number): DateRange {
    const startDate = new Date(Date.UTC(year, 0, 1))
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
    return { startDate, endDate }
  }
}
