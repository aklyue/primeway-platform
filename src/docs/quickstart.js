import { Box, IconButton, Tooltip } from "@mui/material";
import React from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const Quickstart = () => {
  // Компонент для отображения блока кода с кнопкой копирования
  const CodeBlock = ({ code }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(code);
    };

    return (
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <pre style={{ backgroundColor: "#e9ecef", padding: "10px", margin: 0 }}>
          <code>{code}</code>
        </pre>
        <Tooltip title="Copy">
          <IconButton
            size="small"
            onClick={handleCopy}
            style={{ position: 'absolute', top: '5px', right: '5px', fontSize:'1.1rem' }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  return (
    <div>
      {/* Заголовок */}
      <h1 style={{ marginBottom: "25px" }}>Quickstart</h1>

      {/* Раздел Overview */}
      <h2>Overview</h2>
      <p>
        Primeway is designed to simplify the deployment and execution of tasks and applications on the cloud. Whether you're running a one-time job or deploying a persistent service, Primeway provides the tools and infrastructure to make it seamless.
      </p>

      {/* Основной контент */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        {/* Основной контент */}
        <div style={{ flex: 1 }}>
          <h2 id="key-concepts">Key Concepts</h2>
          <ul>
            <li>
              <strong>Job</strong>: A unit of work that performs a specific task. Jobs can be of two types:
              <ul>
                <li>
                  <strong>Run</strong>: Jobs that execute once and terminate upon completion.
                </li>
                <li>
                  <strong>Deploy</strong>: Jobs that are deployed as persistent services.
                </li>
              </ul>
            </li>
            <li>
              <strong>Pipeline</strong>: A set of jobs executed in a defined sequence, allowing for complex workflows.
            </li>
          </ul>

          <h2 id="prerequisites">Prerequisites</h2>
          <ul>
            <li>
              <strong>Primeway Account</strong>: Sign up on the Primeway platform to obtain your API token.
            </li>
            <li>
              <strong>Primeway CLI</strong>: Install the Primeway Command Line Interface.
            </li>
          </ul>

          <h2 id="getting-started">Getting Started</h2>
          <p>Install the Primeway CLI:</p>
          <CodeBlock code={`pip install primeway-cli`} />

          <p>Authenticate: Retrieve your API token from the Primeway UI and set it as an environment variable.</p>
          <CodeBlock code={`export PRIMEWAY_API_TOKEN=your_api_token_here`} />

          <p>Run a Sample Job:</p>
          <CodeBlock code={`primeway run job --config job_config.yaml`} />
        </div>
      </div>

      {/* Дополнительные секции или навигация */}
    </div>
  );
};

export default Quickstart;