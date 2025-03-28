import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const GetUserUuid = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user
    // console.log('[GetUserUuid] user:', user)

    if (!user || !user.userUuid) {
      throw new Error('userUuid를 찾을 수 없습니다. 인증이 필요합니다.')
    }

    return user.userUuid
  },
)
