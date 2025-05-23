import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsUUID } from 'class-validator'
// group admin이 그룹원을 제거할 때 사용
export class RemoveGroupMemberDto {
  @ApiProperty({ description: '그룹 ID', example: 1 })
  @Type(() => Number)
  groupId: number

  @ApiProperty({
    description: '제거할 사용자 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  memberUuid: string
}
