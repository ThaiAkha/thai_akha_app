// Basic Components
export { default as Button } from './Button';
export { default as Typography } from './Typography';
export * from './Typography';
export { default as Badge } from './Badge';
export { default as Chip } from './Chip';
export { default as Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { default as InfoCard } from './InfoCard';
export { default as QuizCard } from './QuizCard';
export { default as Divider } from './Divider';
export { default as Tabs } from './Tabs';
export { default as Avatar } from './Avatar';
export { default as Icon } from './Icon';
export { default as ClassPicker } from './ClassPicker';

// Media & Overlays (✅ Nuovi Aggiunti)
export { default as Modal } from './Modal'; // Assicurati di avere anche il Modal base se lo usi
export { default as VideoModal } from './VideoModal';
export { default as PhotoModal } from './PhotoModal';
export { default as GalleryModal } from './GalleryModal';

// Form Components
export { default as Input } from './Input';
export { default as Textarea } from './Textarea';
export { default as Toggle } from './Toggle';
export { default as Slider } from './Slider';

// Feedback Components
export { default as Alert } from './Alert';
export { default as Tooltip } from './Tooltip';
export { default as ProgressBar } from './ProgressBar';
export { default as AkhaLoader } from './AkhaLoader'; // 👈 NUOVO AGGIUNTO

// Data Display
// Fix: Removed non-existent SuccessCard, WarningCard, ErrorCard, and ActionCard as they are not exported from StatCard kha
export { default as StatCard } from './StatCard';
export { default as Pagination } from './Pagination';
export { default as Table } from './Table';