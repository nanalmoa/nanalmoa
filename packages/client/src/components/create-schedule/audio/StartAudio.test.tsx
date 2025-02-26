import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import StartAudio from './StartAudio'
import useAudioRecord from '@/hooks/use-audio-record'

const mockGetUserMedia = vi.fn()
beforeAll(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: mockGetUserMedia,
    },
  })
})

// useAudioRecord 훅 모킹
vi.mock('@/hooks/use-audio-record')

describe('StartAudio 컴포넌트', () => {
  const handlePostMock = vi.fn()

  beforeEach(() => {
    // 기본 반환값 설정
    ;(useAudioRecord as jest.Mock).mockImplementation(() => ({
      isRecording: false,
      audioURL: null, // 초기 상태는 null로 설정
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      loadAudio: vi.fn(),
    }))
  })

  test('컴포넌트가 렌더링되고 버튼이 표시되는지 확인', () => {
    render(<StartAudio handlePost={handlePostMock} />)

    expect(screen.getByText('어떤 방법을 선택하실건가요?')).toBeInTheDocument()
    expect(screen.getByText('직접 녹음하기')).toBeInTheDocument()
    expect(screen.getByText('녹음 파일 가져오기')).toBeInTheDocument()
  })

  test('직접 녹음하기 버튼 클릭 시 녹음 시작 버튼으로 변경', () => {
    render(<StartAudio handlePost={handlePostMock} />)

    fireEvent.click(screen.getByText('직접 녹음하기'))

    expect(screen.getByText('녹음 시작')).toBeInTheDocument()
  })

  test('녹음 중일 때 버튼 텍스트 변경 확인', async () => {
    render(<StartAudio handlePost={handlePostMock} />)
    fireEvent.click(screen.getByText('직접 녹음하기'))

    await waitFor(() => {
      expect(screen.getByText('녹음 종료')).toBeInTheDocument()
    })
  })

  test('파일 업로드 버튼 클릭 시 파일 선택', async () => {
    render(<StartAudio handlePost={handlePostMock} />)

    fireEvent.click(screen.getByText('녹음 파일 가져오기'))

    // 파일 input 클릭 시뮬레이션하기
    const fileInput = screen.getByLabelText(/파일/i)
    Object.defineProperty(fileInput, 'files', {
      value: [new File(['dummy audio'], 'test.wav', { type: 'audio/wav' })],
    })
    fireEvent.change(fileInput)

    expect(handlePostMock).toHaveBeenCalledWith(expect.any(File))
  })

  test('재녹음 버튼 클릭 시 audio 상태 초기화', () => {
    render(<StartAudio handlePost={handlePostMock} />)

    fireEvent.click(screen.getByText('직접 녹음하기'))
    fireEvent.click(screen.getByText('네, 맞아요')) // 음성이 맞다고 가정

    expect(handlePostMock).toHaveBeenCalled() // handlePost가 호출되었는지 확인

    fireEvent.click(screen.getByText('아니요, 재녹음할래요'))

    expect(screen.getByText('어떤 방법을 선택하실건가요?')).toBeInTheDocument()
  })

  test('오디오 녹음 권한 요청 확인', async () => {
    render(<StartAudio handlePost={handlePostMock} />)

    fireEvent.click(screen.getByText('직접 녹음하기'))

    // 권한 요청을 모킹하여 성공적으로 응답하도록 설정
    mockGetUserMedia.mockResolvedValueOnce(new MediaStream())

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })
    })
  })

  test('오디오 녹음 기능 정상 동작 확인', async () => {
    const startRecording = vi.fn()
    const stopRecording = vi.fn()
    const audioURL = 'mock-audio-url'

    ;(useAudioRecord as jest.Mock).mockImplementationOnce(() => ({
      isRecording: false,
      audioURL: audioURL,
      startRecording: startRecording,
      stopRecording: stopRecording,
      loadAudio: vi.fn(),
    }))

    render(<StartAudio handlePost={handlePostMock} />)

    fireEvent.click(screen.getByText('직접 녹음하기'))

    // 녹음 시작 호출 확인
    expect(startRecording).toHaveBeenCalled() // 수정된 부분

    // 녹음 종료 버튼 클릭
    fireEvent.click(screen.getByText('녹음 종료'))

    // 녹음 종료 호출 확인
    expect(stopRecording).toHaveBeenCalled() // 수정된 부분

    // audioURL이 올바르게 설정되었는지 확인
    await waitFor(() => {
      expect(screen.getByText('해당 음성이 맞나요?')).toBeInTheDocument()
      const audioElement = screen.getByRole('audio') // audio 요소를 찾기
      expect(audioElement).toHaveAttribute('src', audioURL) // audio 요소의 src 속성 확인
    })
  })
})
