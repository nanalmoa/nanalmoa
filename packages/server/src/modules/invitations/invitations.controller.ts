import { Controller, Get, UseGuards } from '@nestjs/common'
import { InvitationsService } from './invitations.service'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { InvitationsDto } from './dto/invitations.dto'
import { UsersService } from '../users/users.service'
import { GetUserUuid } from '@/common/decorators/get-user-uuid.decorator'
import { BusinessException } from '@/common/exception/business.exception'
import { ErrorCode } from '@/common/exception/error-codes.enum'

@ApiTags('Invitations')
@Controller('invitations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('Access-Token')
export class InvitationsController {
  constructor(
    private readonly invitationService: InvitationsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('user')
  @ApiOperation({
    summary: '사용자 초대 조회',
    description: '본인과 관련된 사용자의 모든 초대를 조회합니다',
  })
  @ApiResponse({
    status: 200,
    description: '초대 조회 성공',
    type: [InvitationsDto],
  })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserInvitations(
    @GetUserUuid() userUuid: string,
  ): Promise<InvitationsDto[]> {
    const userExists = await this.usersService.checkUserExists(userUuid)
    if (!userExists) {
      throw new BusinessException(
        ErrorCode.USER_NOT_FOUND,
        '사용자를 찾을 수 없습니다.',
      )
    }

    return this.invitationService.getUserInvitations(userUuid)
  }
}
