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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDatasetsPage } from "../../../../hooks/NoCode/useDatasetsPage/useDatasetsPage";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../../../store/selectors/organizationsSelectors";

export default function DatasetsPage({ isMobile }) {
  const currentOrganization = useSelector(selectCurrentOrganization);

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

      {isMobile ? (
        <Box sx={{ mt: 2 }}>
          {data.length === 0 && (
            <Typography sx={{ fontSize: "12px", color: "#aaa" }}>
              Нет наборов данных
            </Typography>
          )}
          {data.map((ds) => (
            <Box
              key={ds.dataset_id}
              sx={{
                mb: 2,
                p: 1.5,
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 0.8,
                fontSize: "13px",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 500 }}>Id:</Typography>
                <Typography
                  sx={{ textAlign: "end", fontSize: "11px !important" }}
                >
                  {ds.dataset_id}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 500 }}>Имя:</Typography>
                <Typography
                  sx={{ wordBreak: "break-all", fontSize: "11px !important" }}
                >
                  {ds.name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 500 }}>Создан:</Typography>
                <Typography sx={{ fontSize: "11px !important" }}>
                  {new Date(ds.created_at).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(ds.dataset_id)}
                  aria-label="Удалить"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Table size="small">
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
                  <TableCell>
                    {new Date(ds.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(ds.dataset_id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
