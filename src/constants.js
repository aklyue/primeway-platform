import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import DatasetIcon from "@mui/icons-material/Folder";
import HomeIcon from "@mui/icons-material/Home";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import WorkIcon from "@mui/icons-material/Work";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import KeyIcon from "@mui/icons-material/Key";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import CodeIcon from "@mui/icons-material/Code";
import PsychologyIcon from "@mui/icons-material/Psychology";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";

export const getDashboardMenuItems = (isMainPage = false) => [
  {
    name: "AI Маркетплейс",
    to: "/marketplace",
    icon: <CodeIcon fontSize="medium" sx={{ color: isMainPage && "white" }} />,
    description: "Интерактивная среда разработки",
  },
  {
    name: "Задачи",
    to: "/tasks",
    icon: (
      <AssignmentIcon fontSize="medium" sx={{ color: isMainPage && "white" }} />
    ),
    description: "Просмотр и управление задачами",
  },
  {
    name: "Модели",
    to: "/models",
    icon: <ModelTrainingIcon sx={{ color: isMainPage && "white" }} />,
    description: "Работа с моделями машинного обучения",
  },
  {
    name: "Наборы Данных",
    to: "/datasets",
    icon: <DatasetIcon sx={{ color: isMainPage && "white" }} />,
    description: "Управление наборами данных",
  },
  {
    name: "Обучение",
    to: "/fine-tuning",
    icon: <PsychologyIcon sx={{ color: isMainPage && "white" }} />,
    description: "Обучение моделей",
  },
  {
    name: "Биллинг",
    to: "/billing",
    icon: (
      <PriceChangeIcon
        fontSize="medium"
        sx={{ color: isMainPage && "white" }}
      />
    ),
    description: "Управление платежами и балансом",
  },
  {
    name: "API Ключи",
    to: "/api-keys",
    icon: <KeyIcon fontSize="medium" sx={{ color: isMainPage && "white" }} />,
    description: "Управление API ключами",
  },
  {
    name: "Настройки",
    to: "/settings",
    icon: (
      <SettingsIcon fontSize="medium" sx={{ color: isMainPage && "white" }} />
    ),
    description: "Настройки аккаунта",
  },
  {
    name: "Организации",
    to: "/organization-settings",
    icon: (
      <RecentActorsIcon
        fontSize="medium"
        sx={{ color: isMainPage && "white" }}
      />
    ),
    description: "Управление организациями",
  },
  {
    name: "GPU",
    to: "/gpu-list",
    icon: <DeveloperBoardIcon sx={{ color: isMainPage && "white" }} />,
    description: "Доступные GPU",
  },
];

export const getDocsMenuItems = (isDocsPage = false) => [
  {
    name: "Добро пожаловать",
    to: "/docs/welcome",
    icon: <HomeIcon fontSize="medium" sx={{ color: isDocsPage && "white" }} />,
  },
  {
    name: "Быстрый старт",
    to: "/docs/quickstart",
    icon: (
      <FlashOnIcon fontSize="medium" sx={{ color: isDocsPage && "white" }} />
    ),
  },
  {
    name: "Задачи",
    to: "/docs/jobs",
    icon: <WorkIcon fontSize="medium" sx={{ color: isDocsPage && "white" }} />,
  },
  {
    name: "Конфигурация",
    to: "/docs/configuration",
    icon: (
      <SettingsIcon fontSize="medium" sx={{ color: isDocsPage && "white" }} />
    ),
  },
  {
    name: "CLI",
    to: "/docs/cli",
    icon: <CodeIcon fontSize="medium" sx={{ color: isDocsPage && "white" }} />,
  },
  {
    name: "Модели",
    to: "/docs/models",
  },
  {
    name: "Дообучение",
    to: "/docs/finetuning",
  },
  {
    name: "AI Маркетплейс",
    to: "/docs/marketplace",
  },
];

export const AVAILABLE_GPUS = {
  "A100 PCIe": { name: "A100 PCIe", memoryInGb: 80, costPerHour: 260 },
  "A100 SXM": { name: "A100 SXM", memoryInGb: 80, costPerHour: 299 },
  A40: { name: "A40", memoryInGb: 48, costPerHour: 90 },
  "RTX 4090": { name: "RTX 4090", memoryInGb: 24, costPerHour: 130 },
  "H100 SXM": { name: "H100 SXM", memoryInGb: 80, costPerHour: 399 },
  "H100 NVL": { name: "H100 NVL", memoryInGb: 94, costPerHour: 355 },
  "H100 PCIe": { name: "H100 PCIe", memoryInGb: 80, costPerHour: 335 },
  "H200 SXM": { name: "H200 SXM", memoryInGb: 143, costPerHour: 460 },
  L4: { name: "L4", memoryInGb: 24, costPerHour: 90 },
  L40: { name: "L40", memoryInGb: 48, costPerHour: 170 },
  L40S: { name: "L40S", memoryInGb: 48, costPerHour: 175 },
  "RTX 2000 Ada": { name: "RTX 2000 Ada", memoryInGb: 16, costPerHour: 55 },
  "RTX 6000 Ada": { name: "RTX 6000 Ada", memoryInGb: 48, costPerHour: 140 },
  "RTX A6000": { name: "RTX A6000", memoryInGb: 48, costPerHour: 130 },
};

export const statusOptions = [
  "running",
  "stopped",
  "terminated",
  "completed",
  "failed",
  "creating",
  "provisioning",
  "pending",
];
export const statusColors = {
  running: "#28a745", // зеленый
  stopped: "#dc3545", // красный
  terminated: "#6c757d", // серый
  completed: "#007bff", // синий
  failed: "#dc3545",
  creating: "#fd7e14", // оранжевый
  provisioning: "#ffc107", // желтый
  pending: "#17a2b8", // голубой
};

export const buildStatusColors = {
  success: "#28a745", // зеленый
  failed: "#dc3545", // красный
  building: "#007bff", // синий
};
