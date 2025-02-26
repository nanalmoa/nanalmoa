// src/entities/invitation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { InvitationType } from '../common/enums/invitation-type.enum'
import { InvitationStatus } from '../common/enums/invitation-status.enum'
import { User } from './user.entity'
import { Group } from './group.entity'

@Entity('invitation')
export class Invitation {
  // 기본 식별자
  @PrimaryGeneratedColumn({ name: 'invitation_id' })
  invitationId: number

  // 초대 타입 (그룹/매니저)
  @Column({
    type: 'enum',
    enum: InvitationType,
    name: 'invitation_type',
  })
  invitationType: InvitationType

  // 초대 상태
  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus

  // 초대한 사용자 UUID
  @Column({ type: 'varchar', name: 'inviter_uuid' })
  inviterUuid: string

  // 초대받은 사용자 UUID
  @Column({ type: 'varchar', name: 'invitee_uuid' })
  inviteeUuid: string

  // 그룹 초대인 경우 사용되는 그룹 ID (null 허용)
  @Column({ name: 'group_id', nullable: true })
  groupId?: number

  // 생성/수정 시간
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 관계 설정
  @ManyToOne(() => Group, (group) => group.invitations, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group?: Group

  @ManyToOne(() => User, (user) => user.sentInvitations)
  @JoinColumn({ name: 'inviter_uuid', referencedColumnName: 'userUuid' })
  inviter: User

  @ManyToOne(() => User, (user) => user.receivedInvitations)
  @JoinColumn({ name: 'invitee_uuid', referencedColumnName: 'userUuid' })
  invitee: User

  // 상태 변경 메서드
  async accept(): Promise<void> {
    if (this.status !== InvitationStatus.PENDING) {
      throw new Error('대기 중인 초대만 수락할 수 있습니다')
    }
    this.status = InvitationStatus.ACCEPTED
  }

  async reject(): Promise<void> {
    if (this.status !== InvitationStatus.PENDING) {
      throw new Error('대기 중인 초대만 거절할 수 있습니다')
    }
    this.status = InvitationStatus.REJECTED
  }

  async cancel(): Promise<void> {
    if (this.status !== InvitationStatus.PENDING) {
      throw new Error('대기 중인 초대만 취소할 수 있습니다')
    }
    this.status = InvitationStatus.CANCELED
  }

  // 유틸리티 메서드
  isActive(): boolean {
    return this.status === InvitationStatus.PENDING
  }

  isGroupInvitation(): boolean {
    return this.invitationType === InvitationType.GROUP
  }

  isManagerInvitation(): boolean {
    return this.invitationType === InvitationType.MANAGER
  }
}
