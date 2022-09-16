import { createContext, useState } from "react";

export interface AlertData {
  cancelAction?: (() => void) | null;
  cancelActionText?: string;
  dangerousAction?: (() => void) | null;
  dangerousActionText?: string;
  headerText: string;
  message: React.ReactNode;
  retryAction?: (() => void) | null;
  retryActionText?: string;
}

export interface AlertContextData {
  alert: AlertData | null;
  onShowAlert: (alertData: Partial<AlertData>) => void;
  onHideAlert: () => void;
}

const AlertContext = createContext<AlertContextData>({
  alert: null,
  onShowAlert: function () {},
  onHideAlert: function () {},
});

export function AlertContextProvider(props: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertData | null>(null);

  function onHideAlert() {
    setAlert(null);
  }

  function onShowAlert(alertData: Partial<AlertData>) {
    const defaultAlert = {
      headerText: "Error",
      message: "Something went wrong.",
      cancelAction: () => onHideAlert(),
      cancelActionText: "Cancel",
      retryAction: null,
      retryActionText: "",
      dangerousAction: null,
      dangerousActionText: "",
    };
    setAlert({ ...defaultAlert, ...alertData });
  }

  const context: AlertContextData = {
    alert,
    onShowAlert,
    onHideAlert,
  };

  return (
    <AlertContext.Provider value={context}>
      {props.children}
    </AlertContext.Provider>
  );
}

export default AlertContext;
