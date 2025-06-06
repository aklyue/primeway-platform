import React, { useState } from "react";
import { Drawer } from "@mui/material";
import DrawerContent from "../DrawerContent";

export default function ResponsiveDrawer({
  variant = "permanent",
  drawerWidth = 240,
  open = true,
  onClose,
  anchor,
  isMobile,
  ...contentProps
}) {
  const [isDrawerHovered, setIsDrawerHovered] = useState(false);

  return (
    <Drawer
      anchor={anchor}
      variant={variant}
      open={open}
      onClose={onClose}
      onMouseEnter={() => {
        if (!isMobile) setIsDrawerHovered(true);
      }}
      onMouseLeave={() => {
        if (!isMobile) setIsDrawerHovered(false);
      }}
      ModalProps={variant === "temporary" ? { keepMounted: true } : undefined}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          padding: "0 1%",
          boxSizing: "border-box",
          overflow: "visible",
          ...(anchor === "right"
            ? { right: 0, left: "auto", borderLeft: "1px solid lightgray" }
            : { left: 0, right: "auto", borderRight: "1px solid lightgray" }),
          position: "fixed",
        },
      }}
    >
      <DrawerContent
        anchor={anchor}
        isDrawerHovered={isDrawerHovered}
        isMobile={isMobile}
        {...contentProps}
      />
    </Drawer>
  );
}
