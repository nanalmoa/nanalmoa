import { AuthProvider } from 'src/entities/auth.entity'

export interface NaverUserResponse {
  id: string
  provider: AuthProvider
  providerId: string
  email: string
  name: string
  profileImage: string
}
