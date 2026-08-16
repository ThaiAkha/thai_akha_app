# -*- coding: utf-8 -*-
# Template "agency_report" — A4, booking di un'agenzia in un periodo (settimana o mese).
# Colonne: Date · Guest · Class · Pax · Price · Commission. KPI: Bookings · Guests · Net THB.
from ..renderer import page_shell, akha  # noqa: F401

LOGO = 'assets/logo-2026.png'
LOGO_FOOTER = 'assets/logo_footer.png'


def _int(v):
    try:
        return int(str(v).replace(',', '').strip())
    except (ValueError, AttributeError):
        return 0


def build(data, fmt='A4'):
    """
    data = { "agency": "...", "period": "...",
             "rows": [ {date,guest,class,pax,price,commission}, ... ],
             "gross": int, "commission": int, "net": int }
    """
    agency = data.get('agency', '')
    period = data.get('period', '')
    rows = data.get('rows', []) or []
    gross = _int(data.get('gross'))
    commission = _int(data.get('commission'))
    net = _int(data.get('net'))

    bookings = len(rows)
    guests = sum(_int(r.get('pax')) for r in rows)

    kpis = [(str(bookings), 'Bookings'), (str(guests), 'Guests'), (f'{net:,}', 'Net THB')]
    kpi_cells = ''.join(
        (f'<td class="kpisp"></td>' if i else '') +
        f'<td class="kpi"><span class="kn">{n}</span> <span class="kl">{l}</span></td>'
        for i, (n, l) in enumerate(kpis)
    )
    kpi_html = f'<table class="kpis"><tr>{kpi_cells}</tr></table>'

    body = ''.join(
        f'<tr><td>{r.get("date","")}</td><td>{r.get("guest","")}</td><td>{r.get("class","")}</td>'
        f'<td class="n">{_int(r.get("pax"))}</td>'
        f'<td class="n">{_int(r.get("price")):,}</td>'
        f'<td class="n">{_int(r.get("commission")):,}</td></tr>'
        for r in rows
    )
    body += (
        f'<tr class="tot"><td colspan="3">TOTAL · {bookings} bookings</td>'
        f'<td class="n">{guests:,}</td>'
        f'<td class="n">{gross:,}</td>'
        f'<td class="n">{commission:,}</td></tr>'
    )

    header = f'''
    <table class="htab"><tr>
      <td class="lg"><img src="{LOGO}"></td>
      <td class="gap"></td>
      <td valign="middle">
        <h1>Agency Bookings</h1>
        <div class="sub">Thai Akha Kitchen · Chiang Mai</div>
      </td>
      <td class="period">
        <div class="plab">Period</div>
        <div class="pval">{period}</div>
      </td>
    </tr></table>'''

    content = f'''
    {kpi_html}
    <div class="sech">{akha(10, 6, 3, full=False)}Agency: {agency}</div>
    <table class="data">
      <thead><tr><th>Date</th><th>Guest</th><th>Class</th><th class="n">Pax</th><th class="n">Price</th><th class="n">Commission</th></tr></thead>
      <tbody>{body}</tbody>
    </table>
    <table class="kpis" style="margin-top:5mm"><tr>
      <td class="kpi"><span class="kl">Gross</span> <span class="kn">{gross:,}</span></td>
      <td class="kpisp"></td>
      <td class="kpi"><span class="kl">Commission</span> <span class="kn">− {commission:,}</span></td>
      <td class="kpisp"></td>
      <td class="kpi"><span class="kl">Net due</span> <span class="kn">{net:,}</span></td>
    </tr></table>'''

    footer = '''
    <table class="ftab"><tr>
      <td class="lg"><img src="''' + LOGO_FOOTER + '''"></td>
      <td class="ft">Thai Akha Kitchen · Agency Report · 2030</td>
      <td class="pg">p. 1 / 1</td>
    </tr></table>'''

    return page_shell(fmt, header, content, footer)
