import React from "react";

interface Props {
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const functionButton: React.FC<Props> = ({
  label,
  onClick = () => {},
  className = "",
}) => {
  return (
    <span
      className={`btn mt-4 w-auto h-auto p-0 deco deco-accent ${className}`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`btn-deco text-lg serif font-semibold text-accent bg-paper-darker px-4 ${className}`}
      >
        {label}
      </button>
    </span>
  );
};

export default functionButton;
