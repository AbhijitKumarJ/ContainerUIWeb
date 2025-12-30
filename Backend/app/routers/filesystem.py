from fastapi import APIRouter
from fastapi.responses import FileResponse
import os
from datetime import datetime
from ..models.file_node import FileNode
from dotenv import load_dotenv
import platform
#load_dotenv() for default directory path based on os
load_dotenv()

router = APIRouter()

def handlepathquirks(path:str):
    
    if platform.system() != 'Windows':
        # On non-Windows systems, replace double backslashes with single ones
        path = path.replace('\\', '/').replace('//','/')
    return path


@router.get("/getfolderstructure")
async def getfolderstructure(directory: str = ""):
    print('Backend called getfolderstructure: directory = ' + directory)
    if directory == "":
        directory = os.getenv("DEFAULT_DIRECTORY")
    # Handle double backslashes for non-Windows systems

    directory = handlepathquirks(directory)
    print(directory)
    
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

@router.get("/getfileproperties")
async def getfileproperties(path: str, type: str = "file"):
    try:
        print('Backend called getfileproperties: path = ' + path)
        print('Backend called getfileproperties: type = ' + type)
                
        path = handlepathquirks(path)
        print(path)

        if not os.path.exists(path):
            return {"error": "Path does not exist"}
        
        stat = os.stat(path)
        
        # Basic properties
        properties = {
            "name": os.path.basename(path),
            "path": os.path.abspath(path),
            "parent": os.path.dirname(path),
            "size": stat.st_size,
            "created": datetime.fromtimestamp(stat.st_ctime),
            "modified": datetime.fromtimestamp(stat.st_mtime),
            "accessed": datetime.fromtimestamp(stat.st_atime),
        }
        
        # Type specific checks if needed, but os.stat covers most
        if os.path.isdir(path):
            properties["type"] = "folder"
            # Optional: Count children? Might be slow for large folders.
            # Let's keep it simple for now.
        else:
            properties["type"] = "file"
            # Optional: Get extension?
            _, ext = os.path.splitext(path)
            properties["extension"] = ext

        return properties

    except Exception as e:
        return {"error": str(e)}

@router.get("/readfile")
async def readfile(path: str):
    try:
        print('Backend called readfile: path = ' + path)

        path = handlepathquirks(path)
        print(path)

        if not os.path.exists(path):
            return {"error": "File does not exist"}
        
        if not os.path.isfile(path):
            return {"error": "Path is not a file"}

        # Basic text reading for now. 
        # In a real app we'd handle encoding detection or binary files.
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {"content": content}

    except Exception as e:
        return {"error": str(e)}

@router.get("/serve")
async def serve_file(path: str):
    try:
        print('Backend called serve_file: path = ' + path)
        path = handlepathquirks(path)
        print(path)

        if not os.path.exists(path):
            return {"error": "File does not exist"}
        
        if not os.path.isfile(path):
            return {"error": "Path is not a file"}

        return FileResponse(path)

    except Exception as e:
        return {"error": str(e)}

from pydantic import BaseModel

class WriteFileRequest(BaseModel):
    path: str
    content: str

@router.post("/writefile")
async def writefile(request: WriteFileRequest):
    try:
        print('Backend called writefile: request.path = ' + request.path)

        request.path = handlepathquirks(request.path)
        print(request.path)

        # Check if directory exists
        directory = os.path.dirname(request.path)
        if not os.path.exists(directory):
             return {"error": "Parent directory does not exist"}

        with open(request.path, 'w', encoding='utf-8') as f:
            f.write(request.content)
        
        return {"success": True, "path": request.path}

    except Exception as e:
        return {"error": str(e)}

import shutil

class CreateItemRequest(BaseModel):
    path: str
    type: str # 'file' or 'folder'

class CopyMoveRequest(BaseModel):
    source: str
    destination: str

@router.post("/create")
async def create_item(request: CreateItemRequest):
    try:
        print('Backend called create_item: request.path = ' + request.path)

        request.path = handlepathquirks(request.path)
        print(request.path)

        if os.path.exists(request.path):
             return {"error": "Item already exists"}

        if request.type == 'folder':
            os.makedirs(request.path)
        else:
            with open(request.path, 'w') as f:
                pass # Create empty file
        
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/delete")
async def delete_item(path: str):
    try:
        print('Backend called delete_item: path = ' + path)

        path = handlepathquirks(path)
        print(path)

        if not os.path.exists(path):
            return {"error": "Path does not exist"}
        
        if os.path.isfile(path):
            os.remove(path)
        else:
            shutil.rmtree(path)
            
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}

@router.post("/copy")
async def copy_item(request: CopyMoveRequest):
    try:
        print('Backend called copy_item: request.source = ' + request.source)
        print('Backend called copy_item: request.destination = ' + request.destination)
        
        request.source = handlepathquirks(request.source)
        request.destination = handlepathquirks(request.destination)
        
        print(request.source)
        print(request.destination)

        if not os.path.exists(request.source):
             return {"error": "Source does not exist"}
        
        if os.path.exists(request.destination):
             return {"error": "Destination already exists"}

        if os.path.isdir(request.source):
            shutil.copytree(request.source, request.destination)
        else:
            shutil.copy2(request.source, request.destination)

        return {"success": True}
    except Exception as e:
        return {"error": str(e)}

import base64

class SaveImageRequest(BaseModel):
    path: str
    image_data: str # Base64 encoded

@router.post("/save_image")
async def save_image(request: SaveImageRequest):
    try:
        print('Backend called save_image: request.path = ' + request.path)
        request.path = handlepathquirks(request.path)
        print(request.path)

        # Remove header if present (e.g., "data:image/png;base64,")
        if ',' in request.image_data:
            header, encoded = request.image_data.split(',', 1)
        else:
            encoded = request.image_data
            
        data = base64.b64decode(encoded)

        with open(request.path, 'wb') as f:
            f.write(data)
        
        return {"success": True, "path": request.path}

    except Exception as e:
        print(f"Error saving image: {e}")
        return {"error": str(e)}

@router.post("/move")
async def move_item(request: CopyMoveRequest):
    try:
        print('Backend called move_item: request.source = ' + request.source)
        print('Backend called move_item: request.destination = ' + request.destination)
        
        request.source = handlepathquirks(request.source)
        print(request.source)
        
        request.destination = handlepathquirks(request.destination)
        print(request.destination)

        if not os.path.exists(request.source):
             return {"error": "Source does not exist"}
             
        if os.path.exists(request.destination):
             return {"error": "Destination already exists"}

        shutil.move(request.source, request.destination)
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}
class CompressRequest(BaseModel):
    path: str

@router.post("/compress")
async def compress_item(request: CompressRequest):
    try:
        print('Backend called compress_item: request.path = ' + request.path)
        
        request.path = handlepathquirks(request.path)
        print(request.path)

        if not os.path.exists(request.path):
             return {"error": "Path does not exist"}
        
        if not os.path.isdir(request.path):
             return {"error": "Path is not a directory"}

        # Define output filename (sibling to the directory)
        base_name = request.path
        root_dir = os.path.dirname(request.path)
        base_dir = os.path.basename(request.path)

        shutil.make_archive(base_name, 'zip', root_dir, base_dir)
        
        return {"success": True, "path": base_name + ".zip"}
    except Exception as e:
        return {"error": str(e)}

@router.post("/decompress")
async def decompress_item(request: CompressRequest):
    try:
        print('Backend called decompress_item: request.path = ' + request.path)
        
        request.path = handlepathquirks(request.path)
        print(request.path)

        if not os.path.exists(request.path):
             return {"error": "Path does not exist"}
        
        if not os.path.isfile(request.path):
             return {"error": "Path is not a file"}
        
        if not request.path.lower().endswith('.zip'):
             return {"error": "File is not a zip archive"}

        # Define output directory (directory with same name as zip)
        base_name = os.path.splitext(request.path)[0]
        
        shutil.unpack_archive(request.path, base_name, 'zip')
        
        return {"success": True, "path": base_name}
    except Exception as e:
        return {"error": str(e)}
