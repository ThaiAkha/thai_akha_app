
export interface BonusCard {
  levelId: number;
  prizeTitle: string;
  prizeDescription: string;
  image: string;
  icon: string;
  reward_mp3?: string;
}

/**
 * THAI AKHA KITCHEN - BONUS REWARDS DATABASE
 * These rewards are unlocked when a level is completed with 100% accuracy 
 * (3 modules cleared with maximum score).
 */
export const BONUS_CARDS: BonusCard[] = [
  {
    levelId: 1,
    prizeTitle: "Musical Heritage: Akha Lady in the Mountain",
    prizeDescription: "Download this traditional Akha song performed in our village. A special gift for completing your first mastery kha!",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCW2s6JPCzT9n0A46u9OKMqrc9Jz0I4clhgnybPZjCytfGUBxXl-skK5-49g5f6aB4QgcasR6WhQVU1reuh8hfBVnIsd9p_HB4zZorYDfevB4KqeIiOdTu8776vIwAKBrehD9DVCFLaf2OwqpqKX8ny3OWjfgGbtpSvukGdZAisD6mcdpDxDFsk9sPiPOl-Wh9f9lM8lGU-hJCyVZncYRwKA7YyNfxeyOsHMsHb9XwpkG6y1n2zllnNQ_xJNeBxFSbDTQ2JWlXMFxs_",
    icon: "music_note",
    reward_mp3: "/music/akha-lady-in-the-mountain.mp3"
  },
  {
    levelId: 2,
    prizeTitle: "Free Beers",
    prizeDescription: "Cool down after your session with two complimentary local craft beers or Chang during your dinner.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCXUp1iIth3AdjFNHIvSgMf6gz69nTNynAEekbPFuYHwqMw1jYjfsoJaz4RFIkVSRBQvJ1Ut-uug0uLSXamStp8fA2rTJzqp9iiSyyHa-PdcCe-qPlDxRQanL6G-2ZiW8C0YrlVtXjy0IA3tiq9Xak1dSmm8w3q_aYty78YJCkC0G1nM9kZMGjb1MumWFbZOOEhsmCsKasoWKjGYdTgk6NOi97yKovEaOtPwBZG4yp50qfwbGZVVsDaVH94F3XIFC_f3rgv9DzG8F4",
    icon: "sports_bar"
  },
  {
    levelId: 3,
    prizeTitle: "20% Discount Coupon",
    prizeDescription: "A special discount for you and a friend on any full-day morning cooking course this season.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXN06u8NA_huTdqoLdq1fmGpCGk5wnwN6yvVWAPLICxo02d5_yGFMOiBvx74YGAufxMhoB7sGiVhPlsIY6RjwhVdhPjFHXIbKugq51bhEaHNYDDDQOnYyqnCTDoR_E9-wuPhZQGWb8MB_RgVuRdPf3TvToBCn6UAEdviqjwLcfOKO-fcT__94NNUoGN7Y0oNfy9VZXMg5Ccp4Rzp6fCSSTFfmJmUKDLCp9tXQXJgpklvIPH_kdjo5cVwNmxJ6tAnnG9xGzOSZECTZY",
    icon: "confirmation_number"
  },
  {
    levelId: 4,
    prizeTitle: "Free T-shirt",
    prizeDescription: "Wear the spirit of the hills with our exclusive organic cotton Thai Akha Kitchen logo T-shirt.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDORWBjSuS_p5kebGiJ23-zbiYyLSgD9YZwzW7Y5bbCO_T0Nmd677fcP0ivlwEfP_hVClgwDu6DKobgRawPuHjXRFLn3VIIXyCXMnossJWNy8S3wPNCwlAYzMmwK1gkyr_0E8eTyXDg_--dnb5j9Y3RehfCfrK6BhJgo402xvOp5KqMRzs7tYwM7-DBtidgQY2hJ0ZyIu9Ct9cdmbb1lybeAE7YqLQ-xVlR8sB4bIQpV62feHIVLfulHHaUfMZYeaWcAgtXYiSJ3Yim",
    icon: "apparel"
  },
  {
    levelId: 5,
    prizeTitle: "Free Apron",
    prizeDescription: "Professional grade kitchen apron with Akha embroidery patterns. Yours to keep after the class.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCN2E8zsY-fvVt6ooVDEyzaZh7KDtbd4oPXYjJEm0Z7etNEu4beLhoQOHlwQ1tPJ5M0fHOicVI3NdfdyGVY9mv61kqxv-t3Bw_LtMY7WzZJ0lVew_41d6FpHx23bu8N2Fjfq5IxcYZFeMvf8zY7PnjMbaLTal6RlF6RyAmzVilYffrIvgNWs4RFxOv2vAPQH8AcaZxpP8LIoPDAcjalvNgqntipLOCBmReUx5pPaqtvJJBjSO3T7KgULaxr_6ZSZJAHLVjvKJldVgPc",
    icon: "skillet"
  },
  {
    levelId: 6,
    prizeTitle: "Free Coffee Bag",
    prizeDescription: "250g of our premium shade-grown Akha Arabica beans, roasted fresh in our village roastery.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAXA1_bXBXoL_je55_gGkgt40JtAtUmq7inaUKV597fUnBcZoOpQe5we92RXlbjqh0nnJ5xUf5c07TfX7HBqBVZsFjydSGlNJffqPFdb-1DSyQS5SbTY87rBPzY510vwoA5IzldLIUvQu4qD1eSM5jEsJ7MT-ftqtQo17_amQjqrQ3_txQxE_VemU4DpZbVna7W5dvtmRk9mKBuT5fnjqGTtCBuTOFEUJ3tkhuuaWc-eDtH54ECVeYEQy0aLlkqoLYw-s0oq3GEdL3",
    icon: "coffee"
  },
  {
    levelId: 7,
    prizeTitle: "Ambassador Cooking Kit",
    prizeDescription: "The ultimate prize: A hand-carved mortar and pestle, secret spice blend, and Master Certificate.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAECzi8_CFqxLpcwj6lupvTTG7RvyBjaAe8OjTTmpb0TYzFCXqtscy4zWznY12ReHeAHOVOxHYXnHI5yhzRhENxMuPytGJUhFrpS05obn_0nN3twxZHvKpnfYXPV6Tu1J9bt-f9IDjq288_z8e8Sf3c7fP8D_-4sDkXXBzdlQoWp_MXp9fJD6YHBDRkGlOC2oLYhhPxadC-0U57l4ajdR-pNJ1Cm-d2nlR51McGubbRc-8AsfHGT2Wf3ietWvft3Hfh7Pccu-WpHgzy",
    icon: "workspace_premium"
  }
];
