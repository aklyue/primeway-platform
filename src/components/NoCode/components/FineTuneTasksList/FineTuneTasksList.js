import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
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
import { OrganizationContext } from "../../../Organization/OrganizationContext"
import axiosInstance from "../../../../api";
import { ContentCopy } from "@mui/icons-material";
import useFineTuneActions from "../../../../hooks/useFineTuneActions";

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

  /** jobs and search */

  const {
    jobs,
    initialLoading,
    handleCopy,
    copied,
    setCopied,
    query,
    setQuery,
    filteredJobs,
  } = useFineTuneActions({
    currentOrganization,
  });

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
            {initialLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredJobs.length === 0 ? (
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
                  <TableCell
                    sx={{
                      width: 120,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Tooltip title={j.id}>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 75,
                          display: "inline-block",
                        }}
                      >
                        {j.id}
                      </span>
                    </Tooltip>
                    <Tooltip title="Скопировать JOB ID">
                      <IconButton
                        size="small"
                        sx={{ ml: 0.5 }}
                        onClick={(e) => handleCopy(e, j.id)}
                      >
                        <ContentCopy fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
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
      <Snackbar
        open={copied}
        autoHideDuration={1200}
        onClose={() => setCopied(false)}
        message="Скопировано!"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        ContentProps={{
          sx: {
            background: "#e9f7ef",
            color: "#20744a",
            fontWeight: 500,
            border: "1px solid #b2dfdb",
            boxShadow: "0 2px 8px rgba(32,116,74,0.12)",
            pointerEvents: "none",
          },
        }}
      />
    </>
  );
}
