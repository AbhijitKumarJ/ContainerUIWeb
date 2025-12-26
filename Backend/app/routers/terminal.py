from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import os
import sys
import asyncio
import platform
import subprocess
from dotenv import load_dotenv

load_dotenv()

# Conditional import for Cross-Platform PTY
if platform.system() == "Windows":
    from winpty import PtyProcess
else:
    import pty
    import select
    import fcntl
    import struct
    import termios

router = APIRouter()

# --- Legacy Models ---
class TerminalCommand(BaseModel):
    command: str
    cwd: str = None

class ChangeDirectoryRequest(BaseModel):
    target_path: str
    current_cwd: str

# --- WebSocket Endpoint (Advanced Terminal) ---
@router.websocket("/ws")
async def terminal_websocket(websocket: WebSocket):
    await websocket.accept()
    
    # 1. Determine Shell
    shell = "powershell.exe" if platform.system() == "Windows" else "bash"
    
    try:
        if platform.system() == "Windows":
            # --- WINDOWS IMPLEMENTATION (pywinpty) ---
            proc = PtyProcess.spawn(shell)
            
            async def read_from_pty():
                while proc.isalive():
                    # Blocking read, run in thread
                    # pywinpty read returns a string
                    output = await asyncio.to_thread(proc.read, 1024)
                    await websocket.send_text(output)

            async def write_to_pty():
                try:
                    while True:
                        data = await websocket.receive_text()
                        # Handle resize event (custom protocol)
                        if data.startswith("__RESIZE__"):
                            parts = data.split(":")
                            if len(parts) == 3:
                                _, cols, rows = parts
                                proc.setwinsize(int(rows), int(cols))
                        else:
                            proc.write(data)
                except WebSocketDisconnect:
                    if proc.isalive():
                        proc.terminate()

            # Run Read/Write loops concurrently
            # Note: We need to handle potential cancellation if one task fails
            await asyncio.gather(read_from_pty(), write_to_pty())

        else:
            # --- LINUX IMPLEMENTATION (native pty) ---
            # Create a pseudo-terminal
            master_fd, slave_fd = pty.openpty()
            
            proc = subprocess.Popen(
                [shell], 
                preexec_fn=os.setsid, 
                stdin=slave_fd, 
                stdout=slave_fd, 
                stderr=slave_fd, 
                universal_newlines=False # Binary mode ensures raw bytes
            )
            
            async def read_from_pty():
                while True:
                    await asyncio.sleep(0.01) # Prevent tight loop
                    # Check if data is available to read
                    r, _, _ = select.select([master_fd], [], [], 0)
                    if master_fd in r:
                        output = os.read(master_fd, 10240) # Read raw bytes
                        if not output: break
                        await websocket.send_text(output.decode(errors='ignore'))
                    
                    if proc.poll() is not None: break

            async def write_to_pty():
                try:
                    while True:
                        data = await websocket.receive_text()
                        if data.startswith("__RESIZE__"):
                            # Handle Linux Resize (ioctl)
                            parts = data.split(":")
                            if len(parts) == 3:
                                _, cols, rows = parts
                                winsize = struct.pack("HHHH", int(rows), int(cols), 0, 0)
                                fcntl.ioctl(master_fd, termios.TIOCSWINSZ, winsize)
                        else:
                            os.write(master_fd, data.encode())
                except WebSocketDisconnect:
                    proc.kill()
            
            await asyncio.gather(read_from_pty(), write_to_pty())

    except Exception as e:
        print(f"Terminal Error: {e}")
        try:
             await websocket.close()
        except:
            pass

# --- Legacy Endpoints (For compatibility/Testing) ---

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
