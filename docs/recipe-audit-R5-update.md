# recipe-audit.md — R5 Rule Update

**Sostituire in:** `thai_akha_brain/.claude/agents/recipe-audit.md`
**Sezione:** CONTENT CHECKS (R1–R14) → R5

---

## VECCHIA REGOLA (da rimuovere)

```
**R5 — directions array has ≥ 4 steps with non-empty text**
- PASS: `jsonb_array_length(directions) >= 4`, each item has `step` and `text`
- FAIL: < 4 steps, or steps with null/empty text
```

## NUOVA REGOLA (da inserire)

```
**R5 — directions synchronized with direction photo panels (minimum 6)**

Thai Akha Kitchen direction photos are 6-panel composites. Each panel = one cooking step.
The `alt_text` of the direction gallery photo (gallery_asset_ids[2] in Postgres = index 1)
is the **source of truth** for what steps must exist in the DB.

**Merge rule (never delete — only add or improve):**
1. Fetch `alt_text` from `media_assets` for the direction photo
2. Parse the alt_text: each panel described = one required step
3. For each photo panel: if DB has matching step → keep/improve; if missing → add it
4. DB steps NOT mentioned in photo → keep, append after photo-matched steps
5. Total steps = max(photo_panel_count, existing_step_count) — never fewer
6. If recipe has 2 direction photos → combine all panels from both alt_texts

- PASS: `jsonb_array_length(directions) >= photo_panel_count` (min 6 for standard 6-panel photos)
- FAIL: fewer steps than photo panels
- WARN: steps exist but do not reference photo panel actions — review for alignment

**SQL to fetch direction photo alt_text:**
SELECT ma.alt_text, ma.caption
FROM recipes r
JOIN media_assets ma ON ma.asset_id = r.gallery_asset_ids[2]
WHERE r.slug = '[slug]';
```
