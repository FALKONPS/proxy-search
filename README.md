# Proxy Search

Proxy Search is a self-hosted web UI for advanced proxy selection and testing

![image](https://github.com/user-attachments/assets/d4f2050b-61ce-4a13-baba-4671f1d39777)

> [!WARNING]
> This project is still in development.

## ✨ Features

- **Search Proxies:** Use parsing to extract free proxies.
- **Speed & Latency Tests:** Measure proxy performance.
- **Advanced Filters:** Filter proxies by country, connection type, etc.
- **User-Friendly:** Easy-to-use interface.
- **Remaining Time Display:** Show time left for tests.
- **Proxy Limit:** Set limits on the number of proxies to test.
- **Stop Test:** Ability to halt ongoing tests.
- **Docker Support:** Self-host using Docker.

## 🚀 Quick Install

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

## 🛠️ Implementation

- Flask for backend and API.
- Pure HTML for the main interface, along with Bootstrap.
- jQuery & JavaScript.
- Docker.

## 🐛 Known Issues

- Auto-reload drop event/stream session
  - Caused by errors caught during fetching API
  - Solved by persisting the session.

## 📝 TODO

- Export data as JSON:

## 📜 License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

## ⚖️ Disclaimer

[Disclaimer LICENSE](LICENSE.md) file.
