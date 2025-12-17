import { FileTextOutlined, LogoutOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Layout,
  Menu,
  Space,
  Typography,
} from "antd";
import { useLogout } from "@refinedev/core";
import { useMemo, useState } from "react";
import "../../styles/home.css";
import { BasicDataForm } from "./BasicDataForm";

const { Header, Sider, Content } = Layout;

const MENU_KEYS = {
  BASIC_DATA: "basic-data",
  OTHER: "other",
};

const MENU_ITEMS = [
  {
    key: MENU_KEYS.BASIC_DATA,
    label: "Datos Básicos",
    icon: <FileTextOutlined />,
  },
  {
    key: MENU_KEYS.OTHER,
    label: "Otra sección",
    icon: <FileTextOutlined />,
  },
];

export const Home = () => {
  const { mutate: logout, isLoading: isLogoutLoading } = useLogout();
  const [activeMenuKey, setActiveMenuKey] = useState(MENU_KEYS.BASIC_DATA);

  const dropdownContent = useMemo(
    () => (
      <div
        style={{
          minWidth: 200,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: 8,
        }}
      >
        <div style={{ padding: "1rem" }}>
          <Typography.Text strong>Cristhiam Reina</Typography.Text>
        </div>
        <Divider style={{ margin: 0 }} />
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          block
          loading={isLogoutLoading}
          onClick={() => logout()}
          style={{
            textAlign: "left",
            padding: "0.75rem 1rem",
            borderRadius: 0,
            color: "#f64d4f",
          }}
          className="logout-button"
        >
          Salir
        </Button>
      </div>
    ),
    [logout, isLogoutLoading],
  );

  return (
    <Layout className="home-layout">
      <Header className="home-header">
        <Space size="middle" align="center" className="home-header-space">
          <Avatar
            size={40}
            src="https://api.dicebear.com/6.x/thumbs/svg?seed=logo"
          />
          <Typography.Title
            level={4}
            className="home-header-title"
          >
            Currículum Vitae Cristhiam Reina (cristiansrc)
          </Typography.Title>
        </Space>
        <Dropdown
          overlay={dropdownContent}
          trigger={["click"]}
          placement="bottomRight"
          align={{
            points: ["tr", "br"],
            offset: [0, 8],
            overflow: { adjustX: 0, adjustY: 1 },
          }}
          overlayStyle={{ marginRight: 2 }}
          arrow
        >
          <Avatar
            size={40}
            src="https://i.pravatar.cc/150?img=3"
            style={{ cursor: "pointer" }}
            aria-label="Abrir menú de usuario"
          />
        </Dropdown>
      </Header>
        <Layout className="home-main">
          <Sider className="home-sider">
            <Menu
              mode="inline"
              theme="light"
              items={MENU_ITEMS}
              className="custom-menu"
              selectedKeys={[activeMenuKey]}
              onSelect={({ key }) => setActiveMenuKey(key)}
              inlineIndent={24}
            />
          </Sider>
          <Content className="home-content">
            {activeMenuKey === MENU_KEYS.BASIC_DATA ? (
              <BasicDataForm />
            ) : (
              <Typography.Text>Contenido de la sección alternativa</Typography.Text>
            )}
          </Content>
        </Layout>
    </Layout>
  );
};
