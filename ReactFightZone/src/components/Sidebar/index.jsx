import React from "react";
import { getCurrentUser } from "../../ReactFightZone/src/services/auth";
import TrainerSidebar from "./TrainerSidebar";
import VechterSidebar from "./VechterSidebar";
import VkbmoSidebar from "./VkbmoSidebar";

const Sidebar = () => {
  const user = getCurrentUser();

  if (!user) return null;

  switch (user.role) {
    case "Trainer":
      return <TrainerSidebar />;
    case "Vechter":
      return <VechterSidebar />;
    case "VKBMO-lid":
      return <VkbmoSidebar />;
    default:
      return null;
  }
};

export default Sidebar;
