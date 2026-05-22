# Push env vars to Vercel without trailing CRLF.
param(
  [Parameter(Mandatory = $true)][string]$Name,
  [Parameter(Mandatory = $true)][string]$Value,
  [string[]]$Environments = @("production", "development")
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

foreach ($env in $Environments) {
  npx vercel env add $Name $env --value $Value --force --yes --non-interactive 2>&1 | Out-Host
  Write-Host "OK $Name -> $env"
}
