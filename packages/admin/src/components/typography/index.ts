/**
 * Typography System Components
 *
 * Centralized typography components for consistent styling across the app.
 * Supports light and dark mode out of the box.
 *
 * @example
 * import { Heading, Paragraph, Caption, SectionTitle, Numeric } from '@/components/typography';
 *
 * <Heading level="h1">Welcome</Heading>
 * <Paragraph size="lg">Introduction text</Paragraph>
 * <Caption>Updated 2 hours ago</Caption>
 * <SectionTitle as="h3">Pax count</SectionTitle>
 *
 * Badge e Label NON stanno qui: vivono in ui/badge/Badge e form/Label (i doppioni
 * in questa cartella avevano zero import e sono stati rimossi il 2026-08-28).
 */

export { default as Heading } from './Heading';
export { default as Paragraph } from './Paragraph';
export { default as Caption } from './Caption';
export { default as SectionTitle } from './SectionTitle';
export { default as Numeric, type NumericVariant } from './Numeric';
