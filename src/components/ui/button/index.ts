import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-white/5 border border-white/10 text-foreground hover:bg-white/10 hover:border-white/20 active:translate-y-px',
        primary:
          'bg-primary border border-primary text-primary-foreground hover:brightness-110 shadow-sm active:translate-y-px',
        outline:
          'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        ghost:
          'hover:bg-white/5 text-muted-foreground hover:text-foreground',
        danger:
          'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40',
      },
      size: {
        default: 'h-8 px-3.5 py-1.5 rounded-md text-xs',
        sm: 'h-7 px-2.5 rounded text-xs',
        lg: 'h-10 px-5 rounded-lg text-sm',
        icon: 'h-8 w-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
export { default as Button } from './Button.vue';
