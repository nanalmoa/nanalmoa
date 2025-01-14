import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  TableInheritance,
} from 'typeorm'
import { User } from '@/entities/user.entity'

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  REMOVED = 'REMOVED',
}

@Entity('invitation')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class BaseInvitation {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'inviter_uuid' })
  inviterUuid: string

  @Column({ name: 'invitee_uuid' })
  inviteeUuid: string

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.sentInvitations)
  @JoinColumn({ name: 'inviter_uuid', referencedColumnName: 'userUuid' })
  inviter: User

  @ManyToOne(() => User, (user) => user.receivedInvitations)
  @JoinColumn({ name: 'invitee_uuid', referencedColumnName: 'userUuid' })
  invitee: User
}
