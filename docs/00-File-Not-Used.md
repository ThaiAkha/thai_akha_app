# 🗑️ File da Eliminare — Audit Completo Monorepo

> Ultimo aggiornamento: 2026-03-25
> **Regola**: Eliminare per gruppi logici, con conferma prima di ogni gruppo.
> **Status**: Fase 1 ✅ COMPLETATA (3 file eliminati)

---

## ✅ GIÀ ELIMINATI (sessioni 2026-03-23 / 2026-03-24)

### Admin
- `prompts/` (cartella intera)
- `types/` (cartella intera)
- `hooks/useGeminiChat.ts`
- `hooks/useGeminiLive.ts`
- `hooks/useSpeechRecognition.ts`
- `hooks/useTextToSpeech.ts`
- `components/common/GeminiChat.tsx`
- `config/sessionDefaults.ts` → migrato a `@thaiakha/shared/lib/sessionUtils`
- `src/svg.d.ts`
- `src/types.ts`
- `utils/dateKeyUtils.ts` → spostato in `shared/src/lib/dateKeyUtils.ts`
- `utils/avatarConfig.ts` → centralizzato in `@thaiakha/shared/lib/avatarSystem.ts`
- `utils/avatarUtils.ts` → centralizzato in `@thaiakha/shared/lib/avatarSystem.ts`
- `src/lib/` (cartella vuota rimossa)

### Front
- `data/chatFlowData.ts` (albero decisionale statico)
- `data/quizData.ts` (QUIZ_DATA → migrato in DB `quiz_questions`)
- `data/safety.ts`
- `data/` (cartella vuota rimossa)
- `data/data.ts` (unused file, zero import)
- `components/quiz/BonusQuiz.tsx` → sostituito con fetch DB `quiz_rewards`
- `lib/buttonChatt.ts`
- `lib/buttonQuiz.ts`
- `lib/bonusQuiz.ts` → sostituito con `contentService.getQuizRewards()`
- `lib/ui-strings.ts` → spostato in `shared/src/lib/ui-strings.ts`

### Shared
- `src/components/` (cartella vuota + `index.ts` vuoto)
- `src/lib/colors.constants.ts` (zero import in tutto il monorepo)
- `src/styles/tailwind.config.base.ts` (zero import in admin/front)
- `src/styles/` (cartella vuota rimossa)

### Root / Artifacts
- `packages/front/build_output.txt`
- `packages/admin/build_output.txt`
- `lint_errors.txt`
- `DEPLOYMENT_READY.md` → spostato in `docs/`
- `IMPLEMENTATION_SUMMARY.md` → spostato in `docs/`
- `OG_META_TAGS_SETUP.md` → spostato in `docs/`

---

## 🔴 ADMIN — Da eliminare (confermati morti)

### Gruppo A — UI Media (11 file)
> Template boilerplate mai integrati nell'app reale

```
components/ui/images/TwoColumnImageGrid.tsx
components/ui/images/ThreeColumnImageGrid.tsx
components/ui/images/ResponsiveImage.tsx
components/ui/videos/TwentyOneIsToNine.tsx
components/ui/videos/FourIsToThree.tsx
components/ui/videos/AspectRatioVideo.tsx
components/ui/videos/SixteenIsToNine.tsx
components/ui/videos/OneIsToOne.tsx
components/ui/LoadingSpinner.tsx
components/tables/BasicTables/BasicTableOne.tsx
components/form/input/RadioSm.tsx
```

### Gruppo B — Form Demo (10 file)
> Componenti showcase per stati form — mai usati nell'app operativa

```
components/form/form-elements/DefaultInputs.tsx
components/form/form-elements/RadioButtons.tsx
components/form/form-elements/CheckboxComponents.tsx
components/form/form-elements/SelectInputs.tsx
components/form/form-elements/InputGroup.tsx
components/form/form-elements/FileInputExample.tsx
components/form/form-elements/TextAreaInput.tsx
components/form/form-elements/ToggleSwitch.tsx
components/form/form-elements/InputStates.tsx
components/form/form-elements/DropZone.tsx
```

### Gruppo C — Componenti Common (5 file)
> Rimpiazzati da versioni aggiornate o mai montati nel layout

```
components/common/ThemeToggleButton.tsx     ← rimpiazzato da ThemeTogglerTwo
components/common/PageBreadCrumb.tsx        ← mai montato nel layout
components/header/NotificationDropdown.tsx  ← mai montato nell'header
components/ecommerce/RecentOrders.tsx       ← demo mai integrata
components/ecommerce/StatisticsChart.tsx    ← demo mai integrata
```

### Gruppo D — Hook Legacy (4 file)
> ~~useTextToSpeech.ts~~ — ✅ già eliminato
> ~~useGoBack.ts~~ — ✅ 2026-03-25 (Fase 1)
> ~~useContent.ts~~ — ✅ 2026-03-25 (Fase 1)

```
hooks/useModal.ts           ← stato modal gestito localmente
hooks/useViewportHeight.ts  ← ⚠️ ATTIVO in front/App.tsx — NON eliminare
```

---

## 🟠 FRONT — Da eliminare (confermati morti)

### Hooks (0 file rimasti)
> Tutti già eliminati in sessioni precedenti ✅

### Lib (0 file rimasti)
> `bonusQuiz.ts`, `buttonChatt.ts`, `buttonQuiz.ts`, `ui-strings.ts` tutti eliminati/migrati ✅

### Utils (1 file)
```
utils/downloadHelpers.ts  ← zero import, dipende da html2canvas + file-saver
                             Lasciare in front se si prevede uso futuro, altrimenti eliminare
```

### Componenti (5 file)
```
components/booking/MiniCalendar.tsx    ← ✅ 2026-03-25 (Fase 1 - mai importato)
components/chat/MessageList.tsx        ← ✅ 2026-03-25 (Fase 1 - mai importato)
components/chat/SuggestionChip.tsx     ← usato solo da MessageList (morto)
components/classes/ClassCatalog.tsx    ← non nel routing (0 import)
components/menu/RecipeDetail.tsx       ← sostituito da RecipeView (0 import)
```

### ⚠️ NON eliminare — Da migrare
```
prompts/cherrySystem.ts   ← ATTIVO (usato da ChatBox.tsx + useGeminiLive.ts)
                             Spostare in shared/src/prompts/ con Cherry 2.0
```

---

## 🟡 SHARED — Cleanup chirurgico (no file interi)

### avatarSystem.ts — ✅ CENTRALIZZATO (confermato)
> Tutte le funzioni ora usate:
> - `getSmartAvatarUrl()` — usato da admin UserMetaCard.tsx
> - `getSmartAvatarUrlSafe()` — usato da admin useAdminBooking.ts
> - `getAgeBracket()` — supporto interno
> - `isSmartAvatar()` — usato da admin UserMetaCard.tsx

### Tipi morti in `types/index.ts`
```typescript
CookingClassDB      // mai importato → rimuovere
RecipeCategoryDB    // mai importato → rimuovere
```

### Tipo duplicato `ChatMessage`
> Definito in 2 posti — consolidare con Cherry 2.0

```
types/index.ts:9         → ChatMessage
types/content.types.ts:32 → ChatMessage
```

---

## 🗓️ Prossimi Step (ordine consigliato, con conferma)

| # | Fase | File | Status | Rischio |
|---|------|------|--------|---------|
| 1 | ✅ DONE | useGoBack.ts, useContent.ts, MessageList.tsx | ✅ Eliminati | ⬜ Basso |
| 2 | 📋 NEXT | useModal.ts, RecipeDetail.tsx, ClassCatalog.tsx | Pronto | ⬜ Basso |
| 3 | ⏳ Later | MiniCalendar (front), SuggestionChip, downloadHelpers | Verificare import | 🟡 Medio |
| 4 | ⏳ Later | ~~useViewportHeight~~ — ⚠️ ATTIVO (front/App.tsx) | ❌ NON eliminare | 🔴 Alto |
| 5 | ⏳ Later | Shared export morti, types duplicati | Medio | 🟡 Medio |
| 6 | 🔴 HOLD | `cherrySystem.ts` | Attendere Cherry 2.0 | 🔴 Alto |
