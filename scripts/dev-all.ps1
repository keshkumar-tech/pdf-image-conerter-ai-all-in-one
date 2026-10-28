<#
  Starts the whole Library stack for local development:
    1. CBC Django backend     -> http://127.0.0.1:8000
    2. Student app dev server -> http://localhost:8081  (hot reload)
    3. NoteFlow site          -> http://localhost:3000

  Usage (from the project root):
     powershell -ExecutionPolicy Bypass -File scripts\dev-all.ps1

  Each server opens in its own window. Close a window to stop that server.
#>

$root = Split-Path -Parent $PSScriptRoot
$nodeDir = 'C:\Program Files\nodejs'
$env:PATH = "$nodeDir;" + $env:PATH

Write-Host "Starting CBC backend (Django)..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\src\library\cbc-backend'; & venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"
)

Write-Host "Starting student app dev server (Expo web, hot reload)..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\src\library\cbc-student-dashboard'; & '$nodeDir\npm.cmd' run web"
)

Start-Sleep -Seconds 6

Write-Host "Starting NoteFlow site..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root'; & '$nodeDir\npm.cmd' run dev"
)

Start-Sleep -Seconds 8
Write-Host ""
Write-Host "All set." -ForegroundColor Green
Write-Host "  Library landing : http://localhost:3000/library"
Write-Host "  Student app     : http://localhost:3000/library/school/   (proxied to Expo :8081)"
Write-Host "  Admin dashboard : http://localhost:3000/library/admin/"
Write-Host ""
Write-Host "Student login: student1@example.com / Student@123" -ForegroundColor Yellow
Write-Host "Admin login  : admin@codingwithkesh.com / Admin@12345" -ForegroundColor Yellow
