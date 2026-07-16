import sys
import os
import subprocess
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

def main():
    backend_dir = os.path.abspath("backend")
    is_windows = sys.platform.startswith('win')
    
    # Check if we are running in Render or production environments
    is_prod = os.environ.get("RENDER") or os.environ.get("PRODUCTION")
    
    print("*** Starting PathFinder AI Backend Runner ***\n")
    
    # Perform startup validation/setup (local dev only)
    setup_backend(backend_dir)
    
    # Self-healing venv re-execution for local development
    if not is_prod:
        # Determine the virtual environment python path
        if is_windows:
            venv_python = os.path.abspath(os.path.join(backend_dir, "venv", "Scripts", "python.exe"))
            if not os.path.exists(venv_python):
                venv_python = os.path.abspath(os.path.join(backend_dir, "venv", "Scripts", "python"))
        else:
            venv_python = os.path.abspath(os.path.join(backend_dir, "venv", "bin", "python"))
            
        current_python = os.path.abspath(sys.executable)
        
        # If virtual environment Python exists and we aren't currently running it, re-execute the script
        if os.path.exists(venv_python) and current_python != venv_python:
            print(f"[INFO] Re-executing runner with virtual environment python: {venv_python}")
            try:
                rc = subprocess.call([venv_python] + sys.argv)
                sys.exit(rc)
            except KeyboardInterrupt:
                sys.exit(0)
            except Exception as e:
                print(f"[ERROR] Failed to re-execute with virtual environment python: {e}")
                sys.exit(1)
                
    # Resolve host and port dynamically
    host = "0.0.0.0"
    port = int(os.environ.get("PORT", 8000))
    
    # Change current working directory to backend so Uvicorn resolves app imports cleanly
    os.chdir(backend_dir)
    sys.path.insert(0, backend_dir)
    
    # Add backend to PYTHONPATH env var so Uvicorn child processes inherit the search path
    os.environ["PYTHONPATH"] = backend_dir + os.pathsep + os.environ.get("PYTHONPATH", "")
    
    # Determine if we should enable reload (disable on production/Render)
    reload = not is_prod
    
    print(f"[START] Launching Backend Server on {host}:{port} (reload={reload})...")
    
    # Import uvicorn at runtime to verify it is installed
    try:
        import uvicorn
    except ImportError:
        print("[ERROR] uvicorn is not installed. Please run: pip install -r backend/requirements.txt")
        sys.exit(1)
        
    # Start Uvicorn programmatically in the current process
    try:
        uvicorn.run("app.main:app", host=host, port=port, reload=reload)
    except KeyboardInterrupt:
        print("\n[STOP] Backend stopped.")

if __name__ == "__main__":
    main()
