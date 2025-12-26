# ContainerUIWeb

A web-based desktop environment for system and container management, built with FastAPI and Angular.

## ✨ Features
- **Web Desktop Interface**: Windows-like desktop environment with Taskbar, Start Menu, and Window Management.
- **File Explorer**: Browse files, view properties (always open pane), and manage file operations.
- **Text Editor**: Edit files with Open, Save, and Save As capabilities using native-like file dialogs.
- **Settings**: Customize desktop background with solid colors or images (persisted locally).
- **Terminal**: Full interactive terminal support using WebSockets and PTY (Pseudo-Terminal), enabling commands like `vim`, `htop`, etc.
- **Process Manager**: View running system processes.
- **Extension System**: Install and run third-party extensions in sandboxed IFrames.

## Prerequisites

- Python 3.11+
- Node.js & Angular CLI (for development)
- Docker & Docker Compose (optional, for containerized run)

## Quick Start (Docker)

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Open your browser at [http://localhost:8000](http://localhost:8000).

## Manual Setup

### Backend

1. Navigate to `Backend`:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python main.py
   ```

### Frontend

1. Navigate to `Frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the Angular app (outputs to Backend static folder):
   ```bash
   ng build
   ```
4. Access via the Backend URL default [http://localhost:8000](http://localhost:8000). The backend is configured to serve `index.html` from `app/static/browser` at the root URL. If the static files are not present, a fallback message will be displayed.

## 🔌 API Documentation

### File System
- **GET** `/api/filesystem/getfolderstructure`: Returns folder structure of target directory.
- **POST** `/api/filesystem/createfolder`: Creates a new folder in target directory.
- **POST** `/api/filesystem/deletefolder`: Deletes a folder in target directory.
- **POST** `/api/filesystem/createfile`: Creates a new file in target directory.
- **POST** `/api/filesystem/deletefile`: Deletes a file in target directory.
- **POST** `/api/filesystem/renamefile`: Renames a file in target directory.
- **POST** `/api/filesystem/renamefolder`: Renames a folder in target directory.

### Terminal
- **WS** `/api/terminal/ws`: WebSocket endpoint for bidirectional terminal communication (PTY).
- **GET** `/api/terminal/init`: Returns default directory and OS type.
- **POST** `/api/terminal/cd`: Changes directory (stateless resolution) and returns new path.
- **POST** `/api/terminal/execute_command`: Executes shell command in target CWD. Supports OS-agnostic calls via frontend translation.

### Process Manager
- **GET** `/api/processes/list`: Returns list of running system processes including PID, Name, User, CPU%, and Memory.

### Extensions
- **POST** `/api/extensions/install`: Upload and install a `.zip` extension (must contain `manifest.json`).
- **GET** `/api/extensions/list`: List all installed extensions.

## 🛠️ Tech Stack
- **FastAPI**: High performance core.
- **Uvicorn**: ASGI Server.
- **Psutil**: System monitoring.
- **Python-dotenv**: Configuration management.
- **PyWinPTY**: Windows Console PTY pseudo-terminal support.
- **Pydantic**: Data validation and settings management.
- **CORSMiddleware**: Cross-Origin Resource Sharing support for Frontend communication.
