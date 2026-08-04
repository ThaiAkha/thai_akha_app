import React from 'react';
import { Typography, Icon, Button } from '../ui';
import type { FAQItem, FAQLink } from '@thaiakha/shared/types';
import { handleFaqAnswerClick } from './faqLinkNav';

// ─── Props ───────────────────────────────────────────────────────────────────

interface FAQRichAnswerProps {
    item: FAQItem;
    onNavigate: (page: string, topic?: string, section?: string) => void;
}

// ─── Inline Link ──────────────────────────────────────────────────────────────

const FAQLinkItem: React.FC<{
    link: FAQLink;
    onNavigate: (page: string, topic?: string, section?: string) => void;
}> = ({ link, onNavigate }) => {
    const inner = (
        <span className="inline-flex items-center [gap:var(--space-fluid-2xs)] group">
            <Icon
                name={link.type === 'external' ? 'external-link' : 'arrow-right'}
                size="xs"
                color="ocean-blue"
                className="shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
            />
            <Typography variant="paragraphS" color="ocean-blue">
                {link.label}
            </Typography>
        </span>
    );

    if (link.type === 'external') {
        return (
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75 transition-opacity"
            >
                {inner}
            </a>
        );
    }

    return (
        <button
            onClick={() => onNavigate(link.page!, undefined, link.section)}
            className="text-left hover:opacity-75 transition-opacity"
        >
            {inner}
        </button>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const FAQRichAnswer: React.FC<FAQRichAnswerProps> = ({ item, onNavigate }) => {
    const hasLinks = item.links && item.links.length > 0;
    // Bottone CTA solo con label+page: il payload cta puo' contenere solo links
    // (unificazione colonna links -> cta.links, 2026-07).
    const hasCta = Boolean(item.cta?.label && item.cta?.page);

    return (
        <div className="flex flex-col [gap:var(--space-fluid-s)]">

            {/* Answer text — le answer DB contengono HTML inline (<a>, <b>…):
                stesso rendering di FaqBottomPage, link stilati ocean via [&_a].
                Click delegato sui link interni → SPA navigation (no full reload). */}
            <div onClick={(e) => handleFaqAnswerClick(e, onNavigate)}>
                <Typography
                    variant="paragraphM"
                    color="default"
                    className="[&_b]:font-bold [&_strong]:font-bold [&_em]:italic [&_i]:italic [&_a]:font-bold [&_a]:text-ocean-blue [&_a]:no-underline hover:[&_a]:opacity-75 [&_a]:transition-opacity [&_a]:cursor-pointer"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                />
            </div>

            {/* Inline reference links */}
            {hasLinks && (
                <div className="flex flex-col [gap:var(--space-fluid-2xs)] [padding-top:var(--space-fluid-2xs)]">
                    {item.links!.map((link, i) => (
                        <FAQLinkItem key={i} link={link} onNavigate={onNavigate} />
                    ))}
                </div>
            )}

            {/* CTA Button */}
            {hasCta && (
                <div className="[padding-top:var(--space-fluid-xs)]">
                    <Button
                        variant={item.cta!.variant ?? 'social'}
                        size="sm"
                        icon={item.cta!.icon}
                        iconPosition="right"
                        onClick={() => onNavigate(item.cta!.page!, undefined, item.cta!.section)}
                    >
                        {item.cta!.label}
                    </Button>
                </div>
            )}

        </div>
    );
};

export default FAQRichAnswer;
