/**
 * ─── UI STRINGS ────────────────────────────────────────────────────────────────
 *
 * Single source of truth for all hardcoded UI text in the front app.
 *
 * Usage:
 *   import { t } from '../lib/ui-strings';
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
    retry: 'Try Again',
    modify: 'Modify',
    update: 'Update',
    done: 'Done',
    select: 'Select',
    search: 'Search...',
    share: 'Condividi',
    copyLink: 'Copia link',
    copied: 'Copiato!',

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
    otherChapters: 'ALTRI CAPITOLI',
    previous: 'Precedente',
    next: 'Successivo',

    // Dynamic
    welcomeBack: ({ name }: { name: string }) => `Welcome back, ${name}`,
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
  auth: {
    // Hero copy (AuthPage)
    badge: 'Welcome to System 4.8',
    headingPart1: 'Your',
    headingHighlight: 'Culinary Journey',
    headingPart2: 'Begins',
    tagline: 'Step into the heritage of the Akha tribe. From the high misty mountains to our bustling kitchen in Chiang Mai.',
    // Feature bullets
    featureCherryTitle: 'Meet Cherry',
    featureCherryDesc: 'Your AI Cultural Guide ready 24/7.',
    featureMenuTitle: 'Master the Menu',
    featureMenuDesc: 'Tailor ingredients (Vegan, Halal, Meaty).',
    featureWisdomTitle: 'Akha Wisdom',
    featureWisdomDesc: 'Test knowledge & become a guardian.',
    featureRewardsTitle: 'Earn Rewards',
    featureRewardsDesc: 'Unlock certificates & secret recipes.',
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
    // Errors
    authFailed: 'Authentication failed.',
  },

  // ── BOOKING — steps 01-04, checkout, pax picker ─────────────────────────────
  booking: {
    // Step 01 — Date
    step1Number: '01',
    step1Section: 'Date Selection',
    step1Title: 'Choose Your Cooking Day',
    step1Subtitle: 'Select a date to see available seats for our sessions.',
    monthView: 'Month View',
    chooseDate: 'Choose a Date...',
    seatsFull: 'Full',
    seatsLeft: 'Seats',

    // Step 02 — Class
    step2Number: '02',
    step2Section: 'Class Selection',
    step2Title: 'Pick Your Session',
    step2Subtitle: 'Choose between our Morning or Evening Class.',
    cookingClass: 'Cooking Class',
    bahtPerPerson: 'Baht / person',
    classFull: 'FULL',

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
    explore: 'EXPLORE',
    listen: 'Listen',
    pause: 'Pause',
  },

  // ── CLASSES — cooking class info page ───────────────────────────────────────
  classes: {
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
    askCherry: 'Ask Cherry',
    // About
    aboutLabel: 'About this class',
    // Duration / start time labels
    durationLabel: 'Duration',
    startTimeLabel: 'Start Time',
    priceLabel: 'Price / Person',
    // Gallery / video
    kitchenSpiritVideo: 'The Kitchen Spirit',
    // Sections
    morningCooking: 'morning',
    eveningCooking: 'evening',
    cookingClass: 'Cooking Class',
  },

  // ── RECIPES — recipes page ──────────────────────────────────────────────────
  recipes: {
    // Default profile (no selection)
    defaultDietName: 'Your Diet Style',
    defaultDietDesc: 'Choose your preference to personalize recipes.',
    regularDietName: 'Regular Diet',
    regularDietDesc: 'Standard authentic preparation.',
    // Prompt when no diet selected
    selectPrompt: 'Select your diet style before\nviewing the content',
    // Diet label on cards
    originalLabel: 'ORIGINAL',
    viewRecipe: 'View Recipe',
    // Alert messages
    allergyAlertTitle: 'Allergy Alert',
    allergyAlertBody: 'The recipes below have been filtered or modified to exclude your selected allergens. Always inform your chef about severe allergies.',
    dietAdapted: ({ name }: { name: string }) =>
      `This menu has been adapted to follow ${name} guidelines.`,
    // MegaMenu
    personalize: 'Personalize',
    activeProfile: 'Active Profile',
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
    askCherry: 'Ask Cherry',
    // Chat topics
    scoringTopic: 'How does the quiz scoring work kha?',
    // Error
    notEnoughXp: 'Not enough XP! You need 50 XP to ask for a hint.',
  },

  // ── USER — dashboard, settings, onboarding ──────────────────────────────────
  user: {
    // Dashboard tabs
    tabOverview: 'Overview',
    tabReservation: 'My Reservation',
    tabMenu: 'My Menu',
    tabQuiz: 'Akha Quiz',
    tabPassport: 'Passport',

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
    spiceMild: 'Mild',
    spiceMedium: 'Medium',
    spiceSpicy: 'Spicy',
    spiceLocal: 'Local',
    spiceWarrior: 'Warrior',
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

  // ── HOME PAGE ────────────────────────────────────────────────────────────────
  home: {
    badge: 'Award Winning School',
    headingPre: 'Master the Art of',
    headingHighlight: 'Akha',
    headingSuffix: 'Cooking',
    tagline: 'A unique culinary journey from the misty mountains of the North to your personal cooking station in Chiang Mai.',
    // Cherry section
    cherryBadge: 'AI Expert Assistant',
    cherryTitle: 'Meet Cherry, Your Digital Host',
    cherryBody: 'Available 24/7 via text or live voice, Cherry is our official cultural ambassador. She can help you choose recipes, manage dietary restrictions, or tell you the ancestral stories behind every dish.',
    cherryAlt: 'Cherry Assistant',
    cherryVersion: 'CHERRY V5.0',
    cherryPlaying: 'Playing welcome...',
    cherryTap: 'Tap to hear Cherry',
    voiceTitle: 'Voice Live',
    voiceDesc: 'Real-time low-latency voice interaction.',
    recipeTitle: 'Recipe Expert',
    recipeDesc: 'Deep knowledge of our 11 signature dishes.',
    // Explore section
    exploreTitle: 'Explore the Kitchen',
    exploreDesc: 'Discover our classes, recipes, and heritage.',
    // Testimonial
    testimonialName: 'Sarah Jenkins',
    testimonialRole: 'Professional Food Traveler',
    testimonialQuote: '"An unforgettable experience that goes far beyond just cooking. It\'s a deep immersion into a beautiful, resilient culture."',
    // CTA
    startJourney: 'Start Your Journey',
  },

} as const;

// ─── Export ────────────────────────────────────────────────────────────────────

/**
 * Primary accessor for all UI strings.
 *
 * @example
 *   import { t } from '../lib/ui-strings';
 *   <Button>{t.common.back}</Button>
 *   <Typography>{t.booking.step1Title}</Typography>
 *   <span>{t.common.welcomeBack({ name: user.firstName })}</span>
 */
export const t = strings;

export type UIStrings = typeof strings;

export default strings;
