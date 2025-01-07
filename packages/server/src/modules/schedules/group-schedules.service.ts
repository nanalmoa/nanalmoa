import { GroupSchedule } from '@/entities/group-schedule.entity'
import { Schedule } from '@/entities/schedule.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class GroupScheduleService {
  constructor(
    @InjectRepository(GroupSchedule)
    private groupScheduleRepository: Repository<GroupSchedule>,
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) {}

  /**
   * 특정 기간 내의 공유된 그룹 일정을 조회
   * @param userUuid 사용자 UUID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 공유된 그룹 일정 목록
   */
  async findSharedGroupSchedules(
    userUuid: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Schedule[]> {
    return this.schedulesRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.groupSchedules', 'groupSchedule')
      .where('groupSchedule.userUuid = :userUuid', { userUuid })
      .andWhere('schedule.startDate <= :endDate', { endDate })
      .andWhere('schedule.endDate >= :startDate', { startDate })
      .getMany()
  }

  /**
   * 특정 일정 ID로 공유된 그룹 일정을 조회
   * @param userUuid 사용자 UUID
   * @param scheduleId 일정 ID
   * @returns 공유된 그룹 일정
   */
  async findSharedGroupSchedulesByScheduleId(
    userUuid: string,
    scheduleId: number,
  ): Promise<Schedule> {
    return this.schedulesRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.groupSchedules', 'groupSchedule')
      .where('groupSchedule.userUuid = :userUuid', { userUuid })
      .andWhere('schedule.scheduleId = :scheduleId', { scheduleId })
      .getOne()
  }

  /**
   * 사용자를 그룹 일정에서 제거
   * @param userUuid 사용자 UUID
   * @param schedule 일정 정보
   */
  async removeUserFromFutureGroupSchedules(
    userUuid: string,
    schedule: Schedule,
  ): Promise<void> {
    await this.groupScheduleRepository.delete({
      schedule: { scheduleId: schedule.scheduleId },
      userUuid,
    })
  }
}
