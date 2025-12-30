# Container Web Desktop

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
| **Process Manager** | ✅ Done | Real-time system process monitoring using live backend data, sorting, filtering, and kill process support. |
| **Service Manager** | 🚀 In Progress | Real-time system service monitoring with start, stop, and restart functionality. |
| **Text Editor** | ✅ Done | Fully functional with Open/Save/Save As dialogs connected to backend. |
| **Browser** | ✅ Done | Iframe-based internal browser with address bar, bookmarks support, and limitation warnings. |
| **Calculator** | ✅ Done | Fully functional standard calculator. |
| **File Transfer** | ✅ Done | Dual-pane interface for uploading and downloading files between host and container. |
| **Settings-Personalization** | ✅ Done | Customize desktop background (color, uploaded images, or system files) with persistence. |
| **Settings-Default Apps** | ✅ Done | Default Apps tab to set default apps for file types. It provides option to map file extensions to apps and set default app from mapped apps for each file extension. |
| **Settings-Backup Restore User Data** | ✅ Done | Ability to export user data from the container to the host which includes settings, file type associations, wallpapers, extensions, bookmarks etc. Also, it provides option to import user data from the host to the container through similar zip file. |
| **Extensions** | ✅ Done | Manager app to install (`.zip`) extensions along with file type associations. Remove extension and file type associations. |

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



