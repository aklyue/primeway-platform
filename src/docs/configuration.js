// Configuration.js
import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Scrollspy from "react-scrollspy";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import "./docs.css"

const Configuration = () => {
  // Компонент для отображения блока кода с подсветкой синтаксиса и кнопкой копирования
  const CodeBlock = ({ code, language }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(code);
    };

    return (
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <SyntaxHighlighter
          language={language}
          style={prism}
          customStyle={{
            margin: 0,
            padding: '8px',
            borderRadius: "7px",
          }}
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

  // Секции для навигации
  const sections = [
    { id: "creating-a-job", label: "Creating a Job" },
    { id: "running-a-job", label: "Running a Job" },
    {
      id: "example-deploy-job-configuration",
      label: "Example Deploy Job Configuration",
    },
    {
      id: "using-args-vs-entry_script-vs-command",
      label: "Using args vs entry_script vs command",
    },
    { id: "environment-variables", label: "Environment Variables" },
    { id: "managing-dependencies", label: "Managing Dependencies" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* Левая колонка - Основной контент */}
      <Box sx={{ flexGrow: 1, paddingRight: "20px" }}>
        {/* Заголовок */}
        <Typography variant="h1" style={{ marginBottom: "25px" }}>
          Configuration
        </Typography>

        {/* Секция: Creating a Job */}
        <section id="creating-a-job">
          <Typography variant="h2">Creating a Job</Typography>
          <Typography variant="h3">Writing the Configuration</Typography>
          <p>
            <strong>Create the Configuration File:</strong> Write a YAML file
            (e.g., <code>job_config.yaml</code>) with the necessary fields.
          </p>
          <CodeBlock
            code={`docker_image: python:3.9-slim

job_name: data-processing-job

job_type: run

primeway_api_token: YOUR_primeway_API_TOKEN

entry_script: main.py

project_dir: ./app

request_input_dir: /custom-data

args: "--input /custom-data/data.csv"

memory: 2

disk_space: 10

cpu_count: 2

gpu_types:

  - type: NVIDIA A40

    count: 1

env:

  - name: ENVIRONMENT

    value: production

requirements:

  - pandas

  - numpy

apt_packages:

  - libpq-dev

timeout: 3600  # 1 hour`}
            language="yaml"
          />

          <p>
            <strong>Prepare Your Project:</strong> Ensure your{" "}
            <code>project_dir</code> contains all required scripts.
          </p>
        </section>

        {/* Секция: Running a Job */}
        <section id="running-a-job">
          <Typography variant="h2">Running a Job</Typography>
          <Typography variant="h3">Using the CLI</Typography>
          <p>
            To run the job using the <code>primeway</code> CLI, use the following command:
          </p>
          <CodeBlock
            code={`primeway create job --config job_config.yaml`}
            language="bash"
          />

          <p>Response</p>
          <CodeBlock
            code={`{"job_id": "ewkljngp-weglngg-weklgn-wegnkln"}`}
            language="json"
          />

          <p>Run job</p>
          <CodeBlock
            code={`primeway run job ewkljngp-weglngg-weklgn-wegnkln --data-file ./local_dir/data.csv`}
            language="bash"
          />

          <p>This command will:</p>
          <ol>
            <li>Validate your configuration.</li>
            <li>
              Package and upload your project directory if <code>project_dir</code> is specified.
            </li>
            <li>Start the job on the primeway platform.</li>
            <li>Provide feedback on the job's execution status.</li>
          </ol>

          <p>
            As you can see, the job has to be created just once, and then you can use different data for running it. Meaning that build process is required only on creation stage.
          </p>

          <Typography variant="h3">CLI Options:</Typography>
          <ul>
            <li>
              <code>--config</code>: Path to your job configuration file.
            </li>
            <li>
              <code>--data-file</code>: (Optional) Path to your data file.
            </li>
          </ul>
        </section>

        {/* Секция: Example Deploy Job Configuration */}
        <section id="example-deploy-job-configuration">
          <Typography variant="h2">Example Deploy Job Configuration</Typography>
          <CodeBlock
            code={`docker_image: pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

job_name: web-api-service

job_type: deploy

primeway_api_token: YOUR_primeway_API_TOKEN

project_dir: ./api_service

command: "gunicorn app:app --bind 0.0.0.0:8000"

memory: 2

disk_space: 20

cpu_count: 1

gpu_types:

  - type: NVIDIA L40

    count: 1

env:

  - name: ENV

    value: production

requirements:

  - flask

  - gunicorn

apt_packages: []

port: 8000

health_endpoint: "/health"

idle_timeout: 300  # 5 minutes`}
            language="yaml"
          />

          <Typography variant="h3">Notes:</Typography>

          <Typography variant="h4">Deploy Job Specifics:</Typography>
          <ul>
            <li>
              <code>port</code> and <code>health_endpoint</code> are required.
            </li>
            <li>
              <code>idle_timeout</code> can be used to auto-scale down the service when not in use.
            </li>
          </ul>

          <Typography variant="h4">Custom Command:</Typography>
          <p>
            <code>command</code> is used to run the application using Gunicorn.
          </p>
        </section>

        {/* Секция: Using args vs entry_script vs command */}
        <section id="using-args-vs-entry_script-vs-command">
          <Typography variant="h3">Using args vs entry_script vs command</Typography>
          <p>
            <code>entry_script</code>: Specify the script to run within your project directory.
          </p>
          <p>
            <code>args</code>: Provide arguments to the script specified in <code>entry_script</code>.
          </p>
          <p>
            <code>command</code>: Override both <code>entry_script</code> and <code>args</code> to run a custom command. Use this when you need full control over the execution command.
          </p>
          <p>
            <strong>Recommendation:</strong> Use <code>args</code> to pass parameters to your script for flexibility and reusability.
          </p>

          <Typography variant="h4">Example:</Typography>

          <p>Using <code>entry_script</code> and <code>args</code>:</p>
          <CodeBlock
            code={`entry_script: train.py

args: --epochs 10 --batch_size 32`}
            language="yaml"
          />

          <p>Using <code>command</code>:</p>
          <CodeBlock
            code={`command: python train.py --epochs 10 --batch_size 32`}
            language="bash"
          />
        </section>

        {/* Секция: Environment Variables */}
        <section id="environment-variables">
          <Typography variant="h3">Environment Variables</Typography>
          <p>
            <strong>Purpose:</strong> Store configuration values or secrets without hardcoding them.
          </p>
          <p>
            <strong>Definition:</strong>
          </p>
          <CodeBlock
            code={`env:

  - name: API_KEY

    value: "your_api_key"

  - name: DEBUG

    value: "false"`}
            language="yaml"
          />
        </section>

        {/* Секция: Managing Dependencies */}
        <section id="managing-dependencies">
          <Typography variant="h3">Managing Dependencies</Typography>
          <p>
            <strong>Python Packages:</strong> Use the <code>requirements</code> field to specify packages.
          </p>
          <CodeBlock
            code={`requirements:

  - pandas

  - numpy

  - scikit-learn`}
            language="yaml"
          />

          <p>
            <strong>System Packages:</strong> Use <code>apt_packages</code> for system-level dependencies.
          </p>
          <CodeBlock
            code={`apt_packages:

  - libgl1-mesa-glx

  - libglib2.0-0`}
            language="yaml"
          />

          <p>
            <strong>GPU Resources:</strong> Specify GPUs if required.
          </p>
          <CodeBlock
            code={`gpu_types:

  - name: NVIDIA H100

    count: 8`}
            language="yaml"
          />
        </section>
      </Box>

      {/* Правая колонка - Навигация Scrollspy */}
      <Box
        sx={{
          width: "200px",
          flexShrink: 0,
          position: "sticky",
          top: "60px",
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
          style={{ listStyleType: "none", paddingLeft: '15px', }}
        >
          {sections.map((section) => (
            <li key={section.id} className="nav-item" style={{ marginBottom: "15px" }}>
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

export default Configuration;