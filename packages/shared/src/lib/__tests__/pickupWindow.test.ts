import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickupWindowSpan, classTimeSpan } from '../pickupWindow';

const ZONES = [
  { morning_pickup_time: '08:40:00', morning_pickup_end: '09:00:00', evening_pickup_time: '16:40:00', evening_pickup_end: '17:00:00' },
  { morning_pickup_time: '08:30:00', morning_pickup_end: '09:00:00', evening_pickup_time: '16:30:00', evening_pickup_end: '17:00:00' },
  { morning_pickup_time: '08:20:00', morning_pickup_end: '08:40:00', evening_pickup_time: '16:20:00', evening_pickup_end: '16:40:00' },
  { morning_pickup_time: null, morning_pickup_end: null, evening_pickup_time: null, evening_pickup_end: null }, // walk-in
];

test('finestra complessiva: prima partenza, ultimo arrivo, zone senza finestra ignorate', () => {
  assert.equal(pickupWindowSpan(ZONES, 'morning'), '08:20 - 09:00');
  assert.equal(pickupWindowSpan(ZONES, 'evening'), '16:20 - 17:00');
});

test('nessuna zona con finestra: stringa vuota, niente numeri inventati', () => {
  assert.equal(pickupWindowSpan([ZONES[3]], 'morning'), '');
  assert.equal(pickupWindowSpan([], 'evening'), '');
});

test('orario classe dalla sessione', () => {
  assert.equal(classTimeSpan('17:00:00', '21:00:00'), '17:00 - 21:00');
  assert.equal(classTimeSpan('09:00:00', null), '09:00');
  assert.equal(classTimeSpan(null, null), '');
});
