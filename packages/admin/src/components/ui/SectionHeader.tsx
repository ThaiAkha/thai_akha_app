import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import SectionTitle from '../typography/SectionTitle';

interface SectionHeaderProps {
    title: string;
    className?: string;
    variant?: 'sidebar' | 'inspector' | 'title' | 'default' | 'formfield';
}

/**
 * Guscio sopra `typography/SectionTitle`, tenuto per non toccare i 65 call-site.
 * NON e' un secondo titolo di sezione: la resa la decide SectionTitle, qui restano
 * solo tono e margini per variante.
 *
 * Dal 2026-08-29 le varianti `title`, `sidebar` e `inspector` NON sono piu' a
 * `text-xs`: erano 12px contro il floor di 14 dello standard planner, cioe' questo
 * componente violava la regola che i suoi titoli dovrebbero rappresentare. La
 * variante `inspector` usava anche `text-gray-600` grezzo (4.33, sotto AA): ora
 * eredita `text-sub`.
 *
 * `formfield` resta un ramo a se': non e' un titolo di sezione ma un'ETICHETTA di
 * form (normal-case, tracking normale), usata da InputField / TextArea / SelectField.
 * Candidata a passare a `form/Label`, che e' il componente giusto per quel ruolo.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, className, variant = 'default' }) => {
    if (variant === 'formfield') {
        return (
            <h6 className={cn('text-sm font-bold normal-case tracking-normal text-sub mb-1.5', className)}>
                {title}
            </h6>
        );
    }

    const MARGIN: Record<'sidebar' | 'inspector' | 'title' | 'default', string> = {
        title: 'mb-0',
        sidebar: 'ml-1',   // mb-3 e' gia' il default di SectionTitle
        inspector: 'mb-1',
        default: 'mb-2',
    };

    return (
        <SectionTitle as="h6" tone={variant === 'title' ? 'body' : 'sub'} className={cn(MARGIN[variant], className)}>
            {title}
        </SectionTitle>
    );
};

export default SectionHeader;
