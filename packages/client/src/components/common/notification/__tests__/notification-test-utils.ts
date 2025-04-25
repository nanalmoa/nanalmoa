import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import Notification from '../Notification'
import { InvitationStatusEnum, InvitationTypeEnum } from '@/types/invitations'

export const mockEmptyInvitations = {
  received: {
    groupInvitations: [],
    managerInvitations: [],
  },
  sent: {
    groupInvitations: [],
    managerInvitations: [],
  },
}

export const mockInvitations = {
  received: {
    groupInvitations: [
      {
        invitationId: 1,
        inviterName: '홍길동',
        status: InvitationStatusEnum.PENDING,
        groupName: '테스트 그룹',
        invitationType: InvitationTypeEnum.Group,
        inviterUuid: 'inviter-uuid',
        inviteeUuid: 'invitee-uuid',
        createdAt: new Date('2024-03-20T00:00:00.000Z'),
        updatedAt: new Date('2024-03-20T00:00:00.000Z'),
      },
    ],
    managerInvitations: [],
  },
  sent: {
    groupInvitations: [],
    managerInvitations: [
      {
        invitationId: 2,
        inviterName: '김철수',
        status: InvitationStatusEnum.PENDING,
        invitationType: InvitationTypeEnum.Manager,
        inviterUuid: 'inviter-uuid',
        inviteeUuid: 'invitee-uuid',
        createdAt: new Date('2024-03-20T00:00:00.000Z'),
        updatedAt: new Date('2024-03-20T00:00:00.000Z'),
      },
    ],
  },
}

// QueryClient 설정
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

// 테스트 래퍼 컴포넌트
export const createTestWrapper = (queryClient: QueryClient) => {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    )
  }
}

// 유틸함수
export const renderNotification = (queryClient: QueryClient) => {
  const wrapper = createTestWrapper(queryClient)
  return render(React.createElement(Notification), { wrapper })
}

export const clickNotificationButton = () => {
  const notificationButton = screen.getByText('알림')
  fireEvent.click(notificationButton)
}

export const waitForElement = (text: string, shouldExist = true) => {
  return waitFor(() => {
    if (shouldExist) {
      expect(screen.getByText(text)).toBeInTheDocument()
    } else {
      expect(screen.queryByText(text)).not.toBeInTheDocument()
    }
  })
}

export const waitForRegexElement = (regex: RegExp) => {
  return waitFor(() => {
    expect(screen.getByText(regex)).toBeInTheDocument()
  })
}

// NotificationItem 유틸리티 함수
export const createMockNotification = (options = {}) => {
  return {
    ...mockInvitations.received.groupInvitations[0],
    inviteeName: '김철수',
    groupId: 1,
    ...options,
  }
}
