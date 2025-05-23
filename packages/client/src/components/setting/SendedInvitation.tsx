import { IGroupInvitations, IManagerInvitations } from '@/types/invitations'

type Props = {
  item: IManagerInvitations | IGroupInvitations
  onClickReject?: (id: number) => void
}

const SendedInvitation = ({ item, onClickReject }: Props) => {
  const inviteId = item.invitationId

  // 3분이 지나면 화면에 표시하지 않음
  // let updatedAt: Date | undefined
  // if (typeof item.updatedAt === 'string') {
  //   updatedAt = new Date(item.updatedAt)
  // } else {
  //   updatedAt = item.updatedAt
  // }
  // const now = new Date()
  // const threeMinutes = 3 * 60 * 1000
  // const isExpired = updatedAt
  //   ? now.getTime() - updatedAt.getTime() > threeMinutes
  //   : false
  // if (item.status === 'CANCELED' && isExpired) {
  //   return null
  // }

  /* 그룹 dto에 맞게 수정해서 사용해주세요 */
  return (
    <div className="mb-1 flex justify-between rounded bg-neutral-200 px-3 py-[7px]">
      <div className="font-bold">{item.inviteeName}</div>
      <div className="flex gap-1">
        {item.status === 'PENDING' && (
          <>
            <div className="border-primary-700 text-primary-700 rounded border px-2 py-1 text-sm">
              요청중
            </div>
            <button
              onClick={() => onClickReject && onClickReject(inviteId)}
              className="rounded bg-red-200 px-2 py-1 text-sm text-red-500"
            >
              요청 철회
            </button>
          </>
        )}
        {item.status === 'REJECTED' && (
          <div className="rounded border border-red-500 px-2 py-1 text-sm text-red-500">
            거절된 요청
          </div>
        )}
        {item.status === 'ACCEPTED' && (
          <div className="rounded border border-blue-500 px-2 py-1 text-sm text-blue-500">
            수락된 요청
          </div>
        )}
        {item.status === 'CANCELED' && (
          <div className="rounded border border-neutral-500 px-2 py-1 text-sm text-neutral-500">
            취소된 요청
          </div>
        )}
        {item.status === 'REMOVED' && (
          <div className="rounded border border-neutral-500 px-2 py-1 text-sm text-neutral-500">
            제거된 요청
          </div>
        )}
      </div>
    </div>
  )
}

export default SendedInvitation
