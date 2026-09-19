import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/10 text-foreground border border-white/10',
        primary: 'bg-primary/20 text-primary border border-primary/40',
        starter: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
        common: 'bg-slate-400/15 text-slate-300 border border-slate-400/20',
        uncommon: 'bg-sky-400/15 text-sky-300 border border-sky-400/30',
        rare: 'bg-amber-400/15 text-amber-300 border border-amber-400/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
export { default as Badge } from './Badge.vue';
