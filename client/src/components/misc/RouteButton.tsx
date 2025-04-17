import React, { PropsWithChildren } from "react";
import { Link } from "react-router";

interface Props extends PropsWithChildren {
  to: string;
}

const RouteButton: React.FC<Props> = ({ to, children }) => {
  return (
    <span className="btn mt-4 w-auto h-auto p-0 deco deco-accent">
      <Link
        to={to}
        className="btn-deco text-lg serif font-semibold text-accent bg-paper-darker p-2"
      >
        {children}
      </Link>
    </span>
  );
};
export default RouteButton;
