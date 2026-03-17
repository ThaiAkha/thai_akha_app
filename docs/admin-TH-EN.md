# Sistema i18n del Thai Akha Admin - Documentazione Tecnica (Source of Truth)

## Panoramica Architetturale

Il sistema di internazionalizzazione (i18n) dell'applicazione **Thai Akha Admin** è stato completamente rivisto e localizzato nell'ambito dell'applicazione stessa, abbandonando l'approccio centralizzato precedentemente utilizzato. Questa evoluzione riflette una strategia di modularità e indipendenza tra le diverse applicazioni del progetto.

### Indipendenza delle Applicazioni

**Admin App**:  
- **Stack i18n**: i18next con configurazione dedicata (`createInstance()`)
- **Lingue supportate**: Inglese (EN) - default, Thai (TH) - aggiuntiva
- **Caricamento dinamico**: Tramite `resourcesToBackend` dai file JSON locali
- **Persistenza**: LocalStorage con chiave `thaiakha_admin_lang`

**Front App**:  
- **Strategia**: Solo inglese (EN), nessuna implementazione i18n
- **Motivazione**: L'applicazione frontend è destinata a un pubblico internazionale e non richiede localizzazione Thai

Questa separazione consente:
1. **Maintenance isolata**: Modifiche al sistema i18n dell'Admin non influenzano il Front
2. **Performance ottimizzate**: Il Front evita il overhead del caricamento dinamico delle traduzioni
3. **Chiarezza dello scope**: Ogni applicazione ha requisiti linguistici ben definiti

## Struttura Directory Reale

```
packages/admin/src/
├── i18n/
│   ├── index.ts               # Esportazione dell'istanza e configurazione principale
│   ├── locales/
│   │   ├── en/               # Traduzioni inglese (default)
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── navigation.json
│   │   │   └── ... (15 namespace totali)
│   │   └── th/               # Traduzioni Thai
│   │       ├── common.json
│   │       ├── auth.json
│   │       ├── navigation.json
│   │       └── ... (15 namespace totali)
└── ... (altri moduli dell'app)
```

## Configurazione Tecnica i18next

### Istanziazione e Caricamento Dinamico

```typescript
// i18n/index.ts
import i18next from 'i18next';
import { resourcesToBackend } from 'i18next-resources-to-backend';

export const i18n = i18next.createInstance();

export const initI18n = async (lng?: LangCode) => {
  if (i18n.isInitialized) return i18n;

  await i18n
    .use(resourcesToBackend((language: string, namespace: string) =>
      import(`./locales/${language}/${namespace}.json`)
    ))
    .init({
      lng,
      fallbackLng: 'en',
      supportedLngs: ['en', 'th'],
      ns: [
        'common', 'auth', 'navigation', 'profile', 'dashboard', 
        'calendar', 'booking', 'hotels', 'database', 'storage', 
        'inventory', 'logistics', 'reservation', 'pos', 'pages'
      ],
      defaultNS: 'common',
      // ... altre impostazioni di detection e interpolation
    });

  return i18n;
};
```

## Namespaces Attuali (15 Totali)

Ogni namespace corrisponde a un dominio funzionale specifico dell'applicazione Admin:

| Namespace | Dominio Funzionale | Descrizione |
|-----------|-------------------|-------------|
| `common` | Globale | Termini e azioni utilizzati cross-modulo |
| `auth` | Autenticazione | Login, registrazione, sicurezza |
| `navigation` | Navigazione | Menu, routing, breadcrumbs |
| `profile` | Profilo Utente | Gestione account, preferenze |
| `dashboard` | Dashboard | Widgets, metriche, overview |
| `calendar` | Calendario | Eventi, date, scheduling |
| `booking` | Booking | Riservazioni, check-in/out |
| `hotels` | Hotel Management | Gestione proprietà, camere |
| `database` | Database | Operazioni CRUD, query |
| `storage` | Storage | File management, uploads |
| `inventory` | Inventario | Stock, prodotti, magazzino |
| `logistics` | Logistica | Supply chain, distribuzione |
| `reservation` | Riservazioni | Sistema avanzato di booking |
| `pos` | Point of Sale | Transazioni, pagamenti |
| `pages` | Pagine Statiche | Content management, SEO |

## Glossario Tecnico EN/TH (Selezione dal `common.json`)

Questo glossario rappresenta i termini tecnici più utilizzati nell'interfaccia Admin.

| English Term | Thai Translation | Contesto di Utilizzo |
|--------------|-----------------|----------------------|
| **Save** | บันทึก | Azioni di persistenza dati |
| **Cancel** | ยกเลิก | Annullamento operazioni |
| **Search** | ค้นหา | Funzioni di filtro e ricerca |
| **Edit** | แก้ไข | Modifica record/entità |
| **Delete** | ลบ | Rimozione permanente |
| **Confirm** | ยืนยัน | Azioni di verifica |
| **Back** | กลับ / ย้อนกลับ | Navigazione retrospettiva |
| **Next** | ถัดไป | Sequenzialità operativa |
| **Loading...** | กำลังโหลด... | Stati di caricamento |
| **Error** | ข้อผิดพลาด | Gestione errori |
| **Success** | สำเร็จ | Messaggi di conferma |
| **Required** | จำเป็นต้องระบุ | Validazione campi |
| **Optional** | ไม่จำเป็น | Campi non obbligatori |
| **Language** | ภาษา | Selezione inglese/thai |

## Guida per Nuovi Namespace

Quando si introduce un nuovo modulo nell'applicazione Admin che richiede localizzazione:

1. **Creazione dei File JSON**: Aggiungere `<namespace>.json` sia in `locales/en/` che in `locales/th/`.
2. **Registrazione**: Aggiungere il nome del namespace nell'array `ns` dentro `i18n/index.ts`.
3. **Utilizzo**: Usare `const { t } = useTranslation('<namespace>');` nei componenti React.

## Considerazioni per Developer

- **Indipendenza Front**: Ricorda che ogni modifica al sistema i18n di Admin **non** deve riflettersi in `packages/front`, che rimane EN-only per design.
- **LocalStorage**: La lingua scelta dall'utente Admin è memorizzata indipendentemente con la chiave `thaiakha_admin_lang`.
- **Dynamic Imports**: Grazie a `resourcesToBackend`, i file di traduzione vengono caricati on-demand, mantenendo leggero il bundle iniziale.

---

*Documentazione aggiornata per riflettere l'architettura reale del progetto.*
*Source of Truth: `packages/admin/src/i18n/`*
