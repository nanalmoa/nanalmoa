import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InvitationsController } from './invitations.controller'
import { InvitationsService } from './invitations.service'
import { Invitation } from '@/entities/invitation.entity'
import { UsersModule } from '../users/users.module'
import { GroupModule } from '../group/group.module'
import { ManagerModule } from '../manager/manager.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation]),
    UsersModule, // 사용자 관련 기능 사용
    GroupModule, // 그룹 관련 기능 사용
    ManagerModule, // 매니저-부하직원 관련 기능 사용
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService], // 다른 모듈에서 사용할 수 있도록 export
})
export class InvitationsModule {}
