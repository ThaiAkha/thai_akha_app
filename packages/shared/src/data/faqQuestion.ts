/**
 *  🍵 THAI AKHA KITCHEN - PUBLIC FAQ DATA
 *  File: faqQuestion.ts
 *  Description: Definitive Categorized Frequently Asked Questions for the B2C Frontend.
 *  Perfect for rendering Accordions and generating JSON-LD Schema. 
 */

// ─── Link riferimento inline ───────────────────────────────────────────────
export interface FAQLink {
    label: string;
    type: 'internal' | 'external';
    /** internal: chiave pagina per onNavigate */
    page?: string;
    /** internal: sectionId (es. slug articolo news) */
    section?: string;
    /** external: URL completa */
    url?: string;
}

// ─── CTA Button in fondo alla risposta ────────────────────────────────────
// Unificazione 2026-07: la colonna DB faq_questions.links e' incorporata in
// cta.links (colonna links droppata). Il payload cta puo' essere: solo bottone
// (label+page), solo links, o entrambi. Senza label non si rende alcun bottone.
export interface FAQCta {
    label?: string;
    page?: string;
    section?: string;
    variant?: 'brand' | 'action' | 'outline' | 'social' | 'btn-s';
    /** Material Symbol name (snake_case) */
    icon?: string;
    /** Link di riferimento inline (ex colonna links) */
    links?: FAQLink[];
}

// ─── Singola domanda ──────────────────────────────────────────────────────
export interface FAQItem {
    question: string;
    answer: string;
    links?: FAQLink[];
    cta?: FAQCta;
}

// ─── Categoria ────────────────────────────────────────────────────────────
export interface FAQCategory {
    id: string;
    categoryTitle: string;
    items: FAQItem[];
}

// ─── Dati ─────────────────────────────────────────────────────────────────

export const FAQ_DATA: FAQCategory[] = [
    // ==========================================
    // BLOCCO 1: CLASSES & THE EXPERIENCE (30%)
    // ==========================================
    {
        id: "about-experience",
        categoryTitle: "The Experience & Classes",
        items: [
            {
                question: "What makes Thai Akha Kitchen different?",
                answer: "Founded in 2015 by Akha descendant Niti Muelaeku, we are the first school in Chiang Mai to beautifully blend classic Thai street food with the indigenous heritage of the Akha hill tribe. We offer an immersive, forest-to-table culinary journey.",
                links: [
                    { label: "Read Our Story", type: "internal", page: "about-us" }
                ]
            },
            {
                question: "What is the difference between Morning and Evening classes?",
                answer: "The Morning class (9:00 AM - 2:30 PM) includes a vibrant 1-hour local market tour where you will learn to identify fresh mountain herbs. The Evening class (5:00 PM - 9:00 PM) skips the market, offering a cooler, cozy, and relaxed atmosphere perfect for a home-cooked dinner.",
                links: [
                    { label: "Morning Class Details", type: "internal", page: "morning-class" },
                    { label: "Evening Class Details", type: "internal", page: "evening-class" }
                ]
            },
            {
                question: "How many dishes will we cook?",
                answer: "You will master a complete 11-dish symphony! This includes 2 appetizers, 3 signature Akha dishes (including Sapi Thong), 1 handmade curry paste, 1 curry of your choice, 1 soup, 1 wok stir-fry, and 2 desserts. Rather than waiting until the end, you will enjoy your creations during multiple tasting breaks!"
            },
            {
                question: "What does 'Your Wok, Your Rules' mean? Do I have to share?",
                answer: "Absolutely not! Every student is provided with their own individual cooking station, wok, and stone mortar. You are the master of your own flavors, meaning you control exactly what goes into your dish.",
                links: [
                    { label: "How the class works", type: "internal", page: "news", section: "how-the-class-works" }
                ]
            },
            {
                question: "Do you use electric blenders for curry paste?",
                answer: "Never. We pound all ingredients by hand entirely from scratch using traditional stone mortars. This method crushes the cell walls and releases essential oils for an unmatched flavor that electric blades would simply destroy.",
                links: [
                    { label: "Why real Thai cooking uses mortar", type: "internal", page: "news", section: "art-of-mortar-pestle" }
                ]
            },
            {
                question: "Can I bring someone who doesn't want to cook?",
                answer: "Yes! Non-cooking companions join as Visitors — they watch, enjoy the atmosphere, and taste the dishes, but do not have a cooking station. Each paying cook may bring a maximum of 1 Visitor. The absolute cap is 2 Visitors per booking."
            }
        ]
    },

    // ==========================================
    // BLOCCO 2: DIETARY NEEDS & ALLERGIES (15%)
    // ==========================================
    {
        id: "dietary-allergies",
        categoryTitle: "Dietary Needs & Allergies",
        items: [
            {
                question: "I am vegan or vegetarian. Can I join?",
                answer: "Yes! Because you cook at your own individual station, there is zero cross-contamination. We can perfectly adapt every single recipe with premium substitutes like fresh tofu and fermented mushroom sauce for Vegan, Vegetarian, Halal, Kosher, Jain, Rastafari, and Hindu diets.",
                links: [
                    { label: "Our dietary customization guide", type: "internal", page: "news", section: "dietary-styles-and-customization" }
                ]
            },
            {
                question: "I have severe food allergies (like peanuts or gluten). Is it safe?",
                answer: "Yes, it is completely safe. We safely manage severe allergies with creative substitutes (like using roasted pumpkin seeds instead of peanuts, or premium gluten-free soy sauce). Please inform us during booking.",
                links: [
                    { label: "Allergy-Safe Protocols", type: "internal", page: "news", section: "cooking-with-food-allergies" }
                ]
            },
            {
                question: "Do you cook with pork or beef?",
                answer: "No, our kitchen is strictly free of red meat and pork. We only use fresh chicken, high-quality shrimp, or organic tofu."
            },
            {
                question: "Will the food be too spicy for me?",
                answer: "Only if you want it to be! Because you pound your own chilies, you control the fire. We offer 5 distinct spice levels: from the mild 'Level 1: The Farang', to 'Thai Smile', 'Respect!', 'Thai Spicy', up to the explosive 'Level 5: Akha Warrior'.",
                links: [
                    { label: "The 5 levels of Akha spice", type: "internal", page: "news", section: "the-art-of-thai-akha-spice-soft-to-warrior" }
                ]
            }
        ]
    },

    // ==========================================
    // BLOCCO 3: LOGISTICS, PICKUP & LOCATION (15%)
    // ==========================================
    {
        id: "logistics-location",
        categoryTitle: "Logistics & Location",
        items: [
            {
                question: "Do you offer free hotel pickup?",
                answer: "Yes, we provide complimentary pick-up and drop-off services within Chiang Mai Old City and the Nimman area. Our driver will meet you right in your hotel lobby.",
                cta: { label: "See Pickup Zones Map", page: "location", variant: "social", icon: "map" }
            },
            {
                question: "What if my hotel is outside the free pickup zone?",
                answer: "If you are staying outside the free zone, we have designated meeting points at easily recognizable landmarks, such as the MAYA Shopping Center, Central Festival, or Tha Phae Gate."
            },
            {
                question: "What happens during the morning local market tour?",
                answer: "You will join a vibrant 1-hour immersive experience to discover fresh mountain ingredients before lighting your wok. We also follow a strict Zero-Plastic Waste Policy, using woven bamboo baskets instead of plastic bags.",
                links: [
                    { label: "Zero-Plastic Waste Policy", type: "internal", page: "news", section: "reducing-plastic-consumption-chiang-mai" }
                ]
            },
            {
                question: "Where is Thai Akha Kitchen located?",
                answer: "We are located at 14/10 Rat Chiang Saen 2 Ko. Alley, Chiang Mai. If you prefer to walk in directly, our school is just a 5-minute walk from the historic Chiang Mai South Gate.",
                links: [
                    { label: "Open in Google Maps", type: "external", url: "https://maps.google.com/?q=14/10+Rat+Chiang+Saen+2+Ko+Alley+Chiang+Mai+50100+Thailand" }
                ]
            }
        ]
    },

    // ==========================================
    // BLOCCO 4: BOOKING, PAYMENTS & POLICIES (20%)
    // ==========================================
    {
        id: "how-to-book-pay",
        categoryTitle: "Booking & Payments",
        items: [
            {
                question: "Do I need previous cooking experience?",
                answer: "No experience needed at all! Our professional Akha teachers will guide you step by step, from how to properly hold a pestle to how to control the fierce heat of the wok."
            },
            {
                question: "How can I secure my cooking station?",
                answer: "You can instantly check real-time availability and reserve your spot on our secure booking page. Your culinary adventure in Chiang Mai is just a few clicks away!",
                cta: { label: "Book Now", page: "booking", variant: "social", icon: "arrow_forward" }
            },
            {
                question: "What is your cancellation and refund policy?",
                answer: "Customers may cancel their bookings up to 48 hours before the class start time for a full refund. Cancellations made less than 48 hours in advance are non-refundable.",
                links: [
                    { label: "Read the full Terms & Conditions", type: "internal", page: "terms-and-conditions" }
                ]
            },
            {
                question: "How can I pay for my booking? Is there a card fee?",
                answer: "You can securely book and pay online using a Credit Card or PayPal. If you prefer to pay on-site at the school, we accept Cash (THB, USD, EUR) or Alipay. Please note that paying by credit/debit card on-site incurs a standard 3% bank processing fee."
            },
            {
                question: "How can I contact you for a private group or B2B agency?",
                answer: "We welcome private groups and offer a dedicated B2B Partner Portal for agencies. You can reach us via email at office@thaiakhakitchen.com.",
                cta: { label: "Contact Us", page: "contact", variant: "social", icon: "mail" }
            }
        ]
    },

    // ==========================================
    // BLOCCO 5: OUR HIGHLAND HERITAGE (10%)
    // ==========================================
    {
        id: "akha-history",
        categoryTitle: "Akha Culture & History",
        items: [
            {
                question: "Where do the Akha people originally come from?",
                answer: "Our ancestors trace their roots back to the towering heights of the eastern Tibetan Plateau. Over centuries, they migrated southward through China to the lush mountains of Northern Thailand.",
                links: [
                    { label: "The Journey from the Tibetan Plateau", type: "internal", page: "history", section: "origins" }
                ]
            },
            {
                question: "What is the Akha Zang?",
                answer: "The Akha Zang, or 'The Akha Way', is our traditional, unwritten code of conduct. It guides our daily life, our animist beliefs, and our deep, respectful harmony with nature.",
                links: [
                    { label: "Living by the Akha Zang", type: "internal", page: "history", section: "akha-zang" }
                ]
            },
            {
                question: "What is the meaning of the wooden gate in an Akha village?",
                answer: "The Loku-Pah, or Spirit Gate, is a sacred architectural boundary. It separates the protected human domain from the wild forest spirits and is rebuilt every year.",
                links: [
                    { label: "The Sacred Akha Spirit Gate", type: "internal", page: "akha-culture-highland-heritage", section: "rituals" }
                ]
            },
            {
                question: "How did the Akha transition from opium to coffee farming?",
                answer: "Guided by a deep understanding of sustainable mountain agriculture, many Akha communities successfully replaced opium crops with high-quality, shade-grown Arabica coffee to protect the ecosystem.",
                links: [
                    { label: "From the Forest to the Table", type: "internal", page: "akha-culture-highland-heritage", section: "forest-to-table" }
                ]
            }
        ]
    },

    // ==========================================
    // BLOCCO 6: TIPS, NEWS & GAMIFICATION (10%)
    // ==========================================
    {
        id: "news-gamification",
        categoryTitle: "Tips, News & Gamification",
        items: [
            {
                question: "What kind of content can I find in the Thai Akha Kitchen News?",
                answer: "Our blog is your culinary hub! You will find professional Cook's Tips, logistical guides for your class, and deep dives into the Akha culture and our founder's story.",
                links: [
                    { label: "Read our Tips & News", type: "internal", page: "thai-cooking-tips-news" }
                ]
            },
            {
                question: "How should I prepare for my cooking class in Chiang Mai?",
                answer: "We recommend wearing light, comfortable clothes and arriving with a 'Gatherer's Appetite'! If you are doing the evening class, eat a very light lunch.",
                links: [
                    { label: "How to Prepare for Your Cooking Class", type: "internal", page: "thai-cooking-tips-news", section: "how-to-prepare-cooking-class-chiang-mai" }
                ]
            },
            {
                question: "What is the Akha Wisdom Path Quiz and what can I win?",
                answer: "It is our interactive gamification experience — four themed categories built around Akha culture, Thai cooking, local ingredients, and Chiang Mai life, across 16 levels. Earn XP to unlock seven real rewards, from an Ice-Cold Refreshment and a Highland Tea Pouch up to a Thai Akha Kitchen T-shirt and the digital Akha Heritage Book.",
                links: [
                    { label: "Complete Quiz Guide", type: "internal", page: "thai-cooking-tips-news", section: "how-to-play-akha-wisdom-path-quiz" }
                ],
                cta: { label: "Play the Quiz", page: "akha-wisdom-path-quiz", variant: "social", icon: "emoji_events" }
            },
            {
                question: "Can I collect physical quiz rewards without an active booking?",
                answer: "Physical rewards — such as the Ice-Cold Refreshment, Highland Tea Pouch, Explorer's Tote Bag, or Thai Akha Kitchen T-shirt — require an active cooking class booking for on-site collection at the school. Digital rewards (the Tea & Herbs Mini-Book, Master Ingredient Guide, and Akha Heritage Book) can be downloaded instantly from your Student Portal with no booking required.",
                links: [
                    { label: "Student Portal", type: "internal", page: "auth" },
                    { label: "Reward Terms & Rules", type: "internal", page: "terms-and-conditions" }
                ],
                cta: { label: "Book a Class to Claim", page: "booking", variant: "social", icon: "emoji_events" }
            },
            {
                question: "How does the Cherry hint system work during a quiz?",
                answer: "Cherry, our AI cultural guide, offers a contextual hint for each question for just 50 XP per click. She nudges you in the right direction without spoiling the answer. Use her wisely — spending too many XP on hints will slow your progress toward the next reward threshold!",
                links: [
                    { label: "Complete Quiz Guide", type: "internal", page: "thai-cooking-tips-news", section: "how-to-play-akha-wisdom-path-quiz" },
                    { label: "Quiz Rules", type: "internal", page: "terms-and-conditions" }
                ]
            },
            {
                question: "How many XP do I need to unlock each reward tier?",
                answer: "Each of the seven rewards unlocks at a specific XP threshold — from the Ice-Cold Refreshment at 100 XP, through the Highland Tea Pouch, Explorer's Tote Bag, and Thai Akha Kitchen T-shirt, all the way up to the Akha Heritage Book at 5,000 XP. The full table with exact XP thresholds is in our Complete Quiz Guide.",
                links: [
                    { label: "Full Reward Table & XP Guide", type: "internal", page: "thai-cooking-tips-news", section: "how-to-play-akha-wisdom-path-quiz" }
                ]
            },
            {
                question: "Do I need an account to play and save my quiz progress?",
                answer: "No account is required to play. Guest XP is stored locally in your browser. However, we strongly recommend creating a free Student Portal account — it permanently saves your XP, unlocked rewards, and Guardian Badge progress across all your devices.",
                links: [
                    { label: "Create a Free Account", type: "internal", page: "auth" }
                ]
            }
        ]
    }
];

export default FAQ_DATA;
