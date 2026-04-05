import React from 'react';
import { Typography } from '../ui/index';
import OAuthButton from './OAuthButton';

interface SocialAuthButtonsProps {
  onGoogleClick?: () => void;
  onFacebookClick?: () => void;
  onAppleClick?: () => void;
  label?: string;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleClick,
  onFacebookClick,
  onAppleClick,
  label = 'Or continue with:',
}) => (
  <div className="flex flex-col gap-3">
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <Typography variant="caption" className="bg-surface/95 dark:bg-surface-overlay/80 px-3">
          {label}
        </Typography>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <OAuthButton provider="google" onClick={onGoogleClick} />
      <OAuthButton provider="facebook" onClick={onFacebookClick} />
      <OAuthButton provider="apple" onClick={onAppleClick} />
    </div>
  </div>
);

export default SocialAuthButtons;
