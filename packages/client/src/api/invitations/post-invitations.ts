import { authAPI } from '../axios-instance'
import { AxiosResponse } from 'axios'
import { API_DOMAINS } from '@/constants/api'
import { IPostInvitation } from '@/types/invitations'

export const postInvitation = async (payload: IPostInvitation) => {
  const { data } = await authAPI.post<IPostInvitation, AxiosResponse>(
    `${API_DOMAINS.INVITATIONS}`,
    payload,
  )

  return data
}
