/**
 * ConfirmFooter
 * Sticky bottom action bar.
 * - New booking  → "Confirm Location"  (action variant)
 * - Edit mode    → "Update Booking"    (mineral variant)
 */

import React from 'react';
import { Button } from '../../ui';

interface ConfirmFooterProps {
  isEditMode: boolean;
  disabled: boolean;
  isLoading: boolean;
  onConfirm: () => void;
}

const ConfirmFooter: React.FC<ConfirmFooterProps> = ({
  isEditMode,
  disabled,
  isLoading,
  onConfirm,
}) => (
  <div className="p-6 md:p-8 bg-black/40 border-t border-white/10 shrink-0">
    <Button
      variant={isEditMode ? 'mineral' : 'action'}
      fullWidth
      size="lg"
      onClick={onConfirm}
      isLoading={isLoading}
      disabled={disabled}
      className="shadow-xl"
      icon={isEditMode ? 'save' : 'check_circle'}
    >
      {isEditMode ? 'Update Booking' : 'Confirm Location'}
    </Button>
  </div>
);

export default ConfirmFooter;
