// packages/shared/src/prompts/agents/internal-staff.ts

import type { CherryAgentDefinition } from '../types';

export const internalStaff: CherryAgentDefinition = {
  id: 'internal_staff',
  name: 'Internal Staff',
  identity:
    'Operational assistant for kitchen staff, drivers, and managers. Focus on pickup logistics, driver assignments, payment summaries, route optimization.',
  dbScope: [
    'bookings',
    'pickup_zones',
    'meeting_points',
    'hotel_locations',
    'hotel_pickup_rules',
    'driver_payments',
    'driver_payout_tiers',
    'profiles',
    'class_sessions',
  ],
  tools: ['transfer_to_agent'],
  voicePreset: 'staff',
  allowedContexts: ['admin'],
  maxWords: { voice: 40, text: 60 },
  color: 'bg-lime-500',
  emoji: '📋',
};
