import { useEffect, useState, useContext, useRef } from "react";
import { getDatasets, uploadDataset, deleteDataset } from "./datasetsApi";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { OrganizationContext } from "../Organization/OrganizationContext";

export default function DatasetsPage() {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { currentOrganization } = useContext(OrganizationContext);
  const fileInputRef = useRef();
  const organizationId = currentOrganization.id;

  const refresh = () =>
    getDatasets(organizationId)
      .then(setData)
      .catch((err) => {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Failed to load datasets.",
          severity: "error",
        });
      });

  useEffect(() => {
    refresh();
  }, [organizationId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      await uploadDataset(file, organizationId);
      setSnackbar({
        open: true,
        message: "Upload successful!",
        severity: "success",
      });
      refresh();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Upload failed.", severity: "error" });
    } finally {
      setUploading(false);
      // allow same file to be selected again
      fileInputRef.current.value = null;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDataset(id);
      setSnackbar({
        open: true,
        message: "Dataset deleted.",
        severity: "info",
      });
      refresh();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Delete failed.", severity: "error" });
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Наборы Данных
      </Typography>

      <input
        id="ds-upload"
        type="file"
        hidden
        onChange={handleUpload}
        ref={fileInputRef}
      />
      <label htmlFor="ds-upload">
        <Button
          variant="contained"
          component="span"
          sx={{
            color: "white",
            bgcolor: "#597ad3",
            "&:hover": {
              bgcolor: "#7c97de",
            },
          }}
          disabled={uploading}
          startIcon={
            uploading && <CircularProgress size={20} color="inherit" />
          }
        >
          {uploading ? "Загрузка..." : "Загрузить Набор Данных"}
        </Button>
      </label>

      <Table size="small" sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Имя</TableCell>
            <TableCell>Создан</TableCell>
            <TableCell>Действие</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((ds) => (
            <TableRow key={ds.dataset_id}>
              <TableCell>{ds.dataset_id}</TableCell>
              <TableCell>{ds.name}</TableCell>
              <TableCell>{new Date(ds.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(ds.dataset_id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
