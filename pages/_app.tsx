import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AlertContextProvider } from "../context/alertContext";
import AlertModal from "../components/AlertModal";
import { EditorContextProvider } from "../context/editorContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AlertContextProvider>
      <EditorContextProvider>
        <AlertModal />
        <Component {...pageProps} />
      </EditorContextProvider>
    </AlertContextProvider>
  );
}

export default MyApp;
