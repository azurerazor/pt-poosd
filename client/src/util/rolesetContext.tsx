import { createContext, useContext, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Roles } from "@common/game/roles";

interface RolesetContextType {
  roles: Roles;
  setRoles: Dispatch<SetStateAction<Roles>>;
}

const RolesetContext = createContext<RolesetContextType | undefined>(undefined);

export const RolesetContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [roles, setRoles] = useState(Roles.NONE);

  return (
    <RolesetContext.Provider value={{ roles, setRoles }}>
      {children}
    </RolesetContext.Provider>
  );
};

export const useRolesetContext = () => {
  const context = useContext(RolesetContext);
  if (!context) throw new Error("useRolesetContext must be used within a ContextProvider");
  return context;
};
