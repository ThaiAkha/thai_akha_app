/**
 * ─── UI STRINGS ────────────────────────────────────────────────────────────────
 *
 * Single source of truth for all hardcoded UI text in the front app.
 *
 * Usage:
 *   import { t } from '@thaiakha/shared/lib/ui-strings';
 *   t.common.back          → "Back"
 *   t.booking.step1.title  → "Choose Your Cooking Day"
 *
 * Dynamic strings (with interpolation):
 *   t.common.welcomeBack({ name: 'Svevo' }) → "Welcome back, Svevo"
 *
 * Future i18n: structure mirrors an EN locale object — easy to migrate to
 * i18next by exporting as `locales/en.json` and wrapping with `useTranslation()`.
 */

// ─── Helper type ───────────────────────────────────────────────────────────────

export type Fn<P extends Record<string, unknown>> = (params: P) => string;

// ─── Costanti condivise — single-source per label ripetute in più namespace ────
const ASK_CHERRY = 'Ask Cherry';
const SAWASDEE = 'Sawasdee kha';

// ─── Strings ───────────────────────────────────────────────────────────────────

const strings = {

  // ── COMMON — shared across the entire app ───────────────────────────────────
  common: {
    // Actions
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    edit: 'Edit',
    close: 'Close',
    closePhoto: 'Close Photo',
    closeVideo: 'Close Video',
    closeReward: 'Close Reward',
    retry: 'Try Again',
    modify: 'Modify',
    update: 'Update',
    done: 'Done',
    select: 'Select',
    search: 'Search...',
    share: 'Condividi',
    copyLink: 'Copia link',
    copied: 'Copiato!',
    copiedLink: 'Link copied to clipboard!',

    // States
    loading: 'Loading...',
    saving: 'Saving...',
    na: 'N/A',
    full: 'Full',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    active: 'Active',
    past: 'Past',
    today: 'TODAY',

    // Pagination / chapters
    allChapters: 'All Chapters',
    backToAllChapters: 'Back to All Chapters',
    otherChapters: 'Other Chapters',
    goBack: 'Go back',
    previous: 'Precedente',
    next: 'Successivo',

    // Dynamic
    welcomeBack: ({ name }: { name: string }) => `Welcome back, ${name}`,
    monthsShort: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  },

  // ── ERRORS — global error states ───────────────────────────────────────────
  errors: {
    network: 'Please check your connection and try again.',
    server: 'Something went wrong. Please try again.',
    notFound: 'Resource not found.',
    unauthorized: 'You need to sign in to access this page.',
    generic: 'An unexpected error occurred.',
    couldNotLoad: (resource: string) => `Could not load ${resource}`,
    connectionError: 'Could not load culture sections',
    tryDifferentTab: 'Try a different tab or check back soon.',
  },

  // ── COMPONENTS — generic reusable UI components ──────────────────────────────
  components: {
    audioPlayer: {
      fallbackTitle: 'Akha Kitchen Wisdom',
      fallbackDesc: 'Traditional voice story from the mountains.',
      playAudio: 'Play audio',
      pauseAudio: 'Pause audio',
      playStory: 'Play mystery story',
      pauseStory: 'Pause mystery story',
      restartTitle: 'Restart',
      restartAria: 'Restart from beginning',
      readTranscript: 'Read Transcript',
      hideTranscript: 'Hide Transcript',
    },
    map: {
      locationTitle: 'Location Map',
      enableInteraction: 'Click to Enable Map Interaction',
      lockScroll: 'Lock Map Scroll',
    },
    gallery: {
      viewGallery: 'View Gallery',
      closeGallery: 'Close Gallery',
      chip: 'Gallery',
      openCategoryGallery: ({ name }: { name: string }) => `Open ${name} photo gallery`,
    },
    cherryChat: {
      title: 'Cherry Chef',
      statusError: 'Error — try again',
      statusTyping: 'Typing...',
      statusIdle: 'Ask me anything kha',
      askCherry: ASK_CHERRY,
      greeting: SAWASDEE,
      voiceActive: 'Voice session active',
      promptFallback: 'Ask Cherry, your Thai Akha culinary guide.',
    },
    legalMeta: {
      version: 'Version',
      effective: 'Effective:',
      lastUpdated: 'Last updated:',
    },
    sidebarInfo: {
      menuTitle: 'Information',
    },
    media: {
      photoFallback: 'Photo',
      videoThumbnail: 'Video Thumbnail',
    },
    essentials: {
      keyFacts: 'Key Facts',
      references: 'References',
      aboutAi: 'About AI',
      published: 'Published',
      updated: 'Updated',
    },
  },

  // ── NAV — sidebar, header, menu items ──────────────────────────────────────
  nav: {
    toggleSidebar: 'Toggle Sidebar',
    closeMenu: 'Close Menu',
    userProfile: 'User Profile',
    profile: 'Profile',
    languages: 'Languages',
    login: 'Log In',
    signOut: 'Sign Out',
    studentHub: 'Student Hub',
    // Brand
    brandThai: 'Thai',
    brandAkha: 'Akha',
    cookingSchool: 'COOKING SCHOOL',
    // Theme
    dark: 'Dark',
    light: 'Light',
  },

  // ── AUTH — login / signup forms ─────────────────────────────────────────────
  // Note: hero copy (badge, title, subtitle, features) comes from site_metadata DB row slug='auth'
  auth: {
    // Forms
    emailLabel: 'Email',
    passwordLabel: 'Password',
    fullNameLabel: 'Full Name',
    phoneLabel: 'Phone Number',
    createPasswordLabel: 'Create Password',
    passwordPlaceholder: 'Min 6 chars',
    prefixLabel: 'Prefix',
    whatsappLabel: 'WhatsApp',
    ageLabel: 'Age',
    genderLabel: 'Gender',
    genderSelect: 'Select',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    nationalityLabel: 'Nationality',
    termsLabel: 'Terms of Service',
    privacyLabel: 'Privacy Policy',
    termsRequired: 'Required to complete your booking.',
    // Auth modes
    existingUser: 'Existing User',
    existingUserDesc: 'Login with your account.',
    newUser: 'New User',
    newUserDesc: 'Create an account & book.',
    memberLogin: 'Member Login',
    memberLoginDesc: 'Access your profile & benefits.',
    createAccountDesc: 'Create your account to complete the booking.',
    switchToNew: 'New User instead',
    switchToLogin: 'Login instead',
    afterRegistration: 'After Registration',
    afterRegistrationDesc: 'Once registered, you\'ll be able to set your pickup location, choose your preferred menu, and access exclusive member benefits — all from your personal dashboard.',
    nextExperience: 'Next Experience',
    loginSignup: 'Login/SignUp',
    goToStep: ({ n }: { n: number }) => `Go to step ${n}`,
    // Errors
    authFailed: 'Authentication failed.',

    // Featured / Onboarding Content
    onboarding: {
      chef: {
        heroImage: '/avatarCherry/600-Avatar-AuthPage.webp',
        titleMain: 'Chef',
        titleHighlight: 'Portal',
        description: "Let's build your perfect menu. Cook 11 authentic dishes tailored exactly to your dietary needs and spice tolerance kha.",
        cards: [
          {
            title: 'Master 11 Dishes',
            description: 'Craft eleven authentic recipes at your personal cooking station and receive your free CookBook.',
            icon: 'UtensilsCrossed',
            color: 'action'
          },
          {
            title: '100% Tailored to You',
            description: 'We happily customize every dish for your vegan or allergy needs, to your preferred spice level.',
            icon: 'ShieldCheck',
            color: 'secondary'
          }
        ]
      },
      story: {
        heroImage: '/avatarCherry/600-Avatar-Storyteller.webp',
        titleMain: 'Akha',
        titleHighlight: 'Wisdom',
        description: 'Discover our highland heritage. Test your knowledge, unlock badges, and earn real rewards at the school kha.',
        cards: [
          {
            title: 'The Akha Wisdom',
            description: 'Discover our ancestral Akha Zang heritage by exploring the beautiful Spirit Gates.',
            icon: 'Sparkles',
            color: 'secondary'
          },
          {
            title: 'Become a Guardian',
            description: 'Successfully complete our interactive cultural challenges to win real rewards.',
            icon: 'Trophy',
            color: 'action'
          }
        ]
      }
    }
  },

  // ── BOOKING — steps 01-04, checkout, pax picker ─────────────────────────────
  booking: {
    // Step 01 — Date
    monthView: 'Month View',
    chooseDate: 'Choose a Date...',
    seatsFull: 'Full',
    seatsLeft: 'Seats',

    // Step 02 — Class
    step2Number: '02',
    step2Section: 'Class Selection',
    morningSession: 'Morning Session',
    eveningSession: 'Evening Session',
    cookingClass: 'Cooking Class',
    bahtPerPerson: 'Baht / person',
    classFull: 'FULL',
    fullyBooked: 'Fully Booked',
    closed: 'Closed',
    classUnavailable: ({ status }: { status: string }) => `Sorry, this class is ${status}.`,
    availabilityChanged: ({ count }: { count: number }) => `Sorry, availability changed. Only ${count} seats left.`,
    toBeSelected: 'To be selected',
    bookingError: 'Booking Error: ',

    // Step 03 — Pax
    step3Number: '03',
    step3Section: 'Group Size',
    step3Title: 'Travel Companions',
    step3Subtitle: 'Let us know how many people are joining the family today.',
    cooks: 'Cooks',
    visitors: 'Visitors',
    visitorsOptional: '+ Optional',
    visitorsHint: 'Visitors do not cook. Max 1 per cook, up to 2 per booking.',
    noVisitorSpots: 'No visitor spots left for this class.',

    // Step 04 — Checkout
    step4Number: '04',
    step4Section: 'Review & Confirm',
    step4Title: 'Review Your Journey',
    step4Subtitle: 'Double-check your details before we heat up the wok.',
    totalDue: 'Total Due',
    thb: 'THB',
    payOnArrival: 'Pay on Arrival',
    payOnArrivalSub: 'Cash or QR Code',
    creditCard: 'Credit Card',
    creditCardSub: 'Stripe Secure',
    payNowDemo: 'Pay Now (Demo)',
    confirmPayLater: 'Confirm & Pay Later',

    // Summary pills
    pillDate: 'Date',
    pillDateEmpty: 'Select',
    pillClass: 'Class',
    pillGroup: 'Group',
    cook: 'Cook',
    cookPlural: 'Cooks',

    // Errors
    errorAvailability: ({ remaining }: { remaining: number }) =>
      `Sorry, availability changed. Only ${remaining} seats left.`,
    errorStatus: ({ status }: { status: string }) =>
      `Sorry, this class is ${status}.`,
    errorBooking: 'Booking Error: ',
  },

  // ── HISTORY — culture sections index page ───────────────────────────────────
  history: {
    // Tabs
    tabAll: 'All',
    // Error / empty states
    loadError: 'Could not load culture sections',
    loadErrorHint: 'Please check your connection and try again.',
    emptyTitle: 'No sections in this category',
    emptyHint: 'Try a different tab or check back soon.',
    chapterLoadError: 'Could not load this chapter',
    // Fallback header (when no featured section)
    fallbackTitle: 'Akha Heritage & Culture',
    fallbackSubtitle: 'Discover the journey and living culture of the Akha people',
    // Gallery
    galleryLabel: ({ count }: { count: number }) => `Gallery · ${count} photos`,
    openGallery: 'Open Full Gallery',
    // Featured badge
    featuredBadge: 'Featured',
    // Chapter notation
    chapter: ({ num }: { num: string }) => `CH. ${num}`,
    // Navigation
    back: 'All Chapters',
    explore: 'Explore',
    listen: 'Listen',
    pause: 'Pause',
    otherChapters: 'Other Chapters',
    backToHistory: 'Back to History',
    moreHeritage: 'More Akha Heritage',
  },

  // ── FAQ — faq sections ──────────────────────────────────────────────────────
  faq: {
    title: 'Questions & Answers',
    viewAll: 'All Questions',
    askCherry: ASK_CHERRY,
    // ── Search & filters (FAQ hub page) ──
    searchLabel: 'Find an answer',
    searchPlaceholder: 'Search the questions...',
    searchClear: 'Clear search',
    filterAll: 'All topics',
    filterReset: 'Reset filters',
    resultsCount: ({ shown, total }: { shown: number; total: number }) =>
      `${shown} of ${total} questions`,
    noResultsTitle: 'No question matches your search',
    noResultsBody: 'Try another word or clear the filters. Cherry is right above if you would rather just ask.',
  },

  // ── CLASSES — cooking class info page ───────────────────────────────────────
  classes: {
    // Hero stat badges
    perPerson: 'per person',
    classTime: 'Class Time',
    hotelPickup: 'Hotel Pickup',
    pickupIncluded: 'Included*',
    // Tabs
    tabOverview: 'Overview',
    tabMorning: 'Morning',
    tabMorningFull: 'Morning Class',
    tabEvening: 'Evening',
    tabEveningFull: 'Evening Class',
    // Hero copy (overview)
    overviewGreeting: 'Sawasdee kha!',
    overviewTitle: 'Welcome to',
    overviewTitleHighlight: 'Our Kitchen',
    overviewBody: 'We are not just a cooking school; we are a family sharing our heritage. Master 11 dishes and leave with a full heart.',
    statDishes: '11 Dishes',
    statDishesLabel: 'You Will Learn',
    statPickup: 'Pick-Up',
    statPickupLabel: 'Included*',
    // CTA
    bookYourClass: 'Book Your Class',
    bookMorning: 'Book Morning Class',
    bookEvening: 'Book Evening Class',
    kitchenSpirit: 'The Kitchen Spirit',
    fullMenu: 'Full Menu',
    fullMenuDesc: 'Browse our 11 traditional dishes.',
    location: 'Location',
    locationDesc: 'Pickup details and directions.',
    askCherry: ASK_CHERRY,
    viewAllNews: 'View All News',
    // About
    aboutLabel: 'About this class',
    // Duration / start time labels
    durationLabel: 'Duration',
    startTimeLabel: 'Start Time',
    priceLabel: 'Price / Person',
    // Gallery / video
    kitchenSpiritVideo: 'The Kitchen Spirit',
    morningCooking: 'morning',
    eveningCooking: 'evening',
    cookingClass: 'Cooking Class',
  },

  // ── NEWS — news index and single page ───────────────────────────────────────
  news: {
    backToNews: 'Back to News',
    moreNews: 'Other News',
    tabAll: 'All News',
    sortById: 'By ID',
    sortByLatest: 'Latest',
    sortByOldest: 'Oldest',
  },

  // ── RECIPES — recipes page ──────────────────────────────────────────────────
  recipes: {
    // Default profile (no selection)
    defaultDietName: 'Your Diet Style',
    defaultDietDesc: 'Choose your preference to personalize recipes.',
    regularDietName: 'Regular Diet',
    regularDietDesc: 'Standard authentic preparation.',
    // Prompt when no diet selected
    selectPrompt: 'Select your dietary style\nbefore viewing the content',
    // Diet label on cards
    originalLabel: 'ORIGINAL',
    viewRecipe: 'View Recipe',
    // Alert messages
    allergyAlertTitle: 'Allergy Alert',
    allergyAlertBody: 'The recipes below have been filtered or modified to exclude your selected allergens. Always inform your chef about severe allergies.',
    dietAdapted: ({ name }: { name: string }) =>
      `This menu has been adapted to follow ${name} guidelines.`,
    // MegaMenu
    selectDietLabel: 'Select your Diet',
    personalize: 'Personalize',
    activeProfile: 'Active Profile',
    askCherryDish: (p: { name: string; diet: string; allergies: string }) => `Tell me about ${p.name} for a ${p.diet} diet considering my allergies: ${p.allergies} kha`,
    // Header description after diet selection — replaces static DB text
    headerDescReady: ({ diet, allergies }: { diet: string; allergies: string[] }) => {
      const allergyNote = allergies.length > 0 ? ` Allergen-free: ${allergies.join(', ')}.` : '';
      return `${diet} menu ready.${allergyNote}`;
    },
  },

  // ── RECIPE SINGLE — detailed recipe view ────────────────────────────────────
  recipeSingle: {
    heritageExplorer: 'HERITAGE EXPLORER',
    signature: 'Signature',
    enlarge: 'Enlarge',
    containsAllergen: ({ allergen }: { allergen: string }) => `Contains ${allergen}`,
    askCherry: ASK_CHERRY,
    askCherrySubtitle: 'your AI assistant',
    curiousAboutDetails: 'Curious about the details?',
    viewDetails: 'View Details',
    secretChef: "Ingredient details are kept as our Chef's secret.",
    closeDetails: 'Close Details',
    backToRecipes: 'Back to Recipes',
    notFound: 'Recipe Not Found',
    dishAdded: 'Dish added to your collection',
    reserveMenu: 'Reserve for your Menu',
    detailN: ({ n }: { n: number }) => `Detail ${n}`,
    signatureDish: 'Signature Dish',
    historyOf: ({ name, diet }: { name: string; diet: string }) => `Tell me about the history of ${name} for my ${diet} diet kha`,
    defaultWarning: 'We will modify the preparation for your safety.',
    // Cookbook detail fields
    garnish: 'Garnish',
    cooksTip: "Cook's Tip",
    loginForRecipe: 'Full Recipe for Members',
    loginForRecipeDesc: "Sign in to access step-by-step directions, garnish notes, and cook's tips.",
    categories: {
      appetizer: 'Appetizers',
      dessert: 'Desserts',
      akha_specialty: 'Akha Traditional',
      curry: 'Curry',
      soup: 'Soup',
      stirfry: 'Stir-Fry'
    }
  },

  // ── QUIZ — quiz game ────────────────────────────────────────────────────────
  quiz: {
    title: 'The Wisdom Path',
    missionSelect: 'Mission Select',
    modules: 'Modules',
    currentMission: 'Current Mission',
    levelPrefix: 'LEVEL',
    // Sidebar cards
    heritageWalletTitle: 'Heritage Wallet',
    heritageWalletDesc: 'Collect artifacts & real rewards.',
    cherryRulesTitle: "Cherry's Rules",
    hintLabel: 'Need a Hint?',
    hintCost: '-50 XP',
    wrongAnswer: 'Wrong Answer',
    zeroXp: '0 XP',
    perfectModule: 'Perfect Module',
    bonus: '+Bonus',
    askCherry: ASK_CHERRY,
    // Chat topics
    scoringTopic: 'How does the quiz scoring work kha?',
    // Error
    notEnoughXp: 'Not enough XP! You need 50 XP to ask for a hint.',
    // New strings for QuizPage
    spiritQuizTitle: 'Spirit Quiz',
    choosePath: 'Choose Your Path',
    noCategories: 'No categories available.',
    backToCategories: 'Back to Categories',
    noLevels: 'No levels found for this category.',

    // ── MIGRATED FROM QUIZ_FEATURED ──
    headerBadge: "Mission: Heritage",
    headerTitle: "Spirit Quiz",
    headerDesc: "Master the Akha traditions to unlock exclusive rewards and honor. Every answer brings you closer to our ancestors' wisdom.",
    statsProgress: "Spirit Progress",
    globalProgress: "Global Progress",
    progress: "Progress",
    statsScore: "Wisdom Points",

    backHome: "Back to Home",
    backLevels: "Back to Levels",
    abort: "Abort Mission",
    report: "Report issue",
    requestHint: "Request Hint (-50 XP)",
    // T8 — reveal explanation (giusto/sbagliato) + Learn more + retry
    learnMore: "Learn more",
    retryWithCherry: "Ask Cherry & Retry (-100 XP)",
    notEnoughXpRetry: "Not enough XP! You need 100 XP to retry with Cherry.",
    keepGoingLabel: "Keep going",

    mastered: "Mastered",
    inProgress: "In Progress",
    score: "Score",
    accuracy: "Accuracy",
    xpEarned: "XP Earned",
    completion: "Completion",

    startQuiz: "Take the Quiz",
    resume: "Resume",
    retake: "Retake",
    nextModule: "Next Module",
    retry: "Try Again",
    backToMenu: "Back to Menu",
    viewWallet: "View Wallet",

    collectionTitle: "Spirit Rewards",
    collectionDesc: "Unlock heritage gifts by mastering the quiz.",
    missionComplete: "Mission Complete!",
    missionFailed: "Mission Failed",
    questionOf: ({ current, total }: { current: number; total: number }) => `Question ${current} of ${total}`,
    correctLabel: "Correct",
    // ── Explanation reveal (post-answer) ──
    explanationLabel: "Explanation",
    explanationOn: "On",
    explanationOff: "Off",
    yourAnswer: "Your answer",
    next: "Next",
    // ── photo_multi (recipe quiz: select set) ──
    confirm: "Confirm",
    selectPrompt: "Tap the ingredients",
    notQuite: "Not quite",
    // ── photo_order (sequence) ──
    orderPrompt: "Tap in order",
    unlockedLabel: "Unlocked",
    playAgain: "Play Again",
    completed: "COMPLETED",

    noSubtitle: "Master these modules to unlock the next stage.",
    noTheme: "Knowledge",
    collecting: "Collecting spiritual artifacts...",
    // Quiz page stat cards → DB (page_sections 'quiz-01'.cards)
  },

  // ── USER — dashboard, settings, onboarding ──────────────────────────────────
  user: {
    // Dashboard tabs
    tabOverview: 'Overview',
    tabReservation: 'My Reservation',
    tabMenu: 'My Menu',
    tabQuiz: 'Akha Quiz',
    tabPassport: 'Passport',
    loginCta: 'Sign In',

    // Overview / onboarding
    welcomeChef: 'Welcome Chef',
    welcomeBack: 'Welcome back,',
    chefFallback: 'Chef',
    classOnLabel: 'Your class is on',
    journeyPrompt: 'Ready to start your culinary journey?',
    gettingReady: 'Getting Ready',
    chooseMenuLabel: 'Choose your Menu',
    dishesSelected: 'Dishes selected — bon appétit!',
    selectDishes: 'Select your dishes before the class',
    chooseMenu: 'Choose Menu',
    inviteCompanions: 'Invite Companions',
    soloBooking: 'Solo booking — no companions needed',
    companionsRegistered: ({ count, slots }: { count: number; slots: number }) =>
      `${count} of ${slots} companion(s) registered`,
    startJourneyTitle: 'Start Your Journey',
    startJourneyBody: 'Book a cooking class and unlock your personal dashboard, menu, and digital passport.',
    bookClass: 'Book a Class',

    // Booking status
    noActiveBooking: 'No Active Booking',
    noActiveBookingHint: 'Book a cooking class to manage your reservation here.',
    journeyCompleted: 'Journey Completed',

    // Driver / logistics
    driverStarted: 'Driver Started Route',
    waitingLabel: 'Waiting',
    pickedUp: 'Picked Up',
    driverHere: 'Driver Here!',
    enRoute: 'En Route',
    locationNotSet: 'Location not set',
    pickupNotSet: 'Pickup location not set — please add your hotel',
    journeyLog: 'Journey Log',
    liveLosistics: 'Live Logistics',
    finish: 'Finish',
    thaiAkhaKitchen: 'Thai Akha Kitchen',
    myMenu: 'My Menu',
    selectMenu: 'Select Menu',
    pickup: 'Pickup',
    addPickup: 'Add Pickup',
    certificate: 'Certificate',
    transport: 'Transport',
    checkModify: 'Check / Modify',
    setLocation: 'Set Location',

    // Class type labels
    morningClass: 'Morning Market Course',
    eveningClass: 'Evening Feast Course',
    morningMarket: 'Morning Market Tour',
    eveningSunset: 'Evening Sunset Feast',

    // Status badges
    statusConfirmed: 'CONFIRMED',
    statusActionRequired: 'ACTION REQUIRED',
    statusCompleted: 'COMPLETED',

    // Settings / passport
    passportTitle: 'Digital Passport',
    nameFallback: 'Your Name',
    idPrefix: 'ID:',
    displayNameLabel: 'Display Name',
    fullNameLabel: 'Full Name',
    safetyTitle: 'Safety & Allergies',
    protocolLabel: 'Protocol',
    spiceLabel: 'Spice Tolerance',
    selectedLabel: 'Selected',
    dietaryStyleLabel: 'Dietary Style',
    lifestyleLabel: 'Lifestyle',
    strictLabel: 'Strict Compliance',
    kitchenPromise: 'Our Kitchen Promise',
    reviewBeforeSave: 'Review your details before saving.',
    confirmPassport: 'Confirm Passport',
    certificateTitle: 'Your Certificate',
    certificateDesc: 'Once your class is complete and your menu is set, download your personalised Thai Akha certificate of participation.',
    downloadCertificate: 'Download Certificate',

    // Access denied (staff page in admin)
    accessDeniedTitle: 'Operations Dashboard',
    accessDeniedBody: 'Booking and reservation management is available in the Admin App.',
    manageInAdmin: 'Manage in Admin App',

    // User Menu
    select3Dishes: 'Please select 3 dishes to complete your menu kha!',
    selectionSaving: 'Saving...',
    confirmMenu: 'Confirm Menu',
    saveFailed: 'Save failed',
    selectionLabel: 'Selection',
    optionsLabel: 'Options',
  },

  // ── LOCATION — pickup / drop-off page ───────────────────────────────────────
  location: {
    pickupTitle: 'Pickup Location',
    editMode: 'Edit Mode',
    amLabel: 'AM',
    pmLabel: 'PM',
    needPickup: 'Need Pickup',
    fromHotel: 'From Hotel',
    goMyself: 'Go Myself',
    meetAtSchool: 'Meet at School',
    startLocation: 'Start Location (Pickup)',
    searchHotel: 'Search Hotel...',
    sameDropoff: 'Same Drop-off?',
    endLocation: 'End Location (Drop-off)',
    sameAsPickup: 'Same as Pickup',
    pinOnMap: 'Pin on Map',
    pinDropoff: 'Pin Drop-off',
    selectMeetingPoint: 'Select Meeting Point',
    updateBooking: 'Update Booking',
    confirmLocation: 'Confirm Location',
    // Validations
    enterPickupName: 'Please enter a name for your Pickup Location kha.',
    selectDropoff: "Please select a Drop-off location or enable 'Same as Pickup'.",
  },

  // ── MENU — dish selection page ───────────────────────────────────────────────
  menu: {
    selectPrompt: 'Please select 3 dishes to complete your menu kha!',
    saveFailed: 'Save failed',
    selectionSuffix: 'Selection',
    optionsSuffix: 'Options',
    confirmMenu: 'Confirm Menu',
    savingMenu: 'Saving...',
    categoryIds: {
      curry: 'curry',
      soup: 'soup',
      stirfry: 'stirfry',
    },
  },

  // ── CONTACT PAGE ────────────────────────────────────────────────────────────
  contact: {
    sectionGeneral: 'General Information',
    sectionMeetingPoints: 'Meeting Points',
    sectionPickup: 'Free Pickup Service',
    sectionSocial: 'Find Us Online',
    openInMaps: 'Open in Maps',
    arrivalTime: 'Arrival Time',
    morningLabel: 'Morning',
    eveningLabel: 'Evening',
    labelEmail: 'Email',
    labelPhone: 'Phone',
    labelHours: 'Opening Hours',
    labelAddress: 'Address',
    directContacts: 'Direct Contacts',
    // Business & Billing (da business_profile)
    sectionBilling: 'Business & Billing',
    labelLegalName: 'Legal name',
    labelTaxId: 'Tax ID',
    // Canali (contact_channels)
    channels: {
      whatsapp: 'WhatsApp',
      line: 'LINE Official',
      instagram: 'Instagram',
      messenger: 'Messenger',
      facebook: 'Facebook',
      youtube: 'YouTube',
      pinterest: 'Pinterest',
      x: 'X',
      tripadvisor: 'Tripadvisor',
      maps: 'Google Maps',
      whatsappHint: 'Reply within minutes',
      lineHint: 'Popular in Thailand',
    },
    // Form (contact_messages)
    form: {
      writingAs: "I'm writing as",
      topicTraveller: 'Traveller',
      topicAgency: 'Agency / B2B',
      topicPress: 'Press / Blogger',
      topicOther: 'Other',
      nameLabel: 'Your name',
      namePlaceholder: 'Your full name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@email.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Hello! We are 4 people and two of us are vegan…',
      send: 'Send Message',
      sending: 'Sending…',
      success: 'Message sent! We usually reply within a day kha.',
      error: 'Something went wrong — please try again or write us on WhatsApp.',
      required: 'Please fill in name, email and a message (min 10 characters).',
    },
  },

  // ── ABOUT PAGE ──────────────────────────────────────────────────────────────
  about: {
    // Header/gruppi → DB (page_sections about-role-* + authors.staff_group)
    aiDigitalGuide: 'AI Digital Guide',
  },

  // ── HOME PAGE ────────────────────────────────────────────────────────────────
  home: {
    // Cherry section features → DB (page_sections 'home_01'.cards)
    // Culture section CTA
    readChapter: 'Read this Chapter',
    discoverHeritage: 'Discover the Heritage',
  },

  // ── SEO — page meta fallbacks (DB site_metadata is the primary source) ───────
  seo: {
    ogDefault: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg',
    home: {
      title: 'Thai Akha Kitchen — Authentic Cooking Class in Chiang Mai',
      description: 'Cook 11 authentic Akha highland dishes at your personal station. Tailored to dietary needs, from hotel pick-up to full-color cookbook.',
      canonical: 'https://www.thaiakha.com/',
    },
    cookingClass: {
      title: 'Cooking Classes | Thai Akha Kitchen',
      description: 'Learn authentic Akha highland cooking in Chiang Mai. Morning and evening classes available with hotel pickup included.',
      canonical: 'https://www.thaiakha.com/thai-cooking-classes-chiang-mai',
    },
    morning: {
      title: 'Morning Cooking Class & Market Tour | Thai Akha Kitchen',
      description: '6-hour morning cooking class in Chiang Mai (1,400 THB). 1-hour market tour with bamboo baskets, then cook 11 dishes at your own wok. Vegan/allergy safe.',
      canonical: 'https://www.thaiakha.com/morning-cooking-class-market-tour',
    },
    evening: {
      title: 'Evening Cooking Class in Chiang Mai | Thai Akha Kitchen',
      description: 'Relaxed 5-hour evening cooking class in Chiang Mai (1,300 THB). 5:00–9:00 PM. Cook and eat 11 dishes for dinner at your own wok. Free hotel pickup.',
      canonical: 'https://www.thaiakha.com/evening-cooking-class-dinner',
    },
  },

  // ── ALT — image/video alt-text fallbacks ────────────────────────────────────
  alt: {
    homeHero: 'Thai Akha Kitchen cooking class – Chiang Mai, Thailand',
    cherry: 'Cherry Assistant',
    classVideo: 'Akha Cooking & Culture Class in Chiang Mai',
  },

  // ── CHERRY — AI Assistant ────────────────────────────────────────────────────
  cherry: {
    spicinessMap: {
      '1': 'The Farang (Soft)',
      '2': 'Thai Smile (Mild)',
      '3': 'Respect! (Medium)',
      '4': 'Thai Spicy (Local)',
      '5': 'Akha Warrior (Extreme)',
    } as Record<string, string>,
    dietaryMap: {
      diet_regular: 'Regular',
      diet_vegan: 'Vegan',
      diet_vegetarian: 'Vegetarian',
      diet_pescatarian: 'Pescatarian',
      diet_meat_lover: 'Meat Lover',
      diet_halal: 'Halal Friendly',
      diet_kosher: 'Kosher Friendly',
      diet_rastafari: 'Rastafari (Ital)',
      diet_jain: 'Jain Friendly',
      diet_hindu: 'Hindu Friendly',
    } as Record<string, string>,
    summaryThreshold: 20,
    typewriterIntervalMs: 80, // cadenza unica per AI streaming e nodi/bottoni
  },

  // ── BLOG — blog card & single post components ──────────────────────────────
  blog: {
    byAuthor: 'By',
    linkCopied: 'Link Copied!',
    cultureHistory: 'Culture & History',
    explore: 'Explore',
    contents: 'Contents',
    previous: 'PREVIOUS',
    next: 'NEXT',
  },

} as const;

// ─── Export ────────────────────────────────────────────────────────────────────

/**
 * Primary accessor for all UI strings.
 *
 * @example
 *   import { t } from '@thaiakha/shared/lib/ui-strings';
 *   <Button>{t.common.back}</Button>
 *   <Typography>{t.booking.step1Title}</Typography>
 *   <span>{t.common.welcomeBack({ name: user.firstName })}</span>
 */
export const t = strings;

export type UIStrings = typeof strings;

export default strings;
