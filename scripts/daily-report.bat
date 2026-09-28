@echo off
REM Builds the report and emails it. Point Windows Task Scheduler at this file.
REM It runs from the project folder no matter where it is started from.
cd /d "%~dp0.."
python scripts\email_report.py
