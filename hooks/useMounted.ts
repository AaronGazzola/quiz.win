import { useEffect, useRef, useState } from "react";

export function useMounted() {
  const mountedRef = useRef(false);
  const [mountedState, setMountedState] = useState(false);
  useEffect(() => {
    setMountedState(true);
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  return mountedState && mountedRef.current;
}
