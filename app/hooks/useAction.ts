"use client";

import { useState } from "react";

import useNotification from "./useNotification";
import {
  NotificationStyle,
  NotificationVariant,
  Notifications,
} from "@/app/types/notification.types";
import { ActionResponse, UseActionOptions } from "@/app/types/action.types";
import getActionResponse from "@/app/actions/getActionResponse";

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

type Action<T, R> = (args: T) => Promise<ActionResponse<R>>;

const useAction = <T, R = null>(
  action: Action<T, R>,
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

  const onAction = async (args: T) => {
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
