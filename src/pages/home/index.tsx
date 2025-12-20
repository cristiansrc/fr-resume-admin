import {
  FileTextOutlined,
  LogoutOutlined,
  PictureOutlined,
  TagOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
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
import { useMemo } from "react";
import "../../styles/home.css";
import { BasicDataForm } from "./BasicDataForm";
import { ImagePage } from "../image/ImagePage";
import { LabelPage } from "../label/LabelPage";
import { VideoPage } from "../video/VideoPage";
import { MENU_KEYS, useHomePage } from "../../hooks/home/useHomePage";

const { Header, Sider, Content } = Layout;

const MENU_ITEMS = [
  {
    key: MENU_KEYS.BASIC_DATA,
    label: "Datos Básicos",
    icon: <FileTextOutlined />,
  },
  {
    key: MENU_KEYS.LABEL,
    label: "Labels",
    icon: <TagOutlined />,
  },
  {
    key: MENU_KEYS.VIDEO,
    label: "Videos",
    icon: <VideoCameraOutlined />,
  },
  {
    key: MENU_KEYS.IMAGES,
    label: "Imágenes",
    icon: <PictureOutlined />,
  },
  {
    key: MENU_KEYS.OTHER,
    label: "Otra sección",
    icon: <FileTextOutlined />,
  },
];

export const Home = () => {
  const { logout, isLogoutLoading, activeMenuKey, setActiveMenuKey } = useHomePage();

  const dropdownContent = useMemo(
    () => (
      <div className="home-user-dropdown-content">
        <div className="home-user-dropdown-name">
          <Typography.Text strong>Cristhiam Reina</Typography.Text>
        </div>
        <Divider className="home-user-dropdown-divider" />
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          block
          loading={isLogoutLoading}
          onClick={() => logout()}
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
          overlayClassName="home-user-dropdown-overlay"
          arrow
        >
          <Avatar
            size={40}
            src="https://i.pravatar.cc/150?img=3"
            className="home-user-avatar"
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
          ) : activeMenuKey === MENU_KEYS.LABEL ? (
            <LabelPage />
          ) : activeMenuKey === MENU_KEYS.VIDEO ? (
            <VideoPage />
          ) : activeMenuKey === MENU_KEYS.IMAGES ? (
            <ImagePage />
          ) : (
            <Typography.Text>Contenido de la sección alternativa</Typography.Text>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};
