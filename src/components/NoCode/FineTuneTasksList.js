import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { api } from "./mockApi";

export default function FineTuneTasksList({ mode, onRetrain }) {
  const [rows, setRows] = useState([]);
  const [logs, setLogs] = useState("");
  const [openLogs, setOpenLogs] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const refresh = () => api.getFineTunes().then(setRows);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  const open = Boolean(anchorEl);

  const handleClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  const showLogs = (id) =>
    api.getFineTuneLogs(id).then((l) => {
      setLogs(l);
      setOpenLogs(true);
    });

  const start = (id, status) => {
    if (status === "stopped") api.restartFineTune(id).then(refresh);
    else alert("Job уже завершён");
  };

  const stop = (id) => api.stopFineTune(id).then(refresh);
  const deploy = (id) =>
    api.deployModel(id).then(() => alert(`Deploy started for ${id} (mock)`));

  const handleRowClick = (row) => {
    if (mode === "train") {
      onRetrain(row);
    } else {
      showLogs(row.id);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {mode === "train" ? "Fine-tune tasks" : "Deploy"}
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Имя</TableCell>
            <TableCell>Создано</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Artifact</TableCell>
            <TableCell>Действие</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((j) => (
            <TableRow
              key={j.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => handleRowClick(j)}
            >
              <TableCell>{j.name}</TableCell>
              <TableCell>{j.created}</TableCell>
              <TableCell>{j.status}</TableCell>
              <TableCell>{j.artifact}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {j.status === "stopped" && (
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      start(j.id, j.status);
                    }}
                  >
                    Start
                  </Button>
                )}

                {(j.status === "running" || j.status === "queued") && (
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      stop(j.id);
                    }}
                  >
                    Stop
                  </Button>
                )}

                {mode === "train" && (
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      bgcolor: "#505156",
                      color: "#FFFFFF",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetrain(j);
                    }}
                  >
                    Дообучить
                  </Button>
                )}

                {mode === "deploy" && (
                  <>
                    <IconButton
                      size="small"
                      onClick={(e) => handleClick(e, j)}
                      sx={{ ml: 1 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={open && selectedRow?.id === j.id}
                      onClose={(e) => handleClose(e)}
                      sx={{
                        "& .MuiPaper-root": {
                          borderRadius: "8px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          minWidth: "200px",

                          "& .MuiMenuItem-root": {
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateX(4px)",
                            },
                            "& .MuiListItemIcon-root": {
                              minWidth: "36px",
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose();
                          deploy(j.id);
                        }}
                        disabled={j.status !== "ready"}
                      >
                        <RocketLaunchOutlinedIcon
                          sx={{ mr: 1, fontSize: 22, color: "primary.main" }}
                        />
                        Deploy
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose();
                          showLogs(j.id);
                        }}
                      >
                        <AssignmentIcon sx={{ mr: 1, color: "info.main" }} />
                        Logs
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal open={openLogs} onClose={() => setOpenLogs(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Логи
          </Typography>
          <Typography component="pre" sx={{ whiteSpace: "pre-wrap" }}>
            {logs}
          </Typography>
          <Button onClick={() => setOpenLogs(false)}>Закрыть</Button>
        </Box>
      </Modal>
    </Box>
  );
}
