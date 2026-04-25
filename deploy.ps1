#!/usr/bin/env pwsh
# deploy.ps1 - Build and deploy LoPartidet services to remote server

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

# ── PATHS ─────────────────────────────────────────────────────────────────────
$RepoRoot = $PSScriptRoot
$BuildDir = "$RepoRoot/.deploy-build"
$Date     = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

$Cfg = @{
    LoPartidetAPI = @{
        Name       = "LoPartidet.API"
        Service    = "lopartidet"
        CsprojPath = "$RepoRoot/LoPartidet.API/LoPartidet.API/LoPartidet.API.csproj"
        BuildOut   = "$BuildDir/lopartidet"
        RemoteDir  = "/opt/lopartidet"
    }
    IdentityManager = @{
        Name       = "IdentityManager"
        Service    = "identitymanager"
        CsprojPath = "$RepoRoot/IdentityManager/IdentityManager/IdentityManager.csproj"
        BuildOut   = "$BuildDir/identitymanager"
        RemoteDir  = "/opt/identitymanager"
    }
    ExpoWeb = @{
        SourceDir = "$RepoRoot/LoPartidet"
        BuildOut  = "$RepoRoot/LoPartidet/dist"
        RemoteDir = "/var/www/html"
    }
}

# ── SESSION HELPERS ───────────────────────────────────────────────────────────
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

# ── BACKUP HELPER ─────────────────────────────────────────────────────────────
function Invoke-RemoteBackup {
    param([string]$RemoteDir)
    # Finds unique filename: name.zip → name(1).zip → name(2).zip …
    # Skips zip if directory is empty (first deploy)
    $cmd = "sudo mkdir -p '$RemoteDir/backups'; base='$RemoteDir/backups/$Date'; " +
           'target="${base}.zip"; n=1; while [ -f "$target" ]; do target="${base}(${n}).zip"; n=$((n+1)); done; ' +
           "if find '$RemoteDir' -mindepth 1 -maxdepth 1 ! -name backups | grep -q .; then cd '$RemoteDir' && sudo zip -r " + '"$target"' + " . --exclude 'backups/*'; fi"
    return Invoke-Remote $cmd
}

# ── DEPLOY FUNCTIONS ──────────────────────────────────────────────────────────

function Deploy-DotnetService {
    param([hashtable]$Svc)

    $name      = $Svc.Name
    $service   = $Svc.Service
    $buildOut  = $Svc.BuildOut
    $remoteDir = $Svc.RemoteDir

    # 1. Build locally
    Write-Step "Building $name"
    if (Test-Path $buildOut) { Remove-Item -Recurse -Force $buildOut }
    dotnet publish $Svc.CsprojPath -c Release -o $buildOut --nologo
    if ($LASTEXITCODE -ne 0) { Write-Err "$name build failed."; exit 1 }

    # 2. Stop service
    Write-Step "Stopping $service"
    $exitCode, $out = Invoke-Remote "sudo systemctl stop $service"
    if ($exitCode -ne 0) { Write-Err "Stop failed: $out"; Close-Sessions; exit 1 }

    # 3. Backup remote
    Write-Step "Backing up $name ($Date)"
    $exitCode, $out = Invoke-RemoteBackup $remoteDir
    if ($exitCode -ne 0) {
        Write-Err "Backup failed: $out"
        Invoke-Remote "sudo systemctl start $service" | Out-Null
        Close-Sessions; exit 1
    }

    # 4. Clear remote (keep appsettings and backups)
    Write-Step "Clearing $remoteDir"
    $exitCode, $out = Invoke-Remote "sudo find '$remoteDir' -mindepth 1 -maxdepth 1 ! -name backups ! -name 'appsettings*.json' -exec rm -rf {} +"
    if ($exitCode -ne 0) {
        Write-Err "Clear failed: $out"
        Invoke-Remote "sudo unzip -o '$remoteDir/backups/${Date}.zip' -d '$remoteDir'" | Out-Null
        Invoke-Remote "sudo systemctl start $service" | Out-Null
        Close-Sessions; exit 1
    }

    # 5. Upload build output
    Write-Step "Uploading $name -> $remoteDir"
    try {
        Send-Dir -LocalDir $buildOut -RemotePath $remoteDir
    } catch {
        Write-Err "Upload failed: $_"
        Invoke-Remote "sudo unzip -o '$remoteDir/backups/${Date}.zip' -d '$remoteDir'" | Out-Null
        Invoke-Remote "sudo systemctl start $service" | Out-Null
        Close-Sessions; exit 1
    }

    # 6. Start service and verify
    Write-Step "Starting $service"
    $exitCode, $out = Invoke-Remote "sudo systemctl start $service"
    if ($exitCode -ne 0) {
        Write-Err "Start failed: $out"
        Write-Host "Check: sudo journalctl -u $service -n 50" -ForegroundColor Yellow
        Close-Sessions; exit 1
    }

    Start-Sleep -Seconds 2
    $exitCode, $status = Invoke-Remote "systemctl is-active $service"
    Write-Host ($status -join "`n")
}

function Deploy-LoPartidetAPI {
    Deploy-DotnetService $Cfg.LoPartidetAPI
}

function Deploy-IdentityManager {
    Deploy-DotnetService $Cfg.IdentityManager
}

function Deploy-ExpoWeb {
    $svc      = $Cfg.ExpoWeb
    $tarName  = "expo-web-${Date}.tar.gz"
    $localTar = "$env:TEMP\$tarName"
    $remoteTar = "/tmp/$tarName"

    # 1. Build locally
    Write-Step "Building Expo Web"
    Push-Location $svc.SourceDir
    npx expo export -p web
    $expoExit = $LASTEXITCODE
    Pop-Location
    if ($expoExit -ne 0) { Write-Err "Expo build failed."; exit 1 }

    # 2. Backup remote web root
    Write-Step "Backing up LoPartidet Web ($Date)"
    $exitCode, $out = Invoke-RemoteBackup $svc.RemoteDir
    if ($exitCode -ne 0) { Write-Err "Backup failed: $out"; Close-Sessions; exit 1 }

    # 3. Clear remote web root
    Write-Step "Clearing $($svc.RemoteDir)"
    $exitCode, $out = Invoke-Remote "sudo find '$($svc.RemoteDir)' -mindepth 1 -maxdepth 1 ! -name backups -exec rm -rf {} +"
    if ($exitCode -ne 0) { Write-Err "Clear failed: $out"; Close-Sessions; exit 1 }

    # 4. Pack into tarball (avoids SFTP issues with special chars in folder names like (auth), (tabs))
    Write-Step "Packing Expo Web build"
    tar -czf $localTar -C $svc.BuildOut .
    if ($LASTEXITCODE -ne 0) { Write-Err "tar pack failed."; exit 1 }

    # 5. Upload tarball and extract on server
    Write-Step "Uploading and extracting -> $($svc.RemoteDir)"
    try {
        Set-SFTPItem -SFTPSession $SftpSession -Path $localTar -Destination "/tmp" -Force
    } catch {
        Write-Err "Tarball upload failed: $_"
        Remove-Item $localTar -ErrorAction SilentlyContinue
        Close-Sessions; exit 1
    }
    Remove-Item $localTar

    $exitCode, $out = Invoke-Remote "sudo tar -xzf '$remoteTar' -C '$($svc.RemoteDir)' && sudo rm '$remoteTar'"
    if ($exitCode -ne 0) { Write-Err "Extract failed: $out"; Close-Sessions; exit 1 }

    # 6. Fix permissions
    $exitCode, $out = Invoke-Remote "sudo chown -R www-data:www-data '$($svc.RemoteDir)' && sudo chmod -R 755 '$($svc.RemoteDir)'"
    if ($exitCode -ne 0) { Write-Err "Permissions fix failed: $out"; Close-Sessions; exit 1 }

    # 7. Restart nginx
    Write-Step "Restarting nginx"
    $exitCode, $out = Invoke-Remote "sudo systemctl restart nginx"
    if ($exitCode -ne 0) { Write-Err "nginx restart failed: $out"; Close-Sessions; exit 1 }

    Write-Host "Expo Web deployed OK" -ForegroundColor Green
}

# ── SELECTION ─────────────────────────────────────────────────────────────────
Write-Host "`nSelect what to deploy (space-separated):" -ForegroundColor Yellow
Write-Host "  [1] IdentityManager"
Write-Host "  [2] LoPartidet.API"
Write-Host "  [3] LoPartidet Web"
Write-Host ""

$validChoices = @("1","2","3")
do {
    $raw     = Read-Host "Choice (e.g. 1 3)"
    $choices = $raw.Trim() -split '\s+' | Select-Object -Unique
    $invalid = $choices | Where-Object { $_ -notin $validChoices }
} while ($invalid.Count -gt 0 -or $choices.Count -eq 0)

$deployIdentity    = "1" -in $choices
$deployLoPartidet  = "2" -in $choices
$deployExpoWeb     = "3" -in $choices

# ── PREFLIGHT CHECKS ──────────────────────────────────────────────────────────
if (($deployIdentity -or $deployLoPartidet) -and -not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Err "'dotnet' not found in PATH."; exit 1
}
if ($deployExpoWeb -and -not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Err "'npx' not found in PATH."; exit 1
}

# ── CONNECT AND DEPLOY ────────────────────────────────────────────────────────
Open-Sessions

if ($deployIdentity)   { Deploy-IdentityManager }
if ($deployLoPartidet) { Deploy-LoPartidetAPI }
if ($deployExpoWeb)    { Deploy-ExpoWeb }

# ── CLEANUP ───────────────────────────────────────────────────────────────────
Close-Sessions

Write-Step "Cleaning local build artifacts"
if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }
if ($deployExpoWeb -and (Test-Path $Cfg.ExpoWeb.BuildOut)) {
    Remove-Item -Recurse -Force $Cfg.ExpoWeb.BuildOut
}

Write-Host "`nDeploy complete ($Date)" -ForegroundColor Green
