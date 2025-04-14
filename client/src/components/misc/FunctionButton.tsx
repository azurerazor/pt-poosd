import React from "react";

interface Props {
    label: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const functionButton: React.FC<Props> = ({ label, onClick = (_) => {} }) => {
    return (
        <span className="btn mt-4 w-auto h-auto p-0 deco deco-accent">
            <button
                type="button"
                onClick={onClick}
                className="btn-deco text-lg serif font-semibold text-accent bg-paper-darker p-2">
                    {label}
            </button>
        </span>
    )
}
export default functionButton;
