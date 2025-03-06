import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
    value: string;
}

const Submit: React.FC<Props> = ({ value, children }) => {
    return (
        <input
            type="submit"
            value={value}
            className="btn btn-primary w-full mt-4"
        />
    )
}
export default Submit;
