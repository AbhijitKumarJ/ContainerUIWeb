Okay, here is a consolidated single instruction document for an LLM/coding agent to build the Container Management UI, incorporating all previously discussed points and new project requirements.

---

**LLM/Agent Coding Instructions: Container Management UI**

**I. Project Core Objective & Philosophy**

*   **Primary Goal:** Develop a **Web Desktop Environment** (simulated OS GUI) to manage the runtime environment (container).
*   **Core Purpose:** Provide a familiar Desktop interface (Taskbar, Windows, Desktop Icons) to interact with the underlying OS (Files, Terminal, Processes).
*   **Guiding Principle:** "It should feel like I'm logging into a remote desktop, but it's just a web page." Focus on Window Management, Multitasking, and Immersion.

**II. Key Technical & Architectural Constraints**

1.  **Backend & Integration (Python/FastAPI):**
    *   **Technology Stack:** Python with FastAPI.
    *   **Data Source:** Mock JSON-based Web API to simulate container orchestration logic (Phase 1).
    *   **Rendering Strategy:**
        *   FastAPI will utilize **Jinja2 templates**.
        *   The backend will serve the compiled Angular application entry point (`index.html`) via a Jinja template route.
    *   **Cross-Platform:** Backend API orchestration must be compatible with both Windows and Linux to ensure testability.

2.  **Angular (Frontend - Latest Stable Version):**
    *   **Standalone Components:** **Strongly prefer and prioritize standalone components, directives, and pipes.** Minimize reliance on `NgModule`s.
    *   **Simple Project Structure (Flat & Beginner-Friendly):**
        *   **No Sub-Modules:** Avoid creating Angular feature modules (`@NgModule`) unless absolutely necessary.
        *   **Organize by Feature/Type Directly Under `app/`:**
            *   `app/components/`: For all UI components. Each component in its own subfolder.
            *   `app/services/`: For all Angular services (API clients, state management).
            *   `app/models/`: For TypeScript interface definitions.
        *   **Routing:** Define all routes directly in `app.routes.ts`.
    *   **Declarative UI:**
        *   **Prioritize defining UI elements in component HTML templates.**
        *   **Minimize dynamic UI generation from TypeScript.**
    *   **Reactive Programming (RxJS):** Use Observables and Subjects for efficient state management and API integration.
    *   **Services for Logic:** API calls and mock data orchestration logic (where applicable on frontend) must reside in services.
    *   **Strong Typing:** Use clear TypeScript interfaces for all data models (Container, Log, Config, etc.).
    *   **Dependency Injection:** Utilize Angular's built-in DI system.

3.  **UI & Styling:**
    *   **Theme:** **Dark Mode default**.
    *   **Responsiveness:** Fully responsive layout adapting to various screen sizes.
    *   **Lightweight CSS Framework:** Use **Bootstrap 5** for grid and basic layout.
    *   **NO Bulky UI Component Libraries:** **Do NOT use comprehensive libraries like Angular Material, PrimeNG, etc.** Build custom lightweight components styled with SCSS.
    *   **Icons:** Use **Font Awesome** for consistency.
    *   **Custom Styling (SCSS):** Use `.scss` files for component-specific styling and global theme overrides.

**III. Adherence to Project Requirements**

*   Strictly follow the objectives outlined in **ProjectRequirement.md**.
*   **Phase 1 Focus:**
    *   Frontend Architecture (Angular, Dark Mode, Responsive).
    *   Backend Integration (FastAPI, Mock API, Jinja2 serving).
*   **Phase 2 Preview:**
    *   Docker container deployment.
    *   Linux system command orchestration.
    *   Full desktop UI features (File Manager).

**IV. Functionality: Scope & Focus**

*   **Focus ON:**
*   **Focus ON:**
    *   **Desktop Metaphor:** A desktop background, a taskbar (start menu, running apps), and window management (minimize, maximize, close, drag, resize).
    *   **File Explorer:** A windowed application to browse folders and files.
    *   **Terminal:** A windowed application simulating a command line.
    *   **System Status:** Widgets or tray icons showing CPU/RAM of the container.
    *   **Simulation (Phase 1):** mimicking the behavior of these apps with mock data.

*   **Explicitly AVOID:**
    *   Complexity related to *actual* Docker socket communication in Phase 1 (Stick to the Mock API requirement).
    *   Over-engineering authentication (unless specified).
    *   Bringing in heavy dependencies for simple UI tasks.

**V. Code Quality & Agent Interaction**

*   **Readability:** Write clean, well-commented code.
*   **Modularity:** Single responsibility principle for components and services.
*   **Error Handling:** Implement graceful error handling for API failures.
*   **Simplicity:** Choose simpler implementation patterns where possible without sacrificing quality.
*   **Clarification:** Use `notify_user` to ask if requirements are ambiguous.

**This document is the single source of truth for guiding development. All generated code must align with these instructions.**