import type { UserBookingState } from '@thaiakha/shared/services';
import { buildCherryPrompt, type CherryUserContext } from '../../prompts/cherryPrompt';
import type { UserProfile } from '../../services/auth.service';
import { tObj } from '../../i18n';
import { getRecipeContextForCherry } from '@thaiakha/shared/lib/cherryRecipeContext';
import { getCultureContextForCherry } from '@thaiakha/shared/lib/cherryCultureContext';
import { getNewsContextForCherry } from '@thaiakha/shared/lib/cherryNewsContext';
import { getIngredientContextForCherry } from '@thaiakha/shared/lib/cherryIngredientContext';
import { getGamificationContextForCherry } from '@thaiakha/shared/lib/cherryGamificationContext';
import { getBookingContextForCherry } from '@thaiakha/shared/lib/cherryBookingContext';
import { getPickupContextForCherry } from '@thaiakha/shared/lib/cherryPickupContext';
import { getStaticKnowledge, STATIC_KNOWLEDGE_UNAVAILABLE } from '@thaiakha/shared/data/cherryKnowledge';
import { getLegalContext } from '@thaiakha/shared/lib/cherryLegalContext';
import { getMenuContextForCherry } from '@thaiakha/shared/lib/cherryMenuContext';
import { getDietContextForCherry } from '@thaiakha/shared/lib/cherryDietContext';
import { buildCoveredTopicsBlock } from '@thaiakha/shared/lib/cherryCoveredTopics';

export type PickupResult = Awaited<ReturnType<typeof getPickupContextForCherry>>;

/**
 * Degrado PER CONTESTO: un blocco RAG che fallisce (rete, RLS, tabella assente)
 * non deve uccidere il messaggio. Prima un solo reject dentro il Promise.all
 * faceva cadere l'intera risposta nel "kitchen is very busy kha": l'ospite non
 * riceveva nulla anche quando 9 contesti su 10 avevano risposto. Ora si perde
 * QUEL blocco e Cherry risponde con il resto.
 */
async function safeBlock<T>(label: string, run: () => Promise<T>): Promise<T | null> {
  try {
    return await run();
  } catch (err) {
    console.warn(`[cherry] contesto "${label}" non disponibile, rispondo senza:`, err);
    return null;
  }
}

interface SystemInstructionParams {
  userText: string;
  /** Lingua dell'interfaccia: i contesti letti dal DB escono in quella lingua. */
  lang: string;
  userProfile?: UserProfile | null;
  bookingState: UserBookingState;
  summary?: string | null;
  coveredTopics: Set<string>;
}

/**
 * Costruisce la system instruction del turno: prompt base + summary + tutti i
 * blocchi RAG (ricette, cultura, news, ingredienti, gamification, booking,
 * pickup, sapere statico, legale, menu, diete) + anti-ripetizione.
 * Lo storico NON sta piu' qui: dal 2026-09-06 viaggia nel campo `history` del
 * proxy, nella forma nativa del modello (vedi shared/lib/cherryHistory).
 * Ritorna anche il pickupResult perché serve al pulsante mappa dinamico.
 */
export async function buildSystemInstruction({
  userText,
  lang,
  userProfile,
  bookingState,
  summary,
  coveredTopics,
}: SystemInstructionParams): Promise<{ systemInstruction: string; pickupResult: PickupResult }> {
  const userContext: CherryUserContext = {
    isLogged: !!userProfile,
    role: userProfile?.role,
    name: userProfile?.full_name,
    dietary_profile: userProfile?.dietary_profile ? ((tObj('cherry:dietaryMap') as Record<string, string>)[userProfile.dietary_profile] ?? userProfile.dietary_profile) : undefined,
    allergies: userProfile?.allergies,
    preferred_spiciness: userProfile?.preferred_spiciness_id ? (tObj('cherry:spicinessMap') as Record<string, string>)[String(userProfile.preferred_spiciness_id)] : undefined,
    booking_state: bookingState.state,
    days_until_class: bookingState.daysUntil,
    session_type: bookingState.sessionType ?? undefined,
  };
  const basePrompt = buildCherryPrompt(userContext);

  const summaryText = summary
    ? `\n### PREVIOUS CONVERSATION SUMMARY:\n${summary}`
    : '';

  // RAG ricette: se la domanda cita un piatto, iniettiamo i suoi ingredienti
  // reali dal DB (importanza progressiva + sostituzioni risolte per il profilo)
  // così Cherry non inventa. null se nessuna ricetta è riconosciuta.
  const activeProfileIds = [
    userProfile?.dietary_profile,
    ...(userProfile?.allergies ?? []),
  ].filter((p): p is string => !!p && p !== 'diet_regular');
  // Tutto cio' che non dipende da nient'altro, in UN giro solo. Ognuno fa fetch
  // (cached) + match e ritorna null se non pertinente: cultura, news, ricette e
  // gamification non si escludono a vicenda.
  // Ogni contesto e' avvolto in safeBlock: il Promise.all non puo' piu' rigettare,
  // quindi un contesto rotto costa il suo blocco, non la risposta.
  const [recipeBlock, cultureBlock, newsBlock, gamificationBlock, bookingBlock, menuBlock, dietBlock, staticKnowledge] = await Promise.all([
    // Il menu del cliente e la conoscenza delle diete non dipendono da nessuno
    // degli altri: stavano in fila per abitudine, e ogni attesa in fila si somma
    // davanti all'ospite che aspetta la risposta. Da cinque giri a due.
    safeBlock('recipe', () => getRecipeContextForCherry(userText, activeProfileIds, lang)),
    safeBlock('culture', () => getCultureContextForCherry(userText, lang)),
    safeBlock('news', () => getNewsContextForCherry(userText, lang)),
    safeBlock('gamification', () => getGamificationContextForCherry(userText)), // esce subito se nessun intento quiz
    safeBlock('booking', () => getBookingContextForCherry(userText, { isLogged: !!userProfile, userId: userProfile?.id })), // booking/availability su intento
    // Menu del cliente (per-utente, read-only): solo loggato + intento menu.
    userProfile
      ? safeBlock('menu', () => getMenuContextForCherry(userText, { isLogged: true, userId: userProfile.id }))
      : Promise.resolve(null),
    // Conoscenza diete/allergie (DB profili + sostituzioni), su intento, read-only.
    // Mira ai profili citati nel testo + quelli attivi dell'utente.
    safeBlock('diet', () => getDietContextForCherry(userText, { activeProfileIds, lang })),
    // Sapere statico generato dal DB (classi, punti di ritrovo, azienda, piatti,
    // diete), nella lingua dell'ospite: un import dinamico la prima volta, poi memoria.
    safeBlock('static', () => getStaticKnowledge(userText, lang)),
  ]);

  // Ingrediente: solo se NESSUNA ricetta ha matchato (le domande sul piatto hanno
  // precedenza e già includono gli ingredienti). Dipende da recipeBlock → dopo.
  // Pickup hotel→zona→orario: solo se NESSUNA prenotazione personale ha già
  // risposto (quella contiene il pickup dell'utente). Per guest e lookup generici.
  // Secondo e ultimo giro: pickup dipende da `bookingBlock`, ingrediente da
  // `recipeBlock`. Dipendono da rami diversi del giro precedente, quindi fra loro
  // sono indipendenti e possono partire insieme.
  const [pickupResult, ingredientBlock] = await Promise.all([
    bookingBlock ? Promise.resolve(null) : safeBlock('pickup', () => getPickupContextForCherry(userText)),
    recipeBlock ? Promise.resolve(null) : safeBlock('ingredient', () => getIngredientContextForCherry(userText, lang)),
  ]);

  const recipeText = recipeBlock ? `\n${recipeBlock}` : '';
  const cultureText = cultureBlock ? `\n${cultureBlock}` : '';
  const newsText = newsBlock ? `\n${newsBlock}` : '';
  const ingredientText = ingredientBlock ? `\n${ingredientBlock}` : '';
  const gamificationText = gamificationBlock ? `\n${gamificationBlock}` : '';
  const bookingText = bookingBlock ? `\n${bookingBlock}` : '';
  const pickupText = pickupResult ? `\n${pickupResult.text}` : '';
  // Fatti non caricati (chunk assente): lo si dice al modello, che altrimenti
  // cercherebbe blocchi promessi dal prompt e mai arrivati.
  const staticText = `\n${staticKnowledge || STATIC_KNOWLEDGE_UNAVAILABLE}`;
  // Clausole legali (RAG locale sui file generati): in-memory, match su domanda.
  // Gli altri temi arrivano dai contesti dedicati, che leggono le fonti dal DB.
  const faqBlock = getLegalContext(userText);
  const faqText = faqBlock ? `\n${faqBlock}` : '';
  const menuText = menuBlock ? `\n${menuBlock}` : '';
  const dietText = dietBlock ? `\n${dietBlock}` : '';

  // Anti-ripetizione: argomenti già coperti in sessione (da prima di questo turno).
  const coveredBlock = buildCoveredTopicsBlock(coveredTopics);
  const coveredText = coveredBlock ? `\n${coveredBlock}` : '';

  const systemInstruction =
    basePrompt + summaryText + recipeText + cultureText + newsText + ingredientText + gamificationText + bookingText + pickupText + staticText + faqText + menuText + dietText + coveredText;

  return { systemInstruction, pickupResult };
}
