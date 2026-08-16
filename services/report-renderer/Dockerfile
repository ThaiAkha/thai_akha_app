# Thai Akha Kitchen — Report Renderer (HTML/CSS → PDF via WeasyPrint)
# Backbone unico per TUTTI i report A4/A5. Deploy: Google Cloud Run.
FROM python:3.12-slim

# Librerie native richieste da WeasyPrint (Pango/Cairo/GDK-Pixbuf/HarfBuzz)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 libpangocairo-1.0-0 libcairo2 libgdk-pixbuf-2.0-0 \
    libffi-dev libharfbuzz0b libfribidi0 fonts-liberation \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

ENV PORT=8080
# Cloud Run inietta $PORT. 1 worker basta: PDF a richiesta, scala a zero.
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
