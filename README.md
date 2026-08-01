# Server Setup Guide

## Overview

The server is exposed to the internet through a **Cloudflare Tunnel** — no public IP,
no router port forwarding, and no inbound ports. `cloudflared` runs on the server and
opens an **outbound** connection to Cloudflare; Cloudflare terminates HTTPS at its edge
and routes each hostname through the tunnel straight to its local service. **Caddy
serves only the static front-end**; the .NET services are reached directly by the
tunnel on their own localhost ports.

```
Internet → Cloudflare edge (HTTPS/TLS)
              │  outbound tunnel (no inbound ports)
              ▼
        cloudflared (on the server)
              ├── yourdomain.com      → Caddy (localhost:80) → /var/www/html (static FE)
              ├── api.yourdomain.com  → localhost:3000  (.NET API)
              └── auth.yourdomain.com → localhost:4000  (.NET IdentityManager)
```

**Gone from the old setup:** public IP, Dondominio A records, router port forwarding,
opening ports 80/443, and Let's Encrypt. Cloudflare handles public DNS and TLS.
**Caddy stays** — but only as the internal static server for the front-end (plain HTTP
on localhost). It no longer faces the internet, manages certificates, or proxies the APIs.

---

## 1. Cloudflare — Domain & DNS

The domain must be managed by Cloudflare (its nameservers), not by Dondominio's DNS zone.

1. Add the domain in the [Cloudflare dashboard](https://dash.cloudflare.com) → **Add a site**.
2. Cloudflare gives you two nameservers. Set them at Dondominio → your domain →
   **Nameservers** → *use custom nameservers* → enter the Cloudflare ones.
3. Wait until Cloudflare reports the domain as **Active** (propagation up to 24h).

You do **not** create A records or reference a public IP — the tunnel creates the DNS
entries (proxied CNAMEs) for you in section 2.

---

## 2. Cloudflare Tunnel (dashboard-managed)

The tunnel is created and configured entirely in the **Cloudflare Zero Trust
dashboard** (remotely-managed). The server only runs the `cloudflared` connector using
a token from the dashboard — there is **no** `~/.cloudflared/config.yml` and **no**
`cloudflared tunnel` CLI setup on the server.

### Create the tunnel (dashboard)

[Cloudflare Zero Trust](https://one.dash.cloudflare.com) → **Networks → Tunnels** →
**Create a tunnel** → type **Cloudflared** → name it `lopartidet` → **Save**.

The dashboard shows an install command containing a **connector token**. Run it on the
server:

```bash
# Install the connector (token comes from the dashboard "Install connector" step)
sudo cloudflared service install <CONNECTOR_TOKEN>
```

`cloudflared` runs as a systemd service and pulls its config from Cloudflare.

```bash
sudo systemctl status cloudflared
sudo journalctl -u cloudflared --follow
```

### Add public hostnames (dashboard)

In the tunnel → **Public Hostnames** tab → **Add a public hostname** for each entry.
The front-end points at **Caddy** on `localhost:80`; each .NET service points directly
at its own port. Cloudflare creates the DNS records automatically — no A records, no IP.

| Public hostname        | Service (dashboard)       | Target             |
|------------------------|---------------------------|--------------------|
| `yourdomain.com`       | `HTTP` → `localhost:80`   | Caddy (static FE)  |
| `api.yourdomain.com`   | `HTTP` → `localhost:3000` | .NET API           |
| `auth.yourdomain.com`  | `HTTP` → `localhost:4000` | .NET IdentityManager |
| `ssh.yourdomain.com`   | `SSH`  → `localhost:22`   | SSH                |

> **Firewall:** keep **all inbound ports closed**. Only outbound 443 to Cloudflare is
> needed. Do not `ufw allow 80/443`.

---

## 3. Caddy — Front-end server (behind the tunnel)

Caddy serves **only** the static front-end from `/var/www/html`. The .NET services are
reached directly by the tunnel (section 2), not through Caddy. Because Cloudflare
terminates TLS at the edge, Caddy listens on **plain HTTP, localhost only** — no Let's
Encrypt, no public binding.

### Installation

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

### Caddyfile — `/etc/caddy/Caddyfile`

Match on the `Host` header (the tunnel forwards it) and bind HTTP only. Using
`http://` site addresses tells Caddy **not** to attempt automatic HTTPS.

```
# Static front-end (only site Caddy serves)
http://yourdomain.com {
    root * /var/www/html
    file_server
    try_files {path} /index.html      # SPA fallback for Expo Router
}
```

> **Note:** TLS is handled by Cloudflare. Caddy serves the FE over plain HTTP on
> localhost. The .NET services are exposed by the tunnel directly, not by Caddy.

### Commands

```bash
sudo systemctl enable caddy
sudo systemctl reload caddy            # after editing the Caddyfile (no downtime)
sudo systemctl status caddy
sudo journalctl -u caddy --follow
```

Front-end file permissions (the `deploy.ps1` web deploy sets these automatically):

```bash
sudo chown -R www-data:www-data /var/www/html
```

---

## 4. .NET Services

### systemd service — `/etc/systemd/system/lopartidet.service`

```ini
[Unit]
Description=LoPartidet API
After=network.target

[Service]
WorkingDirectory=/opt/lopartidet
ExecStart=/usr/bin/dotnet /opt/lopartidet/LoPartidet.API.dll
Restart=always
RestartSec=10
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:3000

[Install]
WantedBy=multi-user.target
```

> `ASPNETCORE_URLS` binds **localhost** only and must match the port in the Caddyfile
> `reverse_proxy` directive. Services are never exposed directly.

### Service commands

```bash
sudo systemctl enable lopartidet
sudo systemctl restart lopartidet      # after a deploy
sudo systemctl status lopartidet
sudo journalctl -u lopartidet --follow
```

### Services in this deployment

| Service          | Port | Hostname               | systemd unit              | Remote dir             |
|------------------|------|------------------------|---------------------------|------------------------|
| LoPartidet API   | 3000 | `api.yourdomain.com`   | `lopartidet.service`      | `/opt/lopartidet`      |
| IdentityManager  | 4000 | `auth.yourdomain.com`  | `identitymanager.service` | `/opt/identitymanager` |
| Web (static)     | —    | `yourdomain.com`       | Caddy → `/var/www/html`   | `/var/www/html`        |

---

## 5. Deployment (`deploy.ps1`)

Run from the repo root on Windows (PowerShell):

```powershell
./deploy.ps1
```

The script:
1. Asks which services to deploy, then prompts for the SSH password (never stored).
2. Connects over SSH through the Cloudflare Tunnel (see section 6).
3. Builds locally, backs up the remote target, uploads a tarball, restarts the service.
   For the web build it restarts **nginx and caddy**.

---

## 6. SSH access through the Tunnel

SSH also goes through Cloudflare (no open port 22). Install `cloudflared` on your
**client** machine, then add a `ProxyCommand` so `ssh`/`scp` route through the tunnel.

`~/.ssh/config`:

```
Host ssh.yourdomain.com
  ProxyCommand "C:\Program Files (x86)\cloudflared\cloudflared.exe" access ssh --hostname %h
```

> Use the full path to `cloudflared.exe` (or ensure it is on `PATH`) — a bare
> `cloudflared` fails when it is not on `PATH`.

Test:

```bash
ssh urano@ssh.yourdomain.com "whoami"
```

`deploy.ps1` relies on this config to connect.

---

## 7. Troubleshooting

### Hostname returns 502 / Cloudflare 1033 (tunnel error)
Cloudflare can't reach the local service.

```bash
# Tunnel up?
sudo systemctl status cloudflared
sudo journalctl -u cloudflared --follow

# Is Caddy up (FE) and are the apps listening?
sudo systemctl status caddy
sudo ss -tlnp | grep -E ':(80|3000|4000)'
curl http://localhost:80        # front-end via Caddy
curl http://localhost:3000      # .NET API directly
```

### DNS not resolving
Confirm the domain is **Active** on Cloudflare and the hostname is listed under the
tunnel's **Public Hostnames** (Zero Trust → Networks → Tunnels → `lopartidet`).

```bash
nslookup api.yourdomain.com 1.1.1.1
```

### SSH connection times out or `Permission denied`
- `ProxyCommand` path wrong / `cloudflared` not found → fix `~/.ssh/config`.
- Password rejected → confirm the login user and `PasswordAuthentication yes` in
  `/etc/ssh/sshd_config`.

```bash
cloudflared --version
ssh -v urano@ssh.yourdomain.com "true"
```

---

## Architecture Summary

```
Internet
   │  HTTPS (TLS terminated at Cloudflare edge)
   ▼
Cloudflare  ──── yourdomain.com      ┐
                 api.yourdomain.com  │  outbound tunnel (no inbound ports)
                 auth.yourdomain.com │
                 ssh.yourdomain.com  ┘
                        │
                        ▼
                 cloudflared (server)
        ┌───────────────┼────────────────────┐
        ▼               ▼                     ▼
 Caddy (:80)      localhost:3000         localhost:4000
 /var/www/html    LoPartidet API         IdentityManager
 (static FE)      (systemd)              (systemd)
```
