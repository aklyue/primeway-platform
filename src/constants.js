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
import { Box, Button, Typography, Grid } from "@mui/material";
import Marketplace from "../src/images/marketplace.png";
import Primeway from "../src/images/primeway.png";
import Navigation from "../src/images/navigation.png";
import Hints from "../src/images/hints.png";
import FineTuning from "../src/images/finetuning.png";
import Models from "../src/images/models.png";

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
  {
    name: "Наборы данных",
    to: "/docs/datasets",
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

export const stepsMap = {
  "/marketplace": [
    {
      selector: '[data-tour-id="marketplace-header"]',
      content: "Здесь вы выбираете между Jupyter и Tabby",
    },
    {
      selector: '[data-tour-id="project-card"]',
      content: "Нажмите, чтобы открыть проект",
    },
  ],
  "/models": [
    {
      selector: '[data-tour-id="model-create"]',
      content: "Вы можете создать модель просто нажав на эту кнопку.",
    },
    {
      selector: '[data-tour-id="my-models"]',
      content:
        "После создания здесь отобразятся модели, которые вы когда-либо запускали.",
    },
    {
      selector: '[data-tour-id="basic-models"]',
      content:
        "Также вы можете воспользоваться базовыми моделями, которые уже готовы к запуску напрямую или перейти на страницу модели для дополнительной конфигурации.",
    },
  ],
  "/datasets": [
    {
      selector: '[data-tour-id="load-dataset"]',
      content:
        "Здесь можно загрузить набор данных в формате JSONL, CSV, HuggingFace.",
    },
    {
      selector: '[data-tour-id="datasets-list"]',
      content:
        "После загрузки все ваши наборы данных будут показаны в этой секции.",
    },
  ],
  "/fine-tuning": [
    {
      selector: '[data-tour-id="create-job"]',
      content:
        "Здесь можно создать задачу дообучения, настроив конфигурацию для неё.",
    },
    {
      selector: '[data-tour-id="jobs-list"]',
      content:
        "Все созданные задачи отображаются здесь. Вы можете нажать на любую задачу и посмотреть детали конфигурации.",
    },
  ],
  "/tasks": [
    {
      selector: '[data-tour-id="tasks-header"]',
      content:
        "Этот раздел предназначен для быстрого доступа к просмотру и взаимодействию с созданными вами задачами.",
    },
    {
      selector: '[data-tour-id="buttons-header"]',
      content:
        "Задачи делятся на два типа: Deploy и Run. Переключаясь между вкладками, вы можете просматривать их.",
    },
    {
      selector: '[data-tour-id="tasks-list"]',
      content:
        "Каждая задача будет отображена здесь. Вы можете нажать на неё и просмотреть все детали задачи.",
    },
    {
      selector: '[data-tour-id="buttons-list"]',
      content:
        "Помимо всего прочего, вы в любой момент можете отсортировать список ваших задач по статусу их выполнения.",
    },
  ],
  "/tabby-create": [
    {
      selector: '[data-tour-id="tabby-form"]',
      content:
        "Перед вами открылась форма конфигурации TabbyML. Давайте пройдемся по основным моментам.",
    },
    {
      selector: '[data-tour-id="tabby-name"]',
      content: "В первую очередь, вам необходимо задать название задачи.",
    },
    {
      selector: '[data-tour-id="inference-model"]',
      content:
        "Далее вам предстоит определить конфигурационные данные Code Generation Модели.",
    },
    {
      selector: '[data-tour-id="embedding-model"]',
      content: "Точно также нужно заполнить информацию и об Embedding Модели.",
    },
    {
      selector: '[data-tour-id="required-fields"]',
      content: "Здесь будут показаны поля, требуемые для заполнения.",
    },
  ],
  "/model-create": [
    {
      selector: '[data-tour-id="model-name"]',
      content:
        "Укажите имя модели Hugging Face, которое будет использоваться при запуске. Скопировать его вы можете с официального сайта HuggingFace (например, https://huggingface.co/t-tech/T-lite-it-1.0), или же ввести вручную.",
    },
    {
      selector: '[data-tour-id="args"]',
      content:
        "Добавьте аргументы запуска — это пары ключ/значение, которые настраивают поведение модели.",
    },
    {
      selector: '[data-tour-id="flags"]',
      content:
        "Флаги — булевые параметры (включены/отключены), определяющие поведение модели.",
    },
    {
      selector: '[data-tour-id="unique-name"]',
      content:
        "Придумайте уникальное имя развертывания. Оно потребуется для запуска модели.",
    },
    {
      selector: '[data-tour-id="gpu-type"]',
      content:
        "Выберите тип GPU с нужным объёмом памяти. Обратите внимание на стоимость в руб./час.",
    },
    {
      selector: '[data-tour-id="health-check"]',
      content:
        "Введите таймаут для Health Check — это время ожидания отклика модели (в миллисекундах).",
    },
    {
      selector: '[data-tour-id="port"]',
      content: "Укажите порт, на котором будет работать модельный сервис.",
    },
    {
      selector: '[data-tour-id="free-space"]',
      content:
        "Укажите объём свободного места на диске (в гигабайтах), необходимый для запуска.",
    },
    {
      selector: '[data-tour-id="pending-time"]',
      content:
        "Задайте максимальное время ожидания масштабирования (в секундах).",
    },
    {
      selector: '[data-tour-id="max-reqs"]',
      content: "Ограничьте максимальное число одновременных запросов к модели.",
    },
    {
      selector: '[data-tour-id="schedule"]',
      content:
        "Настройте график запуска — например, только по будням или в определённые дни.",
    },
    {
      selector: '[data-tour-id="env-vars"]',
      content:
        "Добавьте переменные окружения, например HUGGING_FACE_HUB_TOKEN и его значение.",
    },
  ],
};

export const getIntroSlides = (close) => [
  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Typography variant="h5" gutterBottom>
        Добро пожаловать в PrimeWay!
      </Typography>
      <Typography>
        PrimeWay — это облачная платформа, разработанная для упрощения ваших
        вычислительных рабочих процессов. Независимо от того, обучаете ли вы
        модели глубокого обучения, обрабатываете большие наборы данных или
        запускаете сложные симуляции, PrimeWay предоставляет масштабируемые и
        эффективные GPU-ресурсы в ваше распоряжение в бессерверном режиме.
      </Typography>
    </Grid>
    <Grid item xs={12} md={6}>
      <Box>
        <img
          src={Primeway}
          alt="PrimeWay"
          style={{
            width: "100%",
            borderRadius: 12,
            objectFit: "contain",
          }}
        />
      </Box>
    </Grid>
  </Grid>,

  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Typography variant="h5" gutterBottom>
        Возможности PrimeWay
      </Typography>
      <Typography>
        Платформа предлагает удобный маркетплейс AI-задач, поддержку JupyterLab
        и TabbyML, управление датасетами и настройку дообучения моделей.
        Благодаря бессерверной архитектуре, вы запускаете вычисления по
        требованию — без забот о кластерах и инфраструктуре.
      </Typography>
    </Grid>
    <Grid item xs={12} md={6}>
      <Box>
        <img
          src={Navigation}
          alt="Маркетплейс PrimeWay"
          style={{
            width: "100%",
            borderRadius: 12,
            objectFit: "contain",
          }}
        />
      </Box>
    </Grid>
  </Grid>,

  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Typography variant="h5" gutterBottom>
        AI Маркетплейс
      </Typography>
      <Typography>
        В разделе AI Маркетплейс вы можете выбрать между запуском
        JupyterLab-сессии или TabbyML (альтернатива Copilot). Создайте проект,
        укажите ресурсы — и начните работу в пару кликов.
      </Typography>
    </Grid>
    <Grid item xs={12} md={6}>
      <Box>
        <img
          src={Marketplace}
          alt="AI Маркетплейс"
          style={{
            width: "100%",
            borderRadius: 12,
            objectFit: "contain",
          }}
        />
      </Box>
    </Grid>
  </Grid>,

  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Typography variant="h5" gutterBottom>
        Дообучение моделей
      </Typography>
      <Typography>
        В разделе Дообучение вы можете создавать задачи fine-tuning на базе
        ваших моделей и датасетов. Просто настройте параметры, запустите — и
        отслеживайте прогресс.
      </Typography>
    </Grid>
    <Grid item xs={12} md={6}>
      <Box>
        <img
          src={FineTuning}
          alt="Дообучение моделей"
          style={{
            width: "100%",
            borderRadius: 12,
            objectFit: "contain",
          }}
        />
      </Box>
    </Grid>
  </Grid>,

  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Typography variant="h5" gutterBottom>
        Модели
      </Typography>
      <Typography>
        В разделе Модели можно создавать, настраивать и запускать базовые или
        кастомные модели. Заполните необходимые параметры и разверните модель за
        считанные минуты.
      </Typography>
    </Grid>
    <Grid item xs={12} md={6}>
      <Box>
        <img
          src={Models}
          alt="Модели"
          style={{
            width: "100%",
            borderRadius: 12,
            objectFit: "contain",
          }}
        />
      </Box>
    </Grid>
  </Grid>,

  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Typography variant="h5" gutterBottom>
        Подсказки
      </Typography>
      <Typography>
        На некоторых страницах при первом посещении будут показаны подсказки для
        лучшего освоения платформы.
      </Typography>
      <Typography>
        Вы всегда можете заново посмотреть подсказки нажав по иконке вопроса.
      </Typography>
    </Grid>
    <Grid item xs={12} md={6}>
      <Box>
        <img
          src={Hints}
          alt="Подсказки"
          style={{
            width: "100%",
            borderRadius: 12,
            objectFit: "contain",
          }}
        />
      </Box>
    </Grid>
  </Grid>,

  <Box textAlign="center">
    <Typography variant="h5" gutterBottom>
      Готовы начать?
    </Typography>
    <Typography>
      Начните с создания проекта или запустите базовую модель — всё готово к
      работе!
    </Typography>
    <Button
      variant="contained"
      sx={{
        mt: 3,
        color: "white",
        padding: "8px 16px",
        bgcolor: "#597ad3",
        "&:hover": {
          bgcolor: "#7c97de",
        },
      }}
      onClick={close}
    >
      Поехали
    </Button>
  </Box>,
];
