import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Box,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const MenuItem = ({
  name,
  to,
  icon,
  isMobile,
  isTablet,
  isSmallDesktop,
  isDocsPage,
  handleDrawerToggle,
  anchor,
}) => {
  const location = useLocation();
  const theme = useTheme();
  const isSelected = location.pathname === to;

  return (
    <ListItem disablePadding sx={{ position: "relative" }}>
      <ListItemButton
        component={Link}
        to={to}
        selected={isSelected}
        onClick={isMobile ? handleDrawerToggle : undefined}
        sx={{
          justifyContent: isDocsPage ? "flex-start" : "center",
          padding: isDocsPage ? "1px 16px" : "8px 16px",
          position: "relative",
          "&:hover .hover-label": {
            opacity: 1,
            visibility: "visible",
            transform: "translateX(0)",
          },
        }}
      >
        {isDocsPage ? (
          <ListItemText
            primary={name}
            primaryTypographyProps={{
              fontSize: 12,
            }}
            sx={{ mr: 1 }}
          />
        ) : (
          <ListItemIcon
            sx={{
              justifyContent: "center",
              color: isSelected
                ? theme.palette.primary.selected
                : theme.palette.primary.icon,
            }}
          >
            {icon}
          </ListItemIcon>
        )}

        {!isDocsPage && (
          <Box
            className="hover-label"
            sx={{
              position: "absolute",
              transform:
                anchor === "right" ? "translateX(-20px)" : "translateX(20px)",
              [anchor === "right" ? "right" : "left"]: "120%",
              backgroundColor: "#5282ff",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              opacity: 0,
              visibility: "hidden",
              transition: "all 0.2s ease",
              zIndex: 1300,
            }}
          >
            {name}
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export default MenuItem;
