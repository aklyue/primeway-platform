// Pipelines.js
import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Scrollspy from "react-scrollspy";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import "./docs.css"; // Убедитесь, что импортируете ваш CSS-файл

const Pipelines = () => {
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
    { id: "introduction-to-pipelines", label: "Introduction to Pipelines" },
    { id: "pipeline-configuration", label: "Pipeline Configuration" },
    { id: "pipeline-structure", label: "Pipeline Structure" },
    { id: "step-configuration", label: "Step Configuration" },
    { id: "validation-rules", label: "Validation Rules" },
    { id: "creating-a-pipeline", label: "Creating a Pipeline" },
    { id: "defining-dependencies", label: "Defining Dependencies" },
    { id: "validation-of-pipeline-configuration", label: "Validation of Pipeline Configuration" },
    { id: "running-a-pipeline", label: "Running a Pipeline" },
    { id: "monitoring-pipeline-execution", label: "Monitoring Pipeline Execution" },
    { id: "examples", label: "Examples" },
    { id: "best-practices", label: "Best Practices" },
    { id: "advanced-pipeline-features", label: "Advanced Pipeline Features" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* Левая колонка - основной контент */}
      <Box sx={{ flexGrow: 1, paddingRight: "20px" }}>
        {/* Заголовок */}
        <Typography variant="h1" style={{ marginBottom: "25px" }}>
          Pipelines
        </Typography>

        {/* Introduction to Pipelines */}
        <section id="introduction-to-pipelines">
          <Typography variant="h2">Introduction to Pipelines</Typography>
          <p>
            Pipelines in primeway allow you to define complex workflows by chaining together multiple jobs with specified dependencies. This enables you to automate end-to-end processes, such as data extraction, transformation, model training, and deployment, all within a single orchestrated pipeline.
          </p>
          <p><strong>Key benefits of using pipelines:</strong></p>
          <ul>
            <li><strong>Automation:</strong> Automate complex workflows with minimal manual intervention.</li>
            <li><strong>Reusability:</strong> Reuse common steps across different pipelines.</li>
            <li><strong>Scalability:</strong> Efficiently manage large-scale processes with multiple steps.</li>
            <li><strong>Dependency Management:</strong> Clearly define dependencies between steps to ensure correct execution order.</li>
          </ul>
        </section>

        {/* Pipeline Configuration */}
        <section id="pipeline-configuration">
          <Typography variant="h2">Pipeline Configuration</Typography>
          <p>
            A pipeline is defined using a configuration file. The configuration describes the pipeline's name, the steps (jobs) involved, and the dependencies between them.
          </p>
        </section>

        {/* Pipeline Structure */}
        <section id="pipeline-structure">
          <Typography variant="h3">Pipeline Structure</Typography>
          <p>
            The main components of a pipeline configuration are:
          </p>
          <ul>
            <li><code>pipeline_name</code>: The unique name of the pipeline.</li>
            <li><code>primeway_api_token</code>: Your primeway API token for authentication.</li>
            <li><code>steps</code>: A list of steps, each representing a job in the pipeline.</li>
          </ul>
        </section>

        {/* Step Configuration */}
        <section id="step-configuration">
          <Typography variant="h3">Step Configuration</Typography>
          <p>
            Each step in the pipeline has similar configuration fields as a standalone job, with some additional fields:
          </p>
          <ul>
            <li><code>id</code>: A unique identifier for the step within the pipeline.</li>
            <li><code>dependencies</code>: A list of step ids that the current step depends on.</li>
            <li><code>inputs</code>: A list of data inputs from other steps or external sources.</li>
            <li>All other job configuration fields (e.g., <code>docker_image</code>, <code>job_type</code>, <code>entry_script</code>, etc.)</li>
          </ul>
          <p><strong>Example of a Step Configuration:</strong></p>
          <CodeBlock
            code={`- id: data_extraction
  job_type: run
  docker_image: python:3.9-slim
  job_name: extract_data
  entry_script: extract.py
  project_dir: ./extract
  args: "--output primeway-artifacts/raw_data.csv"
  memory: 1024
  disk_space: 5120
  cpu_count: 1
  requirements:
    - requests
  dependencies: []`}
            language="yaml"
          />
        </section>

        {/* Validation Rules */}
        <section id="validation-rules">
          <Typography variant="h3">Validation Rules</Typography>
          <p>
            When defining pipeline configurations, primeway validates the following:
          </p>
          <ul>
            <li><strong>Unique Step IDs:</strong> Each <code>id</code> must be unique within the pipeline.</li>
            <li><strong>Valid Dependencies:</strong> All dependencies listed in the <code>dependencies</code> field must correspond to existing steps.</li>
            <li><strong>No Circular Dependencies:</strong> The dependency graph must not have cycles.</li>
            <li><strong>Deploy Step Position:</strong> If a deploy job is included, it must be the last step in the pipeline.</li>
            <li><strong>Only One Deploy Step:</strong> A pipeline can have at most one deploy step.</li>
            <li><strong>Input Validation:</strong> Ensures that any inputs specified refer to valid step IDs or allowed inputs.</li>
          </ul>
        </section>

        {/* Creating a Pipeline */}
        <section id="creating-a-pipeline">
          <Typography variant="h3">Creating a Pipeline</Typography>
          <Typography variant="h4">Writing the Pipeline Configuration</Typography>
          <p>
            <strong>Create the Pipeline Configuration File:</strong> Write a YAML file (e.g., <code>pipeline_config.yaml</code>) with your pipeline definition.
          </p>
          <p><strong>Example structure:</strong></p>
          <CodeBlock
            code={`pipeline_name: my_data_pipeline

primeway_api_token: YOUR_primeway_API_TOKEN

steps:

 - id: fetch_data
   job_type: run
   # ... other job configuration ...

 - id: process_data
   job_type: run
   # ... other job configuration ...
   dependencies:
     - fetch_data

 - id: train_model
   job_type: run
   # ... other job configuration ...
   dependencies:
     - process_data`}
            language="yaml"
          />
        </section>

        {/* Defining Dependencies */}
        <section id="defining-dependencies">
          <Typography variant="h4">Defining Dependencies</Typography>
          <p>
            Dependencies define the execution order of steps. A step will not begin until all of its dependencies have successfully completed.
          </p>
          <p>
            Use the <code>dependencies</code> field to list the <code>ids</code> of dependent steps.
          </p>
          <p>
            If a step has no dependencies, you can either omit the field or set it as an empty list.
          </p>
          <p><strong>Example:</strong></p>
          <CodeBlock
            code={`steps:

 - id: step1
   # ...
   dependencies: []

 - id: step2
   # ...
   dependencies:
     - step1

 - id: step3
   # ...
   dependencies:
     - step1
     - step2`}
            language="yaml"
          />
        </section>

        {/* Validation of Pipeline Configuration */}
        <section id="validation-of-pipeline-configuration">
          <Typography variant="h3">Validation of Pipeline Configuration</Typography>
          <p>
            primeway performs validation of the pipeline configuration before execution:
          </p>
          <ul>
            <li><strong>Dependency Validation:</strong> Ensures all dependencies reference valid step ids.</li>
            <li><strong>Step Configuration Validation:</strong> Each step is validated similarly to standalone jobs.</li>
            <li><strong>Pipeline Structure Validation:</strong> Checks for cycles and ensures only one deploy step is present and is positioned last.</li>
          </ul>
          <p><strong>Common Validation Errors:</strong></p>
          <ul>
            <li><strong>Missing Dependencies:</strong> If a step references a dependency that does not exist.</li>
            <li><strong>Circular Dependencies:</strong> If steps depend on each other in a way that creates a loop.</li>
            <li><strong>Invalid Step IDs:</strong> If step IDs conflict with common directory names or are not unique.</li>
            <li><strong>Configuration Conflicts:</strong> If fields within a step conflict (e.g., providing both <code>entry_script</code> and <code>command</code> incorrectly).</li>
          </ul>
        </section>

        {/* Running a Pipeline */}
        <section id="running-a-pipeline">
          <Typography variant="h3">Running a Pipeline</Typography>
          <Typography variant="h4">Using the CLI</Typography>
          <p>
            <strong>Create the pipeline using the primeway CLI:</strong>
          </p>
          <CodeBlock
            code={`primeway create pipeline --config pipeline_config.yaml`}
            language="bash"
          />
          <p><strong>Response:</strong></p>
          <CodeBlock
            code={`{"pipeline_id": "3pqwojg-3qfnvnlkd-ewlknl-qfejnk"}`}
            language="json"
          />
          <p><strong>Run the pipeline</strong></p>
          <CodeBlock
            code={`primeway run pipeline 3pqwojg-3qfnvnlkd-ewlknl-qfejnk`}
            language="bash"
          />
          <p>
            The CLI will:
          </p>
          <ol>
            <li>Validate your pipeline configuration.</li>
            <li>Upload necessary files and resources.</li>
            <li>Execute the pipeline steps in the correct order based on dependencies.</li>
            <li>Monitor the execution and provide real-time updates.</li>
          </ol>
          <p><strong>CLI Options:</strong></p>
          <ul>
            <li><code>--config</code>: Path to your pipeline configuration file.</li>
            <li><code>--data-file</code>: If you provided <code>request_pipeline_input_dir</code> like this:</li>
          </ul>
          <CodeBlock
            code={`pipeline_name: Sample Pipeline

schedule: 0 0 * * *

primeway_api_token: primeway-nlOm2e3vwv_rjakw286mzg

request_pipeline_input_dir: /custom-data-pipeline-train-step

steps:

- id: step1
   job_type: run
   docker_image: python:3.10-slim
   job_name: train
   inputs: [request_pipeline_input_dir]`}
            language="yaml"
          />
        </section>

        {/* Monitoring Pipeline Execution */}
        <section id="monitoring-pipeline-execution">
          <Typography variant="h3">Monitoring Pipeline Execution</Typography>
          <p>
            Use the CLI or UI to monitor the execution of your pipeline:
          </p>
          <Typography variant="h4">CLI:</Typography>
          <p><strong>List pipeline executions:</strong></p>
          <CodeBlock
            code={`primeway pipeline executions --pipeline-id PIPELINE_ID`}
            language="bash"
          />
          <p><strong>Get execution details:</strong></p>
          <CodeBlock
            code={`primeway pipeline execution-info --execution-id EXECUTION_ID`}
            language="bash"
          />
          <Typography variant="h4">UI:</Typography>
          <ol>
            <li>Log in to the primeway dashboard.</li>
            <li>Navigate to the Pipelines section.</li>
            <li>Select your pipeline to view execution history and details.</li>
          </ol>
        </section>

        {/* Examples */}
        <section id="examples">
          <Typography variant="h3">Examples</Typography>
          <Typography variant="h4">Example ETL Pipeline</Typography>
          <p>
            An Extract-Transform-Load (ETL) pipeline that:
          </p>
          <ul>
            <li>Extracts data from an API.</li>
            <li>Transforms the data into a suitable format.</li>
            <li>Loads the data into a database.</li>
          </ul>
          <CodeBlock
            code={`pipeline_name: etl_pipeline

primeway_api_token: YOUR_primeway_API_TOKEN

steps:

 - id: extract_data
   job_type: run
   docker_image: python:3.9-slim
   job_name: extract_data_job
   entry_script: extract.py
   project_dir: ./extract
   args: "--output data/raw_data.json"
   memory: 2
   disk_space: 5
   cpu_count: 1
   gpu_types:
     - type: NVIDIA A2000
       count: 1
   requirements:
     - requests
   dependencies: []
   artifacts_path: "data/"

 - id: transform_data
   job_type: run
   docker_image: python:3.9-slim
   job_name: transform_data_job
   entry_script: transform.py
   project_dir: ./transform
   args: "--input /extract_data/raw_data.json --output primeway-artifacts/clean_data.csv"
   memory: 2
   disk_space: 10
   cpu_count: 2
   gpu_types:
     - type: NVIDIA A6000
       count: 1
   requirements:
     - pandas
   dependencies:
     - extract_data
   inputs:
     - extract_data

 - id: load_data
   job_type: run
   docker_image: python:3.9-slim
   job_name: load_data_job
   entry_script: load.py
   project_dir: ./load
   args: "--input /transform_data/clean_data.csv"
   memory: 1
   disk_space: 5
   cpu_count: 1
   requirements:
     - sqlalchemy
   dependencies:
     - transform_data
   inputs:
     - transform_data`}
            language="yaml"
          />

          <Typography variant="h4">Example Machine Learning Pipeline</Typography>
          <p>
            A pipeline that:
          </p>
          <ul>
            <li>Processes data.</li>
            <li>Trains a machine learning model.</li>
            <li>Evaluates the model.</li>
            <li>Deploys the model as an API.</li>
          </ul>
          <CodeBlock
            code={`pipeline_name: ml_pipeline

primeway_api_token: YOUR_primeway_API_TOKEN

steps:

 - id: data_processing
   job_type: run
   docker_image: python:3.9-slim
   job_name: data_processing_job
   entry_script: preprocess.py
   project_dir: ./preprocess
   args: "--input data/raw.csv --output artifacts/processed.csv"
   memory: 2
   disk_space: 10
   cpu_count: 2
   gpu_types:
     - type: NVIDIA A6000
       count: 1
   requirements:
     - pandas
     - scikit-learn
   dependencies: []
   artifacts_path: "artifacts/"

 - id: model_training
   job_type: run
   docker_image: pytorch/pytorch:2.5.1-cuda12.4-cudnn9-devel
   job_name: model_training_job
   entry_script: train.py
   project_dir: ./train
   args: "--data data_processing/processed.csv --model models/model.pkl"
   memory: 4
   disk_space: 20
   cpu_count: 4
   gpu_types:
     - type: NVIDIA L40
       count: 1
   requirements:
     - torch
     - scikit-learn
   dependencies:
     - data_processing
   inputs:
     - data_processing
   artifacts_path: "models/"

 - id: model_evaluation
   job_type: run
   docker_image: python:3.9-slim
   job_name: model_evaluation_job
   entry_script: evaluate.py
   project_dir: ./evaluate
   args: "--model model_training/model.pkl --report reports/report.txt"
   memory: 4
   disk_space: 20
   cpu_count: 4
   gpu_types:
     - type: NVIDIA L40
       count: 1
   cpu_count: 2
   requirements:
     - scikit-learn
   dependencies:
     - model_training
   inputs:
     - model_training
   artifacts_path: "reports/"

 - id: model_deployment
   job_type: deploy
   docker_image: python:3.9-slim
   job_name: model_deployment_job
   entry_script: app.py
   project_dir: ./deploy
   command: "gunicorn app:app --bind 0.0.0.0:8080"
   memory: 1024
   disk_space: 10240
   cpu_count: 2
   requirements:
     - flask
     - gunicorn
   port: 8080
   health_endpoint: "/health"
   dependencies:
     - model_evaluation
   inputs:
     - model_training`}
            language="yaml"
          />
        </section>

        {/* Best Practices */}
        <section id="best-practices">
          <Typography variant="h3">Best Practices</Typography>
          <Typography variant="h4">Organizing Pipeline Steps</Typography>
          <ul>
            <li><strong>Modularity:</strong> Break down complex tasks into smaller, reusable steps.</li>
            <li><strong>Clear Naming:</strong> Use descriptive <code>ids</code> and <code>job_names</code> for better readability and maintenance.</li>
            <li><strong>Consistency:</strong> Maintain consistent configurations across steps when applicable.</li>
          </ul>
          <Typography variant="h4">Managing Data Between Steps</Typography>
          <p>
            <strong>Artifacts:</strong> Define <code>artifacts_path</code> in each step to specify data to be shared.
          </p>
          <p>
            <strong>Inputs:</strong> Use the <code>inputs</code> field to specify the steps from which data should be retrieved.
          </p>
          <p><strong>Example of Using Artifacts and Inputs:</strong></p>
          <CodeBlock
            code={`steps:

 - id: step1
   artifacts_path: "output/"
   # ...

 - id: step2
   inputs:
     - step1
   # ...`}
            language="yaml"
          />
          <Typography variant="h4">Optimizing Resource Usage</Typography>
          <ul>
            <li><strong>Resource Allocation:</strong> Allocate resources based on the specific needs of each step.</li>
            <li><strong>Parallelization:</strong> Design your pipeline to allow non-dependent steps to run in parallel.</li>
            <li><strong>Environment Variables:</strong> Use environment variables to pass configuration and secrets securely.</li>
          </ul>
        </section>

        {/* Advanced Pipeline Features */}
        <section id="advanced-pipeline-features">
          <Typography variant="h3">Advanced Pipeline Features</Typography>
          <Typography variant="h4">Scheduling Pipelines</Typography>
          <p>
            <strong>Automatic Scheduling:</strong> Use the <code>schedule</code> field to schedule pipeline runs using cron expressions.
          </p>
          <p><strong>Example:</strong></p>
          <CodeBlock
            code={`schedule: "0 2 * * *"  # Runs daily at 2 AM Moscow Time`}
            language="yaml"
          />
          <p>
            <strong>Input Data:</strong> Use the <code>request_pipeline_input_dir</code> field to be able to pass input data file on pipeline run.
          </p>
          <p><strong>Example:</strong></p>
          <CodeBlock
            code={`request_pipeline_input_dir: /custom-data-pipeline-train-step`}
            language="yaml"
          />
          <p><strong>Then just add input data:</strong></p>
          <CodeBlock
            code={`primeway run pipeline 3pqwojg-3qfnvnlkd-ewlknl-qfejnk --data-file ./local_file.csv`}
            language="bash"
          />

          <Typography variant="h4">Parallel Execution</Typography>
          <p>
            <strong>Concurrent Steps:</strong> Steps without dependencies can execute in parallel, reducing overall pipeline execution time.
          </p>
          <p><strong>Design Tips:</strong></p>
          <ul>
            <li>Avoid unnecessary dependencies.</li>
            <li>Use branching where tasks are independent.</li>
          </ul>
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

export default Pipelines;