import { useLogout } from "@refinedev/core";
import { useState } from "react";

export const MENU_KEYS = {
  HOME: "home",
  BLOGS: "blogs",
  SKILL: "skill",
  SKILL_SON: "skill-son",
  BASIC_DATA: "basic-data",
  LABEL: "label",
  VIDEO: "video",
  IMAGES: "images",
};

export const useHomePage = () => {
  const { mutate: logout, isLoading: isLogoutLoading } = useLogout();
  const [activeMenuKey, setActiveMenuKey] = useState(MENU_KEYS.HOME);

  return {
    logout,
    isLogoutLoading,
    activeMenuKey,
    setActiveMenuKey,
  };
};
