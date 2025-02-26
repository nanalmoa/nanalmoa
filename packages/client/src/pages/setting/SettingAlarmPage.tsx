import { Button } from '@/components/common'
import Divider from '@/components/common/Divider'
import Toast from '@/components/common/Toast'
import { path } from '@/routes/path'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SettingAlarmPage = () => {
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(false)
  const navigate = useNavigate()

  const handleToggle = async () => {
    setIsAlarmEnabled((prev) => !prev)
    // 알림 권한 요청 - 권한 제대로 안됨
    if (isAlarmEnabled) {
      setIsAlarmEnabled(false)
      console.log('알림이 꺼졌습니다.')
    } else {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setIsAlarmEnabled(true)
        console.log('알림 권한이 허용되었습니다.')
      } else {
        console.log('알림 권한이 거부되었습니다.')
      }
    }
  }

  return (
    <div className="px-4">
      <div className="mb-2 flex justify-between">
        <Button text="이전으로" onClick={() => navigate(path.settings.base)} />
      </div>
      <h1 className="text-center text-lg font-semibold">🔔 알림 설정</h1>
      <p className="mt-4 text-center">일정이 다가오면 알림을 드려요.</p>
      <p className="mt-2 text-center">
        복약 시간에 맞춰 알림을 켜고
        <br />
        정해진 시간에 규칙적으로
        <br /> 약을 먹을 수 있어요.
      </p>
      <p className="mb-4 mt-2 text-center">
        관리자, 그룹에 대해 <br />
        전체적인 알림을 드려요.
      </p>
      <Divider />

      <h2 className="mt-4 text-center text-lg font-semibold">
        {isAlarmEnabled ? '알림 켜짐' : '알림 꺼짐'}
      </h2>
      <div className="my-4 flex items-center justify-center">
        <button
          onClick={handleToggle}
          className={`h-6 w-12 rounded-full transition duration-300 ${isAlarmEnabled ? 'bg-primary-base' : 'bg-neutral-300'}`}
        >
          <div
            className={`h-6 w-6 rounded-full bg-white transition-transform duration-300 ${isAlarmEnabled ? 'translate-x-6 transform' : ''}`}
          />
        </button>
      </div>

      <Divider />
      <h2 className="mt-4 text-center text-lg font-semibold">
        디바이스 알림 권한 켜는 방법
      </h2>
      <p className="mt-2 text-center text-lg">
        기기의 설정 ⚙️ &gt; 애플리케이션 &gt; 나날모아 &gt; 알림 권한
      </p>
      <Toast />
    </div>
  )
}

export default SettingAlarmPage
