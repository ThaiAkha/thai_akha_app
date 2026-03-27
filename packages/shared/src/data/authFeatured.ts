// packages/shared/src/data/onboardingData.ts

// ============================================================================
// STEP 1: CHERRY CHEF PORTAL (Menu & Logistics)
// ============================================================================

export const CHEF_HERO_IMAGE = '/avatarCherry/600-Avatar-AuthPage.webp';
export const CHEF_TITLE_MAIN = "Cheff";
export const CHEF_TITLE_HIGHLIGHT = "Portal";
export const CHEF_DESCRIPTION = "Let's build your perfect menu. Cook 11 authentic dishes tailored exactly to your dietary needs and spice tolerance kha.";

// Interfaccia allineata alle props del tuo ClassHeroCard
export interface OnboardingCardData {
    title: string;
    description: string;
    iconName: string; // Usiamo stringhe per le icone (es. Lucide Icons) da mappare nel frontend
    badge?: string;
    color?: 'primary' | 'action' | 'quiz' | 'secondary';
}

export const CHEF_CARDS: OnboardingCardData[] = [
    {
        title: "Master 11 Dishes",
        description: "Cook 11 authentic dishes at your own individual cooking station. We take care of everything, from the hotel pick-up to your free full-color CookBook.",
        iconName: "UtensilsCrossed",
        color: "action"
    },
    {
        title: "100% Tailored to You",
        description: "We can easily adapt all recipes to your dietary needs, including Vegan, Gluten-Free, or specific food allergies. Plus, you choose your own spice level.",
        iconName: "Flame",
        color: "secondary"
    }
];

// ============================================================================
// STEP 2: STORY TELLER PORTAL (Culture & Gamification)
// ============================================================================

export const STORY_HERO_IMAGE = '/avatarCherry/600-Avatar-Storyteller.webp'; // Puoi usare un'altra immagine qui
export const STORY_TITLE_MAIN = "Akha";
export const STORY_TITLE_HIGHLIGHT = "Wisdom";
export const STORY_DESCRIPTION = "Discover our highland heritage. Test your knowledge, unlock badges, and earn real rewards at the school kha.";

export const STORY_CARDS: OnboardingCardData[] = [
    {
        title: "The Akha Wisdom",
        description: "Discover the Akha Zang, the traditional way of life passed down by our ancestors. Explore the mysteries of the Spirit Gate and our silver headdresses.",
        iconName: "Sparkles",
        color: "secondary"
    },
    {
        title: "Become a Guardian",
        description: "Test your knowledge with our cultural challenges to unlock badges and earn your Master Certificate. Play to win real rewards at our school.",
        iconName: "Trophy",
        color: "action"
    }
];
