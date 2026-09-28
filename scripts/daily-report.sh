#!/bin/sh
# Builds the report and emails it. Point cron at this file.
cd "$(dirname "$0")/.." || exit 1
python3 scripts/email_report.py
