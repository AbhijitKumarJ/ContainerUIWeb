#!/usr/bin/env python3
"""
Test script to demonstrate checking for manifest.json in ZIP files
"""
import zipfile
import os
from pathlib import Path

def has_manifest_json(zip_path: str) -> bool:
    """
    Check if 'manifest.json' exists anywhere in a ZIP file.
    
    Args:
        zip_path (str): Path to the ZIP file.
    
    Returns:
        bool: True if 'manifest.json' is found, False otherwise.
    """
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # Method 1: Using namelist() - this is the standard way
            file_list = zip_ref.namelist()
            print(f"Files in ZIP: {file_list}")
            return any(name.endswith("manifest.json") for name in file_list)
    except zipfile.BadZipFile:
        print(f"Error: {zip_path} is not a valid ZIP file")
        return False

def has_manifest_json_alternative(zip_path: str) -> bool:
    """
    Alternative method using ZipFile.infolist() if namelist() has issues
    """
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # Method 2: Using infolist() and checking filenames
            for info in zip_ref.infolist():
                if info.filename.endswith("manifest.json"):
                    return True
            return False
    except zipfile.BadZipFile:
        print(f"Error: {zip_path} is not a valid ZIP file")
        return False

def test_with_sample_extension():
    """Test with the sample extension ZIP"""
    sample_zip = "../AvailableExtensions/sample_extension.zip"
    
    if os.path.exists(sample_zip):
        print(f"Testing {sample_zip}:")
        result1 = has_manifest_json(sample_zip)
        print(f"Method 1 (namelist): {result1}")
        
        result2 = has_manifest_json_alternative(sample_zip)
        print(f"Method 2 (infolist): {result2}")
    else:
        print(f"ZIP file not found: {sample_zip}")

if __name__ == "__main__":
    test_with_sample_extension()