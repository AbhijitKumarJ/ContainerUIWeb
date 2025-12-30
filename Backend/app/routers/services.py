from fastapi import APIRouter, HTTPException
import psutil
import platform
import subprocess
import shutil
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class ServiceInfo(BaseModel):
    name: str
    display_name: str
    status: str

def get_linux_init_system():
    if shutil.which("systemctl"):
        return "systemd"
    if shutil.which("rc-service"):
        return "openrc"
    if shutil.which("service"):
        return "sysvinit"
    return "unknown"

def list_services_linux():
    services = []
    init_sys = get_linux_init_system()
    
    try:
        if init_sys == "systemd":
            # List all services
            full_output = subprocess.check_output(["systemctl", "list-units", "--type=service", "--all", "--no-pager", "--plain"], text=True)
            for line in full_output.splitlines():
                parts = line.split()
                if len(parts) >= 4 and parts[0].endswith('.service'):
                    name = parts[0].replace('.service', '')
                    # systemctl format: UNIT LOAD ACTIVE SUB DESCRIPTION
                    status = "running" if parts[2] == "active" else "stopped" 
                    display_name = " ".join(parts[4:]) if len(parts) > 4 else name
                    services.append(ServiceInfo(name=name, display_name=display_name, status=status))

        elif init_sys == "openrc":
            output = subprocess.check_output(["rc-status", "-a"], text=True)
            for line in output.splitlines():
                parts = line.split()
                if len(parts) >= 2:
                    name = parts[0]
                    status = parts[-1].lower().replace('[', '').replace(']', '')
                    # Normalize status
                    if "started" in status: status = "running"
                    if "stopped" in status: status = "stopped"
                    services.append(ServiceInfo(name=name, display_name=name, status=status))

        elif init_sys == "sysvinit":
             output = subprocess.check_output(["service", "--status-all"], text=True)
             for line in output.splitlines():
                 # [ + ]  service_name
                 # [ - ]  service_name
                 parts = line.split()
                 if len(parts) >= 4:
                     status_sym = parts[1]
                     name = parts[3]
                     status = "running" if status_sym == "+" else "stopped"
                     services.append(ServiceInfo(name=name, display_name=name, status=status))
    except Exception as e:
        print(f"Error listing linux services: {e}")
        
    return services

def run_linux_command(service_name: str, action: str):
    init_sys = get_linux_init_system()
    cmd = []
    
    if init_sys == "systemd":
        cmd = ["sudo", "systemctl", action, service_name]
    elif init_sys == "openrc":
        cmd = ["sudo", "rc-service", service_name, action]
    elif init_sys == "sysvinit":
        cmd = ["sudo", "service", service_name, action]
    else:
        raise HTTPException(status_code=500, detail="Unsupported Linux init system")

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to {action} service: {e}")

@router.get("/list", response_model=List[ServiceInfo])
async def list_services():
    system = platform.system()
    services = []
    
    if system == "Windows":
        print("Listing Windows services...")
        try:
            for service in psutil.win_service_iter():
                try:
                    info = service.as_dict(attrs=['name', 'display_name', 'status'])
                    services.append(ServiceInfo(
                        name=info['name'], 
                        display_name=info['display_name'] or info['name'], 
                        status=info['status']
                    ))
                except psutil.NoSuchProcess:
                    continue
                except psutil.AccessDenied:
                    continue
        except Exception as e:
            print(f"Error listing windows services: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to list windows services: {e}")
             
    elif system == "Linux":
        print("Listing Linux services...")
        services = list_services_linux()
        
    return services

@router.post("/start/{name}")
async def start_service(name: str):
    system = platform.system()
    if system == "Windows":
        try:
            service = psutil.win_service_get(name)
            service.start()
        except psutil.NoSuchProcess:
            raise HTTPException(status_code=404, detail="Service not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to start service: {e}")
    elif system == "Linux":
        run_linux_command(name, "start")
    return {"status": "success", "message": f"Service {name} started"}

@router.post("/stop/{name}")
async def stop_service(name: str):
    system = platform.system()
    if system == "Windows":
        try:
            service = psutil.win_service_get(name)
            service.stop()
        except psutil.NoSuchProcess:
            raise HTTPException(status_code=404, detail="Service not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to stop service: {e}")
    elif system == "Linux":
        run_linux_command(name, "stop")
    return {"status": "success", "message": f"Service {name} stopped"}

@router.post("/restart/{name}")
async def restart_service(name: str):
    system = platform.system()
    if system == "Windows":
        try:
            service = psutil.win_service_get(name)
            service.restart()
        except psutil.NoSuchProcess:
            raise HTTPException(status_code=404, detail="Service not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to restart service: {e}")
    elif system == "Linux":
        run_linux_command(name, "restart")
    return {"status": "success", "message": f"Service {name} restarted"}
