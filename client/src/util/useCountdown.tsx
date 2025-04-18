import { useEffect, useRef, useState } from "react";

export default function useCountdown(
  initTime: number = 0,
): [number, (next: number) => void] {
  const [secondsLeft, setSecondsLeft] = useState(initTime);
  const interval = useRef<NodeJS.Timeout | null>(null);

  const resetInterval = () => {
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
  };

  useEffect(() => {
    if (interval.current) return;
    interval.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) {
          resetInterval();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [secondsLeft]);

  return [
    secondsLeft,
    (next: number) => {
      resetInterval();
      setSecondsLeft(next);
    },
  ];
}
