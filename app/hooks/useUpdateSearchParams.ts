"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface KeyValue {
  key: string;
  value?: string;
}

const useUpdateSearchParams = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  return useCallback(
    (newParams: KeyValue[] | KeyValue, navPath?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const isArray = Array.isArray(newParams);
      const updateparams = (key: string, value?: string) => {
        if (value) params.set(key, value);
        if (value) params.set(key, value);
        else params.delete(key);
      };
      if (isArray)
        newParams.forEach(({ key, value }) => updateparams(key, value));
      if (!isArray) updateparams(newParams.key, newParams.value);
      if (navPath) return void router.push(`${navPath}?${params}`);
      void router.replace(`${pathname}?${params}`);
    },
    [searchParams, pathname, router]
  );
};

export default useUpdateSearchParams;
