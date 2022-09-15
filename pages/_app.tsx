import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AlertContextProvider } from "../context/alertContext";
import AlertModal from "../components/AlertModal";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AlertContextProvider>
      <AlertModal />
      <Component {...pageProps} />
    </AlertContextProvider>
  );
}

export default MyApp;
