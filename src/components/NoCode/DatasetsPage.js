import { useEffect, useState } from "react";
import { api } from "./mockApi";
import {
  Box,
  Button,
  Table,
  TableRow,
  TableCell,
  TableHead,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DatasetsPage() {
  const [data, setData] = useState([]);

  const refresh = () => api.getDatasets().then(setData);

  // Исправленный useEffect
  useEffect(() => {
    refresh();
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    api.uploadDataset(file).then(refresh);
  };

  const handleDelete = (id) => api.deleteDataset(id).then(refresh);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        DataSet
      </Typography>
      <input id="ds-upload" type="file" hidden onChange={handleUpload} />
      <label htmlFor="ds-upload">
        <Button variant="contained" component="span" sx={{ color: "white" }}>
          Upload dataset
        </Button>
      </label>

      <Table size="small" sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        {data.map((ds) => (
          <TableRow key={ds.id}>
            <TableCell>{ds.name}</TableCell>
            <TableCell>{ds.size}</TableCell>
            <TableCell>{ds.created}</TableCell>
            <TableCell>
              <IconButton onClick={() => handleDelete(ds.id)}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </Box>
  );
}
