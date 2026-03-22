import { Icon, Typography, MediaImage } from '../index';
import { cn } from '@thaiakha/shared/lib/utils';
import { useMediaAsset } from '../../../hooks/useMediaAsset';

export interface StatCardProps {
  title?: string | React.ReactNode;
  value?: string | number | React.ReactNode;
  icon?: string;
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  image?: string;
  color?: 'primary' | 'secondary' | 'action' | 'success' | 'warning' | 'error' | 'info' | 'default' | 'quiz' | 'transparent';
  className?: string;
  bordered?: boolean;
  shadow?: boolean;
  hoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  valuePosition?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
  iconPosition?: 'top' | 'left' | 'right';
  assetId?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  prefix,
  suffix,
  title,
  value,
  change,
  trend = 'neutral',
  description,
  image,
  color = 'primary',
  className,
  bordered = true,
  shadow = true,
  hoverable = true,
  size = 'md',
  valuePosition = 'top',
  align = 'left',
  iconPosition = 'top',
  assetId,
  onClick,
}) => {
  const { asset, loading } = useMediaAsset({ assetId });

  const displayTitle = title || asset?.title || (loading ? "..." : "");
  const displayDescription = description || asset?.caption || (loading ? "..." : "");
  const displayImage = image || asset?.image_url || assetId;
  const colorStyles = {
    primary: {
      icon: 'text-primary dark:text-primary-200',
      bg: 'bg-primary/5 dark:bg-primary/20',
      border: 'border-primary/60',
      text: 'text-gray-800 dark:text-gray-100',
    },
    secondary: {
      icon: 'text-secondary dark:text-secondary-200',
      bg: 'bg-secondary/5 dark:bg-secondary/20',
      border: 'border-secondary/60',
      text: 'text-gray-800 dark:text-gray-100',
    },
    action: {
      icon: 'text-action dark:text-action-200',
      bg: 'bg-action/5 dark:bg-action/20',
      border: 'border-action/60',
      text: 'text-gray-800 dark:text-gray-100',
    },
    success: {
      icon: 'text-green-500',
      bg: 'bg-green-500/5',
      border: 'border-green-500/20',
      text: 'text-green-500',
    },
    warning: {
      icon: 'text-yellow-500',
      bg: 'bg-yellow-500/5',
      border: 'border-yellow-500/20',
      text: 'text-yellow-500',
    },
    error: {
      icon: 'text-red-500',
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      text: 'text-red-500',
    },
    info: {
      icon: 'text-blue-500',
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
    },
    default: {
      icon: 'text-slate-400',
      bg: 'bg-slate-500/5',
      border: 'border-slate-500/20',
      text: 'text-slate-400',
    },
    quiz: {
      icon: 'text-quiz',
      bg: 'bg-quiz/5',
      border: 'border-quiz/20',
      text: 'text-quiz',
    },
    transparent: {
      icon: 'text-gray-500',
      bg: 'bg-transparent',
      border: 'border-transparent',
      text: 'text-gray-500',
    },
  };

  const currentSize = {
    sm: { padding: 'pl-3 pr-4 py-3', iconSize: 'md' as const, titleSize: 'microLabel' as const, valueSize: 'h6' as const, descSize: 'caption' as const },
    md: { padding: 'p-5', iconSize: 'md' as const, titleSize: 'h5' as const, valueSize: 'h4' as const, descSize: 'paragraphS' as const },
    lg: { padding: 'p-6', iconSize: 'md' as const, titleSize: 'h4' as const, valueSize: 'h3' as const, descSize: 'paragraphM' as const },
  }[size];

  const currentColor = colorStyles[color] || colorStyles.primary;

  const alignStyles = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const content = (
    <div className={cn("flex flex-col flex-1", alignStyles[align])}>
      {valuePosition === 'top' ? (
         <>
           <div className="flex items-baseline gap-1 mb-0.5">
             {prefix && <Typography as="span" variant="monoLabel" className="opacity-50">{prefix}</Typography>}
             {value && (
               <Typography variant={currentSize.valueSize} color="title">
                 {value}
               </Typography>
             )}
             {suffix && <Typography as="span" variant="monoLabel" className="opacity-80">{suffix}</Typography>}
           </div>
           <div className={cn("relative", loading && "min-h-[1.5rem] w-3/4 animate-pulse bg-gray-200 dark:bg-gray-800 rounded mb-1")}>
              <Typography variant={currentSize.titleSize} className={cn('opacity-70', currentColor.text)}>
                {displayTitle}
              </Typography>
           </div>
         </>
      ) : (
         <>
           <div className={cn("relative", loading && "min-h-[1.5rem] w-3/4 animate-pulse bg-gray-200 dark:bg-gray-800 rounded mb-1")}>
              <Typography variant={currentSize.titleSize} className={cn('opacity-70 mb-1', currentColor.text)}>
                {displayTitle}
              </Typography>
           </div>
           <div className="flex items-baseline gap-1">
             {prefix && <Typography as="span" variant="monoLabel" className="opacity-80">{prefix}</Typography>}
             {value && (
               <Typography variant={currentSize.valueSize} color="title">
                 {value}
               </Typography>
             )}
             {suffix && <Typography as="span" variant="monoLabel" className="opacity-50">{suffix}</Typography>}
           </div>
         </>
      )}
      <div className={cn("relative", loading && "min-h-[3rem] w-full animate-pulse bg-gray-200/50 dark:bg-gray-800/50 rounded mt-2")}>
        {displayDescription && (
          <Typography variant={currentSize.descSize} className="mt-2 opacity-60 line-clamp-3">
            {displayDescription}
          </Typography>
        )}
      </div>
    </div>
  );

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl flex',
        iconPosition === 'top' ? 'flex-col' : 'items-center gap-4',
        iconPosition === 'right' && 'flex-row-reverse',
        alignStyles[align],
        currentSize.padding,
        currentColor.bg,
        bordered && `border ${currentColor.border}`,
        onClick ? 'cursor-pointer' : 'cursor-default',
        className
      )}
    >
      {(icon || displayImage) && (
        <div className={cn(
          "shrink-0 overflow-hidden flex items-center justify-center",
          displayImage ? "rounded-xl" : "p-2.5 rounded-xl bg-white/70 dark:bg-white/10",
          iconPosition === 'top' ? (displayImage ? 'w-full aspect-video mb-6' : 'mb-6') : (displayImage ? 'w-16 h-16 sm:w-20 sm:h-20' : ''),
          align === 'center' && iconPosition === 'top' && 'mx-auto'
        )}>
          {displayImage ? (
            <MediaImage
              assetId={assetId}
              url={image}
              fallbackAlt={typeof displayTitle === 'string' ? displayTitle : ''}
              showCaption={false}
              imgClassName="w-full h-full object-cover"
            />
          ) : (
            <Icon name={icon!} className={currentColor.icon} size={currentSize.iconSize} />
          )}
        </div>
      )}

      {content}
    </div>
  );
};

export default StatCard;