import { FieldError } from 'react-hook-form'

interface FormFieldProps {
  label: string;
  error?: FieldError;
  currentLength?: number;
  maxLength?: number;
  children?: React.ReactNode;
  required?: boolean;
}

const TEXT_MAX_LENGTH = 240

const BaseSection = ({
  label,
  error,
  currentLength,
  maxLength = TEXT_MAX_LENGTH,
  children,
  required
}: FormFieldProps) => {
  const hasLength = typeof currentLength === "number";

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div
          className="flex gap-1 mb-2 block text-base font-bold text-neutral-700"
        >
          <div>{label}</div>
          {required && <div className="text-red-500">*</div>}
        </div>
        {hasLength && (
          <p className="text-xs text-neutral-500">
            {currentLength} / {maxLength}
          </p>
        )}
      </div>

      {children}
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )
}

export default BaseSection
