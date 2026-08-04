# 🥥 To-Do List: Mobile UX Refactoring (v1.0)

Registro delle attività di ottimizzazione basate sugli audit Gemini + Qwen.

---

## 🚀 Lavori Eseguiti

| ID | Attività | Skill | File | Stato |
| :--- | :--- | :--- | :--- | :--- |
| GEN-01 | Sincronizzazione colori Splash Screen PWA | `/pwa-fix` | `site.webmanifest` | ✅ Fatto |
| GEN-02 | Preload Font e Material Symbols | `/pwa-fix` | `index.html` | ✅ Fatto |
| GEN-03 | Implementazione centralizzata `useScrollLock` | `/hook-fix` | `useScrollLock.ts` | ✅ Fatto |
| GEN-04 | Refactoring Loader semantico (Regola #2) | `/core-fix` | `App.tsx` | ✅ Fatto |
| GEN-05 | Risparmio Energetico via Visibility API | `/core-fix` | `App.tsx` | ✅ Fatto |
| COMP-01 | Creazione `AkhaCard` polimorfica | `Stitch` | `AkhaCard.tsx` | ✅ Fatto |
| COMP-02 | Creazione `SmartInput` con accessibilità | `Stitch` | `SmartInput.tsx` | ✅ Fatto |
| PAGE-01 | Refactoring AuthPage (Tabs + Modal Privacy) | `Stitch` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-01 | Viewport: `var(--vh)` → `100dvh` (L1 fix) | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-02 | Card altezza: `min-h-[740px]` → `h-[min(740px,calc(100dvh-8rem))]` — fissa su tutti i breakpoint | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-03 | Rimosso doppio `padding-inline` su Step 3 container (era `--space-fluid-l` duplicato) | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-04 | Touch target dots: `h-3` → `min-h-[44px]` (standard iOS/Android) | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-05 | Safe area nav bar: `pb-[env(safe-area-inset-bottom)]` — home indicator iPhone | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-06 | Footer stabile: placeholder `invisible` su entrambi i lati del nav bar (no salti altezza) | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-07 | Hero image Step 2: `loading="lazy"` | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-08 | Radii concentrici: feature card → `rounded="s"` (20px vs outer 40px) | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-09 | Rimosso top gradient border dalla card principale | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-10 | Step 2 CTA → `t.nav.login` ("Log In"), era "New User" | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-11 | "New User" + "Login instead" → `outline` con frecce navigazione | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-12 | Avatar Steps 1+2: -10% size (0.7→0.63), spazio extra header→cards | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-13 | `isForgotPassword` sollevato ad AuthPage + reset automatico su step/panel change | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-14 | Forgot Password + Privacy spostati fuori card (sotto dots, contestuali a step 3) | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-15 | `PageSEO`: aggiunto `canonical="https://www.thaiakha.com/auth"` (era mancante) | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-16 | Rimosso dead code `feature.iconName` (non esistente sull'interfaccia) | `/mobile-ux` | `AuthPage.tsx` | ✅ Fatto |
| AUTH-17 | Padding unificato: tutto a `--space-fluid-m` (content, footer CTA, header desc) | `/mobile-ux` | `AuthPage.tsx` + `AuthForm.tsx` | ✅ Fatto |
| AUTH-18 | `err: any` → `err: unknown` + narrowing `instanceof Error` (TypeScript strict) | `/mobile-ux` | `AuthForm.tsx` | ✅ Fatto |
| AUTH-19 | Testi coerenza: "Forgot Password?", "Privacy Policy" → `variant="accent"` (da `caption`/`microLabel`) | `/mobile-ux` | `AuthForm.tsx` | ✅ Fatto |
| AUTH-20 | Error/success: `<Alert>` sostituito con `<Typography variant="caption">` inline (no card large) | `/mobile-ux` | `AuthForm.tsx` | ✅ Fatto |
| AUTH-21 | Content div: `flex-1 min-h-0 overflow-y-auto` — CTA sempre pinned al bottom | `/mobile-ux` | `AuthForm.tsx` | ✅ Fatto |
| AUTH-22 | Signup footer semplificato: solo CTA fullWidth (Back rimosso dal footer) | `/mobile-ux` | `AuthForm.tsx` | ✅ Fatto |
| AUTH-23 | Signup step 1: `← Back` inline nel contenuto (non nel footer, no salti) | `/mobile-ux` | `AuthForm.tsx` | ✅ Fatto |
| LEGAL-01 | Privacy subsection (2.1, 9.1): rimossa card annidata, testo body `paragraphS` → `caption` | `/mobile-ux` | `LegalDocumentViewer.tsx` | ✅ Fatto |
| REC-01 | Vendor splitting: `framer-motion` + `@google/genai` in chunk separati — index.js 641 kB → 244 kB (−62%) | `/mobile-ux` | `vite.config.ts` | ✅ Fatto |
| REC-02 | Firebase: `Cache-Control: immutable` su `/assets/**` — long-cache per chunk versionati | `/mobile-ux` | `firebase.json` | ✅ Fatto |
| REC-03 | Supabase: `preconnect` + `dns-prefetch` — riduzione TTFB connessione DB | `/mobile-ux` | `index.html` | ✅ Fatto |
| REC-04 | Canonical URL: aggiunto `www.` mancante in `RecipeSingle.tsx` | `/mobile-ux` | `RecipeSingle.tsx` | ✅ Fatto |
| REC-05 | H1→H3 heading skip: aggiunto `kitchen` variant alla condizione h2 in `HeaderSection.tsx` | `/mobile-ux` | `HeaderSection.tsx` | ✅ Fatto |
| REC-06 | Lazy loading: `loading="lazy"` su avatar img in `AskCherryButton` e `FaqBottomPage` | `/mobile-ux` | `AskCherryButton.tsx`, `FaqBottomPage.tsx` | ✅ Fatto |
| REC-07 | DB: SQL audit fixes — subtitle, JSON-LD @id/path, breadcrumbs, `last_content_audit_ai` | `/recipe-audit` | Supabase `recipes` | ✅ Fatto |
| REC-08 | IngredientsGrid: quantity chip su ogni card ingrediente (quantità × porzione visibile) | `/mobile-ux` | `IngredientsGrid.tsx` | ✅ Fatto |
| REC-09 | Recipes Feed: `getGridConfig` caso 3 ricette → `grid-cols-2 sm:grid-cols-3` (no orfano su tablet) + cleanup import inutilizzati | `/mobile-ux` | `Recipes.tsx` | ✅ Fatto |
| GEN-06 | Root wrapper: `text-gray-700 dark:text-gray-300` → `text-title` (Regola #2 + Regola #3: no raw gray, no `dark:` prefix nel front) | `/mobile-ux` | `App.tsx` | ✅ Fatto |

---

## 🔄 Prossimi Passi (Pianificazione)

### Fase 2: Fix Pagine Critiche (rimanenti)
- [ ] **PickUpPage**: Trasformazione della sidebar in Bottom Sheet trascinabile.
- [ ] **History/News**: Creazione del componente `MiniToC` flottante per mobile.

---
*Ultimo aggiornamento: 1 Giugno 2026 — App Shell (GEN-06) completato*
