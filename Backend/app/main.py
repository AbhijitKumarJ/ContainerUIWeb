from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
import os
from .routers import filesystem, terminal, processes
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(filesystem.router,prefix="/api/filesystem")
app.include_router(terminal.router,prefix="/api/terminal")
app.include_router(processes.router,prefix="/api/processes")

# Templates
# Ensure templates directory is correctly located relative to this file
templates_dir = os.path.join(os.path.dirname(__file__), "templates")
templates = Jinja2Templates(directory=templates_dir)

# Mount static files
# Angular build usually puts files in 'browser' subdirectory for 'application' builder
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(os.path.join(static_dir, "browser")):
    static_dir = os.path.join(static_dir, "browser")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    # Also mount root to static for other assets if needed, but primarily we want to serve index.html
    # We can use a catch-all for SPA, but explicit mount for assets is good.
    # Actually, simpler: mount / to static, but that overrides API.
    # Standard pattern:
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="angular")

@app.get("/jinjaindex", response_class=HTMLResponse)
async def read_jinja_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "title": "FastAPI Backend", "message": "Hello World from Jinja2!"})

