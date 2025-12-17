import { Refine, useIsAuthenticated } from "@refinedev/core";
import type { ReactNode } from "react";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";
import { App as AntdApp, ConfigProvider } from "antd";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { authProvider, TOKEN_KEY } from "./providers/authProvider";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import dayjs from "dayjs";
import "dayjs/locale/es";
import esES from "antd/locale/es_ES";

dayjs.locale("es");

const API_URL = import.meta.env.VITE_API_URL ?? "";

const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    ...config.headers,
    "Content-Type": config.headers?.["Content-Type"] || "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return { ...config, headers };
});

const apiDataProvider = dataProvider(API_URL, apiClient);

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useIsAuthenticated();
  const location = useLocation();
  const isAuthenticated = Boolean(data?.authenticated);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <ConfigProvider locale={esES}>
              <DevtoolsProvider>
                <Refine
                  dataProvider={apiDataProvider}
                  notificationProvider={useNotificationProvider}
                  routerProvider={routerProvider}
                  authProvider={authProvider}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    projectId: "epAGNA-oqPpfF-voMWX5",
                  }}
                >
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </DevtoolsProvider>
            </ConfigProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
export { ProtectedRoute };
