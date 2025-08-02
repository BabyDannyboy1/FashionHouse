import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gold-500 text-black',
        secondary: 'border-transparent bg-gray-600 text-white',
        destructive: 'border-transparent bg-red-500 text-white',
        success: 'border-transparent bg-green-500 text-white',
        warning: 'border-transparent bg-yellow-500 text-black',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };