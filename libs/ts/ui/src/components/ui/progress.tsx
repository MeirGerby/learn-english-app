import { Progress as ProgressPrimitive } from 'radix-ui';
import type * as React from 'react';
import { cn } from '../../lib/utils';

// The bar fills from the reading start, so it runs right to left in RTL.
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const percent = Math.min(100, Math.max(0, value ?? 0));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={percent}
      className={cn(
        'relative h-1 w-full overflow-hidden rounded-full bg-muted',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full bg-primary transition-all"
        style={{ width: `${percent}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
