import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

// Design system tokens from Figma (Unwrapped-Design-System node 21:9179 / 523:387)
// Primary/indigo/900: #3077c9  |  Primary/indigo/1000: #2864a8
// Shadow idle:    0px 4px 8px  rgba(1,39,84,0.08)
// Shadow hover:   0px 8px 8px  rgba(1,39,84,0.08)
// Shadow pressed: 0px 4px 8px  rgba(1,39,84,0.16)

const variants: Record<ButtonVariant, string> = {
  primary: [
    'bg-[#3077c9] text-white',
    'shadow-[0px_4px_8px_0px_rgba(1,39,84,0.08)]',
    'hover:bg-[#2864a8] hover:shadow-[0px_8px_8px_0px_rgba(1,39,84,0.08)]',
    'active:bg-[#2864a8] active:shadow-[0px_4px_8px_0px_rgba(1,39,84,0.16)]',
    'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),

  secondary: [
    'bg-white border border-[#d6e4f4] text-[#012754]',
    'shadow-[0px_4px_8px_0px_rgba(1,39,84,0.08)]',
    'hover:bg-[#fbfcfe] hover:border-[#97bbe4] hover:shadow-[0px_8px_8px_0px_rgba(1,39,84,0.08)]',
    'active:bg-[#f5f8fc] active:border-[#3077c9] active:shadow-[0px_4px_8px_0px_rgba(1,39,84,0.16)]',
    'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),

  tertiary: [
    'text-[#3077c9]',
    'hover:bg-[#f5f8fc]',
    'active:bg-[#eaf1fa] active:text-[#2864a8]',
    'disabled:opacity-30 disabled:cursor-not-allowed',
  ].join(' '),

  danger: [
    'bg-[#bd0000] text-white',
    'shadow-[0px_4px_8px_0px_rgba(1,39,84,0.08)]',
    'hover:bg-[#970000] hover:shadow-[0px_8px_8px_0px_rgba(1,39,84,0.08)]',
    'active:bg-[#970000] active:shadow-[0px_4px_8px_0px_rgba(1,39,84,0.16)]',
    'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),
};

const sizes: Record<ButtonSize, string> = {
  lg: 'h-[56px] px-6 rounded-[12px] text-[16px]',
  md: 'h-[50px] px-5 rounded-[10px] text-[14px]',
  sm: 'h-[38px] px-3 rounded-[8px] text-[14px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'lg', iconLeft, iconRight, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          'inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap',
          'transition-[background-color,box-shadow,border-color,opacity] duration-150',
          variants[variant],
          sizes[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        {...props}
      >
        {iconLeft !== undefined && (
          <span className="flex items-center shrink-0">{iconLeft}</span>
        )}
        {children}
        {iconRight !== undefined && (
          <span className="flex items-center shrink-0">{iconRight}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
