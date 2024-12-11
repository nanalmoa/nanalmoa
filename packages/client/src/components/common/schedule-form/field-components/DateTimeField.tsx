import React from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { FieldError } from 'react-hook-form'
import { ko } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import './react-datepicker.css'

registerLocale('ko', ko);

type Props = {
  label: string;
  value: Date;
  onChange: (value: Date) => void;
  error?: FieldError;
  /** 종료 일시 선택 시, 선택 가능한 최소 날짜 */
  minDate?: Date;
  /** 종일 옵션 status */
  isAllDay?: boolean;
}

const DateTimeField = ({
  label,
  value,
  onChange,
  error,
  minDate,
  isAllDay
}: Props) => {

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
      <div className="flex justify-between">
        <div className="mb-1 block w-7 py-3 text-sm text-xs font-medium text-neutral-700 sm:w-20 sm:text-base">
          <span>{label}</span>
        </div>
        <div className="relative w-60 text-right">
          <DatePicker
            selected={value}
            onChange={(date) => {
              if (date) {
                onChange(date)
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
            minDate={minDate ? minDate : undefined}
            calendarClassName="custom-datepicker"
          />
          {error && (
            <p className="mt-1 text-sm text-red-500 sm:text-right">
              {error.message}
            </p>
          )}
        </div>
      </div>
    </>
  )
}

export default DateTimeField
