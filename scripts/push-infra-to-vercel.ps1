# Push DATABASE_URL, DIRECT_URL, R2_*, WORKER_URL to Vercel (no CRLF).
# Usage: fill .env.infra then: powershell -File scripts/push-infra-to-vercel.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$infra = Join-Path $root ".env.infra"
if (-not (Test-Path $infra)) {
  Write-Host "Create $infra from .env.infra.example (Supabase password + R2 keys from docs/CLOUDFLARE-R2.md)"
  exit 1
}
$vars = @{}
Get-Content $infra | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '^\s*([A-Z_]+)=(.*)$') { return }
  $vars[$Matches[1]] = $Matches[2].Trim().Trim('"')
}
$required = @('DATABASE_URL','DIRECT_URL','R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET','WORKER_URL')
foreach ($k in $required) {
  if (-not $vars[$k] -or $vars[$k] -match 'YOUR_|your_') {
    Write-Host "Missing or placeholder: $k in .env.infra"
    exit 1
  }
}
foreach ($k in $required) {
  & (Join-Path $PSScriptRoot "vercel-env-no-crlf.ps1") -Name $k -Value $vars[$k]
}
Write-Host "Vercel env OK. Run: npx vercel --prod"
