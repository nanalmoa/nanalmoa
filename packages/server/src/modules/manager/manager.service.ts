import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  ManagerInvitation,
  InvitationStatus,
} from 'src/entities/manager-invitation.entity'
import { ManagerSubordinate } from 'src/entities/manager-subordinate.entity'
import { CreateInvitationDto } from './dto/create-invitation.dto'
import { UserResponseDto } from '../users/dto/user-response.dto'
import { UsersService } from '../users/users.service'
import { BusinessException } from '@/common/exception/business.exception'
import { ErrorCode } from '@/common/exception/error-codes.enum'

@Injectable()
export class ManagerService {
  private readonly logger = new Logger(ManagerService.name)
  constructor(
    @InjectRepository(ManagerInvitation)
    private managerInvitationRepository: Repository<ManagerInvitation>,
    @InjectRepository(ManagerSubordinate)
    private managerSubordinateRepository: Repository<ManagerSubordinate>,
    private usersService: UsersService,
  ) {}

  private async validateUsers(
    createInvitationDto: CreateInvitationDto,
  ): Promise<void> {
    const [managerExists, subordinateExists] = await Promise.all([
      this.usersService.checkUserExists(createInvitationDto.managerUuid),
      this.usersService.checkUserExists(createInvitationDto.subordinateUuid),
    ])
    if (!managerExists) {
      throw new BusinessException(
        ErrorCode.USER_NOT_FOUND,
        `관리자 UUID ${createInvitationDto.managerUuid}를 찾을 수 없습니다.`,
      )
    }

    if (!subordinateExists) {
      throw new BusinessException(
        ErrorCode.USER_NOT_FOUND,
        `피관리자 UUID ${createInvitationDto.subordinateUuid}를 찾을 수 없습니다.`,
      )
    }

    if (
      createInvitationDto.managerUuid === createInvitationDto.subordinateUuid
    ) {
      throw new BusinessException(
        ErrorCode.INVALID_INPUT_VALUE,
        `관리자 UUID ${createInvitationDto.managerUuid}와 피관리자 UUID ${createInvitationDto.managerUuid}를 같게 설정할 수 없습니다.`,
      )
    }
  }

  async removeManagerSubordinate(
    managerUuid: string,
    subordinateUuid: string,
  ): Promise<void> {
    const relation = await this.managerSubordinateRepository.findOne({
      where: { managerUuid, subordinateUuid },
    })

    if (!relation) {
      throw new BusinessException(
        ErrorCode.RESOURCE_NOT_FOUND,
        '관리자-피관리자 관계를 찾을 수 없습니다.',
      )
    }

    await this.managerSubordinateRepository.remove(relation)

    const invitation = await this.managerInvitationRepository.findOne({
      where: {
        managerUuid,
        subordinateUuid,
        status: InvitationStatus.ACCEPTED,
      },
    })

    if (invitation) {
      invitation.status = InvitationStatus.REMOVED
      await this.managerInvitationRepository.save(invitation)
    }
  }

  async getManagerList(subordinateUuid: string): Promise<UserResponseDto[]> {
    try {
      const managerSubordinates = await this.managerSubordinateRepository.find({
        where: { subordinateUuid },
      })

      const managerUuids = managerSubordinates.map((ms) => ms.managerUuid)
      const managers = await this.usersService.getUsersByUuids(managerUuids)

      this.logger.log(
        `사용자 ${subordinateUuid}의 관리자 ${managers.length}명을 조회했습니다.`,
      )
      return managers.map((manager) => new UserResponseDto(manager))
    } catch (error) {
      this.logger.error(`관리자 목록 조회 실패: ${error.message}`, error.stack)
      throw new BusinessException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        '관리자 목록 조회 중 오류가 발생했습니다.',
      )
    }
  }

  async getSubordinateList(managerUuid: string): Promise<UserResponseDto[]> {
    try {
      const managerSubordinates = await this.managerSubordinateRepository.find({
        where: { managerUuid },
      })

      const subordinateUuids = managerSubordinates.map(
        (ms) => ms.subordinateUuid,
      )
      const subordinates =
        await this.usersService.getUsersByUuids(subordinateUuids)

      this.logger.log(
        `관리자 ${managerUuid}의 피관리자 ${subordinates.length}명을 조회했습니다.`,
      )
      return subordinates.map((subordinate) => new UserResponseDto(subordinate))
    } catch (error) {
      this.logger.error(
        `피관리자 목록 조회 실패: ${error.message}`,
        error.stack,
      )
      throw new BusinessException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        '피관리자 목록 조회 중 오류가 발생했습니다.',
      )
    }
  }

  async validateAndCheckManagerRelation(
    managerUuid: string,
    subordinateUuid: string,
  ): Promise<boolean> {
    try {
      await this.validateUsers({ managerUuid, subordinateUuid })

      const relation = await this.managerSubordinateRepository.findOne({
        where: { managerUuid, subordinateUuid },
      })

      if (relation) {
        this.logger.log(
          `사용자 ${managerUuid}는 ${subordinateUuid}의 관리자입니다.`,
        )
        return true
      } else {
        this.logger.log(
          `사용자 ${managerUuid}는 ${subordinateUuid}의 관리자가 아닙니다.`,
        )
        return false
      }
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error
      }
      this.logger.error(
        `관리자 관계 확인 중 오류 발생: ${error.message}`,
        error.stack,
      )
      throw new BusinessException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        '관리자 관계 확인 중 오류가 발생했습니다.',
      )
    }
  }

  /**
   * 기존 매니저-부하직원 관계 검증
   */
  async validateExistingManagerRelation(
    managerUuid: string,
    subordinateUuid: string,
  ): Promise<void> {
    const existingRelation = await this.managerSubordinateRepository.findOne({
      where: {
        managerUuid,
        subordinateUuid,
      },
    })

    if (existingRelation) {
      throw new BusinessException(
        ErrorCode.INVALID_INPUT_VALUE,
        '이미 매니저-부하직원 관계가 존재합니다.',
      )
    }
  }

  /**
   * 매니저-부하직원 관계 생성
   * @param managerUuid 매니저 UUID
   * @param subordinateUuid 부하직원 UUID
   */
  async createManagerSubordinateRelation(
    managerUuid: string,
    subordinateUuid: string,
  ): Promise<ManagerSubordinate> {
    this.validateExistingManagerRelation(managerUuid, subordinateUuid)

    // 매니저와 부하직원 존재 확인
    await Promise.all([
      this.usersService.getUserByUuid(managerUuid),
      this.usersService.getUserByUuid(subordinateUuid),
    ])

    // 새로운 관계 생성
    const managerSubordinate = this.managerSubordinateRepository.create({
      managerUuid,
      subordinateUuid,
    })

    return await this.managerSubordinateRepository.save(managerSubordinate)
  }
}
