# Report Renderer — HTML/CSS → PDF (Cloud Run)

Backbone **unico** per tutti i report PDF di Thai Akha Kitchen (A4/A5). Stesso linguaggio visivo del template 2030 validato. Genera **on-the-fly**, non archivia nulla.

> Aggiungere un report = 1 file template in `app/templates/` + 1 riga in `REGISTRY` (`app/main.py`). Niente nuova infrastruttura.

## Struttura
```
services/report-renderer/
  Dockerfile            # python:3.12-slim + libs WeasyPrint (Pango/Cairo)
  requirements.txt      # fastapi · uvicorn · weasyprint
  app/
    main.py             # FastAPI: /health · POST /render (auth header)
    renderer.py         # CSS base + shell brand (akha, @page A4/A5), font self-contained
    templates/
      driver_report.py  # template #1 (port di driver_report_a5.py)
    fonts/  assets/      # Montserrat/Roboto + loghi (self-contained nell'immagine)
```

## API
`POST /render`  ·  header `X-Render-Token: <RENDER_TOKEN>`  ·  body:
```json
{
  "template": "driver_report",
  "format": "A5",
  "filename": "ThaiAkha_Driver_Report_At.pdf",
  "data": {
    "driver": "At",
    "period": "3–9 June 2026",
    "rows": [ { "date": "2026-06-03", "class": "Morning Class", "pax": 4, "fare": 550 } ]
  }
}
```
→ `200 application/pdf` (lo stream del PDF). `GET /health` → `{ ok, templates }`.

## Deploy su Cloud Run (una tantum, lato umano)
Prerequisiti: progetto Google Cloud + `gcloud` CLI autenticato + API Cloud Run/Cloud Build attive.

```bash
cd services/report-renderer

# 1) build + deploy (Cloud Build compila il Dockerfile e pubblica su Cloud Run)
gcloud run deploy report-renderer \
  --source . \
  --region asia-southeast1 \
  --no-allow-unauthenticated \
  --memory 512Mi --cpu 1 --concurrency 4 --min-instances 0

# 2) imposta il token condiviso (lo stesso che userà la Edge Function proxy)
gcloud run services update report-renderer \
  --region asia-southeast1 \
  --set-env-vars RENDER_TOKEN="$(openssl rand -hex 24)"
```
- `--min-instances 0` → **scala a zero**: costo zero quando non si generano report.
- `--no-allow-unauthenticated` → chiamabile solo da chi ha l'invoker IAM **oppure** (più semplice qui) rendilo pubblico ma protetto dal `RENDER_TOKEN`; in tal caso usa `--allow-unauthenticated` e tieni segreto il token. La chiamata avviene **server-side** da una Supabase Edge Function (mai dal browser), che custodisce il token.

Output: l'URL del servizio (`https://report-renderer-xxxx.a.run.app`). Servirà alla Edge Function `render-report` (prossimo step).

## Test locale (opzionale, richiede le libs WeasyPrint sul sistema)
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
# poi POST /render con header X-Render-Token
```
La sola **logica template** (HTML) è testabile senza WeasyPrint:
`python3 -c "from app.templates import driver_report; print(len(driver_report.build({'driver':'At','period':'x','rows':[]},'A5')))"`

## Flusso completo (target)
```
ManagerDriverPayouts (Stampa/Download)
  → Edge Function render-report (auth staff, legge dati DB, custodisce RENDER_TOKEN)
    → Cloud Run /render  → PDF
  ← PDF → il browser apre (stampa) o scarica
```
Nessun PDF salvato: generato a richiesta e scartato.
