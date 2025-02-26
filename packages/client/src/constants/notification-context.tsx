import React, { createContext, useContext, useRef } from 'react'
import logo from '@/assets/svgs/logo.svg'
import useThrottle from '@/hooks/use-throttle'

interface NotificationOptions {
  badge?: string
  icon?: string
  body?: string
  [key: string]: any
}

interface NotificationContextType {
  fireNotificationWithTimeout: (
    title: string,
    timeout: number,
    options?: NotificationOptions,
  ) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notificationRef = useRef<Notification | null>(null)
  const { throttle } = useThrottle()

  // Notification이 지원되지 않는 브라우저일 경우 Early return
  if (!('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.')
    return <>{children}</>
  }

  // 유저가 푸시 알림을 허용하지 않았다면
  if (Notification.permission !== 'granted') {
    Notification.requestPermission()
      .then((permission) => {
        if (permission !== 'granted') {
          console.log('알림 권한이 거부되었습니다.')
          return
        }
      })
      .catch((error) => {
        console.error('알림 권한 요청 중 오류 발생:', error)
      })
  }

  // 유저가 푸시 알림을 클릭하면, 푸시 알림이 일어난 화면으로 이동하기
  const setNotificationClickEvent = () => {
    if (notificationRef.current) {
      notificationRef.current.onclick = (event) => {
        event.preventDefault()
        window.focus()
        notificationRef.current?.close()
      }
    }
  }

  // 타이머
  const setNotificationTimer = (timeout: number) => {
    throttle(() => {
      if (notificationRef.current) {
        notificationRef.current.close()
        notificationRef.current = null
      }
    }, timeout)
  }

  const fireNotificationWithTimeout = (
    title: string,
    timeout: number,
    options: NotificationOptions = {},
  ) => {
    if (Notification.permission !== 'granted') return

    const newOption = {
      badge: logo,
      icon: logo,
      ...options,
    }

    if (!notificationRef.current) {
      setNotificationTimer(timeout)

      notificationRef.current = new Notification(title, newOption)

      setNotificationClickEvent()
    }
  }

  return (
    <NotificationContext.Provider value={{ fireNotificationWithTimeout }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const usePushNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    )
  }
  return context
}
