Thai Akha Kitchen — Color Palette
Brand Design System · v1.0 · 2026
--------------------------------------------------------------------------------
Indice
Filosofia del Colore
System Gray
Primary — Cherry Red
Secondary — Lime Green
Button Orange
Button Blue
Quiz Magenta
Quiz Purple
System UI Colors
Semantic Tokens — Light & Dark
Regole d'uso
Accessibilità WCAG
--------------------------------------------------------------------------------
Filosofia
La palette di Thai Akha Kitchen nasce dall'incontro tra la natura della foresta montana del Nord Thailand e l'energia vibrante della cucina tradizionale Akha.
I grigi portano mineralità e quiete. Il cherry dà calore e passione. Il lime richiama erbe fresche e vitalità. L'arancione evoca spezie e fuoco. Insieme costruiscono un'identità visiva autentica, leggibile e moderna.
"Usare il colore con intenzione, non decorazione."
--------------------------------------------------------------------------------
System Gray
Scala principale di neutri. Deriva direttamente dal CSS dell'admin app. Leggermente verdi/acquamarina, mai grigi puri.
Token
Hex
RGB
Uso
gray-25
#F6FCFC
246, 252, 252
Background pagina (light mode)
gray-50
#E6ECEC
230, 236, 236
Surface secondaria (light)
gray-100
#D6DCDC
214, 220, 220
Border leggero, input bg
gray-200
#C2C8C8
194, 200, 200
Border standard
gray-300
#AEB4B4
174, 180, 180
Divisori, placeholder
gray-400
#9AA0A0
154, 160, 160
Testo decorativo (non WCAG)
gray-500
#868C8C
134, 140, 140
Icone neutre
gray-600
#727878
114, 120, 120
Testo secondario (admin)
gray-700
#5E6464
94, 100, 100
Testo body (dark mode surface)
gray-800
#4A504F
74, 80, 79
Testo body (light mode)
gray-900
#222827
34, 40, 39
Surface dark mode
gray-950
#121311
18, 19, 17
Background dark mode
CSS Variables
--gray-25:  #F6FCFC;
--gray-50:  #E6ECEC;
--gray-100: #D6DCDC;
--gray-200: #C2C8C8;
--gray-300: #AEB4B4;
--gray-400: #9AA0A0;
--gray-500: #868C8C;
--gray-600: #727878;
--gray-700: #5E6464;
--gray-800: #4A504F;
--gray-900: #222827;
--gray-950: #121311;
--------------------------------------------------------------------------------
Primary — Cherry Red
Il colore identitario del brand. Caldo, deciso, evocativo. Usato per CTA principali, highlight, elementi di brand.
Token
Hex
Uso principale
cherry-100
#FBDDE4
Background tinted, badge light
cherry-200
#F6BCCB
Hover states leggeri
cherry-300
#F09AB2
Accent secondario
cherry-400
#ED7A93
Gradient start, icone colorate
cherry-500
#E54063
Brand primario · CTA · Button
cherry-600
#C9334F
Hover state, active
cherry-700
#A82741
Pressed state, testo su chiaro
cherry-800
#861D32
Text su background colorato
cherry-900
#641425
Deep accent
cherry-950
#420C18
Dark mode accent
CSS Variables
--cherry-400: #ED7A93;
--cherry-500: #E54063;
--cherry-600: #C9334F;
--cherry-700: #A82741;
Glow Shadows
--glow-cherry:   0 4px 20px rgba(229, 64, 99, 0.40);
--glow-cherry-h: 0 8px 36px rgba(229, 64, 99, 0.60);
Utilizzo
Pulsante primario front app (Prenota, Iscriviti, CTA principale)
Badge brand, tag categoria
Highlight su testo in hero section
Glass cherry: rgba(229, 64, 99, 0.22) + backdrop-filter: blur(16px)
Non usare come background di testo lungo o su aree estese
--------------------------------------------------------------------------------
Secondary — Lime Green
Verde brillante e naturale. È il colore dell'azione positiva nell'admin, della conferma, della natura. Richiama le erbe fresche della cucina Akha.
Token
Hex
Uso principale
lime-100
#EEF7D4
Background success light
lime-200
#E3F2BB
Hover tinted
lime-300
#D6EBA8
Gradient start chiaro
lime-400
#CDE89A
Accent secondario
lime-500
#BAD879
Admin button primario · Confirm
lime-600
#9EBF63
Hover admin button
lime-700
#82A64D
Active / pressed, testo su lime
lime-800
#65843A
Testo su background lime chiaro
lime-900
#4A6229
Deep accent
lime-950
#2E3D19
Dark accent
CSS Variables (Admin)
--color-button-primary:        #BAD879;
--color-button-primary-hover:  #9EBF63;
--color-button-primary-active: #82A64D;
Glow Shadows
--glow-lime:   0 4px 16px rgba(186, 216, 121, 0.40);
--glow-lime-h: 0 8px 28px rgba(186, 216, 121, 0.55);
Utilizzo
Pulsante primario admin app (New, Save, Confirm)
Icone success, badge "confermato"
Testo su lime: sempre scuro (#182a07 o lime-800)
Non usare testo bianco su lime-500 (contrasto insufficiente)
Glass lime: rgba(186, 216, 121, 0.15) + blur
--------------------------------------------------------------------------------
Button Orange
Arancione acceso e caldo. CTA ad alto impatto per la front app. Evoca spezie, fuoco, energia. Usato per acquisti e conversioni.
Token
Hex
Uso principale
orange-300
#FFBA80
Background tinted
orange-400
#FF9040
Gradient, accent
orange-500
#FF6D00
CTA acquisto · Book Fast
orange-600
#E56000
Hover state
orange-700
#CC5500
Active / pressed
CSS Variables
--orange-500: #FF6D00;
--orange-600: #E56000;
Glow Shadows
--glow-orange:   0 4px 20px rgba(255, 109, 0, 0.40);
--glow-orange-h: 0 8px 36px rgba(255, 109, 0, 0.60);
Utilizzo
Seconda CTA principale front app (Acquista, Book Fast, Sperimenta)
Gradient sunset: linear-gradient(135deg, #FF6D00, #E54063)
Non usare come colore warning UI — usare amber-500 (#f59e0b)
Testo sempre bianco su orange-500
--------------------------------------------------------------------------------
Button Blue
Blu informativo e istituzionale. Usato per azioni di navigazione, info, link.
Token
Hex
Uso principale
blue-300
#93C5FD
Background info light
blue-400
#60A5FA
Accent, icone info
blue-500
#3B82F6
Bottone info · Link · Detail
blue-600
#2563EB
Hover state
CSS Variables
--blue-500: #3B82F6;
--blue-600: #2563EB;
Glow Shadows
--glow-blue:   0 4px 16px rgba(59, 130, 246, 0.35);
--glow-blue-h: 0 8px 28px rgba(59, 130, 246, 0.55);
Utilizzo
Pulsante "Dettagli", "Info", link testuali
Badge stato "In attesa" nell'admin
Gradient night: linear-gradient(135deg, #3B82F6, #8B5CF6)
--------------------------------------------------------------------------------
Quiz Magenta
Colore dedicato al modulo quiz/AI. Vibrante, digitale, moderno.
Token
Hex
Uso principale
magenta-400
#E879A0
Accent, gradient
magenta-500
#D6366E
Quiz primary button
magenta-600
#B52A5B
Hover state
Utilizzo
Esclusivamente nel contesto quiz e AI chat
Background pulsanti quiz: bg-white text-black hover:bg-quiz
Non mischiare con cherry nelle stesse viste
--------------------------------------------------------------------------------
Quiz Purple
Colore secondario del modulo quiz. Crea profondità insieme al magenta.
Token
Hex
Uso principale
purple-400
#A78BFA
Accent, gradient
purple-500
#8B5CF6
Quiz secondary
purple-600
#7C3AED
Hover state
Utilizzo
Background quiz/chat: linear-gradient(135deg, #8B5CF6, #D6366E)
Gradient night bottone: #3B82F6 → #8B5CF6
Non usare nell'admin o nella front principale
--------------------------------------------------------------------------------
System UI Colors
Colori funzionali del sistema. Usare solo il tono 500, identico in light e dark mode. Nessuna scala completa.
Nome
Hex
Uso
sys-error
#EF4444
Errori, form validation, delete
sys-warning
#F59E0B
Avvisi, attenzione (amber, non orange)
sys-notice
#EAB308
Notifiche informative
sys-success
#22C55E
Successo, completed, verified
sys-info
#3B82F6
Informativo (stesso di blue-500)
CSS Variables
--sys-error:   #EF4444;
--sys-warning: #F59E0B;
--sys-notice:  #EAB308;
--sys-success: #22C55E;
--sys-info:    #3B82F6;
Note importanti
sys-warning usa amber (#F59E0B), non orange. L'orange-500 è riservato ai button CTA.
I colori system non hanno glow shadow.
Usare come background sempre con opacity: 0.1–0.15 per i tag/badge.
--------------------------------------------------------------------------------
Semantic Tokens
Token semantici da usare nei componenti React — mai i valori raw gray direttamente.
Light Mode
:root {
  --bg:         #F6FCFC;  /* gray-25  — background pagina */
  --surface:    #FFFFFF;  /* bianco   — card, modal, input */
  --surface-2:  #EEF4F4;  /* derivato — surface secondaria */
  --border:     #D6DCDC;  /* gray-100 — bordi leggeri */
  --border-2:   #C2C8C8;  /* gray-200 — bordi standard */

  --text-title: #121311;  /* gray-950 — titoli, H1-H3 · WCAG AAA */
  --text-body:  #4A504F;  /* gray-800 — body text · WCAG AAA */
  --text-sub:   #727878;  /* gray-600 — testo secondario · WCAG AA */
  --text-muted: #9AA0A0;  /* gray-400 — decorativo only, non body */
}
Dark Mode
body.dark {
  --bg:         #121311;  /* gray-950 — background pagina */
  --surface:    #222827;  /* gray-900 — card, modal, input */
  --surface-2:  #1a1f1e;  /* derivato — surface secondaria */
  --border:     #4A504F;  /* gray-800 — bordi leggeri */
  --border-2:   #5E6464;  /* gray-700 — bordi standard */

  --text-title: #F6FCFC;  /* gray-25  — titoli · WCAG AAA */
  --text-body:  #D6DCDC;  /* gray-100 — body text · WCAG AAA */
  --text-sub:   #9AA0A0;  /* gray-400 — testo secondario · WCAG AA */
  --text-muted: #727878;  /* gray-600 — decorativo only, non body */
}
Tailwind Config — extend.colors
colors: {
  cherry:  { 500: '#E54063', 600: '#C9334F', 700: '#A82741' },
  lime:    { 500: '#BAD879', 600: '#9EBF63', 700: '#82A64D' },
  orange:  { 500: '#FF6D00', 600: '#E56000' },
  blue:    { 500: '#3B82F6', 600: '#2563EB' },
}
--------------------------------------------------------------------------------
Regole d'uso
✅ Da fare
Usare cherry-500 come colore primario in tutte le CTA front
Usare lime-500 come colore primario di tutte le azioni admin
Usare sempre i semantic token (--text-title, --bg, ecc.) nei componenti
Testo su lime sempre scuro: #182a07 o var(--lime-800)
Testo su cherry/orange sempre bianco: #FFFFFF
Glass morphism solo su sfondi scuri (gray-900/950 o immagini scure)
Aggiungere sempre il glow shadow ai bottoni cherry, lime, orange, blue
❌ Da evitare
Non usare orange-500 come warning — esiste sys-warning (#F59E0B)
Non usare testo bianco su lime-500 — contrasto insufficiente (~2.8:1)
Non usare gray-400 come colore body text — solo decorativo
Non inventare nuove sfumature — usare solo i token definiti
Non applicare glass su sfondi chiari — effetto invisibile
Non mischiare quiz colors con la UI principale
Non usare più di 3 colori brand nella stessa vista
Gerarchia CTA
1° — Cherry  (#E54063)  Prenota / Iscriviti / Scopri  [Front]
2° — Orange  (#FF6D00)  Acquista / Book Fast           [Front]
3° — Lime    (#BAD879)  New / Save / Confirm           [Admin]
4° — Blue    (#3B82F6)  Info / Dettagli / Link
5° — Primary (black/white)  Secondary CTA neutral
--------------------------------------------------------------------------------
Accessibilità WCAG
Contrasti calcolati su background bianco (#FFF) in light mode.
Colore
Hex
Su bianco
Livello
Uso ammesso
gray-950
#121311
~19.5:1
AAA
Titoli, body, qualsiasi
gray-800
#4A504F
~8.1:1
AAA
Body text, label
gray-600
#727878
~4.6:1
AA
Sub-testo, label SM
gray-400
#9AA0A0
~2.9:1
✗ Fail
Solo decorativo
cherry-500
#E54063
~4.5:1
AA
Solo bottoni (bianco su cherry)
lime-500
#BAD879
~1.9:1
✗ Fail
Non usare testo su lime chiaro
lime-700
#82A64D
~4.1:1
AA
Testo outline lime
orange-500
#FF6D00
~3.1:1
✗ Fail
Solo bottoni con testo bianco
blue-500
#3B82F6
~3.6:1
AA large
Solo bottoni
Per testo bianco su cherry/orange: contrasto ~4.5:1 (borderline AA). Usare font-weight 600+ e size 14px+ per garantire leggibilità.
--------------------------------------------------------------------------------
Easing & Animation Reference
/* Spring — per bottoni, hover card, modal enter */
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);

/* Cinematic — per transizioni pagina, fade */
--ease-cinematic: cubic-bezier(0.25, 0.46, 0.45, 0.94);

/* Smooth — per hover color/opacity */
--ease-smooth:    cubic-bezier(0.4, 0, 0.2, 1);
--------------------------------------------------------------------------------
Thai Akha Kitchen Design System — Aggiornato Marzo 2026 Mantenuto da: Design Team · admin@thaiakhakitchen.com