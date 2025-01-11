// src/components/Docs.js
import React from "react";
import ReactMarkdown from "react-markdown";
import { useParams, Link } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Структура вашей документации
const docsStructure = [
  { path: 'welcome', title: 'Welcome' },
  { path: 'quickstart', title: 'Quickstart' },
  { path: 'jobs', title: 'Jobs' },
  { path: 'configuration', title: 'Configuration' },
  { path: 'pipelines', title: 'Pipelines' },
  { path: 'cli', title: 'CLI' },
  // Добавьте другие разделы по мере необходимости
];

function Docs() {
  const { docName } = useParams();
  const [content, setContent] = React.useState("");
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
    // Загрузка содержимого Markdown-файла
    import(`../docs/${name}.md`)
      .then((res) => {
        fetch(res.default)
          .then((response) => response.text())
          .then((text) => setContent(text));
      })
      .catch((err) => {
        setContent("# Документ не найден");
      });
  }, [docName]);

  return (
    <Box
      sx={{
        padding: '20px 120px',
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
      {/* Отображение контента документации */}
      <ReactMarkdown>{content}</ReactMarkdown>

      {/* Кнопки навигации */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
          mb: 2,
        }}
      >
        {prevDoc ? (
          <Button
            component={Link}
            to={`/docs/${prevDoc.path}`}
            variant="outlined"
          >
            ← {prevDoc.title}
          </Button>
        ) : (
          <Box />
        )}

        {nextDoc ? (
          <Button
            component={Link}
            to={`/docs/${nextDoc.path}`}
            variant="outlined"
          >
            {nextDoc.title} →
          </Button>
        ) : (
          <Box />
        )}
      </Box>
    </Box>
  );
}

export default Docs;