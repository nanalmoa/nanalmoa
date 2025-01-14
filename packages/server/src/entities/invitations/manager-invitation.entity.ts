import { ChildEntity } from 'typeorm'
import { BaseInvitation } from './invitations.entity'

@ChildEntity('manager')
export class ManagerInvitation extends BaseInvitation {}
