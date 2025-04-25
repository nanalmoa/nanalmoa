import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InvitationLayout from '../InvitationLayout'
import {
  IGroupInvitations,
  IManagerInvitations,
  InvitationTypeEnum,
  InvitationStatusEnum,
} from '@/types/invitations'

const MockComponent = ({ item, onClickReject, onClickAccept }: any) => (
  <div data-testid="mock-component">
    <span>{item.inviterName}</span>
    {onClickReject && (
      <button onClick={() => onClickReject(item.invitationId)}>거절</button>
    )}
    {onClickAccept && (
      <button onClick={() => onClickAccept(item.invitationId)}>수락</button>
    )}
  </div>
)

describe('InvitationLayout', () => {
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

  it('그룹 초대 목록이 있을 때 각 아이템을 렌더링한다', () => {
    const items: IGroupInvitations[] = [mockGroupInvitation]
    render(
      <InvitationLayout
        items={items}
        Component={MockComponent}
        message="초대가 없습니다"
      />,
    )

    const mockComponents = screen.getAllByTestId('mock-component')
    expect(mockComponents).toHaveLength(1)
  })

  it('매니저 초대 목록이 있을 때 각 아이템을 렌더링한다', () => {
    const items: IManagerInvitations[] = [mockManagerInvitation]
    render(
      <InvitationLayout
        items={items}
        Component={MockComponent}
        message="초대가 없습니다"
      />,
    )

    const mockComponents = screen.getAllByTestId('mock-component')
    expect(mockComponents).toHaveLength(1)
  })

  it('초대 목록이 비어있을 때 메시지를 표시한다', () => {
    render(
      <InvitationLayout
        items={[]}
        Component={MockComponent}
        message="초대가 없습니다"
      />,
    )

    expect(screen.getByText('초대가 없습니다')).toBeInTheDocument()
  })

  it('초대 목록이 undefined일 때 메시지를 표시한다', () => {
    render(
      <InvitationLayout
        items={undefined}
        Component={MockComponent}
        message="초대가 없습니다"
      />,
    )

    expect(screen.getByText('초대가 없습니다')).toBeInTheDocument()
  })

  it('거절 버튼 클릭 시 onClickReject 핸들러가 호출된다', () => {
    const handleReject = vi.fn()
    render(
      <InvitationLayout
        items={[mockGroupInvitation]}
        Component={MockComponent}
        onClickReject={handleReject}
      />,
    )

    const rejectButton = screen.getByText('거절')
    rejectButton.click()

    expect(handleReject).toHaveBeenCalledWith(mockGroupInvitation.invitationId)
  })

  it('수락 버튼 클릭 시 onClickAccept 핸들러가 호출된다', () => {
    const handleAccept = vi.fn()
    render(
      <InvitationLayout
        items={[mockGroupInvitation]}
        Component={MockComponent}
        onClickAccept={handleAccept}
      />,
    )

    const acceptButton = screen.getByText('수락')
    acceptButton.click()

    expect(handleAccept).toHaveBeenCalledWith(mockGroupInvitation.invitationId)
  })

  it('커스텀 메시지를 표시할 수 있다', () => {
    const customMessage = '커스텀 메시지입니다'
    render(
      <InvitationLayout
        items={[]}
        Component={MockComponent}
        message={customMessage}
      />,
    )

    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })
})
