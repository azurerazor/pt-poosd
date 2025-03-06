interface Props {
    name: string;
    label: string;
    placeholder?: string;
    value?: string;
}

const InputEmail: React.FC<Props> = ({ name, label, placeholder = '', value = '' }) => {
    return (
        <>
            <label
                htmlFor={name}
                className='label w-full text-base-content'
            >
                {label}
            </label>

            <input
                type='email'
                className='input validator w-full text-base-content'
                required

                id={name}
                name={name}
                placeholder={placeholder}
                defaultValue={value}
            />

            <div className="validator-hint hidden w-full">
                Enter a valid email address
            </div>
        </>
    )
}
export default InputEmail;
