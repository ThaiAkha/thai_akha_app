import {
  Apple, ArrowLeft, ArrowRight, ArrowUpRight, AudioLines, Award, Bike, Bot, Building2, Bus,
  Ban, Banknote, BadgeCheck, Beer, Bell, BellRing, BookOpen, BookOpenCheck, Bookmark, Box, Brain, BrainCircuit, Briefcase, Cake,
  Calendar, CalendarCheck, CalendarDays, CalendarPlus, CalendarX, Camera, Car, ChartColumn,
  Check, ChefHat, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Circle, CircleAlert, CircleCheck, CircleDashed, CircleEllipsis, CircleHelp, CirclePlay, CirclePlus, CircleX,
  Clock, ClipboardList, Coffee, Coins, CookingPot, Copy, CreditCard,
  Database, Delete, Diamond, DollarSign, DoorOpen, Download,
  Eye, ExternalLink,
  File, FileImage, FileText, Filter, Fingerprint, Flag, Flame, FlaskConical, Folder, FolderOpen, FolderPlus, Footprints,
  Gavel, Gift, GlassWater, Globe, GraduationCap, Grid3x3,
  Heart, HeartHandshake, History, Home, Hotel, Hourglass,
  IceCreamCone, Image, Info, Locate, LocateFixed, Plane, TrainFront,
  Key,
  Landmark, Layers, LayoutDashboard, Leaf, Lightbulb, Link, List, ListChecks, Lock, LogIn, LogOut,
  Mail, Map, MapPin, Menu, MessageSquare, Mic, Minus, Moon, MoreHorizontal, MoreVertical, Mountain, Music,
  Navigation, Newspaper,
  Package, Package2, Palette, Paperclip, PartyPopper, Pause, Pencil, Phone, Pizza, Play, Plus,
  Pin, Quote,
  Receipt, RefreshCw, RotateCcw, Route,
  Salad, Save, Search, Send, Settings, Share2, Shield, ShieldCheck, Shirt,
  ShoppingBag, ShoppingBasket, ShoppingCart, SkipBack, SlidersHorizontal, Soup, Sparkles, SquareUserRound, Star, Store, Sun,
  Table, Tag, ThumbsUp, Ticket, Timer, Trash2, TrendingDown, TrendingUp, Trees, TriangleAlert, Trophy, Truck,
  Unlock, Upload, User, UserCircle, UserCog, UserPlus, Users, Utensils, UtensilsCrossed, Type,
  Volume2, VolumeX,
  Wallet, Wine,
  X,
  Zap, ZapOff, ZoomIn, Cookie, Scale, ShieldAlert, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * 🎨 ICON REGISTRY - Universal Icon System
 *
 * Centralized in @thaiakha/shared for both front and admin.
 *
 * Strategy:
 *  - PascalCase keys: Lucide native names (used in admin, home cards DB)
 *  - snake_case keys: Material Symbols aliases (used in front .tsx files)
 *  - kebab-case keys: Lucide kebab names (used in quiz/shop DB values)
 */
export const iconRegistry: Record<string, LucideIcon> = {
  // Material Symbols / Snake Case aliases
  local_cafe: Coffee,
  local_taxi: Car,
  restaurant: Utensils,
  menu_book: BookOpen,
  mic: Mic,
  auto_stories: BookOpenCheck,
  psychology: Brain,
  restaurant_menu: CookingPot,
  location_on: MapPin,
  local_mall: ShoppingBag,
  history_edu: History,
  school: GraduationCap,
  play_circle: CirclePlay,
  open_in_new: ExternalLink,
  calendar_today: CalendarDays,
  update: RefreshCw,
  ramen_dining: Soup,
  directions_car: Car,
  volunteer_activism: HeartHandshake,

  // ============================================================
  // NAVIGATION & UI
  // ============================================================
  Home,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Circle,
  Moon,
  Sun,

  // ============================================================
  // ADMIN TOOLS
  // ============================================================
  Database,
  Hotel,
  Package,
  FolderOpen,
  CalendarDays,
  BarChart3: ChartColumn,
  Settings,
  Users,
  UserCog,
  ShieldCheck,
  BrainCircuit,
  ListChecks,

  // ============================================================
  // MANAGER OPERATIONS
  // ============================================================
  CalendarPlus,
  Truck,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  Eye,
  ChefHat,
  UtensilsCrossed,

  // ============================================================
  // AGENCY
  // ============================================================
  BookOpen,
  PlusCircle: CirclePlus,
  DollarSign,
  FileText,
  Download,
  Newspaper,
  Briefcase,

  // ============================================================
  // FRONT HOME CARDS (DB PascalCase values)
  // ============================================================
  Landmark,
  Trophy,
  MapPin,
  Calendar,

  // ============================================================
  // DRIVER & LOGISTICS
  // ============================================================
  Route,
  Car,
  Navigation,
  Map,

  // ============================================================
  // ACTIONS
  // ============================================================
  Plus,
  Minus,
  Edit: Pencil,
  Trash2,
  Save,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  Upload,
  ZoomIn,
  SlidersHorizontal,

  // ============================================================
  // STATUS & ALERTS
  // ============================================================
  AlertCircle: CircleAlert,
  AlertTriangle: TriangleAlert,
  Info,
  CheckCircle: CircleCheck,
  XCircle: CircleX,
  Bell,
  BellRing,
  BadgeCheck,

  // ============================================================
  // FINANCIAL
  // ============================================================
  Wallet,
  CreditCard,
  Banknote,
  TrendingUp,
  TrendingDown,
  Receipt,

  // ============================================================
  // COMMUNICATION
  // ============================================================
  Mail,
  MessageSquare,
  Phone,
  Send,
  Quote,

  // ============================================================
  // USER & PROFILE
  // ============================================================
  User,
  UserCircle,
  UserPlus,
  SquareUserRound,
  LogOut,
  LogIn,
  Lock,
  Unlock,
  Key,
  Shield,
  Fingerprint,
  GraduationCap,

  // ============================================================
  // FILES & MEDIA
  // ============================================================
  File,
  FileImage,
  Image,
  Folder,
  FolderPlus,
  Paperclip,
  Camera,
  Mic,

  // ============================================================
  // TIME & CALENDAR
  // ============================================================
  Clock,
  Timer,
  Hourglass,
  Play,
  PlayCircle: CirclePlay,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Music,
  CalendarX,

  // ============================================================
  // FOOD & KITCHEN
  // ============================================================
  Coffee,
  Wine,
  Soup,
  Pizza,
  Salad,
  Apple,
  Utensils,
  CookingPot,
  IceCreamCone,
  FlaskConical,
  Flame,

  // ============================================================
  // MISC
  // ============================================================
  Star,
  Heart,
  ThumbsUp,
  Flag,
  Tag,
  Bookmark,
  Share2,
  share: Share2,
  MoreVertical,
  MoreHorizontal,
  CircleEllipsis,
  Grid: Grid3x3,
  List,
  Layers,
  Box,
  Package2,
  Palette,
  Zap,
  Globe,
  Link,
  Sparkles,
  Award,
  Lightbulb,
  Brain,
  HelpCircle: CircleHelp,
  Ban,
  Store,
  ShoppingBasket,
  Table,
  Mountain,
  Trees,
  Leaf,
  AudioLines,
  Shirt,
  Beer,
  Gift,
  Ticket,
  Gavel,
  GlassWater,
  PartyPopper,
  DoorOpen,
  Footprints,
  Diamond,
  Coins,

  // ============================================================
  // MATERIAL SYMBOLS snake_case ALIASES
  // (used in .tsx files as <Icon name="snake_case_name">)
  // ============================================================
  access_time: Clock,
  account_box: SquareUserRound,
  add: Plus,
  add_circle: CirclePlus,
  radio_button_unchecked: Circle,
  add_location_alt: MapPin,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  apartment: Building2,
  backspace: Delete,
  block: Ban,
  bolt: Zap,
  bus_alert: Bus,
  business_center: Briefcase,
  checklist: ListChecks,
  cake: Cake,
  commute: Bus,
  coins: Coins,
  diamond: Diamond,
  calendar_month: CalendarDays,
  cancel: CircleX,
  chat: MessageSquare,
  check: Check,
  check_circle: CircleCheck,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  close: X,
  dashboard: LayoutDashboard,
  credit_card: CreditCard,
  dark_mode: Moon,
  directions_walk: Footprints,
  directions_bus: Bus,
  directions_bike: Bike,
  flight: Plane,
  dangerous: CircleX,
  edit: Pencil,
  edit_calendar: CalendarPlus,
  emoji_events: Trophy,
  event: Calendar,
  event_available: CalendarCheck,
  event_busy: CalendarX,
  expand_more: ChevronDown,
  face: User,
  favorite: Heart,
  fingerprint: Fingerprint,
  flag: Flag,
  format_quote: Quote,
  graphic_eq: AudioLines,
  grocery: ShoppingBasket,
  grid_view: Grid3x3,
  group: Users,
  groups: Users,
  health_and_safety: ShieldCheck,
  image: Image,
  info: Info,
  leaderboard: ChartColumn,
  lightbulb: Lightbulb,
  local_fire_department: Flame,
  local_shipping: Truck,
  lock: Lock,
  login: LogIn,
  logout: LogOut,
  line_style: AudioLines,
  map: Map,
  leaf: Leaf,
  forest: Trees,
  monetization_on: Coins,
  motorcycle: Bike,
  my_location: LocateFixed,
  nights_stay: Moon,
  motion_photos_off: ZapOff,
  notifications: Bell,
  person: User,
  person_add: UserPlus,
  place: MapPin,
  play_arrow: Play,
  rewind: SkipBack,
  pin_drop: Pin,
  payments: Banknote,
  quiz: CircleHelp,
  remove: Minus,
  schedule: Clock,
  search: Search,
  send: Send,
  settings: Settings,
  stars: Star,
  smart_toy: Bot,
  storefront: Store,
  table_rows: Table,
  train: TrainFront,
  temple_buddhist: Landmark,
  museum: Landmark,
  photo_camera: Camera,
  set_meal: Utensils,
  timer: Timer,
  text_fields: Type,
  tips_and_updates: Lightbulb,
  taxi_alert: Car,
  chili_off: ZapOff,
  flare: Flame,
  whatshot: Flame,
  tune: SlidersHorizontal,
  verified: BadgeCheck,
  verified_user: ShieldCheck,
  visibility: Eye,
  mail: Mail,
  location_searching: Locate,
  person_outline: User,
  volume_up: Volume2,
  warning: TriangleAlert,
  widgets: Grid3x3,
  view_agenda: Layers,
  wb_sunny: Sun,
  workspace_premium: Award,
  zoom_in: ZoomIn,
  privacy_tip: ShieldAlert,
  data_usage: Database,
  wc: Users,
  balance: Scale,
  cookie: Cookie,
  signal_cellular_alt: ChartColumn,
  eco: Leaf,
  grass: Leaf,
  hardware: Wrench,
  inventory_2: Package,
  dinner_dining: UtensilsCrossed,

  // ── Quiz module icons (Material Symbols used in quiz_modules DB) ──
  music_note: Music,
  record_voice_over: Mic,
  radio_button_checked: CircleCheck,
  castle: Landmark,
  festival: PartyPopper,
  nightlife: PartyPopper,
  agriculture: Leaf,
  celebration: PartyPopper,
  auto_awesome: Sparkles,
  replay: RotateCcw,
  spa: Leaf,
  local_grocery_store: ShoppingBasket,

  // ============================================================
  // DB kebab-case ALIASES
  // (used in quiz_modules, quiz_rewards, shop_categories, content_categories)
  // ============================================================
  'cooking-pot': CookingPot,
  'door-open': DoorOpen,
  footprints: Footprints,
  'party-popper': PartyPopper,
  shirt: Shirt,
  trees: Trees,
  users: Users,
  award: Award,
  beer: Beer,
  coffee: Coffee,
  gift: Gift,
  music: Music,
  ticket: Ticket,
  gavel: Gavel,
  icecream: IceCreamCone,
  landscape: Mountain,
  pestle: FlaskConical,
  skillet: Flame,
  soup_kitchen: Soup,
  tapas: UtensilsCrossed,
  utensils: Utensils,
  'glass-water': GlassWater,
  'graduation-cap': GraduationCap,
  wine: Wine,
  zap: Zap,
};

export type IconName = keyof typeof iconRegistry;

/**
 * Get icon component by name.
 * Resolution order:
 *  1. Exact match (handles snake_case, kebab-case, PascalCase, lowercase)
 *  2. PascalCase normalization (e.g. "home" → "Home")
 *  3. kebab-case → PascalCase (e.g. "cooking-pot" → "CookingPot")
 *  4. Fallback to CircleDashed
 */
export function getIcon(
  iconName: string | undefined | null,
  fallback: LucideIcon = CircleDashed,
): LucideIcon {
  if (!iconName) return fallback;

  // 1. Exact match (covers snake_case aliases and all direct keys)
  if (iconRegistry[iconName]) return iconRegistry[iconName];

  // 2. PascalCase normalization (e.g. "home" → "Home")
  const pascalCased = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  if (iconRegistry[pascalCased]) return iconRegistry[pascalCased];

  // 3. kebab-case → PascalCase (e.g. "cooking-pot" → "CookingPot")
  const fromKebab = iconName
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/^./, (c: string) => c.toUpperCase());
  if (iconRegistry[fromKebab]) return iconRegistry[fromKebab];

  // 4. Fallback
  console.warn(`[Icon] Unknown icon: "${iconName}" — using fallback`);
  return fallback;
}

export default iconRegistry;
