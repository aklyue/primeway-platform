import HomeIcon from "@mui/icons-material/Home";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import WorkIcon from "@mui/icons-material/Work";
import SettingsIcon from "@mui/icons-material/Settings";
import CodeIcon from "@mui/icons-material/Code";

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
  {
    name: "Наборы данных",
    to: "/docs/datasets",
  },
  {
    name: "Tabby",
    to: "/docs/tabby",
  },
];
