import React, { useState } from 'react';
import { Typography, Button, Icon } from '../ui';
import { createManagedProfile, addVisitorToBooking } from '@thaiakha/shared/services';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * F3.c — il leader porta un VISITOR a QUESTA classe. Crea il sotto-profilo visitor
 * gestito + lo associa al booking come participant via RPC `add_managed_participant`,
 * che applica i limiti (1/pagante · 2/booking · 4/classe) e li riporta come messaggio.
 */
const VisitorClassBlock: React.FC<{ bookingId: string | null }> = ({ bookingId }) => {
  const { refreshManaged } = useActiveProfile();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const disabled = !bookingId;

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed || !bookingId) return;
    setBusy(true);
    setMsg(null);

    const created = await createManagedProfile({ fullName: trimmed, profileKind: 'visitor' });
    if (!created.success || !created.profileId) {
      setBusy(false);
      setMsg({ ok: false, text: created.message ?? 'Could not create the visitor profile.' });
      return;
    }

    const added = await addVisitorToBooking(bookingId, created.profileId);
    setBusy(false);
    refreshManaged();
    if (added.success) {
      setName('');
      setMsg({ ok: true, text: `${trimmed} is coming as a visitor.` });
    } else {
      // Limite superato o errore: la RPC riporta il motivo.
      setMsg({ ok: false, text: added.message ?? 'Could not add the visitor.' });
    }
  };

  return (
    <div className={cn(
      'rounded-3xl bg-surface border border-border [padding:var(--space-fluid-m)]',
      disabled && 'opacity-50 pointer-events-none',
    )}>
      <div className="flex items-center gap-3 mb-2">
        <Icon name="visibility" className="text-sub" />
        <Typography variant="h5" color="title">Bring a visitor</Typography>
      </div>
      <Typography variant="paragraphS" color="muted" className="mb-4 leading-relaxed">
        Visitors watch &amp; taste — no cooking, no certificate. Limits: 1 per paying guest, 2 per booking, 4 per class.
      </Typography>
      <div className="flex flex-col sm:flex-row [gap:var(--space-fluid-2xs)]">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Visitor name"
          maxLength={60}
          onKeyDown={e => { if (e.key === 'Enter') void handleAdd(); }}
          className="flex-1 h-12 bg-surface-2 border border-border rounded-[var(--radius-input)] px-4 text-desc font-sans outline-none focus:border-primary/40"
        />
        <Button variant="brand" size="md" onClick={() => void handleAdd()} isLoading={busy} disabled={!name.trim()}>
          Add visitor
        </Button>
      </div>
      {msg && (
        <Typography variant="caption" color={msg.ok ? 'action' : 'primary'} className="mt-2 block">
          {msg.text}
        </Typography>
      )}
    </div>
  );
};

export default VisitorClassBlock;
