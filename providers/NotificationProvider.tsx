"use client";

import cn from "classnames";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  NotificationPosition,
  NotificationStyle,
  NotificationVariant,
  Notification,
} from "@/types/notification.types";
import NotificationContext from "@/context/NotificationContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams";

const getToast = (style: NotificationStyle) =>
  ({
    [NotificationStyle.Success]: toast.success,
    [NotificationStyle.Error]: toast.error,
    [NotificationStyle.Warning]: toast.warning,
    [NotificationStyle.Info]: toast.info,
  }[style]);

export const DEFAULT_NOTIFICATION_DURATION = 3000;

const SearchParamsNotificaitonProvider = ({
  showNotification,
}: {
  showNotification: (notification: Notification) => void;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const updateSearchParams = useUpdateSearchParams();
  const pathname = usePathname();
  // TODO: test if multiple notifications are shown when one is set in query param
  useEffect(() => {
    Object.values(NotificationStyle).forEach((style) => {
      const styleParam = searchParams.get(style);
      if (styleParam) {
        showNotification({
          message: styleParam,
          style,
        });
        updateSearchParams({ key: style });
      }
    });
  }, [searchParams, updateSearchParams, pathname, router, showNotification]);
  return null;
};

const NotificationProvider = (props: React.PropsWithChildren<{}>) => {
  const [position, setPosition] = useState<NotificationPosition | null>(null);

  const showNotification = useCallback(
    ({
      message,
      style = NotificationStyle.Info,
      variant = NotificationVariant.Toast,
      position = NotificationPosition.BottomRight,
      duration = DEFAULT_NOTIFICATION_DURATION,
    }: Notification) => {
      if (variant === NotificationVariant.Toast) {
        setPosition(position);
        getToast(style)(message),
          {
            message,
            style,
            variant,
            position,
            duration,
          };
      }
    },
    []
  );

  return (
    <>
      {Object.values(NotificationPosition).map((positionVar) => (
        <Toaster
          key={positionVar}
          richColors
          position={position ?? undefined}
          className={cn(position !== positionVar && "hidden")}
        />
      ))}
      <Suspense fallback={null}>
        <SearchParamsNotificaitonProvider showNotification={showNotification} />
      </Suspense>
      <NotificationContext.Provider value={{ showNotification }}>
        {props.children}
      </NotificationContext.Provider>
    </>
  );
};

export default NotificationProvider;
