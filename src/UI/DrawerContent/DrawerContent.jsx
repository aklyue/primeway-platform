import React from "react";
import {
  Box,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { Link } from "react-router-dom";
import MenuItem from "../../components/MenuItem";

export default function DrawerContent({
  isMobile,
  isDocsPage,
  handleDrawerToggle,
  isSmallDesktop,
  isTablet,
  menuItems,
  location,
  anchor,
  isDrawerHovered,
}) {
  return (
    <Box
      sx={{
        width: isMobile ? "80px" : "100%",
      }}
    >
      {isMobile && (
        <List sx={{ display: "flex", flexDirection: "column" }}>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/"
              selected={!location.pathname.startsWith("/docs")}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary="Дашборд" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/docs"
              selected={location.pathname.startsWith("/docs")}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary="Доки" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
      <Toolbar />
      <Stack
        sx={{
          alignItems: "center",
          mt: 3,
        }}
        spacing={isDocsPage ? 0 : 1}
      >
        {menuItems.map((item) => (
          <MenuItem
            isDrawerHovered={isDrawerHovered}
            anchor={anchor}
            key={item.to}
            to={item.to}
            name={item.name}
            icon={item.icon}
            isMobile={isMobile}
            isSmallDesktop={isSmallDesktop}
            isTablet={isTablet}
            isDocsPage={isDocsPage}
            handleDrawerToggle={handleDrawerToggle}
          />
        ))}
      </Stack>
    </Box>
  );
}
