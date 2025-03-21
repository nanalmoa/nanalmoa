import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { UsersService } from './users.service'
import {
  SearchUserResponseSchema,
  UserResponseSchema,
} from './schema/response.schema'
import { User } from '@/entities/user.entity'
import { UpdateUserDto } from './dto/update-user.dto'
import { AuthService } from '@/auth/auth.service'
import { DataSource } from 'typeorm'
import { AuthProvider } from '@/entities/auth.entity'
import { InjectDataSource } from '@nestjs/typeorm'
import { GetUserUuid } from '@/common/decorators/get-user-uuid.decorator'
import { BusinessException } from '@/common/exception/business.exception'
import { ErrorCode } from '@/common/exception/error-codes.enum'

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('Access-Token')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get('me')
  @ApiBearerAuth('Access-Token')
  @ApiOperation({ summary: '현재 로그인한 사용자 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '현재 사용자 정보 반환',
    schema: UserResponseSchema,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async getCurrentUser(@GetUserUuid() userUuid: string) {
    return this.usersService.getUserByUuid(userUuid)
  }

  @Post('search')
  @ApiOperation({
    summary: '사용자 검색',
    description: '전화번호, 이메일, 또는 이름으로 사용자 검색',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['keyword'],
      properties: {
        keyword: {
          type: 'string',
          description: '검색 키워드 (전화번호, 이메일, 또는 이름)',
          example: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '검색된 사용자 정보 반환',
    schema: SearchUserResponseSchema,
    isArray: true,
  })
  async searchUser(@Body('keyword') keyword: string): Promise<User[]> {
    return this.usersService.searchUser(keyword)
  }

  @Put('update')
  @ApiOperation({ summary: '회원정보 수정' })
  @ApiResponse({ status: 200, description: '회원정보 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async updateUserInfo(
    @GetUserUuid() userUuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { name, phoneNumber, email, address } = updateUserDto

    const currentUser = await this.usersService.getUserByUuid(userUuid)

    if (phoneNumber && phoneNumber !== currentUser.phoneNumber) {
      const isVerified = this.authService.isPhoneNumberVerified(phoneNumber)
      if (!isVerified) {
        throw new BusinessException(
          ErrorCode.INVALID_INPUT_VALUE,
          '전화번호 인증이 필요합니다. 먼저 인증을 완료해주세요.',
        )
      }
    }

    if (email && email !== currentUser.email) {
      // 이메일 중복 검사
      const isEmailTaken = await this.usersService.isEmailTaken(email, userUuid)
      if (isEmailTaken) {
        throw new BusinessException(
          ErrorCode.USER_EMAIL_DUPLICATED,
          '이미 사용 중인 이메일 주소입니다.',
        )
      }

      // 이메일 인증 확인
      const isVerified = this.authService.isEmailVerified(email)
      if (!isVerified) {
        throw new BusinessException(
          ErrorCode.INVALID_INPUT_VALUE,
          '이메일 인증이 필요합니다. 먼저 인증을 완료해주세요.',
        )
      }
    }

    const updatedUser = await this.usersService.updateUser(userUuid, {
      name,
      phoneNumber,
      email,
      address,
    })

    return {
      message: '회원정보가 성공적으로 수정되었습니다.',
      user: updatedUser,
    }
  }

  @Delete('delete')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async deleteAccount(
    @GetUserUuid() userUuid: string,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner()

    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { userUuid },
        relations: ['auths', 'schedules'],
      })

      if (!user) {
        throw new BusinessException(
          ErrorCode.USER_NOT_FOUND,
          '사용자를 찾을 수 없습니다.',
        )
      }

      // OAuth 서비스 연동 해제
      for (const auth of user.auths) {
        if (
          auth.authProvider === AuthProvider.KAKAO ||
          auth.authProvider === AuthProvider.NAVER
        ) {
          await this.authService.revokeSocialConnection(
            userUuid,
            auth.refreshToken,
            auth.authProvider,
          )
        }
      }

      await queryRunner.manager.remove(user.auths)

      await queryRunner.manager.remove(user.schedules)

      await queryRunner.manager.remove(user)

      await queryRunner.commitTransaction()

      return { message: '회원 탈퇴가 성공적으로 처리되었습니다.' }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      console.error('회원 탈퇴 처리 중 오류:', error)
      if (error instanceof BusinessException) {
        throw error
      }
      throw new BusinessException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        '회원 탈퇴 처리 중 오류가 발생했습니다.',
      )
    } finally {
      await queryRunner.release()
    }
  }
}
