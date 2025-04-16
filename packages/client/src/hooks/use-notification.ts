import { patchInvitationAccept } from '@/api/invitations/patch-invitations-accept'
import { patchInvitationReject } from '@/api/invitations/patch-invitations-reject'
import { QUERY_KEYS } from '@/constants/api'
import { errorMessages } from '@/constants/validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

export const useNotification = () => {
  const queryClient = useQueryClient()

  const invitationAcceptMutation = useMutation({
    mutationFn: patchInvitationAccept,
    onSuccess: () => {
      toast.success('초대가 수락되었습니다.')
    },
    onError: () => {
      toast.error(errorMessages.default)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INVITATIONS_USER],
      })
    },
  })
  const invitationRejectMutation = useMutation({
    mutationFn: patchInvitationReject,
    onSuccess: () => {
      toast.success('초대가 거절되었습니다.')
    },
    onError: () => {
      toast.error(errorMessages.default)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INVITATIONS_USER],
      })
    },
  })

  return {
    invitationAcceptMutation,
    invitationRejectMutation,
  }
}
