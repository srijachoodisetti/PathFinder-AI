"""
PathFinder AI — Unified Start Script
Handles both local development and Render production environments.

Usage:
  Local dev:    python run.py
  Production:   (Render uses uvicorn directly via startCommand in render.yaml)
"""
import sys
import os
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).parent.resolve()
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

IS_PROD = os.environ.get("RENDER") or os.environ.get("PRODUCTION", "").lower() == "true"
IS_WINDOWS = sys.platform.startswith("win")


def build_frontend():
    """Build the React frontend into frontend/dist/"""
    dist = FRONTEND_DIR / "dist"
    if dist.exists():
        print("[PathFinder] Frontend already built. Skipping build.")
        return True

    print("[PathFinder] Building React frontend...")
    try:
        subprocess.run(["npm", "install"], cwd=str(FRONTEND_DIR), check=True,
                       shell=IS_WINDOWS)
        subprocess.run(["npm", "run", "build"], cwd=str(FRONTEND_DIR), check=True,
                       shell=IS_WINDOWS)
        print("[PathFinder] ✓ Frontend built successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[PathFinder] ⚠ Frontend build failed: {e}")
        print("[PathFinder] Continuing without frontend (API-only mode).")
        return False


def setup_venv():
    """Set up virtualenv and install requirements for local dev."""
    venv_dir = BACKEND_DIR / "venv"
    if IS_WINDOWS:
        python_exe = venv_dir / "Scripts" / "python.exe"
        pip_exe = venv_dir / "Scripts" / "pip.exe"
    else:
        python_exe = venv_dir / "bin" / "python"
        pip_exe = venv_dir / "bin" / "pip"

    if not venv_dir.exists():
        print("[PathFinder] Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], check=True)

    if not python_exe.exists():
        return sys.executable

    print("[PathFinder] Installing backend requirements...")
    subprocess.run([str(pip_exe), "install", "-r", str(BACKEND_DIR / "requirements.txt"),
                    "--quiet"], check=True)
    return str(python_exe)


def main():
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"

    print("=" * 50)
    print("  PathFinder AI — Starting...")
    print("=" * 50)

    if IS_PROD:
        # Production: frontend built by build.sh, just start uvicorn
        print(f"[PathFinder] Production mode — starting uvicorn on {host}:{port}")
        os.chdir(str(BACKEND_DIR))
        sys.path.insert(0, str(BACKEND_DIR))
        os.environ["PYTHONPATH"] = str(BACKEND_DIR)

        import uvicorn
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=False,
            workers=1,
            proxy_headers=True,
            forwarded_allow_ips="*",
            log_level="info",
        )
    else:
        # Local development
        print("[PathFinder] Development mode")

        # 1. Build frontend if dist doesn't exist
        build_frontend()

        # 2. Setup venv
        python_exe = setup_venv()

        # 3. If not already running from venv, re-exec with venv python
        if os.path.abspath(python_exe) != os.path.abspath(sys.executable):
            print(f"[PathFinder] Re-executing with venv python: {python_exe}")
            os.chdir(str(BACKEND_DIR))
            rc = subprocess.call([python_exe, str(ROOT_DIR / "run.py")])
            sys.exit(rc)

        # 4. Start uvicorn with reload
        os.chdir(str(BACKEND_DIR))
        sys.path.insert(0, str(BACKEND_DIR))
        os.environ["PYTHONPATH"] = str(BACKEND_DIR)

        try:
            import uvicorn
        except ImportError:
            print("[PathFinder] uvicorn not found. Run: pip install -r backend/requirements.txt")
            sys.exit(1)

        print(f"[PathFinder] ✓ Starting dev server at http://localhost:{port}")
        print(f"[PathFinder] ✓ API Docs: http://localhost:{port}/api/v1/docs")
        print(f"[PathFinder] ✓ Frontend: http://localhost:5173 (run npm run dev separately)")
        print()

        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=True,
            log_level="debug",
        )


if __name__ == "__main__":
    main()
