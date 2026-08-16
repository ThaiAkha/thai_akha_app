# -*- coding: utf-8 -*-
# Template "kitchen_report" - A4, clienti/pax/incassi di UNA kitchen per giorno o settimana.
# Colonne: Date - Guest - Class - Pax - Paid - Revenue. KPI: Groups - Guests - Revenue THB.
# Modellato su agency_report (stesso page_shell, stessa palette): la teacher e il manager
# vedono due report che si somigliano, invece di due impaginazioni diverse.
#
# NB lingua: la edge passa `lang`, ma per kitchen_report manda le righe gia' in inglese
# (class = "Morning Class", paid = "Paid"/"Unpaid") e la data grezza ISO; solo `period`
# arriva localizzato. Finche' e' cosi' questo template resta EN, come agency_report.
# Per farlo bilingue TH serve prima che la edge localizzi righe e date, come fa per market_report.
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
    data = { "lang": "en"|"th", "kitchen": "...", "period": "...",
             "rows": [ {date,guest,class,pax,paid,revenue}, ... ],
             "groups": int, "pax": int, "revenue": int }
    """
    kitchen = data.get('kitchen', '')
    period = data.get('period', '')
    rows = data.get('rows', []) or []

    # I totali arrivano gia' calcolati dalla edge. Se mancano, li ricavo dalle righe
    # invece di stampare zero: un report che dice 0 su una lista piena e' peggio che inutile.
    groups = _int(data.get('groups')) or len(rows)
    guests = _int(data.get('pax')) or sum(_int(r.get('pax')) for r in rows)
    revenue = _int(data.get('revenue')) or sum(_int(r.get('revenue')) for r in rows)

    kpis = [(str(groups), 'Groups'), (str(guests), 'Guests'), (f'{revenue:,}', 'Revenue THB')]
    kpi_cells = ''.join(
        ('<td class="kpisp"></td>' if i else '') +
        f'<td class="kpi"><span class="kn">{n}</span> <span class="kl">{l}</span></td>'
        for i, (n, l) in enumerate(kpis)
    )
    kpi_html = f'<table class="kpis"><tr>{kpi_cells}</tr></table>'

    body = ''.join(
        f'<tr><td>{r.get("date","")}</td><td>{r.get("guest","")}</td><td>{r.get("class","")}</td>'
        f'<td class="n">{_int(r.get("pax"))}</td>'
        f'<td>{r.get("paid","")}</td>'
        f'<td class="n">{_int(r.get("revenue")):,}</td></tr>'
        for r in rows
    )
    if not rows:
        body = '<tr><td colspan="6">No bookings in this period.</td></tr>'
    else:
        body += (
            f'<tr class="tot"><td colspan="3">TOTAL · {groups} groups</td>'
            f'<td class="n">{guests:,}</td>'
            f'<td></td>'
            f'<td class="n">{revenue:,}</td></tr>'
        )

    header = f'''
    <table class="htab"><tr>
      <td class="lg"><img src="{LOGO}"></td>
      <td class="gap"></td>
      <td valign="middle">
        <h1>Kitchen Report</h1>
        <div class="sub">Thai Akha Kitchen · Chiang Mai</div>
      </td>
      <td class="period">
        <div class="plab">Period</div>
        <div class="pval">{period}</div>
      </td>
    </tr></table>'''

    content = f'''
    {kpi_html}
    <div class="sech">{akha(10, 6, 3, full=False)}Kitchen: {kitchen}</div>
    <table class="data">
      <thead><tr><th>Date</th><th>Guest</th><th>Class</th><th class="n">Pax</th><th>Paid</th><th class="n">Revenue</th></tr></thead>
      <tbody>{body}</tbody>
    </table>'''

    footer = '''
    <table class="ftab"><tr>
      <td class="lg"><img src="''' + LOGO_FOOTER + '''"></td>
      <td class="ft">Thai Akha Kitchen · Kitchen Report · 2030</td>
      <td class="pg">p. 1 / 1</td>
    </tr></table>'''

    return page_shell(fmt, header, content, footer)
