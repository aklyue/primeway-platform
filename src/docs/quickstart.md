
# Quickstart

## Overview

**primeway** is designed to simplify the deployment and execution of tasks and applications on the cloud. Whether you're running a one-time job or deploying a persistent service, **primeway** provides the tools and infrastructure to make it seamless.

## Key Concepts

- **Job**: A unit of work that performs a specific task. Jobs can be of two types:
  - **Run**: Jobs that execute once and terminate upon completion.
  - **Deploy**: Jobs that are deployed as persistent services.
- **Pipeline**: A set of jobs executed in a defined sequence, allowing for complex workflows.

## Prerequisites

- **primeway Account**: Sign up on the **primeway** platform to obtain your API token.
- **primeway CLI**: Install the **primeway** Command Line Interface.

## Getting Started

- ### Install the primeway CLI:
  >`pip install primeway-cli`
- **Authenticate**: Retrieve your API token from the primeway UI and set it as an environment variable.
  >`export primeway_API_TOKEN=your_api_token_here`
- **Run a Sample Job**:
  >`primeway run job --config job_config.yaml`
