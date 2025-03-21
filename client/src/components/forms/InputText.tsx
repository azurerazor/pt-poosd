interface Props {
    name: string;
    label: string;
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputText: React.FC<Props> = ({ name, label, placeholder = '', value = '', onChange = (_) => {} }) => {
    return (
        <>
            <label
                htmlFor={name}
                className="label w-full text-base-content"
            >
                {label}
            </label>

            <input
                type='text'
                className="input w-full text-base-content"
                required

                id={name}
                name={name}
                placeholder={placeholder}
                defaultValue={value}

                onChange={onChange}
            />
        </>
    )
}
export default InputText;
