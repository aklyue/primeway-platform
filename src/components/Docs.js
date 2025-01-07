// src/components/Docs.js
import React from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function Docs() {
  const { docName } = useParams();
  const [content, setContent] = React.useState("");
  const theme = useTheme();

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
        padding: 2,
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
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  );
}

export default Docs;