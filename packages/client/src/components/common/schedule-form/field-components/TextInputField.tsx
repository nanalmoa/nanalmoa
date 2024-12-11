import { FieldError } from 'react-hook-form'
import BaseSection from './BaseSection'
import { Input } from '../..'
import { cn } from '@/utils/cn'

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: FieldError;
  /** 해당 필드가 필수 작성 필드일때 true */
  required?: boolean
}

const TextInputField = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false
}: Props) => {

  return (
    <BaseSection
      label={label}
      currentLength={value.length}
      error={error}
      required={required}
    >
      <div className="flex w-full">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'animate-border focus:shadow-outline appearance-none border-neutral-300 leading-tight',
            'text-neutral-700 transition-colors duration-300 ease-in-out focus:border-green-800 focus:outline-none',
          )}
        />
      </div>
    </BaseSection>
  )
}

export default TextInputField
