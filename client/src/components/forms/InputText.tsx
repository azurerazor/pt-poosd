import React from "react";

interface Props {
  name: string;
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const InputText: React.FC<Props> = ({
  name,
  label,
  placeholder = "",
  value = "",
  onChange = () => {},
  className = "",
}) => {
  return (
    <>
      {label && (
        <label htmlFor={name} className="label w-full text-base-content mb-1">
          {label}
        </label>
      )}

      <input
        type="text"
        id={name}
        name={name}
        required
        placeholder={placeholder}
        defaultValue={value}
        onChange={onChange}
        className={`input w-full text-base-content ${className}`}
      />
    </>
  );
};

export default InputText;
