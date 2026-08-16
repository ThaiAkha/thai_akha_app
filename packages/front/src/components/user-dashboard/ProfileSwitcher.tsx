import React, { useState } from 'react';
import { Typography, Icon, Button } from '../ui/index';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { createManagedProfile } from '@thaiakha/shared/services';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * F2 — Account-switch. Chip per scegliere il "profilo attivo" (host o un suo
 * gestito) + creazione di un nuovo sotto-profilo minore (F2.d). La sessione auth
 * resta dell'host; cambia solo per chi vengono scritti menu/dieta/quiz.
 * Visibile per ogni host loggato (serve l'entry-point "Add" anche con 0 gestiti).
 */
const kindIcon = (isHost: boolean, kind: string): string =>
  isHost ? 'person' : kind === 'visitor' ? 'visibility' : 'child_care';

const ProfileSwitcher: React.FC = () => {
  const { host, managedProfiles, activeProfileId, setActiveProfile, refreshManaged } = useActiveProfile();
  const isRealHost = !!host && host.id !== 'guest';

  const [addKind, setAddKind] = useState<'minor' | 'visitor' | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isRealHost) return null;

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || !addKind) return;
    setSaving(true);
    setError(null);
    const res = await createManagedProfile({ fullName: trimmed, profileKind: addKind });
    setSaving(false);
    if (res.success && res.profileId) {
      setName('');
      setAddKind(null);
      refreshManaged();
      setActiveProfile(res.profileId);
    } else {
      setError(res.message ?? 'Could not create the profile.');
    }
  };

  const chips = [
    { id: host?.id ?? '', name: host?.full_name || 'You', kind: 'primary', isHost: true },
    ...managedProfiles.map(p => ({ id: p.id, name: p.full_name || 'Guest', kind: p.profile_kind, isHost: false })),
  ];

  return (
    <div className="rounded-3xl bg-surface border border-border [padding:var(--space-fluid-s)]">
      <Typography variant="caption" color="muted" className="mb-2 block">Acting as</Typography>

      <div className="flex flex-wrap [gap:var(--space-fluid-2xs)]">
        {chips.map(c => {
          const active = c.id === activeProfileId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveProfile(c.id)}
              aria-pressed={active}
              className={cn(
                'min-h-[44px] px-4 rounded-full flex items-center [gap:var(--space-fluid-2xs)] transition-colors',
                active ? 'bg-primary' : 'bg-surface-2 hover:opacity-80',
              )}
            >
              <Icon name={kindIcon(c.isHost, c.kind)} size="sm" className={active ? 'text-inverse' : 'text-sub'} />
              <Typography variant="accent" color={active ? 'inverse' : 'title'}>{c.name}</Typography>
            </button>
          );
        })}

        {!addKind && (
          <>
            <button
              type="button"
              onClick={() => setAddKind('minor')}
              className="min-h-[44px] px-4 rounded-full flex items-center [gap:var(--space-fluid-2xs)] bg-surface-2 hover:opacity-80 transition-colors"
            >
              <Icon name="child_care" size="sm" className="text-sub" />
              <Typography variant="accent" color="muted">Companion</Typography>
            </button>
            <button
              type="button"
              onClick={() => setAddKind('visitor')}
              className="min-h-[44px] px-4 rounded-full flex items-center [gap:var(--space-fluid-2xs)] bg-surface-2 hover:opacity-80 transition-colors"
            >
              <Icon name="visibility" size="sm" className="text-sub" />
              <Typography variant="accent" color="muted">Visitor</Typography>
            </button>
          </>
        )}
      </div>

      {addKind && (
        <div className="[margin-top:var(--space-fluid-xs)] flex flex-col [gap:var(--space-fluid-2xs)]">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={addKind === 'visitor' ? 'Visitor name' : 'Child or companion name'}
            maxLength={60}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') void handleCreate(); }}
            className="w-full h-12 bg-surface-2 border border-border rounded-[var(--radius-input)] px-4 text-desc font-sans outline-none focus:border-primary/40"
          />
          {addKind === 'visitor' && (
            <Typography variant="caption" color="muted">
              Visitors join the diet & quiz only — no menu, rewards or certificate.
            </Typography>
          )}
          {error && <Typography variant="caption" color="primary">{error}</Typography>}
          <div className="flex [gap:var(--space-fluid-2xs)]">
            <Button variant="brand" size="sm" onClick={() => void handleCreate()} isLoading={saving} disabled={!name.trim()}>
              {addKind === 'visitor' ? 'Add visitor' : 'Add companion'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setAddKind(null); setName(''); setError(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSwitcher;
