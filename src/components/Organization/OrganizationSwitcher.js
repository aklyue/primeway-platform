import React, { useContext, useState } from "react";
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
    switchOrganization
  } = useContext(OrganizationContext);

  const [anchorEl, setAnchorEl] = useState(null);

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
          textAlign: "left",
          width: "100%",
          border: "1px solid #353740",
          borderRadius: "10px",
          ml: "2px",
          mr:'4px'
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
            padding: "8px",
          }}
        >
          <BusinessIcon sx={{ mr: 1, fontSize: "20px" }} />

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

          <ArrowDropDownIcon sx={{ ml: "auto", color: '#353740' }} />
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
              <BusinessIcon fontSize="small" sx={{color:'text.primary'}} />
            </ListItemIcon>
            <ListItemText>{org.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default OrganizationSwitcher;