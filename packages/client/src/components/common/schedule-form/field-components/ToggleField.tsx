import { FieldError } from "react-hook-form";

type Props = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: FieldError;
}

const ToggleField = ({
  label,
  value,
  onChange,
}: Props) => {

  return(
    <>
      <div className="my-3 flex justify-between">
        <h2 className="text-sm sm:text-base">{label}</h2>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
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
      </div>
    </>
  );
}

export default ToggleField;