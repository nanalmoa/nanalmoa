import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InvitationsController } from './invitations.controller'
import { InvitationsService } from './invitations.service'
import { Invitation } from '@/entities/invitation.entity'
import { GroupInvitation } from '@/entities/group-invitation.entity'
import { ManagerInvitation } from '@/entities/manager-invitation.entity'
import { UsersModule } from '@/modules/users/users.module'
import { GroupModule } from '@/modules/group/group.module'
import { ManagerModule } from '@/modules/manager/manager.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, GroupInvitation, ManagerInvitation]),
    UsersModule,
    GroupModule,
    ManagerModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
