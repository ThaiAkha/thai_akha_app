# Gemini Proxy Chat Function

Secure Edge Function that proxies text chat requests to Google Generative AI without exposing API keys to the frontend.

## Architecture

```
Frontend (useCherryChat.ts)
    ↓ (calls via supabase.functions.invoke)
Supabase Edge Function: gemini-proxy-chat
    ↓ (verified JWT auth)
    ↓ (loads GEMINI_API_KEY from Deno.env)
Google Generative AI (gemini-3-flash-preview)
    ↓ (returns response text)
Backend response → Frontend display
```

## Security

- ✅ JWT authentication (optional for guests)
- ✅ Rate limiting (30 msgs/day for logged-in, unlimited for booked guests)
- ✅ 30-second real timeout (AbortController on the Gemini call and the stream)
- ✅ Structured logging (no sensitive data)
- ✅ GEMINI_API_KEY stored in Deno.env (never exposed to client)

## Deployment

### 1. Set the Gemini API Key

```bash
supabase secrets set GEMINI_API_KEY="your-actual-gemini-api-key"
```

### 2. Deploy the Function

```bash
supabase functions deploy gemini-proxy-chat
```

### 3. Test Locally

```bash
supabase functions serve gemini-proxy-chat
```

Then invoke via cURL or Postman:

```bash
curl -X POST http://localhost:54321/functions/v1/gemini-proxy-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "What are the best Thai spices?",
    "systemInstruction": "You are Cherry, a Thai cuisine expert."
  }'
```

## Environment Variables

- `SUPABASE_URL` - Auto-set by Supabase
- `SUPABASE_ANON_KEY` - Auto-set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-set by Supabase
- `GEMINI_API_KEY` - Set via `supabase secrets set` (see above)

## Request Schema

```typescript
interface ChatPayload {
  message: string;                 // Required: user's message
  history?: Array<{                // Optional: conversation history
    role: 'user' | 'model';
    parts: string;
  }>;
  systemInstruction?: string;      // Optional: system prompt
}
```

## Response Schema

```typescript
interface SuccessResponse {
  response: string;                // Generated response text
}

interface ErrorResponse {
  error: string;                   // Error message
}
```

## HTTP Status Codes

- `200` - Success
- `400` - Invalid request (missing message field)
- `429` - Rate limit exceeded
- `500` - Server error (missing API key, Gemini error)
- `504` - Timeout (30-second limit exceeded, nothing delivered)

## Rate Limiting Logic

1. **VIP (Confirmed Booking)**: Unlimited messages
2. **Logged-in User**: Max 30 messages per day
3. **Guest**: Unlimited per session (tracked by session token)

## Logging

Structured JSON logs with no sensitive data:

```json
{
  "timestamp": "2025-04-07T10:30:45Z",
  "userId": "user-123 or guest",
  "messageLength": 42,
  "responseLength": 255,
  "durationMs": 1234,
  "success": true
}
```

## Monitoring

Check logs in Supabase dashboard:

1. Go to **Functions** → **gemini-proxy-chat** → **Logs**
2. Filter by timestamp and userId for debugging
3. Monitor `durationMs` for performance regressions

## Future Improvements

- [ ] Implement response streaming via Server-Sent Events (SSE)
- [ ] Add Redis caching for identical queries
- [ ] Implement exponential backoff for retries
- [ ] Add comprehensive error recovery

## 2026-09-06 — caps, metrics, native history

- **Input caps**: `message` ≤ 4.000 chars, `systemInstruction` ≤ 120.000 chars, `history` ≤ 12 items of ≤ 4.000 chars each, otherwise `400`. Before this date nothing was capped.
- **Output cap**: `generationConfig.maxOutputTokens = 1024`.
- **Model from secret**: `GEMINI_CHAT_MODEL` (default `gemini-3-flash-preview`). Change the secret, no redeploy.
- **Anon shortcut**: a bearer equal to `SUPABASE_ANON_KEY` is a guest without asking GoTrue (one round trip less per guest message). Logged-in clients now send their JWT on the stream too, so the per-user limits actually apply.
- **History**: `history` is normalized server-side (starts with `user`, roles alternate, ends with `model`); the client twin lives in `packages/shared/src/lib/cherryHistory.ts`.
- **Metrics**: the log line now carries `usage` (`prompt`, `output`, `cached` token counts from `usageMetadata`), `lang` (client UI language, informational) and `model`.
- **Partial delivery**: if the stream breaks after some text was sent, the partial text is delivered and logged as success with a warning; with zero text sent the stream errors.
