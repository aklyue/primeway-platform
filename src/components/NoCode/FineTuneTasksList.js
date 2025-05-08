import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
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

  // Функция для обновления списка задач
  const refresh = async () => {
    try {
      const response = await axiosInstance.get("/finetuning/get-running-jobs", {
        params: {
          organization_id: currentOrganization.id,
        },
      });

      const backendJobs = response.data.map((job) => ({
        id: job.job_id,
        name: job.job_name,
        status: job.build_status.toLowerCase(),
        created: new Date(job.created_at).toLocaleString(),
        artifact: job.job_url || "-",
      }));

      const mockJobs = [
        {
          id: "ft-mock-1",
          name: "gemma-wiki",
          status: "stopped",
          created: "01.05.25",
          artifact: "gemma-wiki:latest",
        },
        {
          id: "ft-mock-2",
          name: "mistral-code",
          status: "running",
          created: "01.05.25",
          artifact: "-",
        },
      ];

      setRows([...mockJobs, ...backendJobs]);
      console.log(backendJobs);
    } catch (error) {
      console.error("Ошибка при получении задач дообучения:", error);
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [currentOrganization]);

  const handleStopClick = async (e, row) => {
    e.stopPropagation();
    try {
      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id: row.id },
      });
      refresh(); // перечитать список
    } catch (err) {
      console.error("Ошибка при остановке задачи:", err);
      alert("Не удалось остановить задачу");
    }
  };

  const handleLogsClick = async (e, row) => {
    e.stopPropagation();
    // пример: показываем логи во всплывающем окне alert
    try {
      const { data } = await axiosInstance.get("/jobs/job-logs", {
        params: { job_id: row.id },
      });
      alert(data.logs || "Логи отсутствуют");
    } catch (err) {
      alert("Ошибка при получении логов");
    }
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRow(null);
  };
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Задачи дообучения
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Имя</TableCell>
            <TableCell>Создано</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell></TableCell>
            <TableCell>Действие</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((j) => (
            <TableRow
              key={j.id}
              hover
              sx={{ cursor: "pointer" }}
              // onClick={() => handleRowClick(j)}
            >
              <TableCell>{j.name}</TableCell>
              <TableCell>{j.created}</TableCell>
              <TableCell>{j.status}</TableCell>
              <TableCell></TableCell>
              <TableCell sx={{ display: "flex", alignItems: "center" }}>
                {/* LOGS */}
                <Button
                  variant="contained"
                  sx={{ ml: 1, mr: 1, color: "white" }}
                  onClick={(e) => handleLogsClick(e, j)}
                >
                  Logs
                </Button>
                {j.status !== "stopped" && j.status !== "failed" ? (
                  <Button color="error" onClick={(e) => handleStopClick(e, j)}>
                    Stop
                  </Button>
                ) : (
                  <Typography sx={{ color: "text.secondary" }}>
                    Завершена
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* {selectedRow && (
        <ModelsDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          model={selectedRow}
        />
      )} */}
    </Box>
  );
}
