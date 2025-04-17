import { PropsWithChildren } from "react";
import { Link } from "react-router";

interface Props extends PropsWithChildren {
  to: string;
}

const RouteLink: React.FC<Props> = ({ to, children }) => {
  return (
    <Link to={to} className="link link-hover text-primary">
      {children}
    </Link>
  );
};

export default RouteLink;
