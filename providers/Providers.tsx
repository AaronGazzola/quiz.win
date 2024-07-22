import AuthServerProvider from "@/providers/AuthServerProvider";
import NotificationProvider from "@/providers/NotificationProvider";
import ProgressProvider from "@/providers/ProgressProvider";
import SuspendedSearchParamsProvider from "@/providers/SearchParamsProvider";
import { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ProgressProvider>
      <NotificationProvider>
        <SuspendedSearchParamsProvider>
          <AuthServerProvider>{children}</AuthServerProvider>
        </SuspendedSearchParamsProvider>
      </NotificationProvider>
    </ProgressProvider>
  );
};

export default Providers;
