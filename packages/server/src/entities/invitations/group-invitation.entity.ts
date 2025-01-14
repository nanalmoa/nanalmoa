import { ChildEntity, ManyToOne, JoinColumn } from 'typeorm'
import { BaseInvitation } from './invitations.entity'
import { Group } from '@/entities/group.entity'

@ChildEntity('group')
export class GroupInvitation extends BaseInvitation {
  @ManyToOne(() => Group, (group) => group.invitations)
  @JoinColumn({ name: 'group_id' })
  group: Group
}
