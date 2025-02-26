// src/invitations/invitations.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Invitation } from '@/entities/invitation.entity'
import { CreateInvitationDto } from './dto/create-invitation.dto'
import { InvitationType } from '@/common/enums/invitation-type.enum'
import { UsersService } from '@/modules/users/users.service'
import { GroupService } from '@/modules/group/group.service'
import { InvitationStatus } from '@/common/enums/invitation-status.enum'
import { ManagerService } from '@/modules/manager/manager.service'
import { InvitationResponseDto } from './dto/response/invitation-response.dto'
import { InvitationsResponseDto } from './dto/response/invitations-response.dto'

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    private readonly groupService: GroupService,
    private readonly usersService: UsersService,
    private readonly managerService: ManagerService,
  ) {}

  /**
   * 초대장 생성
   * @param inviterUuid 초대하는 사용자 UUID
   * @param createInvitationDto 초대장 생성 DTO
   */
  async createInvitation(
    inviterUuid: string,
    createInvitationDto: CreateInvitationDto,
  ): Promise<Invitation> {
    // 초대하는 사용자 검증
    await this.usersService.getUserByUuid(inviterUuid)

    // 초대받는 사용자 검증
    await this.usersService.getUserByUuid(createInvitationDto.inviteeUuid)

    // 자기 자신 초대 방지
    if (inviterUuid === createInvitationDto.inviteeUuid) {
      throw new BadRequestException('자기 자신을 초대할 수 없습니다.')
    }

    // 초대 타입에 따른 검증
    if (createInvitationDto.invitationType === InvitationType.GROUP) {
      // 그룹 초대 검증
      if (!createInvitationDto.groupId) {
        throw new BadRequestException('그룹 ID가 필요합니다.')
      }

      // 그룹 존재 확인
      await this.groupService.validateGroup(createInvitationDto.groupId)

      // 그룹 관리자 권한 확인
      await this.groupService.validateGroupAdmin(
        createInvitationDto.groupId,
        inviterUuid,
      )

      // 이미 그룹 멤버인지 확인
      await this.groupService.validateExistingGroupRelation(
        createInvitationDto.groupId,
        createInvitationDto.inviteeUuid,
      )
    } else {
      // 매니저 초대 검증
      await this.managerService.validateExistingManagerRelation(
        inviterUuid,
        createInvitationDto.inviteeUuid,
      )
    }

    // 중복 초대 확인
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        inviterUuid,
        inviteeUuid: createInvitationDto.inviteeUuid,
        invitationType: createInvitationDto.invitationType,
        groupId: createInvitationDto.groupId,
        status: InvitationStatus.PENDING,
      },
    })

    if (existingInvitation) {
      throw new BadRequestException('이미 진행 중인 초대가 있습니다.')
    }

    // 새 초대장 생성 및 저장
    const invitation = this.invitationRepository.create({
      inviterUuid,
      inviteeUuid: createInvitationDto.inviteeUuid,
      invitationType: createInvitationDto.invitationType,
      groupId: createInvitationDto.groupId,
    })

    return await this.invitationRepository.save(invitation)
  }
  /**
   * 초대장 검증 및 조회
   * @param invitationId 초대장 ID
   * @param userUuid 사용자 UUID (권한 확인용)
   * @param checkInvitee 초대받은 사용자 확인 여부
   */
  private async validateAndGetInvitation(
    invitationId: number,
    userUuid: string,
    checkInvitee: boolean = false,
  ): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { invitationId },
    })

    if (!invitation) {
      throw new NotFoundException('초대를 찾을 수 없습니다.')
    }

    // 권한 확인
    const isInviter = invitation.inviterUuid === userUuid
    const isInvitee = invitation.inviteeUuid === userUuid

    if (checkInvitee && !isInvitee) {
      throw new ForbiddenException(
        '초대받은 사용자만 이 작업을 수행할 수 있습니다.',
      )
    }

    if (!checkInvitee && !isInviter) {
      throw new ForbiddenException(
        '초대한 사용자만 이 작업을 수행할 수 있습니다.',
      )
    }

    return invitation
  }
  /**
   * 초대 수락
   * @param invitationId 초대장 ID
   * @param userUuid 수락하는 사용자 UUID
   */
  async acceptInvitation(
    invitationId: number,
    userUuid: string,
  ): Promise<Invitation> {
    // 초대장 검증 및 권한 확인 (초대받은 사용자만 수락 가능)
    const invitation = await this.validateAndGetInvitation(
      invitationId,
      userUuid,
      true,
    )

    // 대기 상태 확인
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('대기 중인 초대만 수락할 수 있습니다.')
    }

    // 초대 타입에 따른 처리
    if (invitation.invitationType === InvitationType.GROUP) {
      // 그룹 초대 수락 시 그룹 멤버 추가 로직은 GroupService에서 처리
      await this.groupService.addMemberToGroup(invitation.groupId, userUuid)
    } else {
      // 매니저 초대 수락 시 매니저-부하직원 관계 설정
      await this.managerService.createManagerSubordinateRelation(
        invitation.inviterUuid, // 매니저 UUID (초대한 사람)
        userUuid, // 부하직원 UUID (초대받은 사람)
      )
      // 초대한 사람은 매니저로 변경
      await this.usersService.updateUser(userUuid, { isManager: true })
    }

    // 초대 상태 업데이트
    invitation.status = InvitationStatus.ACCEPTED
    return await this.invitationRepository.save(invitation)
  }

  /**
   * 초대 거절
   * @param invitationId 초대장 ID
   * @param userUuid 거절하는 사용자 UUID
   */
  async rejectInvitation(
    invitationId: number,
    userUuid: string,
  ): Promise<Invitation> {
    // 초대장 검증 및 권한 확인 (초대받은 사용자만 거절 가능)
    const invitation = await this.validateAndGetInvitation(
      invitationId,
      userUuid,
      true,
    )

    // 대기 상태 확인
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('대기 중인 초대만 거절할 수 있습니다.')
    }

    // 초대 상태 업데이트
    invitation.status = InvitationStatus.REJECTED
    return await this.invitationRepository.save(invitation)
  }

  /**
   * 초대 취소
   * @param invitationId 초대장 ID
   * @param userUuid 취소하는 사용자 UUID
   */
  async cancelInvitation(
    invitationId: number,
    userUuid: string,
  ): Promise<Invitation> {
    // 초대장 검증 및 권한 확인 (초대한 사용자만 취소 가능)
    const invitation = await this.validateAndGetInvitation(
      invitationId,
      userUuid,
      false,
    )

    // 대기 상태 확인
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('대기 중인 초대만 취소할 수 있습니다.')
    }

    // 초대 상태 업데이트
    invitation.status = InvitationStatus.CANCELED
    return await this.invitationRepository.save(invitation)
  }

  /**
   * 단일 초대장 조회
   * @param invitationId 초대장 ID
   * @param userUuid 요청하는 사용자 UUID
   */
  async getInvitation(
    invitationId: number,
    userUuid: string,
  ): Promise<InvitationResponseDto> {
    // 초대장 조회
    const invitation = await this.invitationRepository.findOne({
      where: { invitationId },
    })

    if (!invitation) {
      throw new NotFoundException('초대장을 찾을 수 없습니다.')
    }

    // 권한 확인: 초대한 사람이나 초대받은 사람만 조회 가능
    if (
      invitation.inviterUuid !== userUuid &&
      invitation.inviteeUuid !== userUuid
    ) {
      throw new ForbiddenException('해당 초대장에 대한 조회 권한이 없습니다.')
    }

    // 초대 관련 사용자 정보 조회
    const [inviter, invitee] = await Promise.all([
      this.usersService.getUserByUuid(invitation.inviterUuid),
      this.usersService.getUserByUuid(invitation.inviteeUuid),
    ])

    // DTO로 변환하여 반환
    return {
      ...invitation,
      inviterName: inviter.name,
      inviteeName: invitee.name,
    }
  }

  /**
   * 모든 초대 목록 조회
   * @param userUuid 사용자 UUID
   */
  async getAllInvitations(userUuid: string): Promise<InvitationsResponseDto> {
    // 보낸 초대 조회
    const sentInvitations = await this.invitationRepository.find({
      where: { inviterUuid: userUuid },
      order: { createdAt: 'DESC' },
    })

    // 받은 초대 조회
    const receivedInvitations = await this.invitationRepository.find({
      where: { inviteeUuid: userUuid },
      order: { createdAt: 'DESC' },
    })

    // 보낸 초대 분류 및 변환
    const sentGroupInvitations = await Promise.all(
      sentInvitations
        .filter((inv) => inv.invitationType === InvitationType.GROUP)
        .map((inv) => this.mapToInvitationResponseDto(inv)),
    )

    const sentManagerInvitations = await Promise.all(
      sentInvitations
        .filter((inv) => inv.invitationType === InvitationType.MANAGER)
        .map((inv) => this.mapToInvitationResponseDto(inv)),
    )

    // 받은 초대 분류 및 변환
    const receivedGroupInvitations = await Promise.all(
      receivedInvitations
        .filter((inv) => inv.invitationType === InvitationType.GROUP)
        .map((inv) => this.mapToInvitationResponseDto(inv)),
    )

    const receivedManagerInvitations = await Promise.all(
      receivedInvitations
        .filter((inv) => inv.invitationType === InvitationType.MANAGER)
        .map((inv) => this.mapToInvitationResponseDto(inv)),
    )

    return {
      sent: {
        groupInvitations: sentGroupInvitations,
        managerInvitations: sentManagerInvitations,
      },
      received: {
        groupInvitations: receivedGroupInvitations,
        managerInvitations: receivedManagerInvitations,
      },
    }
  }

  /**
   * Invitation 엔티티를 ResponseDto로 변환
   */
  private async mapToInvitationResponseDto(
    invitation: Invitation,
  ): Promise<InvitationResponseDto> {
    const [inviter, invitee] = await Promise.all([
      this.usersService.getUserByUuid(invitation.inviterUuid),
      this.usersService.getUserByUuid(invitation.inviteeUuid),
    ])

    return {
      invitationId: invitation.invitationId,
      invitationType: invitation.invitationType,
      status: invitation.status,
      inviterUuid: invitation.inviterUuid,
      inviteeUuid: invitation.inviteeUuid,
      groupId: invitation.groupId,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
      inviterName: inviter.name,
      inviteeName: invitee.name,
    }
  }
}
