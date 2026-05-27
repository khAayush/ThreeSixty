# ThreeSixty

A self-hosted Inventory Management Platform built with the MERN stack.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.4+ — included in Docker Desktop)
- A Linux/Mac terminal (or WSL2 on Windows) for running `setup.sh`

---

## Deployment — First Time

### 1. Clone and configure

```bash
git clone https://github.com/khAayush/ThreeSixty.git
cd ThreeSixty

cp .env.example .env
nano .env          # fill in all values — see Configuration section below
```

### 2. Run the setup script

```bash
chmod +x setup.sh
./setup.sh
```

The script will:
1. Verify Docker is installed
2. Build all three containers (MongoDB, backend, frontend/Nginx)
3. Wait for all services to be healthy
4. Run the interactive setup wizard (`backend/scripts/setup.js` → runs as `scripts/setup.js` inside the container) — you will configure your organisation name, brand colour, allowed Google login domains, and create the manager (super-admin) account
5. Print your application URL

That's it. The app is live.

---

## Configuration (`.env`)

Copy `.env.example` to `.env` and fill in every value before running `./setup.sh`.

### Key variables

| Variable | Description |
|---|---|
| `MONGO_URI` | `mongodb://mongo:27017/threesixty` for local Docker MongoDB, or your Atlas URI |
| `JWT_SECRET` | Random 64-char hex string — see command below |
| `ENCRYPTION_KEY` | Random 32-byte hex (64 chars) — see command below |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console (Credentials page) |
| `EMAIL` / `EMAIL_PASSWORD` | Gmail address + App Password for outgoing mail |
| `FRONTEND_URL` / `CLIENT_URL` | Your server's public URL (same value for both) — used for CORS |
| `VITE_API_URL` | Full URL to the API as seen from the browser (e.g. `http://your-ip/api`) |
| `VITE_GOOGLE_CLIENT_ID` | Same as `GOOGLE_CLIENT_ID` — baked into the React bundle at build time |

### Generating secrets

```bash
# JWT_SECRET (64-char hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# ENCRYPTION_KEY (must be exactly 64 hex chars = 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### URL configuration

All traffic goes through the Nginx container on port 80. The backend is not directly exposed.

| Scenario | `VITE_API_URL` | `FRONTEND_URL` / `CLIENT_URL` |
|---|---|---|
| VPS with IP only | `http://1.2.3.4/api` | `http://1.2.3.4` |
| VPS with domain (HTTP) | `http://example.com/api` | `http://example.com` |
| VPS with domain (HTTPS) | `https://example.com/api` | `https://example.com` |

> **Important:** `VITE_API_URL` is compiled into the React bundle at build time. If you change it, you must rebuild: `docker compose up --build -d`

---

## Container Architecture

```
Browser
  │
  ▼  port 80
┌─────────────────────────────┐
│  frontend  (nginx:alpine)   │
│  • Serves React SPA         │
│  • Proxies /api/* to        │
│    backend:5000             │
│  • Proxies /socket.io/* to  │
│    backend:5000 (WebSocket) │
└───────────────┬─────────────┘
                │ internal Docker network (threesixty_net)
                ▼
┌─────────────────────────────┐
│  backend   (node:22-alpine) │
│  • Express 5 REST API       │
│  • Socket.IO 4 (chat +      │
│    notifications)           │
│  • port 5000 (internal)     │
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│  mongo     (mongo:7)        │
│  • port 27017 (internal)    │
│  • Volume: mongo_data       │
└─────────────────────────────┘
```

---

## Daily Operations

```bash
# View live logs (all services)
docker compose logs -f

# View logs for one service
docker compose logs -f backend

# Stop all containers
docker compose down

# Start previously built containers
docker compose up -d

# Restart a single service
docker compose restart backend

# Open a shell in the backend container
docker compose exec backend sh
```

---

## Updating the Application

Use the included `update.sh` script for a guided update:

```bash
chmod +x update.sh
./update.sh
```

The script will:
1. Check for uncommitted local changes and warn you before pulling
2. Run `git pull` and display every new commit that was added
3. Warn you if `.env.example` changed (meaning new variables may need to be added to your `.env`)
4. Rebuild only the Docker layers that changed and restart containers
5. Wait for all health checks to pass, then print the final status

### Manual update (without the script)

```bash
git pull
docker compose up --build -d
```

**Note:** If `VITE_API_URL` or `VITE_GOOGLE_CLIENT_ID` changed in `.env`, the frontend image must be rebuilt — `--build` handles this automatically. Docker rebuilds only the layers that changed. The MongoDB data volume is never touched during updates.

---

## Re-running the Setup Wizard

You can re-run the interactive setup wizard at any time to update organisation settings or the manager account:

```bash
docker compose exec backend node scripts/setup.js
```

---

## Backup

MongoDB data is stored in the `threesixty_mongo_data` Docker named volume.

### Export a backup

```bash
docker compose exec mongo mongodump --db threesixty --archive \
  | gzip > threesixty-backup-$(date +%Y%m%d).gz
```

### Restore from backup

```bash
gunzip -c threesixty-backup-20240101.gz \
  | docker compose exec -T mongo mongorestore --archive
```

Schedule daily backups with cron:

```cron
0 2 * * * cd /path/to/ThreeSixty && docker compose exec -T mongo mongodump --db threesixty --archive | gzip > /backups/threesixty-$(date +\%Y\%m\%d).gz
```

---

## HTTPS / SSL (Strongly Recommended for Production)

The setup above runs on HTTP. For production, add HTTPS.

### Option A: Caddy (easiest — auto-renews Let's Encrypt)

Install Caddy on the host (not inside Docker):

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudflare.com/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy.gpg] https://dl.cloudflare.com/caddy/stable/debian.packages stable main" | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

`/etc/caddy/Caddyfile`:
```
example.com {
    reverse_proxy localhost:80
}
```

Then update `.env`:
```
FRONTEND_URL=https://example.com
CLIENT_URL=https://example.com
VITE_API_URL=https://example.com/api
```

Rebuild: `docker compose up --build -d`

### Option B: Certbot + Nginx on host

Follow the [Certbot instructions](https://certbot.eff.org/) for your Linux distribution.

---

## Troubleshooting

### Containers won't start

```bash
# Check which service failed
docker compose ps

# View its logs
docker compose logs backend
docker compose logs mongo
docker compose logs frontend
```

### MongoDB connection refused

The backend waits for MongoDB's healthcheck before starting. If it still fails:

```bash
docker compose restart mongo
docker compose restart backend
```

### Frontend shows blank page or 404 errors

The `VITE_API_URL` baked at build time may be wrong. Check and rebuild:

```bash
grep VITE_API_URL .env
docker compose up --build -d frontend
```

### Socket.IO / chat not connecting

Ensure `FRONTEND_URL` and `CLIENT_URL` in `.env` exactly match the URL in your browser (including protocol and no trailing slash). Then restart the backend:

```bash
docker compose restart backend
```

### Re-run setup after containers are already running

```bash
docker compose exec backend node scripts/setup.js
```

### Full reset (wipes all data)

```bash
docker compose down -v   # -v removes named volumes (deletes MongoDB data)
./setup.sh
```

---

## Security Checklist

Before exposing publicly:

- [ ] Replace `JWT_SECRET` with a random 64-char hex string
- [ ] Replace `ENCRYPTION_KEY` with a random 32-byte hex (64 chars)
- [ ] Use a real `GOOGLE_CLIENT_ID` from Google Cloud Console (set Authorized Origins)
- [ ] Use an App Password for `EMAIL_PASSWORD`, not your Gmail account password
- [ ] Add HTTPS (see above) — cookies should be `Secure` over HTTPS
- [ ] Set a server firewall to allow only ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] MongoDB port 27017 must NOT be exposed externally (it isn't by default in this setup)
- [ ] Schedule regular database backups

---

## Project Structure

```
ThreeSixty/
├── backend/
│   ├── app.js                  # Express + HTTP server + Socket.IO init
│   ├── Dockerfile
│   ├── config/                 # DB connection
│   ├── controllers/            # Route handlers
│   ├── middlewares/            # verifyToken, requireAdmin, requireManager
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── scripts/
│   │   └── setup.js            # Interactive first-run setup wizard
│   └── utils/
│       ├── socket.js           # Socket.IO server (chat + notifications)
│       ├── encryption.js       # AES-256-GCM message encryption
│       ├── sendEmail.js        # Nodemailer wrapper
│       └── createNotification.js
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf              # SPA + API/WebSocket proxy config
│   ├── src/
│   │   ├── contexts/
│   │   │   ├── ChatContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/
│   │   └── components/
│   └── package.json
├── docker-compose.yml
├── .env.example
├── setup.sh                    ← first-time deploy
├── update.sh                   ← pull + rebuild + restart
└── README.md
```
