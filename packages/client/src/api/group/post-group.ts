import { baseAPI } from '../axios-instance'
import { API_DOMAINS } from '@/constants/api'
import { PostGroupReq, PostGroupRes } from '@/types/group'
import { AxiosResponse } from 'axios'

export const postGroup = async (payload: PostGroupReq) => {
  const { data } = await baseAPI.post<
    PostGroupReq,
    AxiosResponse<PostGroupRes>
  >(`${API_DOMAINS.GROUP}`, payload, {
    params: { groupName: payload.groupName },
  })
  return data
}
