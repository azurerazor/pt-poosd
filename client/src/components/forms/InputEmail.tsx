interface Props {
    name: string;
    label: string;
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputEmail: React.FC<Props> = ({ name, label, placeholder = '', value = '', onChange = (_) => {} }) => {
    return (
        <>
            <label
                htmlFor={name}
                className="label w-full text-base-content"
            >
                {label}
            </label>

            <input
                type='email'
                className="input validator w-full text-base-content"
                required

                id={name}
                name={name}
                placeholder={placeholder}
                defaultValue={value}

                onChange={onChange}
            />

            <div className="validator-hint hidden w-full">
                Enter a valid email address
            </div>
        </>
    )
}
export default InputEmail;
