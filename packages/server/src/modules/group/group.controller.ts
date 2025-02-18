import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { GroupService } from './group.service'
import { AuthGuard } from '@nestjs/passport'
import { GroupInfoResponseDto } from './dto/response-group.dto'
import { GroupMemberResponseDto } from './dto/response-group-member.dto'
import { GroupDetailResponseDto } from './dto/response-group-detail.dto'
import { GetUserUuid } from '@/common/decorators/get-user-uuid.decorator'

@ApiTags('Group')
@Controller('groups')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('Access-Token')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // 그룹 생성 및 관리
  @Post()
  @ApiOperation({ summary: '새 그룹 생성' })
  @ApiResponse({ status: 201, description: '그룹이 성공적으로 생성됨' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async createGroup(
    @Query('groupName') groupName: string,
    @GetUserUuid() creatorUuid: string,
  ) {
    return this.groupService.createGroup({ groupName, creatorUuid })
  }

  @Delete(':groupId')
  @ApiOperation({ summary: '그룹 삭제' })
  @ApiParam({ name: 'groupId', description: '삭제할 그룹 ID' })
  @ApiResponse({ status: 200, description: '그룹이 성공적으로 삭제됨' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '그룹을 찾을 수 없음' })
  async deleteGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @GetUserUuid() adminUuid: string,
  ) {
    await this.groupService.deleteGroup(groupId, adminUuid)
    return { message: '그룹이 성공적으로 삭제되었습니다.' }
  }

  // 그룹 정보 조회
  @Get('user')
  @ApiOperation({ summary: '사용자가 속한 그룹 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자의 그룹 목록',
    type: [GroupInfoResponseDto],
  })
  async getUserGroups(
    @GetUserUuid() userUuid: string,
  ): Promise<GroupInfoResponseDto[]> {
    return this.groupService.getUserGroups(userUuid)
  }

  @Get(':groupId/members')
  @ApiOperation({ summary: '특정 그룹의 그룹원 정보 조회' })
  @ApiParam({ name: 'groupId', description: '그룹 ID' })
  @ApiResponse({
    status: 200,
    description: '그룹원 목록',
    type: [GroupMemberResponseDto],
  })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '그룹을 찾을 수 없음' })
  async getGroupMembers(
    @Param('groupId', ParseIntPipe) groupId: number,
    @GetUserUuid() userUuid: string,
  ): Promise<GroupMemberResponseDto[]> {
    return this.groupService.getGroupMembers(groupId, userUuid)
  }

  @Delete(':groupId/members/:memberUuid')
  @ApiOperation({ summary: '그룹 멤버 추방' })
  @ApiParam({ name: 'groupId', description: '그룹 ID' })
  @ApiParam({ name: 'memberUuid', description: '추방할 멤버의 UUID' })
  @ApiResponse({ status: 200, description: '멤버가 성공적으로 추방됨' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '그룹 또는 멤버를 찾을 수 없음' })
  async removeGroupMember(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('memberUuid') memberUuid: string,
    @GetUserUuid() adminUuid: string,
  ) {
    await this.groupService.removeGroupMember(
      { groupId, memberUuid },
      adminUuid,
    )
    return { message: '멤버가 성공적으로 그룹에서 추방되었습니다.' }
  }

  @Get(':groupId')
  @ApiOperation({ summary: '상세 그룹 정보 조회' })
  @ApiParam({ name: 'groupId', description: '조회할 그룹 ID' })
  @ApiResponse({
    status: 200,
    description: '상세 그룹 정보',
    type: GroupDetailResponseDto,
  })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '그룹을 찾을 수 없음' })
  async getGroupDetail(
    @Param('groupId', ParseIntPipe) groupId: number,
    @GetUserUuid() userUuid: string,
  ): Promise<GroupDetailResponseDto> {
    return this.groupService.getGroupDetail(groupId, userUuid)
  }
}
