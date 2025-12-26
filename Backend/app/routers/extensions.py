
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
import zipfile
import os
import shutil
import json
from pathlib import Path

router = APIRouter()

# Use relative path from where main.py is run, assuming main.py is in Backend/
EXT_DIR = Path("extensions_storage")
EXT_DIR.mkdir(exist_ok=True)

# Helper to mount static files (called from main.py)
def mount_extensions(app):
    app.mount("/extensions", StaticFiles(directory=EXT_DIR), name="extensions")

@router.post("/install")
async def install_extension(file: UploadFile = File(...)):
    # 1. Save Zip Temporarily
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    try:
        # 2. Inspect Zip for manifest.json
        with zipfile.ZipFile(temp_path, 'r') as zip_ref:
            if "manifest.json" not in zip_ref.namelist():
                raise HTTPException(status_code=400, detail="Missing manifest.json")
            
            # Read Manifest to get ID
            with zip_ref.open("manifest.json") as m:
                try:
                    manifest = json.load(m)
                    ext_id = manifest.get("id")
                except json.JSONDecodeError:
                    raise HTTPException(status_code=400, detail="Invalid manifest.json")
            
            if not ext_id:
                raise HTTPException(status_code=400, detail="Invalid Manifest: Missing ID")

            # 3. Extract to dedicated folder
            target_dir = EXT_DIR / ext_id
            if target_dir.exists():
                shutil.rmtree(target_dir) # Overwrite existing
            
            target_dir.mkdir(parents=True, exist_ok=True)
            zip_ref.extractall(target_dir)
            
            return {"success": True, "id": ext_id, "message": "Extension installed"}
            
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid Zip File")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("/list")
async def list_extensions():
    extensions = []
    # Scan folders
    if not EXT_DIR.exists():
        return []
        
    for item in EXT_DIR.iterdir():
        if item.is_dir() and (item / "manifest.json").exists():
            try:
                with open(item / "manifest.json", "r") as f:
                    data = json.load(f)
                    # Add execution URL
                    # Ensure entryPoint exists
                    entry_point = data.get('entryPoint', 'index.html')
                    data['url'] = f"/extensions/{item.name}/{entry_point}"
                    extensions.append(data)
            except:
                pass
    return extensions
