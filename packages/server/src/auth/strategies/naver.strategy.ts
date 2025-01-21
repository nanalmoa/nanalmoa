import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-naver-v2'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { AuthProvider } from 'src/entities/auth.entity'

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_REDIRECT_URI,
      passReqToCallback: true,
    })
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    try {
      const { id, emails, displayName, _json } = profile
      const user = {
        id,
        provider: AuthProvider.NAVER,
        providerId: id,
        email: emails[0].value,
        name: displayName,
        profileImage: _json.profile_image,
      }

      const validatedUser = await this.authService.findOrCreateSocialUser(
        user,
        refreshToken,
        AuthProvider.NAVER,
      )

      done(null, validatedUser)
    } catch (error) {
      console.error('Naver auth error:', error)
      done(new UnauthorizedException('네이버 인증 실패'), false)
    }
  }
}
