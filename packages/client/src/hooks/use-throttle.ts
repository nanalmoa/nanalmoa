import { useRef } from 'react'

const useThrottle = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const throttle = (callback: () => void, delay: number) => {
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        // delay time이 끝나면 callback을 실행
        callback()
        timerRef.current = null
      }, delay)
    }
  }

  return { throttle }
}

export default useThrottle
