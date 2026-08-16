# -*- coding: utf-8 -*-
# Render core — building block condivisi (font, palette Akha, CSS base, shell A4/A5).
# NB: WeasyPrint non applica il `gap` dei flexbox -> niente flex per layout/spaziature.
# Header/KPI = TABELLE; divider Akha = inline-block + margin-right. Robusto su WeasyPrint.
import os

APP_DIR = os.path.dirname(os.path.abspath(__file__))  # base_url per fonts/ e assets/

BL = {1: '#E31F33', 2: '#868C8C', 3: '#98C93C'}  # rosso / grigio / lime

PAGE = {
    'A5': {'w': 148, 'h': 210},
    'A4': {'w': 210, 'h': 297},
}

FONT_FACE = '''
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-SemiBold.ttf');font-weight:600;}
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-Bold.ttf');font-weight:700;}
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-ExtraBold.ttf');font-weight:800;}
@font-face{font-family:'Roboto';src:url('fonts/Roboto-Light.ttf');font-weight:300;}
@font-face{font-family:'Roboto';src:url('fonts/Roboto-Regular.ttf');font-weight:400;}
@font-face{font-family:'Roboto';src:url('fonts/Roboto-Bold.ttf');font-weight:700;}
@font-face{font-family:'Roboto Condensed';src:url('fonts/RobotoCondensed-Bold.ttf');font-weight:700;}
'''


def akha(n, sz=6, gap=3, full=True, cols=BL):
    """Divisore Akha: quadrati inline-block con margin-right (WeasyPrint-safe).
    sz = lato quadrato (px), gap = margine tra quadrati (px). full=True -> riga piena (clippata)."""
    seq = [1, 2, 3, 2]
    sq = "".join(
        f'<span style="display:inline-block;width:{sz}px;height:{sz}px;'
        f'margin-right:{gap}px;background:{cols[seq[i % 4]]};border-radius:1px;vertical-align:top"></span>'
        for i in range(n)
    )
    disp = 'block;width:100%' if full else 'inline-block'
    return f'<div class="akl" style="display:{disp}">{sq}</div>'


# Divisore pieno: abbastanza quadrati per coprire A4 (clippato su A5)
HF = akha(120, 6, 3, full=True)


def base_css(fmt='A5'):
    p = PAGE.get(fmt, PAGE['A5'])
    return f'''
{FONT_FACE}
@page{{ size:{fmt}; margin:0; }}
*{{ margin:0; padding:0; box-sizing:border-box; }}
body{{ font-family:'Roboto',sans-serif; color:#222827; font-size:8pt; line-height:1.4; }}
.page{{ position:relative; width:{p['w']}mm; height:{p['h']}mm; background:#fff; }}
.akl{{ font-size:0; line-height:0; white-space:nowrap; overflow:hidden; }}

/* Header (tabella) */
.hdr{{ position:absolute; top:11mm; left:11mm; right:11mm; }}
.hdr .htab{{ width:100%; border-collapse:collapse; }}
.hdr .lg{{ width:13mm; vertical-align:middle; }}
.hdr .lg img{{ width:13mm; display:block; }}
.hdr .gap{{ width:4mm; }}
.kick{{ font-family:'Montserrat'; font-weight:800; font-size:6pt; letter-spacing:.2em; text-transform:uppercase; color:#E31F33; white-space:nowrap; }}
.hdr h1{{ font-family:'Montserrat'; font-weight:800; font-size:14pt; color:#121311; letter-spacing:-.01em; line-height:1.05; white-space:nowrap; }}
.hdr .sub{{ font-family:'Roboto'; font-weight:400; font-size:7.5pt; color:#9AA0A0; margin-top:.8mm; white-space:nowrap; }}
.period{{ text-align:right; white-space:nowrap; vertical-align:top; }}
.period .plab{{ font-family:'Montserrat'; font-weight:800; font-size:5.5pt; letter-spacing:.18em; text-transform:uppercase; color:#9AA0A0; }}
.period .pval{{ font-family:'Montserrat'; font-weight:800; font-size:12.5pt; color:#121311; line-height:1; margin-top:.8mm; }}
.hdr .hf{{ margin-top:3mm; }}

/* Contenuto */
.content{{ position:absolute; top:37mm; bottom:16mm; left:11mm; right:11mm; }}

/* KPI (tabella con celle spacer) */
.kpis{{ width:100%; border-collapse:separate; border-spacing:0; margin-bottom:5mm; }}
.kpisp{{ width:2.5mm; }}
.kpi{{ width:31%; border:1px solid #EBEFEF; border-radius:8px; padding:2.6mm 1mm; text-align:center; }}
.kpi .kn{{ font-family:'Roboto Condensed'; font-weight:700; font-size:13pt; color:#E31F33; }}
.kpi .kl{{ font-family:'Roboto'; font-size:6.4pt; color:#5E6464; text-transform:uppercase; letter-spacing:.04em; }}

/* Sezione */
.sech{{ font-family:'Montserrat'; font-weight:800; font-size:13.5pt; color:#121311; margin:0 0 2.5mm; white-space:nowrap; }}
.sech .akl{{ vertical-align:middle; margin-right:2.5mm; }}

/* Tabella dati */
table.data{{ width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden; box-shadow:0 0 0 1px #EBEFEF; }}
table.data th{{ background:#E31F33; color:#fff; font-family:'Montserrat'; font-weight:700; font-size:6.8pt; text-align:left; padding:1.8mm 2.5mm; }}
table.data td{{ padding:1.7mm 2.5mm; border-bottom:1px solid #EEF2F2; font-size:7.8pt; }}
table.data th.n, table.data td.n{{ text-align:right; }}
table.data tr:nth-child(even) td{{ background:#FAFBFB; }}
table.data td.n{{ font-family:'Roboto Condensed'; font-weight:700; }}
table.data tr.tot td{{ background:#eef0d8; font-weight:700; font-family:'Montserrat'; border-top:1px solid #d8dcc0; border-bottom:none; }}

/* Footer (tabella) */
.ftr{{ position:absolute; bottom:9mm; left:11mm; right:11mm; }}
.ftr .hf{{ margin-bottom:2.5mm; }}
.ftr .ftab{{ width:100%; border-collapse:collapse; }}
.ftr .lg{{ width:7mm; }} .ftr .lg img{{ width:7mm; display:block; }}
.ftr .ft{{ font-family:'Montserrat'; font-size:5.4pt; color:#B6C2C2; letter-spacing:.04em; text-align:center; }}
.ftr .pg{{ font-family:'Roboto'; font-weight:700; font-size:6pt; color:#E31F33; text-align:right; white-space:nowrap; }}
'''


def page_shell(fmt, header_html, content_html, footer_html):
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{base_css(fmt)}</style></head><body>
<div class="page">
  <div class="hdr">{header_html}<div class="hf">{HF}</div></div>
  <div class="content">{content_html}</div>
  <div class="ftr"><div class="hf">{HF}</div>{footer_html}</div>
</div></body></html>'''
