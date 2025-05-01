import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableRow,
  TableCell,
  TableHead,
  Modal,
  Typography,
} from "@mui/material";
import { api } from "./mockApi";

export default function FineTuneTasks() {
  const [rows, setRows] = useState([]);
  const [logs, setLogs] = useState("");
  const [open, setOpen] = useState(false);

  const refresh = () => api.getFineTunes().then(setRows);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000); // авто-обновление
    return () => clearInterval(id);
  }, []);

  const handleLogs = (id) =>
    api.getFineTuneLogs(id).then((l) => {
      setLogs(l);
      setOpen(true);
    });

  const start = (id) => api.restartFineTune(id).then(refresh);
  const stop = (id) => api.stopFineTune(id).then(refresh);
  const deploy = (id) =>
    api.deployModel(id).then(() => alert(`Deploy started for ${id} (mock)`));

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Fine-tune tasks
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Artifact</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        {rows.map((j) => (
          <TableRow key={j.id}>
            <TableCell>{j.name}</TableCell>
            <TableCell>{j.created}</TableCell>
            <TableCell>{j.status}</TableCell>
            <TableCell>{j.artifact}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              {j.status === "stopped" && (
                <Button size="small" onClick={() => start(j.id)}>
                  Start
                </Button>
              )}
              {(j.status === "running" || j.status === "queued") && (
                <Button size="small" onClick={() => stop(j.id)}>
                  Stop
                </Button>
              )}
              <Button
                size="small"
                disabled={j.status !== "ready"}
                onClick={() => deploy(j.id)}
              >
                Deploy
              </Button>
              <Button size="small" onClick={() => handleLogs(j.id)}>
                Logs
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      {/* модалка с логами */}
      <Modal open={open} onClose={() => setOpen(false)}>
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
            Logs
          </Typography>
          <Typography component="pre" sx={{ whiteSpace: "pre-wrap" }}>
            {logs}
          </Typography>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Box>
      </Modal>
    </Box>
  );
}
