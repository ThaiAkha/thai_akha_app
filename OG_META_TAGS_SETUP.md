# Open Graph Meta-Tags Implementation — Setup & Testing Guide

## 📋 Overview

This document guides you through deploying the OG meta-tags system for social sharing on Thai Akha Kitchen.

**Components**:
1. ✅ **Supabase Edge Function** (`supabase/functions/og-meta-tags/index.ts`)
2. ✅ **Cloudflare Worker** (`cloudflare-worker.js`)
3. ✅ **Database Schema** (`supabase/migrations/add_og_metadata_fields.sql`)

---

## 🚀 Phase 1: Deploy Supabase Edge Function

### 1.1 Initialize Edge Functions Project

```bash
cd /Users/svevomondino/Desktop/thaiakha-cherry-2026

# Create function directory if needed
mkdir -p supabase/functions/og-meta-tags

# Already created: supabase/functions/og-meta-tags/index.ts
```

### 1.2 Create `deno.json` for the function

```bash
cat > supabase/functions/og-meta-tags/deno.json << 'EOF'
{
  "imports": {
    "std/": "https://deno.land/std@0.168.0/",
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.39.0"
  }
}
EOF
```

### 1.3 Link Supabase Project

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

You can find `YOUR_PROJECT_REF` in:
- Supabase Dashboard → Settings → General → Project URL
- Example: `https://abcdefgh.supabase.co` → ref is `abcdefgh`

### 1.4 Deploy Function

```bash
# Deploy the Edge Function
supabase functions deploy og-meta-tags --no-verify-jwt

# Verify deployment
supabase functions list
```

Output should show:
```
og-meta-tags  (HTTP)  active
```

### 1.5 Get Function URL

```bash
# The function URL will be:
https://YOUR_PROJECT_REF.functions.supabase.co/og-meta-tags
```

**Save this URL** — you'll need it for the Cloudflare Worker.

---

## 📦 Phase 2: Deploy Database Schema

### 2.1 Run Migration

```bash
# Option A: Via Supabase CLI
supabase db push

# Option B: Via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy content from supabase/migrations/add_og_metadata_fields.sql
# 3. Paste and execute
```

### 2.2 Verify Tables

```sql
-- Check culture_sections columns
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'culture_sections'
AND column_name IN ('seo_title', 'seo_description');

-- Check site_metadata exists
SELECT * FROM information_schema.tables
WHERE table_name = 'site_metadata';

-- Verify sample data
SELECT page_slug, og_title FROM site_metadata LIMIT 5;
```

### 2.3 Populate Culture SEO Data

```sql
-- Update existing culture_sections with SEO data
UPDATE culture_sections
SET
  seo_title = COALESCE(seo_title, title),
  seo_description = COALESCE(seo_description, subtitle)
WHERE seo_title IS NULL;
```

---

## ☁️ Phase 3: Configure Cloudflare Worker

### 3.1 Update Worker Code

Edit `cloudflare-worker.js` and replace:

```javascript
// BEFORE:
const OG_FUNCTION_URL = 'https://YOUR_SUPABASE_PROJECT.functions.supabase.co/og-meta-tags';

// AFTER (with your actual project ref):
const OG_FUNCTION_URL = 'https://abcdefgh.functions.supabase.co/og-meta-tags';
```

### 3.2 Deploy to Cloudflare

**Option A: Via Wrangler CLI**

```bash
# Install Wrangler if needed
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler deploy --path cloudflare-worker.js
```

**Option B: Via Cloudflare Dashboard (Manual)**

1. Go to Cloudflare → Workers → Create Service
2. Copy code from `cloudflare-worker.js`
3. Paste into editor
4. Save and deploy
5. Get your worker URL (e.g., `https://og-meta.myworker.workers.dev`)

### 3.3 Configure Custom Domain Routing

To make the worker intercept requests to your domain:

**Option A: Route via Cloudflare DNS**

1. Cloudflare Dashboard → Domains → Your Domain
2. Workers → Routes → Create Route
3. Set route: `thaiakhakitchen.com/*`
4. Select your worker: `og-meta` (or whatever you named it)

**Option B: Point domain to Worker URL**

1. Set CNAME in your DNS to Cloudflare worker URL
2. Or update `A` record if using Cloudflare nameservers

---

## 🧪 Phase 4: Testing & Validation

### 4.1 Test Edge Function Directly

```bash
# Get your Edge Function URL
FUNCTION_URL="https://YOUR_PROJECT_REF.functions.supabase.co/og-meta-tags"

# Test home page
curl "${FUNCTION_URL}?path=/" | grep -o '<meta property="og:title"[^>]*>'

# Test culture page
curl "${FUNCTION_URL}?path=/history/hill-tribes-overview" | grep -o '<meta property="og:title"[^>]*>'

# Expected output:
# <meta property="og:title" content="...">
```

### 4.2 Test via Facebook Debugger

1. Go to: https://developers.facebook.com/tools/debug/
2. Enter URL: `https://thaiakhakitchen.com/history/hill-tribes-overview`
3. Click "Scrape Again"
4. Verify you see:
   - ✅ Title appears
   - ✅ Description appears
   - ✅ Image appears

### 4.3 Test via WhatsApp

1. Send link in WhatsApp chat: `https://thaiakhakitchen.com/history/hill-tribes-overview`
2. Verify preview shows:
   - ✅ Image thumbnail
   - ✅ Title
   - ✅ Description

### 4.4 Check Cloudflare Analytics

```bash
# Monitor worker invocations
# Cloudflare Dashboard → Workers → Analytics
# Look for:
# - Request count
# - Errors
# - Bot detection logs
```

### 4.5 Debug Logs

**Supabase Edge Function Logs**:
```bash
supabase functions logs og-meta-tags --follow
```

**Cloudflare Worker Logs**:
- Cloudflare Dashboard → Workers → Logs
- Look for `[CF-Worker]` and `[OG-META]` messages

---

## ⚙️ Configuration Checklist

- [ ] Supabase Edge Function deployed
- [ ] Function URL obtained and saved
- [ ] Database schema migrated
- [ ] `culture_sections.seo_title` and `seo_description` populated
- [ ] `site_metadata` table populated with page slugs
- [ ] Cloudflare Worker code updated with correct function URL
- [ ] Worker deployed to Cloudflare
- [ ] Domain routing configured (Workers → Routes)
- [ ] Tested via Facebook Debugger
- [ ] Tested via WhatsApp
- [ ] Logs verified (no errors)

---

## 🔧 Troubleshooting

### Issue: No image appears in preview

**Causes**:
1. `primary_image` asset_id not found in `media_assets`
2. Image URL is broken/inaccessible

**Solution**:
```sql
-- Check if asset exists
SELECT * FROM media_assets WHERE asset_id = 'your-asset-id';

-- Verify image_url is valid
SELECT asset_id, image_url FROM media_assets LIMIT 5;
```

### Issue: Meta-tags not appearing in Facebook Debugger

**Causes**:
1. Worker not correctly routing bot requests
2. Edge Function returning error

**Solution**:
```bash
# Check worker logs
# Cloudflare Dashboard → Workers → Logs

# Test Edge Function directly
curl "https://PROJECT_REF.functions.supabase.co/og-meta-tags?path=/history/test"

# Check if status is 200 and contains <meta tags
```

### Issue: Slow responses / timeouts

**Causes**:
1. Supabase database query slow
2. Image resolution slow

**Solution**:
1. Enable Cloudflare caching (already set to 1 hour in code)
2. Optimize database indexes
```sql
CREATE INDEX IF NOT EXISTS idx_culture_sections_slug ON culture_sections(slug);
CREATE INDEX IF NOT EXISTS idx_media_assets_asset_id ON media_assets(asset_id);
```

---

## 📊 Monitoring & Maintenance

### Weekly Checks

```bash
# Check function health
supabase functions logs og-meta-tags --tail 100

# Verify no recent errors
# Look for any 500 status codes

# Check cache hit rate
# Cloudflare Dashboard → Analytics → Cache Performance
```

### Monthly Tasks

- Verify SEO data is up-to-date in database
- Review Facebook Debugger for random pages
- Monitor for new bot User-Agents (update SOCIAL_BOTS list if needed)

---

## 📝 Next Steps

1. **Deploy Phase 1** (Edge Function) — ~30 min
2. **Deploy Phase 2** (Database) — ~15 min
3. **Deploy Phase 3** (Cloudflare Worker) — ~30 min
4. **Testing Phase 4** — ~1 hour
5. **Monitor & Iterate** — ongoing

**Total: 2-3 hours for full deployment**

---

## 📞 Support

For issues:
1. Check `/supabase/functions/og-meta-tags/index.ts` logs
2. Verify Cloudflare Worker logs
3. Test Edge Function directly with curl
4. Check database schema with SQL query
