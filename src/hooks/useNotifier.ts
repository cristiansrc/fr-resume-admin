import { message, notification } from "antd";
import { useNotification } from "@refinedev/core";
import { useCallback } from "react";

type NotificationPayload = {
  message: string;
  description?: string;
};

type NotifyType = "success" | "error";

export const useNotifier = () => {
  const { open } = useNotification();

  const notify = useCallback(
    (type: NotifyType, payload: NotificationPayload) => {
      const description = payload.description ?? payload.message;
      notification[type]({
        message: payload.message,
        description: payload.description,
      });
      message[type](description);
      open?.({
        type,
        message: payload.message,
        description,
      });
    },
    [open],
  );

  const notifySuccess = useCallback(
    (payload: NotificationPayload) => notify("success", payload),
    [notify],
  );

  const notifyError = useCallback(
    (payload: NotificationPayload) => notify("error", payload),
    [notify],
  );

  return {
    notifySuccess,
    notifyError,
  };
};
