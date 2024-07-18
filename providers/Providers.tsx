import AuthServerProvider from "@/providers/AuthServerProvider";
import NotificationProvider from "@/providers/NotificationProvider";
import ProgressProvider from "@/providers/ProgressProvider";
import SuspendedSearchParamsProvider from "@/providers/SearchParamsProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ProgressProvider>
      <NotificationProvider>
        <AntdRegistry>
          <SuspendedSearchParamsProvider>
            <AuthServerProvider>{children}</AuthServerProvider>
          </SuspendedSearchParamsProvider>
        </AntdRegistry>
      </NotificationProvider>
    </ProgressProvider>
  );
};

export default Providers;
