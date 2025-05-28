import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
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
}) => {
  const location = useLocation();
  const theme = useTheme();
  // для No-Code ветки выделяем любые вложенные маршруты
  const isSelected = location.pathname === to;

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={to}
        selected={isSelected}
        onClick={isMobile ? handleDrawerToggle : undefined}
        sx={{
          justifyContent: isDocsPage ? "flex-start" : "center",
          padding: isDocsPage ? "1px 16px" : "10px 16px",
        }}
      >
        {isDocsPage && (
          <ListItemText
            primary={name}
            primaryTypographyProps={{
              fontSize: 12,
            }}
            sx={{ mr: 1 }}
          />
        )}
        {!isDocsPage && (
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
        )}
      </ListItemButton>
    </ListItem>
  );
};

export default MenuItem;
