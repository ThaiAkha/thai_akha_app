
/**
 * 🍵 THAI AKHA KITCHEN - CLASS DATA
 * Version: 2.2
 * Optimized for InfoClasses.tsx and AI Synchronization.
 */

export interface ScheduleItem {
  label: string;
  time: string;
  description?: string;
}

export interface CookingClass {
  id: string;
  type: 'morning' | 'evening';
  title: string;
  badge: string; 
  tags: string[]; 
  price: number;
  currency: string;
  unit: string; // Added for UI
  colorTheme: string; // Added for UI
  duration: string;
  tagline: string;
  maxParticipants: string;
  image: string; 
  description: string;
  whyChoose: string[];
  schedule: ScheduleItem[];
  inclusions: string[];
}

export const commonMetadata = {
  operationDays: "Every day",
  cancellation: "Free cancellation - 48hrs notice",
  languages: ["English"],
  location: "5-minute walk from Chiang Mai South Gate",
  inclusions: [
    "Pick-up from/to your place of stay",
    "Individual cooking station",
    "Full-color paper CookBook (40 pages)",
    "Ingredient gift set for every Student",
    "Complimentary samples of Akha Hill Tribe Coffee",
    "Fresh water, and different teas",
    "Free Wifi & charger plugs",
    "Un Coniglio Rosso"
  ],
  exclusions: ["Soft and Alcoholic drinks (available to purchase)"],
  currency: "THB"
};

export const classData: Record<string, CookingClass> = {
  morning: {
    id: "morning_class",
    type: "morning",
    title: "Morning Cooking Class",
    badge: "Most Popular",
    tags: ["Market Tour", "Full Experience", "Cultural Immersion"],
    price: 1400,
    currency: "THB",
    unit: "per person",
    colorTheme: "#E31F33", // Akha Primary Red
    duration: "6h duration",
    tagline: "Taste the unique Thai and Akha flavors during the day",
    maxParticipants: "Max 12 people (16 if private)",
    image: 'https://www.thaiakhakitchen.com/wp-content/uploads/2026/01/Akha01.jpg',
    description: "Discover the culture and cuisine of the Akha tribe. Includes a local market trip to taste and collect ingredients.",
    whyChoose: [
      "Local Market tour to see the real lifestyle",
      "Products fresh from our farm and local market",
      "Interesting experiences at traditional Thai markets"
    ],
    schedule: [
      { label: "Pick-up", time: "8:30 am > 9:00 am", description: "Efficient planning for smooth pick-up." },
      { label: "Market Tour", time: "9:00 am > 10:00 am", description: "Experience the real lifestyle of local people." },
      { label: "Class Time", time: "10:00 am > 2:30 pm", description: "Prepare 11 dishes with our Akha instructor." },
      { label: "Drop-off", time: "2:30 pm > 3:00 pm" }
    ],
    inclusions: ["1h Market Tour", ...commonMetadata.inclusions]
  },
  evening: {
    id: "evening_class",
    type: "evening",
    title: "Evening Cooking Class",
    badge: "Great for Dinner",
    tags: ["Time Saver", "Cooler Weather", "Sunset Vibes"],
    price: 1300,
    currency: "THB",
    unit: "per person",
    colorTheme: "#6E004A", // Akha Secondary Purple
    duration: "5h duration",
    tagline: "The perfect home-cooked Thai dinner experience",
    maxParticipants: "Max 12 people (16 if private)",
    image: 'https://www.thaiakhakitchen.com/wp-content/uploads/2026/01/Akha01.jpg',
    description: "Perfect for travelers with limited time who want to enjoy a delicious self-cooked Thai dinner.",
    whyChoose: [
      "Fits around a busy day schedule",
      "No need to plan dinner - just come and cook!",
      "Cooler temperature during the evening session"
    ],
    schedule: [
      { label: "Pick-up", time: "4:30 pm > 5:00 pm", description: "Driver with Thai Akha Kitchen sign." },
      { label: "Class Time", time: "5:00 pm > 9:00 pm", description: "Create 11 dishes and eat after each session." },
      { label: "Drop-off", time: "9:00 pm > 9:30 pm" }
    ],
    inclusions: [...commonMetadata.inclusions]
  }
};
