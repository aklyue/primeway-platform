

# Jobs

## Introduction

A **Job** in **primeway** represents a task that you want to execute on the cloud. Jobs can be used for various purposes, such as data processing, model training, web service deployment, etc.

Jobs can be configured to run independently or as part of a pipeline, and they can be executed using a prepared Docker image or built from your project code.

## Job Types

There are two types of jobs in **primeway**:

- **Run Jobs**: Executed once and terminated after completion. Ideal for tasks like data processing, batch jobs, or model training.
- **Deploy Jobs**: Deployed as persistent services accessible over a network. Suitable for APIs, web applications, or any service requiring continuous uptime.

## Job Configuration

Jobs are defined using configuration files (typically YAML). The configuration specifies how the job should be executed, what resources it requires, and any dependencies or inputs it needs.

### Common Fields

Below are the common fields used in a job configuration:

- **docker_image** *(string)*: The base Docker image to use for the job.
- **job_name** *(string)*: A unique name for your job.
- **job_type** *(string)*: Either `run` or `deploy`.
- **primeway_api_token** *(string)*: Your **primeway** API token.
- **entry_script** *(string)*: The script to execute within your project directory.
- **project_dir** *(string)*: The directory containing your project files.
- **args** *(string)*: Arguments to pass to your script.
- **command** *(string)*: Custom command to run (overrides `entry_script` and `args`).
- **memory** *(integer)*: Memory allocation in GB.
- **disk_space** *(integer)*: Disk space allocation in GB.
- **gpu_types** *(list)*: List of GPU resources required.
- **cpu_count** *(integer)*: Number of CPU cores required.
- **timeout** *(integer)*: Maximum execution time in seconds.
- **env** *(list)*: Environment variables to set.
- **requirements** *(list)*: Python packages to install.
- **apt_packages** *(list)*: System packages to install.
- **port** *(integer)*: *(For deploy jobs)* The port on which your service will run.
- **health_endpoint** *(string)*: *(For deploy jobs)* Endpoint to check service health.
- **schedule_start** *(string)*: Schedule to start the job.
- **schedule_end** *(string)*: Schedule to end the job.
- **idle_timeout** *(integer)*: *(For deploy jobs)* Time in seconds when deploy job should be stopped after the last request.

### Validation Rules

When defining a job configuration, certain validation rules apply to ensure correctness:

1. **Job Type**: `job_type` must be either `run` or `deploy`.

2. **Script Execution**: If `project_dir` is provided, you must specify at least one of `entry_script`, `args`, or `command`.

3. **Deploy Jobs**: For deploy jobs, `port` and `health_endpoint` are required.

4. **GPU Configuration**: Ensure the correct name and count are provided.

5. **Warning on Conflicts**:
   - If both `entry_script` and `args` are provided, the system will use `args` when executing the script and issue a warning.

6. **Requirements Without Project**:
   - If `project_dir` is not specified but `requirements` are provided, a warning will be issued because the requirements may conflict with those already in the Docker image.


