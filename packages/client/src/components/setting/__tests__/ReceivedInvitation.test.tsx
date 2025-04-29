import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ReceivedInvitation from '../ReceivedInvitation'
import {
  IGroupInvitations,
  IManagerInvitations,
  InvitationTypeEnum,
  InvitationStatusEnum,
} from '@/types/invitations'

describe('ReceivedInvitation', () => {
  const mockGroupInvitation: IGroupInvitations = {
    invitationId: 1,
    invitationType: InvitationTypeEnum.Group,
    status: InvitationStatusEnum.PENDING,
    inviterUuid: 'inviter-123',
    inviteeUuid: 'invitee-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    inviterName: '홍길동',
    inviteeName: '김철수',
    groupId: 1,
    groupName: '테스트 그룹',
  }

  const mockManagerInvitation: IManagerInvitations = {
    invitationId: 2,
    invitationType: InvitationTypeEnum.Manager,
    status: InvitationStatusEnum.PENDING,
    inviterUuid: 'inviter-456',
    inviteeUuid: 'invitee-456',
    createdAt: new Date(),
    updatedAt: new Date(),
    inviterName: '이영희',
    inviteeName: '박지성',
  }

  it('그룹 초대일 때 그룹 이름이 표시된다', () => {
    render(<ReceivedInvitation item={mockGroupInvitation} />)
    expect(screen.getByText('테스트 그룹')).toBeInTheDocument()
  })

  it('매니저 초대일 때는 그룹 이름이 표시되지 않는다', () => {
    render(<ReceivedInvitation item={mockManagerInvitation} />)
    expect(screen.queryByText('테스트 그룹')).not.toBeInTheDocument()
  })

  it('초대자 이름이 항상 표시된다', () => {
    render(<ReceivedInvitation item={mockGroupInvitation} />)
    expect(screen.getByText('홍길동')).toBeInTheDocument()
  })

  it('PENDING 상태일 때 수락/거절 버튼이 표시된다', () => {
    const handleAccept = vi.fn()
    const handleReject = vi.fn()
    render(
      <ReceivedInvitation
        item={mockGroupInvitation}
        onClickAccept={handleAccept}
        onClickReject={handleReject}
      />,
    )
    expect(screen.getByText('초대 수락')).toBeInTheDocument()
    expect(screen.getByText('초대 거절')).toBeInTheDocument()
  })

  it('REJECTED 상태일 때 "거절된 요청"이 표시된다', () => {
    const rejectedInvitation = {
      ...mockGroupInvitation,
      status: InvitationStatusEnum.REJECTED,
    }
    render(<ReceivedInvitation item={rejectedInvitation} />)
    expect(screen.getByText('거절된 요청')).toBeInTheDocument()
  })

  it('ACCEPTED 상태일 때 "수락된 요청"이 표시된다', () => {
    const acceptedInvitation = {
      ...mockGroupInvitation,
      status: InvitationStatusEnum.ACCEPTED,
    }
    render(<ReceivedInvitation item={acceptedInvitation} />)
    expect(screen.getByText('수락된 요청')).toBeInTheDocument()
  })

  it('CANCELED 상태일 때 "취소된 요청"이 표시된다', () => {
    const canceledInvitation = {
      ...mockGroupInvitation,
      status: InvitationStatusEnum.CANCELED,
    }
    render(<ReceivedInvitation item={canceledInvitation} />)
    expect(screen.getByText('취소된 요청')).toBeInTheDocument()
  })

  it('REMOVED 상태일 때 "제거된 요청"이 표시된다', () => {
    const removedInvitation = {
      ...mockGroupInvitation,
      status: InvitationStatusEnum.REMOVED,
    }
    render(<ReceivedInvitation item={removedInvitation} />)
    expect(screen.getByText('제거된 요청')).toBeInTheDocument()
  })

  it('수락 버튼 클릭 시 onClickAccept 핸들러가 호출된다', () => {
    const handleAccept = vi.fn()
    render(
      <ReceivedInvitation
        item={mockGroupInvitation}
        onClickAccept={handleAccept}
      />,
    )

    const acceptButton = screen.getByText('초대 수락')
    fireEvent.click(acceptButton)

    expect(handleAccept).toHaveBeenCalledWith(mockGroupInvitation.invitationId)
  })

  it('거절 버튼 클릭 시 onClickReject 핸들러가 호출된다', () => {
    const handleReject = vi.fn()
    render(
      <ReceivedInvitation
        item={mockGroupInvitation}
        onClickReject={handleReject}
      />,
    )

    const rejectButton = screen.getByText('초대 거절')
    fireEvent.click(rejectButton)

    expect(handleReject).toHaveBeenCalledWith(mockGroupInvitation.invitationId)
  })

  it('onClickAccept이 없을 때 수락 버튼이 표시되지 않는다', () => {
    render(<ReceivedInvitation item={mockGroupInvitation} />)
    expect(screen.queryByText('초대 수락')).not.toBeInTheDocument()
  })

  it('onClickReject이 없을 때도 거절 버튼은 표시된다', () => {
    render(<ReceivedInvitation item={mockGroupInvitation} />)
    expect(screen.getByText('초대 거절')).toBeInTheDocument()
  })
})
