# -*- coding: utf-8 -*-
# Template "salary_payslip" — A5 bilingue TH/EN (Sarabun), greyscale, brand 2030.
# data = { "workers": [ {employee_name, position, period, pay_date, salary, overtime,
#   ssf, other_ded, total_income, total_ded, net, ytd_income, ytd_ded, ytd_tax, ytd_ssf}, ... ] }
#
# SSF (ประกันสังคม): per Thai Akha NON e' una trattenuta ma una cifra AGGIUNTA al
# pagamento, che il lavoratore riceve con lo stipendio. Per questo sta nella colonna
# REDDITI (Income) e non in quella delle deduzioni, dove stava fino al 2026-08-24.
# Voci "Advance" e "Bonus" rimosse: non esistono in staff_salaries, stampavano solo zeri.
# Una pagina A5 per lavoratore → 1 PDF multipagina (stampa unica). Porting di payslip_a5_bilingual.py.

GREY = {1: '#5E6464', 2: '#C6CACA', 3: '#9AA0A0'}
LOGO = 'assets/logo-2026.png'
LOGO_FOOTER = 'assets/logo_footer.png'

FF = '''
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-SemiBold.ttf');font-weight:600;}
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-Bold.ttf');font-weight:700;}
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-ExtraBold.ttf');font-weight:800;}
@font-face{font-family:'Roboto';src:url('fonts/Roboto-Light.ttf');font-weight:300;}
@font-face{font-family:'Roboto';src:url('fonts/Roboto-Regular.ttf');font-weight:400;}
@font-face{font-family:'Roboto';src:url('fonts/Roboto-Bold.ttf');font-weight:700;}
@font-face{font-family:'Roboto Condensed';src:url('fonts/RobotoCondensed-Bold.ttf');font-weight:700;}
@font-face{font-family:'Sarabun';src:url('fonts/Sarabun-Regular.ttf');font-weight:400;}
@font-face{font-family:'Sarabun';src:url('fonts/Sarabun-Bold.ttf');font-weight:700;}
'''


def _akha(n, sz=4, cols=GREY):
    seq = [1, 2, 3, 2]
    return (f'<div class="akl" style="gap:{max(2, sz//2)}px">'
            + "".join(f'<span style="width:{sz}px;height:{sz}px;flex:0 0 {sz}px;background:{cols[seq[i % 4]]}"></span>' for i in range(n))
            + '</div>')


HF = _akha(92, 4)


def _lbl(th, en):
    return f'<span class="th">{th}</span> <span class="en">{en}</span>'


CSS = f'''
{FF}
@page{{ size:A5; margin:0; }}
*{{ margin:0; padding:0; box-sizing:border-box; }}
body{{ font-family:'Sarabun','Roboto',sans-serif; color:#2A2E2E; font-size:8.5pt; line-height:1.45; }}
.page{{ position:relative; width:148mm; height:210mm; background:#fff; }}
.page + .page{{ page-break-before:always; }}
.akl{{ display:flex; overflow:hidden; }} .akl span{{ border-radius:1px; display:inline-block; }}
.th{{ font-family:'Sarabun'; font-weight:700; color:#1d2121; }}
.en{{ font-family:'Roboto'; font-weight:400; font-size:6.6pt; color:#9AA0A0; }}
.hdr{{ position:absolute; top:11mm; left:11mm; right:11mm; }}
.hdr .row{{ display:flex; align-items:flex-start; justify-content:space-between; gap:4mm; margin-bottom:3mm; }}
.hdr .left{{ display:flex; align-items:center; gap:4mm; }} .hdr .lg{{ width:13mm; }}
.kick{{ font-family:'Montserrat'; font-weight:800; font-size:6pt; letter-spacing:.2em; text-transform:uppercase; color:#9AA0A0; white-space:nowrap; }}
.hdr h1{{ font-family:'Sarabun'; font-weight:700; font-size:16pt; color:#1d2121; line-height:1.05; }}
.hdr h1 small{{ font-family:'Montserrat'; font-weight:700; font-size:8pt; color:#9AA0A0; letter-spacing:.04em; }}
.hdr .akl{{ width:100%; }}
.period{{ text-align:right; white-space:nowrap; }}
.period .plab{{ font-family:'Montserrat'; font-weight:800; font-size:5.2pt; letter-spacing:.16em; text-transform:uppercase; color:#9AA0A0; }}
.period .pval{{ font-family:'Roboto Condensed'; font-weight:700; font-size:12pt; color:#1d2121; margin-top:.5mm; }}
.content{{ position:absolute; top:34mm; bottom:22mm; left:11mm; right:11mm; }}
.info{{ display:flex; gap:5mm; margin-bottom:5mm; }}
.fld{{ flex:1; border-bottom:1px solid #d3d7d7; padding-bottom:1.4mm; }}
.fld .fl{{ font-size:6.4pt; }} .fld .fv{{ font-family:'Sarabun'; font-weight:700; font-size:9.5pt; color:#1d2121; line-height:1.25; margin-top:.6mm; }}
table{{ width:100%; border-collapse:collapse; box-shadow:0 0 0 1px #E2E5E5; border-radius:8px; overflow:hidden; }}
th{{ background:#4B5158; color:#fff; font-family:'Montserrat'; font-weight:700; font-size:6.6pt; text-align:left; padding:1.9mm 3mm; }}
th.r,td.r{{ text-align:right; }}
td{{ padding:1.7mm 3mm; border-bottom:1px solid #EDEFEF; font-size:8pt; }}
td.amt{{ font-family:'Roboto Condensed'; font-weight:700; color:#1d2121; background:#FAFBFB; border-left:1px solid #EDEFEF; width:22%; }}
tr.tot td{{ background:#EEF0F1; font-weight:700; border-top:1px solid #d8dcdc; }}
tr.tot .th{{ color:#1d2121; }}
.net{{ display:flex; align-items:center; justify-content:space-between; background:#F2F3F4; border:1px solid #E2E5E5; border-left:3px solid #6E7681; border-radius:10px; padding:3.4mm 5mm; margin-top:4mm; }}
.net .nl{{ font-family:'Sarabun'; font-weight:700; font-size:10pt; color:#1d2121; }} .net .nl small{{ font-family:'Montserrat'; font-weight:700; font-size:6.4pt; color:#9AA0A0; }}
.net .nv{{ font-family:'Roboto Condensed'; font-weight:700; font-size:16pt; color:#1d2121; }} .net .nv small{{ font-size:8pt; color:#6E7681; }}
.sech{{ font-family:'Montserrat'; font-weight:800; font-size:7pt; letter-spacing:.1em; text-transform:uppercase; color:#9AA0A0; margin:5mm 0 1.8mm; }}
.ytd{{ display:flex; gap:2.5mm; }}
.yc{{ flex:1; border:1px solid #E2E5E5; border-radius:8px; padding:2.2mm 2mm; text-align:center; }}
.yc .yl{{ font-size:5.8pt; color:#9AA0A0; line-height:1.25; }} .yc .yv{{ font-family:'Roboto Condensed'; font-weight:700; font-size:10pt; color:#1d2121; margin-top:1mm; }}
.sign{{ display:flex; gap:7mm; position:absolute; left:0; right:0; bottom:0; }}
.sg{{ flex:1; }} .sg .sl{{ border-bottom:1px solid #8a9090; height:9mm; }} .sg .sc{{ font-size:6.6pt; color:#5E6464; text-align:center; margin-top:1.2mm; }}
.ftr{{ position:absolute; bottom:9mm; left:11mm; right:11mm; }} .ftr .akl{{ width:100%; }}
.ftr .row{{ display:flex; justify-content:space-between; align-items:center; margin-top:2.5mm; }}
.ftr .lg{{ width:7mm; }} .ftr .ft{{ font-family:'Montserrat'; font-size:5.2pt; color:#B6BCBC; letter-spacing:.04em; }}
.ftr .cp{{ font-family:'Roboto'; font-size:5.2pt; color:#C2C6C6; }}
'''


def _money(v):
    if v is None or v == '':
        return '0'
    try:
        return f'{int(round(float(str(v).replace(",", "").strip()))):,}'
    except (ValueError, TypeError):
        return str(v)


def _prow(inc_lbl, inc_v, ded_lbl, ded_v, tot=False):
    c = ' class="tot"' if tot else ''
    return (f'<tr{c}><td>{inc_lbl}</td><td class="amt r">{inc_v}</td>'
            f'<td>{ded_lbl}</td><td class="amt r">{ded_v}</td></tr>')


def _page(d):
    return f'''
<div class="page">
  <div class="hdr">
    <div class="row">
      <div class="left"><img class="lg" src="{LOGO}"><div>
        <div class="kick">Employee Payslip</div>
        <h1>สลิปเงินเดือน <small>Payslip</small></h1>
      </div></div>
      <div class="period"><div class="plab">งวดที่จ่าย · Period</div><div class="pval">{d.get('period','')}</div></div>
    </div>
    {HF}
  </div>
  <div class="content">
    <div class="info">
      <div class="fld"><div class="fl">{_lbl("ชื่อพนักงาน","Name")}</div><div class="fv">{d.get('employee_name','')}</div></div>
      <div class="fld"><div class="fl">{_lbl("ตำแหน่ง","Position")}</div><div class="fv">{d.get('position','')}</div></div>
      <div class="fld"><div class="fl">{_lbl("วันที่จ่าย","Payslip date")}</div><div class="fv">{d.get('pay_date','')}</div></div>
    </div>
    <table>
      <thead><tr><th>{_lbl("รายได้","Income")}</th><th class="r">{_lbl("จำนวนเงิน","Amount")}</th><th>{_lbl("รายการหัก","Deduction")}</th><th class="r">{_lbl("จำนวนเงิน","Amount")}</th></tr></thead>
      <tbody>
        {_prow(_lbl("เงินเดือน","Salary"), _money(d.get('salary')), _lbl("รายการหักอื่นๆ","Other"), _money(d.get('other_ded')))}
        {_prow(_lbl("ค่าล่วงเวลา","Overtime"), _money(d.get('overtime')), '', '')}
        {_prow(_lbl("ประกันสังคม","Social Security"), _money(d.get('ssf')), '', '')}
        {_prow(_lbl("รวมรายได้","Total Income"), _money(d.get('total_income')), _lbl("รวมรายการหัก","Total Deduction"), _money(d.get('total_ded')), tot=True)}
      </tbody>
    </table>
    <div class="net"><div class="nl">เงินได้สุทธิ <small>· Net to pay</small></div><div class="nv">{_money(d.get('net'))} <small>THB</small></div></div>
    <div class="sech">{_lbl("ยอดสะสม","Year to date")}</div>
    <div class="ytd">
      <div class="yc"><div class="yl">{_lbl("เงินได้สะสม","YTD Income")}</div><div class="yv">{_money(d.get('ytd_income'))}</div></div>
      <div class="yc"><div class="yl">{_lbl("เงินหักสะสม","YTD Deduction")}</div><div class="yv">{_money(d.get('ytd_ded'))}</div></div>
      <div class="yc"><div class="yl">{_lbl("ภาษีสะสม","YTD Tax")}</div><div class="yv">{_money(d.get('ytd_tax'))}</div></div>
      <div class="yc"><div class="yl">{_lbl("ประกันสังคมสะสม","YTD SSF")}</div><div class="yv">{_money(d.get('ytd_ssf'))}</div></div>
    </div>
    <div class="sign">
      <div class="sg"><div class="sl"></div><div class="sc">{_lbl("ลงชื่อพนักงาน","Employee Signature")}</div></div>
      <div class="sg" style="flex:.6"><div class="sl"></div><div class="sc">{_lbl("วันที่","Date")}</div></div>
    </div>
  </div>
  <div class="ftr">{HF}<div class="row"><img class="lg" src="{LOGO_FOOTER}"><span class="ft">Thai Akha Kitchen Limited Partnership · Payslip · 2030</span><span class="cp">Confidential</span></div></div>
</div>'''


def build(data, fmt='A5'):
    workers = data.get('workers') or []
    if not workers:
        workers = [{}]  # pagina vuota di cortesia
    pages = ''.join(_page(w) for w in workers)
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{pages}</body></html>'
