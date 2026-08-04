# recipe-audit.md — Aggiornamenti 2026-06-05

Importare manualmente in `thai_akha_brain/.claude/agents/recipe-audit.md`

---

## 1. R5 — DIRECTIONS (sostituire la regola esistente)

```
**R5 — directions synchronized with direction photo panels (minimum 6)**

Thai Akha Kitchen direction photos are 6-panel composites. Each panel = one cooking step.
The `alt_text` of the direction photo (`gallery_asset_ids[2]` in Postgres, 1-indexed) is the
**source of truth** for what steps must exist in the DB.

**Merge rule (never delete — only add or improve):**
1. Fetch `alt_text` from `media_assets` for the direction photo
2. Each panel described in the alt_text = one required step
3. For each photo panel: if DB has matching step → keep/improve text; if missing → add it
4. DB steps NOT mentioned in photo → keep, append after photo-matched steps
5. Total steps = max(photo_panel_count, existing_step_count) — never fewer
6. If recipe has 2 direction photos → combine panels from both alt_texts

- PASS: jsonb_array_length(directions) >= photo_panel_count (min 6 for standard 6-panel photos)
- FAIL: fewer steps than photo panels
- WARN: steps exist but do not reference the photo panel actions — review for alignment

SQL to fetch direction photo alt_text:
  SELECT ma.alt_text, ma.caption
  FROM recipes r
  JOIN media_assets ma ON ma.asset_id = r.gallery_asset_ids[2]
  WHERE r.slug = '[slug]';
```

---

## 2. Nuovi check CULTURE (aggiungere dopo R14)

```
**C1 — culture_asset_ids: 2 media assets dalla culture section collegata**
- PASS: array con 2 asset IDs, entrambi presenti in media_assets
- FAIL: null, empty array, o ID non esistenti in media_assets
- WARN: array con 1 solo asset (preferire sempre 2)
- NOTA: gli asset devono provenire dalla culture section collegata (C2), NON dalla recipe gallery

**C2 — culture_link_url: URL alla culture section più pertinente**
- PASS: non-null, formato `/akha-culture-highland-heritage/[slug]`
- FAIL: null — nessun link culturale
- FAIL: URL che non corrisponde a un slug valido in culture_sections
- Pattern matching: slug della culture section deve riflettere il tema del piatto

**C3 — culture_link_label: titolo esatto della culture section**
- PASS: non-null, corrisponde al campo `title` + `title_highlight` della culture_sections row
- FAIL: null o testo generico non corrispondente alla section
- Fix: SELECT title, title_highlight FROM culture_sections WHERE slug = '[slug]'
```

**SQL per verificare C1–C3:**
```sql
SELECT
  r.slug, r.name,
  r.culture_asset_ids,
  r.culture_link_url,
  r.culture_link_label,
  cs.title AS section_title,
  CASE WHEN r.culture_link_url IS NULL THEN '❌ MISSING'
       WHEN cs.slug IS NULL THEN '❌ INVALID URL'
       ELSE '✅ ' || cs.slug END AS culture_status
FROM recipes r
LEFT JOIN culture_sections cs
  ON cs.slug = split_part(r.culture_link_url, '/akha-culture-highland-heritage/', 2)
WHERE r.slug = '[slug]';
```

**Guida mapping ricetta → culture section:**
| Tipo ricetta | Culture section suggerita |
|---|---|
| Akha salad, vegetable dishes | akha-jungle-foraging-pantry |
| Soups, detox, healing | akha-food-as-medicine-healing |
| Dipping sauces, chili pastes | akha-sapi-thong-spice-philosophy |
| Communal dishes, feast food | akha-communal-dining-etiquette |
| Thai curries (non-Akha) | thai-akha-culinary-fusion |
| Thai stir-fries, street food | thai-akha-culinary-fusion |
| Thai desserts | akha-jungle-foraging-pantry |

---

## 3. HTML formatting check (aggiungere a R3, R8, R9)

Aggiungere a ogni check di campo testo:

```
**HTML FORMATTING — regola per tutti i campi testo libero**
I seguenti campi DEVONO contenere HTML valido (non plain text):
  - description: <p> paragrafi + <strong> per parole chiave, link interni dove pertinente
  - notes: <p> paragrafi + <strong>, <em>, link a culture sections o ricette correlate
  - health_benefits: <p> + emoji come bullet point + <strong> per ogni ingrediente/beneficio

- PASS: field contiene almeno un tag <p>
- FAIL: plain text senza nessun tag HTML
- Fix: avvolgere in <p>...</p> e aggiungere <strong> per i termini chiave
```

---

## 4. FAQ length rule (aggiungere a R5 audit oppure come check autonomo)

```
**FAQ-L — FAQ word count (regola 2/2/2+2)**
Contare le parole in acceptedAnswer.text (escludendo HTML tags).

- Q1–Q6: 30–50 parole per risposta (hard cap)
  - Una sola idea per domanda
  - Un solo link interno
  - FAIL: > 50 parole — trimmare a un'idea sola
- Q7–Q8 (le "+2" lunghe): 70–90 parole
  - Testo rich con più link interni
  - Profondità culturale o CTA competitiva
  - FAIL: > 90 parole — condensare
  - FAIL: < 40 parole — troppo thin per GEO

SQL per verificare word count per ogni FAQ item:
  SELECT idx,
    array_length(regexp_split_to_array(
      regexp_replace((item->>'name') || ' ' || (item->'acceptedAnswer'->>'text'), '<[^>]+>', '', 'g'),
      '\s+'
    ), 1) AS word_count
  FROM recipes,
       jsonb_array_elements(faq) WITH ORDINALITY AS t(item, idx)
  WHERE slug = '[slug]'
  ORDER BY idx;
```

---

## 5. Aggiornamento report format

Nel template di output (STEP 3), aggiungere dopo R14:

```
🌍 CULTURE LINKS
  C1   culture_asset_ids (2 assets)    ✅/❌  [IDs]
  C2   culture_link_url valid          ✅/❌  [url]
  C3   culture_link_label matches      ✅/❌  [label]

📝 HTML FORMATTING
  H1   description has <p> tags        ✅/❌
  H2   notes has <p> tags              ✅/❌
  H3   health_benefits has <p> tags    ✅/❌

📏 FAQ LENGTH (2/2/2+2 rule)
  FL1  Q1–Q6 avg 30–50 words          ✅/❌  [avg: N words]
  FL2  Q7–Q8 avg 70–90 words          ✅/❌  [Q7: N | Q8: N]
```

E aggiornare il totale check: da 41 a **50 checks**
(+3 culture, +3 HTML, +2 FAQ length, +1 R5 direction-photo alignment)
