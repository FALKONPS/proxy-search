# Proxy Search

Proxy Search is a self-hosted web UI offering many advanced features to choose from and test proxies.

![image](https://github.com/user-attachments/assets/618b0d6c-bd54-407f-97a5-492c60a6e48a)

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

- Select source parser
- Export data as JSON
- <s>Estimate the total test time</s>
- <s>Multi-file test (multi-region proxy)</s>

## Problems

- Auto-reload drop event/stream session (possible conflict between jQuery and JavaScript).
  - Solved by persisting the session.


## Quick Install

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
## License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.
