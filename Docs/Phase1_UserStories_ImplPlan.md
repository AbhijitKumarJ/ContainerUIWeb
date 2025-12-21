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
> As a user, I want to browse a mock file system structure.

### Implementation Plan
1.  **Mock Data Service (`FileSystemService`):**
    -   **Data:** JSON tree.
2.  **File Explorer Component:**
    -   **Layout:** Split pane (Tree/Grid).
    -   **Navigation:** Breadcrumbs.

---

## Feature 4: Terminal App
**User Story:**
> As a user, I want to open a terminal window and type basic commands.

### Implementation Plan
1.  **Terminal Component:**
    -   **Style:** Black background, Green prompt.
    -   **Commands:** `help`, `ls`, `pwd`, `date`, `clear`.
    -   **Behavior:** Auto-scroll to bottom on new output.

---

## Feature 5: Process Manager App
**User Story:**
> As a user, I want to view a list of running simulated processes.

### Implementation Plan
1.  **Process Manager Component:**
    -    **UI:** Bootstrap Table with mock process data.

---

## Feature 6: Additional Apps (Productivity)
**User Story:**
> As a user, I want access to basic productivity tools like a Text Editor, Browser, and Calculator.

### Implementation Plan
1.  **Text Editor (`TextEditorComponent`):**
    -   Textarea with save button (mock).
    -   Status bar (Line/Col count).
2.  **Browser (`BrowserComponent`):**
    -   Iframe container with address bar (input).
    -   Navigation buttons (Home, Refresh).
3.  **Calculator (`CalculatorComponent`):**
    -   Standard layout with circular buttons.
    -   Basic arithmetic operations (+, -, *, /).

---

## Feature 7: Settings & Theme
**User Story:**
> As a user, I want the desktop to look consistent and polished.

### Implementation Plan
1.  **Theme:**
    -   Enforce Ubuntu color palette globally.
    -   Use consistent scrollbar styling.
