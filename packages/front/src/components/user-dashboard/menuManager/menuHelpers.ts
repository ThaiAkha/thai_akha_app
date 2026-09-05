/**
 * MenuManager - normalizzazione chiave categoria e descrizioni di fallback.
 * Estratte da MenuManager.tsx (#16 split monstre) a comportamento invariato.
 */
export const normalizeCatKey = (cat: string): string => {
  const c = (cat || '').toLowerCase();
  if (c.includes('curry')) return 'curry';
  if (c.includes('soup')) return 'soup';
  if (c.includes('stir')) return 'stirfry';
  if (c.includes('akha')) return 'akha_specialty';
  if (c.includes('appetizer')) return 'appetizer';
  if (c.includes('dessert')) return 'dessert';
  return c;
};

// Legacy fallback for descriptions
export const FALLBACK_CATEGORY_INFO: Record<string, string> = {
  akha_specialty: "Authentic Akha mountain dishes using traditional techniques and foraged ingredients.",
  appetizer: "Handcrafted starters designed to awaken your senses with crunchy textures and fresh Thai herbs.",
  dessert: "Traditional Thai sweets showcasing the natural sweetness of ripe tropical fruits and coconut cream."
};

/**
 * Campi tradotti che le card del menu (MenuManager e UserMenu) mostrano davvero:
 * nome, descrizione, note. Niente campi seo e og (non si vedono qui) ne' dietary_variants
 * (JSON pesante). Una costante sola per i due lettori, cosi' non divergono.
 */
export const MENU_RECIPE_T_FIELDS = [
  'name', 'subtitle', 'description', 'excerpt', 'health_benefits', 'garnish', 'cooks_tip',
  'notes', 'directions', 'essentials',
] as const;
