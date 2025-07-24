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
import { selectCurrentOrganization } from "../../../../store/selectors/organizationsSelectors";
import { Folder } from "@mui/icons-material";
import { useAppSelector } from "../../../../store/hooks";

export default function DatasetsPage({ isMobile }: { isMobile: boolean }) {
  const currentOrganization = useAppSelector(selectCurrentOrganization);

  const {
    handleUpload,
    fileInputRef,
    uploading,
    data,
    handleDelete,
    snackbar,
    setSnackbar,
    loading,
  } = useDatasetsPage({ currentOrganization });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Folder />
        <Typography fontSize={"1.25rem"} fontWeight={500} sx={{ ml: 1 }}>
          Наборы Данных
        </Typography>
      </Box>

      <input
        id="ds-upload"
        type="file"
        hidden
        onChange={handleUpload}
        ref={fileInputRef}
      />
      <label htmlFor="ds-upload">
        <Button
          data-tour-id="load-dataset"
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
      <Box>
        <Typography variant="caption" sx={{ mt: 1, color: "gray" }}>
          Поддерживаемые форматы: <strong>JSONL</strong>, <strong>CSV</strong>,{" "}
          <strong>HuggingFace</strong>
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4, height: "100%" }}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Typography
          sx={{ mt: 3, fontSize: "13px", color: "#999" }}
          data-tour-id="datasets-list"
        >
          Нет наборов данных
        </Typography>
      ) : isMobile ? (
        <Box sx={{ mt: 2 }} data-tour-id="datasets-list">
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
        <Box sx={{ mt: 2 }} data-tour-id="datasets-list">
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
