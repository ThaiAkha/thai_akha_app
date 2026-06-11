# -*- coding: utf-8 -*-
# Template "driver_report" — port del template 2030 validato (driver_report_a5.py),
# generalizzato A4/A5 e parametrico sui dati.
from ..renderer import page_shell, akha, HF  # noqa: F401

LOGO = 'assets/logo-2026.png'
LOGO_FOOTER = 'assets/logo_footer.png'


def _int(v):
    try:
        return int(str(v).replace(',', '').strip())
    except (ValueError, AttributeError):
        return 0


def build(data, fmt='A5'):
    """
    data = {
      "driver": "At",
      "period": "3–9 June 2026",
      "rows": [ {"date","class","pax","fare"}, ... ]
    }
    """
    driver = data.get('driver', '')
    period = data.get('period', '')
    rows = data.get('rows', []) or []

    pickups = len(rows)
    guests = sum(_int(r.get('pax')) for r in rows)
    total = sum(_int(r.get('fare')) for r in rows)

    kpis = [(str(pickups), 'Pickups'), (str(guests), 'Guests'), (f'{total:,}', 'Total THB')]
    kpi_html = ''.join(
        f'<div class="kpi"><span class="kn">{n}</span>&nbsp;<span class="kl">{l}</span></div>'
        for n, l in kpis
    )

    body = ''.join(
        f'<tr><td>{r.get("date","")}</td><td>{r.get("class","")}</td>'
        f'<td class="n">{_int(r.get("pax"))}</td><td class="n">{_int(r.get("fare")):,}</td></tr>'
        for r in rows
    )
    body += (
        f'<tr class="tot"><td colspan="2">TOTAL · {pickups} pickups</td>'
        f'<td class="n">{guests:,}</td><td class="n">{total:,}</td></tr>'
    )

    header = f'''
    <div class="row">
      <div class="left"><img class="lg" src="{LOGO}"><div>
        <div class="kick">Driver Report · Pickup</div>
        <h1>Driver Pickup Report</h1>
        <div class="sub">Thai Akha Kitchen · Chiang Mai</div>
      </div></div>
      <div class="period"><div class="plab">Period</div><div class="pval">{period}</div></div>
    </div>'''

    content = f'''
    <div class="kpis">{kpi_html}</div>
    <div class="sech">{akha(14, 5)} Driver: {driver}</div>
    <table><thead><tr><th>Date</th><th style="text-align:left">Class</th><th>Pax</th><th>Fare (THB)</th></tr></thead>
    <tbody>{body}</tbody></table>'''

    footer = (
        '<div class="row">'
        f'<img class="lg" src="{LOGO_FOOTER}">'
        '<span class="ft">Thai Akha Kitchen · Driver Report · 2030</span>'
        '<span class="pg">p. 1 / 1</span></div>'
    )

    return page_shell(fmt, header, content, footer)
