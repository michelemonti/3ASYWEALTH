import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid h-8 w-8 place-items-center rounded-lg bg-foreground text-[11px] font-bold tracking-tight text-background',
        className,
      )}
    >
      3W
    </span>
  )
}
