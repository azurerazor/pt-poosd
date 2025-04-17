import { createContext, useContext, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

interface HiddenContextType {
  isHidden: boolean;
  setIsHidden: Dispatch<SetStateAction<boolean>>;
}

const HiddenContext = createContext<HiddenContextType | undefined>(undefined);

export const HiddenContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <HiddenContext.Provider value={{ isHidden, setIsHidden }}>
      {children}
    </HiddenContext.Provider>
  );
};

export const useHiddenContext = () => {
  const context = useContext(HiddenContext);
  if (!context)
    throw new Error("useHiddenContext must be used within a ContextProvider");
  return context;
};
