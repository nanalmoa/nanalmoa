import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotificationItem from '../NotificationItem'
import { InvitationStatusEnum, InvitationTypeEnum } from '@/types/invitations'
import {
  createMockNotification,
  createTestQueryClient,
  createTestWrapper,
} from './notification-test-utils'
import { invitationTypeLabels } from '@/constants/schedules'

describe('NotificationItem', () => {
  const queryClient = createTestQueryClient()
  const wrapper = createTestWrapper(queryClient)

  it('대기 중인 초대는 PendingItem을 렌더링한다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Group,
      status: InvitationStatusEnum.PENDING,
    })

    render(
      <NotificationItem notification={mockNotification} isSender={false} />,
      { wrapper },
    )

    // PendingItem
    expect(screen.getByText('홍길동')).toBeInTheDocument()
    const groupLabels = screen.getAllByText(
      invitationTypeLabels[InvitationTypeEnum.Group],
    )
    expect(groupLabels).toHaveLength(2)
  })

  it('처리된 초대는 SettledItem을 렌더링한다', () => {
    const mockNotification = createMockNotification({
      status: InvitationStatusEnum.ACCEPTED,
      invitationType: InvitationTypeEnum.Group,
    })

    render(
      <NotificationItem notification={mockNotification} isSender={false} />,
      { wrapper },
    )

    // SettledItem
    expect(screen.getByText('홍길동')).toBeInTheDocument()
    const groupLabels = screen.getAllByText(
      invitationTypeLabels[InvitationTypeEnum.Group],
    )
    expect(groupLabels).toHaveLength(2)
  })

  it('보낸 초대와 받은 초대를 구분하여 표시한다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Group,
      status: InvitationStatusEnum.PENDING,
    })

    // 보낸 초대
    const { rerender } = render(
      <NotificationItem notification={mockNotification} isSender={true} />,
      { wrapper },
    )

    // 받은 초대로 변경
    rerender(
      <NotificationItem notification={mockNotification} isSender={false} />,
    )
  })
})
