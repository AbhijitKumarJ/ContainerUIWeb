from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import shutil
from typing import List
from pydantic import BaseModel

router = APIRouter()

# Define the local path where wallpapers are stored
# This assumes the directory 'wallpapers' is in the backend root
WALLPAPERS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "wallpapers")
# Ensure directory exists
if not os.path.exists(WALLPAPERS_DIR):
    os.makedirs(WALLPAPERS_DIR)

class AddWallpaperRequest(BaseModel):
    path: str

@router.get("/list")
async def list_wallpapers():
    """List all available wallpapers in the wallpapers directory."""
    try:
        wallpapers = []
        if os.path.exists(WALLPAPERS_DIR):
            for filename in os.listdir(WALLPAPERS_DIR):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
                    # Return the URL path relative to the mount point /wallpapers
                    wallpapers.append(f"/wallpapers/{filename}")
        return {"wallpapers": wallpapers}
    except Exception as e:
        return {"error": str(e)}

@router.post("/upload")
async def upload_wallpaper(file: UploadFile = File(...)):
    """Upload a wallpaper file directly."""
    try:
        file_location = os.path.join(WALLPAPERS_DIR, file.filename)
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        return {"filename": file.filename, "url": f"/wallpapers/{file.filename}"}
    except Exception as e:
        return {"error": str(e)}

@router.post("/add")
async def add_wallpaper(request: AddWallpaperRequest):
    """Copy a wallpaper from a local container path to the wallpapers directory."""
    try:
        source_path = request.path
        # Handle path quirks if necessary (similar to filesystem router)
        # For now assume the path is correct or simple
        
        if not os.path.exists(source_path):
            raise HTTPException(status_code=404, detail="Source file not found")
            
        filename = os.path.basename(source_path)
        destination_path = os.path.join(WALLPAPERS_DIR, filename)
        
        # Avoid overwriting or handle naming collisions?
        # For simplicity, we overwrite or just copy
        shutil.copy2(source_path, destination_path)
        
        return {"success": True, "url": f"/wallpapers/{filename}"}
    except Exception as e:
        return {"error": str(e)}
