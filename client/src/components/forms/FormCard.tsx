import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {

}

const FormCard: React.FC<Props> = ({ children }) => {
    return (
        <div className="card w-full max-w-sm shrink-0 shadow-2xl bg-base-100 border-2 border-base-300 p-2">
            <div className="card-body">
                {children}
            </div>
        </div>
    )
}
export default FormCard;
