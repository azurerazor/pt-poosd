import React from "react";

interface Props {
  name: string;
  label: string;
  minLength: number;
  maxLength: number;
  pattern: string;
  validatorHint: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputText = ({
  name,
  label,
  minLength,
  maxLength,
  pattern,
  validatorHint,
  placeholder = "",
  value = "",
  onChange = () => {},
}: Props) => {
  return (
    <>
      <label htmlFor={name} className="label w-full text-base-content">
        {label}
      </label>

      <input
        type="text"
        className="input validator w-full text-base-content"
        required
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        id={name}
        name={name}
        placeholder={placeholder}
        defaultValue={value}
        onChange={onChange}
      />

      <p className="validator-hint hidden w-full">{validatorHint}</p>
    </>
  );
};
export default InputText;
