# Atomic CRM - Self-Hosted Supabase on DigitalOcean

## Executive Summary

**Architecture: Self-Hosted Supabase + App Platform Frontend**

This plan provides complete instructions for deploying Atomic CRM with:
- **Frontend**: DigitalOcean App Platform (managed static hosting)
- **Backend**: Self-Hosted Supabase on DigitalOcean Droplet (Docker-based)

**Estimated Monthly Cost**: $29-60/month
- App Platform: $5-12/month
- Droplet: $24-48/month  
- Volumes (backup): $1-5/month

### Why Self-Host Supabase?

**Advantages** ✅
- Full data control and ownership
- No usage-based pricing surprises
- Customizable infrastructure
- Meet specific compliance requirements
- No vendor lock-in

**Trade-offs** ⚠️
- Requires DevOps knowledge
- Manual maintenance and updates
- You manage backups and security
- No automatic scaling
- Single point of failure (unless HA setup)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Internet                            │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               │ HTTPS                │ HTTPS
               │                      │
    ┌──────────▼──────────┐  ┌────────▼─────────────────┐
    │  App Platform       │  │  DigitalOcean Droplet    │
    │  ┌──────────────┐   │  │  (Ubuntu 22.04)          │
    │  │ React SPA    │───┼──┤                          │
    │  │ (Static)     │   │  │  ┌────────────────────┐  │
    │  └──────────────┘   │  │  │ Docker Compose     │  │
    └─────────────────────┘  │  │                    │  │
                             │  │ ┌────────────────┐ │  │
                             │  │ │ PostgreSQL     │ │  │
                             │  │ │ (Port 5432)    │ │  │
                             │  │ └────────────────┘ │  │
                             │  │ ┌────────────────┐ │  │
                             │  │ │ PostgREST API  │ │  │
                             │  │ │ (Port 3000)    │ │  │
                             │  │ └────────────────┘ │  │
                             │  │ ┌────────────────┐ │  │
                             │  │ │ GoTrue Auth    │ │  │
                             │  │ │ (Port 9999)    │ │  │
                             │  │ └────────────────┘ │  │
                             │  │ ┌────────────────┐ │  │
                             │  │ │ Storage API    │ │  │
                             │  │ │ (Port 5000)    │ │  │
                             │  │ └────────────────┘ │  │
                             │  │ ┌────────────────┐ │  │
                             │  │ │ Realtime       │ │  │
                             │  │ │ (Port 4000)    │ │  │
                             │  │ └────────────────┘ │  │
                             │  │ ┌────────────────┐ │  │
                             │  │ │ Kong Gateway   │ │  │
                             │  │ │ (Port 8000)    │ │  │
                             │  │ └────────────────┘ │  │
                             │  │ ┌────────────────┐ │  │
                             │  │ │ Deno (Edge Fn) │ │  │
                             │  │ │ (Port 9000)    │ │  │
                             │  │ └────────────────┘ │  │
                             │  └────────────────────┘  │
                             │                          │
                             │  ┌────────────────────┐  │
                             │  │ Volume (Postgres)  │  │
                             │  │ /var/lib/postgres  │  │
                             │  └────────────────────┘  │
                             └──────────────────────────┘
```

---

## Phase 1: Droplet Setup

### Step 1.1: Create Droplet

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. Click **Create** → **Droplets**
3. Configure:
   - **Image**: Ubuntu 22.04 LTS x64
   - **Plan**: 
     - Basic: $24/month (4GB RAM / 2 vCPUs) - minimum
     - General Purpose: $48/month (8GB RAM / 4 vCPUs) - recommended
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) or password
   - **Hostname**: `atomic-crm-supabase`
   - **Tags**: `production`, `supabase`, `atomic-crm`

4. Click **Create Droplet**
5. Note the IP address once created

### Step 1.2: Initial Server Setup

SSH into your droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

Update system packages:

```bash
apt update && apt upgrade -y
```

Create a non-root user:

```bash
adduser atomic
usermod -aG sudo atomic
```

Configure firewall:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Step 1.3: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add user to docker group
usermod -aG docker atomic

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Step 1.4: Configure Domain (Required)

You need a domain/subdomain for SSL certificates. Configure DNS:

```
Type: A Record
Name: api.yourdomain.com (or supabase.yourdomain.com)
Value: YOUR_DROPLET_IP
TTL: 300
```

Wait for DNS propagation (5-60 minutes). Verify:

```bash
dig api.yourdomain.com
```

---

## Phase 2: Deploy Self-Hosted Supabase

### Step 2.1: Clone Supabase

Switch to the atomic user:

```bash
su - atomic
```

Clone Supabase repository:

```bash
cd ~
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
```

### Step 2.2: Configure Environment

Copy example environment file:

```bash
cp .env.example .env
```

Generate secure secrets:

```bash
# Generate JWT secret (save this!)
openssl rand -base64 32

# Generate anon key and service role key
# Use https://supabase.com/docs/guides/self-hosting\#api-keys
# Or use the Supabase CLI:
npm install -g supabase
supabase gen keys
```

Edit `.env` file:

```bash
nano .env
```

Update these critical values:

```bash
############
# Secrets
############
POSTGRES_PASSWORD=your-super-secret-postgres-password
JWT_SECRET=your-generated-jwt-secret-from-above
ANON_KEY=your-generated-anon-key
SERVICE_ROLE_KEY=your-generated-service-role-key

############
# Database
############
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432

############
# API
############
API_EXTERNAL_URL=https://api.yourdomain.com
SUPABASE_PUBLIC_URL=https://api.yourdomain.com

############
# Auth
############
SITE_URL=https://your-app-name.ondigitalocean.app
ADDITIONAL_REDIRECT_URLS=https://your-app-name.ondigitalocean.app/auth-callback.html
DISABLE_SIGNUP=false

############
# Email (SMTP)
############
SMTP_ADMIN_EMAIL=admin@yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_SENDER_NAME=Atomic CRM

############
# Storage
############
STORAGE_BACKEND=file
FILE_SIZE_LIMIT=52428800
```

**Important**: Save the `ANON_KEY` and `SERVICE_ROLE_KEY` - you'll need these for the frontend!

### Step 2.3: Configure Reverse Proxy (Caddy)

Create Caddyfile for automatic HTTPS:

```bash
nano Caddyfile
```

Add:

```
api.yourdomain.com {
    reverse_proxy kong:8000
}
```

Update `docker-compose.yml` to add Caddy:

```bash
nano docker-compose.yml
```

Add this service:

```yaml
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - default

volumes:
  caddy_data:
  caddy_config:
```

### Step 2.4: Start Supabase Stack

```bash
docker compose up -d
```

Wait for all services to start (2-3 minutes):

```bash
docker compose ps
```

All services should show "Up" status.

Check logs:

```bash
docker compose logs -f
```

### Step 2.5: Verify Installation

Test API endpoint:

```bash
curl https://api.yourdomain.com/rest/v1/
```

You should see a response (even if it's an auth error - that's expected).

Access Supabase Studio (optional):

```
http://YOUR_DROPLET_IP:3000
```

Default credentials:
- Email: `supabase@example.com`  
- Password: `this_password_is_insecure_and_should_be_updated`

**Change these immediately in production!**

---

## Phase 3: Database Setup

### Step 3.1: Apply Migrations

From your local machine (where you have the Atomic CRM code):

```bash
cd /path/to/atomic-crm

# Configure Supabase CLI to use self-hosted instance
npx supabase link --project-ref default --password your-postgres-password

# Update .supabase/config.toml with your API URL
nano .supabase/config.toml
```

Update the config:

```toml
[api]
url = "https://api.yourdomain.com"

[db]
host = "YOUR_DROPLET_IP"
port = 5432
user = "postgres"
password = "your-postgres-password"
database = "postgres"
```

Push migrations:

```bash
npx supabase db push
```

This will create all tables, views, triggers, and seed data.

### Step 3.2: Deploy Edge Functions

```bash
# Set environment variables for edge functions
export SUPABASE_URL=https://api.yourdomain.com
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Deploy all functions
npx supabase functions deploy --project-ref default
```

---

## Phase 4: Frontend Deployment (App Platform)

### Step 4.1: Prepare Repository

Ensure your code is in Git (GitHub/GitLab/Bitbucket).

### Step 4.2: Create App Platform App

1. Go to DigitalOcean → **App Platform** → **Create App**
2. Connect to your Git repository
3. Select branch (e.g., `main`)
4. Enable **Autodeploy**

### Step 4.3: Configure Build Settings

- **Resource Type**: Static Site
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4.4: Set Environment Variables

Add these in App Platform settings:

```
VITE_SUPABASE_URL=https://api.yourdomain.com
VITE_SB_PUBLISHABLE_KEY=your-anon-key-from-supabase-env
VITE_IS_DEMO=false
VITE_INBOUND_EMAIL=your-email@inbound.postmarkapp.com
```

### Step 4.5: Deploy

Click **Create Resources** and wait for deployment (5-10 minutes).

### Step 4.6: Update Supabase Auth URLs

Once deployed, update Supabase auth configuration.

SSH into droplet:

```bash
ssh atomic@YOUR_DROPLET_IP
cd ~/supabase/docker
nano .env
```

Update:

```bash
SITE_URL=https://your-app-name.ondigitalocean.app
ADDITIONAL_REDIRECT_URLS=https://your-app-name.ondigitalocean.app/auth-callback.html
```

Restart services:

```bash
docker compose restart
```

---

## Phase 5: Backup Strategy

### Step 5.1: Create Volume for Backups

In DigitalOcean:
1. **Volumes** → **Create Volume**
2. Size: 50GB (adjust based on database size)
3. Name: `atomic-crm-backups`
4. Attach to your droplet

Mount the volume:

```bash
sudo mkdir -p /mnt/backups
sudo mount -o discard,defaults /dev/disk/by-id/scsi-0DO_Volume_atomic-crm-backups /mnt/backups
echo '/dev/disk/by-id/scsi-0DO_Volume_atomic-crm-backups /mnt/backups ext4 defaults,nofail,discard 0 0' | sudo tee -a /etc/fstab
```

### Step 5.2: Automated Database Backups

Create backup script:

```bash
sudo nano /usr/local/bin/backup-supabase.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/mnt/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

# Backup database
docker exec supabase-db pg_dumpall -U postgres | gzip > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

Make executable:

```bash
sudo chmod +x /usr/local/bin/backup-supabase.sh
```

Schedule daily backups:

```bash
sudo crontab -e
```

Add:

```
0 2 * * * /usr/local/bin/backup-supabase.sh >> /var/log/supabase-backup.log 2>&1
```

### Step 5.3: DigitalOcean Snapshots

Enable weekly droplet snapshots:
1. Droplet → **Backups**
2. Enable automated backups ($4.80/month for $24 droplet)

---

## Phase 6: Monitoring & Maintenance

### Step 6.1: Install Monitoring Tools

```bash
# Install monitoring stack
sudo apt install prometheus grafana -y
```

Or use DigitalOcean Monitoring (built-in):
- Droplet → **Monitoring** tab
- View CPU, memory, disk, bandwidth

### Step 6.2: Log Management

View Docker logs:

```bash
cd ~/supabase/docker
docker compose logs -f [service-name]
```

Set up log rotation:

```bash
sudo nano /etc/docker/daemon.json
```

Add:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

### Step 6.3: Update Supabase

Check for updates:

```bash
cd ~/supabase/docker
git fetch
git log HEAD..origin/master --oneline
```

Update (with caution):

```bash
# Backup first!
/usr/local/bin/backup-supabase.sh

# Pull updates
git pull

# Restart services
docker compose down
docker compose pull
docker compose up -d
```

---

## Phase 7: Security Hardening

### Step 7.1: Configure Firewall

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 7.2: Fail2Ban

Install fail2ban to prevent brute force:

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Step 7.3: SSL/TLS Configuration

Caddy handles this automatically, but verify:

```bash
curl -I https://api.yourdomain.com
```

Look for `HTTP/2 200` and valid SSL certificate.

### Step 7.4: Database Security

Ensure PostgreSQL is not exposed:

```bash
sudo ufw status
```

Port 5432 should NOT be open to the internet.

---

## Cost Breakdown

| Component | Specification | Monthly Cost |
|-----------|--------------|--------------|
| **Droplet** | 4GB RAM / 2 vCPU | $24 |
| **Droplet** | 8GB RAM / 4 vCPU (recommended) | $48 |
| **App Platform** | Basic (512MB) | $5 |
| **App Platform** | Professional (1GB) | $12 |
| **Volume** | 50GB backup storage | $5 |
| **Backups** | Automated snapshots | $4.80 |
| **Bandwidth** | 4TB included | $0 |

**Total (Minimum)**: $29/month (Basic droplet + Basic app platform)  
**Total (Recommended)**: $60/month (8GB droplet + Professional app platform + backups)

---

## Troubleshooting

### Issue: Services Won't Start

```bash
cd ~/supabase/docker
docker compose logs
```

Common fixes:
- Check `.env` file for syntax errors
- Ensure ports aren't already in use
- Verify Docker has enough resources

### Issue: Can't Connect to Database

```bash
docker exec -it supabase-db psql -U postgres
```

If this fails, check PostgreSQL logs:

```bash
docker compose logs db
```

### Issue: SSL Certificate Errors

Verify Caddy is running:

```bash
docker compose ps caddy
```

Check Caddy logs:

```bash
docker compose logs caddy
```

Ensure DNS is properly configured:

```bash
dig api.yourdomain.com
```

### Issue: Out of Disk Space

Check disk usage:

```bash
df -h
docker system df
```

Clean up:

```bash
docker system prune -a
```

Consider upgrading droplet or adding volume.

---

## Scaling Strategy

### Vertical Scaling (Easier)

Resize droplet:
1. Power off droplet
2. Resize to larger plan
3. Power on

### Horizontal Scaling (Advanced)

For high availability:
1. Set up PostgreSQL replication
2. Add load balancer for API
3. Use managed PostgreSQL (DigitalOcean Managed Database)
4. Separate services across multiple droplets

---

## Migration from Supabase Cloud

If migrating from Supabase Cloud:

```bash
# Export from cloud
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > cloud_backup.sql

# Import to self-hosted
cat cloud_backup.sql | docker exec -i supabase-db psql -U postgres
```

---

## Conclusion

Self-hosting Supabase gives you complete control over your CRM infrastructure. While it requires more technical expertise than using Supabase Cloud, you gain:

✅ Full data ownership  
✅ Predictable costs  
✅ Customization freedom  
✅ No vendor lock-in  

**Recommended for:**
- Teams with DevOps expertise
- Organizations with data residency requirements
- Projects requiring custom Supabase modifications
- Cost-conscious deployments with predictable usage

**Not recommended for:**
- Teams without DevOps resources
- Projects needing rapid deployment
- Applications requiring automatic scaling
- Teams preferring managed services

---

**Document Version**: 1.0  
**Last Updated**: 2026-03-25  
**Maintained By**: Atomic CRM Team
