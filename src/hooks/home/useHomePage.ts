import { useLogout } from "@refinedev/core";
import { useState } from "react";

export const MENU_KEYS = {
  BASIC_DATA: "basic-data",
  LABEL: "label",
  VIDEO: "video",
  IMAGES: "images",
  OTHER: "other",
};

export const useHomePage = () => {
  const { mutate: logout, isLoading: isLogoutLoading } = useLogout();
  const [activeMenuKey, setActiveMenuKey] = useState(MENU_KEYS.BASIC_DATA);

  return {
    logout,
    isLogoutLoading,
    activeMenuKey,
    setActiveMenuKey,
  };
};
