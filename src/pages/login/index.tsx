import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Space, Typography, Alert } from "antd";
import { Navigate } from "react-router-dom";
import "../../styles/login.css";
import { useLoginPage, type LoginFormValues } from "../../hooks/login/useLoginPage";

export const Login = () => {
  const {
    form,
    isLoginLoading,
    errorMessage,
    onFinish,
    shouldRedirect,
  } = useLoginPage();

  if (shouldRedirect) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page">
      <Card className="login-card" variant="outlined">
        <Space direction="vertical" size="middle" className="login-space">
          <Typography.Title level={3} className="login-title">
            Accede a tu administrador
          </Typography.Title>
          <Typography.Text className="login-description">
            Usa tus credenciales para iniciar sesión y poder administrar tu hoja de vida.
          </Typography.Text>
          {errorMessage && <Alert type="error" message={errorMessage} showIcon />}
          <Form<LoginFormValues>
            name="login"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            form={form}
          >
            <Form.Item<LoginFormValues>
              name="user"
              label="Usuario"
              rules={[
                { required: true, message: "Ingresa tu usuario" },
                { min: 3, message: "El usuario debe tener al menos 3 caracteres" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Usuario"
                autoComplete="username"
                size="large"
              />
            </Form.Item>
            <Form.Item<LoginFormValues>
              name="password"
              label="Contraseña"
              rules={[{ required: true, message: "Ingresa tu contraseña" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Contraseña"
                autoComplete="current-password"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={isLoginLoading}
              >
                Iniciar sesión
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
