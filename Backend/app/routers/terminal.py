from fastapi import APIRouter
from pydantic import BaseModel
import subprocess
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class TerminalCommand(BaseModel):
    command: str
    cwd: str = None

class ChangeDirectoryRequest(BaseModel):
    target_path: str
    current_cwd: str

@router.get("/init")
async def init_terminal():
    default_dir = os.getenv("DEFAULT_DIRECTORY", os.getcwd())
    if not os.path.exists(default_dir):
        default_dir = os.getcwd() # Fallback
    
    import platform
    return {
        "cwd": default_dir,
        "os_type": platform.system().lower(),
        "path_sep": os.sep
    }

@router.post("/cd")
async def change_directory(req: ChangeDirectoryRequest):
    try:
        # Resolve path
        # If target_path is absolute, use it. If relative, join with current_cwd
        if os.path.isabs(req.target_path):
            new_path = os.path.normpath(req.target_path)
        else:
            new_path = os.path.normpath(os.path.join(req.current_cwd, req.target_path))
        
        if os.path.exists(new_path) and os.path.isdir(new_path):
            return {"success": True, "cwd": new_path}
        else:
            return {"success": False, "error": f"Directory not found: {req.target_path}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/execute_command")
async def execute_command(cmd: TerminalCommand):
    try:
        working_dir = cmd.cwd if cmd.cwd and os.path.exists(cmd.cwd) else os.getcwd()
        
        # Use shell=True to allow shell commands
        # Capture output
        result = subprocess.run(
            cmd.command, 
            cwd=working_dir, 
            shell=True, 
            capture_output=True, 
            text=True
        )
        
        return {
            "output": result.stdout,
            "error": result.stderr,
            "cwd": working_dir,
            "exit_code": result.returncode
        }
    except Exception as e:
        return {"error": str(e)}

