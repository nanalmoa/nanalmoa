import {
  Controller,
  Post,
  Param,
  Get,
  Query,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { ManagerService } from './manager.service'
import { ManagerInvitation } from 'src/entities/manager-invitation.entity'
import { UserResponseDto } from '../users/dto/user-response.dto'
import { AuthGuard } from '@nestjs/passport'
import { InvitationResponseDto } from './dto/response-invitation.dto'
import { GetUserUuid } from '@/common/decorators/get-user-uuid.decorator'

@ApiTags('Manager')
@Controller('manager')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('Access-Token')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post('invitation')
  @ApiOperation({ summary: '새로운 관리자 초대 생성' })
  @ApiResponse({
    status: 201,
    description: '초대가 성공적으로 생성됨',
    type: InvitationResponseDto,
  })
  async createInvitation(
    @Query('subordinateUuid') subordinateUuid: string,
    @GetUserUuid() managerUuid: string,
  ): Promise<InvitationResponseDto> {
    return this.managerService.createInvitation({
      managerUuid,
      subordinateUuid,
    })
  }

  @Get('invitation/send')
  @ApiOperation({ summary: '내가 보낸 초대 현황' })
  @ApiResponse({
    status: 200,
    description: '초대 보낸 정보 조회 성공',
    type: [InvitationResponseDto],
  })
  async getInvitationSend(
    @GetUserUuid() managerUuid: string,
  ): Promise<InvitationResponseDto[]> {
    return this.managerService.getInvitationSend({ managerUuid })
  }

  @Get('invitation/received')
  @ApiOperation({ summary: '내가 받은 초대 현황' })
  @ApiResponse({
    status: 200,
    description: '초대 받은 정보 조회 성공',
    type: [InvitationResponseDto],
  })
  async getInvitationReceived(
    @GetUserUuid() subordinateUuid: string,
  ): Promise<InvitationResponseDto[]> {
    return this.managerService.getInvitationReceived({ subordinateUuid })
  }

  @Get('invitation/user')
  @ApiOperation({ summary: '보낸 유저와 받은 유저 초대 현황(삭제 예정)' })
  @ApiResponse({
    status: 200,
    description: '두 유저의 초대 상태',
    type: InvitationResponseDto,
  })
  async getInvitationUsers(
    @Query('managerUuid') managerUuid: string,
    @Query('subordinateUuid') subordinateUuid: string,
  ): Promise<InvitationResponseDto> {
    return this.managerService.getInvitationUsers({
      managerUuid,
      subordinateUuid,
    })
  }

  @Get('invitation/:id')
  @ApiOperation({ summary: '초대 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '초대 정보 조회 성공',
    type: InvitationResponseDto,
  })
  async getInvitation(@Param('id') id: number): Promise<InvitationResponseDto> {
    return this.managerService.getInvitation(id)
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: '초대 수락' })
  @ApiResponse({
    status: 200,
    description: '초대가 성공적으로 수락됨',
    type: ManagerInvitation,
  })
  async acceptInvitation(
    @Param('id') id: number,
    @GetUserUuid() subordinateUuid: string,
  ): Promise<InvitationResponseDto> {
    return this.managerService.acceptInvitation(id, subordinateUuid)
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: '초대 거절' })
  @ApiResponse({
    status: 200,
    description: '초대가 성공적으로 거절됨',
    type: InvitationResponseDto,
  })
  async rejectInvitation(
    @Param('id') id: number,
    @GetUserUuid() subordinateUuid: string,
  ): Promise<InvitationResponseDto> {
    return this.managerService.rejectInvitation(id, subordinateUuid)
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '초대 철회' })
  @ApiResponse({
    status: 200,
    description: '초대가 성공적으로 철회됨',
    type: ManagerInvitation,
  })
  async cancelInvitation(
    @Param('id') id: number,
    @GetUserUuid() managerUuid: string,
  ): Promise<InvitationResponseDto> {
    return this.managerService.cancelInvitation(id, managerUuid)
  }

  @Delete('subordinate/:subordinateUuid')
  @ApiOperation({ summary: '내가 관리자일 때, 관리자-피관리자 관계 제거' })
  @ApiResponse({
    status: 200,
    description: '관리자-피관리자 관계가 성공적으로 제거됨',
  })
  async removeSubordinate(
    @Param('subordinateUuid') subordinateUuid: string,
    @GetUserUuid() managerUuid: string,
  ): Promise<void> {
    return this.managerService.removeManagerSubordinate(
      managerUuid,
      subordinateUuid,
    )
  }

  @Delete('manager/:managerUuid')
  @ApiOperation({ summary: '내가 피관리자일 때, 관리자-피관리자 관계 제거' })
  @ApiResponse({
    status: 200,
    description: '관리자-피관리자 관계가 성공적으로 제거됨',
  })
  async removeManager(
    @Param('managerUuid') managerUuid: string,
    @GetUserUuid() subordinateUuid: string,
  ): Promise<void> {
    return this.managerService.removeManagerSubordinate(
      managerUuid,
      subordinateUuid,
    )
  }

  @Get('managers')
  @ApiOperation({ summary: '자신의 관리자 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '관리자 목록 조회 성공',
    type: [UserResponseDto],
  })
  async getManagerList(
    @GetUserUuid() subordinateUuid: string,
  ): Promise<UserResponseDto[]> {
    return this.managerService.getManagerList(subordinateUuid)
  }

  @Get('subordinates')
  @ApiOperation({ summary: '자신의 피관리자 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '피관리자 목록 조회 성공',
    type: [UserResponseDto],
  })
  async getSubordinateList(
    @GetUserUuid() managerUuid: string,
  ): Promise<UserResponseDto[]> {
    return this.managerService.getSubordinateList(managerUuid)
  }
}
