# Security Fix Deployment Checklist

## Objective
Remove `VITE_GEMINI_API_KEY` from frontend bundle and implement secure proxy pattern for text chat via Supabase Edge Functions.

## Pre-Deployment (Local Verification)

### 1. Code Changes Verified ✅
- [x] Created `supabase/functions/gemini-proxy-chat/index.ts` with JWT auth, rate limiting, timeout, logging
- [x] Created `packages/shared/src/services/ai.service.ts` with `sendChatMessageProxy()` function
- [x] Updated `packages/front/src/hooks/useCherryChat.ts` to use proxy pattern
- [x] Updated `packages/admin/src/hooks/useCherryChat.ts` to use proxy pattern
- [x] Removed `getTextGeminiClient()` from both front and admin `geminiClient.ts` files
- [x] Removed `VITE_GEMINI_API_KEY` from `packages/front/vite.config.ts` define exports
- [x] Updated `.env.example` with migration instructions

### 2. Build Verification

```bash
# Check admin package (should have no errors related to our changes)
cd packages/admin && pnpm tsc --noEmit

# Check front package (pre-existing errors unrelated to this work)
cd packages/front && pnpm tsc --noEmit
```

### 3. Local Edge Function Testing

```bash
# Start Supabase locally (if needed)
supabase start

# Test Edge Function with cURL (guest request - no JWT)
curl -X POST http://localhost:54321/functions/v1/gemini-proxy-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello Cherry!",
    "systemInstruction": "You are Cherry, a helpful AI assistant."
  }'

# Test with JWT token (logged-in user)
curl -X POST http://localhost:54321/functions/v1/gemini-proxy-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "What are the best Thai spices?",
    "systemInstruction": "You are a Thai cuisine expert."
  }'
```

## Staging/Production Deployment

### 1. Set Supabase Secret

```bash
# Replace with actual Gemini API key
supabase secrets set GEMINI_API_KEY="sk-..."
```

### 2. Deploy Edge Function

```bash
# Deploy to production
supabase functions deploy gemini-proxy-chat

# Verify it's deployed
supabase functions list
```

### 3. Deploy Frontend + Admin Apps

```bash
# Build both apps
pnpm --filter front build
pnpm --filter admin build

# Deploy to Firebase Hosting
firebase deploy

# Verify builds have NO VITE_GEMINI_API_KEY
grep -r "VITE_GEMINI_API_KEY" packages/front/dist packages/admin/dist
# Should return: No results (all occurrences removed)
```

### 4. Environment Setup (CI/CD)

Update CI/CD pipeline (Firebase, GitHub Actions, etc.):

```yaml
# .github/workflows/deploy.yml or similar
env:
  # Remove: VITE_GEMINI_API_KEY (no longer needed)
  # The backend secret is set via: supabase secrets set
```

## Post-Deployment Verification

### 1. End-to-End Chat Test (Guest)

1. Open frontend app in incognito mode
2. Open chat widget
3. Send test message: "Hi Cherry, what's your favorite recipe?"
4. Expected: Response generated via Edge Function → frontend displays it

### 2. End-to-End Chat Test (Logged-in)

1. Log in with valid user account
2. Open chat
3. Send test message
4. Expected: Response generated via Edge Function → rate limit applied

### 5. Rate Limit Verification

Logged-in user should hit limit after 30 messages:

```bash
# In Supabase Logs, check for:
# - userId appears in logs (no sensitive data exposed)
# - After 30 messages, 429 response returned
# - Error message: "Daily limit reached. Come back tomorrow or book a class!"
```

### 6. Monitor Logs

```bash
# Supabase Dashboard → Functions → gemini-proxy-chat → Logs
# Verify:
# - No GEMINI_API_KEY appears in logs
# - Timestamps correlate with user activity
# - durationMs shows reasonable performance (<5s typical)
# - No error spikes
```

### 7. Check No Secrets Leaked

```bash
# Verify API key is NOT in:
grep -r "VITE_GEMINI" packages/front/dist
grep -r "VITE_GEMINI" packages/admin/dist
grep -r "GEMINI_API_KEY" packages/front/dist
grep -r "GEMINI_API_KEY" packages/admin/dist

# All commands should return: (no results)
```

## Rollback Plan

If issues occur post-deployment:

1. **Symptom**: Chat not responding
   - **Check**: Edge Function logs for errors
   - **Fallback**: Temporarily revert `useCherryChat.ts` to use `getTextGeminiClient()` (requires VITE_GEMINI_API_KEY)

2. **Symptom**: Rate limiting too aggressive
   - **Check**: Adjust limits in `checkRateLimit()` function
   - **Redeploy**: `supabase functions deploy gemini-proxy-chat`

3. **Symptom**: Missing GEMINI_API_KEY secret
   - **Action**: `supabase secrets set GEMINI_API_KEY="your_key"`
   - **Redeploy**: Edge Function

## Success Criteria

✅ Chat works for guests (no JWT required)
✅ Chat works for logged-in users (JWT verified)
✅ Rate limits apply correctly
✅ No VITE_GEMINI_API_KEY in browser bundles
✅ No GEMINI_API_KEY exposed in logs
✅ Latency <5 seconds per chat message
✅ Zero security vulnerabilities from API key exposure

## Documentation

- [Edge Function README](./supabase/functions/gemini-proxy-chat/README.md)
- [ai.service.ts Comments](./packages/shared/src/services/ai.service.ts)
- [useCherryChat Refactoring](./packages/front/src/hooks/useCherryChat.ts)

---

**Date**: 2025-04-07
**Status**: Ready for Deployment
**Approved By**: [User Name]
