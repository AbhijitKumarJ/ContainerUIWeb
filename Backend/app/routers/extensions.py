
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
            file_list = zip_ref.namelist()
            print(f"Files in ZIP: {file_list}")
            
            # Find manifest.json file (could be in a subfolder)
            manifest_path = None
            for name in file_list:
                if "manifest.json" in name:
                    manifest_path = name
                    break
                    
            if manifest_path is None:
                raise HTTPException(status_code=400, detail="Missing manifest.json")
            
            # Read Manifest to get ID
            with zip_ref.open(manifest_path) as m:
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
    print('Extension directory: ' + EXT_DIR._str)
    # Scan folders
    if not EXT_DIR.exists():
        print(' not exist')
        return []
        
    for item in EXT_DIR.iterdir():
        print(item)
        print(item.is_dir())
        if item.is_dir():
            print(f"Contents of {item.name}:")
            for subitem in item.rglob('*'):
                if subitem.is_file():
                    print(f"  File: {subitem.relative_to(item)}")
            
            # Find manifest.json file recursively within the extension directory
            manifest_files = list(item.rglob('manifest.json'))
            if manifest_files:
                manifest_path = manifest_files[0]  # Use the first manifest.json found
                try:
                    print(f"       Found manifest at: {manifest_path}")
                    with open(manifest_path, "r") as f:
                        data = json.load(f)
                        # Add execution URL
                        # Ensure entryPoint exists
                        entry_point = data.get('entryPoint', 'index.html')
                        
                        # Find the corresponding entry point file
                        entry_files = list(item.rglob(entry_point))
                        if entry_files:
                            entry_file_path = entry_files[0]
                            relative_path = entry_file_path.relative_to(item)
                            data['url'] = f"/extensions/{item.name}/{relative_path}"
                        else:
                            # Fallback to the original logic
                            data['url'] = f"/extensions/{item.name}/{entry_point}"
                        
                        extensions.append(data)
                except Exception as e:
                    print(f"Error processing extension {item.name}: {str(e)}")
            else:
                print(f"       No manifest.json found in {item.name}")
    return extensions

@router.delete("/{ext_id}")
async def uninstall_extension(ext_id: str):
    target_dir = EXT_DIR / ext_id
    if not target_dir.exists():
        raise HTTPException(status_code=404, detail="Extension not found")
    
    try:
        if target_dir.is_dir():
            shutil.rmtree(target_dir)
        else:
            # Should be a directory, but handle file case just in case
            if target_dir.is_file(): # pragma: no cover
                os.remove(target_dir)
        
        return {"success": True, "message": f"Extension {ext_id} uninstalled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

