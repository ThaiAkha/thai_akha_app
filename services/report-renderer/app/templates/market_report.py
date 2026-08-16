# -*- coding: utf-8 -*-
# Template "market_report" — A4, scala RECIPE (EN/TH), self-contained.
# 3 report dalla stessa build():
#   type='run'     -> Logistics (1/run) · Kitchen Daily   -> rows=[{name, price}]   + meta=Date
#   type='monthly' -> Kitchen Monthly (solo totali giorno) -> rows=[{date, total}]  + meta=Period
# WeasyPrint-safe: tabelle, niente flex-gap. Divider = quadrati inline-block (margin-right).
# Stile FISSO scala Recipe (NON Akha brand): header verde #398869, divider 6-toni, TOTAL #ddf3ea.

LOGO = 'assets/logo-2026.png'
LOGO_FOOTER = 'assets/logo_footer.png'

# Recipe "Summer Gradient" (front base-theme.css)
RECIPE = ['#53c296', '#99d973', '#fae50d', '#f1ba05', '#dd6000', '#ca1f34']
GREEN = '#398869'   # recipe-1-700 — header tabella
TOT_BG = '#ddf3ea'
TOT_FG = '#2c6951'

LABELS = {
    'en': {'idx': '#', 'item': 'Item', 'price': 'Price (THB)', 'date': 'Date',
           'daily': 'Daily total (THB)', 'total': 'TOTAL', 'period': 'Period'},
    'th': {'idx': '#', 'item': 'รายการ', 'price': 'ราคา (บาท)', 'date': 'วันที่',
           'daily': 'รวมรายวัน (บาท)', 'total': 'รวมทั้งหมด', 'period': 'ช่วงเวลา'},
}


def _int(v):
    try:
        return int(str(v).replace(',', '').strip())
    except (ValueError, AttributeError):
        return 0


def _divider(n=160):
    """Striscia pixel a 6 toni (scala Recipe), full-width, WeasyPrint-safe."""
    sq = "".join(
        f'<span style="display:inline-block;width:6px;height:6px;margin-right:3px;'
        f'background:{RECIPE[i % 6]};border-radius:1px;vertical-align:top"></span>'
        for i in range(n)
    )
    return f'<div class="akl" style="display:block;width:100%">{sq}</div>'


HF = _divider(160)  # abbastanza quadrati per coprire A4 (clippato dall'overflow)

FONT_FACE = '''
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-Bold.ttf');font-weight:700;}
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-ExtraBold.ttf');font-weight:800;}
@font-face{font-family:'Roboto';src:url('fonts/Roboto-Regular.ttf');font-weight:400;}
@font-face{font-family:'Roboto Condensed';src:url('fonts/RobotoCondensed-Bold.ttf');font-weight:700;}
@font-face{font-family:'Sarabun';src:url('fonts/Sarabun-Regular.ttf');font-weight:400;}
@font-face{font-family:'Sarabun';src:url('fonts/Sarabun-Bold.ttf');font-weight:700;}
'''


def _css(lang):
    # TH usa Sarabun (glifi thai + simbolo ฿); EN usa Montserrat/Roboto.
    title_font = "'Sarabun'" if lang == 'th' else "'Montserrat'"
    body_font = "'Sarabun'" if lang == 'th' else "'Roboto'"
    # 'Sarabun' come fallback sui numeri per garantire il glifo ฿ anche in EN.
    num_font = "'Roboto Condensed','Sarabun'"
    return f'''
{FONT_FACE}
@page{{ size:A4; margin:0; }}
*{{ margin:0; padding:0; box-sizing:border-box; }}
body{{ font-family:{body_font},sans-serif; color:#222827; font-size:9pt; line-height:1.45; }}
.page{{ position:relative; width:210mm; height:297mm; background:#fff; }}
.akl{{ font-size:0; line-height:0; white-space:nowrap; overflow:hidden; }}

/* Header arioso (24mm) */
.hdr{{ position:absolute; top:24mm; left:24mm; right:24mm; }}
.htab{{ width:100%; border-collapse:collapse; }}
.htab .lg{{ width:16mm; vertical-align:middle; }}
.htab .lg img{{ width:16mm; display:block; }}
.htab .gap{{ width:5mm; }}
.kick{{ font-family:'Montserrat'; font-weight:800; font-size:7pt; letter-spacing:.2em; text-transform:uppercase; color:{GREEN}; white-space:nowrap; }}
.hdr h1{{ font-family:{title_font}; font-weight:800; font-size:18pt; color:#121311; letter-spacing:-.01em; line-height:1.08; }}
.hdr .sub{{ font-family:{body_font}; font-weight:400; font-size:8.5pt; color:#9AA0A0; margin-top:1mm; }}
.meta{{ text-align:right; white-space:nowrap; vertical-align:top; }}
.meta .plab{{ font-family:'Montserrat'; font-weight:800; font-size:6pt; letter-spacing:.18em; text-transform:uppercase; color:#9AA0A0; }}
.meta .pval{{ font-family:{title_font}; font-weight:800; font-size:13pt; color:#121311; line-height:1; margin-top:1mm; }}
.hf{{ margin-top:4mm; }}

/* Contenuto */
.content{{ position:absolute; top:52mm; bottom:22mm; left:24mm; right:24mm; }}
table.data{{ width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden; box-shadow:0 0 0 1px #EBEFEF; }}
table.data th{{ background:{GREEN}; color:#fff; font-family:'Montserrat'; font-weight:700; font-size:7.5pt; text-align:left; padding:2.4mm 3mm; text-transform:uppercase; letter-spacing:.03em; }}
table.data td{{ padding:2.1mm 3mm; border-bottom:1px solid #EEF2F2; font-size:9pt; }}
table.data th.n, table.data td.n{{ text-align:right; }}
table.data th.c, table.data td.c{{ text-align:center; width:10mm; color:#9AA0A0; }}
table.data tr:nth-child(even) td{{ background:#FAFBFB; }}
table.data td.n{{ font-family:{num_font}; font-weight:700; }}
table.data tr.tot td{{ background:{TOT_BG}; color:{TOT_FG}; font-weight:700; font-family:'Montserrat'; border-top:1px solid #c2e3d6; border-bottom:none; font-size:10pt; }}

/* Footer arioso (22mm) */
.ftr{{ position:absolute; bottom:13mm; left:24mm; right:24mm; }}
.ftr .hf{{ margin-bottom:3mm; }}
.ftab{{ width:100%; border-collapse:collapse; }}
.ftr .lg{{ width:8mm; }} .ftr .lg img{{ width:8mm; display:block; }}
.ftr .ft{{ font-family:'Montserrat'; font-size:6pt; color:#B6C2C2; letter-spacing:.04em; text-align:center; }}
.ftr .pg{{ font-family:'Roboto'; font-weight:700; font-size:6.5pt; color:{GREEN}; text-align:right; white-space:nowrap; }}
'''


def build(data, fmt='A4'):
    """
    data = {
      "lang": "en"|"th", "type": "run"|"monthly",
      "kicker": "Market Report · Logistics", "shop": "Muang Mai Market",
      "run_date": "10 Feb 2026",          # type=run
      "period": "1–28 Feb 2026",          # type=monthly
      "status": "Completed",
      "rows": [{"name","price"}] | [{"date","total"}],
      "total": 176,
    }
    NB: le date arrivano GIÀ localizzate dal chiamante (edge): EN o TH (พ.ศ. + mesi TH).
    Il template localizza solo le etichette statiche e il font.
    """
    lang = 'th' if data.get('lang') == 'th' else 'en'
    L = LABELS[lang]
    rtype = data.get('type', 'run')
    kicker = data.get('kicker', 'Market Report')
    shop = data.get('shop', '')
    status = data.get('status', '')
    rows = data.get('rows', []) or []
    total = _int(data.get('total'))

    if rtype == 'monthly':
        body = ''.join(
            f'<tr><td class="c">{i + 1}</td><td>{r.get("date", "")}</td>'
            f'<td class="n">{_int(r.get("total") or r.get("daily_total")):,}</td></tr>'
            for i, r in enumerate(rows)
        )
        body += (f'<tr class="tot"><td class="c"></td><td>{L["total"]}</td>'
                 f'<td class="n">{total:,}</td></tr>')
        head_cols = f'<th class="c">{L["idx"]}</th><th>{L["date"]}</th><th class="n">{L["daily"]}</th>'
        meta_lab, meta_val = L['period'], data.get('period', '')
    else:
        body = ''.join(
            f'<tr><td class="c">{i + 1}</td><td>{r.get("name", "")}</td>'
            f'<td class="n">{_int(r.get("price")):,} ฿</td></tr>'
            for i, r in enumerate(rows)
        )
        body += (f'<tr class="tot"><td class="c"></td><td>{L["total"]}</td>'
                 f'<td class="n">{total:,} ฿</td></tr>')
        head_cols = f'<th class="c">{L["idx"]}</th><th>{L["item"]}</th><th class="n">{L["price"]}</th>'
        meta_lab, meta_val = L['date'], data.get('run_date', '')

    sub = 'Thai Akha Kitchen · Chiang Mai' + (f' · {status}' if status else '')
    header = f'''
    <table class="htab"><tr>
      <td class="lg"><img src="{LOGO}"></td>
      <td class="gap"></td>
      <td valign="middle">
        <div class="kick">{kicker}</div>
        <h1>{shop or kicker}</h1>
        <div class="sub">{sub}</div>
      </td>
      <td class="meta">
        <div class="plab">{meta_lab}</div>
        <div class="pval">{meta_val}</div>
      </td>
    </tr></table>'''

    content = (f'<table class="data"><thead><tr>{head_cols}</tr></thead>'
               f'<tbody>{body}</tbody></table>')

    footer = f'''
    <table class="ftab"><tr>
      <td class="lg"><img src="{LOGO_FOOTER}"></td>
      <td class="ft">Thai Akha Kitchen · Market Report · 2030</td>
      <td class="pg">p. 1 / 1</td>
    </tr></table>'''

    return (f'<!DOCTYPE html><html><head><meta charset="utf-8">'
            f'<style>{_css(lang)}</style></head><body>'
            f'<div class="page">'
            f'<div class="hdr">{header}<div class="hf">{HF}</div></div>'
            f'<div class="content">{content}</div>'
            f'<div class="ftr"><div class="hf">{HF}</div>{footer}</div>'
            f'</div></body></html>')
