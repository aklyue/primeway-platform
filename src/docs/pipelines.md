---
id: pipelines
title: Pipelines
sidebar_position: 5
---

# Pipelines
## Introduction to Pipelines
Pipelines in primeway allow you to define complex workflows by chaining together multiple jobs with specified dependencies. This enables you to automate end-to-end processes, such as data extraction, transformation, model training, and deployment, all within a single orchestrated pipeline.
Key benefits of using pipelines:
Automation: Automate complex workflows with minimal manual intervention.
Reusability: Reuse common steps across different pipelines.
Scalability: Efficiently manage large-scale processes with multiple steps.
Dependency Management: Clearly define dependencies between steps to ensure correct execution order.
Pipeline Configuration
A pipeline is defined using a configuration file. The configuration describes the pipeline's name, the steps (jobs) involved, and the dependencies between them.
Pipeline Structure
The main components of a pipeline configuration are:
pipeline_name: The unique name of the pipeline.
primeway_api_token: Your primeway API token for authentication.
steps: A list of steps, each representing a job in the pipeline.
Step Configuration
Each step in the pipeline has similar configuration fields as a standalone job, with some additional fields:
id: A unique identifier for the step within the pipeline.
dependencies: A list of step ids that the current step depends on.
inputs: A list of data inputs from other steps or external sources.
All other job configuration fields (e.g., docker_image, job_type, entry_script, etc.)
Example of a Step Configuration:
Copy
- id: data_extraction

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

 dependencies: []
Validation Rules
When defining pipeline configurations, primeway validates the following:
Unique Step IDs: Each id must be unique within the pipeline.
Valid Dependencies: All dependencies listed in the dependencies field must correspond to existing steps.
No Circular Dependencies: The dependency graph must not have cycles.
Deploy Step Position: If a deploy job is included, it must be the last step in the pipeline.
Only One Deploy Step: A pipeline can have at most one deploy step.
Input Validation: Ensures that any inputs specified refer to valid step IDs or allowed inputs.
Creating a Pipeline
