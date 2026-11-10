"""
ACIB - Adaptive Code-mixed Indic Benchmark Launcher
Unified runner that initializes the database, seeds the starter suite, and serves the application.
"""
import uvicorn
import os
import sys

# Ensure backend directory is in path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(CURRENT_DIR, "backend"))

if __name__ == "__main__":
    print("=" * 70)
    print(" ACIB: Adaptive Code-mixed Indic Prompt Injection Benchmark")
    print(" Research Evaluation Platform for Task-Specific Tool-Using Agents")
    print("=" * 70)
    print("Starting server at http://127.0.0.1:8000 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)

