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
| **File Explorer** | ✅ Done | Real file system browsing, properties pane, file operations, and compression/decompression (.zip) support. |
| **Terminal** | ✅ Done | Real backend execution, directory navigation, and OS-specific command translation. |
| **Process Manager** | ✅ Done | Real-time system process monitoring using live backend data with kill functionality. |
| **Service Manager** | 🚀 In Progress | Real-time system service monitoring using live backend data with start/stop functionality. |
| **Text Editor** | ✅ Done | Fully functional with Open/Save/Save As dialogs connected to backend. |
| **Browser** | ✅ Done | Iframe-based internal browser with address bar, bookmarks support, and limitation warnings. |
| **Calculator** | ✅ Done | Fully functional standard calculator. |
| **Settings-Personalization** | ✅ Done | Customize desktop background (color, uploaded images, or system files) with persistence. 
| **Settings-Default Apps** | ✅ Done | Default Apps tab to set default apps for file types. It provides option to map file extensions to apps and set default app from mapped apps for each file extension. |
| **Settings-Backup Restore User Data** | ✅ Done | Ability to export user data from the container to the host which includes settings, file type associations, wallpapers, extensions, bookmarks etc. Also, it provides option to import user data from the host to the container through similar zip file. |
| **File Transfer** | ✅ Done | Ability to transfer files between the container and the host through a file transfer app which uploads to a fixed location(folder - filetransfers/upload) in the container and downloads files from a fixed location(folder - filetransfers/download) in the container.|
| **Extensions** | ✅ Done | Manager app to install (`.zip`) extensions along with file type associations. Remove extension and file type associations. |

### Available Extensions
Check Available Extensions folder for available extensions.

| Extension | Description |
| :--- | :--- |
| **Text Editor** | Monaco Editor based text editor to the system. |
| **Sample Extension** | A sample extension to demonstrate the extension architecture. |

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
- [ ] **Theming:** Ability to select from standard list of themes and apply to the desktop via settings.
- [ ] **Log Engine:** Ability to log system events, app logs, and other events in the container through a common log engine.
- [ ] **Logger:** Ability to view logs in the container through a logger app.
- [ ] **Extensions:** Add more extensions to the system.
   - [ ] **Advanced Image Manager:** Add advanced image manager to the system.
   - [ ] **Log Streamer (Log Viewer):** A dedicated app to view `.log` files in real-time (like `tail -f`), with search, filter, and color-coding (highlight "ERROR" in red).
   - [ ] **Network Request Tester (Postman Lite):** An app to make HTTP requests (GET/POST) to other services.
   - [ ] **Markdown / Documentation Viewer:** A split-pane editor: Raw Markdown on the left, Live HTML Preview on the right.
   - [ ] **JSON Viewer:** A collapsible tree view for `.json` config files.
   - [ ] **SQLite Viewer:** A table view to browse `.sqlite` or `.db` files often found in app containers.
