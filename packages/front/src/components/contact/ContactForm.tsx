import React, { useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../i18n';
import { Typography, Icon, Button } from '../ui';

/**
 * ContactForm — form Contact Us: INSERT in contact_messages (RLS anon insert).
 * Persistenza prima di tutto: il messaggio è salvato anche se la notifica email
 * (edge, dominio /email) non è ancora attiva. Honeypot invisibile anti-spam.
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return; // bot: campo honeypot compilato → scarta in silenzio
    if (!name.trim() || !email.includes('@') || message.trim().length < 10) {
      setStatus('error');
      setFeedback(t('contact:form.required'));
      return;
    }
    setStatus('sending');
    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim(),
      topic,
      message: message.trim(),
    });
    if (error) {
      console.error('[ContactForm] insert:', error);
      setStatus('error');
      setFeedback(t('contact:form.error'));
      return;
    }
    setStatus('success');
    setFeedback(t('contact:form.success'));
    setName(''); setEmail(''); setMessage('');
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
