import { API_DOMAINS } from '@/constants/api'
import { baseAPI } from '../axios-instance'
import { AxiosResponse } from 'axios'

export const patchInvitationAccept = async (id: number) => {
  const { data } = await baseAPI.patch<AxiosResponse>(
    `${API_DOMAINS.INVITATIONS}/${id}/accept`,
    { params: { id } },
  )

  return data
}
