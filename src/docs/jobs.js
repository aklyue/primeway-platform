import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Scrollspy from "react-scrollspy";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';
import "./docs.css"; 

const Jobs = () => {
  // Компонент для отображения блока кода с подсветкой синтаксиса и кнопкой копирования
  const CodeBlock = ({ code, language }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(code);
    };

    return (
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <SyntaxHighlighter
          language={language}
          style={coldarkCold}
          customStyle={{ margin: 0, padding: '8px', borderRadius: '7px' }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
        <Tooltip title="Copy">
          <IconButton
            size="small"
            onClick={handleCopy}
            style={{ position: 'absolute', top: '5px', right: '5px' }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  // Определение секций для навигации
  const sections = [
    { id: "introduction", label: "Introduction" },
    { id: "job-types", label: "Job Types" },
    { id: "job-configuration", label: "Job Configuration" },
    { id: "validation-rules", label: "Validation Rules" },
    { id: "example-configuration", label: "Example Configuration" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* Левая колонка - основной контент */}
      <Box sx={{ flexGrow: 1, paddingRight: "20px" }}>
        {/* Заголовок */}
        <Typography variant="h1" style={{ marginBottom: "25px" }}>
          Jobs
        </Typography>

        {/* Введение */}
        <section id="introduction">
          <Typography variant="h2">Introduction</Typography>
          <p>
            A Job in Primeway represents a task that you want to execute on the cloud. Jobs can be used for various purposes, such as data processing, model training, web service deployment, etc.
          </p>
          <p>
            Jobs can be configured to run independently or as part of a pipeline, and they can be executed using a prepared Docker image or built from your project code.
          </p>
        </section>

        {/* Типы задач */}
        <section id="job-types">
          <Typography variant="h2">Job Types</Typography>
          <p>There are two types of jobs in Primeway:</p>
          <ul>
            <li>
              <strong>Run Jobs</strong>: Executed once and terminated after completion. Ideal for tasks like data processing, batch jobs, or model training.
            </li>
            <li>
              <strong>Deploy Jobs</strong>: Deployed as persistent services accessible over a network. Suitable for APIs, web applications, or any service requiring continuous uptime.
            </li>
          </ul>
        </section>

        {/* Конфигурация задач */}
        <section id="job-configuration">
          <Typography variant="h2">Job Configuration</Typography>
          <p>
            Jobs are defined using configuration files (typically YAML). The configuration specifies how the job should be executed, what resources it requires, and any dependencies or inputs it needs.
          </p>

          {/* Общие поля */}
          <Typography variant="h3">Common Fields</Typography>
          <ul>
            <li><code>docker_image</code> (string): The base Docker image to use for the job.</li>
            <li><code>job_name</code> (string): A unique name for your job.</li>
            <li><code>job_type</code> (string): Either <code>run</code> or <code>deploy</code>.</li>
            <li><code>primeway_api_token</code> (string): Your Primeway API token.</li>
            <li><code>entry_script</code> (string): The script to execute within your project directory.</li>
            <li><code>project_dir</code> (string): The directory containing your project files.</li>
            <li><code>args</code> (string): Arguments to pass to your script.</li>
            <li><code>command</code> (string): Custom command to run (overrides <code>entry_script</code> and <code>args</code>).</li>
            <li><code>memory</code> (integer): Memory allocation in GB.</li>
            <li><code>disk_space</code> (integer): Disk space allocation in GB.</li>
            <li><code>gpu_types</code> (list): List of GPU resources required.</li>
            <li><code>cpu_count</code> (integer): Number of CPU cores required.</li>
            <li><code>timeout</code> (integer): Maximum execution time in seconds.</li>
            <li><code>env</code> (list): Environment variables to set.</li>
            <li><code>requirements</code> (list): Python packages to install.</li>
            <li><code>apt_packages</code> (list): System packages to install.</li>
            <li><code>port</code> (integer): (For deploy jobs) The port on which your service will run.</li>
            <li><code>health_endpoint</code> (string): (For deploy jobs) Endpoint to check service health.</li>
            <li><code>schedule_start</code> (string): Schedule to start the job.</li>
            <li><code>schedule_end</code> (string): Schedule to end the job.</li>
            <li><code>idle_timeout</code> (integer): (For deploy jobs) Time in seconds when deploy job should be stopped after last request.</li>
          </ul>
        </section>

        {/* Правила валидации */}
        <section id="validation-rules">
          <Typography variant="h2">Validation Rules</Typography>
          <p>
            When defining a job configuration, certain validation rules apply to ensure correctness:
          </p>
          <ul>
            <li>
              <strong>Job Type</strong>: <code>job_type</code> must be either <code>run</code> or <code>deploy</code>.
            </li>
            <li>
              <strong>Script Execution</strong>: If <code>project_dir</code> is provided, you must specify at least one of <code>entry_script</code>, <code>args</code>, or <code>command</code>.
            </li>
            <li>
              <strong>Deploy Jobs</strong>: For deploy jobs, <code>port</code> and <code>health_endpoint</code> are required.
            </li>
            <li>
              <strong>GPU Configuration</strong>: Ensure the correct name and count are provided.
            </li>
            <li>
              <strong>Warning on Conflicts</strong>: If both <code>entry_script</code> and <code>args</code> are provided, the system will use <code>args</code> when executing the script and issue a warning.
            </li>
            <li>
              <strong>Requirements Without Project</strong>: If <code>project_dir</code> is not specified but <code>requirements</code> are provided, a warning will be issued because the requirements may conflict with those already in the Docker image.
            </li>
          </ul>
        </section>

        {/* Пример конфигурационного файла */}
        <section id="example-configuration" style={{marginTop:'50px'}}>
          <Typography variant="h2">Example Configuration</Typography>
          <p>Here's an example of a job configuration file:</p>
          <CodeBlock
            code={`job_name: my-data-processing-job
job_type: run
docker_image: python:3.8-slim
primeway_api_token: YOUR_API_TOKEN
entry_script: main.py
project_dir: ./my_project
requirements:
  - pandas
  - numpy
memory: 4
cpu_count: 2`}
            language="yaml"
          />
        </section>
      </Box>

      {/* Правая колонка - навигация Scrollspy */}
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

export default Jobs;