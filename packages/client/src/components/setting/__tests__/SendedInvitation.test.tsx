import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SendedInvitation from '../SendedInvitation'
import { InvitationTypeEnum, InvitationStatusEnum } from '@/types/invitations'
import { createMockInvitation } from './test-utils'

describe('SendedInvitation', () => {
  it('초대받은 사람의 이름이 항상 표시된다', () => {
    const mockInvitation = createMockInvitation(
      InvitationTypeEnum.Group,
      InvitationStatusEnum.PENDING,
    )
    render(<SendedInvitation item={mockInvitation} />)
    expect(screen.getByText('김철수')).toBeInTheDocument()
  })

  it('PENDING 상태일 때 "요청중"과 "요청 철회" 버튼이 표시된다', () => {
    const mockInvitation = createMockInvitation(
      InvitationTypeEnum.Group,
      InvitationStatusEnum.PENDING,
    )
    const handleReject = vi.fn()
    render(
      <SendedInvitation item={mockInvitation} onClickReject={handleReject} />,
    )
    expect(screen.getByText('요청중')).toBeInTheDocument()
    expect(screen.getByText('요청 철회')).toBeInTheDocument()
  })

  it('REJECTED 상태일 때 "거절된 요청"이 표시된다', () => {
    const mockInvitation = createMockInvitation(
      InvitationTypeEnum.Group,
      InvitationStatusEnum.REJECTED,
    )
    render(<SendedInvitation item={mockInvitation} />)
    expect(screen.getByText('거절된 요청')).toBeInTheDocument()
  })

  it('ACCEPTED 상태일 때 "수락된 요청"이 표시된다', () => {
    const mockInvitation = createMockInvitation(
      InvitationTypeEnum.Group,
      InvitationStatusEnum.ACCEPTED,
    )
    render(<SendedInvitation item={mockInvitation} />)
    expect(screen.getByText('수락된 요청')).toBeInTheDocument()
  })

  it('CANCELED 상태일 때 "취소된 요청"이 표시된다', () => {
    const mockInvitation = createMockInvitation(
      InvitationTypeEnum.Group,
      InvitationStatusEnum.CANCELED,
    )
    render(<SendedInvitation item={mockInvitation} />)
    expect(screen.getByText('취소된 요청')).toBeInTheDocument()
  })

  it('REMOVED 상태일 때 "제거된 요청"이 표시된다', () => {
    const mockInvitation = createMockInvitation(
      InvitationTypeEnum.Group,
      InvitationStatusEnum.REMOVED,
    )
    render(<SendedInvitation item={mockInvitation} />)
    expect(screen.getByText('제거된 요청')).toBeInTheDocument()
  })

  it('요청 철회 버튼 클릭 시 onClickReject 핸들러가 호출된다', () => {
    const mockInvitation = createMockInvitation(
      InvitationTypeEnum.Group,
      InvitationStatusEnum.PENDING,
    )
    const handleReject = vi.fn()
    render(
      <SendedInvitation item={mockInvitation} onClickReject={handleReject} />,
    )

    const rejectButton = screen.getByText('요청 철회')
    fireEvent.click(rejectButton)

    expect(handleReject).toHaveBeenCalledWith(mockInvitation.invitationId)
  })
})
