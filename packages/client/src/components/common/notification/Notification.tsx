import { getInvitationsUser } from '@/api/invitations/get-invitations-user'
import { QUERY_KEYS } from '@/constants/api'
import { GetInvitationsUserRes } from '@/types/invitations'
import { cn } from '@/utils/cn'
import { getAccessToken } from '@/utils/handle-token'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { IconButton } from '..'
import { NotificationIcon } from '../../icons'
import Toast from '../Toast'
import NotificationItem from './NotificationItem'
import { usePushNotification } from '@/constants/notification-context'

const Notification = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { fireNotificationWithTimeout } = usePushNotification()

  const { data: invitations } = useQuery<GetInvitationsUserRes, AxiosError>({
    queryKey: [QUERY_KEYS.GET_INVITATIONS_USER, getAccessToken()],
    queryFn: getInvitationsUser,
  })

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  // invitations가 변경될 때마다 알림 발송
  useEffect(() => {
    if (invitations && invitations.received) {
      const { groupInvitations, managerInvitations } = invitations.received
      ;[...groupInvitations, ...managerInvitations].forEach((invitation) => {
        fireNotificationWithTimeout('새로운 초대', 5000, {
          body: `${invitation.inviterName}님으로부터 초대가 도착했습니다.`,
        })
      })
    }
  }, [invitations, fireNotificationWithTimeout])

  return (
    <>
      <div className="relative">
        <IconButton
          direction="vertical"
          icon={<NotificationIcon />}
          text="알림"
          onClick={handleToggle}
        />

        {isOpen && invitations && (
          <div
            className={cn(
              'absolute right-0 top-12 z-50',
              'flex max-h-80 min-h-24 w-60 flex-col overflow-hidden overflow-y-auto rounded-md border border-neutral-300 bg-neutral-100',
            )}
          >
            {invitations.received.groupInvitations.length === 0 &&
            invitations.received.managerInvitations.length === 0 ? (
              <p className="mt-10 text-center text-sm">알림이 없습니다.</p>
            ) : (
              <>
                {invitations.sent.groupInvitations.map((invitation) => (
                  <NotificationItem
                    key={invitation.invitationId}
                    notification={invitation}
                    isSender={true}
                  />
                ))}
                {invitations.sent.managerInvitations.map((invitation) => (
                  <NotificationItem
                    key={invitation.invitationId}
                    notification={invitation}
                    isSender={true}
                  />
                ))}
                {invitations.received.groupInvitations.map((invitation) => (
                  <NotificationItem
                    key={invitation.invitationId}
                    notification={invitation}
                    isSender={false}
                  />
                ))}
                {invitations.received.managerInvitations.map((invitation) => (
                  <NotificationItem
                    key={invitation.invitationId}
                    notification={invitation}
                    isSender={false}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <Toast />
    </>
  )
}

export default Notification
