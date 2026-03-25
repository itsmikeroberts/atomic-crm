# Atomic CRM - DigitalOcean Deployment Plan

## Executive Summary

**Recommendation: Use DigitalOcean App Platform**

This plan outlines the deployment of Atomic CRM to production using:
- **Frontend**: DigitalOcean App Platform (managed static site hosting)
- **Backend**: Supabase Cloud (managed PostgreSQL + API + Auth + Storage)

**Estimated Monthly Cost**: $20-30 ($5-12 for App Platform + $15-20 for Supabase)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
         ┌───────────────▼──────────────────┐
         │   DigitalOcean App Platform      │
         │   ┌──────────────────────────┐   │
         │   │  React Frontend (SPA)    │   │
         │   │  - Static files (dist/)  │   │
         │   │  - CDN distribution      │   │
         │   │  - Auto SSL/HTTPS        │   │
         │   └──────────────────────────┘   │
         └───────────────┬──────────────────┘
                         │
                         │ REST API / WebSocket
                         │
         ┌───────────────▼──────────────────┐
         │      Supabase Cloud              │
         │  ┌────────────────────────────┐  │
         │  │  PostgreSQL Database       │  │
         │  │  - Tables & Views          │  │
         │  │  - Migrations              │  │
         │  └────────────────────────────┘  │
         │  ┌────────────────────────────┐  │
         │  │  REST API (PostgREST)      │  │
         │  │  - Auto-generated API      │  │
         │  └────────────────────────────┘  │
         │  ┌────────────────────────────┐  │
         │  │  Auth Service (GoTrue)     │  │
         │  │  - Email/password          │  │
         │  │  - OAuth (Google, etc.)    │  │
         │  └────────────────────────────┘  │
         │  ┌────────────────────────────┐  │
         │  │  Storage (S3-compatible)   │  │
         │  │  - File attachments        │  │
         │  └────────────────────────────┘  │
         │  ┌────────────────────────────┐  │
         │  │  Edge Functions (Deno)     │  │
         │  │  - User management         │  │
         │  │  - Email webhook           │  │
         │  └────────────────────────────┘  │
         └──────────────────────────────────┘
```

## Why App Platform Over Droplet?

### App Platform Advantages ✅

| Feature | App Platform | Droplet |
|---------|--------------|---------|
| **Setup Time** | 10-15 minutes | 2-4 hours |
| **Maintenance** | Zero (fully managed) | High (OS updates, security patches) |
| **CI/CD** | Built-in from Git | Manual setup required |
| **SSL/HTTPS** | Automatic & free | Manual (Let's Encrypt setup) |
| **Scaling** | Automatic | Manual resize/load balancer |
| **CDN** | Included globally | Requires separate setup |
| **Monitoring** | Built-in dashboard | Manual setup (Prometheus, etc.) |
| **Cost (Basic)** | $5-12/month | $6/month + time investment |
| **Deployment** | Git push → auto-deploy | SSH, manual commands |
| **Rollback** | One-click | Manual process |

### When to Use Droplet ❌

Only consider Droplet if you need:
- Custom server-side processing beyond edge functions
- Full control over the operating system
- Multiple services on one server (not recommended for this app)
- Specific compliance requirements requiring self-hosted infrastructure

**For Atomic CRM: App Platform is the clear winner.**

## Deployment Steps

### Phase 1: Supabase Cloud Setup

#### Step 1.1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Configure project:
   - **Organization**: Create or select existing
   - **Project Name**: `atomic-crm-production` (or your preferred name)
   - **Database Password**: Generate strong password (save securely!)
   - **Region**: Choose closest to your users (e.g., `eu-west-1` for Europe)
   - **Pricing Plan**: Start with Free tier, upgrade to Pro if needed

4. Wait for project provisioning (2-3 minutes)

#### Step 1.2: Configure Database

1. In Supabase Dashboard, go to **Project Settings** → **API**
2. Copy and save these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (for frontend)
   - **service_role key**: `eyJhbGc...` (for edge functions, keep secret!)

3. Go to **SQL Editor** and verify connection

#### Step 1.3: Run Database Migrations

From your local development machine:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your remote project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations to production
npx supabase db push

# Verify migrations applied
npx supabase db remote commit
```

**Important**: This will create all tables, views, triggers, and seed data from the migration files in [`supabase/migrations/`](../supabase/migrations/).

#### Step 1.4: Deploy Edge Functions

```bash
# Deploy all edge functions
npx supabase functions deploy

# Or deploy individually
npx supabase functions deploy users
npx supabase functions deploy postmark
npx supabase functions deploy update_password
npx supabase functions deploy delete_note_attachments
npx supabase functions deploy merge_contacts
```

Verify deployment in Supabase Dashboard → **Edge Functions**.

#### Step 1.5: Configure Authentication

1. In Supabase Dashboard → **Authentication** → **URL Configuration**:
   - **Site URL**: `https://your-app-name.ondigitalocean.app` (update after App Platform deployment)
   - **Redirect URLs**: Add `https://your-app-name.ondigitalocean.app/auth-callback.html`

2. **Authentication** → **Providers**:
   - Enable **Email** provider (enabled by default)
   - Optionally enable **Google OAuth**:
     - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
     - Add authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`
     - Enter Client ID and Client Secret in Supabase

3. **Authentication** → **Email Templates**:
   - Customize invite, recovery, and confirmation emails if desired

#### Step 1.6: Configure Storage

1. In Supabase Dashboard → **Storage**
2. Verify `attachments` bucket exists (created by migrations)
3. Configure bucket policies if needed (public vs. private files)

#### Step 1.7: Set Up Inbound Email (Optional)

If using the email capture feature:

1. Sign up for [Postmark](https://postmarkapp.com/) (free tier available)
2. Create inbound webhook pointing to your Supabase edge function:
   - URL: `https://xxxxx.supabase.co/functions/v1/postmark`
   - Add authorization header (configure in edge function)
3. Update environment variable `VITE_INBOUND_EMAIL` with your Postmark address

### Phase 2: DigitalOcean App Platform Setup

#### Step 2.1: Prepare Repository

1. Ensure your code is pushed to GitHub/GitLab/Bitbucket
2. Verify [`package.json`](../package.json) has correct build script:
   ```json
   {
     "scripts": {
       "build": "tsc && vite build"
     }
   }
   ```

3. Create production environment file (`.env.production` - **DO NOT COMMIT**):
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SB_PUBLISHABLE_KEY=eyJhbGc...
   VITE_IS_DEMO=false
   VITE_INBOUND_EMAIL=your-email@inbound.postmarkapp.com
   ```

#### Step 2.2: Create App Platform Application

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. Navigate to **App Platform** → **Create App**
3. **Source**: Connect to your Git repository
   - Choose provider (GitHub recommended)
   - Authorize DigitalOcean
   - Select repository: `your-username/atomic-crm`
   - Select branch: `main` (or `production`)
   - **Autodeploy**: Enable (deploys on every push)

4. Click **Next**

#### Step 2.3: Configure Build Settings

1. **Resource Type**: Static Site
2. **Build Command**: 
   ```bash
   npm run build
   ```
3. **Output Directory**: 
   ```
   dist
   ```
4. **Environment Variables**: Click "Edit" and add:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SB_PUBLISHABLE_KEY=eyJhbGc...
   VITE_IS_DEMO=false
   VITE_INBOUND_EMAIL=your-email@inbound.postmarkapp.com
   ```
   
   **Important**: Use the "Encrypt" option for sensitive values.

5. **Node Version**: Ensure it's set to Node 22 (check in build settings)

#### Step 2.4: Configure App Settings

1. **App Name**: `atomic-crm` (or your preferred name)
2. **Region**: Choose same region as Supabase for lower latency
3. **Plan**: 
   - **Basic**: $5/month (512MB RAM, 1 vCPU) - suitable for small teams
   - **Professional**: $12/month (1GB RAM, 1 vCPU) - recommended for production

4. **Routes**: Configure routing rules
   - Add catch-all route for SPA: `/*` → `index.html` (for React Router)

#### Step 2.5: Deploy Application

1. Review configuration
2. Click **Create Resources**
3. Wait for initial deployment (5-10 minutes)
4. Monitor build logs in real-time

#### Step 2.6: Verify Deployment

1. Once deployed, click the app URL: `https://your-app-name.ondigitalocean.app`
2. Test the application:
   - ✅ Page loads correctly
   - ✅ Can create first user account
   - ✅ Can log in
   - ✅ Can view dashboard
   - ✅ Can create contacts, tasks, deals
   - ✅ File uploads work (attachments)

3. Check browser console for errors
4. Verify API calls to Supabase are working (Network tab)

### Phase 3: Post-Deployment Configuration

#### Step 3.1: Update Supabase URLs

Go back to Supabase Dashboard → **Authentication** → **URL Configuration** and update:
- **Site URL**: `https://your-app-name.ondigitalocean.app`
- **Redirect URLs**: `https://your-app-name.ondigitalocean.app/auth-callback.html`

#### Step 3.2: Configure Custom Domain (Optional)

1. In DigitalOcean App Platform → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `crm.yourdomain.com`
4. Add DNS records to your domain provider:
   ```
   Type: CNAME
   Name: crm
   Value: your-app-name.ondigitalocean.app
   ```
5. Wait for DNS propagation (5-60 minutes)
6. App Platform will automatically provision SSL certificate

7. Update Supabase authentication URLs to use custom domain

#### Step 3.3: Set Up Monitoring

1. **DigitalOcean Monitoring**:
   - App Platform → **Insights** tab
   - Monitor: CPU, Memory, Request rate, Response time
   - Set up alerts for high error rates

2. **Supabase Monitoring**:
   - Dashboard → **Reports**
   - Monitor: Database size, API requests, Active users
   - Set up alerts for quota limits

3. **External Monitoring** (Optional):
   - Set up [UptimeRobot](https://uptimerobot.com/) for uptime monitoring
   - Configure [Sentry](https://sentry.io/) for error tracking in frontend

#### Step 3.4: Configure Backups

1. **Supabase Backups**:
   - Free tier: Daily backups (7-day retention)
   - Pro tier: Point-in-time recovery
   - Go to **Database** → **Backups** to verify

2. **Database Export** (Additional safety):
   ```bash
   # Schedule weekly exports
   npx supabase db dump -f backup-$(date +%Y%m%d).sql
   ```

#### Step 3.5: Security Hardening

1. **Row Level Security (RLS)**:
   - Verify all tables have RLS policies enabled
   - Check in Supabase Dashboard → **Database** → **Tables**
   - Review policies in migration files

2. **API Rate Limiting**:
   - Supabase Pro includes rate limiting
   - Configure in **Project Settings** → **API**

3. **CORS Configuration**:
   - Verify allowed origins in Supabase
   - Should only include your production domain

4. **Environment Variables**:
   - Never commit `.env` files to Git
   - Use DigitalOcean's encrypted environment variables
   - Rotate keys periodically

#### Step 3.6: Performance Optimization

1. **Enable CDN** (included with App Platform):
   - Static assets automatically cached globally
   - No additional configuration needed

2. **Database Indexing**:
   - Review slow queries in Supabase Dashboard
   - Add indexes as needed for performance

3. **Image Optimization**:
   - Consider using Supabase Image Transformation
   - Or integrate with Cloudinary/ImageKit

### Phase 4: Ongoing Operations

#### Deployment Workflow

```bash
# Development workflow
git checkout -b feature/new-feature
# Make changes...
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request, review, merge to main

# Automatic deployment
# App Platform automatically deploys when main branch is updated
```

#### Database Migrations

```bash
# Create new migration
npx supabase migration new add_new_field

# Edit migration file in supabase/migrations/

# Test locally
npx supabase db reset

# Deploy to production
npx supabase db push
```

#### Rollback Procedure

**App Platform Rollback**:
1. Go to App Platform → **Deployments**
2. Find previous successful deployment
3. Click **Rollback to this deployment**

**Database Rollback**:
1. Go to Supabase Dashboard → **Database** → **Backups**
2. Select backup point
3. Click **Restore**
4. **Warning**: This will overwrite current data

#### Scaling Strategy

**Vertical Scaling** (increase resources):
1. App Platform: Upgrade plan (Basic → Professional → Advanced)
2. Supabase: Upgrade plan (Free → Pro → Team → Enterprise)

**Horizontal Scaling**:
- App Platform: Automatically handles load balancing
- Supabase: Pro tier includes connection pooling and read replicas

**When to scale**:
- CPU usage consistently > 70%
- Memory usage consistently > 80%
- Response time > 2 seconds
- Database connections near limit

## Cost Breakdown

### Monthly Costs

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| **DigitalOcean App Platform** | Basic | $5/month | 512MB RAM, suitable for <1000 users |
| | Professional | $12/month | 1GB RAM, recommended for production |
| **Supabase** | Free | $0/month | 500MB database, 2GB bandwidth, 50MB storage |
| | Pro | $25/month | 8GB database, 250GB bandwidth, 100GB storage |
| **Custom Domain** | - | $12/year | Optional, if you don't have one |
| **Postmark** (Email) | Free | $0/month | 100 emails/month |
| | Paid | $15/month | 10,000 emails/month |

**Recommended Starting Configuration**: $5-12/month
- App Platform Basic: $5/month
- Supabase Free: $0/month
- Total: **$5/month**

**Production Configuration**: $37/month
- App Platform Professional: $12/month
- Supabase Pro: $25/month
- Total: **$37/month**

### Cost Optimization Tips

1. **Start with free tiers**: Upgrade only when needed
2. **Monitor usage**: Set up billing alerts in both platforms
3. **Optimize queries**: Reduce database load
4. **Cache aggressively**: Use React Query caching effectively
5. **Compress assets**: Vite does this automatically
6. **Use CDN**: Included with App Platform

## Troubleshooting

### Common Issues

#### Build Fails on App Platform

**Error**: `Module not found` or `Cannot find package`

**Solution**:
```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push

# Or delete and regenerate
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate package-lock.json"
git push
```

#### Environment Variables Not Working

**Error**: `VITE_SUPABASE_URL is undefined`

**Solution**:
1. Verify variables are prefixed with `VITE_` (required by Vite)
2. Check variables are set in App Platform settings
3. Trigger new deployment after adding variables
4. Check build logs for variable values (they should be `[REDACTED]`)

#### Authentication Redirect Fails

**Error**: `redirect_uri_mismatch`

**Solution**:
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your App Platform URL to **Redirect URLs**
3. Include both:
   - `https://your-app-name.ondigitalocean.app`
   - `https://your-app-name.ondigitalocean.app/auth-callback.html`

#### CORS Errors

**Error**: `Access-Control-Allow-Origin` error in console

**Solution**:
1. Verify Supabase API URL is correct in environment variables
2. Check CORS settings in Supabase Dashboard
3. Ensure you're using `anon` key, not `service_role` key in frontend

#### Database Connection Errors

**Error**: `Connection pool exhausted`

**Solution**:
1. Upgrade to Supabase Pro for connection pooling
2. Review and optimize database queries
3. Implement proper connection management in edge functions

#### File Upload Fails

**Error**: `Storage bucket not found`

**Solution**:
1. Verify migrations created `attachments` bucket
2. Check bucket policies in Supabase Dashboard → **Storage**
3. Ensure RLS policies allow authenticated users to upload

### Getting Help

- **DigitalOcean Support**: [cloud.digitalocean.com/support](https://cloud.digitalocean.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Community**: [GitHub Discussions](https://github.com/marmelab/atomic-crm/discussions)

## Security Checklist

Before going live, verify:

- [ ] All environment variables are encrypted in App Platform
- [ ] Service role key is NOT exposed in frontend code
- [ ] RLS policies are enabled on all tables
- [ ] Authentication is properly configured
- [ ] HTTPS is enforced (automatic with App Platform)
- [ ] CORS is configured to only allow your domain
- [ ] Database backups are enabled
- [ ] Monitoring and alerts are configured
- [ ] Strong passwords are used for all accounts
- [ ] Two-factor authentication is enabled for admin accounts

## Performance Checklist

- [ ] Build size is optimized (check `dist/` folder size)
- [ ] Images are compressed and optimized
- [ ] Database queries use proper indexes
- [ ] React Query caching is configured
- [ ] CDN is enabled (automatic with App Platform)
- [ ] Lazy loading is implemented for routes
- [ ] Bundle analysis shows no duplicate dependencies

## Compliance Considerations

### GDPR (EU Users)

- [ ] Choose EU region for Supabase (e.g., `eu-west-1`)
- [ ] Implement data export functionality (already included)
- [ ] Add privacy policy and terms of service
- [ ] Implement user data deletion (account deletion feature)
- [ ] Add cookie consent banner if using analytics

### Data Residency

- Deploy Supabase and App Platform in the same region
- Available regions:
  - **US**: `us-east-1`, `us-west-1`
  - **EU**: `eu-west-1`, `eu-central-1`
  - **Asia**: `ap-southeast-1`, `ap-northeast-1`

## Alternative Deployment Options

If DigitalOcean App Platform doesn't meet your needs:

### Option 2: Vercel + Supabase
- **Pros**: Excellent DX, edge functions, automatic preview deployments
- **Cons**: More expensive at scale, vendor lock-in
- **Cost**: $20/month (Pro plan)

### Option 3: Netlify + Supabase
- **Pros**: Great for static sites, generous free tier
- **Cons**: Build minutes limited on free tier
- **Cost**: $19/month (Pro plan)

### Option 4: AWS Amplify + Supabase
- **Pros**: AWS ecosystem integration, powerful features
- **Cons**: Complex setup, steeper learning curve
- **Cost**: Pay-as-you-go (~$15-30/month)

### Option 5: Self-Hosted (Droplet + Self-Hosted Supabase)
- **Pros**: Full control, potentially lower cost at scale
- **Cons**: High maintenance, requires DevOps expertise
- **Cost**: $24/month (2 Droplets: $12 each for app + database)

**Recommendation**: Stick with App Platform + Supabase Cloud for best balance of simplicity, cost, and features.

## Next Steps

1. Review this plan with your team
2. Set up Supabase Cloud project
3. Deploy to App Platform
4. Test thoroughly in production
5. Monitor for 1-2 weeks
6. Optimize based on real usage data

## Conclusion

DigitalOcean App Platform is the ideal choice for deploying Atomic CRM because:

✅ **Zero maintenance** - Focus on features, not infrastructure  
✅ **Fast deployment** - From Git push to production in minutes  
✅ **Cost-effective** - Start at $5/month, scale as needed  
✅ **Reliable** - Built-in redundancy and automatic failover  
✅ **Secure** - Automatic HTTPS, encrypted environment variables  
✅ **Scalable** - Handles growth without manual intervention  

Combined with Supabase Cloud's managed backend, you get a production-ready CRM with minimal operational overhead.

---

**Document Version**: 1.0  
**Last Updated**: 2026-03-25  
**Maintained By**: Atomic CRM Team
