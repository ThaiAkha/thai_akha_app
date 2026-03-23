#!/bin/bash

# Quick-Start Script for OG Meta-Tags Implementation
# Thai Akha Kitchen 2026

set -e

echo "🚀 Starting OG Meta-Tags Implementation"
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if Supabase CLI is installed
echo -e "${BLUE}[Step 1] Checking Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
fi
echo -e "${GREEN}✓ Supabase CLI ready${NC}"

# Step 2: Check Cloudflare Wrangler
echo -e "${BLUE}[Step 2] Checking Cloudflare Wrangler...${NC}"
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Wrangler not found. Installing...${NC}"
    npm install -g wrangler
fi
echo -e "${GREEN}✓ Wrangler ready${NC}"

# Step 3: Verify file structure
echo -e "${BLUE}[Step 3] Verifying file structure...${NC}"
FILES=(
    "supabase/functions/og-meta-tags/index.ts"
    "cloudflare-worker.js"
    "supabase/migrations/add_og_metadata_fields.sql"
    "OG_META_TAGS_SETUP.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${YELLOW}⚠ Missing: $file${NC}"
    fi
done

# Step 4: Prompt for Supabase project info
echo -e "${BLUE}[Step 4] Supabase Configuration${NC}"
echo "Enter your Supabase project details:"
read -p "Project Ref (e.g., abcdefgh): " PROJECT_REF
read -p "Project URL (e.g., https://abcdefgh.supabase.co): " PROJECT_URL

if [ -z "$PROJECT_REF" ] || [ -z "$PROJECT_URL" ]; then
    echo -e "${YELLOW}Skipping Supabase setup. You'll need to do it manually.${NC}"
else
    echo -e "${BLUE}Setting up Supabase project: $PROJECT_REF${NC}"

    # Link project
    supabase link --project-ref "$PROJECT_REF" || echo "Already linked"

    # Deploy Edge Function
    echo -e "${BLUE}Deploying Edge Function...${NC}"
    supabase functions deploy og-meta-tags --no-verify-jwt

    # Run migration
    echo -e "${BLUE}Running database migration...${NC}"
    supabase db push

    echo -e "${GREEN}✓ Supabase setup complete!${NC}"
    echo -e "${YELLOW}Function URL: $PROJECT_URL/functions/v1/og-meta-tags${NC}"
fi

# Step 5: Update Cloudflare Worker
echo -e "${BLUE}[Step 5] Cloudflare Worker Configuration${NC}"
echo "You need to manually:"
echo "1. Update OG_FUNCTION_URL in cloudflare-worker.js:"
echo "   const OG_FUNCTION_URL = '$PROJECT_URL/functions/v1/og-meta-tags';"
echo "2. Deploy via Wrangler or Cloudflare Dashboard"

# Final instructions
echo ""
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update cloudflare-worker.js with your Function URL"
echo "2. Deploy Cloudflare Worker"
echo "3. Test with Facebook Debugger: https://developers.facebook.com/tools/debug/"
echo "4. Check setup guide: OG_META_TAGS_SETUP.md"
echo ""
echo "Questions? See OG_META_TAGS_SETUP.md for detailed instructions."
