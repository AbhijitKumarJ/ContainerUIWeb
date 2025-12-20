from fastapi import APIRouter
import os
from datetime import datetime
from ..models.file_node import FileNode
from dotenv import load_dotenv

#load_dotenv() for default directory path based on os
load_dotenv()

router = APIRouter()

@router.get("/getfolderstructure")
async def getfolderstructure(directory: str = ""):
    if directory == "":
        directory = os.getenv("DEFAULT_DIRECTORY")
    # Handle double backslashes for non-Windows systems
    import platform
    if platform.system() != 'Windows':
        # On non-Windows systems, replace double backslashes with single ones
        directory = directory.replace('\\', '/').replace('//','/')
    
    # Then normalize the path
    #directory = os.path.normpath(directory)
    # get actual files and folders inside directory
    nodes = []
    try:
        # Check if directory exists to avoid errors on bad input
        if os.path.exists(directory) and os.path.isdir(directory):
            for entry in os.scandir(directory):
                try:
                    stat = entry.stat()
                    nodes.append(FileNode(
                        name=entry.name,
                        type="folder" if entry.is_dir() else "file",
                        size=stat.st_size,
                        modified=datetime.fromtimestamp(stat.st_mtime)
                    ))
                except OSError:
                    # Skip files we can't access
                    continue
    except Exception as e:
        print(f"Error accessing directory {directory}: {e}")
        return {"files": [], "directory": directory, "error": str(e)}

    return {"files": nodes, "directory": os.path.abspath(directory)}
