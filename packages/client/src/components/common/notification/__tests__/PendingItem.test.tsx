import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PendingItem from '../PendingItem'
import { InvitationStatusEnum, InvitationTypeEnum } from '@/types/invitations'
import {
  createMockNotification,
  createTestQueryClient,
  createTestWrapper,
} from './notification-test-utils'
import { invitationTypeLabels } from '@/constants/schedules'
import { useNotification } from '@/hooks/use-notification'

// useNotification 훅 모킹
vi.mock('@/hooks/use-notification', () => ({
  useNotification: vi.fn(),
}))

describe('PendingItem', () => {
  const queryClient = createTestQueryClient()
  const wrapper = createTestWrapper(queryClient)

  const mockMutations = {
    invitationAcceptMutation: {
      mutate: vi.fn(),
      isPending: false,
    },
    invitationRejectMutation: {
      mutate: vi.fn(),
      isPending: false,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useNotification as any).mockReturnValue(mockMutations)
  })

  it('그룹 초대를 올바르게 렌더링한다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Group,
      status: InvitationStatusEnum.PENDING,
    })

    render(<PendingItem notification={mockNotification} isSender={false} />, {
      wrapper,
    })

    expect(screen.getByText('홍길동')).toBeInTheDocument()
    // 초대 타입 라벨 확인 (2번 렌더링)
    const groupLabels = screen.getAllByText(
      invitationTypeLabels[InvitationTypeEnum.Group],
    )
    expect(groupLabels).toHaveLength(2)

    expect(screen.getByText('거절하기')).toBeInTheDocument()
    expect(screen.getByText('수락하기')).toBeInTheDocument()
  })

  it('관리자 초대를 올바르게 렌더링한다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Manager,
      status: InvitationStatusEnum.PENDING,
    })

    render(<PendingItem notification={mockNotification} isSender={false} />, {
      wrapper,
    })

    expect(screen.getByText('홍길동')).toBeInTheDocument()
    // 초대 타입 라벨 확인 (2번 렌더링)
    const managerLabels = screen.getAllByText(
      invitationTypeLabels[InvitationTypeEnum.Manager],
    )
    expect(managerLabels).toHaveLength(2)

    expect(screen.getByText('거절하기')).toBeInTheDocument()
    expect(screen.getByText('수락하기')).toBeInTheDocument()
  })

  it('수락 버튼 클릭 시 invitationAcceptMutation이 호출된다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Group,
      status: InvitationStatusEnum.PENDING,
    })

    render(<PendingItem notification={mockNotification} isSender={false} />, {
      wrapper,
    })

    fireEvent.click(screen.getByText('수락하기'))
    expect(mockMutations.invitationAcceptMutation.mutate).toHaveBeenCalledWith(
      mockNotification.invitationId,
    )
  })

  it('거절 버튼 클릭 시 invitationRejectMutation이 호출된다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Group,
      status: InvitationStatusEnum.PENDING,
    })

    render(<PendingItem notification={mockNotification} isSender={false} />, {
      wrapper,
    })

    fireEvent.click(screen.getByText('거절하기'))
    expect(mockMutations.invitationRejectMutation.mutate).toHaveBeenCalledWith(
      mockNotification.invitationId,
    )
  })

  it('mutation이 pending 상태일 때 버튼에 LoadingSpinner가 표시된다', () => {
    const mockNotification = createMockNotification({
      invitationType: InvitationTypeEnum.Group,
      status: InvitationStatusEnum.PENDING,
    })

    ;(useNotification as any).mockReturnValue({
      ...mockMutations,
      invitationAcceptMutation: {
        ...mockMutations.invitationAcceptMutation,
        isPending: true,
      },
      invitationRejectMutation: {
        ...mockMutations.invitationRejectMutation,
        isPending: true,
      },
    })

    render(<PendingItem notification={mockNotification} isSender={false} />, {
      wrapper,
    })

    // LoadingSpinner 렌더링 (수락/거절 각각)
    const spinners = screen.getAllByRole('status')
    expect(spinners).toHaveLength(2)
  })
})
