import { PAGE_SLUGS } from './pageSlugs';

/**
 * LEGACY_SLUG_MAP - alias URL (slug storici, abbreviazioni interne) → slug canonico
 * inglese con cui App.tsx sceglie la pagina e con cui si legge il DB.
 * Era una costante letterale dentro il componente App (ricreata a ogni render e
 * fonte di un eslint-disable su exhaustive-deps): audit 2026-08 #87.
 */
export const LEGACY_SLUG_MAP: Record<string, string> = {
  // Top-level canonical pages — shared single source.
  ...PAGE_SLUGS,
  'terms-and-conditions': 'booking-terms-conditions',
  'policy-and-privacy': 'privacy-policy',
  // History Sections
  'living-tradition': 'akha-village-living-traditions',
  'akha-men': 'akha-mens-new-year-traditions',
  'food-as-medicine': 'akha-food-as-medicine-healing',
  'learn-basic-survival': 'akha-jungle-survival-medicine',
  'spirit-gate': 'sacred-akha-spirit-gate-meaning',
  'music-folklore': 'traditional-akha-music-folklore',
  'religion-taboo': 'akha-religious-taboos-beliefs',
  'communal-dining': 'akha-communal-dining-etiquette',
  'spice-philosophy': 'akha-sapi-thong-spice-philosophy',
  'thai-akha-fusion': 'thai-akha-culinary-fusion',
  'religion-cosmos-belief': 'akha-cosmos-animist-beliefs',
  'modern-borders': 'akha-diaspora-southeast-asia',
  'hani-akha': 'hani-akha-shared-ancestry',
  'the-high-plateau': 'tibetan-plateau-akha-origins',
  'hill-tribes-overview': 'northern-thailand-hill-tribes-guide',
  'historical-roots': 'akha-migration-history-routes',
  'jungle-bounty': 'akha-jungle-foraging-pantry',
  'traditional-dress': 'traditional-akha-dress-silver',
  'threads-of-origin': 'akha-subgroups-migration-history',
  'woven-stories': 'akha-textile-embroidery-traditions',
  'swing-festival': 'akha-swing-festival-yehkuja',
  // Recipes
  'akha-salad': 'authentic-akha-mountain-salad-recipe',
  'akha-herbal-soup': 'akha-spirit-detox-soup-recipe',
  'akha-sapi-thong': 'traditional-akha-sapi-thong-recipe',
  'papaya-salad': 'authentic-som-tum-papaya-salad-recipe',
  'fried-spring-rolls': 'crispy-thai-spring-rolls-recipe',
  'thai-red-curry': 'authentic-thai-red-curry-recipe',
  'thai-green-curry': 'authentic-thai-green-curry-recipe',
  'thai-panang-curry': 'authentic-thai-panang-curry-recipe',
  'thai-massaman-curry': 'authentic-thai-massaman-curry-recipe',
  'tom-kha-coconut-milk': 'authentic-tom-kha-gai-recipe',
  'tom-yum-hot-and-sour': 'authentic-tom-yum-goong-recipe',
  'clear-soup-egg-tofu': 'thai-clear-soup-egg-tofu-recipe',
  'pad-thai': 'authentic-pad-thai-recipe-chiang-mai',
  'stir-fry-cashew-nuts': 'thai-chicken-cashew-nuts-recipe',
  'stir-fry-holy-basil': 'authentic-pad-kra-pao-recipe',
  'sweet-and-sour-vegetables': 'thai-sweet-and-sour-vegetable-recipe',
  'mango-sticky-rice': 'authentic-mango-sticky-rice-recipe',
  'pumpkin-in-coconut-milk': 'thai-pumpkin-coconut-milk-recipe',
  // News Articles
  'the-art-of-thai-akha-spice-soft-to-warrior': 'thai-spice-levels-guide',
  'how-to-prepare-cooking-class-chiang-mai': 'prepare-thai-cooking-class-chiang-mai',
  'how-the-class-works': 'how-thai-cooking-class-works',
  'dietary-styles-and-customization': 'vegan-vegetarian-thai-cooking-guide',
  'cooking-with-food-allergies': 'allergy-safe-thai-cooking-protocols',
  'art-of-mortar-pestle': 'mortar-vs-blender-thai-curry-paste',
  'local-market-tour-experience': 'chiang-mai-local-market-tour-guide',
  'free-pickup-zones-chiang-mai': 'cooking-class-chiang-mai-pickup-map',
  'niti-muelaeku-akha-chef': 'chef-niti-muelaeku-akha-heritage',
  '6-reasons-to-join-thai-akha-kitchen': 'best-cooking-school-chiang-mai-reasons',
  'reducing-plastic-consumption-chiang-mai': 'sustainable-cooking-zero-plastic-chiang-mai',
  'how-to-use-dry-spices-curry-paste': 'how-to-use-thai-dry-spices-guide',
  'akha-thai-languages-guide': 'essential-thai-akha-market-phrases',
  'vegan-akha-cooking': 'authentic-vegan-thai-cooking-chiang-mai',
  'cookbook-and-certificate': 'thai-cooking-class-certificate-cookbook'
};
