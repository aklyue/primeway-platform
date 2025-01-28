// src/components/Docs.js
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Button, CircularProgress } from "@mui/material"; // Добавлен импорт CircularProgress
import { useTheme } from "@mui/material/styles";

// Структура вашей документации
const docsStructure = [
  { path: "welcome", title: "Добро Пожаловать" },
  { path: "quickstart", title: "Начало Работы" },
  { path: "jobs", title: "Jobs" },
  { path: "configuration", title: "Configuration" },
  { path: "pipelines", title: "Pipelines" },
  { path: "cli", title: "CLI" },
  // Добавьте другие разделы по мере необходимости
];

function Docs() {
  const { docName } = useParams();
  const [ContentComponent, setContentComponent] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Добавлено состояние загрузки
  const theme = useTheme();

  // Определяем индекс текущего документа
  const currentDocIndex = docsStructure.findIndex(
    (doc) => doc.path === (docName || "welcome")
  );

  // Определяем предыдущий и следующий документы
  const prevDoc = docsStructure[currentDocIndex - 1];
  const nextDoc = docsStructure[currentDocIndex + 1];

  React.useEffect(() => {
    const name = docName || "welcome";
    setLoading(true); // Устанавливаем загрузку в true перед началом импорта
    setContentComponent(null); // Сбрасываем предыдущий компонент

    // Динамически импортируем компонент с содержимым документации
    import(`../docs/${name}.js`)
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
        maxWidth: "980px",
        margin: "0 auto",
        padding: "20px 50px",
        
        "& h1": {
          color: theme.palette.primary.main,
        },
        "& a": {
          color: theme.palette.primary.main,
        },
        "& pre": {
          backgroundColor: "#f5f5f5",
          padding: 1,
          borderRadius: 1,
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
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            mb: 2,
            mr: 20,
          }}
        >
          {prevDoc ? (
            <Button
              component={Link}
              to={`/docs/${prevDoc.path}`}
              style={{color:'rgb(244, 244, 244)',}}
              sx={{
                
                background:'#060606',
                "&:hover .arrow": {
                  transform: "translateX(-3px)",
                  
                },
                "&:hover": {
                  background:'#060606'
                }
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
              style={{color:'rgb(244, 244, 244)',}}
              sx={{
                background:'#060606',
                "&:hover .arrow": {
                  transform: "translateX(3px)",
                },
                "&:hover": {
                  background:'#060606'
                }
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