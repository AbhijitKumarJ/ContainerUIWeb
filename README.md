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
| **Extension Support** | ✅ Done | Sandboxed IFrame architecture allowing third-party apps to run safely. |

### Applications
| App | Status | Description |
| :--- | :---: | :--- |
| **File Explorer** | ✅ Done | Real file system browsing, properties pane, and file operations (copy/cut/paste/delete). |
| **Terminal** | ✅ Done | Real backend execution, directory navigation, and OS-specific command translation. |
| **Task Manager** | ✅ Done | Real-time system process monitoring using live backend data. |
| **Text Editor** | ✅ Done | Fully functional with Open/Save/Save As dialogs connected to backend. |
| **Browser** | ✅ Done | Iframe-based internal browser with address bar. |
| **Calculator** | ✅ Done | Fully functional standard calculator. |
| **Settings** | ✅ Done | Customize desktop background (color/image) with persistence. |
| **Extensions** | ✅ Done | Manager app to install (`.zip`) and launch third-party extensions. |

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
- [ ] **Process Control:** Ability to kill actual container processes from Task Manager.
- [ ] **Improved Setting:** Ability to select image from container os through file picker. Also, uploaded image should be saved in the container at a specific location and should be shown in the settings as a preview of list of images available in that location.
- [ ] **Theming:** Ability to select from standard list of themes and apply to the desktop via settings.
- [x] **Advanced Terminal:** Ability to run commands in the container and get the output in the terminal with real live connection to the container terminal. Supports interactive commands like `python`, `nano`, etc. via WebSockets.
- [ ] **Image Viewer:** Ability to view images in the container through file picker or when image file selected in file explorer(option to open with image viewer in properties panel).
- [ ] **Extension Manager:** Ability to remove extension and file type associations.
- [ ] **File Type Association:** Ability to associate file types with extensions and preexixting programs like text editor, terminal, image viewer etc. It shoulld be persistent.
- [ ] **Extensions:** Add more extensions to the system.
   - [x] **Advanced Text Editor:** Monaco Editor based text editor to the system.
   - [ ] **Advanced Image Manager:** Add advanced image manager to the system.
   - [ ] **Log Streamer (Log Viewer):** A dedicated app to view `.log` files in real-time (like `tail -f`), with search, filter, and color-coding (highlight "ERROR" in red).
   - [ ] **Network Request Tester (Postman Lite):** An app to make HTTP requests (GET/POST) to other services.
   - [ ] **Markdown / Documentation Viewer:** A split-pane editor: Raw Markdown on the left, Live HTML Preview on the right.
   - [ ] **JSON Viewer:** A collapsible tree view for `.json` config files.
   - [ ] **SQLite Viewer:** A table view to browse `.sqlite` or `.db` files often found in app containers.
