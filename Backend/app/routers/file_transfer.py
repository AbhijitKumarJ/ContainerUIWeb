import os
import shutil
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(
    tags=["file-transfer"]
)

# Define base paths relative to the application execution directory
BASE_DIR = Path(os.getcwd())
UPLOAD_DIR = BASE_DIR / "filetransfers" / "upload"
DOWNLOAD_DIR = BASE_DIR / "filetransfers" / "download"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename, "message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files/{type}", response_model=List[str])
async def list_files(type: str):
    if type == "upload":
        target_dir = UPLOAD_DIR
    elif type == "download":
        target_dir = DOWNLOAD_DIR
    else:
        raise HTTPException(status_code=400, detail="Invalid file type. Must be 'upload' or 'download'.")
    
    try:
        files = [f for f in os.listdir(target_dir) if os.path.isfile(target_dir / f)]
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{filename}")
async def download_file(filename: str):
    file_path = DOWNLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')

@router.delete("/files/{type}/{filename}")
async def delete_file(type: str, filename: str):
    if type == "upload":
        target_dir = UPLOAD_DIR
    elif type == "download":
        target_dir = DOWNLOAD_DIR
    else:
        raise HTTPException(status_code=400, detail="Invalid file type. Must be 'upload' or 'download'.")
    
    file_path = target_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
