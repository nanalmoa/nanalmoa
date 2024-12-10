import { Button } from '@/components/common'
import { describe, expect, vi, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Button', () => {
  test('기본 type 속성 확인', () => {
    render(<Button text="버튼" />)
    expect(screen.getByText('버튼')).toHaveAttribute('type', 'button')
  })

  test('텍스트 렌더링 테스트', () => {
    //렌더링 하고
    render(<Button text="로그인" />)
    //요소를 찾는다.
    expect(screen.getByText('로그인')).toBeInTheDocument()
  })

  test('로딩일때, loading spinner 렌더링', () => {
    render(<Button text="loading" isLoading={true} />)
    const spinner = screen.getByRole('status') //LoadingSpinner.tsx 의 role 값
    expect(spinner).toBeInTheDocument()
  })

  test('로딩중일때 텍스트 미표시', () => {
    render(<Button text="loading" isLoading={true} />)
    expect(screen.queryByText('loading')).not.toBeInTheDocument()
    //텍스트를 loading으로 지정해도, not.toBeInTheDocument 로 문서에 요소가 포함되어있지 않은지 검증
  })

  test('disabled 일때 버튼 비활성화 UI', () => {
    render(<Button text="cant click" disabled={true} />)
    expect(screen.getByText('cant click')).toBeDisabled()
  })

  test('disabled 클릭 이벤트 차단', async () => {
    const handleClick = vi.fn()
    render(<Button text="클릭" onClick={handleClick} disabled={true} />)
    //버튼 클릭 시뮬레이션
    await userEvent.click(screen.getByText('클릭'))
    expect(handleClick).not.toHaveBeenCalled()
    //클릭횟수 not 없음
  })

  test('클릭 이벤트', async () => {
    const handleClick = vi.fn() //모의 함수 생성
    render(<Button text="클릭" onClick={handleClick} />)
    await userEvent.click(screen.getByText('클릭'))
    expect(handleClick).toHaveBeenCalledTimes(1)
    //클릭 핸들러 한 번 호출되었는지 검증
  })

  test('props 전파 확인', () => {
    render(<Button text="버튼" aria-label="속성" />)
    expect(screen.getByLabelText('속성')).toBeInTheDocument()
  })
  
  //스타일 렌더링
  test('커스텀 클래스 적용 확인', () => {
    render(<Button text="버튼" className="custom-class" />)
    expect(screen.getByText('버튼')).toHaveClass('custom-class')
  })

  test('solid 테마일 때 스타일 적용', () => {
    render(<Button text="버튼" theme="solid" />)
    const button = screen.getByText('버튼')
    expect(button).toHaveClass('bg-primary-base')
    expect(button).toHaveClass('text-white')
  })

  test('outline 테마일 때 스타일 적용', () => {
    render(<Button text="버튼" theme="outline" />)
    const button = screen.getByText('버튼')
    expect(button).toHaveClass('border-primary-base')
    expect(button).toHaveClass('text-primary-base')
  })
})
