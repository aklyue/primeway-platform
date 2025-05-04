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
    <Tooltip
      title={name}
      placement="right"
      // тултип нужен только когда подписи нет (tablet или mobile)
      disableHoverListener={!isTablet && !isMobile}
    >
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to={to}
          selected={isSelected}
          onClick={isMobile ? handleDrawerToggle : undefined}
          sx={{
            justifyContent:
              isTablet || isSmallDesktop ? "center" : "flex-start",
            px: 2, // внутренний отступ
            gap: isTablet ? 0 : 1.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isTablet ? 0 : 32,
              color: isSelected
                ? theme.palette.primary.main
                : theme.palette.primary.icon,
            }}
          >
            {icon}
          </ListItemIcon>

          {/* подпись показываем только, если это НЕ tablet */}
          {!(isTablet || isSmallDesktop) && (
            <ListItemText
              primary={name}
              primaryTypographyProps={{
                fontSize: 14,
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
