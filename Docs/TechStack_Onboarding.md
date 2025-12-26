# Technology Stack & Developer Onboarding

Welcome to the **ContainerUIWeb** project! This document serves as a technical guide for new contributors, outlining the technology stack, project structure, and setup instructions.

## 1. Technology Stack

### Frontend
-   **Framework:** [Angular 19+](https://angular.io/) (Latest Stable)
    -   Architecture: Standalone Components (No NgModules required).
    -   State Management: Angular Signals.
-   **Styling:** 
    -   [Bootstrap 5](https://getbootstrap.com/) (Grid System & Utility Classes).
    -   [SCSS (Sass)](https://sass-lang.com/) for custom styling.
    -   [FontAwesome](https://fontawesome.com/) for icons.
-   **UI Interactions:** [Angular CDK](https://material.angular.io/cdk) (Drag & Drop, Overlay).

### Backend
-   **Language:** Python 3.11+
-   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (High-performance web API).
-   **Server:** [Uvicorn](https://www.uvicorn.org/) (ASGI server).
-   **Templating:** [Jinja2](https://jinja.palletsprojects.com/) (For serving the Angular entry point).
-   **System Interaction:** `psutil` (Process management), `subprocess` (Shell execution).

### Tools & DevOps
-   **Containerization:** [Docker](https://www.docker.com/) & Docker Compose.
-   **Runtime:** Node.js (v18+ LTS).
-   **Version Control:** Git.

---

## 2. Project Structure

| Directory | Description |
| :--- | :--- |
| **`Backend/`** | Python FastAPI application code. Contains `main.py` (entry point), `app/` (routes, models), and `static/`. |
| **`Frontend/`** | Angular application source code. |
| **`Docs/`** | Project documentation, requirements, and user stories. |
| **`AvailableExtensions/`** | Source code and assets for the extension system and sample extensions. |

---

## 3. Onboarding Guide

### Prerequisites
Ensure you have the following installed:
-   **Python 3.11+**: `python --version`
-   **Node.js v18+**: `node -v`
-   **Angular CLI**: `npm install -g @angular/cli`
-   **Docker (Optional)**: For containerized deployment.

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd ContainerUIWeb
```

#### 2. Backend Setup
Set up the Python environment.
```bash
cd Backend
python -m venv venv

# Activate Virtual Environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt
```

#### 3. Frontend Setup
Install Angular dependencies.
```bash
cd ../Frontend
npm install
```

---

## 4. Running the Application

### Option A: Manual Development Mode (Recommended for Contributors)
Run Backend and Frontend in separate terminals for hot-reloading.

**Terminal 1 (Backend):**
```bash
cd Backend
source venv/bin/activate  # or venv\Scripts\activate
python main.py
# Server starts at http://localhost:8000
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm start
# App serves at http://localhost:4200 (Proxy configured to point to backend)
```

### Option B: Production Build (Local)
Build the frontend and serve it via the backend.
```bash
cd Frontend
ng build --out-path ../Backend/app/static/browser
cd ../Backend
python main.py
# Access at http://localhost:8000
```

### Option C: Docker
Run the entire stack in a container.
```bash
docker-compose up --build
```

---

## 5. Development Guidelines
-   **Code Style:** Follow PEP 8 for Python and the official Angular Style Guide for TypeScript.
-   **Extensions:** To create a new extension, refer to `AvailableExtensions/README.md`.
