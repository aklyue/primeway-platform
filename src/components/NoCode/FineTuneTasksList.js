import { useEffect, useState, useContext, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { OrganizationContext } from "../Organization/OrganizationContext";
import axiosInstance from "../../api";
import FineTuneFormModal from "./FineTuneFormModal";
import ModelsDialog from "../ModelsDialog";

export default function FineTuneTasksList({ mode, onRetrain }) {
  const [rows, setRows] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { currentOrganization } = useContext(OrganizationContext);

  // jobs
  const [jobs, setJobs] = useState([]);
  const refreshJobs = async () => {
    try {
      const { data } = await axiosInstance.get("/finetuning/get-running-jobs", {
        params: {
          organization_id: currentOrganization.id,
        },
      });

      setJobs(
        data.map((j) => ({
          id: j.job_id,
          baseModel: j.base_model,
          suffix: j.job_name,
          type: j.build_type,
          status: j.build_status.toLowerCase(),
          runTime: j.run_time ?? "-",
          createdAt: new Date(j.created_at).toLocaleString(),
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  /* poll every 3 s */
  useEffect(() => {
    refreshJobs();
    const id = setInterval(refreshJobs, 3_000);
    return () => clearInterval(id);
  }, [currentOrganization]);

  // search
  const [query, setQuery] = useState("");
  const filteredJobs = useMemo(() => {
    if (!query.trim()) return jobs;
    return jobs.filter((j) =>
      Object.values(j).some((v) =>
        String(v).toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, jobs]);

  // modal
  const [openModal, setOpenModal] = useState(false);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRow(null);
  };
  return (
    <>
      {/* HEADER */}
      <Toolbar disableGutters sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Fine-tuning jobs
        </Typography>

        <TextField
          size="small"
          placeholder="Search job"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ width: 280, mr: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Tooltip title="New fine-tuning job">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              color: "#fff",
              bgcolor: "#597ad3",
              "&:hover": {
                bgcolor: "#7c97de",
              },
            }}
          >
            New fine-tuning job
          </Button>
        </Tooltip>
      </Toolbar>

      {/* TABLE */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <Table size="small">
          <TableHead
            sx={{
              padding: 2,
              backgroundColor: "rgba(102, 179, 238, 0.1)",
            }}
          >
            <TableRow>
              <TableCell sx={{ width: 120 }}>JOB ID</TableCell>
              <TableCell>БАЗОВАЯ МОДЕЛЬ</TableCell>
              <TableCell>АДАПТЕР</TableCell>
              <TableCell>СТАТУС</TableCell>
              <TableCell>ВРЕМЯ РАБОТЫ</TableCell>
              <TableCell sortDirection="desc">СОЗДАНО</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No finetune job available.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((j) => (
                <TableRow
                  key={j.id}
                  hover
                  onClick={() => mode === "train" && onRetrain?.(j)}
                  sx={{ cursor: mode === "train" ? "pointer" : "default" }}
                >
                  <TableCell>{j.id}</TableCell>
                  <TableCell>{j.base_model}</TableCell>
                  <TableCell>{j.suffix}</TableCell>
                  <TableCell>{j.last_execution_status}</TableCell>
                  <TableCell>{j.run_time}</TableCell>
                  <TableCell>{j.created_at}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* CREATE-JOB MODAL  */}
      <FineTuneFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        baseModel="" /* or pass selected base model */
      />
    </>
  );
}
