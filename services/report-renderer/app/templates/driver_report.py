# -*- coding: utf-8 -*-
# Template "driver_report" — A4/A5, layout WeasyPrint-safe (tabelle, niente flex).
from ..renderer import page_shell, akha  # noqa: F401

LOGO = 'assets/logo-2026.png'
LOGO_FOOTER = 'assets/logo_footer.png'


def _int(v):
    try:
        return int(str(v).replace(',', '').strip())
    except (ValueError, AttributeError):
        return 0


def build(data, fmt='A5'):
    """
    data = { "driver": "At", "period": "3–9 June 2026",
             "rows": [ {"date","class","pax","fare"}, ... ] }
    """
    driver = data.get('driver', '')
    period = data.get('period', '')
    rows = data.get('rows', []) or []

    pickups = len(rows)
    guests = sum(_int(r.get('pax')) for r in rows)
    total = sum(_int(r.get('fare')) for r in rows)

    # KPI come tabella con celle spacer (gap reale, niente flex-gap)
    kpis = [(str(pickups), 'Pickups'), (str(guests), 'Guests'), (f'{total:,}', 'Total THB')]
    kpi_cells = ''.join(
        (f'<td class="kpisp"></td>' if i else '') +
        f'<td class="kpi"><span class="kn">{n}</span> <span class="kl">{l}</span></td>'
        for i, (n, l) in enumerate(kpis)
    )
    kpi_html = f'<table class="kpis"><tr>{kpi_cells}</tr></table>'

    body = ''.join(
        f'<tr><td>{r.get("date","")}</td><td>{r.get("class","")}</td>'
        f'<td class="n">{_int(r.get("pax"))}</td><td class="n">{_int(r.get("fare")):,}</td></tr>'
        for r in rows
    )
    body += (
        f'<tr class="tot"><td colspan="2">TOTAL · {pickups} pickups</td>'
        f'<td class="n">{guests:,}</td><td class="n">{total:,}</td></tr>'
    )

    # Header: tabella -> logo | titolo (affiancati) ............ Period (destra)
    header = f'''
    <table class="htab"><tr>
      <td class="lg"><img src="{LOGO}"></td>
      <td class="gap"></td>
      <td valign="middle">
        <div class="kick">Driver Report · Pickup</div>
        <h1>Driver Pickup Report</h1>
        <div class="sub">Thai Akha Kitchen · Chiang Mai</div>
      </td>
      <td class="period">
        <div class="plab">Period</div>
        <div class="pval">{period}</div>
      </td>
    </tr></table>'''

    content = f'''
    {kpi_html}
    <div class="sech">{akha(14, 6, 3, full=False)}Driver: {driver}</div>
    <table class="data">
      <thead><tr><th>Date</th><th>Class</th><th class="n">Pax</th><th class="n">Fare (THB)</th></tr></thead>
      <tbody>{body}</tbody>
    </table>'''

    footer = f'''
    <table class="ftab"><tr>
      <td class="lg"><img src="{LOGO_FOOTER}"></td>
      <td class="ft">Thai Akha Kitchen · Driver Report · 2030</td>
      <td class="pg">p. 1 / 1</td>
    </tr></table>'''

    return page_shell(fmt, header, content, footer)
