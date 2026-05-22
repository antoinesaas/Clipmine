# Configure Vercel + optional local .env.infra
# Create .env.infra (gitignored) with:
#   DATABASE_URL=postgresql://...
#   DIRECT_URL=postgresql://...
#   WORKER_URL=https://clipmine-worker.fly.dev
#   R2_ACCOUNT_ID=...
#   R2_ACCESS_KEY_ID=...
#   R2_SECRET_ACCESS_KEY=...
#   R2_BUCKET=clipmine-exports

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$infra = Join-Path $root ".env.infra"

if (-not (Test-Path $infra)) {
  Write-Host "Missing $infra — copy from .env.infra.example and fill values from Supabase Connect + Cloudflare R2"
  exit 1
}

Get-Content $infra | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '^\s*([A-Z_]+)=(.*)$') { return }
  $name = $Matches[1]
  $val = $Matches[2].Trim().Trim('"')
  if (-not $val) { return }
  & (Join-Path $PSScriptRoot "vercel-env-no-crlf.ps1") -Name $name -Value $val
}

Write-Host "Done. Run: vercel --prod"
