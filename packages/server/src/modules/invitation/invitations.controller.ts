// src/invitations/invitations.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import { GetUserUuid } from '@/common/decorators/get-user-uuid.decorator'
import { InvitationsService } from './invitations.service'
import { CreateInvitationDto } from './dto/create-invitation.dto'
import { InvitationResponseDto } from './dto/response/invitation-response.dto'
import { InvitationsResponseDto } from './dto/response/invitations-response.dto'

/**
 * 초대 관리 컨트롤러
 * 그룹 초대와 매니저 초대를 처리합니다.
 */
@ApiTags('Invitations')
@ApiBearerAuth()
@Controller('invitations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('Access-Token')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  /**
   * 초대장 생성 API
   *
   * @example
   * // 그룹 초대 예시
   * {
   *   "invitationType": "GROUP",
   *   "inviteeUuid": "550e8400-e29b-41d4-a716-446655440000",
   *   "groupId": 1
   * }
   *
   * // 매니저 초대 예시
   * {
   *   "invitationType": "MANAGER",
   *   "inviteeUuid": "550e8400-e29b-41d4-a716-446655440000"
   * }
   */
  @ApiOperation({
    summary: '초대장 생성',
    description: '새로운 그룹 또는 매니저 초대를 생성합니다.',
  })
  @ApiBody({ type: CreateInvitationDto })
  @ApiResponse({
    status: 201,
    description: '초대장 생성 성공',
    type: InvitationResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Post()
  async createInvitation(
    @GetUserUuid() userUuid: string,
    @Body() createInvitationDto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.createInvitation(
      userUuid,
      createInvitationDto,
    )
  }

  /**
   * 단일 초대장 조회 API
   * 초대한 사용자나 초대받은 사용자만 조회할 수 있습니다.
   */
  @ApiOperation({
    summary: '초대장 조회',
    description: '특정 초대장의 상세 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '초대장 조회 성공',
    type: InvitationResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '초대장을 찾을 수 없음' })
  @Get(':id')
  async getInvitation(
    @GetUserUuid() userUuid: string,
    @Param('id', ParseIntPipe) invitationId: number,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.getInvitation(invitationId, userUuid)
  }

  /**
   * 모든 초대장 목록 조회 API
   * 사용자와 관련된 모든 초대(보낸 초대/받은 초대)를 조회합니다.
   */
  @ApiOperation({
    summary: '초대장 목록 조회',
    description: '사용자의 모든 초대 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '초대장 목록 조회 성공',
    type: InvitationsResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Get()
  async getAllInvitations(
    @GetUserUuid() userUuid: string,
  ): Promise<InvitationsResponseDto> {
    return this.invitationsService.getAllInvitations(userUuid)
  }

  /**
   * 초대 수락 API
   * 초대받은 사용자만 수락할 수 있습니다.
   */
  @ApiOperation({
    summary: '초대 수락',
    description: '받은 초대를 수락합니다.',
  })
  @ApiResponse({ status: 200, description: '초대 수락 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '초대장을 찾을 수 없음' })
  @Patch(':id/accept')
  async acceptInvitation(
    @GetUserUuid() userUuid: string,
    @Param('id', ParseIntPipe) invitationId: number,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.acceptInvitation(invitationId, userUuid)
  }

  /**
   * 초대 거절 API
   * 초대받은 사용자만 거절할 수 있습니다.
   */
  @ApiOperation({
    summary: '초대 거절',
    description: '받은 초대를 거절합니다.',
  })
  @ApiResponse({ status: 200, description: '초대 거절 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '초대장을 찾을 수 없음' })
  @Patch(':id/reject')
  async rejectInvitation(
    @GetUserUuid() userUuid: string,
    @Param('id', ParseIntPipe) invitationId: number,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.rejectInvitation(invitationId, userUuid)
  }

  /**
   * 초대 취소 API
   * 초대한 사용자만 취소할 수 있습니다.
   */
  @ApiOperation({
    summary: '초대 취소',
    description: '보낸 초대를 취소합니다.',
  })
  @ApiResponse({ status: 200, description: '초대 취소 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '초대장을 찾을 수 없음' })
  @Patch(':id/cancel')
  async cancelInvitation(
    @GetUserUuid() userUuid: string,
    @Param('id', ParseIntPipe) invitationId: number,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.cancelInvitation(invitationId, userUuid)
  }
}
