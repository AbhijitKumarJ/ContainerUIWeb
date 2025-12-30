import os
import shutil
import zipfile
import json
import time
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

router = APIRouter()

# Define paths (Relative to where main.py is executed, usually Backend/)
BASE_DIR = Path(os.getcwd())
EXTENSIONS_DIR = BASE_DIR / "extensions_storage"
WALLPAPERS_DIR = BASE_DIR / "wallpapers"
DOWNLOAD_DIR = BASE_DIR / "filetransfers" / "download"

# Ensure download directory exists
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

class ExportRequest(BaseModel):
    user_data: dict

@router.post("/export")
async def export_data(request: ExportRequest):
    try:
        timestamp = int(time.time())
        backup_filename = f"backup_{timestamp}"
        temp_dir = BASE_DIR / "temp_backup" / backup_filename
        
        # 1. Create temporary directory for staging
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        temp_dir.mkdir(parents=True, exist_ok=True)

        # 2. Save user_data.json
        user_data_path = temp_dir / "user_data.json"
        with open(user_data_path, "w", encoding="utf-8") as f:
            json.dump(request.user_data, f, indent=4)

        # 3. Copy Wallpapers
        if WALLPAPERS_DIR.exists():
            shutil.copytree(WALLPAPERS_DIR, temp_dir / "wallpapers")
        else:
            (temp_dir / "wallpapers").mkdir()

        # 4. Copy Extensions
        if EXTENSIONS_DIR.exists():
            shutil.copytree(EXTENSIONS_DIR, temp_dir / "extensions_storage")
        else:
            (temp_dir / "extensions_storage").mkdir()

        # 5. Create ZIP archive
        zip_path = DOWNLOAD_DIR / backup_filename # make_archive appends .zip automatically
        
        shutil.make_archive(str(zip_path), 'zip', temp_dir)
        
        # 6. Cleanup temp dir
        shutil.rmtree(BASE_DIR / "temp_backup")
        
        return {"filename": f"{backup_filename}.zip", "message": "Export successful"}

    except Exception as e:
        print(f"Export failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import")
async def import_data(file: UploadFile = File(...)):
    try:
        timestamp = int(time.time())
        restore_dir = BASE_DIR / "temp_restore" / f"restore_{timestamp}"
        
        if restore_dir.exists():
            shutil.rmtree(restore_dir)
        restore_dir.mkdir(parents=True, exist_ok=True)

        # 1. Save and Extract ZIP
        zip_path = restore_dir / "backup.zip"
        with open(zip_path, "wb") as f:
            f.write(await file.read())

        try:
            shutil.unpack_archive(zip_path, restore_dir, 'zip')
        except Exception as e:
            shutil.rmtree(restore_dir.parent)
            raise HTTPException(status_code=400, detail="Invalid backup file")

        # 2. Validate Structure
        user_data_file = restore_dir / "user_data.json"
        wallpapers_backup = restore_dir / "wallpapers"
        extensions_backup = restore_dir / "extensions_storage"

        if not user_data_file.exists():
            shutil.rmtree(restore_dir.parent)
            raise HTTPException(status_code=400, detail="Invalid backup: user_data.json missing")

        # 3. Restore Wallpapers (CLEAR existing and Copy new)
        if WALLPAPERS_DIR.exists():
            shutil.rmtree(WALLPAPERS_DIR)
        
        if wallpapers_backup.exists():
            shutil.copytree(wallpapers_backup, WALLPAPERS_DIR)
        else:
             WALLPAPERS_DIR.mkdir()

        # 4. Restore Extensions (CLEAR existing and Copy new)
        if EXTENSIONS_DIR.exists():
            shutil.rmtree(EXTENSIONS_DIR)
        
        if extensions_backup.exists():
            shutil.copytree(extensions_backup, EXTENSIONS_DIR)
        else:
            EXTENSIONS_DIR.mkdir()

        # 5. Read and Return User Data
        with open(user_data_file, "r", encoding="utf-8") as f:
            user_data = json.load(f)

        # 6. Cleanup
        shutil.rmtree(restore_dir.parent)

        return {"user_data": user_data, "message": "Import successful"}

    except Exception as e:
        print(f"Import failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
