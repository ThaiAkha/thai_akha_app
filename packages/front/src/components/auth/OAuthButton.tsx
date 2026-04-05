import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

export type OAuthProvider = 'google' | 'facebook' | 'apple';

interface OAuthButtonProps {
  provider: OAuthProvider;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const PROVIDER_CONFIG: Record<OAuthProvider, {
  label: string;
  className: string;
  icon: React.ReactNode;
}> = {
  google: {
    label: 'Google',
    className: 'bg-white text-gray-800 border border-[#e5e5e5] hover:bg-gray-50',
    icon: (
      <svg aria-hidden="true" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <g>
          <path d="m0 0H512V512H0" fill="#fff" />
          <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
          <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
          <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
          <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
        </g>
      </svg>
    ),
  },
  facebook: {
    label: 'Facebook',
    className: 'bg-[#1A77F2] text-white border border-[#005fd8] hover:bg-[#005fd8]',
    icon: (
      <svg aria-hidden="true" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path fill="white" d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z" />
      </svg>
    ),
  },
  apple: {
    label: 'Apple',
    // bg-title text-surface = nero in light, bianco in dark — semantically correct for Apple brand
    className: 'bg-title text-surface border border-title hover:opacity-90',
    icon: (
      <svg aria-hidden="true" width="14" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1195 1195">
        <path fill="currentColor" d="M1006.933 812.8c-32 153.6-115.2 211.2-147.2 249.6-32 25.6-121.6 25.6-153.6 6.4-38.4-25.6-134.4-25.6-166.4 0-44.8 32-115.2 19.2-128 12.8-256-179.2-352-716.8 12.8-774.4 64-12.8 134.4 32 134.4 32 51.2 25.6 70.4 12.8 115.2-6.4 96-44.8 243.2-44.8 313.6 76.8-147.2 96-153.6 294.4 19.2 403.2zM802.133 64c12.8 70.4-64 224-204.8 230.4-12.8-38.4 32-217.6 204.8-230.4z" />
      </svg>
    ),
  },
};

const OAuthButton: React.FC<OAuthButtonProps> = ({ provider, onClick, disabled, className }) => {
  const config = PROVIDER_CONFIG[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Continue with ${config.label}`}
      className={cn(
        'flex items-center justify-center gap-1.5 w-full px-2 py-1.5 rounded-xl',
        'text-sm font-semibold transition-all duration-200',
        'hover:opacity-80 active:scale-[0.98] cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </button>
  );
};

export default OAuthButton;
