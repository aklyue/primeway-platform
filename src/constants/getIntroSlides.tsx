import { Box, Button, Grid, Typography } from "@mui/material";
import Marketplace from "../images/marketplace.png";
import Primeway from "../images/primeway.png";
import Navigation from "../images/navigation.png";
import Hints from "../images/hints.png";
import FineTuning from "../images/finetuning.png";
import Models from "../images/models.png";
import { ReactNode } from "react";

export const getIntroSlides = (close: () => void): ReactNode[] => [
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
