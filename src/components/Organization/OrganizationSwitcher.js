import React, { useContext, useEffect, useState } from "react";
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
import {
  selectOrganizations,
  selectCurrentOrganization,
  selectWalletBalance,
  selectWalletLoading,
  selectWalletSilentLoading,
  selectWalletError,
  selectIsCurrentOrgOwner,
} from "../../store/selectors/organizationsSelectors";
import { switchOrganization } from "../../store/slices/organizationSlice";
import { useDispatch, useSelector } from "react-redux";

const OrganizationSwitcher = ({ isMainPage }) => {
  const dispatch = useDispatch();
  const organizations = useSelector(selectOrganizations);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const walletBalance = useSelector(selectWalletBalance);
  const walletLoading = useSelector(selectWalletLoading);
  const walletError = useSelector(selectWalletError);

  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOrganizationSelect = (org) => {
    dispatch(switchOrganization(org.id));
    handleMenuClose();
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            mr: isMobile ? "5px" : "8px",
            fontSize: "17px",
            fontWeight: 600,
          }}
        >
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
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                component="span"
                sx={{
                  color: "secondary.main",
                  whiteSpace: "nowrap",
                  fontSize: isMobile && "10px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "inline-block",
                  width: (isMobile || isTablet) ? "130px" : "auto",
                }}
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
                fontSize: isMobile ? "0.7rem" : "0.9rem",
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
            padding: isMobile ? 1 : 2,
            maxWidth: 600, // Ограничиваем максимальную ширину
          }}
        >
          {/* Список организаций */}
          <Box sx={{ minWidth: 170, borderRight: "1px solid rgba(0,0,0,0.2)" }}>
            {organizations.length > 0 ? (
              organizations.map((org) => (
                <MenuItem
                  sx={{ px: isMobile ? 1 : 1, borderBottom: "1px solid lightgray" }}
                  key={org.id}
                  onClick={() => handleOrganizationSelect(org)}
                >
                  <ListItemText
                    sx={{
                      whiteSpace: "wrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: { xs: "160px",},
                      minWidth: 0,
                    }}
                  >
                    {org.name}
                  </ListItemText>
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
