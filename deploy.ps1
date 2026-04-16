#!/usr/bin/env pwsh
# deploy.ps1 - Build and deploy LoPartidet.API and IdentityManager to remote server

param(
    [string]$SshHost = "100.64.116.23",
    [string]$SshUser = "urano",
    [string]$SshPass = "Gera1908joseluis++"
)

$ErrorActionPreference = "Stop"

$RepoRoot       = $PSScriptRoot
$ApiProject     = "$RepoRoot/LoPartidet.API/LoPartidet.API/LoPartidet.API.csproj"
$IdmProject     = "$RepoRoot/IdentityManager/IdentityManager/IdentityManager.csproj"
$BuildDir       = "$RepoRoot/.deploy-build"
$ApiBuildOut    = "$BuildDir/lopartidet"
$IdmBuildOut    = "$BuildDir/identitymanager"
$Date           = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

function Write-Step { param([string]$Msg) Write-Host "`n==> $Msg" -ForegroundColor Cyan }
function Write-Err  { param([string]$Msg) Write-Host "ERROR: $Msg" -ForegroundColor Red }

function Invoke-Ssh {
    param([string]$Command)
    $result = & sshpass -p $SshPass ssh -o StrictHostKeyChecking=no "$SshUser@$SshHost" $Command
    return $LASTEXITCODE, $result
}

function Invoke-Scp {
    param([string]$LocalPath, [string]$RemotePath)
    & sshpass -p $SshPass scp -o StrictHostKeyChecking=no -r $LocalPath "${SshUser}@${SshHost}:${RemotePath}"
    return $LASTEXITCODE
}

# ── PROJECT SELECTION ─────────────────────────────────────────────────────────
$projects = @(
    [PSCustomObject]@{ Name = "LoPartidet.API";    Key = "api"; Service = "lopartidet.service";     BuildOut = $ApiBuildOut; CsprojPath = $ApiProject; RemoteDir = "/opt/lopartidet" }
    [PSCustomObject]@{ Name = "IdentityManager";   Key = "idm"; Service = "identitymanager.service"; BuildOut = $IdmBuildOut; CsprojPath = $IdmProject; RemoteDir = "/opt/identitymanager" }
)

Write-Host "`nSelect projects to deploy:" -ForegroundColor Yellow
Write-Host "  [1] LoPartidet.API"
Write-Host "  [2] IdentityManager"
Write-Host "  [3] Both"
Write-Host ""

do {
    $choice = Read-Host "Choice (1/2/3)"
} while ($choice -notin @("1", "2", "3"))

$selected = switch ($choice) {
    "1" { @($projects[0]) }
    "2" { @($projects[1]) }
    "3" { $projects }
}

Write-Host "`nDeploying: $($selected.Name -join ', ')" -ForegroundColor Green

# ── CHECK TOOLS ───────────────────────────────────────────────────────────────
foreach ($tool in @("sshpass", "ssh", "scp", "dotnet")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Err "'$tool' not found in PATH. Install it and retry."
        exit 1
    }
}

# ── 1. BUILD ──────────────────────────────────────────────────────────────────
foreach ($p in $selected) {
    Write-Step "Building $($p.Name)"
    if (Test-Path $p.BuildOut) { Remove-Item -Recurse -Force $p.BuildOut }
    dotnet publish $p.CsprojPath -c Release -o $p.BuildOut --nologo
    if ($LASTEXITCODE -ne 0) { Write-Err "$($p.Name) build failed."; exit 1 }
}

# ── 2. STOP SERVICES ──────────────────────────────────────────────────────────
$serviceList = ($selected | ForEach-Object { $_.Service }) -join " "
Write-Step "Stopping remote services: $serviceList"
$exitCode, $out = Invoke-Ssh "sudo systemctl stop $serviceList"
if ($exitCode -ne 0) { Write-Err "Failed to stop services: $out"; exit 1 }

# ── 3. BACKUP ─────────────────────────────────────────────────────────────────
Write-Step "Creating backups on remote ($Date)"

$backupCmds = ($selected | ForEach-Object {
    $dir = $_.RemoteDir
    "mkdir -p '$dir/backups' && cd '$dir' && zip -r '$dir/backups/${Date}.zip' . --exclude 'backups/*'"
}) -join " && "

$exitCode, $out = Invoke-Ssh $backupCmds
if ($exitCode -ne 0) {
    Write-Err "Backup failed: $out"
    Write-Step "Restarting services (rollback)"
    Invoke-Ssh "sudo systemctl start $serviceList" | Out-Null
    exit 1
}

# ── RESTORE HELPER ────────────────────────────────────────────────────────────
function Invoke-Restore {
    foreach ($p in $selected) {
        $dir = $p.RemoteDir
        Invoke-Ssh "sudo find '$dir' -mindepth 1 -maxdepth 1 ! -name backups -exec rm -rf {} + && sudo unzip -o '$dir/backups/${Date}.zip' -d '$dir'" | Out-Null
    }
    Invoke-Ssh "sudo systemctl start $serviceList" | Out-Null
}

# ── 4. CLEAR REMOTE DIRS ──────────────────────────────────────────────────────
$clearCmds = ($selected | ForEach-Object {
    "sudo find '$($_.RemoteDir)' -mindepth 1 -maxdepth 1 ! -name backups -exec rm -rf {} +"
}) -join " && "

$exitCode, $out = Invoke-Ssh $clearCmds
if ($exitCode -ne 0) {
    Write-Err "Failed to clear remote dirs: $out"
    Invoke-Restore
    exit 1
}

# ── 5. DEPLOY ─────────────────────────────────────────────────────────────────
foreach ($p in $selected) {
    Write-Step "Deploying $($p.Name) -> $($p.RemoteDir)"
    $exitCode = Invoke-Scp "$($p.BuildOut)/*" "$($p.RemoteDir)/"
    if ($exitCode -ne 0) {
        Write-Err "SCP failed for $($p.Name)"
        Invoke-Restore
        exit 1
    }
}

# ── 6. START SERVICES ─────────────────────────────────────────────────────────
Write-Step "Starting remote services: $serviceList"
$exitCode, $out = Invoke-Ssh "sudo systemctl start $serviceList"
if ($exitCode -ne 0) {
    Write-Err "Services failed to start: $out"
    Write-Host "Check remote with: sudo journalctl -u $serviceList -n 50" -ForegroundColor Yellow
    exit 1
}

Start-Sleep -Seconds 2
$exitCode, $status = Invoke-Ssh "systemctl is-active $serviceList"
Write-Host $status

# ── CLEANUP ───────────────────────────────────────────────────────────────────
Write-Step "Cleaning local build artifacts"
Remove-Item -Recurse -Force $BuildDir

Write-Host "`nDeploy complete ($Date)" -ForegroundColor Green
