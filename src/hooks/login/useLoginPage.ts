import { Form } from "antd";
import { useEffect } from "react";
import { useLogin, useIsAuthenticated } from "@refinedev/core";

export type LoginFormValues = {
  user: string;
  password: string;
};

export const useLoginPage = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const { mutate: login, isLoading: isLoginLoading, error } = useLogin();
  const { data, isLoading: isAuthLoading } = useIsAuthenticated();
  const hasSession = Boolean(data?.authenticated);

  useEffect(() => {
    if (error) {
      form.setFieldsValue({ password: "" });
    }
  }, [error, form]);

  const onFinish = ({ user, password }: LoginFormValues) => {
    login({
      username: user,
      password,
    });
  };

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : undefined;

  return {
    form,
    isLoginLoading,
    errorMessage,
    onFinish,
    shouldRedirect: !isAuthLoading && hasSession,
  };
};
