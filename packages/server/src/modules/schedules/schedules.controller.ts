import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Patch,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AuthGuard } from '@nestjs/passport'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { ResponseScheduleDto } from './dto/response-schedule.dto'
import { SchedulesService } from './schedules.service'
import { OCRTranscriptionService } from './OCR-transcription.service'
import { ManagerService } from '../manager/manager.service'
import { AiService } from './ai.service'
import { GetUserUuid } from '@/common/decorators/get-user-uuid.decorator'
import {
  ApplySchedulesDocs,
  GetSchedulesByDateDocs,
  GetSchedulesByWeekDocs,
  GetSchedulesByMonthDocs,
  GetSchedulesByYearDocs,
  GetSchedulesByDateRangeDocs,
  GetAllSchedulesDocs,
  GetScheduleByIdDocs,
  CreateScheduleDocs,
  UpdateScheduleDocs,
  DeleteScheduleDocs,
  UploadVoiceScheduleRTZRDocs,
  UploadVoiceScheduleWhisperDocs,
  UploadImageScheduleDocs,
} from './schedules.docs'

@UseGuards(AuthGuard('jwt'))
@Controller('schedules')
@ApplySchedulesDocs()
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly ocrTranscriptionService: OCRTranscriptionService,
    private readonly managerService: ManagerService,
    private readonly aiService: AiService,
  ) {}

  @Get('day')
  @GetSchedulesByDateDocs()
  async getSchedulesByDate(
    @GetUserUuid() managerUuid: string,
    @Query('date') date: string,
    @Query('userUuid') queryUserUuid?: string,
  ): Promise<ResponseScheduleDto[]> {
    const subordinateUuid = queryUserUuid || managerUuid

    if (subordinateUuid !== managerUuid) {
      const isManager =
        await this.managerService.validateAndCheckManagerRelation(
          managerUuid,
          subordinateUuid,
        )
      if (!isManager) {
        throw new ForbiddenException(
          '해당 사용자의 일정을 조회할 권한이 없습니다.',
        )
      }
    }
    return this.schedulesService.findByDate({
      userUuid: subordinateUuid,
      date: new Date(date),
    })
  }

  @Get('week')
  @GetSchedulesByWeekDocs()
  async getSchedulesByWeek(
    @GetUserUuid() managerUuid: string,
    @Query('userUuid') queryUserUuid: string,
    @Query('date') date: string,
  ): Promise<ResponseScheduleDto[]> {
    const subordinateUuid = queryUserUuid || managerUuid

    if (subordinateUuid !== managerUuid) {
      const isManager =
        await this.managerService.validateAndCheckManagerRelation(
          managerUuid,
          subordinateUuid,
        )
      if (!isManager) {
        throw new ForbiddenException(
          '해당 사용자의 일정을 조회할 권한이 없습니다.',
        )
      }
    }

    return this.schedulesService.findByWeek(subordinateUuid, date)
  }

  @Get('month')
  @GetSchedulesByMonthDocs()
  async getSchedulesByMonth(
    @GetUserUuid() managerUuid: string,
    @Query('userUuid') queryUserUuid: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ): Promise<ResponseScheduleDto[]> {
    const subordinateUuid = queryUserUuid || managerUuid

    if (subordinateUuid !== managerUuid) {
      const isManager =
        await this.managerService.validateAndCheckManagerRelation(
          managerUuid,
          subordinateUuid,
        )
      if (!isManager) {
        throw new ForbiddenException(
          '해당 사용자의 일정을 조회할 권한이 없습니다.',
        )
      }
    }
    return this.schedulesService.findByMonth(subordinateUuid, year, month)
  }

  @Get('year')
  @GetSchedulesByYearDocs()
  async getSchedulesByYear(
    @GetUserUuid() userUuid: string,
    @Query('userUuid') queryUserUuid: string,
    @Query('year') year: number,
  ): Promise<ResponseScheduleDto[]> {
    const targetUuid = queryUserUuid || userUuid
    return this.schedulesService.findByYear(targetUuid, year)
  }

  @Get('range')
  @GetSchedulesByDateRangeDocs()
  async getSchedulesByDateRange(
    @GetUserUuid() managerUuid: string,
    @Query('userUuid') queryUserUuid: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ResponseScheduleDto[]> {
    const subordinateUuid = queryUserUuid || managerUuid

    if (subordinateUuid !== managerUuid) {
      const isManager =
        await this.managerService.validateAndCheckManagerRelation(
          managerUuid,
          subordinateUuid,
        )
      if (!isManager) {
        throw new ForbiddenException(
          '해당 사용자의 일정을 조회할 권한이 없습니다.',
        )
      }
    }

    return this.schedulesService.getSchedulesInRange(
      subordinateUuid,
      new Date(startDate),
      new Date(endDate),
    )
  }

  @Get('all')
  @GetAllSchedulesDocs()
  async getAllSchedulesByUserUuid(
    @GetUserUuid() userUuid: string,
  ): Promise<ResponseScheduleDto[]> {
    return this.schedulesService.findAllByUserUuid(userUuid)
  }

  @Get(':id')
  @GetScheduleByIdDocs()
  async getScheduleById(@Param('id') id: number): Promise<ResponseScheduleDto> {
    return await this.schedulesService.findOne(id)
  }

  @Post()
  @CreateScheduleDocs()
  async createSchedule(
    @GetUserUuid() userUuid: string,
    @Body() createScheduleDto: CreateScheduleDto,
  ): Promise<ResponseScheduleDto> {
    return await this.schedulesService.createSchedule(
      userUuid,
      createScheduleDto,
    )
  }

  @Patch(':id')
  @UpdateScheduleDocs()
  async updateSchedule(
    @GetUserUuid() userUuid: string,
    @Param('id') id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Query('instanceDate') instanceDate: string,
    @Query('updateType') updateType: 'single' | 'future' = 'single',
  ): Promise<ResponseScheduleDto> {
    return await this.schedulesService.updateSchedule(
      userUuid,
      id,
      updateScheduleDto,
      new Date(instanceDate),
      updateType,
    )
  }

  @Delete(':id')
  @DeleteScheduleDocs()
  async deleteSchedule(
    @GetUserUuid() userUuid: string,
    @Param('id') id: number,
    @Query('userUuid') queryUserUuid: string,
    @Query('instanceDate') instanceDate: string,
    @Query('deleteType') deleteType: 'single' | 'future' = 'single',
  ): Promise<{ message: string }> {
    const targetUuid = queryUserUuid || userUuid
    await this.schedulesService.deleteSchedule(
      targetUuid,
      id,
      instanceDate,
      deleteType,
    )
    return { message: '일정이 성공적으로 삭제되었습니다.' }
  }

  @Post('upload/RTZR')
  @UseInterceptors(FileInterceptor('audio'))
  @UploadVoiceScheduleRTZRDocs()
  async uploadVoiceScheduleByRTZR(
    @GetUserUuid() userUuid: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('currentDateTime') currentDateTime: string,
  ): Promise<CreateScheduleDto[]> {
    return await this.aiService.transcribeRTZRAndFetchResultWithGpt(
      file,
      currentDateTime,
      userUuid,
    )
  }

  @Post('upload/Whisper')
  @UseInterceptors(FileInterceptor('audio'))
  @UploadVoiceScheduleWhisperDocs()
  async uploadVoiceScheduleByWhisper(
    @GetUserUuid() userUuid: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('currentDateTime') currentDateTime: string,
  ): Promise<CreateScheduleDto[]> {
    return await this.aiService.transcribeWhisperAndFetchResultWithGpt(
      file,
      currentDateTime,
      userUuid,
    )
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @UploadImageScheduleDocs()
  async uploadImageScheduleClova(
    @UploadedFile() file: Express.Multer.File,
    @GetUserUuid() userUuid: string,
  ): Promise<CreateScheduleDto[]> {
    return await this.ocrTranscriptionService.processMedicationImage(
      file,
      userUuid,
    )
  }
}
