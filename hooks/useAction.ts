"use client";

import { useState } from "react";

import useNotification from "./useNotification";
import {
  NotificationStyle,
  NotificationVariant,
  Notifications,
} from "@/types/notification.types";
import { ActionResponse, UseActionOptions } from "@/types/action.types";
import getActionResponse from "@/actions/getActionResponse";

const defaultOptions = {
  successNotification: {
    message: Notifications.Success,
    style: NotificationStyle.Success,
    variant: NotificationVariant.Toast,
  },
  errorNotification: {
    message: Notifications.Error,
    style: NotificationStyle.Error,
    variant: NotificationVariant.Toast,
  },
  endPendingOnSuccess: true,
};

type Action<Targs, TData> = (args: Targs) => Promise<ActionResponse<TData>>;

const useAction = <Targs, TData = null>(
  action: Action<Targs, TData>,
  {
    successNotification = defaultOptions.successNotification,
    errorNotification = defaultOptions.errorNotification,
    endPendingOnSuccess = defaultOptions.endPendingOnSuccess,
    onSuccess,
    onError,
  }: UseActionOptions = defaultOptions
) => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const { showNotification } = useNotification();

  const onAction = async (args: Targs) => {
    setIsPending(true);
    setIsSuccess(false);
    setIsError(false);
    const { data, error } = await action(args);
    if (error) {
      if (errorNotification !== null)
        showNotification({
          ...defaultOptions.errorNotification,
          ...errorNotification,
          message: error,
        });
      onError?.(error);
      setIsPending(false);
      setIsError(true);
      return getActionResponse({ error });
    }
    if (successNotification !== null)
      showNotification({
        ...defaultOptions.successNotification,
        ...successNotification,
      });
    if (endPendingOnSuccess) setIsPending(false);
    setIsSuccess(true);
    onSuccess?.(data);
    return getActionResponse({ data });
  };

  return {
    isPending,
    onAction,
    isSuccess,
    isError,
  };
};

export default useAction;
