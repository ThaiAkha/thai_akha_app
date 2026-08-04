# Thai Akha Kitchen — News Content Standard & Template

> **Stato**: Canone. Standard di costruzione per gli articoli `akha_news`.
> **Audit/QA**: `thai_akha_brain/.claude/agents/news-audit.md` (41 check) — questo doc è il *template di costruzione*, quello è il *checklist di verifica*.
> **Voce**: `103_Humanizer/HUMANIZER.md` + profilo `profiles/news.md`.
> **Ultimo aggiornamento**: 2026-06-24

---

## 1. I 3 tipi di news (category_id)

Ogni articolo appartiene a UNA delle 3 categorie. Struttura DB identica; cambiano angolo e voce.

| category_id | Tipo | Angolo / voce |
|---|---|---|
| `thai-cooking-tips-secrets` | **Cooking Tips & Secrets** | How-to, tecnica, guida pratica. Insegna. Link interni a ricette/classi. |
| `akha-culture-heritage` | **Akha Culture & Heritage** | Storytelling culturale, heritage, memoria. Link a culture_sections. |
| `chiang-mai-city-life` | **Chiang Mai City Life** | Local/lifestyle, esperienza, servizi (es. cookbook/certificate). Link a classi/booking. |

---

## 2. Colonne obbligatorie (akha_news)

`title` · `subtitle` · `excerpt` (plain 80–160) · `content` (TEXT = JSON array di blocchi) · `category_id` · `cover_asset_id` · `seo_title` (≤60, finisce con `| Thai Akha Kitchen`) · `seo_description` (120–160, no "Discover") · `canonical_url` (`https://www.thaiakha.com/thai-cooking-tips-news/{slug}`) · `og_image` (= URL di `{cover}` photo00) · `og_type='article'` · `faq` (jsonb) · `json_ld` (jsonb) · `content_quality_score` · `is_published` (gate, default false) · `last_content_audit_ai`.

---

## 3. Struttura `content` (JSON array di blocchi)

Tipi blocco: `paragraph` (`text`) · `heading` (`level`, `text`, `subtitle`) · `photo` (`assetId`, `fullWidth`) · `bullets` (`items[]`) · `quote` (`text`, `author`) · `divider` (`theme`).

Pattern tipico: intro 2 paragrafi → `divider` → per ogni sezione: `heading` H2 (con emoji) + `photo` + `paragraph`/`bullets` → `quote` del founder → paragrafo di chiusura con CTA.

---

## 4. Convenzione foto (IMPORTANTE)

- **asset_id = `news-{NN}-photo{MM}`** — NN = numero articolo (00,01,…), MM = indice foto (00,01,…). `photo00` = **cover/hero** (= `cover_asset_id` e `og_image`).
- **file_name** = `news-NN-photoMM.webp` · **bucket** = `news` (alla radice) · `mime_type='image/webp'` · `in_content=true` · `alt_text` descrittivo.
- Dimensione hero consigliata **1920×1080** (json_ld la dichiara).
- **Placeholder** per foto non ancora pronte: `assetId: "TBD"` (news-audit lo riconosce e lo esclude). In alternativa creare già il record `media_assets` col nome definitivo `news-NN-photoMM` e far caricare il file dall'umano.
- Trovare il prossimo NN libero: `SELECT DISTINCT substring(asset_id from 'news-([0-9]+)-photo') FROM media_assets WHERE asset_id ~ '^news-[0-9]+-photo[0-9]+$'`.

---

## 5. FAQ — regola 6 lunghe + 2 ricche (news-audit F1/F3/F4)

`faq` jsonb = **8 voci** in distribuzione "ragnatela", formato `{"name": "...", "acceptedAnswer": {"text": "..."}}`:
- **Q1–Q6 "lunghe"**: **30–40 parole** ciascuna (escluse tag HTML), **≥1 link interno** `/...` in ognuna (F4 richiede ≥6 risposte con link interno).
- **Q7–Q8 "ricche" (super-rich GEO)**: **40–80 parole** ciascuna, frasate come **query AI/voice-search**, con **link esterno autorevole** (`rel='noopener noreferrer' target='_blank'`) oltre agli interni.
- Distribuzione cluster ideale: Q1–Q2 cooking/class · Q3–Q4 Akha culture · Q5–Q6 news/tips · Q7–Q8 GEO. Bilanciare i link interni via `.claude/agent-memory/faq-link-distribution.md`.

---

## 6. JSON-LD `@graph` (2 nodi)

`{"@context":"https://schema.org","@graph":[ Article, FAQPage ]}`
- **Article**: `@id` `{canonical}#article` · `url` · `image` (ImageObject di photo00, 1920×1080) · `author`/`publisher` (Organization; publisher.logo = `brand-asset/logo.svg`) · `headline` (=title) · `keywords[]` · `wordCount` · `inLanguage:"en"` · `description` · `datePublished`/`dateModified` · `mainEntityOfPage` (WebPage).
- **FAQPage**: `@id` `{canonical}#faq` · `mainEntity[]` = la `faq` con `@type` Question/Answer iniettati (deriva 1:1 dalla colonna `faq`).

`content_quality_score` target **100** quando tutto sopra è presente.

---

## 7. Workflow nuovo articolo

1. Scrivi `content` (blocchi) in voce news del tipo giusto (humanizer profilo news).
2. Assegna `news-NN` libero; crea i record `media_assets` `news-NN-photo00..MM` (alt_text); il file lo carica l'umano nel bucket `news`.
3. Compila SEO (title/desc/canonical/og), `faq` (6+2), `json_ld` (Article+FAQPage), `score`.
4. `is_published=false` finché le foto non sono caricate; poi GO → `is_published=true`.
5. Verifica finale con `/news-audit {slug}`.

> Esempio di riferimento completo: `news-07` → slug `thai-cooking-class-certificate-cookbook` (chiang-mai-city-life).
