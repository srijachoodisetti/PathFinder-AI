import subprocess
import sys
import os
import time

def setup_backend(backend_dir):
    is_windows = sys.platform.startswith('win')
    venv_dir = os.path.join(backend_dir, "venv")
    
    # 1. Create virtual environment if it doesn't exist
    if not os.path.exists(venv_dir):
        print("[INFO] Virtual environment not found. Creating 'venv' inside backend/...")
        try:
            subprocess.run([sys.executable, "-m", "venv", "venv"], cwd=backend_dir, check=True)
            print("[SUCCESS] Virtual environment created successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to create virtual environment: {e}")
            sys.exit(1)
            
    # 2. Find Python executable inside venv
    if is_windows:
        python_exe = os.path.join(venv_dir, "Scripts", "python.exe")
    else:
        python_exe = os.path.join(venv_dir, "bin", "python")
        
    if not os.path.exists(python_exe):
        # Fallback if venv layout differs
        if is_windows:
            python_exe = os.path.join(venv_dir, "Scripts", "python")
        else:
            python_exe = os.path.join(venv_dir, "bin", "python3")
            
    # 3. Install requirements
    requirements_file = os.path.join(backend_dir, "requirements.txt")
    if os.path.exists(requirements_file):
        print("[INFO] Installing/verifying backend dependencies...")
        try:
            subprocess.run([python_exe, "-m", "pip", "install", "-r", "requirements.txt"], cwd=backend_dir, check=True)
            print("[SUCCESS] Backend dependencies updated successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to install backend dependencies: {e}")
            sys.exit(1)
    else:
        print("[WARNING] requirements.txt not found in backend/. Skipping dependency installation.")

def setup_frontend(frontend_dir):
    node_modules_dir = os.path.join(frontend_dir, "node_modules")
    
    # Check if node_modules exists
    if not os.path.exists(node_modules_dir):
        print("[INFO] Frontend node_modules not found. Running npm install...")
        is_windows = sys.platform.startswith('win')
        npm_cmd = "npm.cmd" if is_windows else "npm"
        try:
            subprocess.run([npm_cmd, "install"], cwd=frontend_dir, check=True)
            print("[SUCCESS] Frontend dependencies installed successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to install frontend dependencies: {e}")
            print("Please ensure you have Node.js and npm installed globally.")
            sys.exit(1)

def find_uvicorn(backend_dir):
    is_windows = sys.platform.startswith('win')
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
            
    # If not found inside venv, try to run python -m uvicorn
    return "venv_python"

def main():
    is_windows = sys.platform.startswith('win')
    backend_dir = os.path.abspath("backend")
    frontend_dir = os.path.abspath("frontend")
    
    print("*** Starting PathFinder AI Setup & Runner ***\n")
    
    # Perform startup validation/setup
    setup_backend(backend_dir)
    setup_frontend(frontend_dir)
    
    # Determine backend start command
    uvicorn_path = find_uvicorn(backend_dir)
    if uvicorn_path == "venv_python":
        python_exe = os.path.join(backend_dir, "venv", "Scripts", "python.exe") if is_windows else os.path.join(backend_dir, "venv", "bin", "python")
        backend_cmd = [python_exe, "-m", "uvicorn", "app.main:app", "--reload"]
    else:
        backend_cmd = [uvicorn_path, "app.main:app", "--reload"]
        
    # Determine frontend start command
    if is_windows:
        # Use cmd /c for executing npm scripts on Windows to avoid process termination issues
        frontend_cmd = ["cmd", "/c", "npm run dev"]
    else:
        frontend_cmd = ["npm", "run", "dev"]
        
    processes = []
    try:
        print("\n------------------------------------------------")
        print("[START] Launching Backend Server...")
        p_back = subprocess.Popen(backend_cmd, cwd=backend_dir)
        processes.append(p_back)
        
        # Give backend a moment to boot
        time.sleep(1.5)
        
        print("[START] Launching Frontend Vite Server...")
        p_front = subprocess.Popen(frontend_cmd, cwd=frontend_dir)
        processes.append(p_front)
        
        print("------------------------------------------------")
        print("Both servers are running concurrently!")
        print(" -> Frontend: http://localhost:5173")
        print(" -> Backend:  http://localhost:8000")
        print("\nPress Ctrl+C to terminate both servers.")
        print("------------------------------------------------\n")
        
        # Keep main process alive & monitor child processes
        while True:
            for p in processes:
                if p.poll() is not None:
                    # One of the processes stopped
                    print(f"\n[WARNING] Process terminated unexpectedly with exit code {p.returncode}")
                    raise KeyboardInterrupt
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n[STOP] Shutting down servers gracefully...")
        for p in processes:
            if p.poll() is None:
                p.terminate()
                
        # Wait for shutdown
        for p in processes:
            try:
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print("Force-killing persistent process...")
                p.kill()
                
        print("[SUCCESS] All services stopped.")

if __name__ == "__main__":
    main()
