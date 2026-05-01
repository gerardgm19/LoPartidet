# Server Setup Guide

## Overview

This guide covers the full stack for exposing a server to the internet using a custom domain from Dondominio, Caddy as a reverse proxy with automatic HTTPS, and .NET services running in the background.

```
Internet → Caddy (80/443) → .NET Services (localhost ports)
                ↑
        yourdomain.com (Dondominio DNS)
```

---

## 1. Dondominio — DNS Configuration

### Point your domain to your public IP

Log in to [Dondominio](https://www.dondominio.com) → **Dominios** → click your domain → **Zona DNS**.

| Type  | Host   | Value          |
|-------|--------|----------------|
| A     | `@`    | `your.public.IP` |
| CNAME | `www`  | `yourdomain.com` |

### Adding subdomains

For each service/subdomain, add a new A record:

| Type | Host    | Value            |
|------|---------|------------------|
| A    | `api`   | `your.public.IP` |
| A    | `admin` | `your.public.IP` |
| A    | `app`   | `your.public.IP` |

> **Tip:** You can use a wildcard `*` A record pointing to your public IP to cover all subdomains automatically, without adding each one manually.

### Notes
- DNS changes can take **1–24 hours** to propagate.
- Verify propagation with: `dig yourdomain.com`
- Check your current public IP with: `curl ifconfig.me`

---

## 2. Router — Port Forwarding

Caddy needs ports **80** and **443** reachable from the internet. Configure your router (usually at `192.168.1.1`):

| External Port | Internal Port | Protocol | Target              |
|---------------|---------------|----------|---------------------|
| 80            | 80            | TCP      | your server local IP |
| 443           | 443           | TCP      | your server local IP |

Also open ports on the server firewall:

```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload
```

---

## 3. Caddy — Reverse Proxy with Automatic HTTPS

Caddy replaces Nginx as the public-facing server. It automatically obtains and renews Let's Encrypt certificates.

### Installation

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

### Caddyfile — `/etc/caddy/Caddyfile`

Replace the default content entirely:

```
# Static website
yourdomain.com {
    root * /var/www/mysite
    file_server
}

# API service
api.yourdomain.com {
    reverse_proxy localhost:3000
}

# Admin panel
admin.yourdomain.com {
    reverse_proxy localhost:4000
}
```

> **Note:** Internal traffic between Caddy and your apps is plain **HTTP**. Caddy handles HTTPS only for external connections. Your apps do not need SSL configuration.

### Commands

```bash
# Start and enable on boot
sudo systemctl enable caddy
sudo systemctl start caddy

# Reload after editing Caddyfile (no downtime)
sudo systemctl reload caddy

# Check status
sudo systemctl status caddy

# Live logs
sudo journalctl -u caddy --follow
```

### Serving static HTML

```
yourdomain.com {
    root * /var/www/mysite
    file_server
}
```

Set correct permissions:

```bash
sudo chown -R caddy:caddy /var/www/mysite
```

---

## 4. Nginx (optional)

If keeping Nginx alongside Caddy, Nginx must listen on an internal port (not 80/443) and Caddy forwards to it.

Change Nginx listen port in `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 8080;
    ...
}
```

Then in Caddyfile:

```
yourdomain.com {
    reverse_proxy localhost:8080
}
```

> **Recommendation:** If Nginx is only acting as a reverse proxy, replace it with Caddy directly to simplify the stack.

---

## 5. .NET Services

### Recommended file location

```
/var/www/myapp/
```

### Publish your app

```bash
dotnet publish -c Release -o ./publish
sudo cp -r ./publish/* /var/www/myapp/
```

### systemd service — `/etc/systemd/system/myapp.service`

```ini
[Unit]
Description=My .NET API
After=network.target

[Service]
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/dotnet /var/www/myapp/myapp.dll
Restart=always
RestartSec=10
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:3000

[Install]
WantedBy=multi-user.target
```

> The `ASPNETCORE_URLS` port must match the port in your Caddyfile `reverse_proxy` directive.

### Service commands

```bash
# Enable and start
sudo systemctl enable myapp
sudo systemctl start myapp

# Check status
sudo systemctl status myapp

# View logs
sudo journalctl -u myapp --follow

# Restart after deploy
sudo systemctl restart myapp
```

### Multiple services example

| Service     | Port   | Subdomain            | Service file         |
|-------------|--------|----------------------|----------------------|
| Main API    | 3000   | `api.yourdomain.com` | `api.service`        |
| Admin API   | 4000   | `admin.yourdomain.com` | `admin.service`    |
| Background  | 5000   | *(internal only)*    | `worker.service`     |

---

## 6. Troubleshooting

### 502 Bad Gateway
Caddy is running but can't reach your app.

```bash
# Check what ports are listening
sudo ss -tlnp | grep LISTEN

# Test app locally
curl http://localhost:3000

# Check app logs
sudo journalctl -u myapp --follow
```

### Certificate error (timeout / firewall)
Let's Encrypt can't reach your server.

```bash
# Verify ports are open (run from another machine)
Test-NetConnection -ComputerName your.public.IP -Port 80
Test-NetConnection -ComputerName your.public.IP -Port 443

# Verify DNS is pointing to the right IP
dig yourdomain.com

# Verify your public IP
curl ifconfig.me
```

### DNS not resolving
Wait for propagation (up to 24h) or check with:
```bash
nslookup yourdomain.com 8.8.8.8
```

---

## Architecture Summary

```
Internet
   │
   ▼
Router (port forward 80/443)
   │
   ▼
Caddy  ──── yourdomain.com      → /var/www/mysite (static)
       ──── api.yourdomain.com  → localhost:3000  (.NET API)
       ──── admin.yourdomain.com→ localhost:4000  (.NET Admin)
                                        │
                                  systemd services
                                  /var/www/myapp/
```