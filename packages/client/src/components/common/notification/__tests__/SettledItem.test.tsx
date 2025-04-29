import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SettledItem from '../SettledItem'
import { InvitationStatusEnum, InvitationTypeEnum } from '@/types/invitations'
import {
  createMockNotification,
  createTestQueryClient,
  createTestWrapper,
} from './notification-test-utils'
import {
  invitationTypeLabels,
  invitationStatusLabels,
} from '@/constants/schedules'

describe('SettledItem', () => {
  const queryClient = createTestQueryClient()
  const wrapper = createTestWrapper(queryClient)

  it('그룹 초대가 수락된 상태를 올바르게 렌더링한다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Group,
      status: InvitationStatusEnum.ACCEPTED,
    })

    render(<SettledItem notification={mockNotification} isSender={false} />, {
      wrapper,
    })

    expect(screen.getByText('홍길동')).toBeInTheDocument()
    // 초대 타입 라벨 (2번 렌더링)
    const groupLabels = screen.getAllByText(
      invitationTypeLabels[InvitationTypeEnum.Group],
    )
    expect(groupLabels).toHaveLength(2)
    // 상태 라벨
    expect(
      screen.getByText(invitationStatusLabels[InvitationStatusEnum.ACCEPTED]),
    ).toBeInTheDocument()
  })

  it('그룹 초대가 거절된 상태를 올바르게 렌더링한다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Group,
      status: InvitationStatusEnum.REJECTED,
    })

    render(<SettledItem notification={mockNotification} isSender={false} />, {
      wrapper,
    })

    expect(screen.getByText('홍길동')).toBeInTheDocument()
    // 초대 타입 라벨 (2번 렌더링)
    const groupLabels = screen.getAllByText(
      invitationTypeLabels[InvitationTypeEnum.Group],
    )
    expect(groupLabels).toHaveLength(2)
    // 상태 라벨
    expect(
      screen.getByText(invitationStatusLabels[InvitationStatusEnum.REJECTED]),
    ).toBeInTheDocument()
  })

  it('관리자 초대가 수락된 상태를 올바르게 렌더링한다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Manager,
      status: InvitationStatusEnum.ACCEPTED,
    })

    render(<SettledItem notification={mockNotification} isSender={false} />, {
      wrapper,
    })

    expect(screen.getByText('홍길동')).toBeInTheDocument()
    // 초대 타입 라벨 (2번 렌더링)
    const managerLabels = screen.getAllByText(
      invitationTypeLabels[InvitationTypeEnum.Manager],
    )
    expect(managerLabels).toHaveLength(2)
    // 상태 라벨
    expect(
      screen.getByText(invitationStatusLabels[InvitationStatusEnum.ACCEPTED]),
    ).toBeInTheDocument()
  })

  it('보낸 초대와 받은 초대를 구분하여 표시한다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Group,
      status: InvitationStatusEnum.ACCEPTED,
    })

    // 보낸 초대
    const { rerender } = render(
      <SettledItem notification={mockNotification} isSender={true} />,
      { wrapper },
    )

    expect(screen.getByText(/님께 보낸/)).toBeInTheDocument()

    // 받은 초대 변경
    rerender(<SettledItem notification={mockNotification} isSender={false} />)
    expect(screen.getByText(/님께 받은/)).toBeInTheDocument()
  })
})
