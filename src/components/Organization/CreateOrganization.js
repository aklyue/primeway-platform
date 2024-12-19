// CreateOrganization.js
import React, { useState, useContext } from "react";
import { OrganizationContext } from "./OrganizationContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const CreateOrganization = () => {
  const { createOrganization } = useContext(OrganizationContext);
  const [open, setOpen] = useState(false);
  const [orgName, setOrgName] = useState("");

  const handleOpen = () => {
    setOrgName("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = () => {
    if (orgName.trim()) {
      createOrganization(orgName.trim());
      handleClose();
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <AddIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { padding: "20px 34px" }, 
        }}
      >
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreate} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateOrganization;
