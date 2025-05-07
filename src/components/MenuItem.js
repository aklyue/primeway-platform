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
          {isMobile && (
            <ListItemText
              primary={name}
              primaryTypographyProps={{
                fontSize: 14,
                ml: 1,
                color: isDocsPage ? "#F5F5F5" : "inherit",
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};

export default MenuItem;
