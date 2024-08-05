# Proxy Search

Proxy Search is a self-hosted web UI offering many advanced features to choose from and test proxies.

**Warning:** This project is still in development.

## Features

- Parse free proxy websites.
- Test actual speed in MB/s.
- Multi-file test.
- Self-hosted.
- User-friendly interface.

## Implementation

- Flask for backend and API.
- Pure HTML for the main interface, along with Bootstrap.
- jQuery & JavaScript.
- Docker.

## TODO

- Estimate the total test time. (Done)
- Multi-file test (multi-region proxy). (Done)

## Problems

- Auto-reload drop event/stream session (possible conflict between jQuery and JavaScript).
  - Solved by persisting the session.

## How to Run

The recommended option is to create a Python virtual environment and install the requirements from the `requirements.txt` file.

**Note:** The final Dockerfile is coming soon. Currently, only the backend server Docker image is available.

To build and run the Docker image, follow these steps:

1. Clone the project:

   ```bash
   git clone https://github.com/FALKONPS/proxy-search.git
   cd proxy-search
   ```

2. Build the Docker image:

   ```bash
   docker build -t falkonps/proxy-search:latest .
   ```

3. Run the Docker container:

   ```bash
   docker run -p 2001:2001 falkonps/proxy-search:latest
   ```

4. Open the `index.html` file located in the `webui` folder to access the web interface.
