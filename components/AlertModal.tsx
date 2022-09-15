import { useContext } from "react";
import { createPortal } from "react-dom";
import AlertContext from "../context/alertContext";
import { useMounted } from "../hooks/useMounted";

const AlertModal = () => {
  const mounted = useMounted();
  const { alert, onHideAlert } = useContext(AlertContext);

  if (!alert || !mounted) return <></>;
  const portalElement = document.getElementById("alert-portal");
  if (!portalElement) return <></>;
  const {
    headerText,
    message,
    cancelAction,
    cancelActionText,
    retryAction,
    retryActionText,
    dangerousAction,
    dangerousActionText,
  } = alert;

  return createPortal(
    <div className='fixed z-20 inset-0 overflow-y-auto flex items-start justify-center'>
      <div
        className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
        aria-hidden='true'
        onClick={() => onHideAlert()}
      ></div>
      <div>
        <h1>{headerText}</h1>
        <p>{message}</p>
        <button onClick={() => cancelAction?.()}>{cancelActionText}</button>
      </div>
    </div>,
    portalElement
  );
};

export default AlertModal;
