import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Box,
} from "@mui/material";
import { useState } from "react";
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
  isDrawerHovered,
}) => {
  const location = useLocation();
  const theme = useTheme();
  const isSelected = location.pathname == to;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ListItem disablePadding sx={{ position: "relative" }}>
      <ListItemButton
        component={Link}
        to={to}
        selected={isSelected}
        onClick={isMobile ? handleDrawerToggle : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          justifyContent: isDocsPage ? "flex-start" : "center",
          padding: isMobile && isDocsPage ? "1px 8px" : isDocsPage ? "1px 16px" : "8px 16px",
          position: "relative",
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
                : "#6695ff",
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
              top: "50%",
              transform:
                isDrawerHovered && !isMobile
                  ? "translateY(-50%) translateX(0)"
                  : anchor === "right"
                  ? "translateY(-50%) translateX(-20px)"
                  : "translateY(-50%) translateX(20px)",

              [anchor === "right" ? "right" : "left"]: isHovered
                ? "110%"
                : "130%",
              backgroundColor: isHovered ? "#3a63cc" : "#5282ff",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              opacity: isDrawerHovered ? 1 : 0,
              visibility: isDrawerHovered ? "visible" : "hidden",
              transition: "all 0.25s ease",
              zIndex: 1300,
              pointerEvents: "none",
              fontSize: "0.75rem",
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
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
