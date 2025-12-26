# ContainerUIWeb Available Extensions

The **Extensions System** in ContainerUIWeb is designed to allow developers and users to add new functionality (apps, tools, viewers) to the web desktop environment without modifying the core codebase. This modular approach ensures the core system remains lightweight while enabling infinite extensibility.

## Purpose
- **Modularity:** Keep the core system lean and add specific features as plugins.
- **Decoupling:** Frontend UI for apps is decoupled from the main OS setup.
- **Sandboxing:** Extensions run in an isolated environment (iframe) to prevent crashes from affecting the main desktop.

## Architecture

### Backend (`app.routers.extensions`)
The backend is responsible for managing the lifecycle of extensions:
1.  **Storage:** Extensions are stored in the `extensions_storage/` directory.
2.  **Installation:**
    - Accepts a `.zip` file upload via `/install`.
    - Validates the ZIP contains a valid `manifest.json`.
    - Extracts contents to a dedicated folder named after the extension ID.
3.  **Serving:**
    - The `extensions_storage/` directory is mounted as a static route at `/extensions`.
    - Any file inside an extension can be accessed via `http://backend-url/extensions/<ext_id>/<file>`.
4.  **Listing:** The `/list` endpoint scans the directory and returns metadata for all installed extensions.

### Frontend (`ExtensionLoaderComponent`)
The frontend integrates extensions into the desktop UI:
1.  **Isolation:** Uses an `<iframe>` to load the extension's entry point (e.g., `index.html`).
2.  **Security:** The iframe is sandboxed with `allow-scripts`, `allow-same-origin`, etc.
3.  **Communication (`postMessage`):**
    - The extension communicates with the main OS via the `postMessage` API.
    - **Action - `READ_FILE`:** Extensions can request file contents from the OS.
    - **Protocol:** `{ action: "READ_FILE", payload: { path: [...] }, reqId: "..." }`.

## Extension Structure
An extension is a folder (or ZIP archive) containing at least a `manifest.json` and an entry point (usually `index.html`).

### `manifest.json`
Configuration file defining the extension's identity and behavior.
```json
{
    "id": "com.example.myextension",      // Unique Identifier
    "name": "My Extension",               // Display Name
    "version": "1.0.0",                   // Version
    "entryPoint": "index.html",           // Main HTML file to load
    "icon": "fa-solid fa-puzzle-piece",   // FontAwesome icon class
    "defaultSize": {                      // Initial Window Size
        "width": 800,
        "height": 600
    }
}
```

### Folder Layout
```
/my_extension/
├── manifest.json       # (Required) Metadata
├── index.html          # (Required) Entry point
├── style.css           # (Optional) Styles
└── script.js           # (Optional) Logic
```

## Usage
1.  **Install:** Upload a valid `.zip` file containing the structure above.
2.  **Launch:** The extension will appear in the Start Menu. Click to open it in a window.
3.  **Interact:** extensions act like native apps but run inside the container.

---

## Current Extensions

### **1. Sample Extension (`com.test.sample`)**
- **Purpose:** Demonstrates the basic capabilities of the extension system.
- **Features:** Shows a "Hello World" message and verifies iframe loading.

### **2. Advanced Text Editor (`com.antigravity.monaco`)**
- **Purpose:** Full-featured code editor using Monaco Editor.
- **Features:** Syntax highlighting, file open/save (READ/WRITE), dark theme.

---

## Future Roadmap (Planned Extensions)
- [x] **Advanced Text Editor:** Monaco Editor or similar for code editing.
- [ ] **Advanced Image Manager:** Editor and viewer for images.
- [ ] **Log Streamer (Log Viewer):** Real-time viewer for `.log` files (like `tail -f`) with filtering and highlighting.
- [ ] **Network Request Tester (Postman Lite):** Tool to send HTTP GET/POST requests.
- [ ] **Markdown / Documentation Viewer:** Split-pane Markdown editor with live preview with edit and save capabilities.
- [ ] **JSON Viewer:** Tree view visualizer for `.json` files.
- [ ] **SQLite Viewer:** Table browser for `.sqlite` databases.
