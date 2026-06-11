# -*- coding: utf-8 -*-
# Render core — building block condivisi (font, palette Akha, CSS base, shell A4/A5).
# Stesso linguaggio visivo del template 2030 validato (driver_report_a5.py).
import os

APP_DIR = os.path.dirname(os.path.abspath(__file__))  # base_url per fonts/ e assets/

# Palette Akha (rosso / grigio / lime)
BL = {1: '#E31F33', 2: '#868C8C', 3: '#98C93C'}

# Dimensioni pagina (mm)
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


def akha(n, sz=4, cols=BL):
    """Divisore a quadrati Akha. Genera n quadrati; il container width:100% clippa l'overflow."""
    seq = [1, 2, 3, 2]
    sq = "".join(
        f'<span style="width:{sz}px;height:{sz}px;flex:0 0 {sz}px;background:{cols[seq[i % 4]]}"></span>'
        for i in range(n)
    )
    return f'<div class="akl" style="gap:{max(2, sz // 2)}px">{sq}</div>'


# Abbastanza quadrati per riempire anche A4 (clippato su A5)
HF = akha(150, 4)


def base_css(fmt='A5'):
    p = PAGE.get(fmt, PAGE['A5'])
    return f'''
{FONT_FACE}
@page{{ size:{fmt}; margin:0; }}
*{{ margin:0; padding:0; box-sizing:border-box; }}
body{{ font-family:'Roboto',sans-serif; color:#222827; font-size:8pt; line-height:1.4; }}
.page{{ position:relative; width:{p['w']}mm; height:{p['h']}mm; background:#fff; }}
.akl{{ display:flex; overflow:hidden; }} .akl span{{ border-radius:1px; display:inline-block; }}
.hdr{{ position:absolute; top:11mm; left:11mm; right:11mm; }}
.hdr .row{{ display:flex; align-items:flex-start; justify-content:space-between; gap:4mm; margin-bottom:3mm; }}
.hdr .left{{ display:flex; align-items:center; gap:4mm; }}
.hdr .lg{{ width:13mm; }}
.period{{ text-align:right; white-space:nowrap; }}
.period .plab{{ font-family:'Montserrat'; font-weight:800; font-size:5.5pt; letter-spacing:.18em; text-transform:uppercase; color:#9AA0A0; }}
.period .pval{{ font-family:'Montserrat'; font-weight:800; font-size:12.5pt; color:#121311; line-height:1; margin-top:.6mm; }}
.kick{{ font-family:'Montserrat'; font-weight:800; font-size:6pt; letter-spacing:.2em; text-transform:uppercase; color:#E31F33; white-space:nowrap; }}
.hdr h1{{ font-family:'Montserrat'; font-weight:800; font-size:14pt; color:#121311; letter-spacing:-.01em; line-height:1.02; white-space:nowrap; }}
.hdr h1 small{{ font-family:'Roboto'; font-weight:400; font-size:8.5pt; color:#9AA0A0; letter-spacing:0; }}
.hdr .sub{{ font-family:'Roboto'; font-weight:400; font-size:7.5pt; color:#9AA0A0; margin-top:.6mm; white-space:nowrap; }}
.hdr .akl{{ width:100%; }}
.content{{ position:absolute; top:36mm; bottom:16mm; left:11mm; right:11mm; }}
.kpis{{ display:flex; gap:2.5mm; margin-bottom:5mm; }}
.kpi{{ flex:1; border:1px solid #EBEFEF; border-radius:8px; padding:2.4mm 1mm; text-align:center; }}
.kpi .kn{{ font-family:'Roboto Condensed'; font-weight:700; font-size:13pt; color:#E31F33; }}
.kpi .kl{{ font-size:6.4pt; color:#5E6464; text-transform:uppercase; letter-spacing:.04em; }}
.sech{{ font-family:'Montserrat'; font-weight:800; font-size:13.5pt; color:#121311; margin:0 0 2.5mm; display:flex; align-items:center; gap:2.5mm; }}
.sech .akl{{ width:14mm; }}
table{{ width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden; box-shadow:0 0 0 1px #EBEFEF; }}
th{{ background:#E31F33; color:#fff; font-family:'Montserrat'; font-weight:700; font-size:6.8pt; text-align:left; padding:1.8mm 2.5mm; }}
td{{ padding:1.7mm 2.5mm; border-bottom:1px solid #EEF2F2; font-size:7.8pt; }}
th:not(:first-child), td.n{{ text-align:right; }}
tr:nth-child(even) td{{ background:#FAFBFB; }}
td.n{{ font-family:'Roboto Condensed'; font-weight:700; }}
tr.tot td{{ background:#eef0d8!important; font-weight:700; font-family:'Montserrat'; border-top:1px solid #d8dcc0; border-bottom:none; }}
.ftr{{ position:absolute; bottom:9mm; left:11mm; right:11mm; }} .ftr .akl{{ width:100%; }}
.ftr .row{{ display:flex; justify-content:space-between; align-items:center; margin-top:2.5mm; }}
.ftr .lg{{ width:7mm; }} .ftr .ft{{ font-family:'Montserrat'; font-size:5.4pt; color:#B6C2C2; letter-spacing:.04em; }}
.ftr .pg{{ font-family:'Roboto'; font-weight:700; font-size:6pt; color:#E31F33; }}
'''


def page_shell(fmt, header_html, content_html, footer_html):
    """Compone una pagina completa con lo shell brand condiviso."""
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{base_css(fmt)}</style></head><body>
<div class="page">
  <div class="hdr">{header_html}{HF}</div>
  <div class="content">{content_html}</div>
  <div class="ftr">{HF}{footer_html}</div>
</div></body></html>'''
