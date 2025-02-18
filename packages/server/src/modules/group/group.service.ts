import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { CreateGroupDto } from './dto/create-group.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Group } from '@/entities/group.entity'
import { UserGroup } from '@/entities/user-group.entity'
import { GroupInfoResponseDto } from './dto/response-group.dto'
import { GroupInvitation } from '@/entities/group-invitation.entity'
import { InvitationStatus } from '@/entities/manager-invitation.entity'
import { GroupMemberResponseDto } from './dto/response-group-member.dto'
import { RemoveGroupMemberDto } from './dto/remove-group-member.dto'
import { UsersService } from '../users/users.service'
import { GroupDetailResponseDto } from './dto/response-group-detail.dto'
import { Schedule } from '@/entities/schedule.entity'
import { GroupSchedule } from '@/entities/group-schedule.entity'
import { GroupInfo } from '../schedules/dto/create-schedule.dto'
import { UserInfo } from '../users/dto/user-info-detail.dto'
import { User } from '@/entities/user.entity'

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(UserGroup)
    private userGroupRepository: Repository<UserGroup>,
    @InjectRepository(GroupInvitation)
    private groupInvitationRepository: Repository<GroupInvitation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private usersService: UsersService,
    @InjectRepository(GroupSchedule)
    private groupScheduleRepository: Repository<GroupSchedule>,
  ) {}

  async createGroup(
    createGroupDto: CreateGroupDto,
  ): Promise<GroupInfoResponseDto> {
    const { groupName, creatorUuid } = createGroupDto

    const existingGroup = await this.userGroupRepository.findOne({
      where: { userUuid: creatorUuid },
      relations: ['group'],
    })

    if (existingGroup && existingGroup.group.groupName === groupName) {
      throw new BadRequestException(
        '동일 그룹명을 가진 그룹에 소속되어 있습니다.',
      )
    }

    const newGroup = this.groupRepository.create({ groupName })
    const savedGroup = await this.groupRepository.save(newGroup)

    const userGroup = this.userGroupRepository.create({
      userUuid: creatorUuid,
      group: savedGroup,
      isAdmin: true,
    })
    await this.userGroupRepository.save(userGroup)

    const response: GroupInfoResponseDto = {
      groupId: savedGroup.groupId,
      groupName: savedGroup.groupName,
      createdAt: savedGroup.createdAt,
      memberCount: 1,
      isAdmin: true,
    }

    return response
  }

  async deleteGroup(groupId: number, adminUuid: string): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { groupId },
      relations: ['userGroups'],
    })

    if (!group) {
      throw new NotFoundException('해당 그룹을 찾을 수 없습니다.')
    }

    const adminUserGroup = group.userGroups.find(
      (ug) => ug.userUuid === adminUuid && ug.isAdmin,
    )

    if (!adminUserGroup) {
      throw new ForbiddenException('그룹 관리자만이 그룹을 삭제할 수 있습니다.')
    }

    await this.groupInvitationRepository.delete({
      group: { groupId },
    })

    await this.userGroupRepository.delete({
      group: { groupId },
    })

    await this.groupRepository.delete({ groupId })
  }

  async getUserGroups(userUuid: string): Promise<GroupInfoResponseDto[]> {
    const userGroups = await this.userGroupRepository.find({
      where: { userUuid: userUuid },
      relations: ['group'],
    })

    if (!userGroups || userGroups.length === 0) {
      return []
    }

    const groupIds = userGroups.map((ug) => ug.group.groupId)

    // 멤버 수 계산
    const memberCounts = await this.groupRepository
      .createQueryBuilder('group')
      .select('group.groupId', 'groupId')
      .addSelect('COUNT(userGroup.userGroupId)', 'memberCount')
      .leftJoin('group.userGroups', 'userGroup')
      .where('group.groupId IN (:...groupIds)', { groupIds })
      .groupBy('group.groupId')
      .getRawMany()

    // 맵 변환 : 빠른 접근!
    const memberCountMap = new Map(
      memberCounts.map((mc) => [mc.groupId, parseInt(mc.memberCount)]),
    )

    return userGroups
      .map((userGroup) => {
        if (!userGroup.group) {
          console.error(
            `해당 유저 그룹 ID : ${userGroup.userGroupId} 를 가진 그룹을 찾을 수 없습니다.`,
          )
          return null
        }
        return {
          groupId: userGroup.group.groupId,
          groupName: userGroup.group.groupName,
          createdAt: userGroup.group.createdAt,
          memberCount: memberCountMap.get(userGroup.group.groupId) || 0,
          isAdmin: userGroup.isAdmin,
        }
      })
      .filter(Boolean) // null 값 제거
  }

  async getGroupMembers(
    groupId: number,
    requestingUserUuid: string,
  ): Promise<GroupMemberResponseDto[]> {
    // 먼저 요청한 사용자가 해당 그룹의 멤버인지 확인
    const requestingUserGroup = await this.userGroupRepository.findOne({
      where: { group: { groupId }, userUuid: requestingUserUuid },
    })

    if (!requestingUserGroup) {
      throw new ForbiddenException('당신은 해당 그룹의 멤버가 아닙니다.')
    }

    const userGroups = await this.userGroupRepository.find({
      where: { group: { groupId } },
      order: { createdAt: 'ASC' },
    })

    if (!userGroups || userGroups.length === 0) {
      throw new NotFoundException(
        `해당 그룹 ID : ${groupId} 를 가진 그룹의 구성원이 없습니다.`,
      )
    }

    const groupMembers: GroupMemberResponseDto[] = await Promise.all(
      userGroups.map(async (userGroup) => {
        const user = await this.usersService.findOne(userGroup.userUuid)
        return {
          userUuid: userGroup.userUuid,
          name: user.name,
          isAdmin: userGroup.isAdmin,
          joinedAt: userGroup.createdAt,
        }
      }),
    )

    return groupMembers
  }
  async removeGroupMember(
    removeGroupMemberDto: RemoveGroupMemberDto,
    adminUuid: string,
  ): Promise<void> {
    const { groupId, memberUuid } = removeGroupMemberDto
    console.log(removeGroupMemberDto)
    // 그룹 존재 여부 확인
    const group = await this.groupRepository.findOne({
      where: { groupId },
      relations: ['userGroups'],
    })

    if (!group) {
      throw new NotFoundException('해당 그룹을 찾을 수 없습니다.')
    }

    // 요청자가 그룹의 관리자인지 확인
    const adminUserGroup = group.userGroups.find(
      (ug) => ug.userUuid === adminUuid && ug.isAdmin,
    )
    if (!adminUserGroup) {
      throw new ForbiddenException('그룹 관리자만이 멤버를 추방할 수 있습니다.')
    }

    // 추방할 멤버가 그룹에 존재하는지 확인
    const memberUserGroup = await this.userGroupRepository.findOne({
      where: { group: { groupId }, userUuid: memberUuid },
    })

    if (!memberUserGroup) {
      throw new NotFoundException('해당 멤버를 그룹에서 찾을 수 없습니다.')
    }

    // 관리자가 자신을 추방하려는 경우 방지
    if (adminUuid === memberUuid) {
      throw new ForbiddenException('자신을 그룹에서 추방할 수 없습니다.')
    }

    // 멤버 추방 (UserGroup 엔티티 삭제)
    await this.userGroupRepository.remove(memberUserGroup)

    // GroupInvitation 상태를 REMOVED로 업데이트
    const invitation = await this.groupInvitationRepository.findOne({
      where: { group: { groupId }, inviteeUuid: memberUuid },
    })

    if (invitation) {
      invitation.status = InvitationStatus.REMOVED
      await this.groupInvitationRepository.save(invitation)
    }
  }
  async getGroupDetail(
    groupId: number,
    userUuid: string,
  ): Promise<GroupDetailResponseDto> {
    const group = await this.groupRepository.findOne({
      where: { groupId },
      relations: ['userGroups'],
    })

    if (!group) {
      throw new NotFoundException('해당 그룹을 찾을 수 없습니다.')
    }

    const userGroup = group.userGroups.find((ug) => ug.userUuid === userUuid)

    if (!userGroup) {
      throw new ForbiddenException('당신은 해당 그룹의 멤버가 아닙니다.')
    }

    const memberCount = group.userGroups.length

    const members: GroupMemberResponseDto[] = await Promise.all(
      group.userGroups.map(async (ug) => {
        const user = await this.usersService.findOne(ug.userUuid)
        return {
          userUuid: ug.userUuid,
          name: user.name,
          isAdmin: ug.isAdmin,
          joinedAt: ug.createdAt,
        }
      }),
    )

    // 가입 일시순으로 정렬
    members.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())

    return {
      groupId: group.groupId,
      groupName: group.groupName,
      createdAt: group.createdAt,
      memberCount,
      isAdmin: userGroup.isAdmin,
      members,
    }
  }

  async linkScheduleToGroupsAndUsers(
    schedule: Schedule,
    groupInfo: GroupInfo[],
  ): Promise<void> {
    for (const info of groupInfo) {
      const group = await this.groupRepository.findOne({
        where: { groupId: info.groupId },
      })
      if (!group) {
        throw new BadRequestException(
          `그룹 ID ${info.groupId}를 찾을 수 없습니다.`,
        )
      }

      for (const userUuid of info.userUuids) {
        const groupSchedule = this.groupScheduleRepository.create({
          userUuid,
          group,
          schedule,
        })
        await this.groupScheduleRepository.save(groupSchedule)
      }
    }
  }

  async getUsersForGroup(groupId: number): Promise<UserInfo[]> {
    const userGroups = await this.userGroupRepository.find({
      where: { group: { groupId } },
      relations: ['group'],
    })

    if (userGroups.length === 0) {
      throw new NotFoundException(
        `해당 그룹ID :  ${groupId} 를 가진 그룹의 멤버가 없습니다.`,
      )
    }

    const userUuids = userGroups.map((ug) => ug.userUuid)

    // findByIds 대신 where 조건을 사용하여 쿼리 수행
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.userUuid IN (:...userUuids)', { userUuids })
      .getMany()

    return users.map((user) => ({
      userUuid: user.userUuid,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      isAdmin: userGroups.find((ug) => ug.userUuid === user.userUuid).isAdmin,
    }))
  }
  async removeGroupMembersFromSchedule(
    scheduleId: number,
    groupInfo: GroupInfo[],
  ): Promise<void> {
    for (const group of groupInfo) {
      try {
        const groupUsers = await this.getUsersForGroup(group.groupId)
        const validUserUuids = groupUsers.map((user) => user.userUuid)

        for (const userUuid of group.userUuids) {
          if (validUserUuids.includes(userUuid)) {
            await this.groupScheduleRepository.delete({
              schedule: { scheduleId },
              group: { groupId: group.groupId },
              userUuid,
            })
          } else {
            console.warn(
              `사용자 ${userUuid}는 그룹 ${group.groupId}의 멤버가 아닙니다. 제거를 건너뜁니다.`,
            )
          }
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          console.error(
            `그룹 ${group.groupId}에 대한 사용자 정보를 찾을 수 없습니다: ${error.message}`,
          )
        } else {
          throw new InternalServerErrorException(
            `그룹 멤버 제거 중 오류가 발생했습니다: ${error.message}`,
          )
        }
      }
    }
  }

  /**
   * 기존 그룹 관계 검증
   */
  async validateExistingGroupRelation(
    groupId: number,
    userUuid: string,
  ): Promise<void> {
    const existingMember = await this.userGroupRepository.findOne({
      where: {
        group: { groupId },
        userUuid,
      },
    })

    if (existingMember) {
      throw new BadRequestException('이미 그룹의 멤버입니다.')
    }
  }

  /**
   * 그룹 존재 여부 확인
   * @param groupId 검증할 그룹 ID
   */
  async validateGroup(groupId: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { groupId },
    })
    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다.')
    }
    return group
  }

  /**
   * 그룹에 멤버 추가
   * @param groupId 그룹 ID
   * @param userUuid 추가할 사용자 UUID
   * @param isAdmin 관리자 여부 (기본값: false)
   */
  async addMemberToGroup(
    groupId: number,
    userUuid: string,
    isAdmin: boolean = false,
  ): Promise<UserGroup> {
    // 그룹과 사용자 존재 확인
    const [group, user] = await Promise.all([
      this.validateGroup(groupId),
      this.usersService.getUserByUuid(userUuid),
    ])

    // 이미 그룹 멤버인지 확인
    this.validateExistingGroupRelation(groupId, userUuid)

    // 새로운 그룹 멤버 관계 생성
    const userGroup = this.userGroupRepository.create({
      group,
      userUuid,
      user,
      isAdmin,
    })

    return await this.userGroupRepository.save(userGroup)
  }

  /**
   * 사용자가 그룹의 관리자인지 확인
   * @param groupId 그룹 ID
   * @param userUuid 확인할 사용자 UUID
   */
  async validateGroupAdmin(
    groupId: number,
    userUuid: string,
  ): Promise<boolean> {
    const userGroup = await this.userGroupRepository.findOne({
      where: {
        group: { groupId },
        userUuid,
        isAdmin: true,
      },
    })

    if (!userGroup) {
      throw new ForbiddenException('해당 그룹의 관리자가 아닙니다.')
    }

    return true
  }
}
