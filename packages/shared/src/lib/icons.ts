import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * 🎨 ICON REGISTRY - Sistema Universale di Icone
 * 
 * Centralizzato nel pacchetto shared per essere usato sia da front che da admin.
 */
export const iconRegistry: Record<string, LucideIcon> = {
  // ===== NAVIGATION & UI =====
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
  ArrowForward: LucideIcons.ArrowRight,
  ArrowBack: LucideIcons.ArrowLeft,

  ExternalLink: LucideIcons.ExternalLink,
  Circle: LucideIcons.Circle,
  Moon: LucideIcons.Moon,
  Sun: LucideIcons.Sun,


  // ===== ADMIN TOOLS =====
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

  // ===== MANAGER OPERATIONS =====
  CalendarPlus: LucideIcons.CalendarPlus,
  Truck: LucideIcons.Truck,
  ShoppingCart: LucideIcons.ShoppingCart,
  ShoppingBag: LucideIcons.ShoppingBag,
  ClipboardList: LucideIcons.ClipboardList,
  Eye: LucideIcons.Eye,
  ChefHat: LucideIcons.ChefHat,
  UtensilsCrossed: LucideIcons.UtensilsCrossed,

  // ===== AGENCY =====
  BookOpen: LucideIcons.BookOpen,
  PlusCircle: LucideIcons.PlusCircle,
  DollarSign: LucideIcons.DollarSign,
  FileText: LucideIcons.FileText,
  Download: LucideIcons.Download,
  Newspaper: LucideIcons.Newspaper,
  Briefcase: LucideIcons.Briefcase,

  // ===== DRIVER & LOGISTICS =====
  Route: LucideIcons.Route,
  Car: LucideIcons.Car,
  MapPin: LucideIcons.MapPin,
  Navigation: LucideIcons.Navigation,
  Map: LucideIcons.Map,

  // ===== ACTIONS =====
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

  // ===== STATUS & ALERTS =====
  AlertCircle: LucideIcons.AlertCircle,
  AlertTriangle: LucideIcons.AlertTriangle,
  Info: LucideIcons.Info,
  CheckCircle: LucideIcons.CheckCircle,
  XCircle: LucideIcons.XCircle,
  Bell: LucideIcons.Bell,
  BellRing: LucideIcons.BellRing,

  // ===== FINANCIAL =====
  Wallet: LucideIcons.Wallet,
  CreditCard: LucideIcons.CreditCard,
  Banknote: LucideIcons.Banknote,
  TrendingUp: LucideIcons.TrendingUp,
  TrendingDown: LucideIcons.TrendingDown,
  Receipt: LucideIcons.Receipt,

  // ===== COMMUNICATION =====
  Mail: LucideIcons.Mail,
  MessageSquare: LucideIcons.MessageSquare,
  Phone: LucideIcons.Phone,
  Send: LucideIcons.Send,

  // ===== USER & PROFILE =====
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

  // ===== FILES & MEDIA =====
  File: LucideIcons.File,
  FileImage: LucideIcons.FileImage,
  Image: LucideIcons.Image,
  Folder: LucideIcons.Folder,
  FolderPlus: LucideIcons.FolderPlus,
  Paperclip: LucideIcons.Paperclip,
  Camera: LucideIcons.Camera,

  // ===== TIME & CALENDAR =====
  Calendar: LucideIcons.Calendar,
  Clock: LucideIcons.Clock,
  Timer: LucideIcons.Timer,
  Hourglass: LucideIcons.Hourglass,
  Play: LucideIcons.Play,
  PlayCircle: LucideIcons.PlayCircle,
  RotateCcw: LucideIcons.RotateCcw,
  Music: LucideIcons.Music,


  // ===== FOOD & KITCHEN =====
  Coffee: LucideIcons.Coffee,
  Wine: LucideIcons.Wine,
  Soup: LucideIcons.Soup,
  Pizza: LucideIcons.Pizza,
  Salad: LucideIcons.Salad,
  Apple: LucideIcons.Apple,

  // ===== MISC =====
  Star: LucideIcons.Star,
  Heart: LucideIcons.Heart,
  ThumbsUp: LucideIcons.ThumbsUp,
  Flag: LucideIcons.Flag,
  Tag: LucideIcons.Tag,
  Bookmark: LucideIcons.Bookmark,
  Share2: LucideIcons.Share2,
  MoreVertical: LucideIcons.MoreVertical,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  Grid: LucideIcons.Grid,
  List: LucideIcons.List,
  Layers: LucideIcons.Layers,
  Box: LucideIcons.Box,
  Package2: LucideIcons.Package2,
  Palette: LucideIcons.Palette,
  Zap: LucideIcons.Zap,
  Globe: LucideIcons.Globe,
  Link: LucideIcons.Link,
  Sparkles: LucideIcons.Sparkles,
};

export type IconName = keyof typeof iconRegistry;

/**
 * Get icon component by name (string)
 */
export function getIcon(iconName: string | undefined | null, fallback: LucideIcon = LucideIcons.AlertCircle): LucideIcon {
  if (!iconName) return fallback;

  // Try exact match first
  if (iconRegistry[iconName]) return iconRegistry[iconName];

  // Try PascalCase normalization
  const pascalCased = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  if (iconRegistry[pascalCased]) return iconRegistry[pascalCased];

  return fallback;
}

export default iconRegistry;
