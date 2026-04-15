'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: `
    bg-ui-accent hover:bg-ui-accent/90 
    text-white 
    shadow-lg shadow-ui-accent/20
    hover:shadow-xl hover:shadow-ui-accent/30
  `,
  secondary: `
    bg-bg-elevated hover:bg-bg-surface
    border border-border-subtle
    text-text-primary
    hover:border-border-glow
  `,
  ghost: `
    bg-transparent hover:bg-bg-elevated
    text-text-secondary hover:text-text-primary
  `,
  danger: `
    bg-ui-danger hover:bg-ui-danger/90
    text-white
    shadow-lg shadow-ui-danger/20
  `,
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex
        items-center
        justify-center
        rounded-btn
        font-semibold
        transition-all
        duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="spinner spinner-sm" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

interface PanelProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Panel({ children, className = '', elevated = false, padding = 'md' }: PanelProps) {
  return (
    <div
      className={`
        rounded-card
        border border-border-subtle
        ${elevated ? 'bg-bg-elevated' : 'bg-bg-surface'}
        ${PADDING_CLASSES[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'rare' | 'epic' | 'legendary';
  size?: 'sm' | 'md';
  className?: string;
}

const BADGE_VARIANTS = {
  default: 'bg-bg-elevated text-text-secondary',
  success: 'bg-ui-success/20 text-ui-success',
  warning: 'bg-ui-warning/20 text-ui-warning',
  danger: 'bg-ui-danger/20 text-ui-danger',
  rare: 'bg-rarity-rare/20 text-rarity-rare',
  epic: 'bg-rarity-epic/20 text-rarity-epic',
  legendary: 'bg-rarity-legendary/20 text-rarity-legendary',
};

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-badge
        font-medium
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${BADGE_VARIANTS[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

interface StatBoxProps {
  type: 'attack' | 'defense' | 'range';
  value: number;
  size?: 'sm' | 'md';
}

const STAT_CONFIG = {
  attack: { label: 'ATK', color: 'text-stat-attack', bg: 'bg-stat-attack/10', iconPath: 'M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z' },
  defense: { label: 'DEF', color: 'text-stat-defense', bg: 'bg-stat-defense/10', iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  range: { label: 'RNG', color: 'text-stat-range', bg: 'bg-stat-range/10', iconPath: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v8l6 3' },
};

export function StatBox({ type, value, size = 'md' }: StatBoxProps) {
  const config = STAT_CONFIG[type];
  
  return (
    <div className={`${config.bg} rounded-btn p-2 text-center ${size === 'sm' ? 'min-w-[3rem]' : 'min-w-[4rem]'}`}>
      <div className={`font-mono font-bold text-lg ${config.color}`}>{value}</div>
      <div className="text-text-muted text-[10px] uppercase tracking-wider">{config.label}</div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4 text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary text-sm max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
