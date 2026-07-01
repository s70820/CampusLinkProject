# Import full CampusLink demo data (130 users, 30 programmes) into Kerocket MySQL.
#
# Get credentials from Kerocket dashboard -> your project -> MySQL -> External access.
#
# Usage:
#   cd CampusLinkBackend\kerocket-import
#   .\import-to-kerocket.ps1 -DbHost "your-host.kerocket.com" -DbUser "..." -DbPassword "..." -Database app

param(
    [Parameter(Mandatory = $true)]
    [string]$DbHost,

    [int]$DbPort = 3306,

    [Parameter(Mandatory = $true)]
    [string]$DbUser,

    [Parameter(Mandatory = $true)]
    [string]$DbPassword,

    [string]$Database = "app"
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$mysql = "C:\xampp\mysql\bin\mysql.exe"
$header = Join-Path $here "00-use-app.sql"
$dump = Join-Path $here "campuslink-full-demo.sql"

if (-not (Test-Path $mysql)) {
    throw "mysql.exe not found at $mysql"
}
if (-not (Test-Path $dump)) {
    throw "Missing $dump"
}

Write-Host "Importing into Kerocket MySQL ${DbHost}:${DbPort} / $Database ..."
Write-Host "This may take 1-3 minutes."

$mysqlArgs = @(
    "-h", $DbHost,
    "-P", "$DbPort",
    "-u", $DbUser,
    "-p$DbPassword",
    "--default-character-set=utf8mb4"
)

Get-Content $header -Raw | & $mysql @mysqlArgs 2>&1
if ($LASTEXITCODE -ne 0) { throw "Failed running header SQL (exit $LASTEXITCODE)" }

Get-Content $dump -Raw | & $mysql @mysqlArgs $Database 2>&1
if ($LASTEXITCODE -ne 0) { throw "Failed importing dump (exit $LASTEXITCODE)" }

Write-Host ""
Write-Host "Verifying row counts..."
& $mysql @mysqlArgs $Database -e "SELECT COUNT(*) AS users FROM user; SELECT COUNT(*) AS programmes FROM programme; SELECT role, COUNT(*) AS cnt FROM user GROUP BY role;" 2>&1

Write-Host ""
Write-Host "Done. Next:"
Write-Host "  1. Kerocket dashboard -> Restart CampusLink app"
Write-Host "  2. Hard refresh browser / clear localStorage on login"
Write-Host "  3. Test: sarahdemo335@gmail.com / sarah123"
