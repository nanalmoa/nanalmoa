import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import InviteModal from '../InviteModal'
import { UserWithPhoneNumber } from '@/types/auth'

describe('InviteModal', () => {
  const mockUser: UserWithPhoneNumber = {
    userUuid: '1',
    userId: 1,
    name: '홍길동',
    phoneNumber: '010-0000-0000',
    profileImage:
      'https://private-user-images.githubusercontent.com/122685653/385623447-c3fef2c6-e8c5-4b46-b7d2-47136c732232.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDU1NTU5MjUsIm5iZiI6MTc0NTU1NTYyNSwicGF0aCI6Ii8xMjI2ODU2NTMvMzg1NjIzNDQ3LWMzZmVmMmM2LWU4YzUtNGI0Ni1iN2QyLTQ3MTM2YzczMjIzMi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNDI1JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDQyNVQwNDMzNDVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1lYTdkMjE1MGNiNzcxZDcyZWRmOGRiMjkyMGFjOGY2ZjgzOTBmZDcwZGNhNjg2NTI2NTAwNDhjYWUyMjhkN2MyJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.xNY8Ch2JnJUdcG-mPGF7mMKrbN9yRBurl20fWq9Lv8w',
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'user1@testn.com',
    isManager: false,
  }

  const mockOnClose = vi.fn()
  const mockOnClick = vi.fn()

  beforeEach(() => {
    const modalRoot = document.createElement('div')
    modalRoot.setAttribute('id', 'modal-root')
    document.body.appendChild(modalRoot)
  })

  it('모달 UI가 올바르게 렌더링된다', () => {
    render(
      <InviteModal
        onClose={mockOnClose}
        user={mockUser}
        type="그룹원"
        title="초대하기"
      />,
    )

    // 모달 제목
    expect(
      screen.getByRole('heading', { name: '초대하기' }),
    ).toBeInTheDocument()

    // 사용자 정보
    expect(screen.getByText('홍길동')).toBeInTheDocument()

    // 초대 메시지
    expect(screen.getByText('그룹원으로 초대하시겠습니까')).toBeInTheDocument()

    // 초대 버튼
    expect(screen.getByRole('button', { name: '초대하기' })).toBeInTheDocument()
  })

  it('그룹원 초대 시 올바른 메시지와 버튼이 표시된다', () => {
    render(<InviteModal onClose={mockOnClose} user={mockUser} type="그룹원" />)

    expect(screen.getByText('그룹원으로 초대하시겠습니까')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '초대하기' })).toBeInTheDocument()
  })

  it('관리자 초대 시 올바른 메시지와 버튼이 표시된다', () => {
    render(<InviteModal onClose={mockOnClose} user={mockUser} type="관리자" />)

    expect(screen.getByText('관리자가 되시겠습니까?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '요청하기' })).toBeInTheDocument()
  })

  it('초대 버튼 클릭 시 onClick 핸들러가 호출된다', () => {
    render(
      <InviteModal
        onClose={mockOnClose}
        user={mockUser}
        type="그룹원"
        onClick={mockOnClick}
      />,
    )

    const inviteButton = screen.getByRole('button', { name: '초대하기' })
    fireEvent.click(inviteButton)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('사용자 정보가 올바르게 표시된다', () => {
    render(<InviteModal onClose={mockOnClose} user={mockUser} type="그룹원" />)

    expect(screen.getByText('홍길동')).toBeInTheDocument()
    expect(screen.getByText('010-0000-0000')).toBeInTheDocument()
  })
})
