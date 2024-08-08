# Proxy Search

Proxy Search is a self-hosted web UI offering many advanced features to choose from and test proxies.

![image](https://github.com/user-attachments/assets/d4f2050b-61ce-4a13-baba-4671f1d39777)

**Warning:** This project is still in development.

## Features

- Parse free proxy websites.
- Test actual speed in MB/s and calculate latency
- Multi-file test.
- Self-hosted.
- User-friendly interface.

## Implementation

- Flask for backend and API.
- Pure HTML for the main interface, along with Bootstrap.
- jQuery & JavaScript.
- Docker.

## TODO

- <s>Export data as JSON</s>: The data will be available in the proxy folder after the test is complete
- <s>Select source parser</s>
- <s>Estimate the total test time</s>
- <s>Multi-file test (multi-region proxy)</s>

## Problems

- Auto-reload drop event/stream session <s>(possible conflict between jQuery and JavaScript)</s>.
  - Caused by errors caught during fetching API
  - Solved by persisting the session.

## Quick Install

### Method 1: Pull and Run the Docker Image

To pull and run from the Docker hub, use the following commands:

1. Pull the Docker image:

   ```bash
   docker pull falkonps/proxy-search
   ```

2. Run the Docker container:

   ```bash
   docker run -p 2001:2001 -p 5000:80 falkonps/proxy-search:latest
   ```

   The web interface can be accessed using `http://localhost:5000`

### Method 2: Self Build (Recommend)

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
   docker run -p 2001:2001 -p 5000:80 falkonps/proxy-search:latest
   ```

   The web interface can be accessed using `http://localhost:5000`

## License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.
