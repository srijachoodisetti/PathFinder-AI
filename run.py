import subprocess
import sys
import os
import time

def setup_backend(backend_dir):
    is_windows = sys.platform.startswith('win')
    venv_dir = os.path.join(backend_dir, "venv")
    
    # Check if we are running in Render or production environments
    if os.environ.get("RENDER") or os.environ.get("PRODUCTION"):
        print("[INFO] Running in Render/production environment. Skipping local virtualenv setup.")
        return

    # Create virtual environment if it doesn't exist (useful for local development)
    if not os.path.exists(venv_dir):
        print("[INFO] Virtual environment not found. Creating 'venv' inside backend/...")
        try:
            subprocess.run([sys.executable, "-m", "venv", "venv"], cwd=backend_dir, check=True)
            print("[SUCCESS] Virtual environment created successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to create virtual environment: {e}")
            sys.exit(1)
            
    # Find Python executable inside venv
    if is_windows:
        python_exe = os.path.join(venv_dir, "Scripts", "python.exe")
    else:
        python_exe = os.path.join(venv_dir, "bin", "python")
        
    if not os.path.exists(python_exe):
        if is_windows:
            python_exe = os.path.join(venv_dir, "Scripts", "python")
        else:
            python_exe = os.path.join(venv_dir, "bin", "python3")
            
    # Install requirements
    requirements_file = os.path.join(backend_dir, "requirements.txt")
    if os.path.exists(requirements_file):
        print("[INFO] Installing/verifying backend dependencies...")
        try:
            subprocess.run([python_exe, "-m", "pip", "install", "-r", "requirements.txt"], cwd=backend_dir, check=True)
            print("[SUCCESS] Backend dependencies updated successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to install backend dependencies: {e}")
            sys.exit(1)

def find_uvicorn(backend_dir):
    is_windows = sys.platform.startswith('win')
    
    # In Render or production, rely on system PATH uvicorn
    if os.environ.get("RENDER") or os.environ.get("PRODUCTION"):
        return "uvicorn"
        
    if is_windows:
        paths = [
            os.path.join(backend_dir, "venv", "Scripts", "uvicorn.exe"),
            os.path.join(backend_dir, "venv", "Scripts", "uvicorn"),
        ]
    else:
        paths = [
            os.path.join(backend_dir, "venv", "bin", "uvicorn"),
        ]
        
    for path in paths:
        if os.path.exists(path):
            return path
            
    return "uvicorn"

def main():
    backend_dir = os.path.abspath("backend")
    
    print("*** Starting PathFinder AI Backend Runner ***\n")
    
    # Perform startup validation/setup
    setup_backend(backend_dir)
    
    # Resolve host and port dynamically
    host = "0.0.0.0"
    port = int(os.environ.get("PORT", 8000))
    
    # Determine backend start command
    uvicorn_path = find_uvicorn(backend_dir)
    
    if uvicorn_path == "uvicorn":
        backend_cmd = ["uvicorn", "app.main:app", "--host", host, "--port", str(port)]
    else:
        backend_cmd = [uvicorn_path, "app.main:app", "--host", host, "--port", str(port)]
        
    print(f"[START] Launching Backend Server on {host}:{port}...")
    try:
        p_back = subprocess.Popen(backend_cmd, cwd=backend_dir)
        
        # Keep main process alive & monitor child process
        while True:
            if p_back.poll() is not None:
                print(f"\n[WARNING] Backend terminated with exit code {p_back.returncode}")
                sys.exit(p_back.returncode)
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n[STOP] Shutting down backend gracefully...")
        if p_back.poll() is None:
            p_back.terminate()
            try:
                p_back.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print("Force-killing backend process...")
                p_back.kill()
        print("[SUCCESS] Backend stopped.")

if __name__ == "__main__":
    main()
