# CLI
## CLI Commands
### Overview
The primeway CLI provides a comprehensive set of commands to manage jobs and pipelines, allowing you to interact with the platform directly from your terminal.
Installation and Setup
Install the primeway CLI:
Copy
pip install primeway-cli
Verify Installation:
Copy
primeway --version
Authentication
Set your primeway API token as an environment variable:
Copy
export primeway_API_TOKEN=your_api_token_here
Alternatively, you can pass the token as an option in config:
Copy
primeway_api_token: primeway-nlOm2e3vwv_rjakw286mzg
Command Structure
The CLI commands are organized into groups based on functionality:
primeway create: Create new jobs or pipelines.
primeway run: Execute jobs or pipelines.
primeway job: Manage individual jobs.
primeway pipeline: Manage pipelines.
primeway stop: Stop running jobs.
Command Reference
Job Commands
Create a Job:
Copy
primeway create job --config job_config.yaml
Run a Job:
Copy
primeway run job JOB_ID
List Jobs:
Copy
primeway job list
Get Job Details:
Copy
primeway job info JOB_ID
Get Job Logs:
Copy
primeway job logs JOB_ID
Get Job Artifacts:
Copy
primeway job artifacts JOB_ID --output-dir ./artifacts
Stop a Job:
Copy
primeway stop job --job-id JOB_ID
