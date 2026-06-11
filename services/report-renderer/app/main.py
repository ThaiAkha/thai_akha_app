# -*- coding: utf-8 -*-
# Thai Akha Kitchen — Report Renderer service (HTML/CSS → PDF).
# Backbone unico per tutti i report A4/A5. Aggiungere un report = aggiungere un template + 1 riga in REGISTRY.
import os

from fastapi import FastAPI, Header, HTTPException, Response
from pydantic import BaseModel
from weasyprint import HTML

from .renderer import APP_DIR
from .templates import driver_report

app = FastAPI(title="Thai Akha Report Renderer")

# Registry template: nome -> funzione build(data, fmt) -> html
REGISTRY = {
    "driver_report": driver_report.build,
}

RENDER_TOKEN = os.environ.get("RENDER_TOKEN", "")


class RenderRequest(BaseModel):
    template: str
    format: str = "A5"          # "A4" | "A5"
    data: dict = {}
    filename: str | None = None  # nome file suggerito per il download


@app.get("/health")
def health():
    return {"ok": True, "templates": list(REGISTRY.keys())}


@app.post("/render")
def render(req: RenderRequest, x_render_token: str = Header(default="")):
    # Auth: token condiviso (impostato come secret su Cloud Run). Chiamato server-side da una Edge Function.
    if not RENDER_TOKEN or x_render_token != RENDER_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    builder = REGISTRY.get(req.template)
    if not builder:
        raise HTTPException(status_code=404, detail=f"Unknown template '{req.template}'")
    if req.format not in ("A4", "A5"):
        raise HTTPException(status_code=400, detail="format must be A4 or A5")

    try:
        html = builder(req.data, req.format)
        pdf = HTML(string=html, base_url=APP_DIR).write_pdf()
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"render error: {e}")

    fname = req.filename or f"{req.template}.pdf"
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{fname}"'},
    )
