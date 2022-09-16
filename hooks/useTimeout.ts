import { useEffect } from "react";

const useTimeout = <T>(value: T, func: () => void, duration?: number) => {
  useEffect(() => {
    const timer = setTimeout(() => func(), duration || 500);
    return () => clearTimeout(timer);
  }, [value, func, duration]);
};

export default useTimeout;
