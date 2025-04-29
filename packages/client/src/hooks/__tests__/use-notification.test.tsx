import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotification } from '../use-notification'
import { patchInvitationAccept } from '@/api/invitations/patch-invitations-accept'
import { patchInvitationReject } from '@/api/invitations/patch-invitations-reject'
import { toast } from 'react-toastify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import { errorMessages } from '@/constants/validation'
import React from 'react'
import { AxiosResponse } from 'axios'

vi.mock('@/api/invitations/patch-invitations-accept', () => ({
  patchInvitationAccept: vi.fn(),
}))

vi.mock('@/api/invitations/patch-invitations-reject', () => ({
  patchInvitationReject: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useNotification', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  // invalidateQueries 스파이
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
    invalidateQueriesSpy.mockClear()
  })

  it('초대 수락 뮤테이션이 성공적으로 실행된다', async () => {
    vi.mocked(patchInvitationAccept).mockResolvedValue({} as AxiosResponse)

    const { result } = renderHook(() => useNotification(), { wrapper })

    await act(async () => {
      await result.current.invitationAcceptMutation.mutateAsync(1)
    })

    expect(patchInvitationAccept).toHaveBeenCalledWith(1)
    expect(toast.success).toHaveBeenCalledWith('초대가 수락되었습니다.')
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.GET_INVITATIONS_USER],
    })
  })

  it('초대 수락 뮤테이션이 실패하면 에러 메시지를 표시한다', async () => {
    vi.mocked(patchInvitationAccept).mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useNotification(), { wrapper })

    await act(async () => {
      try {
        await result.current.invitationAcceptMutation.mutateAsync(1)
      } catch {
        // 에러 결과 무시
      }
    })

    expect(patchInvitationAccept).toHaveBeenCalledWith(1)
    expect(toast.error).toHaveBeenCalledWith(errorMessages.default)
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.GET_INVITATIONS_USER],
    })
  })

  it('초대 거절 뮤테이션이 성공적으로 실행된다', async () => {
    vi.mocked(patchInvitationReject).mockResolvedValue({} as AxiosResponse)

    const { result } = renderHook(() => useNotification(), { wrapper })

    await act(async () => {
      await result.current.invitationRejectMutation.mutateAsync(1)
    })

    expect(patchInvitationReject).toHaveBeenCalledWith(1)
    expect(toast.success).toHaveBeenCalledWith('초대가 거절되었습니다.')
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.GET_INVITATIONS_USER],
    })
  })

  it('초대 거절 뮤테이션이 실패하면 에러 메시지를 표시한다', async () => {
    vi.mocked(patchInvitationReject).mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useNotification(), { wrapper })

    await act(async () => {
      try {
        await result.current.invitationRejectMutation.mutateAsync(1)
      } catch {
        // 에러 결과 무시
      }
    })

    expect(patchInvitationReject).toHaveBeenCalledWith(1)
    expect(toast.error).toHaveBeenCalledWith(errorMessages.default)
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.GET_INVITATIONS_USER],
    })
  })
})
