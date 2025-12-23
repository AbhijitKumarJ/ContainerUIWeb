from fastapi import APIRouter
import psutil
from typing import List, Dict, Any

router = APIRouter()

@router.get("/list")
async def list_processes():
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_info']):
        try:
            pinfo = proc.info
            # memory_info returns a named tuple, convert to dict or access field
            # rss is Resident Set Size (memory usage)
            mem_bytes = pinfo['memory_info'].rss if pinfo['memory_info'] else 0
            
            processes.append({
                "pid": pinfo['pid'],
                "name": pinfo['name'],
                "username": pinfo['username'],
                "cpu_percent": pinfo['cpu_percent'],
                "memory_bytes": mem_bytes
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    
    # Sort by cpu usage desc
    processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
    return processes
