import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren { }

const FormCard: React.FC<Props> = ({ children, ...props }) => {
    return (
        <div className="card w-full max-w-sm shrink-0 shadow-2xl bg-base-100 border-2 border-accent p-2">
            <div className="card-body flex flex-col items-center" {...props}>
                {children}
            </div>
        </div>
    )
}
export default FormCard;
