import { registerLocale } from 'react-datepicker'
import { FieldError } from 'react-hook-form'
import { ko } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import './react-datepicker.css'
import Picker from '../../Picker'
import {
  format,
  setDate,
  setHours,
  setMinutes,
  setMonth,
  setYear,
} from 'date-fns'

registerLocale('ko', ko)

type Props = {
  label: string
  value: Date
  onChange: (value: Date) => void
  error?: FieldError
  /** 종료 일시 선택 시, 선택 가능한 최소 날짜 */
  minDate?: Date
  /** 종일 옵션 status */
  isAllDay?: boolean
}

const DateTimeField = ({ label, value, onChange, error, isAllDay }: Props) => {
  const generateColumns = () => {
    const currentYear = new Date().getFullYear() - 10

    return [
      {
        name: 'year',
        options: Array.from({ length: 20 }, (_, i) => ({
          value: (currentYear + i).toString(),
          label: `${currentYear + i}년`,
        })),
      },
      {
        name: 'month',
        options: Array.from({ length: 12 }, (_, i) => ({
          value: i.toString(),
          label: `${i + 1}월`,
        })),
      },
      {
        name: 'day',
        options: Array.from(
          {
            length: new Date(
              value.getFullYear(),
              value.getMonth() + 1,
              0,
            ).getDate(),
          },
          (_, i) => ({
            value: (i + 1).toString(),
            label: `${i + 1}일`,
          }),
        ),
      },
    ]
  }

  const handleChange = ([yearStr, monthStr, dayStr]: string[]) => {
    const newDate = setDate(
      setMonth(setYear(value, parseInt(yearStr)), parseInt(monthStr)),
      parseInt(dayStr),
    )
    onChange(newDate)
  }

  const generateTimeColumns = () => {
    return [
      {
        name: 'hour',
        options: Array.from({ length: 24 }, (_, i) => ({
          value: i.toString(),
          label: format(setHours(new Date(), i), 'HH시', { locale: ko }),
        })),
      },
      {
        name: 'minute',
        options: Array.from({ length: 6 }, (_, i) => ({
          value: (i * 10).toString(),
          label: format(setMinutes(new Date(), i * 10), 'mm분', { locale: ko }),
        })),
      },
    ]
  }

  const handleTimeChange = ([hourStr, minuteStr]: string[]) => {
    const newDate = setMinutes(
      setHours(value, parseInt(hourStr)),
      parseInt(minuteStr),
    )
    onChange(newDate)
  }

  // 기존 datepicker UI에서 사용했던 Input custom
  // const CustomInput = React.forwardRef<
  //   HTMLDivElement,
  //   { value?: string; onClick?: () => void }
  // >(({ value, onClick }, ref) => (
  //   <div
  //     className="mt-1 flex cursor-pointer space-x-1"
  //     onClick={onClick}
  //     ref={ref}
  //   >
  //     <div className="w-fit rounded-lg bg-neutral-200 px-3 py-3 text-center text-xs text-neutral-700 sm:w-fit sm:py-2 sm:text-base">
  //       {value ? value.split(' ').slice(0, 3).join(' ') : '날짜 선택'}
  //     </div>
  //     {!isAllDay && (
  //       <div className="w-fit rounded-lg bg-neutral-200 px-3 py-3 text-center text-xs text-neutral-700 sm:w-fit sm:py-2 sm:text-base">
  //         {value ? value.split(' ').slice(3, 5).join(' ') : '시간 선택'}
  //       </div>
  //     )}
  //   </div>
  // ))

  return (
    <>
      <div className="flex justify-between">
        <div className="mb-1 block py-3 text-sm text-xs font-medium text-neutral-700 sm:w-20 sm:text-base">
          <span>{label}</span>
        </div>
        <div className="relative flex gap-2 text-right">
          <Picker
            columns={generateColumns()}
            values={[
              value.getFullYear().toString(),
              value.getMonth().toString(),
              value.getDate().toString(),
            ]}
            onChange={handleChange}
            placeholder="날짜 선택"
            title="날짜 선택"
          />
          {!isAllDay && (
            <Picker
              columns={generateTimeColumns()}
              values={[
                value.getHours().toString(),
                (Math.floor(value.getMinutes() / 10) * 10).toString(),
              ]}
              onChange={handleTimeChange}
              placeholder="시간 선택"
              title="시간 선택"
            />
          )}
          {/* <DatePicker
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
          /> */}
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
