# Project Requirements: Container Management UI

## Overview
Develop a web-based **Desktop Environment** (Web Desktop) for the underlying OS running within a Docker container. The goal is to provide a seamless, native-desktop-like experience (Windows/Linux GUI style) within a web browser, allowing users to interact with the file system, terminal, and system processes visually.

## Phase 1 Objectives

### Frontend Architecture
*   **Framework:** Angular (Latest Stable Version)
*   **Platform:** Browser-based web application
*   **Design System:**
    *   **Theme:** **Ubuntu Linux Style** (Aubergine/Orange Palette, Mesh Gradient).
    *   **Responsiveness:** Fully responsive layout adapting to various screen sizes.

### Backend & Integration
*   **Technology Stack:** Python with FastAPI
*   **Data Source:** Mock JSON-based Web API (simulating container orchestration logic)
*   **Rendering Strategy:**
    *   FastAPI will utilize Jinja2 templates.
    *   The backend will serve the compiled Angular application entry point (`index.html`) via a Jinja template route.
*   **Deployment & Compatibility:**
    *   Run on host system as a local server.
    *   Backend API orchestration must be cross-platform (compatible with both Windows and Linux) to ensure testability on any host system.

## Phase 2 Objectives
*   Deployment within a Docker container (Self-contained).
*   **Core Apps (Implemented in Phase 1):**
    *   **File Manager:** Browse, open, edit files in the container.
    *   **Terminal:** Web-based terminal emulator connected to the container shell.
    *   **Process Manager:** View and kill processes.
    *   **Text Editor:** Basic text editing with save mock.
    *   **Browser:** Iframe-based internal browser.
    *   **Calculator:** Standard arithmetic calculator.
*   **UI Features:** Window management (draggable, resizable), Taskbar, Desktop Icons, **Ubuntu-style Start Menu**.
