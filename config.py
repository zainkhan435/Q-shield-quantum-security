import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # Fallback: manually load .env if python-dotenv not installed
    _env_path = Path(__file__).resolve().parent / ".env"
    if _env_path.exists():
        for _line in _env_path.read_text().splitlines():
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                os.environ.setdefault(_k.strip(), _v.strip())

BASE_DIR = Path(__file__).resolve().parent


class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "qshield-quantum-security-key-2026-secret")
    
    # SQLite Database configuration
    DB_PATH = BASE_DIR / "instance" / "qshield.db"
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session Configuration
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours
    
    # Quantum Simulator Defaults
    DEFAULT_SHOTS = 1000
    MAX_SHOTS = 5000
    MIN_SHOTS = 100
    
    # Threat Detection Thresholds
    QBER_CUTOFF_THRESHOLD = 0.11        # 11.0% theoretical cutoff for QDS security
    STATISTICAL_Z_THRESHOLD = 3.0       # 3-sigma confidence limit (99.73%)
    SUSPICIOUS_Z_THRESHOLD = 2.0        # 2-sigma warning limit (95.45%)
    
    # Optional IBM Quantum settings (Never fake hardware)
    IBM_QUANTUM_TOKEN = os.getenv("IBM_QUANTUM_TOKEN", None)
    IBM_QUANTUM_INSTANCE = os.getenv("IBM_QUANTUM_INSTANCE", None)
    IBM_QUANTUM_BACKEND = os.getenv("IBM_QUANTUM_BACKEND", "ibm_brisbane")

    # Optional Google Gemini AI Helpdesk & Copilot
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", None)

class TestConfig(Config):
    """Testing configuration with in-memory database."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False
