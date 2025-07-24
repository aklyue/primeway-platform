import { IconButton } from "@mui/material";
import { Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkCold } from "react-syntax-highlighter/dist/esm/styles/prism";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div
      className="code-block-container"
      style={{ position: "relative", marginBottom: "20px" }}
    >
      <SyntaxHighlighter
        language={language}
        style={coldarkCold}
        customStyle={{ margin: 0, padding: "8px", borderRadius: "7px" }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
      <Tooltip title="Скопировать">
        <IconButton
          size="small"
          onClick={handleCopy}
          className="copy-button"
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            fontSize: "1.1rem",
            color: "#333333",
          }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default CodeBlock;
