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

export default function FineTuneTasksList({ mode, onRetrain }) {
  const [rows, setRows] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openModal, setOpenModal] = useState(false); // Состояние для открытия модального окна
  const { currentOrganization } = useContext(OrganizationContext);

  // Функция для обновления списка задач
  const refresh = async () => {
    try {
      const response = await axiosInstance.get("/finetuning/get-running-jobs", {
        params: {
          organization_id: currentOrganization.id,
          status: "running",
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
          status: "ready",
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
    } catch (error) {
      console.error("Ошибка при получении задач дообучения:", error);
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [currentOrganization]);

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

  const handleRowClick = (row) => {
    if (mode === "train") {
      onRetrain(row);
    } else {
      setSelectedRow(row); // Сохраняем выбранную задачу
      setOpenModal(true); // Открываем модальное окно
    }
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {mode === "train" ? "Запущенные задачи дообучения" : "Deploy"}
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
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Button
                  disabled={!(j.status !== "running" || j.status !== "ready")}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Остановка задачи
                  }}
                >
                  Stop
                </Button>
                {j.status !== "running" && j.status !== "ready" && (
                  <Typography>Завершена</Typography>
                )}

                {/* {mode === "deploy" && (
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
                      onClose={handleClose}
                    >
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose(e);
                          // Запуск деплоя
                        }}
                        disabled={j.status !== "ready"}
                      >
                        <RocketLaunchOutlinedIcon
                          sx={{ mr: 1, fontSize: 22, color: "primary.main" }}
                        />
                        Deploy
                      </MenuItem>
                    </Menu>
                  </>
                )} */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Модальное окно для выбранной задачи */}
      <FineTuneFormModal
        open={openModal}
        onClose={handleCloseModal}
        row={selectedRow}
      />
    </Box>
  );
}
