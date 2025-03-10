import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UsersRoutineService } from './users-routine.service'
import { UserRoutineResponseDto } from './dto/response-user-routine.dto'
import { UpdateUserRoutineDto } from './dto/update-user-routine.dto'
import { AuthGuard } from '@nestjs/passport'
import { GetUserUuid } from '@/common/decorators/get-user-uuid.decorator'
import { BusinessException } from '@/common/exception/business.exception'
import { ErrorCode } from '@/common/exception/error-codes.enum'

@ApiTags('Users-Routine')
@Controller('users-routine')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('Access-Token')
export class UsersRoutineController {
  constructor(private readonly usersRoutineService: UsersRoutineService) {}

  @Put()
  @ApiOperation({ summary: '유저 루틴 정보 업데이트' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: UserRoutineResponseDto,
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 (유효하지 않은 UUID, 잘못된 시간 순서)',
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  async updateUserRoutine(
    @GetUserUuid() userUuid: string,
    @Body() updateDto: UpdateUserRoutineDto,
  ): Promise<UserRoutineResponseDto> {
    try {
      return await this.usersRoutineService.updateUserRoutine(
        userUuid,
        updateDto,
      )
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error
      }
      if (
        error instanceof Error &&
        error.message === '시간 순서가 올바르지 않습니다.'
      ) {
        throw new BusinessException(
          ErrorCode.INVALID_INPUT_VALUE,
          error.message,
        )
      }
      throw new BusinessException(
        ErrorCode.INVALID_INPUT_VALUE,
        '잘못된 요청입니다.',
      )
    }
  }

  @Get()
  @ApiOperation({ summary: '유저 루틴 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: UserRoutineResponseDto,
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 (예: 유효하지 않은 UUID)',
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  async getUserRoutine(
    @GetUserUuid() userUuid: string,
  ): Promise<UserRoutineResponseDto> {
    try {
      return await this.usersRoutineService.getUserRoutine(userUuid)
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error
      }
      throw new BusinessException(
        ErrorCode.INVALID_INPUT_VALUE,
        '잘못된 요청입니다.',
      )
    }
  }
}
