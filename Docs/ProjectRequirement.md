# Project Requirements: Container Management UI

## Overview
Develop a web-based **Desktop Environment** (Web Desktop) for the underlying OS running within a Docker container or local host. The goal is to provide a seamless, native-desktop-like experience (Windows/Linux GUI style) within a web browser, allowing users to interact with the file system, terminal, and system processes visually.

## Phase 1 Objectives

### 1. Core Architecture
*   **Frontend:** Angular (Latest Stable)
    *   **Design System:** Ubuntu Linux Style (Aubergine `#2c001e` / Orange `#e95420` Palette, Mesh Gradient).
    *   **Responsiveness:** Adapts to browser window size.
*   **Backend:** Python with FastAPI
    *   **API:** RESTful endpoints for File System, Terminal execution, and Process management.
    *   **Integration:** Serves the Angular app (`index.html`) via Jinja2 templates (or static mounting).
*   **Extension System:**
    *   **Backend:** Logic to install (`.zip`), valididate (`manifest.json`), and serve extensions.
    *   **Frontend:** Sandboxed `<iframe>` loader with `postMessage` communication.

### 2. Completed Features (Current Status)
*   **Desktop Shell:**
    *   **Desktop:** Draggable icons (Trash, Home, etc.), context menus.
    *   **Taskbar:** Bottom bar with "Show Applications" grid, active window tabs, and clock.
    *   **Start Menu:** Full-screen overlay grid of applications with search.
*   **Window Manager:**
    *   Support for multiple open windows.
    *   Capabilities: Drag, Resize, Minimize, Maximize/Restore, Close.
    *   Z-index management (Focus).
*   **System Apps:**
    *   **File Explorer:** Browse files/folders, breadcrumb navigation, file properties, basic operations.
    *   **Terminal:** Web-based terminal emulator connected to backend shell.
    *   **Process Manager:** View and kill system processes (Task Manager).
    *   **Settings:** Change desktop background (color/image).
*   **Productivity Apps:**
    *   **Text Editor:** Open, edit, and save text files.
    *   **Browser:** Simple internal web browser.
    *   **Calculator:** Standard arithmetic calculator.
*   **Extension Manager:**
    *   UI to view installed extensions.
    *   Ability to upload and install new extensions via ZIP.

### 3. Planned Extensions (Phase 1 Roadmap)
The following extensions are planned to demonstrate the extensive capabilities of the extension system within Phase 1:
*   **Advanced Text Editor:** Integration of Monaco Editor for code editing capabilities.
*   **Advanced Image Manager:** A dedicated editor and viewer for images.
*   **Log Streamer:** Real-time log file viewer (`tail -f` style) with search and error highlighting.
*   **Network Request Tester:** "Postman Lite" for making HTTP requests.
*   **Markdown / Documentation Viewer:** Split-pane Markdown editor with live preview, edit, and save.
*   **JSON Viewer:** Tree view visualizer for `.json` configuration files.
*   **SQLite Viewer:** Table browser for `.sqlite` / `.db` files.

---

## Planned Objectives/Features for Core Application
*   **Containerization:** Full deployment within a self-contained Docker image.
*   **Advanced Terminal:** Fully interactive PTY support (not just command execution).
*   **Persistent Settings:** Database-backed user preferences.
*   **File Type Associations:** Persistent mapping of file extensions to specific apps/extensions.
