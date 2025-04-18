import React from "react";

interface Props {
  value: string;
}

const Submit = ({ value }: Props) => {
  return (
    <span className="btn w-2/3 mt-4 h-auto p-0 deco deco-accent">
      <input
        type="submit"
        value={value}
        className="btn-deco p-1 w-full h-full text-lg serif font-semibold text-accent bg-paper-darker"
      />
    </span>
  );
};
export default Submit;
