"""Apex OS local PC server. Serves this folder only and exposes a build ID for launcher checks."""
from __future__ import annotations

import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8765"))
BUILD_ID = "2026-10-27-auth-scrollnav-v2.3"


class ApexHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):  # noqa: N802 - stdlib handler contract
        path = urlsplit(self.path).path
        if path == "/__apex_version":
            payload = json.dumps({"name": "Apex OS", "build": BUILD_ID}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.send_header("Cache-Control", "no-store, max-age=0")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(payload)
            return
        return super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def log_message(self, fmt, *args):
        print("[Apex OS] " + fmt % args)


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), ApexHandler)
    print(f"Apex OS build {BUILD_ID} available at http://{HOST}:{PORT}/index.html")
    server.serve_forever()
