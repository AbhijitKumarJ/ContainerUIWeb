# Container Web Desktop

A web-based desktop environment for managing Docker containers. This project simulates a native OS experience (Ubuntu-style) within a browser, interacting with the underlying container via a Python FastAPI backend.

## 🚀 Features & Implementation Status

### Core Desktop Shell
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Desktop Environment** | ✅ Done | Ubuntu-style wallpaper (Mesh Gradient), draggable icons. |
| **Taskbar** | ✅ Done | Bottom bar with "Show Applications" grid, window tabs, clock. |
| **Start Menu** | ✅ Done | Full-screen App Grid overlay with search bar. |
| **Window Manager** | ✅ Done | Draggable, minimize/restore, focus management, dynamic sizing. |

### Applications
| App | Status | Description |
| :--- | :---: | :--- |
| **File Explorer** | 🚧 Partial | UI implemented with mock file system. Actual IO pending. |
| **Terminal** | 🚧 Partial | Functional UI & basic commands (`ls`, `pwd`). Backend shell pending. |
| **Task Manager** | 🚧 Partial | UI implemented with mock process data. |
| **Text Editor** | ✅ Done | Fully functional text editor styling with mock save. |
| **Browser** | ✅ Done | Iframe-based internal browser with address bar. |
| **Calculator** | ✅ Done | Fully functional standard calculator. |

### System & Theme
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Ubuntu Theme** | ✅ Done | Aubergine/Orange palette, font styling, scrollbars. |
| **Responsiveness** | ✅ Done | Desktop adapts layout to browser window size. |

## 🛠️ Usage

### Prerequisites
- Node.js & npm
- Angular 19+

### Running the Development Server
```bash
ng serve
```
Navigate to `http://localhost:4200/`.

## 🔮 Future Roadmap (Phase 2 & Beyond)
- [ ] **Backend Integration:** Connect `Terminal` and `File Explorer` to real Docker container via FastAPI.
- [ ] **Real File System:** Implement CRUD operations for files.
- [ ] **Process Control:** Ability to kill actual container processes from Task Manager.
- [ ] **Settings App:** Allow user to change wallpaper and theme colors.