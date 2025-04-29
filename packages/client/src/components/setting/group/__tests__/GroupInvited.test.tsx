import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GroupInvited from '../GroupInvited'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GetInvitationsUserRes } from '@/types/invitations'
import { InvitationTypeEnum, InvitationStatusEnum } from '@/types/invitations'
import { toast } from 'react-toastify'
import { getInvitationsUser } from '@/api/invitations/get-invitations-user'
import { patchInvitationReject } from '@/api/invitations/patch-invitations-reject'
import { patchInvitationAccept } from '@/api/invitations/patch-invitations-accept'
import { patchInvitationCancel } from '@/api/invitations/patch-invitations-cancel'

// Mock API calls
vi.mock('@/api/invitations/get-invitations-user', () => ({
  getInvitationsUser: vi.fn(),
}))

vi.mock('@/api/invitations/patch-invitations-reject', () => ({
  patchInvitationReject: vi.fn(),
}))

vi.mock('@/api/invitations/patch-invitations-accept', () => ({
  patchInvitationAccept: vi.fn(),
}))

vi.mock('@/api/invitations/patch-invitations-cancel', () => ({
  patchInvitationCancel: vi.fn(),
}))

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: vi.fn(() => null),
}))

describe('GroupInvited', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const mockInvitations: GetInvitationsUserRes = {
    sent: {
      groupInvitations: [
        {
          invitationId: 1,
          invitationType: InvitationTypeEnum.Group,
          status: InvitationStatusEnum.PENDING,
          inviterUuid: 'inviter-1',
          inviteeUuid: 'invitee-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          inviterName: '홍길동',
          inviteeName: '김철수',
          groupId: 1,
          groupName: '테스트 그룹 1',
        },
      ],
      managerInvitations: [],
    },
    received: {
      groupInvitations: [
        {
          invitationId: 2,
          invitationType: InvitationTypeEnum.Group,
          status: InvitationStatusEnum.PENDING,
          inviterUuid: 'inviter-2',
          inviteeUuid: 'invitee-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          inviterName: '이영희',
          inviteeName: '박지성',
          groupId: 2,
          groupName: '테스트 그룹 2',
        },
      ],
      managerInvitations: [],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <GroupInvited />
      </QueryClientProvider>,
    )
  }

  it('초대 목록이 정상적으로 렌더링된다', async () => {
    vi.mocked(getInvitationsUser).mockResolvedValue(mockInvitations)
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('💌 초대 목록')).toBeInTheDocument()
      expect(screen.getByText('받은 초대 현황')).toBeInTheDocument()
      expect(screen.getByText('보낸 초대 현황')).toBeInTheDocument()
    })
  })

  it('받은 초대가 없을 때 메시지가 표시된다', async () => {
    const emptyInvitations: GetInvitationsUserRes = {
      ...mockInvitations,
      received: {
        ...mockInvitations.received,
        groupInvitations: [],
      },
    }
    vi.mocked(getInvitationsUser).mockResolvedValue(emptyInvitations)
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('받은 초대가 없습니다.')).toBeInTheDocument()
    })
  })

  it('보낸 초대가 없을 때 메시지가 표시된다', async () => {
    const emptyInvitations: GetInvitationsUserRes = {
      ...mockInvitations,
      sent: {
        ...mockInvitations.sent,
        groupInvitations: [],
      },
    }
    vi.mocked(getInvitationsUser).mockResolvedValue(emptyInvitations)
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('보낸 초대가 없습니다.')).toBeInTheDocument()
    })
  })

  it('초대 수락 버튼 클릭 시 성공 메시지가 표시된다', async () => {
    vi.mocked(getInvitationsUser).mockResolvedValue(mockInvitations)
    vi.mocked(patchInvitationAccept).mockResolvedValue({} as any)
    renderComponent()

    await waitFor(() => {
      const acceptButton = screen.getByText('초대 수락')
      fireEvent.click(acceptButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('초대 요청 수락하였습니다.')
    })
  })

  it('초대 거절 버튼 클릭 시 성공 메시지가 표시된다', async () => {
    vi.mocked(getInvitationsUser).mockResolvedValue(mockInvitations)
    vi.mocked(patchInvitationReject).mockResolvedValue({} as any)
    renderComponent()

    await waitFor(() => {
      const rejectButton = screen.getByText('초대 거절')
      fireEvent.click(rejectButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('초대 요청 거절하였습니다.')
    })
  })

  it('초대 철회 버튼 클릭 시 성공 메시지가 표시된다', async () => {
    vi.mocked(getInvitationsUser).mockResolvedValue(mockInvitations)
    vi.mocked(patchInvitationCancel).mockResolvedValue({} as any)
    renderComponent()

    await waitFor(() => {
      const cancelButton = screen.getByText('요청 철회')
      fireEvent.click(cancelButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('초대 요청 취소하였습니다.')
    })
  })
})
