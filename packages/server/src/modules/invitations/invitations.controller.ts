// src/modules/invitations/invitations.controller.ts

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
import { InvitationsDto } from './dto/invitations.dto'

@ApiTags('Invitations')
@ApiBearerAuth()
@Controller('invitations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('Access-Token')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiOperation({
    summary: '초대 생성',
    description: '그룹/매니저 초대를 생성합니다.',
  })
  @ApiBody({ type: CreateInvitationDto })
  @ApiResponse({
    status: 201,
    description: '성공',
    type: InvitationResponseDto,
  })
  async createInvitation(
    @GetUserUuid() userUuid: string,
    @Body() createInvitationDto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.createInvitation(
      userUuid,
      createInvitationDto,
    )
  }

  @Get('user')
  @ApiOperation({ summary: '사용자 기준 초대 전체 조회' })
  @ApiResponse({ status: 200, type: [InvitationsDto] })
  async getUserInvitations(
    @GetUserUuid() userUuid: string,
  ): Promise<InvitationsDto[]> {
    console.log('[InvitationsController] userUuid from decorator:', userUuid)

    return this.invitationsService.getUserInvitations(userUuid)
  }

  @Get(':id')
  @ApiOperation({ summary: '단일 초대 조회' })
  @ApiResponse({ status: 200, type: InvitationResponseDto })
  async getInvitation(
    @GetUserUuid() userUuid: string,
    @Param('id', ParseIntPipe) invitationId: number,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.getInvitation(invitationId, userUuid)
  }

  @Get()
  @ApiOperation({ summary: '모든 초대 목록 조회' })
  @ApiResponse({ status: 200, type: InvitationsResponseDto })
  async getAllInvitations(
    @GetUserUuid() userUuid: string,
  ): Promise<InvitationsResponseDto> {
    return this.invitationsService.getAllInvitations(userUuid)
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: '초대 수락' })
  async acceptInvitation(
    @GetUserUuid() userUuid: string,
    @Param('id', ParseIntPipe) invitationId: number,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.acceptInvitation(invitationId, userUuid)
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: '초대 거절' })
  async rejectInvitation(
    @GetUserUuid() userUuid: string,
    @Param('id', ParseIntPipe) invitationId: number,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.rejectInvitation(invitationId, userUuid)
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '초대 취소' })
  async cancelInvitation(
    @GetUserUuid() userUuid: string,
    @Param('id', ParseIntPipe) invitationId: number,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.cancelInvitation(invitationId, userUuid)
  }
}
