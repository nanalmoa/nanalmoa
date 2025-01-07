import { ScheduleRecurring } from '@/entities/recurring-schedule.entity'
import { Schedule } from '@/entities/schedule.entity'
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import OpenAI from 'openai'
import { Repository } from 'typeorm'
import { GroupService } from '../group/group.service'
import { VoiceTranscriptionService } from './voice-transcription.service'
import { UsersService } from '../users/users.service'
import { GroupSchedule } from '@/entities/group-schedule.entity'
import { ResponseScheduleDto } from './dto/response-schedule.dto'
import { WeekQueryDto } from './dto/week-query-schedule.dto'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { Category } from '@/entities/category.entity'
import { Transactional } from 'typeorm-transactional'
import { RecurringSchedulesService } from './recurring-schedules.service'
import { ScheduleUtils } from './schedules.util'
import { GroupScheduleService } from './group-schedules.service'

@Injectable()
export class SchedulesService {
  private openai: OpenAI
  private readonly logger = new Logger(SchedulesService.name)

  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(ScheduleRecurring)
    private recurringRepository: Repository<ScheduleRecurring>,
    private readonly configService: ConfigService,
    private readonly voiceTranscriptionService: VoiceTranscriptionService,
    private readonly usersService: UsersService,
    @InjectRepository(GroupSchedule)
    private groupScheduleRepository: Repository<GroupSchedule>,
    private groupService: GroupService,
    private readonly recurringSchedulesService: RecurringSchedulesService,
    private readonly scheduleUtils: ScheduleUtils,
    private readonly groupScheduleService: GroupScheduleService,
  ) {}

  /**
   * 사용자의 모든 일정을 조회
   * @param userUuid 사용자 UUID
   * @returns 모든 일정 목록
   */
  async findAllByUserUuid(userUuid: string): Promise<ResponseScheduleDto[]> {
    const startDate = new Date(Date.UTC(2000, 0, 1))
    const endDate = new Date(Date.UTC(2100, 11, 31, 23, 59, 59, 999))
    return this.getSchedulesInRange(userUuid, startDate, endDate)
  }

  /**
   * 특정 월의 일정을 조회
   * @param userUuid 사용자 UUID
   * @param year 연도
   * @param month 월
   * @returns 해당 월의 일정 목록
   */
  async findByMonth(
    userUuid: string,
    year: number,
    month: number,
  ): Promise<ResponseScheduleDto[]> {
    await this.usersService.getUserByUuid(userUuid)
    const dateRange = this.scheduleUtils.calculateMonthlyRange(year, month)
    return this.getSchedulesInRange(
      userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  /**
   * 특정 주의 일정을 조회
   * @param userUuid 사용자 UUID
   * @param date 기준 날짜
   * @returns 해당 주의 일정 목록
   */
  async findByWeek(
    userUuid: string,
    date: string,
  ): Promise<ResponseScheduleDto[]> {
    await this.usersService.getUserByUuid(userUuid)
    const inputDate = new Date(date)
    const dateRange = this.scheduleUtils.calculateWeeklyRange(inputDate)
    return this.getSchedulesInRange(
      userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  /**
   * 특정 날짜의 일정을 조회
   * @param dateQuery 날짜 조회 조건
   * @returns 해당 날짜의 일정 목록
   */
  async findByDate(dateQuery: WeekQueryDto): Promise<ResponseScheduleDto[]> {
    await this.usersService.getUserByUuid(dateQuery.userUuid)
    const dateRange = this.scheduleUtils.calculateDailyRange(dateQuery.date)
    return this.getSchedulesInRange(
      dateQuery.userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  /**
   * 특정 연도의 일정을 조회
   * @param userUuid 사용자 UUID
   * @param year 연도
   * @returns 해당 연도의 일정 목록
   */
  async findByYear(
    userUuid: string,
    year: number,
  ): Promise<ResponseScheduleDto[]> {
    await this.usersService.getUserByUuid(userUuid)
    const dateRange = this.scheduleUtils.calculateYearlyRange(year)
    return this.getSchedulesInRange(
      userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  /**
   * 특정 기간의 일정을 조회
   * @param userUuid 사용자 UUID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 해당 기간의 일정 목록
   */
  async getSchedulesInRange(
    userUuid: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ResponseScheduleDto[]> {
    const [regularSchedules, recurringSchedules] = await Promise.all([
      this.recurringSchedulesService.findRegularSchedulesInRange(
        userUuid,
        startDate,
        endDate,
      ),
      this.recurringSchedulesService.findRecurringSchedules(userUuid),
    ])

    const expandedRecurringSchedules =
      this.recurringSchedulesService.expandRecurringSchedules(
        recurringSchedules,
        startDate,
        endDate,
      )

    const sharedGroupSchedules =
      await this.groupScheduleService.findSharedGroupSchedules(
        userUuid,
        startDate,
        endDate,
      )

    const allSchedules = [
      ...regularSchedules,
      ...expandedRecurringSchedules,
      ...sharedGroupSchedules,
    ]
    allSchedules.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

    const convertedSchedules = await Promise.all(
      allSchedules.map((schedule) =>
        this.scheduleUtils.convertToResponseDto(schedule),
      ),
    )

    return convertedSchedules
  }

  /**
   * 특정 일정을 ID로 조회
   * @param id 일정 ID
   * @returns 일정 정보
   */
  async findOne(id: number): Promise<ResponseScheduleDto> {
    const schedule = await this.schedulesRepository.findOne({
      where: { scheduleId: id },
      relations: ['category', 'recurring'],
    })
    if (!schedule) {
      throw new NotFoundException(`Schedule with id: ${id} not found.`)
    }
    return this.scheduleUtils.convertToResponseDto(schedule)
  }

  /**
   * 새로운 일정 생성
   * @param userUuid 사용자 UUID
   * @param createScheduleDto 일정 생성 정보
   * @returns 생성된 일정 정보
   */
  @Transactional()
  async createSchedule(
    userUuid: string,
    createScheduleDto: CreateScheduleDto,
  ): Promise<ResponseScheduleDto> {
    const category = await this.categoryRepository.findOne({
      where: { categoryId: createScheduleDto.categoryId ?? 7 },
    })

    if (!category) {
      throw new NotFoundException('Category not found.')
    }

    const startDate = new Date(createScheduleDto.startDate)
    const endDate = new Date(createScheduleDto.endDate)

    if (endDate <= startDate) {
      throw new BadRequestException('종료일은 시작일보다 이후여야 합니다.')
    }

    if (createScheduleDto.recurringOptions) {
      const repeatEndDate = new Date(
        createScheduleDto.recurringOptions.repeatEndDate,
      )

      if (repeatEndDate <= endDate) {
        throw new BadRequestException(
          '반복 일정의 종료일은 일정의 종료일보다 이후여야 합니다.',
        )
      }

      this.recurringSchedulesService.validateRecurringOptions(
        createScheduleDto.recurringOptions,
      )
    }

    const schedule = this.schedulesRepository.create({
      ...createScheduleDto,
      userUuid,
      category,
      isRecurring: !!createScheduleDto.recurringOptions,
    })

    if (schedule.isAllDay) {
      ;[schedule.startDate, schedule.endDate] =
        this.scheduleUtils.adjustDateForAllDay(
          schedule.startDate,
          schedule.endDate,
        )
    }

    const savedSchedule = await this.schedulesRepository.save(schedule)

    if (schedule.isRecurring && createScheduleDto.recurringOptions) {
      const recurring = this.recurringRepository.create({
        scheduleId: savedSchedule.scheduleId,
        repeatType: createScheduleDto.recurringOptions.repeatType,
        repeatEndDate: createScheduleDto.recurringOptions.repeatEndDate,
        recurringInterval: createScheduleDto.recurringOptions.recurringInterval,
        recurringDaysOfWeek:
          createScheduleDto.recurringOptions.recurringDaysOfWeek,
        recurringDayOfMonth:
          createScheduleDto.recurringOptions.recurringDayOfMonth,
        recurringMonthOfYear:
          createScheduleDto.recurringOptions.recurringMonthOfYear,
      })

      const savedRecurring = await this.recurringRepository.save(recurring)
      savedSchedule.recurring = savedRecurring
    }

    if (createScheduleDto.groupInfo && createScheduleDto.groupInfo.length > 0) {
      await this.groupService.linkScheduleToGroupsAndUsers(
        savedSchedule,
        createScheduleDto.groupInfo,
      )
    }

    return this.scheduleUtils.convertToResponseDto(savedSchedule)
  }

  /**
   * 일정 수정
   * @param userUuid 사용자 UUID
   * @param scheduleId 일정 ID
   * @param updateScheduleDto 수정할 일정 정보
   * @param instanceDate 반복 일정의 특정 날짜
   * @param updateType 수정 타입 ('single' | 'future')
   * @returns 수정된 일정 정보
   */
  @Transactional()
  async updateSchedule(
    userUuid: string,
    scheduleId: number,
    updateScheduleDto: UpdateScheduleDto,
    instanceDate: Date,
    updateType: 'single' | 'future' = 'single',
  ): Promise<ResponseScheduleDto> {
    let schedule = await this.schedulesRepository.findOne({
      where: { scheduleId, userUuid },
      relations: ['category', 'recurring'],
    })

    // 사용자가 생성한 일정이 아니라면 공유 받은 일정인지 찾음
    if (!schedule) {
      schedule =
        await this.groupScheduleService.findSharedGroupSchedulesByScheduleId(
          userUuid,
          scheduleId,
        )
    }

    if (!schedule) {
      throw new NotFoundException(
        `해당 ID : ${scheduleId}를 가진 일정을 찾을 수 없습니다.`,
      )
    }

    const isCreator = schedule.userUuid === userUuid

    if (schedule.isRecurring && instanceDate) {
      const isValidDate = this.recurringSchedulesService.isOccurrenceDate(
        schedule,
        instanceDate,
      )
      if (!isValidDate) {
        throw new BadRequestException(
          `지정된 날짜 ${instanceDate}는 이 반복 일정의 유효한 날짜가 아닙니다.`,
        )
      }
    }

    let updatedSchedule
    if (schedule.isRecurring) {
      // 반복 일정 수정
      updatedSchedule =
        updateType === 'single'
          ? await this.recurringSchedulesService.updateSingleInstance(
              schedule,
              updateScheduleDto,
              instanceDate,
            )
          : await this.recurringSchedulesService.updateFutureInstances(
              schedule,
              updateScheduleDto,
              instanceDate,
            )
    } else {
      // 일반 일정 수정
      updatedSchedule = await this.updateNonRecurringSchedule(
        schedule,
        updateScheduleDto,
      )
    }

    // 그룹 정보 업데이트 (일정 생성자만 가능)
    if (isCreator) {
      if (updateScheduleDto.addGroupInfo) {
        await this.groupService.linkScheduleToGroupsAndUsers(
          updatedSchedule,
          updateScheduleDto.addGroupInfo,
        )
      }
      if (updateScheduleDto.deleteGroupInfo) {
        await this.groupService.removeGroupMembersFromSchedule(
          updatedSchedule.scheduleId,
          updateScheduleDto.deleteGroupInfo,
        )
      }
    }

    return updatedSchedule
  }

  /**
   * 일반 일정 수정
   * @param schedule 수정할 일정
   * @param updateScheduleDto 수정할 일정 정보
   * @returns 수정된 일정 정보
   */
  private async updateNonRecurringSchedule(
    schedule: Schedule,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<ResponseScheduleDto> {
    const { categoryId, ...updateData } = updateScheduleDto

    // 제공된 필드만 업데이트
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        schedule[key] = value
      }
    })

    if (updateData.isAllDay) {
      ;[schedule.startDate, schedule.endDate] =
        this.scheduleUtils.adjustDateForAllDay(
          schedule.startDate,
          schedule.endDate,
        )
    }

    // 카테고리 ID가 제공된 경우에만 카테고리 업데이트
    if (categoryId !== undefined) {
      const newCategory = await this.categoryRepository.findOne({
        where: { categoryId },
      })
      if (newCategory) {
        schedule.category = newCategory
      }
    }

    // 변경된 일정 저장
    const updatedSchedule = await this.schedulesRepository.save(schedule)

    return this.scheduleUtils.convertToResponseDto(updatedSchedule)
  }

  /**
   * 일정 삭제
   * @param userUuid 사용자 UUID
   * @param scheduleId 일정 ID
   * @param instanceDate 반복 일정의 특정 날짜
   * @param deleteType 삭제 타입 ('single' | 'future')
   */
  @Transactional()
  async deleteSchedule(
    userUuid: string,
    scheduleId: number,
    instanceDate: string,
    deleteType: 'single' | 'future' = 'single',
  ): Promise<void> {
    // 일정 조회
    let schedule = await this.schedulesRepository.findOne({
      where: { scheduleId, userUuid },
      relations: ['recurring'],
    })
    let isCreator = true

    // 공유 받은 일정인지 확인
    if (!schedule) {
      schedule =
        await this.groupScheduleService.findSharedGroupSchedulesByScheduleId(
          userUuid,
          scheduleId,
        )
      isCreator = false
    }

    if (!schedule) {
      throw new NotFoundException(
        `ID가 ${scheduleId}인 일정을 찾을 수 없습니다.`,
      )
    }

    const targetDate = new Date(instanceDate)

    if (schedule.isRecurring) {
      if (
        schedule.recurring.repeatEndDate &&
        schedule.recurring.repeatEndDate < targetDate
      ) {
        throw new BadRequestException(
          '삭제하려는 날짜가 반복 일정의 종료일보다 늦습니다.',
        )
      }

      if (isCreator) {
        if (deleteType === 'future') {
          await this.recurringSchedulesService.deleteFutureInstances(
            schedule,
            targetDate,
          )
        } else {
          await this.recurringSchedulesService.deleteSingleInstance(
            schedule,
            targetDate,
          )
        }
      } else {
        // 공유 받은 사용자라면 해당 날짜 이후의 그룹 일정에서만 제거
        await this.groupScheduleService.removeUserFromFutureGroupSchedules(
          userUuid,
          schedule,
        )
      }
    } else {
      if (isCreator) {
        // 일정 생성자인 경우 일정과 관련된 모든 그룹 일정 삭제
        await this.groupScheduleRepository.delete({
          schedule: { scheduleId },
        })
        await this.schedulesRepository.remove(schedule)
      } else {
        // 공유 받은 사용자인 경우 해당 사용자의 그룹 일정만 삭제
        await this.groupScheduleRepository.delete({
          schedule: { scheduleId },
          userUuid,
        })
      }
    }
  }
}
