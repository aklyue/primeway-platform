import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  useTheme,
} from "@mui/material";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const MenuItem = ({ name, to, icon, isMobile, handleDrawerToggle }) => {
  const location = useLocation();
  const theme = useTheme();

  // Для пункта No-Code проверяем, начинается ли путь с /no-code
  const isSelected =
    to === "/no-code/datasets"
      ? location.pathname.startsWith("/no-code")
      : location.pathname === to;

  return (
    <Tooltip title={name} placement="right">
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to={to}
          selected={isSelected}
          onClick={isMobile ? handleDrawerToggle : undefined}
          sx={{
            justifyContent: "center",
            padding: "10px 0",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              color: isSelected
                ? theme.palette.primary.main
                : theme.palette.primary.icon,
            }}
          >
            {icon}
          </ListItemIcon>
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};

export default MenuItem;
