import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import IntroSlider from "../../components/IntroSlider";
import useIntroSlider from "../../hooks/useIntroSlider";
import Marketplace from "../../images/marketplace.png";
import Primeway from "../../images/primeway.png";
import Navigation from "../../images/navigation.png";
import Hints from "../../images/hints.png"
import { useDispatch, useSelector } from "react-redux";
import { hideIntroSlider } from "../../store/slices/introSliderSlice";

const HomePage = ({
  dashboardMenuItems,
  itemsInRow,
  itemsInLastRow,
  setShowMenu,
  total,
}) => {
  const { initialize, slideNext, slidePrev } =
    useIntroSlider("intro_home");

  const { visible } = useSelector((state) => state.introSlider);
  const dispatch = useDispatch();

  const slides = [
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
          Платформа предлагает удобный маркетплейс AI-задач, поддержку
          JupyterLab и TabbyML, управление датасетами и настройку дообучения
          моделей. Благодаря бессерверной архитектуре, вы запускаете вычисления
          по требованию — без забот о кластерах и инфраструктуре.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box>
          <img
            src={Marketplace}
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
          Навигация
        </Typography>
        <Typography>
          Используйте меню для перехода по разделам: AI Маркетплейс, Задачи,
          Модели, Наборы Данных, Обучение, Биллинг, API Ключи, Настройки,
          Организации, GPU. Каждый из них предоставляет специализированный
          функционал.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box>
          <img
            src={Navigation}
            alt="Навигация"
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
          На некоторых страницах при первом посещении будут показаны подсказки
          для лучшего освоения платформы.
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
        onClick={() => dispatch(hideIntroSlider())}
      >
        Поехали
      </Button>
    </Box>,
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {visible && (
        <IntroSlider
          slides={slides}
          onClose={() => dispatch(hideIntroSlider())}
          onInit={initialize}
          onNext={slideNext}
          onPrev={slidePrev}
        />
      )}
      <Typography variant="h3" gutterBottom sx={{ mb: 5, mt: 2 }}>
        Добро пожаловать в PrimeWay
      </Typography>

      <Grid container spacing={4} sx={{ maxWidth: "1500px" }}>
        {dashboardMenuItems.map((item, idx) => {
          if (
            Math.floor(idx / itemsInRow) ===
              Math.floor((total - 1) / itemsInRow) &&
            idx % itemsInRow === 0 &&
            itemsInLastRow < itemsInRow
          ) {
            const emptyCols = Math.floor((itemsInRow - itemsInLastRow) / 2);
            return (
              <React.Fragment key={item.to}>
                {Array.from({ length: emptyCols }).map((_, i) => (
                  <Grid
                    item
                    md={4}
                    key={`empty-${i}`}
                    sx={{ display: { xs: "none", md: "block" } }}
                  />
                ))}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    component={Link}
                    to={item.to}
                    onClick={() => setShowMenu(true)}
                    sx={{
                      flexGrow: 1,
                      height: "100%",
                      textDecoration: "none",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardActionArea sx={{ flexGrow: 1, height: "100%" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          p: 2.5,
                          backgroundColor: "#fff",
                          boxShadow: 2,
                          borderRadius: "6px",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="h5" component="div">
                            {item.name}
                          </Typography>
                          <Box
                            sx={{
                              transform: "scale(1.1)",
                              borderRadius: "50%",
                              bgcolor: "#5282ff",
                              width: 40,
                              height: 40,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {item.icon}
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ width: "100%" }}
                        >
                          {item.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              </React.Fragment>
            );
          }
          return (
            <Grid item xs={12} sm={6} md={4} key={item.to}>
              <Card
                component={Link}
                to={item.to}
                onClick={() => setShowMenu(true)}
                sx={{
                  flexGrow: 1,
                  height: "100%",
                  textDecoration: "none",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea sx={{ flexGrow: 1, height: "100%" }}>
                  <CardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 2.5,
                      backgroundColor: "#fff",
                      boxShadow: 2,
                      borderRadius: "6px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="h5" component="div">
                        {item.name}
                      </Typography>
                      <Box
                        sx={{
                          transform: "scale(1.1)",
                          borderRadius: "50%",
                          bgcolor: "#5282ff",
                          width: 40,
                          height: 40,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {item.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ width: "100%" }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default HomePage;
