import { getLocalSession } from "@/lib/util/localStorage";

const useLocalSession = () => {
  const localSession = getLocalSession();
  if (!localSession) return null;
  return JSON.parse(localSession);
};

export default useLocalSession;
