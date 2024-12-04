import React, { useState } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { Controller, useFormContext } from 'react-hook-form'
import BaseSection from './BaseSection'
import { ko } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import './react-datepicker.css'
import {
  addDays,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from 'date-fns'
import { toast } from 'react-toastify'
import Toast from '../../Toast'

registerLocale('ko', ko)

const DateTimeField = () => {
  const { watch, control, setValue } = useFormContext()

  const isAllDay = watch('isAllDay')
  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const [error, setError] = useState<string | null>(null)

  const validateEndDate = (endDate: Date | null, startDate: Date | null) => {
    if (startDate && endDate && endDate < startDate) {
      toast.error('시작 일자는 종료 일자보다 빨라야 합니다!', {
        className: 'text-[14px]',
      })
      return false
    }
    setError(null)
    return true
  }

  /** 종일 옵션 선택 시, 시작 날짜의 시간을 자정으로 변환하는 함수 */
  const setMidnight = (date: Date) => {
    return setHours(setMinutes(setSeconds(setMilliseconds(date, 0), 0), 0), 0)
  }

  /** 종일 옵션 선택 시, 마지막 날짜의 시간을 23시 59분으로 변환하는 함수 */
  const setEndOfDay = (date: Date) => {
    return setHours(setMinutes(setSeconds(setMilliseconds(date, 999), 59), 59), 23)
  }

  console.log({ startDate, endDate })

  const CustomInput = React.forwardRef<
    HTMLDivElement,
    { value?: string; onClick?: () => void }
  >(({ value, onClick }, ref) => (
    <div
      className="mt-1 flex cursor-pointer space-x-1"
      onClick={onClick}
      ref={ref}
    >
      <div className="w-fit rounded-lg bg-neutral-200 px-3 py-3 text-center text-xs text-neutral-700 sm:w-fit sm:py-2 sm:text-base">
        {value ? value.split(' ').slice(0, 3).join(' ') : '날짜 선택'}
      </div>
      {!isAllDay && (
        <div className="w-fit rounded-lg bg-neutral-200 px-3 py-3 text-center text-xs text-neutral-700 sm:w-fit sm:py-2 sm:text-base">
          {value ? value.split(' ').slice(3, 5).join(' ') : '시간 선택'}
        </div>
      )}
    </div>
  ))

  return (
    <>
      <BaseSection label="날짜와 시간">
        <div className="pt-5">

          {/* 종일 옵션 토글 */}
          <div className="mb-6 flex justify-between">
            <h2 className="text-sm sm:text-base">하루 종일</h2>
            <Controller
              name="isAllDay"
              control={control}
              render={({ field }) => (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...field}
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e)
                      if (e.target.checked) {
                        if (startDate) setValue('startDate', setMidnight(startDate))
                        if (endDate) setValue('endDate', setEndOfDay(endDate))
                      }
                    }}
                  />
                  <div className="
                    w-11 h-6 bg-gray-300 
                    peer-checked:bg-primary-base
                    rounded-full peer 
                    after:content-[''] 
                    after:absolute 
                    after:top-0.5 
                    after:left-[2px] 
                    after:bg-white 
                    after:rounded-full 
                    after:h-5 
                    after:w-5 
                    after:transition-all
                    peer-checked:after:translate-x-full 
                    peer-checked:after:border-white"
                  >
                  </div>
                </label>
              )}
            />
          </div>

          {error && (
            <div className="mb-4 mt-4 text-xs text-red-500 sm:text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="mb-1 block w-7 py-3 text-sm text-xs font-medium text-neutral-700 sm:w-20 sm:text-base">
                <span>시작</span>
                <span className="hidden sm:inline"> 일자</span>
              </div>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: '시작 날짜를 입력해주세요.' }}
                render={({ field, fieldState: { error } }) => (
                  <div className="relative w-60 text-right">
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => {
                        if (date) {
                          if (!endDate) {
                            setValue('startDate', date)
                            setValue('endDate', addDays(date, 1))
                          } else if (validateEndDate(endDate, date)) {
                            setValue('startDate', date)
                          }
                        }
                      }}
                      showTimeSelect={!isAllDay}
                      timeFormat="HH:mm"
                      timeCaption="시간"
                      locale="ko"
                      timeIntervals={10}
                      dateFormat={
                        isAllDay ? 'yyyy. MM. dd.' : 'yyyy. MM. dd. aa h:mm'
                      }
                      customInput={<CustomInput />}
                      calendarClassName="custom-datepicker"
                    />
                    {error && (
                      <p className="mt-1 text-sm text-red-500 sm:text-right">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="flex justify-between">
              <div className="mb-1 block w-7 py-3 text-xs font-medium text-neutral-700 sm:w-20 sm:text-base">
                <span>종료</span>
                <span className="hidden sm:inline"> 일자</span>
              </div>
              <Controller
                name="endDate"
                control={control}
                rules={{ required: '종료 날짜를 입력해주세요.' }}
                render={({ field, fieldState: { error } }) => (
                  <div className="relative w-60 text-right">
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => {
                        if (validateEndDate(date, startDate)) {
                          field.onChange(date)
                        } else {
                          setValue('endDate', field.value)
                        }
                      }}
                      showTimeSelect={!isAllDay}
                      timeFormat="HH:mm"
                      timeCaption="시간"
                      locale="ko"
                      timeIntervals={10}
                      dateFormat={
                        isAllDay ? 'yyyy. MM. dd.' : 'yyyy. MM. dd. aa h:mm'
                      }
                      customInput={<CustomInput />}
                      minDate={startDate}
                      calendarClassName="custom-datepicker"
                    />
                    {error && (
                      <p className="mt-1 text-sm text-red-500 sm:text-right">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </BaseSection>

      <Toast />
    </>
  )
}

export default DateTimeField
