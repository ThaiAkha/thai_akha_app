# Admin App Multi-Language Support: English & Thai

**Status**: Implementation Ready
**Last Updated**: March 14, 2026
**Effort Estimate**: 10 weeks (1 developer) or 5 weeks (2 developers parallel)

---

## 📋 Overview

This document outlines the strategy and implementation plan for adding **English (EN)** and **Thai (TH)** language support to the Thai Akha Kitchen Admin Portal.

**Current State**:
- ✗ All text hardcoded in English
- ✗ Some Italian text present ("NUOVO", "CARICA")
- ✗ No i18n infrastructure
- Estimated **800-1000 strings** to translate

**Target State**:
- ✅ Full EN/TH support across admin app
- ✅ Centralized translation management in `packages/shared`
- ✅ Language switcher for users
- ✅ Database-driven dynamic content
- ✅ Scalable for future languages (IT, JP, KR, ZH)

---

## 🎯 Architecture

### Technology Stack

**Libraries**:
- `react-i18next` v15 - React i18n framework
- `i18next` v24 - Core i18n engine
- `i18next-http-backend` - Async translation loading

**Why react-i18next?**
- Industry standard (used by 60K+ npm projects)
- Excellent TypeScript support
- Namespace organization for scalability
- Lazy loading capabilities
- Interpolation, pluralization, context support

### File Structure

```
packages/shared/src/
├── i18n/
│   ├── index.ts                          # i18next config
│   ├── types.ts                          # TypeScript definitions
│   └── locales/
│       ├── en/                           # English
│       │   ├── common.json               # Shared UI (40% of strings)
│       │   ├── auth.json                 # Login/signup flows
│       │   ├── navigation.json           # Menu/sidebar
│       │   ├── forms.json                # Form fields & validation
│       │   ├── booking.json              # Booking-specific
│       │   ├── dashboard.json            # Metrics & analytics
│       │   ├── errors.json               # Error messages
│       │   ├── legal.json                # Terms & Privacy
│       │   └── pages.json                # Page-specific text
│       └── th/                           # Thai (same structure)
│           ├── common.json
│           ├── auth.json
│           └── ... (8 more files)
└── index.ts                              # Export i18n instance
```

### Namespace Strategy

| Namespace | Content | String Count | Priority |
|-----------|---------|--------------|----------|
| `common` | Buttons, labels, tooltips | ~150 | High |
| `auth` | Sign in/up, reset password | ~40 | High |
| `navigation` | Menu items, breadcrumbs | ~20 | High |
| `forms` | Field labels, placeholders, validation | ~127 | High |
| `booking` | Booking terms, session names | ~50 | Medium |
| `dashboard` | Metrics labels, charts | ~30 | Medium |
| `errors` | Error messages (23+ patterns) | ~50 | High |
| `legal` | Terms of Service, Privacy Policy | ~200 | High |
| `pages` | Page-specific content (35 pages) | ~350 | Medium |
| **TOTAL** | | **~1000** | - |

---

## 🔄 Implementation Phases

### Phase 1: Foundation (Week 1)

**Objective**: Setup i18n infrastructure and test basic functionality

**Tasks**:
1. Install dependencies: `react-i18next`, `i18next`
2. Create directory structure in `packages/shared/src/i18n/`
3. Configure i18next with namespaces
4. Wrap App with `I18nextProvider`
5. Create `LanguageSwitcher` component
6. Test language switching with dummy translations

**Deliverables**:
- Working i18n setup
- Language switcher UI
- English & Thai common.json with basic strings

**Key Files**:
```
packages/shared/src/i18n/
  ├── index.ts (config)
  ├── types.ts (TypeScript)
  ├── locales/en/common.json
  └── locales/th/common.json
```

### Phase 2: High-Impact Areas (Week 2)

**Objective**: Translate user-facing flows (30% of strings = 70% user impact)

**Areas**:
1. **Authentication** (~40 strings)
   - SignInForm: title, labels, buttons, messages
   - SignUpForm: same + validation messages
   - File: `SignInForm.tsx`, `SignUpForm.tsx`

2. **Navigation** (~20 strings)
   - Sidebar menu items
   - Header navigation
   - Database column updates: `menu_label_en`, `menu_label_th`

3. **Common UI** (~40 strings)
   - Action buttons: Save, Cancel, Delete, Edit, Create
   - Tooltips, status indicators
   - Remove Italian text: "NUOVO"→"New", "CARICA"→"Upload"

**Usage Example**:
```typescript
import { useTranslation } from 'react-i18next';

export default function SignInForm() {
  const { t } = useTranslation('auth');

  return (
    <h1>{t('signIn.title')}</h1>        // "Sign In"
    <button>{t('signIn.button')}</button> // "Sign In"
  );
}
```

**Translation File** (`locales/en/auth.json`):
```json
{
  "signIn": {
    "title": "Sign In",
    "subtitle": "Enter your email and password to sign in!",
    "button": "Sign In",
    "email": "Email",
    "password": "Password"
  }
}
```

### Phase 3: Forms & Validation (Week 3)

**Objective**: Centralize form text and error messages

**Tasks**:
1. Extract all form labels → `forms.json`
2. Extract all placeholders → `forms.json`
3. Create error message map → `errors.json`
4. Update validation logic to use translations
5. Support interpolation for dynamic values

**Error Example**:
```typescript
// Before
throw new Error("Email is required");

// After
const { t } = useTranslation('errors');
throw new Error(t('validation.required', { field: 'Email' }));
// Output: "Email is required" (EN) or "จำเป็นต้องใส่อีเมล" (TH)
```

### Phase 4: Dashboard & Booking (Week 4)

**Objective**: Translate analytics and booking components

**Coverage**:
- Dashboard metrics (~30 strings)
- Booking calendar and forms (~50 strings)
- Table headers and status labels (~40 strings)

**Files**:
- `EcommerceMetrics.tsx` → `dashboard.json`
- `RecentBookings.tsx` → `booking.json`
- All data table components

### Phase 5: Legal Documents (Week 5)

**Objective**: Translate Terms of Service and Privacy Policy

**Special Considerations**:
- ⚠️ **MUST use professional translator for legal documents**
- Critical for compliance in Thailand
- Cost: ~$250-350 for professional Thai translation
- Extract from existing `legalDocuments.ts`
- Create `legal.json` with structured format

**Thai Translation Partners**:
- Recommended: Professional legal translators in Bangkok
- DO NOT use machine translation alone
- Budget: ~$0.05-0.10 per word

### Phase 6-7: Remaining Pages & Database (Weeks 6-7)

**Objective**: Complete all 35 pages and finalize database schema

**Scope**:
- 35 pages × ~10 strings = 350 strings
- Update database schema with language columns
- Migrate existing menu labels to `menu_label_en`
- Add Thai translations to database

**Database Schema**:
```sql
ALTER TABLE site_metadata_admin
  ADD COLUMN menu_label_en TEXT,
  ADD COLUMN menu_label_th TEXT,
  ADD COLUMN menu_description_en TEXT,
  ADD COLUMN menu_description_th TEXT;

CREATE TABLE translations (
  id UUID PRIMARY KEY,
  key TEXT NOT NULL,              -- "news.123.title"
  locale TEXT NOT NULL,           -- "en" | "th"
  value TEXT NOT NULL,
  UNIQUE(key, locale)
);
```

### Phase 8: Testing & Polish (Week 9)

**Test Checklist**:
- [ ] All flows work in both EN and TH
- [ ] Text doesn't overflow containers
- [ ] Thai text length validated (longer than EN)
- [ ] All error messages appear correctly
- [ ] Language switcher persists selection
- [ ] Missing translations logged to console
- [ ] Performance acceptable (no slow loads)

**Special Thai Considerations**:
- Thai words are longer than English (plan +15-20% space)
- No word spacing (use CSS `word-break`)
- Test on mobile (viewport width important)

### Phase 9: Documentation (Week 10)

**Deliverables**:
- Developer guide for adding translations
- Translation workflow and checklist
- Thai terminology glossary
- Key naming conventions

---

## 💻 Developer Guide

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t, i18n } = useTranslation('namespace'); // Load namespace

  return (
    <>
      <h1>{t('key.subkey')}</h1>        {/* Simple translation */}
      <button>{t('button.click')}</button>

      {/* Interpolation (dynamic values) */}
      <p>{t('greeting', { name: 'Alice' })}</p>

      {/* Pluralization */}
      <p>{t('items.count', { count: 5 })}</p>

      {/* Language info */}
      <p>Current: {i18n.language}</p>
    </>
  );
}
```

### Translation File Structure

**English (`locales/en/auth.json`)**:
```json
{
  "signIn": {
    "title": "Sign In",
    "subtitle": "Enter your email and password to sign in!",
    "form": {
      "email": "Email",
      "password": "Password"
    },
    "button": "Sign In",
    "forgot": "Forgot password?",
    "noAccount": "Don't have an account?",
    "signUp": "Sign Up"
  },
  "validation": {
    "required": "{{field}} is required",
    "email": "Please enter a valid email address"
  }
}
```

**Thai (`locales/th/auth.json`)**:
```json
{
  "signIn": {
    "title": "เข้าสู่ระบบ",
    "subtitle": "กรุณาใส่อีเมลและรหัสผ่าน",
    "form": {
      "email": "อีเมล",
      "password": "รหัสผ่าน"
    },
    "button": "เข้าสู่ระบบ",
    "forgot": "ลืมรหัสผ่าน?",
    "noAccount": "ยังไม่มีบัญชี?",
    "signUp": "สมัครสมาชิก"
  },
  "validation": {
    "required": "{{field}} จำเป็นต้องใส่",
    "email": "กรุณาใส่อีเมลที่ถูกต้อง"
  }
}
```

### TypeScript Type Safety

Ensure no typos in translation keys:

```typescript
// types.ts
import { TFunction } from 'i18next';

export type TypedTFunction = TFunction<
  ['common', 'auth', 'navigation', 'forms', 'booking', 'dashboard']
>;

// Usage
import { TypedTFunction } from '@thaiakha/shared/i18n/types';

export default function MyComponent() {
  const { t }: { t: TypedTFunction } = useTranslation();

  t('auth.signIn.title');    // ✅ OK
  t('auth.invalid.key');     // ❌ TypeScript error
}
```

### Language Switcher

```typescript
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => {
        i18n.changeLanguage(e.target.value);
        localStorage.setItem('language', e.target.value);
      }}
    >
      <option value="en">🇬🇧 English</option>
      <option value="th">🇹🇭 ไทย (Thai)</option>
    </select>
  );
}
```

---

## 📝 Thai Translation Guidelines

### Key Terminology

| English | Thai | Notes |
|---------|------|-------|
| Partner | พันธมิตร | B2B context |
| Booking | การจอง | Reservation |
| Dashboard | แดชบอร์ด | Tech term |
| Sign In | เข้าสู่ระบบ | Login |
| Sign Up | สมัครสมาชิก | Register |
| Email | อีเมล | Tech term |
| Password | รหัสผ่าน | Security term |
| Paid | ชำระเงินแล้ว | Payment status |
| Pending | รอดำเนินการ | Status |

### Professional Translation

**Required for**:
- ✅ Legal documents (Terms, Privacy Policy)
- ✅ Financial/payment text
- ✅ Compliance-related content
- ✅ Customer-facing legal notices

**Machine translation OK with review**:
- ✅ UI labels (buttons, menus)
- ✅ Form placeholders
- ✅ Tooltips
- ✅ Status indicators

**Translation Cost**:
- Professional legal: $0.10-0.15 per word
- UI/general: $0.05-0.08 per word
- Estimated budget: $300-400

---

## 🗄️ Database Considerations

### Current State

`site_metadata_admin` table stores menu items:
```
id | menu_label | path | icon | order | parent_id | role
```

### New Schema

Add language columns:
```sql
ALTER TABLE site_metadata_admin
  ADD COLUMN menu_label_en TEXT,
  ADD COLUMN menu_label_th TEXT,
  ADD COLUMN menu_description_en TEXT,
  ADD COLUMN menu_description_th TEXT;
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function SidebarMenu({ items }) {
  const { i18n } = useTranslation();

  return items.map(item => (
    <div key={item.id}>
      {/* Get label in current language */}
      {i18n.language === 'th' && item.menu_label_th
        ? item.menu_label_th
        : item.menu_label_en}
    </div>
  ));
}
```

### Dynamic Content Table

For CMS-managed translations (news articles, announcements):

```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,                    -- "news.article_123.title"
  locale TEXT NOT NULL,                 -- "en" | "th"
  value TEXT NOT NULL,
  context TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE(key, locale)
);
```

---

## 🚀 Quick Start Checklist

### Week 1: Foundation
- [ ] Install `react-i18next` and `i18next`
- [ ] Create `/packages/shared/src/i18n/` directory
- [ ] Setup i18next config
- [ ] Create `common.json` (EN & TH) with 50 basic strings
- [ ] Wrap App with `I18nextProvider`
- [ ] Build LanguageSwitcher component
- [ ] Test language switching

### Week 2: High-Impact
- [ ] Extract auth flow strings → `auth.json`
- [ ] Extract navigation → `navigation.json`
- [ ] Extract common UI → `common.json` (expand)
- [ ] Update SignInForm, SignUpForm, UserDropdown
- [ ] Remove Italian text from DataExplorerToolbar
- [ ] Test auth flows in both languages

### Week 3: Forms
- [ ] Create `forms.json` with all field labels
- [ ] Create `errors.json` with error messages
- [ ] Update all form components
- [ ] Test form validation in both languages

### Week 4: Dashboard
- [ ] Create `dashboard.json`
- [ ] Create `booking.json`
- [ ] Update dashboard components
- [ ] Update booking components

### Week 5: Legal
- [ ] Extract legal text → `legal.json`
- [ ] Hire professional Thai translator
- [ ] Receive Thai translations
- [ ] Update LegalModal component

### Weeks 6-7: Remaining Pages
- [ ] Extract remaining page text
- [ ] Update all 35 pages
- [ ] Database schema migration
- [ ] Populate Thai translations in DB

### Weeks 8-10: Testing & Polish
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Team training

---

## 📊 Progress Tracking

Use this table to track translation completion:

| Area | Component Count | Translated | % Complete | Thai % |
|------|-----------------|-----------|-----------|--------|
| Authentication | 2 | 0 | 0% | 0% |
| Navigation | 1 | 0 | 0% | 0% |
| Common UI | 18 | 0 | 0% | 0% |
| Forms | 11 | 0 | 0% | 0% |
| Dashboard | 9 | 0 | 0% | 0% |
| Booking | 8 | 0 | 0% | 0% |
| Admin Tools | 29 | 0 | 0% | 0% |
| Other Pages | 120+ | 0 | 0% | 0% |
| **TOTAL** | **~200** | **0** | **0%** | **0%** |

---

## 🎓 Resources

### Documentation
- [react-i18next Official Docs](https://react.i18next.com/)
- [i18next Format Strings](https://www.i18next.com/translation-function/formatting)
- [Namespaces (Multiple Files)](https://www.i18next.com/principles/namespaces)

### Tools
- [i18next-parser](https://github.com/i18next/i18next-parser) - Auto-extract keys
- [i18next DevTools](https://www.i18next.com/overview/devtools) - Debug translations
- [Lokalise](https://lokalise.com/) - Translation management platform (optional)

### Translation
- [Google Translate API](https://cloud.google.com/translate) - Initial machine translation
- [Professional Thai Translators](https://www.proz.com/) - Freelance professional translators
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) - Reference

---

## ❓ FAQ

**Q: Why not use a translation service like Lokalise?**
A: For phase 1-2, manual JSON files are sufficient. Lokalise becomes valuable at 5+ languages. We can migrate later.

**Q: How do I handle Thai text that's longer than English?**
A: Use flexible containers, `word-break: break-word` in CSS, and test all layouts with Thai text.

**Q: What if we want to add more languages later?**
A: Just create new locale folders (`locales/it/`, `locales/jp/`) with the same namespace structure.

**Q: How do I update translations without redeploying?**
A: Use the `translations` database table for CMS-managed content. i18n JSON files are for static app UI.

**Q: Should I translate the admin dashboard?**
A: For phase 1-2, focus on user-facing flows (auth, navigation, booking). Admin tools can be EN-only initially.

---

## 📞 Support & Questions

- **Planning**: See `/plans/nifty-yawning-hoare.md` for detailed implementation plan
- **Code Examples**: Check component samples above
- **Database Help**: Refer to migration SQL in plan file
- **Thai Translation**: Contact professional translation services

---

**Created**: March 14, 2026
**For**: Thai Akha Kitchen B2B Partner Portal
**By**: Claude Code + Team
