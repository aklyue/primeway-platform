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
  TaskIc,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { ContentCopy, Psychology } from "@mui/icons-material";
import useFineTuneActions from "../../../../hooks/useFineTuneActions";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../../../store/selectors/organizationsSelectors";
import TaskIcon from "@mui/icons-material/Task";

/**
 * Displays the list of running fine‑tune jobs for the current organisation.
 *
 * Props
 * ───────────────────────────────────────────────────────────────────────────────
 * • mode:     "view" | "train"  – When "train", clicking a row calls onRetrain.
 * • onRetrain(row):              – Called with the clicked row when mode is
 *                                 "train". Useful for re‑training workflows.
 */
export default function FineTuneTasksList({ isMobile }) {
  const navigate = useNavigate();

  const handleRowClick = (row) => {
    navigate(`/fine-tuning/jobs/${row.id}`);
  };

  /** org context */
  const currentOrganization = useSelector(selectCurrentOrganization);

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
        <Box display={"flex"} sx={{ flexGrow: 1 }}>
          <Box sx={{ width: isMobile ? "200px" : "auto", textAlign: "start" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1
              }}
            >
              <Psychology />
              <Typography
                fontSize={"1.25rem"}
                fontWeight={500}
                sx={{ textAlign: "start", ml: 1 }}
              >
                {" "}
                Дообучение{" "}
              </Typography>
            </Box>
            <Typography
              variant="p"
              sx={{
                mb: 4,
                textAlign: "end",
                fontSize: isMobile ? "10px !important" : "auto",
              }}
            >
              {" "}
              Здесь мы можете отслеживать и создавать задачи дообучения{" "}
            </Typography>
          </Box>
        </Box>

        <TextField
          size="small"
          placeholder="Search job"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            width: isMobile ? 100 : 280,
            mr: 2,
            ml: isMobile ? 0 : 2,
            ".css-yxgvbe-MuiInputBase-root-MuiOutlinedInput-root": {
              pl: isMobile ? 0 : 1,
            },
            ".css-1q55ijt-MuiInputBase-input-MuiOutlinedInput-input": {
              p: isMobile ? "8px 0" : "8px 8px 8px 0",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                sx={{ fontSize: isMobile && "9px !important" }}
                position="start"
              >
                {!isMobile && <SearchIcon fontSize="small" />}
              </InputAdornment>
            ),
          }}
        />

        <Tooltip title="New fine‑tuning job">
          <Button
            variant="contained"
            startIcon={!isMobile && <AddIcon />}
            onClick={() => navigate("/fine-tuning/new")}
            sx={{
              px: isMobile ? "6px" : "16px",
              fontSize: isMobile && "9px !important",
              color: "#fff",
              bgcolor: "#597ad3",
              whiteSpace: "nowrap",
              minWidth: isMobile ? "0" : "auto",
              "&:hover": { bgcolor: "#7c97de" },
            }}
          >
            {isMobile ? (
              "Новая задача"
            ) : (
              <>
                Новая <span style={{ padding: "0 8px" }}>fine-tuning</span>{" "}
                задача
              </>
            )}
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
              {!isMobile && <TableCell>БАЗОВАЯ МОДЕЛЬ</TableCell>}
              <TableCell>АДАПТЕР</TableCell>
              <TableCell>СТАТУС</TableCell>
              {!isMobile && <TableCell>ВРЕМЯ РАБОТЫ</TableCell>}
              {!isMobile && <TableCell sortDirection="desc">СОЗДАНО</TableCell>}
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
                  {!isMobile && <TableCell>{j.baseModel}</TableCell>}
                  <TableCell
                    sx={{
                      maxWidth: isMobile ? 120 : "auto",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      px: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          maxWidth: 80,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Tooltip title={j.suffix}>{j.suffix}</Tooltip>
                      </Box>
                      {isMobile && (
                        <Tooltip title="Скопировать адаптер">
                          <IconButton
                            size="small"
                            sx={{ ml: 0.5, flexShrink: 0 }}
                            onClick={(e) => handleCopy(e, j.suffix)}
                          >
                            <ContentCopy fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>{j.lastExecutionStatus}</TableCell>
                  {!isMobile && <TableCell>{j.runTime}</TableCell>}
                  {!isMobile && <TableCell>{j.createdAt}</TableCell>}
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
