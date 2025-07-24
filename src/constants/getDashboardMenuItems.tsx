import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import DatasetIcon from "@mui/icons-material/Folder";
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
    icon: (
      <CodeIcon
        fontSize="medium"
        sx={{ color: isMainPage ? "white" : undefined }}
      />
    ),
    description: "Интерактивная среда разработки",
  },
  {
    name: "Задачи",
    to: "/tasks",
    icon: (
      <AssignmentIcon
        fontSize="medium"
        sx={{ color: isMainPage ? "white" : undefined }}
      />
    ),
    description: "Просмотр и управление задачами",
  },
  {
    name: "Модели",
    to: "/models",
    icon: (
      <ModelTrainingIcon sx={{ color: isMainPage ? "white" : undefined }} />
    ),
    description: "Работа с моделями машинного обучения",
  },
  {
    name: "Наборы Данных",
    to: "/datasets",
    icon: <DatasetIcon sx={{ color: isMainPage ? "white" : undefined }} />,
    description: "Управление наборами данных",
  },
  {
    name: "Обучение",
    to: "/fine-tuning",
    icon: <PsychologyIcon sx={{ color: isMainPage ? "white" : undefined }} />,
    description: "Обучение моделей",
  },
  {
    name: "Биллинг",
    to: "/billing",
    icon: (
      <PriceChangeIcon
        fontSize="medium"
        sx={{ color: isMainPage ? "white" : undefined }}
      />
    ),
    description: "Управление платежами и балансом",
  },
  {
    name: "API Ключи",
    to: "/api-keys",
    icon: (
      <KeyIcon
        fontSize="medium"
        sx={{ color: isMainPage ? "white" : undefined }}
      />
    ),
    description: "Управление API ключами",
  },
  {
    name: "Настройки",
    to: "/settings",
    icon: (
      <SettingsIcon
        fontSize="medium"
        sx={{ color: isMainPage ? "white" : undefined }}
      />
    ),
    description: "Настройки аккаунта",
  },
  {
    name: "Организации",
    to: "/organization-settings",
    icon: (
      <RecentActorsIcon
        fontSize="medium"
        sx={{ color: isMainPage ? "white" : undefined }}
      />
    ),
    description: "Управление организациями",
  },
  {
    name: "GPU",
    to: "/gpu-list",
    icon: (
      <DeveloperBoardIcon sx={{ color: isMainPage ? "white" : undefined }} />
    ),
    description: "Доступные GPU",
  },
];
