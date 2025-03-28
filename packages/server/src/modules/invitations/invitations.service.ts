// src/modules/invitations/invitations.service.ts

import { Injectable, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not } from 'typeorm'
import { Invitation } from '@/entities/invitation.entity'
import { GroupInvitation } from '@/entities/group-invitation.entity'
import {
  ManagerInvitation,
  InvitationStatus as ManagerStatus,
} from '@/entities/manager-invitation.entity'
import { CreateInvitationDto } from './dto/create-invitation.dto'
import { InvitationStatus } from '@/common/enums/invitation-status.enum'
import { InvitationType } from '@/common/enums/invitation-type.enum'
import { UsersService } from '@/modules/users/users.service'
import { GroupService } from '@/modules/group/group.service'
import { ManagerService } from '@/modules/manager/manager.service'
import { InvitationResponseDto } from './dto/response/invitation-response.dto'
import { InvitationsResponseDto } from './dto/response/invitations-response.dto'
import {
  InvitationsDto,
  InvitationsType,
  InvitationsRole,
} from './dto/invitations.dto'
import { BusinessException } from '@/common/exception/business.exception'
import { ErrorCode } from '@/common/exception/error-codes.enum'

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(GroupInvitation)
    private readonly groupInvitationRepository: Repository<GroupInvitation>,
    @InjectRepository(ManagerInvitation)
    private readonly managerInvitationRepository: Repository<ManagerInvitation>,
    private readonly usersService: UsersService,
    private readonly groupService: GroupService,
    private readonly managerService: ManagerService,
  ) {}

  async createInvitation(
    inviterUuid: string,
    dto: CreateInvitationDto,
  ): Promise<Invitation> {
    await this.usersService.getUserByUuid(inviterUuid)
    await this.usersService.getUserByUuid(dto.inviteeUuid)

    if (inviterUuid === dto.inviteeUuid)
      throw new BusinessException(
        ErrorCode.INVALID_INPUT_VALUE,
        '자기 자신을 초대할 수 없습니다.',
      )

    if (dto.invitationType === InvitationType.GROUP) {
      if (!dto.groupId)
        throw new BusinessException(
          ErrorCode.INVALID_INPUT_VALUE,
          '그룹 ID가 필요합니다.',
        )

      await this.groupService.validateGroup(dto.groupId)
      await this.groupService.validateGroupAdmin(dto.groupId, inviterUuid)
      await this.groupService.validateExistingGroupRelation(
        dto.groupId,
        dto.inviteeUuid,
      )
    } else {
      await this.managerService.validateExistingManagerRelation(
        inviterUuid,
        dto.inviteeUuid,
      )
    }

    const existing = await this.invitationRepository.findOne({
      where: {
        inviterUuid,
        inviteeUuid: dto.inviteeUuid,
        invitationType: dto.invitationType,
        groupId: dto.groupId,
        status: InvitationStatus.PENDING,
      },
    })

    if (existing)
      throw new BusinessException(
        ErrorCode.INVALID_INPUT_VALUE,
        '이미 초대가 진행 중입니다.',
      )

    const invitation = this.invitationRepository.create({
      inviterUuid,
      inviteeUuid: dto.inviteeUuid,
      invitationType: dto.invitationType,
      groupId: dto.groupId,
    })

    return this.invitationRepository.save(invitation)
  }

  private async validateAndGetInvitation(
    id: number,
    userUuid: string,
    checkInvitee = false,
  ) {
    const invitation = await this.invitationRepository.findOne({
      where: { invitationId: id },
    })
    if (!invitation)
      throw new BusinessException(
        ErrorCode.RESOURCE_NOT_FOUND,
        '초대장을 찾을 수 없습니다.',
      )

    const isInviter = invitation.inviterUuid === userUuid
    const isInvitee = invitation.inviteeUuid === userUuid

    if (checkInvitee && !isInvitee)
      throw new BusinessException(
        ErrorCode.HANDLE_ACCESS_DENIED,
        '초대받은 사용자만 가능합니다.',
      )
    if (!checkInvitee && !isInviter)
      throw new BusinessException(
        ErrorCode.HANDLE_ACCESS_DENIED,
        '초대한 사용자만 가능합니다.',
      )

    return invitation
  }

  async acceptInvitation(id: number, userUuid: string): Promise<Invitation> {
    const invitation = await this.validateAndGetInvitation(id, userUuid, true)
    if (invitation.status !== InvitationStatus.PENDING)
      throw new BusinessException(
        ErrorCode.INVALID_INPUT_VALUE,
        '대기 중인 초대만 수락할 수 있습니다.',
      )

    if (invitation.invitationType === InvitationType.GROUP) {
      await this.groupService.addMemberToGroup(invitation.groupId, userUuid)
    } else {
      await this.managerService.createManagerSubordinateRelation(
        invitation.inviterUuid,
        userUuid,
      )
      await this.usersService.updateUser(userUuid, { isManager: true })
    }

    invitation.status = InvitationStatus.ACCEPTED
    return this.invitationRepository.save(invitation)
  }

  async rejectInvitation(id: number, userUuid: string): Promise<Invitation> {
    const invitation = await this.validateAndGetInvitation(id, userUuid, true)
    if (invitation.status !== InvitationStatus.PENDING)
      throw new BusinessException(
        ErrorCode.INVALID_INPUT_VALUE,
        '대기 중인 초대만 거절할 수 있습니다.',
      )

    invitation.status = InvitationStatus.REJECTED
    return this.invitationRepository.save(invitation)
  }

  async cancelInvitation(id: number, userUuid: string): Promise<Invitation> {
    const invitation = await this.validateAndGetInvitation(id, userUuid, false)
    if (invitation.status !== InvitationStatus.PENDING)
      throw new BusinessException(
        ErrorCode.INVALID_INPUT_VALUE,
        '대기 중인 초대만 취소할 수 있습니다.',
      )

    invitation.status = InvitationStatus.CANCELED
    return this.invitationRepository.save(invitation)
  }

  async getInvitation(
    id: number,
    userUuid: string,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationRepository.findOne({
      where: { invitationId: id },
    })
    if (!invitation)
      throw new BusinessException(
        ErrorCode.RESOURCE_NOT_FOUND,
        '초대장을 찾을 수 없습니다.',
      )

    if (
      invitation.inviterUuid !== userUuid &&
      invitation.inviteeUuid !== userUuid
    )
      throw new ForbiddenException('해당 초대장에 접근 권한이 없습니다.')

    const [inviter, invitee] = await Promise.all([
      this.usersService.getUserByUuid(invitation.inviterUuid),
      this.usersService.getUserByUuid(invitation.inviteeUuid),
    ])

    return {
      ...invitation,
      inviterName: inviter.name,
      inviteeName: invitee.name,
    }
  }

  async getAllInvitations(userUuid: string): Promise<InvitationsResponseDto> {
    const [sent, received] = await Promise.all([
      this.invitationRepository.find({
        where: { inviterUuid: userUuid },
        order: { createdAt: 'DESC' },
      }),
      this.invitationRepository.find({
        where: { inviteeUuid: userUuid },
        order: { createdAt: 'DESC' },
      }),
    ])

    const toDto = async (inv: Invitation) => {
      const [inviter, invitee] = await Promise.all([
        this.usersService.getUserByUuid(inv.inviterUuid),
        this.usersService.getUserByUuid(inv.inviteeUuid),
      ])
      return {
        invitationId: inv.invitationId,
        invitationType: inv.invitationType,
        status: inv.status,
        inviterUuid: inv.inviterUuid,
        inviteeUuid: inv.inviteeUuid,
        groupId: inv.groupId,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        inviterName: inviter.name,
        inviteeName: invitee.name,
      }
    }

    const sentGroup = await Promise.all(
      sent.filter((i) => i.invitationType === InvitationType.GROUP).map(toDto),
    )
    const sentManager = await Promise.all(
      sent
        .filter((i) => i.invitationType === InvitationType.MANAGER)
        .map(toDto),
    )
    const recvGroup = await Promise.all(
      received
        .filter((i) => i.invitationType === InvitationType.GROUP)
        .map(toDto),
    )
    const recvManager = await Promise.all(
      received
        .filter((i) => i.invitationType === InvitationType.MANAGER)
        .map(toDto),
    )

    return {
      sent: { groupInvitations: sentGroup, managerInvitations: sentManager },
      received: {
        groupInvitations: recvGroup,
        managerInvitations: recvManager,
      },
    }
  }

  async getUserInvitations(userUuid: string): Promise<InvitationsDto[]> {
    const userExists = await this.usersService.checkUserExists(userUuid)
    if (!userExists)
      throw new BusinessException(
        ErrorCode.USER_NOT_FOUND,
        '사용자를 찾을 수 없습니다.',
      )

    const groupInvs = await this.groupInvitationRepository.find({
      where: [
        { inviterUuid: userUuid, status: Not(ManagerStatus.REMOVED) },
        { inviteeUuid: userUuid, status: Not(ManagerStatus.REMOVED) },
      ],
      relations: ['group'],
    })

    const managerInvs = await this.managerInvitationRepository.find({
      where: [
        { managerUuid: userUuid, status: Not(ManagerStatus.REMOVED) },
        { subordinateUuid: userUuid, status: Not(ManagerStatus.REMOVED) },
      ],
    })

    const results: InvitationsDto[] = await Promise.all([
      ...groupInvs.map(async (inv) => ({
        id: inv.groupInvitationId,
        type: InvitationsType.GROUP,
        role:
          inv.inviterUuid === userUuid
            ? InvitationsRole.GROUP_ADMIN
            : InvitationsRole.GROUP_MEMBER,
        status: inv.status,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        inviterUuid: inv.inviterUuid,
        inviterName: (await this.usersService.findOne(inv.inviterUuid)).name,
        inviteeUuid: inv.inviteeUuid,
        inviteeName: (await this.usersService.findOne(inv.inviteeUuid)).name,
        groupId: inv.group.groupId,
        groupName: inv.group.groupName,
      })),
      ...managerInvs.map(async (inv) => ({
        id: inv.managerInvitationId,
        type: InvitationsType.MANAGER,
        role:
          inv.managerUuid === userUuid
            ? InvitationsRole.MANAGER
            : InvitationsRole.SUBORDINATE,
        status: inv.status,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        inviterUuid: inv.managerUuid,
        inviterName: (await this.usersService.findOne(inv.managerUuid)).name,
        inviteeUuid: inv.subordinateUuid,
        inviteeName: (await this.usersService.findOne(inv.subordinateUuid))
          .name,
      })),
    ])

    return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }
}
