# ContainerUIWeb

A web-based desktop environment for managing Docker containers. This project simulates a native OS experience (Ubuntu-style) within a browser, interacting with the underlying container via a Python FastAPI backend.

## 🚀 Features & Implementation Status

### Core Desktop Shell
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Desktop Environment** | ✅ Done | Ubuntu-style wallpaper (Mesh Gradient), draggable icons. |
| **Taskbar** | ✅ Done | Bottom bar with "Show Applications" grid, window tabs, clock. |
| **Start Menu** | ✅ Done | Full-screen App Grid overlay with search bar. |
| **Window Manager** | ✅ Done | Draggable, resizable, minimize/restore, focus management, dynamic sizing. |

### Applications
| App | Status | Description |
| :--- | :---: | :--- |
| **File Explorer** | ✅ Done | Fully functional with basic CRUD operations for files. |
| **Terminal** | ✅ Done | Real backend execution, directory navigation, and OS-specific command translation. |
| **Task Manager** | ✅ Done | Real-time system process monitoring using live backend data. |
| **Text Editor** | ✅ Done | Fully functional text editor styling with mock save. |
| **Browser** | ✅ Done | Iframe-based internal browser with address bar. |
| **Calculator** | ✅ Done | Fully functional standard calculator. |

### System & Theme
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Ubuntu Theme** | ✅ Done | Aubergine/Orange palette, font styling, scrollbars. |
| **Responsiveness** | ✅ Done | Desktop adapts layout to browser window size. |

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
4. Access via the Backend URL default [http://localhost:8000](http://localhost:8000).

## 🔮 Future Roadmap 
- [x] **Backend Integration:** Connect `Terminal` and `Process Manager` to real system.
- [ ] **Real File System:** Implement CRUD operations for files (File Explorer improvements).
- [ ] **Process Control:** Ability to kill actual container processes from Task Manager.
- [ ] **Settings App:** Allow user to change wallpaper and theme colors.
- [ ] **Extension System** Allow custom programs to be added by uploading zip file like standalone html for markdown reader and so on.