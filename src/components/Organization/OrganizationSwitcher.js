// OrganizationSwitcher.js
import React, { useContext, useEffect, useState } from "react";
import { OrganizationContext } from "./OrganizationContext";
import {
  Menu,
  MenuItem,
  Button,
  Typography,
  Box,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BusinessIcon from "@mui/icons-material/Business";

const OrganizationSwitcher = () => {
  const {
    organizations,
    currentOrganization,
    setCurrentOrganization,
    fetchOrganizations,
  } = useContext(OrganizationContext);

  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOrganizationSelect = (org) => {
    setCurrentOrganization(org);
    handleMenuClose();
  };

  return (
    <>
      <Box
        sx={{
          textAlign: "left",
          width: "100%",
          border: "1px solid rgba(0,0,0,0.2)",
          borderRadius: "10px",
          ml: "2px",
        }}
      >
        <Button
          color="inherit"
          onClick={handleMenuOpen}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "center",
            textTransform: "none",
            padding: "8px", // Добавим отступы для лучшего внешнего вида
          }}
        >
          {/* Иконка перед текстом */}
          <BusinessIcon sx={{ mr: 1, fontSize: "20px" }} />

          {/* Контейнер с вертикальным расположением текста */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              flexGrow: 1, // Чтобы занять все доступное пространство
            }}
          >
            <Typography
              variant="caption"
              component="div"
              sx={{ lineHeight: 1.2, fontSize: "10px" }}
            >
              Organization
            </Typography>

            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.2,
                whiteSpace: "normal",
              }}
            >
              {currentOrganization
                ? currentOrganization.name
                : "Select Organization"}
            </Typography>
          </Box>

          {/* Иконка в конце кнопки */}
          <ArrowDropDownIcon sx={{ ml: "auto" }} />
        </Button>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {organizations.map((org) => (
          <MenuItem
            key={org.id}
            onClick={() => handleOrganizationSelect(org)}
          >
            <ListItemIcon>
              <BusinessIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{org.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default OrganizationSwitcher;