import { useEffect, useState, useContext, useRef } from "react";
import {
  getDatasets,
  uploadDataset,
  deleteDataset,
} from "../../api/datasetsApi";
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
import { OrganizationContext } from "../../../Organization/OrganizationContext";
import { useDatasetsPage } from "../../../../hooks/NoCode/useDatasetsPage/useDatasetsPage";

export default function DatasetsPage() {
  const { currentOrganization } = useContext(OrganizationContext);

  const {
    handleUpload,
    fileInputRef,
    uploading,
    data,
    handleDelete,
    snackbar,
    setSnackbar,
  } = useDatasetsPage({ currentOrganization });

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
