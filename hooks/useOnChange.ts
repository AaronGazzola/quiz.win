import { isEqual } from "lodash";
import { useEffect, useState } from "react";

const useOnChange = (
  func: () => void,
  value: unknown,
  deps: unknown[] = []
) => {
  const [prev, setPrev] = useState(value);
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isEqual(prev, value)) return;
    setPrev(value);
    func?.();
  }, [func, value, setPrev, prev, ...deps]);
  /* eslint-enable react-hooks/exhaustive-deps */
};

export default useOnChange;
