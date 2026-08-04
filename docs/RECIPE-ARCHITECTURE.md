# Thai Akha Kitchen — Recipe Architecture Manual

> **Ultimo aggiornamento**: Giugno 2026  
> **Autore**: Sessione architettura recipe-ingredients-dietary pipeline  
> **Stato**: Canone. Non modificare senza discutere con `/deepseek` o `/database`.

---

## TL;DR — Principio Fondamentale

Il sistema ricette usa **tre tabelle distinte** con ruoli non sovrapposti:

| Tabella | Soprannome | Ruolo | Usata da |
|---|---|---|---|
| `recipe_key_ingredients` | **Showroom** | UI visiva, filtri dieta/allergie | App front (class flow) |
| `dietary_substitutions` | **Regolatore Globale** | Sostituzioni per profilo dietetico | App front (Sistema A) |
| `recipe_composition` | **Motore Matematico** | Dosi, unità, BoM completa | CookBook (futuro) — MAI nel class flow |

**Regola d'oro**: `recipe_composition` non entra mai nel rendering della pagina ricette classe. `recipe_key_ingredients` non contiene mai dosi o quantità.

---

## 1. Tabelle e Loro Responsabilità

### 1.1 `recipe_key_ingredients` — Lo Showroom

**Scopo**: Fornire la lista visiva degli ingredienti principali per la card/griglia ricette nella pagina classe.

**Colonne chiave**:
```sql
ingredient        TEXT          -- nome leggibile dell'ingrediente
ingredient_id     UUID          -- FK a ingredients_library (per lookup futuro)
display_order     INT           -- ordine di visualizzazione nella griglia
ui_role           TEXT          -- 'hero', 'supporting', 'garnish'
dietary_adaptations JSONB       -- override per-ricetta (Sistema B)
```

**Struttura `dietary_adaptations`**:
```json
{
  "diet_vegan": {
    "action": "omit",
    "substitute_id": null
  },
  "allergy_peanuts": {
    "action": "substitute",
    "substitute_id": "uuid-of-replacement-ingredient"
  }
}
```
> Nota: `substitute_id` è un UUID di `ingredients_library`. La risoluzione nome→testo è ancora delegata a Sistema A (futuro: query diretta). 

**Cosa NON contiene**:
- Quantità (`quantity`) — mai
- Unità di misura (`unit`) — mai
- Istruzioni di taglio (`prep_note`) — mai
- Ingredienti secondari (acqua, sale, olio di base) — di norma esclusi

**Chi lo usa**:
- `recipeService.getAllRecipesFull()` — select per la griglia pagina ricette
- `recipeService.getRecipeBySlug()` — select per la pagina dettaglio ricetta
- `adaptRecipeToDiet()` in `recipeAdapter.ts` — Sistema B omit/substitute logic

**Query canonica** (da `recipe.service.ts`):
```ts
.select('*, content_categories(*), recipe_key_ingredients(ingredient, ingredient_id, display_order, dietary_adaptations, ui_role), cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)')
```

---

### 1.2 `dietary_profiles` + `dietary_substitutions` — Il Regolatore Globale (Sistema A)

**Scopo**: Definire i profili dietetici (Vegan, Halal, Kosher, Peanut Allergy…) e le loro sostituzioni ingrediente globali, valide per tutte le ricette salvo override di Sistema B.

**Colonne chiave `dietary_profiles`**:
```sql
id               TEXT   -- CANONICAL KEY con underscore: 'diet_vegan', 'allergy_peanuts'
slug             TEXT   -- con trattino: 'vegan', 'allergy-peanuts' — NON usare come key
name             TEXT
icon             TEXT
type             TEXT   -- 'lifestyle', 'religious', 'allergy'
display_order    INT
introduction     TEXT   -- field mappato a 'description' nella UI
experience       TEXT
```

> ⚠️ **Identity bug storico risolto**: `id` usa underscore (`allergy_peanuts`), `slug` usa trattino (`allergy-peanuts`). La chiave canonica è **sempre `id`** (underscore). Il mapping `getDietaryProfiles()` usa `p.id`, NON `p.slug`.

**Colonne chiave `dietary_substitutions`**:
```sql
dietary_profile_id          TEXT   -- FK a dietary_profiles.id
original_ingredient         TEXT   -- ingrediente da sostituire (match parziale lowercase)
substitute_ingredient       TEXT   -- nome sostituto, oppure sentinel "Omitted"
alt_substitute_ingredient_id UUID  -- FK a ingredients_library (secondo sostituto, opzionale)
```

**Sentinel "Omitted"**: se `substitute_ingredient = 'Omitted'`, l'ingrediente viene rimosso dalla lista (implementato lato codice, nessuna colonna DB aggiuntiva). Scelta deliberata: Opzione A (code-only, no migration).

**Alt substitute**: esposto come `ingredient1 / ingredient2` — futuro componente "1 vs 2". Recuperato via join:
```ts
alt_sub:ingredients_library!alt_substitute_ingredient_id(name_en)
```

**Chi lo usa**:
- `recipeService.getDietaryProfiles()` — carica profili + sostituzioni
- `adaptRecipeToDiet()` — Sistema A text-based substitution

---

### 1.3 `recipe_composition` — Il Motore Matematico 🔒

**Scopo**: Distinta Base (Bill of Materials) completa di ogni ricetta. Contiene TUTTI gli ingredienti con dosi, unità e note di preparazione. È la fonte di verità per il CookBook digitale, PDF, shopping list e feature di scala porzioni.

**Colonne chiave**:
```sql
recipe_id        UUID   -- FK a recipes
ingredient_id    UUID   -- FK a ingredients_library
quantity         NUMERIC
unit             TEXT
prep_note        TEXT   -- es. "julienned", "finely chopped"
step_order       INT
is_key_ingredient BOOLEAN  -- ⚠️ DEPRECATA — vedi nota sotto
```

> ⚠️ **`is_key_ingredient` DEPRECATA**: Questa colonna NON va usata per decidere cosa mostrare nella UI classe. La sorgente visiva è esclusivamente `recipe_key_ingredients`. Lasciare il campo nel DB per compatibilità legacy ma ignorarlo nel codice.

**VIETATO** nel class flow (`recipe_type = 'class'`):
```
❌ recipe_composition in getAllRecipesFull() select
❌ recipe_composition in getRecipeBySlug() select
❌ usare recipe_composition per popolare keyIngredients nella UI
❌ usare is_key_ingredient per filtrare ingredienti visivi
```

**Unica eccezione attuale**: dati pillole (servings, prep_time, total_time, difficulty) vengono da `recipes.*` direttamente — NON da `recipe_composition`. Confermato: nessuna eccezione per composition nel class flow.

**Chi lo usa ora**: Nessuno nel front (rimosso nella sessione giugno 2026).

**Chi lo userà in futuro**: Pagina CookBook dedicata (vedi sezione 4).

---

### 1.4 `recipes` — La Ricetta Base

**Colonne UI rilevanti** (pillole nella card):
```sql
servings         INT    -- "Serves N"
prep_time        INT    -- minuti
total_time       INT    -- minuti
difficulty       TEXT   -- 'easy', 'medium', 'hard'
dietary_variants JSONB  -- varianti per dieta (name, description, key_ingredients, etc.)
allergen_adaptations JSONB  -- adattamenti allergie (21/22 ricette ancora vuote — futuro)
```

**`dietary_variants` structure**:
```json
{
  "diet_vegan": {
    "name": "Vegan Green Curry",
    "description": "...",
    "key_ingredients": ["tofu", "coconut milk", "green curry paste"],
    "health_benefits": "...",
    "subtitle": "...",
    "excerpt": "..."
  }
}
```
> Se `key_ingredients` è presente, sovrascrive la lista base PRIMA che Sistema B e Sistema A vengano applicati.

---

### 1.5 `ingredients_library` — Il Dizionario

**Scopo**: Anagrafica centralizzata di tutti gli ingredienti (nome EN/TH, fonetica, immagine, categoria).

**Usato per**:
- Risolvere `ingredient_id` da `recipe_key_ingredients` → metadati (futuro: immagini ingrediente)
- Risolvere `alt_substitute_ingredient_id` da `dietary_substitutions` → nome alternativo
- Futuro: risolvere `substitute_id` da `dietary_adaptations` JSONB (Sistema B)

**Non usato attualmente**: per popolare direttamente le UI cards (futuro enhancement).

---

## 2. Flusso Dati — Sistema di Adattamento Dietetico

### Pipeline Completa

```
[DB: recipes] ──────────────────────────────────────────┐
  .dietary_variants[dietKey]                             │  Step 2: override base
                                                         ▼
[DB: recipe_key_ingredients] ──────── dietary_adaptations JSONB ──► omitSet (Sistema B)
                                                         │  Step 3: omit per-ricetta
                                                         ▼
[DB: dietary_profiles + dietary_substitutions] ─────────► text substitutions (Sistema A)
                                                         │  Step 4: sostituzioni globali
                                                         ▼
                                              Sistema B omit filter
                                                         │  Step 5: rimuovi omessi
                                                         ▼
                                              adapted.keyIngredients
                                                         │
                                                         ▼
                                              UI: MenuCard / RecipeView
```

### Gerarchia di Priorità

1. **`dietary_variants[dietKey].key_ingredients`** (DB) — sovrascrive lista base
2. **Sistema B omit** (`recipe_key_ingredients.dietary_adaptations`) — rimozione per-ricetta
3. **Sistema A substitution** (`dietary_substitutions`) — sostituzione testo globale
4. **Sistema B omit filter post-A** — garanzia: gli omessi sopravvivono anche dopo A

> Sistema B omit batte sempre Sistema A. Se B dice "omit fish sauce" e A dice "sostituisci fish sauce con tamari", l'ingrediente viene rimosso.

---

## 3. Pattern Codice Canonici

### 3.1 Fetch ricette (class flow)
```ts
// ✅ CORRETTO — recipe_composition NON inclusa
.select('*, content_categories(*), recipe_key_ingredients(ingredient, ingredient_id, display_order, dietary_adaptations, ui_role), cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)')
.eq('recipe_type', 'class')
```

### 3.2 Dietary profiles — id canonico
```ts
// ✅ CORRETTO
id: p.id    // 'allergy_peanuts', 'diet_vegan'

// ❌ SBAGLIATO (bug storico)
id: p.slug  // 'allergy-peanuts', 'vegan' — trattini invece di underscore
```

### 3.3 Allergy key format
```ts
// ✅ CORRETTO — sempre underscore
const allergyProfileId = `allergy_${allergyKey.toLowerCase().replace(/\s+/g, '_')}`;

// ❌ SBAGLIATO
const allergyProfileId = `allergy-${allergyKey.toLowerCase().replace(/\s+/g, '-')}`;
```

### 3.4 Sentinel "Omitted"
```ts
// ✅ CORRETTO — verifica case-sensitive
if (sub.substitute === 'Omitted') return null;
```

### 3.5 Alt substitute display
```ts
// ✅ CORRETTO — formato "Primary / Alt"
if (sub.alt_substitute) return `${sub.substitute} / ${sub.alt_substitute}`;
```

### 3.6 Sistema B omit applicato POST Sistema A
```ts
// Sistema A modifica gli ingredienti, poi Sistema B filtra
let ingredients = applySubstitutions(adapted.keyIngredients, profile.substitutions);
// ... allergie ...
if (omitSet.size > 0) {
  ingredients = ingredients.filter(ing => !omitSet.has(ing.toLowerCase()));
}
adapted.keyIngredients = ingredients;
```

### 3.7 Cache versioning
```ts
// Bump la versione cache ogni volta che cambia la query o la struttura dati
'recipes_full_v4'          // getAllRecipesFull
`recipe_${slug}_v10`       // getRecipeBySlug
'dietary_profiles_v2'      // getDietaryProfiles
```

---

## 4. Blueprint Futuro — Pagina CookBook / Recipe Detail

Quando verrà costruita la pagina dedicata a una singola ricetta con ricetta completa (non solo classe), usare `recipe_composition` come fonte dati primaria.

### 4.1 Query suggerita

```ts
const { data } = await supabase
  .from('recipe_composition')
  .select(`
    quantity,
    unit,
    prep_note,
    step_order,
    ingredient:ingredients_library (
      id,
      name_en,
      name_th,
      phonetic,
      image_url,
      category_id
    )
  `)
  .eq('recipe_id', recipeId)
  .order('step_order', { ascending: true });
```

### 4.2 Struttura dati risultante

```ts
interface CompositionRow {
  quantity: number;
  unit: string;         // 'g', 'ml', 'tbsp', 'cup', 'clove', ...
  prep_note: string;    // 'julienned', 'finely chopped', ''
  ingredient: {
    id: string;
    name_en: string;
    name_th: string;
    phonetic: string;
    image_url: string;
    category_id: string;
  };
}
```

### 4.3 Feature che recipe_composition abilita

| Feature | Come usarla |
|---|---|
| **Shopping List PDF** | Lista `ingredient.name_en + quantity + unit` |
| **Scala porzioni** | Moltiplica `quantity` per fattore scala |
| **Ingredienti raggruppati per categoria** | Group by `ingredient.category_id` |
| **Fonetica Akha** | Campo `phonetic` da ingredients_library |
| **Foto ingrediente** | Campo `image_url` da ingredients_library |
| **Istruzioni taglio** | Campo `prep_note` |
| **Step cooking order** | `step_order` — può mappare a passaggi procedura |

### 4.4 Regole da rispettare nella pagina CookBook

- Non re-usare `recipe_key_ingredients` come fonte dati nella pagina CookBook
- Non usare `is_key_ingredient` (deprecata) per filtrare
- Ignorare completamente `dietary_variants` e `dietary_adaptations` nella pagina CookBook — quella pagina mostra la ricetta originale completa
- La pagina CookBook è separata dalla pagina classe: route diversa, componenti diversi, query diverse

### 4.5 Route suggerita

```
/authentic-thai-akha-recipes/[slug]           → RecipeDetailPage (class flow, Sistema A+B)
/cookbook/[slug]                               → CookBookPage (recipe_composition, full recipe)
```

---

## 5. Deprecazioni e Trappole da Evitare

| Cosa | Perché è sbagliato | Cosa fare invece |
|---|---|---|
| `recipe_composition` in getAllRecipesFull | Ruolo sbagliato nel class flow | Non includere nel select |
| `recipe_composition` in getRecipeBySlug | Idem | Non includere nel select |
| `is_key_ingredient` per filtrare UI | Deprecato, non aggiornato | Usare `recipe_key_ingredients` |
| `p.slug` come id profilo dietetico | Usa trattini, crea mismatch | Usare `p.id` (underscore) |
| `allergy-` prefix con trattini | Mismatch con DB id | Usare `allergy_` con underscore |
| Sistema A applicato su `recipe.keyIngredients` | Base sbagliata (pre-dbVariant) | Usare `adapted.keyIngredients` |
| Aggiungere quantità a `recipe_key_ingredients` | Viola la separazione Showroom/BoM | Usare `recipe_composition` |
| Spostare ingredienti visivi a `recipe_composition` | Viola la separazione | Usare `recipe_key_ingredients` |

---

## 6. File Coinvolti

| File | Ruolo |
|---|---|
| `packages/shared/src/services/recipe.service.ts` | Query Supabase, fetch profiles, cache |
| `packages/front/src/lib/recipeAdapter.ts` | Sistema A+B logic, `adaptRecipeToDiet()` |
| `packages/front/src/pages/Recipes.tsx` | Orchestrazione pagina, passa `rki` all'adapter |
| `packages/front/src/hooks/useDietaryKnowledge.ts` | Hook profili dietetici |
| `packages/front/src/lib/recipeHelpers.ts` | `mapToRecipeData()` — DB row → RecipeData |
| `packages/front/src/components/menu/RecipeView.tsx` | Interfaccia `RecipeData` |

---

## 7. Task Futuri (Non Implementati)

- [ ] Popolare `allergen_adaptations` su 21/22 ricette (ora NULL)
- [ ] Popolare `dietary_variants` su paste_01/02/03/04 (sub-ricette)
- [ ] Risolvere `substitute_id` UUIDs in Sistema B → nome ingrediente via `ingredients_library`
- [ ] Componente "1 vs 2" per alt_substitute (ora formato `A / B` in stringa)
- [ ] Audit `ingredients_library`: slug mancanti, og_images mancanti
- [ ] Costruire pagina CookBook (`/cookbook/[slug]`) con `recipe_composition`
- [ ] Costruire componente shopping list PDF
- [ ] Feature scala porzioni (moltiplicatore su `recipe_composition.quantity`)
