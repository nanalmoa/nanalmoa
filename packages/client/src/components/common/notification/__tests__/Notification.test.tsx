import { describe, it, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { getInvitationsUser } from '@/api/invitations/get-invitations-user'
import { usePushNotification } from '@/constants/notification-context'

// Mock API calls
vi.mock('@/api/invitations/get-invitations-user', () => ({
  getInvitationsUser: vi.fn(),
}))

// Mock notification context
vi.mock('@/constants/notification-context', () => ({
  usePushNotification: vi.fn(),
}))

// Mock token utility
vi.mock('@/utils/handle-token', () => ({
  getAccessToken: vi.fn(() => 'mock-token'),
}))

import {
  createTestQueryClient,
  renderNotification,
  clickNotificationButton,
  waitForElement,
  waitForRegexElement,
  mockEmptyInvitations,
  mockInvitations,
} from './notification-test-utils'

describe('Notification', () => {
  const queryClient = createTestQueryClient()
  const mockFireNotification = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
    vi.mocked(usePushNotification).mockReturnValue({
      fireNotificationWithTimeout: mockFireNotification,
    } as any)
  })

  it('알림 아이콘을 클릭하면 알림 목록이 토글된다', async () => {
    vi.mocked(getInvitationsUser).mockResolvedValue(mockEmptyInvitations)
    renderNotification(queryClient)

    // 초기에는 알림 목록이 보이지 않음
    await waitForElement('알림이 없습니다.', false)

    // 알림 아이콘 클릭 후 목록이 표시됨
    clickNotificationButton()
    await waitForElement('알림이 없습니다.')

    // 다시 클릭하면 알림 목록이 사라짐
    clickNotificationButton()
    await waitForElement('알림이 없습니다.', false)
  })

  it('초대 목록이 비어있을 때 "알림이 없습니다" 메시지를 표시한다', async () => {
    vi.mocked(getInvitationsUser).mockResolvedValue(mockEmptyInvitations)
    renderNotification(queryClient)
    clickNotificationButton()
    await waitForElement('알림이 없습니다.')
  })

  it('받은 초대와 보낸 초대 목록을 표시한다', async () => {
    vi.mocked(getInvitationsUser).mockResolvedValue(mockInvitations)
    renderNotification(queryClient)
    clickNotificationButton()

    // 받은 초대와 보낸 초대가 모두 표시됨
    await waitForRegexElement(/홍길동/)
    await waitForRegexElement(/김철수/)
  })

  it('새로운 초대가 도착하면 푸시 알림을 표시한다', async () => {
    vi.mocked(getInvitationsUser).mockResolvedValue(mockInvitations)
    renderNotification(queryClient)

    await waitFor(() => {
      expect(mockFireNotification).toHaveBeenCalledWith('새로운 초대', 5000, {
        body: '홍길동님으로부터 초대가 도착했습니다.',
      })
    })
  })
})
