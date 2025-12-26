# Phase 1: User Stories & Implementation Plan (Container Web Desktop)

This document details the features required to complete Phase 1 of the Container Web Desktop project.

---

## Feature 1: Foundation & Desktop Shell (Ubuntu Theme)
**User Story:**
> As a user, I want to see a desktop environment with an Ubuntu-style theme, a taskbar, and desktop icons so that I feel like I am using a Linux OS.

### Implementation Plan
1.  **Dependency Setup:**
    -   Run `npm install bootstrap @fortawesome/fontawesome-free @angular/cdk`.
    -   Add Bootstrap and FontAwesome CSS to `angular.json` styles.
2.  **Global Styling (`styles.scss`):**
    -   Define CSS variables for desktop colors (Aubergine `#2c001e`, Orange `#e95420`).
    -   Reset browser margins to 0.
3.  **Components:**
    -   `DesktopComponent`: The root container.
        -   **HTML:** `<div class="desktop-wallpaper"> <app-desktop-icons> <app-window-container> <app-taskbar> </div>`
        -   **CSS:** Radial gradient background.
    -   `TaskbarComponent`:
        -   Fixed to bottom (height ~48px).
        -   "Show Applications" grid button.
        -   Clock widget (right side).
    -   `StartMenuComponent`:
        -   Full-screen overlay with a grid of application icons.
        -   Search bar at the top.

---

## Feature 2: Window Manager System (Core Engine)
**User Story:**
> As a user, I want to open multiple application windows, drag them around, resize them, and minimize/restore them.

### Implementation Plan
1.  **Window Manager Service (`WindowManagerService`):**
    -   **State:** `windows: Signal<WindowConfig[]>`, `activeWindowId: Signal<string>`.
    -   **Methods:** `openApp`, `closeWindow`, `minimize`, `focus`.
    -   **Dynamic Sizing:** Calculate window size based on 80% of screen width/height.
2.  **Window Frame Component (`WindowFrameComponent`):**
    -   **Wrapper:** Uses `cdkDrag`.
    -   **UI:** Title Bar, Controls [-] [□] [X].
    -   **Constraints:** `max-height` to avoid covering taskbar.

---

## Feature 3: File Explorer App
**User Story:**
> As a user, I want to browse the **real backend file system** to manage my files.

### Implementation Plan
1.  **Backend Integration (`FileSystemService`):**
    -   **API:** Connect to `GET /api/files/list` (Backend).
    -   **Operations:** Implement copy, cut, paste, delete via API.
2.  **File Explorer Component:**
    -   **Layout:** Split pane (Tree/Grid).
    -   **Navigation:** Breadcrumbs.
    -   **Context Menu:** Right-click options on files.

---

## Feature 4: Terminal App
**User Story:**
> As a user, I want to open a terminal window and execute **actual shell commands** in the system.

### Implementation Plan
1.  **Backend Integration:**
    -   **API:** `POST /api/terminal/exec` for command execution.
    -   **Session:** Maintain current working directory (CWD).
2.  **Terminal Component:**
    -   **Style:** Black background, Green prompt.
    -   **Behavior:** Send commands to backend, display stdout/stderr response.

---

## Feature 5: Process Manager App
**User Story:**
> As a user, I want to view a list of **real running system processes** and resource usage.

### Implementation Plan
1.  **Backend Integration:**
    -   **API:** `GET /api/system/processes` (using `psutil`).
2.  **Process Manager Component:**
    -   **UI:** Bootstrap Table with columns: PID, Name, CPU%, Memory%.
    -   **Actions:** "Kill Process" button.

---

## Feature 6: Additional Apps (Productivity)
**User Story:**
> As a user, I want access to basic productivity tools like a Text Editor, Browser, and Calculator.

### Implementation Plan
1.  **Text Editor (`TextEditorComponent`):**
    -   Connect Open/Save operations to File System API.
2.  **Browser (`BrowserComponent`):**
    -   Iframe container with address bar (input).
    -   Navigation buttons (Home, Refresh).
3.  **Calculator (`CalculatorComponent`):**
    -   Standard layout with circular buttons.
    -   Basic arithmetic operations (+, -, *, /).

---

## Feature 7: Settings & Theme
**User Story:**
> As a user, I want the desktop to look consistent and polished, and be able to customize it.

### Implementation Plan
1.  **Theme:**
    -   Enforce Ubuntu color palette globally.
2.  **Settings App:**
    -   Ability to change Desktop Background (Color or Image).
    -   Persist settings to `localStorage` (or backend in Phase 2).

---

## Feature 8: Extension System
**User Story:**
> As a user, I want to install and run third-party extensions (plugins) to extend functionality without recompiling the OS.

### Implementation Plan
1.  **Backend:**
    -   `extensions.py`: Handle `/install` (ZIP upload) and `/extensions` (Static Serve).
2.  **Frontend (`ExtensionLoaderComponent`):**
    -   **Isolation:** Load extension `index.html` in an `<iframe>`.
    -   **Communication:** Listen for `postMessage` (e.g., `READ_FILE`) and proxy requests to the OS services.

---

## Feature 9: Extended Functionality (Phase 1 Roadmap)
**User Story:**
> As a user, I want advanced developer tools to make this a viable workspace.

### Implementation Plan
Integration of the following planned extensions:
1.  **Advanced Text Editor:** Monaco Editor integration.
2.  **Advanced Image Manager:** View and edit images.
3.  **Log Streamer:** Real-time log monitoring.
4.  **Network Request Tester:** HTTP Client tool.
5.  **Markdown Viewer:** Live preview editor.
6.  **JSON Viewer:** Tree visualizer.
7.  **SQLite Viewer:** Database browser.
