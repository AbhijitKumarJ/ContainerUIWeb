from fastapi import APIRouter
from pydantic import BaseModel
import subprocess
import os

router = APIRouter()

class TerminalCommand(BaseModel):
    command: str
    cwd: str = None

@router.post("/execute_command")
async def execute_command(cmd: TerminalCommand):
    try:
        working_dir = cmd.cwd if cmd.cwd and os.path.exists(cmd.cwd) else os.getcwd()
        
        # Use shell=True to allow shell commands like 'dir', 'cd', etc.
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
