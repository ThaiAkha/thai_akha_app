import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../i18n';
import { Typography, Icon, Button } from '../ui';
import { renderTurnstile, turnstileConfigured, type TurnstileHandle } from '../../lib/turnstile';
import { useLanguage } from '../../context/LanguageContext';

/**
 * ContactForm — form Contact Us.
 *
 * Dal 2026-09-09 NON scrive piu' in tabella: manda alla edge `submit-contact`,
 * che verifica il gettone Cloudflare Turnstile, rivalida le lunghezze e
 * inserisce col service role. Prima l'INSERT era diretto con la chiave anon, e
 * un captcha qui sarebbe stato decorativo: chi abusa chiama l'API REST, non il
 * form. La policy `anon can insert` viene tolta dopo il deploy di entrambi.
 * L'esca invisibile resta: costa nulla e ferma i robot piu' semplici prima
 * ancora della verifica.
 */

type Topic = 'general' | 'agency' | 'press' | 'other';
type Status = 'idle' | 'sending' | 'success' | 'error';

const TOPICS: { key: Topic; label: string; icon: string }[] = [
  { key: 'general', label: t('contact:form.topicTraveller'), icon: 'travel_explore' },
  { key: 'agency', label: t('contact:form.topicAgency'), icon: 'business_center' },
  { key: 'press', label: t('contact:form.topicPress'), icon: 'photo_camera' },
  { key: 'other', label: t('contact:form.topicOther'), icon: 'chat_bubble' },
];

const FIELD =
  'w-full font-sans text-title bg-[var(--field-fill)] border-[1.5px] border-[var(--field-border)] rounded-xl [padding:var(--space-fluid-s)] min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ocean-blue)] transition-colors';

export const ContactForm: React.FC<{ className?: string }> = ({ className }) => {
  const [topic, setTopic] = useState<Topic>('general');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot: gli umani non lo vedono
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');
  const [token, setToken] = useState('');
  const { lang } = useLanguage();
  const widgetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<TurnstileHandle | null>(null);

  // Il widget si disegna una volta sola, quando il form e' sullo schermo. Se la
  // chiave pubblica non c'e' ancora (o lo script non arriva) il form resta
  // usabile: e' la edge a decidere, e senza gettone rifiuta solo se il segreto
  // e' configurato dall'altra parte.
  useEffect(() => {
    if (!turnstileConfigured() || !widgetRef.current || handleRef.current) return;
    let alive = true;
    renderTurnstile(widgetRef.current, setToken, lang)
      .then((h) => { if (alive) handleRef.current = h; else h.remove(); })
      .catch((err) => console.warn('[ContactForm] turnstile non disponibile:', err));
    return () => { alive = false; };
  }, [lang]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return; // bot: campo honeypot compilato → scarta in silenzio
    if (!name.trim() || !email.includes('@') || message.trim().length < 10) {
      setStatus('error');
      setFeedback(t('contact:form.required'));
      return;
    }
    setStatus('sending');
    const { data, error } = await supabase.functions.invoke('submit-contact', {
      body: { name: name.trim(), email: email.trim(), topic, message: message.trim(), website, token },
    });
    if (error || !(data as { ok?: boolean } | null)?.ok) {
      console.error('[ContactForm] submit-contact:', error);
      setStatus('error');
      setFeedback(t('contact:form.error'));
      handleRef.current?.reset();
      setToken('');
      return;
    }
    setStatus('success');
    setFeedback(t('contact:form.success'));
    setName(''); setEmail(''); setMessage('');
    // Un gettone vale un invio: si riparte con uno nuovo per il messaggio dopo.
    handleRef.current?.reset();
    setToken('');
  };

  return (
    <form onSubmit={submit} className={cn('flex flex-col [gap:var(--space-fluid-m)]', className)} noValidate>
      {/* Topic — chip selector */}
      <div className="flex flex-col [gap:var(--space-fluid-xs)]">
        <Typography as="span" variant="microLabel" color="muted" className="uppercase tracking-widest">
          {t('contact:form.writingAs')}
        </Typography>
        <div className="flex flex-wrap [gap:var(--space-fluid-xs)]">
          {TOPICS.map(tp => (
            <button
              key={tp.key}
              type="button"
              onClick={() => setTopic(tp.key)}
              aria-pressed={topic === tp.key}
              className={cn(
                'inline-flex items-center [gap:var(--space-fluid-2xs)] rounded-full border-[1.5px] [padding:var(--space-fluid-xs)_var(--space-fluid-m)] min-h-[44px] font-semibold text-sm transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ocean-blue)]',
                topic === tp.key
                  ? 'border-ocean-blue bg-ocean-blue/10 text-deep-ocean'
                  : 'border-border text-sub hover:border-ocean-blue/40'
              )}
            >
              <Icon name={tp.icon} size="sm" className={topic === tp.key ? 'text-ocean-blue' : 'text-muted'} />
              {tp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-s)]">
        <div className="flex flex-col [gap:var(--space-fluid-2xs)]">
          <label htmlFor="cf-name">
            <Typography as="span" variant="microLabel" color="muted" className="uppercase tracking-widest">
              {t('contact:form.nameLabel')}
            </Typography>
          </label>
          <input id="cf-name" value={name} onChange={e => setName(e.target.value)}
            placeholder={t('contact:form.namePlaceholder')} autoComplete="name" className={FIELD} />
        </div>
        <div className="flex flex-col [gap:var(--space-fluid-2xs)]">
          <label htmlFor="cf-email">
            <Typography as="span" variant="microLabel" color="muted" className="uppercase tracking-widest">
              {t('contact:form.emailLabel')}
            </Typography>
          </label>
          <input id="cf-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder={t('contact:form.emailPlaceholder')} autoComplete="email" className={FIELD} />
        </div>
      </div>

      <div className="flex flex-col [gap:var(--space-fluid-2xs)]">
        <label htmlFor="cf-msg">
          <Typography as="span" variant="microLabel" color="muted" className="uppercase tracking-widest">
            {t('contact:form.messageLabel')}
          </Typography>
        </label>
        <textarea id="cf-msg" value={message} onChange={e => setMessage(e.target.value)}
          placeholder={t('contact:form.messagePlaceholder')} rows={5}
          className={cn(FIELD, 'resize-y min-h-[130px]')} />
      </div>

      {/* Honeypot — invisibile agli umani, i bot lo compilano */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={e => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none h-0 w-0"
      />

      {/* Verifica anti-abuso: il riquadro resta vuoto finche' la chiave pubblica
          non e' configurata nel pannello Cloudflare. */}
      <div ref={widgetRef} className="[margin-block:var(--space-fluid-xs)]" />

      {/* Submit + feedback */}
      <div className="flex flex-wrap items-center justify-between [gap:var(--space-fluid-s)]">
        {feedback ? (
          <Typography
            variant="paragraphS"
            className={cn('flex items-center [gap:var(--space-fluid-2xs)]', status === 'success' ? 'text-sys-success' : 'text-sys-error')}
            role="status"
          >
            <Icon name={status === 'success' ? 'check_circle' : 'error'} size="sm" />
            {feedback}
          </Typography>
        ) : <span />}
        <Button
          variant="btn-s"
          size="md"
          icon="send"
          iconPosition="right"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? t('contact:form.sending') : t('contact:form.send')}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
