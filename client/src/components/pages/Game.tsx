import React, { useEffect } from "react";
import useCountdown from "util/useCountdown";

export default function Game() {
  // for testing, feel free to remove
  const [timer, setTimer] = useCountdown(3);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  // end testing

  return (
    <div className="hero-content w-full text-center m-auto flex-col h-screen">
      <div className="flex-row m-auto">
        <h1 className="text-5xl font-bold">{timer}</h1>
      </div>
    </div>
  );
}
