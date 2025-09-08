/**
 * Empty State Component
 * Displays friendly empty states with healthcare theme
 */

/**
 * Empty State Component
 * Displays friendly empty states with healthcare theme
 */
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'search' | 'error';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const variantClasses = {
    default: 'text-muted-foreground',
    search: 'text-healthcare-dark',
    error: 'text-medical-critical'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-6",
      className
    )}>
      <div className={cn(
        "rounded-full p-6 mb-4",
        variant === 'default' && "bg-muted",
        variant === 'search' && "bg-healthcare-soft",
        variant === 'error' && "bg-medical-critical/10"
      )}>
        <Icon className={cn(
          "w-12 h-12",
          variantClasses[variant]
        )} />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          variant={variant === 'error' ? 'outline' : 'healthcare'}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}