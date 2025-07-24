import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Button, CircularProgress, useMediaQuery } from "@mui/material"; // Добавлен импорт useMediaQuery
import { useTheme } from "@mui/material/styles";

// Структура вашей документации
const docsStructure = [
  { path: "welcome", title: "Добро Пожаловать" },
  { path: "quickstart", title: "Начало Работы" },
  { path: "jobs", title: "Задачи" },
  { path: "configuration", title: "Конфигурация" },
  { path: "cli", title: "CLI" },
  { path: "models", title: "Модели" },
  { path: "finetuning", title: "Дообучение" },
  { path: "marketplace", title: "AI Маркетплейс" },
  { path: "datasets", title: "Наборы данных" },
  { path: "tabby", title: "Tabby" },
  // Добавьте другие разделы по мере необходимости
];

function Docs() {
  const { docName } = useParams();
  const [ContentComponent, setContentComponent] = useState<
    (() => JSX.Element) | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();

  // Используем useMediaQuery для определения устройства
  const isMobile = useMediaQuery("(max-width:1000px)");

  // Определяем индекс текущего документа
  const currentDocIndex = docsStructure.findIndex(
    (doc) => doc.path === (docName || "welcome")
  );

  // Определяем предыдущий и следующий документы
  const prevDoc = docsStructure[currentDocIndex - 1];
  const nextDoc = docsStructure[currentDocIndex + 1];

  useEffect(() => {
    const name = docName || "welcome";
    setLoading(true); // Устанавливаем загрузку в true перед началом импорта
    setContentComponent(null); // Сбрасываем предыдущий компонент

    // Динамически импортируем компонент с содержимым документации
    import(`../../docs/${name}.tsx`)
      .then((module) => {
        setContentComponent(() => module.default);
        setLoading(false); // Снимаем загрузку после успешного импорта
      })
      .catch((err) => {
        // Если компонент не найден, показываем сообщение об ошибке
        setContentComponent(() => () => <div>Документ не найден</div>);
        setLoading(false); // Снимаем загрузку в случае ошибки
      });
  }, [docName]);

  return (
    <Box
      sx={{
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "10px 10px",
        [theme.breakpoints.down("md")]: {
          padding: "15px 30px",
        },
        [theme.breakpoints.down("sm")]: {
          padding: "10px 15px",
        },
        "& h1": {
          color: theme.palette.primary.main,
          fontSize: "2rem",
          [theme.breakpoints.down("sm")]: {
            fontSize: "1.5rem",
          },
        },
        "& a": {
          color: theme.palette.primary.main,
        },
        "& pre": {
          backgroundColor: "#f5f5f5",
          padding: theme.spacing(1),
          borderRadius: theme.shape.borderRadius,
          overflow: "auto",
          fontSize: "0.9rem",
          [theme.breakpoints.down("sm")]: {
            fontSize: "0.8rem",
          },
        },
      }}
    >
      {/* Рендерим компонент с содержимым документации или индикатор загрузки */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
            marginBottom: "50px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        ContentComponent && <ContentComponent />
      )}

      {/* Кнопки навигации */}
      {!loading && (
        <Box
          sx={{
            borderTop: "1px solid lightgray",
            paddingTop: "25px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: "10px",
            justifyContent: "space-between",
            mt: 4,
            mb: 2,
            mr: isMobile ? 0 : 20,
            "& > *": {
              mb: isMobile ? 1 : 0,
              width: isMobile ? "100%" : "auto",
            },
          }}
        >
          {prevDoc ? (
            <Button
              component={Link}
              to={`/docs/${prevDoc.path}`}
              style={{ color: "rgb(244, 244, 244)" }}
              sx={{
                background: "#060606",
                "&:hover .arrow": {
                  transform: "translateX(-3px)",
                },
                "&:hover": {
                  background: "#060606",
                },
              }}
            >
              <Box
                className="arrow"
                sx={{
                  marginRight: "5px",
                  display: "inline-block",
                  transition: "transform 0.16s ease-in-out",
                }}
              >
                ←
              </Box>
              {prevDoc.title}
            </Button>
          ) : (
            <Box />
          )}

          {nextDoc ? (
            <Button
              component={Link}
              to={`/docs/${nextDoc.path}`}
              style={{ color: "rgb(244, 244, 244)" }}
              sx={{
                background: "#060606",
                "&:hover .arrow": {
                  transform: "translateX(3px)",
                },
                "&:hover": {
                  background: "#060606",
                },
              }}
            >
              {nextDoc.title}
              <Box
                className="arrow"
                sx={{
                  marginLeft: "5px",
                  display: "inline-block",
                  transition: "transform 0.16s ease-in-out",
                }}
              >
                →
              </Box>
            </Button>
          ) : (
            <Box />
          )}
        </Box>
      )}
    </Box>
  );
}

export default Docs;
