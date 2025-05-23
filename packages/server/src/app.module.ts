import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { LoggerMiddleware } from './middlewares/logger.middleware'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { SchedulesModule } from './modules/schedules/schedules.module'
import { GroupModule } from './modules/group/group.module'
import { dataSourceOptions } from './dataSource'
import { CategoriesModule } from './modules/categories/categories.module'
import { PassportModule } from '@nestjs/passport'
import { ManagerController } from './modules/manager/manager.controller'
import { ManagerModule } from './modules/manager/manager.module'
import { DataSource } from 'typeorm'
import { addTransactionalDataSource } from 'typeorm-transactional'
import { InvitationsModule } from './modules/invitations/invitations.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...dataSourceOptions,
        keepConnectionAlive: true,
        autoLoadEntities: true,
      }),
      async dataSourceFactory(option) {
        if (!option) throw new Error('Invalid options passed')

        return addTransactionalDataSource(new DataSource(option))
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION,
      },
    }),
    AuthModule,
    UsersModule,
    SchedulesModule,
    GroupModule,
    CategoriesModule,
    ManagerModule,
    InvitationsModule,
  ],
  controllers: [AppController, ManagerController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
