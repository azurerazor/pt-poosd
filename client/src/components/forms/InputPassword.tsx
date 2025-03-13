interface Props {
    name: string;
    label: string;
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputPassword: React.FC<Props> = ({ name, label, placeholder = '', value = '', onChange = (_) => {} }) => {
    return (
        <>
            <label
                htmlFor={name}
                className="label w-full text-base-content"
            >
                {label}
            </label>

            <input
                type="password"
                className="input validator w-full text-base-content"
                minlength="8"
                required

                id={name}
                name={name}
                placeholder={placeholder}
                defaultValue={value}

                onChange={onChange}
            />

            <p className="validator-hint hidden w-full">
                Password must be at least 8 characters
            </p>
        </>
    )
}
export default InputPassword;
