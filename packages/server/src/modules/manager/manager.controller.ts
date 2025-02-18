import { Controller, Param, Get, Delete, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { ManagerService } from './manager.service'
import { UserResponseDto } from '../users/dto/user-response.dto'
import { AuthGuard } from '@nestjs/passport'
import { GetUserUuid } from '@/common/decorators/get-user-uuid.decorator'

@ApiTags('Manager')
@Controller('manager')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('Access-Token')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

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
