import {
  IGroupInvitations,
  IManagerInvitations,
  InvitationStatusEnum,
} from '@/types/invitations'
import PendingItem from './PendingItem'
import SettledItem from './SettledItem'
type Props = {
  notification: IGroupInvitations | IManagerInvitations
  isSender: boolean
}

const NotificationItem = ({ notification, isSender }: Props) => {
  const isPendingInvitaion =
    notification.status === InvitationStatusEnum.PENDING

  return (
    <div className="flex items-center border-b border-neutral-300 px-2 py-3 text-sm last:border-none hover:bg-neutral-200">
      {isPendingInvitaion ? (
        <PendingItem notification={notification} isSender={isSender} />
      ) : (
        <SettledItem notification={notification} isSender={isSender} />
      )}
    </div>
  )
}

export default NotificationItem
