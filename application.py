# application.py — Minimal EB API for RTO Portal
# Platform: AWS Elastic Beanstalk, Python 3.11
# Endpoints:
#   GET  /status
#   POST /auth/login
#   POST /actions/on-demand-read
#   POST /actions/on-demand-write

import os
import time
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Tuple

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import jwt  # PyJWT

# --- Config from environment ---
ALLOW_ORIGINS = os.getenv("ALLOW_ORIGINS", "*")  # e.g., "yourdomain.com,*.yourdomain.com,localhost:3000"
JWT_SECRET = os.getenv("SESSION_JWT_SECRET", "change-me-please")  # set a long random value in EB
JWT_TTL_HOURS = int(os.getenv("SESSION_JWT_TTL_HOURS", "8"))

app = Flask(__name__)
application = app  # Elastic Beanstalk looks for `application`

# --- CORS: allow your Vercel domains ---
def _cors_origins():
    # Expand comma-separated into a list; allow http://localhost:3000 in dev
    raw = ALLOW_ORIGINS.replace(" ", "")
    if not raw or raw == "*":
        return "*"
    return [o for o in raw.split(",") if o]

CORS(app,
     resources={r"/*": {"origins": _cors_origins()}},
     supports_credentials=True)

# --- Helpers ---
def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return make_response(("Missing or invalid Authorization header", 401))
        token = auth.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except Exception as e:
            return make_response((f"Invalid token: {str(e)}", 401))
        request.user = payload  # attach to request for downstream use
        return f(*args, **kwargs)
    return wrapper

def get_tenant() -> Tuple[str, str]:
    tenant = request.headers.get("X-Tenant-Id", "").strip() or "primary"
    # Optionally enforce an allowlist:
    # allowed = os.getenv("ALLOWED_TENANTS", "").split(",")
    # if allowed and tenant not in allowed: abort(403)
    return tenant, request.headers.get("X-Request-Id", "") or ""

# --- Routes ---
@app.get("/status")
def status():
    tenant, req_id = get_tenant()
    return jsonify({
        "ok": True,
        "time": datetime.now(timezone.utc).isoformat(),
        "tenant": tenant,
        "requestId": req_id or None,
        "service": "rto-api",
        "version": "0.1.0"
    })

@app.post("/auth/login")
def auth_login():
    # Minimal example: accept any non-empty email/password and mint a JWT.
    # Replace with real credential check later (AD, DB, etc.).
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()
    tenant, _ = get_tenant()

    if not email or not password:
        return make_response(("Missing credentials", 400))

    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "tenant": tenant,
        "roles": ["user"],
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=JWT_TTL_HOURS)).timestamp())
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return jsonify({"token": token})

@app.post("/actions/on-demand-read")
@require_auth
def action_on_demand_read():
    tenant, _ = get_tenant()
    # TODO: enqueue background job or call your internal logic
    time.sleep(0.1)  # simulate work
    return jsonify({"ok": True, "action": "on-demand-read", "tenant": tenant})

@app.post("/actions/on-demand-write")
@require_auth
def action_on_demand_write():
    tenant, _ = get_tenant()
    # TODO: enqueue write task; you will also persist cloud-side audit logs here
    time.sleep(0.1)
    return jsonify({"ok": True, "action": "on-demand-write", "tenant": tenant})

# --- Root (optional) ---
@app.get("/")
def root():
    return jsonify({"ok": True, "message": "RTO API root. See /status."})

