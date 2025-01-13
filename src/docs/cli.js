// CLI.js
import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Scrollspy from "react-scrollspy";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./docs.css"; 

const CLI = () => {
  const CodeBlock = ({ code, language }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(code);
    };

    return (
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <SyntaxHighlighter
          language={language}
          style={prism}
          customStyle={{ margin: 0, padding: '8px', borderRadius: "7px" }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
        <Tooltip title="Copy">
          <IconButton
            size="small"
            onClick={handleCopy}
            style={{ position: "absolute", top: "5px", right: "5px" }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  // Определение секций для навигации
  const sections = [
    { id: "overview", label: "Overview" },
    { id: "installation-and-setup", label: "Installation and Setup" },
    { id: "authentication", label: "Authentication" },
    { id: "command-structure", label: "Command Structure" },
    { id: "command-reference", label: "Command Reference" },
    { id: "job-commands", label: "Job Commands" },
    { id: "pipeline-commands", label: "Pipeline Commands" },
    { id: "using-the-cli-interactively", label: "Using the CLI Interactively" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1, paddingRight: "20px" }}>
        <Typography variant="h1" style={{ marginBottom: "25px" }}>
          CLI
        </Typography>

        {/* Overview */}
        <section id="overview">
          <Typography variant="h2">Overview</Typography>
          <p>
            The primeway CLI provides a comprehensive set of commands to manage jobs and pipelines, allowing you to interact with the platform directly from your terminal.
          </p>
        </section>

        {/* Installation and Setup */}
        <section id="installation-and-setup">
          <Typography variant="h2">Installation and Setup</Typography>
          <p>
            Install the primeway CLI:
          </p>
          <CodeBlock code={`pip install primeway-cli`} language="bash" />
          <p>
            Verify Installation:
          </p>
          <CodeBlock code={`primeway --version`} language="bash" />
        </section>

        {/* Authentication */}
        <section id="authentication">
          <Typography variant="h2">Authentication</Typography>
          <p>
            Set your primeway API token as an environment variable:
          </p>
          <CodeBlock code={`export PRIMEWAY_API_TOKEN=your_api_token_here`} language="bash" />
          <p>
            Alternatively, you can pass the token as an option in config:
          </p>
          <CodeBlock code={`primeway_api_token: primeway-nlOm2e3vwv_rjakw286mzg`} language="yaml" />
        </section>

        {/* Command Structure */}
        <section id="command-structure">
          <Typography variant="h2">Command Structure</Typography>
          <p>
            The CLI commands are organized into groups based on functionality:
          </p>
          <ul>
            <li><code>primeway create</code>: Create new jobs or pipelines.</li>
            <li><code>primeway run</code>: Execute jobs or pipelines.</li>
            <li><code>primeway job</code>: Manage individual jobs.</li>
            <li><code>primeway pipeline</code>: Manage pipelines.</li>
            <li><code>primeway stop</code>: Stop running jobs.</li>
          </ul>
        </section>

        {/* Command Reference */}
        <section id="command-reference">
          <Typography variant="h2">Command Reference</Typography>

          {/* Job Commands */}
          <section id="job-commands">
            <Typography variant="h3">Job Commands</Typography>
            <p><strong>Create a Job:</strong></p>
            <CodeBlock code={`primeway create job --config job_config.yaml`} language="bash" />
            <p><strong>Run a Job:</strong></p>
            <CodeBlock code={`primeway run job JOB_ID`} language="bash" />
            <p><strong>List Jobs:</strong></p>
            <CodeBlock code={`primeway job list`} language="bash" />
            <p><strong>Get Job Details:</strong></p>
            <CodeBlock code={`primeway job info JOB_ID`} language="bash" />
            <p><strong>Get Job Logs:</strong></p>
            <CodeBlock code={`primeway job logs JOB_ID`} language="bash" />
            <p><strong>Get Job Artifacts:</strong></p>
            <CodeBlock code={`primeway job artifacts JOB_ID --output-dir ./artifacts`} language="bash" />
            <p><strong>Stop a Job:</strong></p>
            <CodeBlock code={`primeway stop job --job-id JOB_ID`} language="bash" />
          </section>

          {/* Pipeline Commands */}
          <section id="pipeline-commands">
            <Typography variant="h3">Pipeline Commands</Typography>
            <p><strong>Create a Pipeline:</strong></p>
            <CodeBlock code={`primeway create pipeline --config pipeline_config.yaml`} language="bash" />
            <p><strong>Run a Pipeline:</strong></p>
            <CodeBlock code={`primeway run pipeline PIPELINE_ID`} language="bash" />
            <p><strong>List Pipelines:</strong></p>
            <CodeBlock code={`primeway pipeline list`} language="bash" />
            <p><strong>List Pipeline Executions:</strong></p>
            <CodeBlock code={`primeway pipeline executions PIPELINE_ID`} language="bash" />
            <p><strong>Get Pipeline Execution Details:</strong></p>
            <CodeBlock code={`primeway pipeline execution-info EXECUTION_ID`} language="bash" />
          </section>
        </section>

        {/* Using the CLI Interactively */}
        <section id="using-the-cli-interactively">
          <Typography variant="h2">Using the CLI Interactively</Typography>
          <p>
            Some commands may prompt for additional input if information is missing. Use the <code>--help</code> flag with any command to get detailed usage information.
          </p>
          <p><strong>Example:</strong></p>
          <CodeBlock code={`primeway run job --help`} language="bash" />
        </section>
      </Box>

      {/* Правая колонка - навигация Scrollspy */}
      <Box
        sx={{
          width: "200px",
          flexShrink: 0,
          position: "sticky",
          top: "55px",
          alignSelf: "flex-start",
          marginLeft: '25px',
        }}
      >
        <Scrollspy
          items={sections.map((section) => section.id)}
          currentClassName="is-current"
          componentTag="div"
          offset={-30}
          rootEl="#main-content"
          className="nav-scrollspy"
        >
          {sections.map((section) => (
            <li
              key={section.id}
              className="nav-item"
              style={{ marginBottom: "15px" }}
            >
              <a
                href={`#${section.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {section.label}
              </a>
            </li>
          ))}
        </Scrollspy>
      </Box>
    </Box>
  );
};

export default CLI;