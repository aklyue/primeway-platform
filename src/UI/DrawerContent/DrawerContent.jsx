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
        width: isMobile ? (isDocsPage ? "113px" : "65px") : "100%",
      }}
    >
      {isMobile && (
        <List sx={{ display: "flex", flexDirection: "column" }}>
          <Toolbar />
          <ListItem disablePadding>
            <ListItemButton
              sx={{ pl: 1 }}
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
              sx={{ pl: 1 }}
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
      {!isMobile && <Toolbar />}
      <Stack
        sx={{
          alignItems: "center",
          mt: isMobile ? 0 : 3,
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
