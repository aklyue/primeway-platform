import React, { useContext, useEffect, useState } from "react";
import { OrganizationContext } from "./OrganizationContext";
import {
  MenuItem,
  Button,
  Typography,
  Box,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import Popover from "@mui/material/Popover";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const OrganizationSwitcher = () => {
  const {
    organizations,
    currentOrganization,
    switchOrganization,
    walletBalance,
    walletLoading,
    walletError,
  } = useContext(OrganizationContext);

  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOrganizationSelect = (org) => {
    switchOrganization(org.id);
    handleMenuClose();
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems:'center'
          
        }}
      >
        <Typography sx={{ mr: "8px", fontSize: "17px", fontWeight: 600 }}>
          /
        </Typography>
        <Button
          color="inherit"
          onClick={handleMenuOpen}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "center",
            textTransform: "none",
            padding: "0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              flexGrow: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "normal",
              }}
            >
              <Box
                component="span"
                sx={{ color: "secondary.main", whiteSpace: "nowrap" }}
              >
                {currentOrganization
                  ? currentOrganization.name
                  : "Organization"}
              </Box>
              
            </Typography>
          </Box>
          <UnfoldMoreIcon
            sx={{ color: "#353740", height: "13px", fontSize: "1rem" }}
          />
        </Button>
        {walletLoading ? (
                <CircularProgress size={16} sx={{ marginLeft: 1 }} />
              ) : walletError ? (
                <Box
                  component="span"
                  sx={{
                    marginLeft: 1,
                    color: "error.main",
                    fontSize: "0.9rem",
                  }}
                >
                  (Ошибка загрузки баланса)
                </Box>
              ) : (
                walletBalance !== null && (
                  <Box
                    component="span"
                    sx={{
                      marginLeft: isMobile ? 0 : 1,
                      color: "text.secondary",
                      fontSize: isMobile ? '0.7rem' : "0.9rem",
                    }}
                  >
                   {walletBalance} ₽
                  </Box>
                )
              )}
      </Box>

      {/* Используем Popover вместо Menu */}
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {/* Контейнер с flex для расположения списка и подсказки */}
        <Box
          sx={{
            display: "flex",
            padding: 2,
            maxWidth: 600, // Ограничиваем максимальную ширину
          }}
        >
          {/* Список организаций */}
          <Box sx={{ minWidth: 170, borderRight: "1px solid rgba(0,0,0,0.2)" }}>
            {organizations.length > 0 ? (
              organizations.map((org) => (
                <MenuItem
                  key={org.id}
                  onClick={() => handleOrganizationSelect(org)}
                >
                  <ListItemText>{org.name}</ListItemText>
                </MenuItem>
              ))
            ) : (
              <Typography variant="body2" sx={{ padding: 1 }}>
                У вас пока нет других организаций.
              </Typography>
            )}
          </Box>

          {/* Подсказка */}
          <Box sx={{ marginLeft: 2, maxWidth: 300, opacity: "0.8" }}>
            <Typography variant="body2" color="text.secondary">
              При регистрации создается ваша организация, где вы работаете. Вы
              можете приглашать других пользователей в настройках организации.
              Когда вас пригласят в другие организации, они появятся здесь.
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default OrganizationSwitcher;
