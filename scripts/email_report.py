#!/usr/bin/env python3
"""
email_report.py -- build today's report and email the PDF.

    python3 scripts/email_report.py --test     # send one right now
    python3 scripts/email_report.py            # what the daily schedule runs

Settings live in email-settings.json next to this project, which is NOT part
of the code and is never committed to git, because it holds a password.

First run creates a blank one for you to fill in. See ANALYTICS.md for the
Gmail app-password steps -- it takes about three minutes and does not require
a new account.
"""

from __future__ import annotations

import argparse
import json
import os
import smtplib
import ssl
import sys
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SETTINGS = ROOT / "email-settings.json"

TEMPLATE = {
    "to": "bjolleen2@gmail.com",
    "from": "PUT THE SENDING GMAIL ADDRESS HERE",
    "app_password": "PUT THE 16-CHARACTER APP PASSWORD HERE",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 465,
    "subject": "Untamed Entertainment - website report",
    "skip_if_no_visits": False,
}


def load_settings() -> dict | None:
    """Settings come from the file, or from environment variables if set."""
    if not SETTINGS.exists():
        SETTINGS.write_text(json.dumps(TEMPLATE, indent=2) + "\n", encoding="utf-8")
        print(f"\n  Created {SETTINGS.name}. Open it and fill in:")
        print("    from          the Gmail address sending the report")
        print("    app_password  a Gmail app password (see ANALYTICS.md)")
        print("\n  Then run this again.\n")
        return None

    try:
        settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"Could not read {SETTINGS.name}: {exc}")
        return None

    # Environment variables win, so a scheduler can supply the password instead.
    settings["from"] = os.environ.get("REPORT_FROM", settings.get("from", ""))
    settings["app_password"] = os.environ.get(
        "REPORT_APP_PASSWORD", settings.get("app_password", "")
    )
    settings["to"] = os.environ.get("REPORT_TO", settings.get("to", ""))

    missing = [
        key for key in ("to", "from", "app_password")
        if not settings.get(key) or str(settings[key]).startswith("PUT THE")
    ]
    if missing:
        print(f"\n  {SETTINGS.name} still needs: {', '.join(missing)}")
        print("  See ANALYTICS.md for how to get a Gmail app password.\n")
        return None
    return settings


def body_text(rows_read: int) -> str:
    return (
        "Here is today's website report.\n\n"
        "Open the attached PDF. The line at the top says how many people visited "
        "today and which rental item they looked at most.\n\n"
        "Nothing to install and nothing to sign in to -- just open the file.\n\n"
        f"({rows_read} things recorded so far.)\n"
    )


def main() -> int:
    ap = argparse.ArgumentParser(description="Email the website report.")
    ap.add_argument("--test", action="store_true",
                    help="send one now and say more about what happened")
    ap.add_argument("--days", type=int, default=None, help="only count the last N days")
    args = ap.parse_args()

    settings = load_settings()
    if settings is None:
        return 1

    # Reuse the report builder rather than duplicating it.
    sys.path.insert(0, str(ROOT / "scripts"))
    import build_report

    rows = build_report.load(args.days)

    today = datetime.now().date()
    visits_today = sum(
        1 for r in rows
        if r.get("kind") == "page_view" and r["_when"].astimezone().date() == today
    )
    if settings.get("skip_if_no_visits") and visits_today == 0 and not args.test:
        print("No visits today and skip_if_no_visits is on, so nothing was sent.")
        return 0

    html_path = ROOT / "report.html"
    html_path.write_text(build_report.build(rows, args.days), encoding="utf-8")
    pdf_path = ROOT / "report.pdf"
    pdf_path.unlink(missing_ok=True)

    if not build_report.to_pdf(html_path, pdf_path):
        print("Could not make the PDF -- no Chrome or Edge found on this computer.")
        print("Install either one, or send report.html by hand.")
        return 1

    message = EmailMessage()
    message["Subject"] = f"{settings['subject']} - {today:%-d %B}"
    message["From"] = settings["from"]
    message["To"] = settings["to"]
    message.set_content(body_text(len(rows)))
    message.add_attachment(
        pdf_path.read_bytes(),
        maintype="application", subtype="pdf",
        filename=f"website-report-{today:%Y-%m-%d}.pdf",
    )

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(settings["smtp_host"], int(settings["smtp_port"]),
                              context=context, timeout=60) as server:
            server.login(settings["from"], settings["app_password"])
            server.send_message(message)
    except smtplib.SMTPAuthenticationError:
        print("\n  Gmail refused the login.")
        print("  The password must be a 16-character APP PASSWORD, not the normal")
        print("  Gmail password. See ANALYTICS.md.\n")
        return 1
    except Exception as exc:
        print(f"\n  Could not send: {exc}")
        print("  The report was still built, so it can be sent by hand.\n")
        return 1

    print(f"Sent to {settings['to']} ({visits_today} visits today).")
    if args.test:
        print("If it is not in the inbox, check the spam folder the first time.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
