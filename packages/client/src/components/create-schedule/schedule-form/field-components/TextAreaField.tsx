import { FieldError } from 'react-hook-form'
import BaseSection from './BaseSection'

type Prop = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: FieldError;
  /** 해당 필드가 필수 작성 필드일때 true */
  required?: boolean
}

const TextAreaField = ({ 
  label, 
  placeholder,
  value,
  onChange,
  error,
  required = false
}: Prop) => {

  return (
    <BaseSection 
      label={label}
      currentLength={value.length}
      error={error}
      required={required}
    >
      <div className="w-full rounded border border-neutral-300 p-3 bg-white">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-20 w-full resize-none focus:outline-none"
        ></textarea>
      </div>
    </BaseSection>
  )
}

export default TextAreaField
