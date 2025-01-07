import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { Repository } from 'typeorm'
import { UsersService } from '../users/users.service'
import { VoiceTranscriptionService } from './voice-transcription.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { Category } from '@/entities/category.entity'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class AiService {
  private readonly openai: OpenAI

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly voiceTranscriptionService: VoiceTranscriptionService,
    private readonly usersService: UsersService,
  ) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY')
    this.openai = new OpenAI({ apiKey: openaiApiKey })
  }

  /**
   * 날짜를 YYYY-MM-DD HH:mm:ss 형식으로 변환합니다.
   */
  private async formatDateToYYYYMMDDHHMMSS(date: Date): Promise<string> {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  /**
   * GPT 응답을 파싱합니다.
   */
  parseGptResponse(response: string): any[] {
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Error parsing GPT response:', error)
      throw new Error('Failed to parse GPT response')
    }
  }

  /**
   * 전사 데이터를 OpenAI GPT 모델에 넘겨서 처리합니다.
   */
  private async processWithGpt(
    transcriptionResult: any,
    currentDateTime: string,
  ): Promise<CreateScheduleDto[]> {
    const formattedDate = await this.formatDateToYYYYMMDDHHMMSS(
      new Date(currentDateTime),
    )
    const openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    })
    const gptResponse = await openai.chat.completions.create({
      model: this.configService.get<string>('OPENAI_FINETUNING_MODEL'),
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that extracts startDate, endDate, title, place, isAllDay, and category information from conversations. 카테고리[병원, 복약, 가족, 종교, 운동, 경조사, 기타]',
        },
        {
          role: 'user',
          content: `{Today : ${formattedDate}, conversations : ${transcriptionResult}}`,
        },
      ],
    })
    const gptResponseContent = gptResponse.choices[0].message.content
    console.log(gptResponseContent)

    const parsedResponse = this.parseGptResponse(gptResponseContent)
    return this.convertGptResponseToCreateScheduleDto(parsedResponse)
  }

  /**
   * OCR 결과를 OpenAI GPT 모델에 넘겨서 처리합니다.
   */
  async processWithGptOCR(OCRResult: string): Promise<any> {
    const openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY_OCR'),
    })
    const gptResponse = await openai.chat.completions.create({
      model: this.configService.get<string>('OPENAI_FINETUNING_MODEL_OCR'),
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that extracts startDate, endDate, category, intent, isAllDay and place information from conversations. 카테고리[병원, 복약, 가족, 종교, 운동, 경조사, 기타]',
        },
        {
          role: 'user',
          content: `${OCRResult}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0,
    })

    const gptResponseContent = gptResponse.choices[0].message.content
    return this.parseGptResponse(gptResponseContent)
  }

  private async convertGptResponseToCreateScheduleDto(
    gptEvents: any,
  ): Promise<CreateScheduleDto[]> {
    const allCategories = await this.categoryRepository.find()
    const categoryMap = allCategories.reduce((acc, category) => {
      acc[category.categoryName] = category.categoryId
      return acc
    }, {})

    // 추가
    const eventsArray = Array.isArray(gptEvents) ? gptEvents : [gptEvents]

    console.log('gptEvents:', eventsArray)

    return eventsArray.map((event) => {
      const dto = new CreateScheduleDto()
      dto.startDate = new Date(event.startDate)
      dto.endDate = new Date(event.endDate)
      dto.title = event.intent || event.title || '새로운 일정'
      dto.place = event.place || ''
      dto.isAllDay = event.isAllDay || false
      dto.categoryId = categoryMap[event.category] || 7 // 기본값
      return dto
    })
  }

  private async validateUser(userUuid: string) {
    const userExists = await this.usersService.checkUserExists(userUuid)
    if (!userExists) {
      throw new NotFoundException(
        `해당 UUID : ${userUuid} 를 가진 사용자는 없습니다.`,
      )
    }
  }

  /**
   * RTZR을 사용하여 음성을 전사하고 GPT로 처리합니다.
   */
  async transcribeRTZRAndFetchResultWithGpt(
    file: Express.Multer.File,
    currentDateTime: string,
    userUuid: string,
  ) {
    await this.validateUser(userUuid)
    const transcribe =
      await this.voiceTranscriptionService.RTZRTranscribeResult(file)
    return this.processWithGpt(transcribe, currentDateTime)
  }

  /**
   * Whisper를 사용하여 음성을 전사하고 GPT로 처리합니다.
   */
  async transcribeWhisperAndFetchResultWithGpt(
    file: Express.Multer.File,
    currentDateTime: string,
    userUuid: string,
  ) {
    await this.validateUser(userUuid)
    const transcribe =
      await this.voiceTranscriptionService.whisperTranscribeResult(file)
    return this.processWithGpt(transcribe, currentDateTime)
  }
}
