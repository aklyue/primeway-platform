import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
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

/**
 * Displays the list of running fine‑tune jobs for the current organisation.
 *
 * Props
 * ───────────────────────────────────────────────────────────────────────────────
 * • mode:     "view" | "train"  – When "train", clicking a row calls onRetrain.
 * • onRetrain(row):              – Called with the clicked row when mode is
 *                                 "train". Useful for re‑training workflows.
 */
export default function FineTuneTasksList() {
  const navigate = useNavigate();

  const handleRowClick = (row) => {
    navigate(`/fine-tuning/jobs/${row.id}`);
  };

  /** org context */
  const { currentOrganization } = useContext(OrganizationContext);

  /** jobs */
  const [jobs, setJobs] = useState([]);
  const refreshJobs = async () => {
    if (!currentOrganization?.id) return;
    try {
      const { data } = await axiosInstance.get("/finetuning/get-running-jobs", {
        params: { organization_id: currentOrganization.id },
      });

      setJobs(
        data.map((j) => ({
          id: j.job_id,
          baseModel: j.base_model,
          suffix: j.suffix,
          lastExecutionStatus: j.last_execution_status,
          runTime: j.run_time ?? "-",
          createdAt: new Date(j.created_at).toLocaleString(),
        }))
      );
    } catch (e) {
      console.error("Failed to load fine‑tune jobs", e);
    }
  };

  /** poll every 3 s */
  useEffect(() => {
    refreshJobs();
    const id = setInterval(refreshJobs, 3_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization?.id]);

  /** search */
  const [query, setQuery] = useState("");
  const filteredJobs = useMemo(() => {
    if (!query.trim()) return jobs;
    const q = query.toLowerCase();
    return jobs.filter((j) =>
      Object.values(j).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [query, jobs]);

  /** render */
  return (
    <>
      {/* ───────────────────────────── Header */}
      <Toolbar disableGutters sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Fine‑tuning jobs
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

        <Tooltip title="New fine‑tuning job">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/fine-tuning/new")}
            sx={{
              color: "#fff",
              bgcolor: "#597ad3",
              "&:hover": { bgcolor: "#7c97de" },
            }}
          >
            Новая fine-tuning задача
          </Button>
        </Tooltip>
      </Toolbar>

      {/* ───────────────────────────── Table */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table size="small">
          <TableHead sx={{ backgroundColor: "rgba(102,179,238,0.1)" }}>
            <TableRow>
              <TableCell sx={{ width: 120 }}>JOB ID</TableCell>
              <TableCell>БАЗОВАЯ МОДЕЛЬ</TableCell>
              <TableCell>АДАПТЕР</TableCell>
              <TableCell>СТАТУС</TableCell>
              <TableCell>ВРЕМЯ РАБОТЫ</TableCell>
              <TableCell sortDirection="desc">СОЗДАНО</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No fine‑tune job available.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((j) => (
                <TableRow
                  key={j.id}
                  hover
                  onClick={() => handleRowClick(j)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{j.id}</TableCell>
                  <TableCell>{j.baseModel}</TableCell>
                  <TableCell>{j.suffix}</TableCell>
                  <TableCell>{j.lastExecutionStatus}</TableCell>
                  <TableCell>{j.runTime}</TableCell>
                  <TableCell>{j.createdAt}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
