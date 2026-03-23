import * as LucideIcons from 'lucide-react';
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

  // ============================================================
  // NAVIGATION & UI
  // ============================================================
  Home: LucideIcons.Home,
  LayoutDashboard: LucideIcons.LayoutDashboard,
  Menu: LucideIcons.Menu,
  X: LucideIcons.X,
  ChevronRight: LucideIcons.ChevronRight,
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronDown: LucideIcons.ChevronDown,
  ChevronUp: LucideIcons.ChevronUp,
  ArrowRight: LucideIcons.ArrowRight,
  ArrowLeft: LucideIcons.ArrowLeft,
  ArrowUpRight: LucideIcons.ArrowUpRight,
  ExternalLink: LucideIcons.ExternalLink,
  Circle: LucideIcons.Circle,
  Moon: LucideIcons.Moon,
  Sun: LucideIcons.Sun,

  // ============================================================
  // ADMIN TOOLS
  // ============================================================
  Database: LucideIcons.Database,
  Hotel: LucideIcons.Hotel,
  Package: LucideIcons.Package,
  FolderOpen: LucideIcons.FolderOpen,
  CalendarDays: LucideIcons.CalendarDays,
  BarChart3: LucideIcons.BarChart3,
  Settings: LucideIcons.Settings,
  Users: LucideIcons.Users,
  UserCog: LucideIcons.UserCog,
  ShieldCheck: LucideIcons.ShieldCheck,
  BrainCircuit: LucideIcons.BrainCircuit,
  ListChecks: LucideIcons.ListChecks,

  // ============================================================
  // MANAGER OPERATIONS
  // ============================================================
  CalendarPlus: LucideIcons.CalendarPlus,
  Truck: LucideIcons.Truck,
  ShoppingCart: LucideIcons.ShoppingCart,
  ShoppingBag: LucideIcons.ShoppingBag,
  ClipboardList: LucideIcons.ClipboardList,
  Eye: LucideIcons.Eye,
  ChefHat: LucideIcons.ChefHat,
  UtensilsCrossed: LucideIcons.UtensilsCrossed,

  // ============================================================
  // AGENCY
  // ============================================================
  BookOpen: LucideIcons.BookOpen,
  PlusCircle: LucideIcons.PlusCircle,
  DollarSign: LucideIcons.DollarSign,
  FileText: LucideIcons.FileText,
  Download: LucideIcons.Download,
  Newspaper: LucideIcons.Newspaper,
  Briefcase: LucideIcons.Briefcase,

  // ============================================================
  // FRONT HOME CARDS (DB PascalCase values)
  // ============================================================
  Landmark: LucideIcons.Landmark,
  Trophy: LucideIcons.Trophy,
  MapPin: LucideIcons.MapPin,
  Calendar: LucideIcons.Calendar,

  // ============================================================
  // DRIVER & LOGISTICS
  // ============================================================
  Route: LucideIcons.Route,
  Car: LucideIcons.Car,
  Navigation: LucideIcons.Navigation,
  Map: LucideIcons.Map,

  // ============================================================
  // ACTIONS
  // ============================================================
  Plus: LucideIcons.Plus,
  Minus: LucideIcons.Minus,
  Edit: LucideIcons.Edit,
  Trash2: LucideIcons.Trash2,
  Save: LucideIcons.Save,
  Copy: LucideIcons.Copy,
  Check: LucideIcons.Check,
  Search: LucideIcons.Search,
  Filter: LucideIcons.Filter,
  RefreshCw: LucideIcons.RefreshCw,
  Upload: LucideIcons.Upload,
  ZoomIn: LucideIcons.ZoomIn,
  SlidersHorizontal: LucideIcons.SlidersHorizontal,

  // ============================================================
  // STATUS & ALERTS
  // ============================================================
  AlertCircle: LucideIcons.AlertCircle,
  AlertTriangle: LucideIcons.AlertTriangle,
  Info: LucideIcons.Info,
  CheckCircle: LucideIcons.CheckCircle,
  XCircle: LucideIcons.XCircle,
  Bell: LucideIcons.Bell,
  BellRing: LucideIcons.BellRing,
  BadgeCheck: LucideIcons.BadgeCheck,

  // ============================================================
  // FINANCIAL
  // ============================================================
  Wallet: LucideIcons.Wallet,
  CreditCard: LucideIcons.CreditCard,
  Banknote: LucideIcons.Banknote,
  TrendingUp: LucideIcons.TrendingUp,
  TrendingDown: LucideIcons.TrendingDown,
  Receipt: LucideIcons.Receipt,

  // ============================================================
  // COMMUNICATION
  // ============================================================
  Mail: LucideIcons.Mail,
  MessageSquare: LucideIcons.MessageSquare,
  Phone: LucideIcons.Phone,
  Send: LucideIcons.Send,
  Quote: LucideIcons.Quote,

  // ============================================================
  // USER & PROFILE
  // ============================================================
  User: LucideIcons.User,
  UserCircle: LucideIcons.UserCircle,
  UserPlus: LucideIcons.UserPlus,
  SquareUserRound: LucideIcons.SquareUserRound,
  LogOut: LucideIcons.LogOut,
  LogIn: LucideIcons.LogIn,
  Lock: LucideIcons.Lock,
  Unlock: LucideIcons.Unlock,
  Key: LucideIcons.Key,
  Shield: LucideIcons.Shield,
  Fingerprint: LucideIcons.Fingerprint,
  GraduationCap: LucideIcons.GraduationCap,

  // ============================================================
  // FILES & MEDIA
  // ============================================================
  File: LucideIcons.File,
  FileImage: LucideIcons.FileImage,
  Image: LucideIcons.Image,
  Folder: LucideIcons.Folder,
  FolderPlus: LucideIcons.FolderPlus,
  Paperclip: LucideIcons.Paperclip,
  Camera: LucideIcons.Camera,
  Mic: LucideIcons.Mic,

  // ============================================================
  // TIME & CALENDAR
  // ============================================================
  Clock: LucideIcons.Clock,
  Timer: LucideIcons.Timer,
  Hourglass: LucideIcons.Hourglass,
  Play: LucideIcons.Play,
  PlayCircle: LucideIcons.PlayCircle,
  Pause: LucideIcons.Pause,
  Volume2: LucideIcons.Volume2,
  VolumeX: LucideIcons.VolumeX,
  RotateCcw: LucideIcons.RotateCcw,
  Music: LucideIcons.Music,
  CalendarX: LucideIcons.CalendarX,

  // ============================================================
  // FOOD & KITCHEN
  // ============================================================
  Coffee: LucideIcons.Coffee,
  Wine: LucideIcons.Wine,
  Soup: LucideIcons.Soup,
  Pizza: LucideIcons.Pizza,
  Salad: LucideIcons.Salad,
  Apple: LucideIcons.Apple,
  Utensils: LucideIcons.Utensils,
  CookingPot: LucideIcons.CookingPot,
  IceCreamCone: LucideIcons.IceCreamCone,
  FlaskConical: LucideIcons.FlaskConical,
  Flame: LucideIcons.Flame,

  // ============================================================
  // MISC
  // ============================================================
  Star: LucideIcons.Star,
  Heart: LucideIcons.Heart,
  ThumbsUp: LucideIcons.ThumbsUp,
  Flag: LucideIcons.Flag,
  Tag: LucideIcons.Tag,
  Bookmark: LucideIcons.Bookmark,
  Share2: LucideIcons.Share2,
  MoreVertical: LucideIcons.MoreVertical,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  Grid: LucideIcons.Grid3x3,
  List: LucideIcons.List,
  Layers: LucideIcons.Layers,
  Box: LucideIcons.Box,
  Package2: LucideIcons.Package2,
  Palette: LucideIcons.Palette,
  Zap: LucideIcons.Zap,
  Globe: LucideIcons.Globe,
  Link: LucideIcons.Link,
  Sparkles: LucideIcons.Sparkles,
  Award: LucideIcons.Award,
  Lightbulb: LucideIcons.Lightbulb,
  Brain: LucideIcons.Brain,
  HelpCircle: LucideIcons.HelpCircle,
  Ban: LucideIcons.Ban,
  Store: LucideIcons.Store,
  ShoppingBasket: LucideIcons.ShoppingBasket,
  Table: LucideIcons.Table,
  Mountain: LucideIcons.Mountain,
  Trees: LucideIcons.Trees,
  AudioLines: LucideIcons.AudioLines,
  Shirt: LucideIcons.Shirt,
  Beer: LucideIcons.Beer,
  Gift: LucideIcons.Gift,
  Ticket: LucideIcons.Ticket,
  Gavel: LucideIcons.Gavel,
  GlassWater: LucideIcons.GlassWater,
  PartyPopper: LucideIcons.PartyPopper,
  DoorOpen: LucideIcons.DoorOpen,
  Footprints: LucideIcons.Footprints,
  Diamond: LucideIcons.Diamond,
  Coins: LucideIcons.Coins,

  // ============================================================
  // MATERIAL SYMBOLS snake_case ALIASES
  // (used in .tsx files as <Icon name="snake_case_name">)
  // ============================================================
  add: LucideIcons.Plus,
  add_circle: LucideIcons.PlusCircle,
  add_location_alt: LucideIcons.MapPin,
  arrow_back: LucideIcons.ArrowLeft,
  arrow_forward: LucideIcons.ArrowRight,
  backspace: LucideIcons.Delete,
  block: LucideIcons.Ban,
  bolt: LucideIcons.Zap,
  business_center: LucideIcons.Briefcase,
  coins: LucideIcons.Coins,
  diamond: LucideIcons.Diamond,
  calendar_month: LucideIcons.CalendarDays,
  cancel: LucideIcons.XCircle,
  chat: LucideIcons.MessageSquare,
  check: LucideIcons.Check,
  check_circle: LucideIcons.CheckCircle,
  chevron_left: LucideIcons.ChevronLeft,
  chevron_right: LucideIcons.ChevronRight,
  close: LucideIcons.X,
  dashboard: LucideIcons.LayoutDashboard,
  credit_card: LucideIcons.CreditCard,
  dark_mode: LucideIcons.Moon,
  directions_walk: LucideIcons.Footprints,
  edit: LucideIcons.Edit,
  edit_calendar: LucideIcons.CalendarPlus,
  emoji_events: LucideIcons.Trophy,
  event: LucideIcons.Calendar,
  event_busy: LucideIcons.CalendarX,
  expand_more: LucideIcons.ChevronDown,
  face: LucideIcons.User,
  fingerprint: LucideIcons.Fingerprint,
  flag: LucideIcons.Flag,
  format_quote: LucideIcons.Quote,
  graphic_eq: LucideIcons.AudioLines,
  grocery: LucideIcons.ShoppingBasket,
  group: LucideIcons.Users,
  groups: LucideIcons.Users,
  health_and_safety: LucideIcons.ShieldCheck,
  image: LucideIcons.Image,
  info: LucideIcons.Info,
  leaderboard: LucideIcons.BarChart3,
  lightbulb: LucideIcons.Lightbulb,
  local_fire_department: LucideIcons.Flame,
  local_shipping: LucideIcons.Truck,
  local_taxi: LucideIcons.Car,
  location_on: LucideIcons.MapPin,
  lock: LucideIcons.Lock,
  login: LucideIcons.LogIn,
  logout: LucideIcons.LogOut,
  map: LucideIcons.Map,
  menu_book: LucideIcons.BookOpen,
  mic: LucideIcons.Mic,
  monetization_on: LucideIcons.Coins,
  person: LucideIcons.User,
  person_add: LucideIcons.UserPlus,
  place: LucideIcons.MapPin,
  play_arrow: LucideIcons.Play,
  rewind: LucideIcons.SkipBack,
  psychology: LucideIcons.Brain,
  quiz: LucideIcons.HelpCircle,
  remove: LucideIcons.Minus,
  restaurant: LucideIcons.UtensilsCrossed,
  restaurant_menu: LucideIcons.BookOpen,
  schedule: LucideIcons.Clock,
  school: LucideIcons.GraduationCap,
  search: LucideIcons.Search,
  send: LucideIcons.Send,
  settings: LucideIcons.Settings,
  stars: LucideIcons.Star,
  storefront: LucideIcons.Store,
  table_rows: LucideIcons.Table,
  temple_buddhist: LucideIcons.Landmark,
  timer: LucideIcons.Timer,
  tips_and_updates: LucideIcons.Lightbulb,
  tune: LucideIcons.SlidersHorizontal,
  verified: LucideIcons.BadgeCheck,
  verified_user: LucideIcons.ShieldCheck,
  visibility: LucideIcons.Eye,
  mail: LucideIcons.Mail,
  person_outline: LucideIcons.User,
  volume_up: LucideIcons.Volume2,
  warning: LucideIcons.AlertTriangle,
  wb_sunny: LucideIcons.Sun,
  workspace_premium: LucideIcons.Award,
  zoom_in: LucideIcons.ZoomIn,

  // ============================================================
  // DB kebab-case ALIASES
  // (used in quiz_modules, quiz_rewards, shop_categories, recipe_categories)
  // ============================================================
  'cooking-pot': LucideIcons.CookingPot,
  'door-open': LucideIcons.DoorOpen,
  footprints: LucideIcons.Footprints,
  'party-popper': LucideIcons.PartyPopper,
  shirt: LucideIcons.Shirt,
  trees: LucideIcons.Trees,
  users: LucideIcons.Users,
  award: LucideIcons.Award,
  beer: LucideIcons.Beer,
  coffee: LucideIcons.Coffee,
  gift: LucideIcons.Gift,
  music: LucideIcons.Music,
  ticket: LucideIcons.Ticket,
  gavel: LucideIcons.Gavel,
  icecream: LucideIcons.IceCreamCone,
  landscape: LucideIcons.Mountain,
  pestle: LucideIcons.FlaskConical,
  skillet: LucideIcons.Flame,
  soup_kitchen: LucideIcons.Soup,
  tapas: LucideIcons.UtensilsCrossed,
  utensils: LucideIcons.Utensils,
  'glass-water': LucideIcons.GlassWater,
  'graduation-cap': LucideIcons.GraduationCap,
  wine: LucideIcons.Wine,
  zap: LucideIcons.Zap,

  // ============================================================
  // DB mixed-case ALIASES
  // (home_cards_front, site_metadata use lowercase)
  // ============================================================
  home: LucideIcons.Home,
  landmark: LucideIcons.Landmark,
  trophy: LucideIcons.Trophy,
  hotel: LucideIcons.Hotel,
};

export type IconName = keyof typeof iconRegistry;

/**
 * Get icon component by name.
 * Resolution order:
 *  1. Exact match (handles snake_case, kebab-case, PascalCase, lowercase)
 *  2. PascalCase normalization (e.g. "home" → "Home")
 *  3. kebab-case → PascalCase (e.g. "cooking-pot" → "CookingPot")
 *  4. Fallback to AlertCircle
 */
export function getIcon(
  iconName: string | undefined | null,
  fallback: LucideIcon = LucideIcons.CircleDashed,
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
