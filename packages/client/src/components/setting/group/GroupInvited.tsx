import { QUERY_KEYS } from '@/constants/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { toast } from 'react-toastify'
import { getInvitationsUser } from '@/api/invitations/get-invitations-user'
import { GetInvitationsUserRes } from '@/types/invitations'
import { patchInvitationReject } from '@/api/invitations/patch-invitations-reject'
import { patchInvitationAccept } from '@/api/invitations/patch-invitations-accept'
import { patchInvitationCancel } from '@/api/invitations/patch-invitations-cancel'
import SettingSection from '../SettingSection'
import InvitationsSection from '../InvitationsSection'
import InvitationLayout from '../InvitationLayout'
import ReceivedInvitation from '../ReceivedInvitation'
import SendedInvitation from '../SendedInvitation'
import Toast from '@/components/common/Toast'

const GroupInvited = () => {
  const queryClient = useQueryClient()

  //초대 현황
  const { data: invitations } = useQuery<GetInvitationsUserRes>({
    queryKey: [QUERY_KEYS.GET_GROUP_INVITATION_RECEIVED],
    queryFn: getInvitationsUser,
  })

  //받은 초대 거절
  const mutationReject = useMutation<AxiosResponse, Error, number>({
    mutationFn: (id: number) => patchInvitationReject(id),
    onSuccess: () => {
      toast.success('초대 요청 거절하였습니다.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_GROUP_INVITATION_RECEIVED],
      })
    },
  })

  //받은 초대 수락
  const mutationAccept = useMutation<AxiosResponse, Error, number>({
    mutationFn: (id: number) => patchInvitationAccept(id),
    onSuccess: () => {
      toast.success('초대 요청 수락하였습니다.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_GROUP_INVITATION_RECEIVED],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_GROUP_USER],
      })
    },
  })

  //초대 철회
  const mutationCancel = useMutation<AxiosResponse, Error, number>({
    mutationFn: (id: number) => patchInvitationCancel(id),
    onSuccess: () => {
      toast.success('초대 요청 취소하였습니다.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_GROUP_INVITATION_SEND],
      })
    },
  })

  const handleGroupReject = (id: number) => {
    mutationReject.mutate(id)
  }
  const handleGroupAccept = (id: number) => {
    mutationAccept.mutate(id)
  }
  const handleGroupCancel = (id: number) => {
    mutationCancel.mutate(id)
  }

  return (
    <div className="-mt-3">
      <SettingSection title="💌 초대 목록">
        <div className="py-3">
          <InvitationsSection
            title="받은 초대 현황"
            itemsLength={invitations?.received.groupInvitations.length || 0}
          >
            <InvitationLayout
              items={invitations?.received.groupInvitations}
              Component={ReceivedInvitation}
              message="받은 초대가 없습니다."
              // 초대 거절
              onClickReject={handleGroupReject}
              // 초대 수락
              onClickAccept={handleGroupAccept}
            />
          </InvitationsSection>
        </div>
        <div>
          <InvitationsSection
            title="보낸 초대 현황"
            itemsLength={invitations?.sent.groupInvitations.length || 0}
          >
            <InvitationLayout
              items={invitations?.sent.groupInvitations}
              Component={SendedInvitation}
              message="보낸 초대가 없습니다."
              // 초대 철회
              onClickReject={handleGroupCancel}
            />
          </InvitationsSection>
        </div>
      </SettingSection>
      <Toast />
    </div>
  )
}

export default GroupInvited
