import React from 'react';
import { Lock, ExternalLink } from 'lucide-react';
import { Button, Typography } from '../ui';

const ADMIN_URL = (import.meta as any).env?.VITE_ADMIN_URL ?? 'https://admin.thaiakha.com';

const AccessDeniedView: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-6 bg-surface border border-border rounded-3xl">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-5">
      <Lock className="w-7 h-7 text-gray-500 dark:text-gray-500" />
    </div>
    <Typography variant="h4" color="title" className="mb-2">
      Operations Dashboard
    </Typography>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-sm leading-relaxed">
      Booking and reservation management is available in the Admin App.
    </p>
    <Button
      variant="outline"
      size="md"
      onClick={() => window.open(ADMIN_URL, '_blank')}
    >
      <ExternalLink className="w-4 h-4" />
      Manage in Admin App
    </Button>
  </div>
);

export default AccessDeniedView;
