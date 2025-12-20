# Phase 1 URD & Implementation Plan: Container Web Desktop

## 1. Scaffolding Review & Setup Changes
The current scaffolding is a default Angular 19 Standalone application. The following changes are required to support a scalable **Desktop Environment**:

### 1.1 Dependencies
- **Install Bootstrap 5:** `npm install bootstrap` (Grid/Layout basis).
- **Install FontAwesome:** `npm install @fortawesome/fontawesome-free`.
- **Install Angular CDK:** `npm install @angular/cdk` (Critical for Drag & Drop windows).

### 1.2 Configuration
- **Styles:** configure `src/styles.scss` with Desktop-specific variables (Taskbar height, customized scrollbars).

## 2. Architecture & Components
**Strategy:** "Desktop Metaphor" components with **Ubuntu Linux Styling**.

### 2.1 Core Desktop Shell (`app/components/os/`)
- **`DesktopComponent`**: The main container. Background image (Ubuntu gradient), holds `WindowContainer` and `Taskbar`.
- **`TaskbarComponent`**: Bottom bar. "Show Applications" grid button, list of open window tabs, clock.
- **`StartMenuComponent`**: Full-screen App Grid overlay (Ubuntu style) to launch apps.
- **`DesktopIconComponent`**: Draggable icons on the desktop grid.

### 2.2 Window Management (`app/components/window-manager/`)
- **`WindowFrameComponent`**: Draggable, resizable container. Title bar (Close, Maximize, Minimize), Content area. Handles Z-index stacking and constraints (not covering taskbar).
- **`WindowManagerService`**: Manages list of open windows, active window focus, minimize/restore state. Calculates dynamic window sizes based on viewport.

### 2.3 Core Apps (`app/components/apps/`)
- **`FileExplorerComponent`**:
  - Tree view (left), File Grid (right).
  - Breadcrumb navigation.
  - Mock file system navigation for Phase 1.
- **`TerminalComponent`**:
  - Black background, monospace text.
  - Input field simulating shell prompts.
  - Mock command execution (`ls`, `pwd`, `date`, `help`) with auto-scroll.
- **`ProcessManagerComponent`**:
  - Table of running processes (PID, Name, CPU, RAM).
- **`TextEditorComponent`**:
  - Basic text area with Toolbar (Save button) and Status bar (line/col count).
- **`BrowserComponent`**:
  - Iframe-based browser with Address bar and Navigation controls.
- **`CalculatorComponent`**:
  - Standard calculator with circular buttons and basic arithmetic operations.

## 3. Data Models (`app/models/`)
- **`window-config.interface.ts`**:
  ```typescript
  export interface WindowConfig {
    id: string;
    title: string;
    icon: string;
    component: Type<any>; // Component to render inside
    zIndex: number;
    isMinimized: boolean;
    isMaximized: boolean;
    position: { x: number, y: number };
    size: { width: number, height: number };
  }
  ```
- **`file-node.interface.ts`**: Type (file/folder), name, size, children.

## 4. Services (`app/services/`)
- **`WindowManagerService`**:
  - `openApp(appId)`: Creates a new window.
  - `closeWindow(id)`: Removes window.
  - `bringToFront(id)`: Updates z-index.
  - `toggleStartMenu()`: Controls visibility of the App Grid.
- **`FileSystemService`**:
  - Mock API to list files/folders.

## 5. Routing (`app.routes.ts`)
Single route for the Desktop.
```typescript
{ path: '', component: DesktopComponent } // The Desktop *is* the app.
```

## 6. Implementation Steps
1.  **Setup:** Install Deps (Bootstrap, FontAwesome, CDK).
2.  **OS Shell:** Build `DesktopComponent`, `TaskbarComponent`, and `StartMenuComponent`.
3.  **Window Manager (Critical):** Implement `WindowFrameComponent` using CDK DragDrop. Build `WindowManagerService`.
4.  **App Integration:** Create base "App" interface.
5.  **File Explorer:** Build the UI using Mock FS data.
6.  **Terminal:** Build the UI with basic command echoing.
7.  **Process Manager:** Build process table.
8.  **Extra Apps:** Build `TextEditor`, `Browser`, `Calculator`.
9.  **Theme:** Final polish of the "Ubuntu" look.
