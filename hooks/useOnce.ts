import { useEffect, useState } from "react";

const useOnce = (func: () => void = () => null, deps: unknown[] = []) => {
  const [hasRun, setHasRun] = useState(false);
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (hasRun) return;
    setHasRun(true);
    func();
  }, [hasRun, setHasRun, func, ...deps]);
  /* eslint-enable react-hooks/exhaustive-deps */
};

export default useOnce;
