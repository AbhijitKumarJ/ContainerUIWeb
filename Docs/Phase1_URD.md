# Phase 1 URD & Implementation Plan: Container Web Desktop

## 1. Introduction
This document outlines the **User Requirements Document (URD)** and **Implementation Architecture** for Phase 1 of the Container Web Desktop. The system provides a seamless, standard desktop experience within a browser, backed by a FastAPI backend and an Angular frontend.

## 2. Architecture & Components

### 2.1 Core Desktop Shell (`app/components/os/`)
-   **`DesktopComponent`**: Root container. Rendered with Ubuntu-style mesh gradient. Manages the z-indexing context for windows.
-   **`TaskbarComponent`**: Fixed bottom bar (48px). Contains:
    -   **"Show Applications"**: Toggle for the Start Menu.
    -   **Window List**: Tabs for active windows with focus switching.
    -   **System Tray**: Clock and system status indicators.
-   **`StartMenuComponent`**: Full-screen overlay grid of installed applications. Includes search functionality.
-   **`DesktopIconComponent`**: Draggable shortcuts on the desktop surface.

### 2.2 Window Manager (`app/services/window-manager.service.ts`)
The core engine for the desktop experience.
-   **Capabilities**:
    -   **Drag & Drop**: Uses Angular CDK.
    -   **Resize**: Edge-based resizing logic.
    -   **State Management**: Minimize, Maximize, Restore, Close.
    -   **Focus Management**: Dynamic Z-index handling (clicking a window brings it to front).

### 2.3 Architecture: Extension System
A modular plugin system to allow third-party apps to run safely.
-   **Backend (`routers/extensions.py`)**:
    -   **Storage**: Extensions are stored in `extensions_storage/`.
    -   **Installation**: Uploads `.zip`, verifies `manifest.json`, and extracts.
    -   **Serving**: Mounts extensions as static files under `/extensions`.
-   **Frontend (`ExtensionLoaderComponent`)**:
    -   **Isolation**: Uses sandboxed `<iframe>` to load extension entry points.
    -   **Communication**: `postMessage` protocol for extensions to request OS services (e.g., File System access).

## 3. Core Applications (Implemented)

### 3.1 System Apps
-   **File Explorer**: Split-pane view (Tree/Grid). Browse files, view properties, and perform basic file operations.
-   **Terminal**: Web-based terminal emulator. Connects to backend shell execution throughout.
-   **Process Manager**: Task Manager view of running system processes.
-   **Settings**: Desktop customization (background color/image persistence).

### 3.2 Productivity Apps
-   **Text Editor**: Fully functional editor with Open, Save, and Save As capabilities connected to the backend filesystem.
-   **Browser**: Iframe-based internal web browser.
-   **Calculator**: Standard arithmetic calculator.

### 3.3 Utilities
-   **Extension Manager**: UI for browsing installed extensions and installing new ones via ZIP upload.

## 4. Phase 1 Roadmap (Planned Extensions)
The following extensions are planned to be developed and integrated to complete Phase 1 functionality:

| Extension | Description |
| :--- | :--- |
| **Advanced Text Editor** | Monaco-based editor for code highlighting and advanced editing. |
| **Advanced Image Manager** | Dedicated image viewer and editor. |
| **Log Streamer** | Real-time `tail -f` style log viewer with filtering. |
| **Network Tester** | "Postman Lite" for testing HTTP requests. |
| **Markdown Viewer** | Split-pane Markdown editor with live HTML preview. |
| **JSON Viewer** | Tree-view visualizer for JSON files. |
| **SQLite Viewer** | Table browser for SQLite databases. |

## 5. Data Models
-   **`WindowConfig`**: Defines state (`x`, `y`, `width`, `height`, `isMinimized`, `zIndex`).
-   **`ExtensionManifest`**: JSON schema for valid extensions (`id`, `name`, `entryPoint`, `permissions`).

## 6. Implementation Status
-   **Scaffolding & Deps**: ✅ Completed (Bootstrap, FontAwesome, CDK).
-   **Shell & Window Manager**: ✅ Completed.
-   **Core Apps**: ✅ Completed.
-   **Extension System Core**: ✅ Completed.
-   **Planned Extensions**: 🚧 Pending (See Roadmap).
