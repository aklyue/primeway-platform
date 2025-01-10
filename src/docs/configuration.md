
# Configuration

## Creating a Job

### Writing the Configuration
```yaml 
docker_image: python:3.9-slim
job_name: data-processing-job
job_type: run
primeway_api_token: YOUR_PRIMEWAY_API_TOKEN
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
timeout: 3600  # 1 hour
```
**Prepare Your Project**: Ensure your project_dir contains all required scripts.

## Running a Job
### Using the CLI
To run the job using the primeway CLI, use the following command:

`primeway create job --config job_config.yaml`  
Response  
 - `{"job_id": "ewkljngp-weglngg-weklgn-wegnkln"}`  

Run job  
 - `primeway run job ewkljngp-weglngg-weklgn-wegnkln --data-file ./local_dir/data.csv`  

**This command will**:
Validate your configuration.  
Package and upload your project directory if project_dir is specified.
Start the job on the primeway platform.
Provide feedback on the job's execution status.
As you can see job has to be created just once and then you can use different data for running it. Meaning that build procces required only on creation stage.

CLI Options:
--config: Path to your job configuration file.
--data-file: (Optional) Enable verbose output.
Example Deploy Job Configuration
Copy
docker_image: pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

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

idle_timeout: 300  # 5 minutes
Notes:
Deploy Job Specifics:
port and health_endpoint are required.
idle_timeout can be used to auto-scale down the service when not in use.
Custom Command:
command is used to run the application using Gunicorn.
Using args vs entry_script vs command
entry_script: Specify the script to run within your project directory.
args: Provide arguments to the script specified in entry_script.
command: Override both entry_script and args to run a custom command. Use this when you need full control over the execution command.
Recommendation: Use args to pass parameters to your script for flexibility and reusability.
Example:
Using entry_script and args:
Copy
entry_script: train.py


args: --epochs 10 --batch_size 32
Using command:
Copy
command: python train.py --epochs 10 --batch_size 32
Environment Variables
Purpose: Store configuration values or secrets without hardcoding them.
Definition:
Copy
env:


 - name: API_KEY


   value: "your_api_key"


 - name: DEBUG


   value: "false"
Managing Dependencies
Python Packages: Use the requirements field to specify packages.
Copy
requirements:


 - pandas


 - numpy


 - scikit-learn
System Packages: Use apt_packages for system-level dependencies.
Copy
apt_packages:


 - libgl1-mesa-glx


 - libglib2.0-0
GPU Resources: Specify GPUs if required.
Copy
gpu_types:


 - name: NVIDIA H100


   count: 8

