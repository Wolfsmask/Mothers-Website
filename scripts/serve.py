#!/usr/bin/env python3
"""
serve.py -- run the website from this computer, and keep a record of what
visitors look at.

    python3 scripts/serve.py

Then open the address it prints. While this is running it writes a line to
data/events.jsonl every time someone opens a page or looks at a rental item.

Run scripts/build_report.py afterwards to turn that into a single report.html
file, which can be emailed to anyone and opened by double-clicking. No
accounts, nothing to install, nothing leaves this computer.

What is recorded: the time, which page, and which rental item. That is all.
No IP addresses, no names, no device details, nothing that identifies a
person.

Stop the server with Ctrl+C.
"""

from __future__ import annotations

import json
import socket
import sys
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
EVENTS = DATA / "events.jsonl"

PORT = 8000
MAX_BODY = 4096          # a tracking payload is tiny; refuse anything larger
MAX_FIELD = 120


def record(kind: str, page: str, item: str = "") -> None:
    """Append one event. Never let a logging problem break the page."""
    try:
        DATA.mkdir(parents=True, exist_ok=True)
        row = {
            "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "kind": kind[:40],
            "page": (page or "")[:MAX_FIELD],
        }
        if item:
            row["item"] = item[:MAX_FIELD]
        with EVENTS.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")
    except Exception:
        pass


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    # Quieten the default console spam; the log file is the record.
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path.endswith(".html") or path.endswith("/"):
            page = path.rsplit("/", 1)[-1] or "index.html"
            record("page_view", page)
        super().do_GET()

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/_track":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY:
            self.send_response(204)
            self.end_headers()
            return
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            if isinstance(payload, dict):
                record(
                    str(payload.get("kind", "event")),
                    str(payload.get("page", "")),
                    str(payload.get("item", "")),
                )
        except Exception:
            pass
        self.send_response(204)
        self.end_headers()


def local_address() -> str:
    """The address other devices on the same wifi can use."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as probe:
            probe.connect(("10.255.255.255", 1))
            return probe.getsockname()[0]
    except Exception:
        return "127.0.0.1"


def main() -> int:
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Not a port number: {sys.argv[1]}")
            return 1

    try:
        server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    except OSError as exc:
        print(f"Could not start on port {port}: {exc}")
        print(f"Something else may be using it. Try: python3 scripts/serve.py {port + 1}")
        return 1

    print("\n  Untamed Entertainment website\n")
    print(f"  On this computer:      http://localhost:{port}")
    print(f"  On the same wifi:      http://{local_address()}:{port}")
    print(f"\n  Recording visits to:   {EVENTS.relative_to(ROOT)}")
    print("  Make the report with:  python3 scripts/build_report.py")
    print("\n  Leave this window open. Press Ctrl+C to stop.\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped. The record is kept; run build_report.py to see it.\n")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
