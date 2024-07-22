import AuthServerProvider from "@/providers/AuthServerProvider";
import NotificationProvider from "@/providers/NotificationProvider";
import ProgressProvider from "@/providers/ProgressProvider";
import SuspendedSearchParamsProvider from "@/providers/SearchParamsProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProgressProvider>
        <NotificationProvider>
          <SuspendedSearchParamsProvider>
            <AuthServerProvider>{children}</AuthServerProvider>
          </SuspendedSearchParamsProvider>
        </NotificationProvider>
      </ProgressProvider>
    </ThemeProvider>
  );
};

export default Providers;
