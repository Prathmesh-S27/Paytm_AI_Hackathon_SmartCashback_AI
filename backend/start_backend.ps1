Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000