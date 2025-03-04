import Select, { components } from 'react-select'
import BaseSection from './BaseSection'
import { useEffect, useState } from 'react'
import { useModal } from '@/hooks/use-modal'
import { useFormContext } from 'react-hook-form'
import RepititionSetModal from './RepititionSetModal'
import { RecurringOptionValue } from '@/types/schedules'
import { addDays } from 'date-fns'

type RecurringOption = {
  value: RecurringOptionValue
  label: string
}

const options: RecurringOption[] = [
  {
    value: 'none',
    label: '설정 취소',
  },
  {
    value: 'daily',
    label: '일간 반복',
  },
  {
    value: 'weekly',
    label: '주간 반복',
  },
  {
    value: 'monthly',
    label: '월간 반복',
  },
  {
    value: 'yearly',
    label: '연간 반복',
  },
]

const dateString = (repeatType: RecurringOptionValue): string => {
  switch (repeatType) {
    case 'daily':
      return '일'
    case 'weekly':
      return '주'
    case 'monthly':
      return '개월'
    case 'yearly':
      return '년'
    default:
      return ''
  }
}

const CustomPlaceholder = () => (
  <div>
    <span className="hidden sm:inline">반복</span>
    <span> 선택</span>
  </div>
)

const RepetitionField = ({ isUpdateForm }: { isUpdateForm?: boolean }) => {
  const { isModalOpen, openModal, closeModal } = useModal()
  const { watch, setValue } = useFormContext()
  const [selected, setSelected] = useState<string>('')
  const [repeatType, setRepeatType] = useState<RecurringOptionValue>('none')

  const isRecurring = watch('isRecurring')
  const currentRecurringOptions = watch('recurringOptions')
  const currentEndDate = watch('endDate')

  useEffect(() => {
    if (currentRecurringOptions?.recurringInterval) {
      setSelected(
        `${currentRecurringOptions.recurringInterval}${dateString(repeatType)} 간격 반복`
      )
    }
  }, [repeatType, currentRecurringOptions?.recurringInterval])

  return (
    <>
      <div id="isRecurring" className="hidden">
        {isRecurring}
      </div>
      {/* <div className="hidden">{currentRecurringOptions?.repeatType}</div> */}
      <BaseSection
        label="반복"
      >
        <div className="flex-growd">
          <Select
            aria-label="반복 선택"
            options={options}
            isDisabled={isUpdateForm}
            placeholder={<CustomPlaceholder />}
            classNamePrefix="react-select"
            className="select-placeholder"
            menuPlacement="auto"
            menuPosition="fixed"
            components={{
              Option: ({ ...props }) => (
                <components.Option {...props}>
                  <div
                    onClick={() => {
                      openModal()
                      setRepeatType(props.data.value)
                      setValue(
                        'isRecurring',
                        props.data.value === 'none' ? false : true
                      )
                      setValue('recurringOptions', {
                        repeatEndDate: addDays(currentEndDate, 31),
                        recurringInterval: 1,
                        repeatType: props.data.value
                      })
                    }}
                  >
                    {props.data.label}
                  </div>
                </components.Option>
              ),
              SingleValue: () => (
                <div className="px-2 py-1 text-center sm:text-sm">
                  {selected}
                </div>
              ),
            }}
            styles={{
              placeholder: (base) => ({
                ...base,
                fontSize: 'inherit',
                lineHeight: 'inherit',
              }),
              control: (base) => ({
                ...base,
                height: '36px',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxShadow: 'none',
                width: 'auto',
                minWidth: '120px',
                display: 'inline-flex',
                alignItems: 'center',
                '&:hover': {
                  borderColor: '#9ca3af',
                },
              }),
              valueContainer: (base) => ({
                ...base,
                padding: '0 8px',
                display: 'flex',
              }),
              singleValue: (base) => ({
                ...base,
                margin: '0',
              }),
              input: (base) => ({
                ...base,
                margin: '0',
                padding: '0',
                caretColor: 'transparent',
              }),
              indicatorSeparator: () => ({
                display: 'none',
              }),
              dropdownIndicator: (base) => ({
                ...base,
                padding: '4px',
              }),
              option: (base) => ({
                ...base,
                color: '#000000',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                },
              }),
            }}
          />
        </div>
      </BaseSection>

      {isModalOpen && (
        <RepititionSetModal
          onClose={closeModal}
          repeatType={repeatType}
          setSelected={setSelected}
        />
      )}
    </>
  )
}

export default RepetitionField
