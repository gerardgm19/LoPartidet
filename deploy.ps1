#!/usr/bin/env pwsh
# deploy.ps1 - Build and deploy LoPartidet.API and IdentityManager to remote server

param(
    [string]$SshHost = "100.64.116.23",
    [string]$SshUser = "urano",
    [string]$SshPass = "Gera1908joseluis++"
)

$ErrorActionPreference = "Stop"

# ── POSH-SSH ──────────────────────────────────────────────────────────────────
if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
    Write-Host "Installing Posh-SSH..." -ForegroundColor Yellow
    Install-Module -Name Posh-SSH -Scope CurrentUser -Force -AllowClobber
}
Import-Module Posh-SSH

$RepoRoot    = $PSScriptRoot
$ApiProject  = "$RepoRoot/LoPartidet.API/LoPartidet.API/LoPartidet.API.csproj"
$IdmProject  = "$RepoRoot/IdentityManager/IdentityManager/IdentityManager.csproj"
$BuildDir    = "$RepoRoot/.deploy-build"
$ApiBuildOut = "$BuildDir/lopartidet"
$IdmBuildOut = "$BuildDir/identitymanager"
$Date        = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

function Write-Step { param([string]$Msg) Write-Host "`n==> $Msg" -ForegroundColor Cyan }
function Write-Err  { param([string]$Msg) Write-Host "ERROR: $Msg" -ForegroundColor Red }

$Credential  = [PSCredential]::new($SshUser, (ConvertTo-SecureString $SshPass -AsPlainText -Force))
$SshSession  = $null
$SftpSession = $null

function Open-Sessions {
    Write-Step "Connecting to $SshHost"
    $script:SshSession  = New-SSHSession  -ComputerName $SshHost -Credential $Credential -AcceptKey -Force
    $script:SftpSession = New-SFTPSession -ComputerName $SshHost -Credential $Credential -AcceptKey -Force
}

function Close-Sessions {
    if ($SshSession)  { Remove-SSHSession  -SSHSession  $SshSession  | Out-Null }
    if ($SftpSession) { Remove-SFTPSession -SFTPSession $SftpSession | Out-Null }
}

function Invoke-Remote {
    param([string]$Command)
    $cmd = $Command -replace '\bsudo\b', "echo '$SshPass' | sudo -S"
    $r = Invoke-SSHCommand -SSHSession $SshSession -Command $cmd
    return $r.ExitStatus, $r.Output
}

function Send-Dir {
    param([string]$LocalDir, [string]$RemotePath)
    foreach ($item in Get-ChildItem -Path $LocalDir) {
        if ($item.Name -like "appsettings*.json") { continue }
        if ($item.PSIsContainer) {
            $dest = "$RemotePath/$($item.Name)"
            Invoke-Remote "mkdir -p '$dest'" | Out-Null
            Send-Dir -LocalDir $item.FullName -RemotePath $dest
        } else {
            Set-SFTPItem -SFTPSession $SftpSession -Path $item.FullName -Destination $RemotePath -Force
        }
    }
}

# ── PROJECT SELECTION ─────────────────────────────────────────────────────────
$projects = @(
    [PSCustomObject]@{ Name = "LoPartidet.API";  Service = "lopartidet";      BuildOut = $ApiBuildOut; CsprojPath = $ApiProject; RemoteDir = "/opt/lopartidet" }
    [PSCustomObject]@{ Name = "IdentityManager"; Service = "identitymanager"; BuildOut = $IdmBuildOut; CsprojPath = $IdmProject; RemoteDir = "/opt/identitymanager" }
)

Write-Host "`nSelect projects to deploy:" -ForegroundColor Yellow
Write-Host "  [1] LoPartidet.API"
Write-Host "  [2] IdentityManager"
Write-Host "  [3] Both"
Write-Host ""

do { $choice = Read-Host "Choice (1/2/3)" } while ($choice -notin @("1","2","3"))

$selected = switch ($choice) {
    "1" { @($projects[0]) }
    "2" { @($projects[1]) }
    "3" { $projects }
}

Write-Host "`nDeploying: $($selected.Name -join ', ')" -ForegroundColor Green

# ── CHECK DOTNET ───────────────────────────────────────────────────────────────
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Err "'dotnet' not found in PATH."
    exit 1
}

# ── 1. BUILD ──────────────────────────────────────────────────────────────────
foreach ($p in $selected) {
    Write-Step "Building $($p.Name)"
    if (Test-Path $p.BuildOut) { Remove-Item -Recurse -Force $p.BuildOut }
    dotnet publish $p.CsprojPath -c Release -o $p.BuildOut --nologo
    if ($LASTEXITCODE -ne 0) { Write-Err "$($p.Name) build failed."; exit 1 }
}

# ── CONNECT ───────────────────────────────────────────────────────────────────
Open-Sessions
$serviceList = ($selected | ForEach-Object { $_.Service }) -join " "

function Invoke-Restore {
    foreach ($p in $selected) {
        $dir = $p.RemoteDir
        Invoke-Remote "sudo find '$dir' -mindepth 1 -maxdepth 1 ! -name backups -exec rm -rf {} + && sudo unzip -o '$dir/backups/${Date}.zip' -d '$dir'" | Out-Null
    }
    Invoke-Remote "sudo systemctl start $serviceList" | Out-Null
}

# ── 2. STOP SERVICES ──────────────────────────────────────────────────────────
Write-Step "Stopping: $serviceList"
$exitCode, $out = Invoke-Remote "sudo systemctl stop $serviceList"
if ($exitCode -ne 0) { Write-Err "Stop failed: $out"; Close-Sessions; exit 1 }

# ── 3. BACKUP ─────────────────────────────────────────────────────────────────
Write-Step "Backing up ($Date)"
$backupCmds = ($selected | ForEach-Object {
    $dir = $_.RemoteDir
    "mkdir -p '$dir/backups' && cd '$dir' && zip -r '$dir/backups/${Date}.zip' . --exclude 'backups/*'"
}) -join " && "

$exitCode, $out = Invoke-Remote $backupCmds
if ($exitCode -ne 0) {
    Write-Err "Backup failed: $out"
    Invoke-Remote "sudo systemctl start $serviceList" | Out-Null
    Close-Sessions; exit 1
}

# ── 4. CLEAR REMOTE ───────────────────────────────────────────────────────────
$clearCmds = ($selected | ForEach-Object {
    "sudo find '$($_.RemoteDir)' -mindepth 1 -maxdepth 1 ! -name backups ! -name 'appsettings*.json' -exec rm -rf {} +"
}) -join " && "

$exitCode, $out = Invoke-Remote $clearCmds
if ($exitCode -ne 0) {
    Write-Err "Clear failed: $out"
    Invoke-Restore; Close-Sessions; exit 1
}

# ── 5. DEPLOY ─────────────────────────────────────────────────────────────────
foreach ($p in $selected) {
    Write-Step "Uploading $($p.Name) -> $($p.RemoteDir)"
    try {
        Send-Dir -LocalDir $p.BuildOut -RemotePath $p.RemoteDir
    } catch {
        Write-Err "Upload failed for $($p.Name): $_"
        Invoke-Restore; Close-Sessions; exit 1
    }
}

# ── 6. START SERVICES ─────────────────────────────────────────────────────────
Write-Step "Starting: $serviceList"
$exitCode, $out = Invoke-Remote "sudo systemctl start $serviceList"
if ($exitCode -ne 0) {
    Write-Err "Start failed: $out"
    Write-Host "Check: sudo journalctl -u $serviceList -n 50" -ForegroundColor Yellow
    Close-Sessions; exit 1
}

Start-Sleep -Seconds 2
$exitCode, $status = Invoke-Remote "systemctl is-active $serviceList"
Write-Host ($status -join "`n")

# ── CLEANUP ───────────────────────────────────────────────────────────────────
Close-Sessions
Write-Step "Cleaning local build artifacts"
Remove-Item -Recurse -Force $BuildDir

Write-Host "`nDeploy complete ($Date)" -ForegroundColor Green
