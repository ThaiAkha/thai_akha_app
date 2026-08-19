import React, { useState } from 'react';
import { Button } from '../ui/index';
import { Typography } from '../ui/Typography';
import AkhaPixelLine from '../divider/AkhaPixelLine';
import { cn } from '@thaiakha/shared/lib/utils';
import { AllergySelector, DietSelector, SpicySelector } from '../menu';
import type { DietOption } from '../menu';
import type { SpicinessLevel } from '@thaiakha/shared/types';

/** Profilo dieta come arriva dal DB (dietary_profiles): `type` e' stringa libera, DietSelector la legge come 'lifestyle' | 'religious'. */
type MegaMenuDietOption = Omit<DietOption, 'type'> & { type?: string };

interface MegaMenuCardProps {
  initialDiet: string;
  initialAllergies: string[];
  initialSpiciness?: string | number;
  spicinessOptions?: SpicinessLevel[];
  allergyOptions: string[];
  allergyMap?: Record<string, string>;
  groupedDiets: {
    lifestyle: MegaMenuDietOption[];
    culture: MegaMenuDietOption[];
  };
  onConfirm: (diet: string, allergies: string[], spiciness?: string | number) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onClose?: () => void;
}

const MegaMenuCard: React.FC<MegaMenuCardProps> = ({
  initialDiet,
  initialAllergies,
  initialSpiciness,
  spicinessOptions,
  allergyOptions,
  allergyMap = {},
  groupedDiets,
  onConfirm,
  onDirtyChange,
  onClose,
}) => {
  // Draft state — local until Confirm is clicked. Discarded on menu close without confirm.
  const [draftDiet, setDraftDiet] = useState(initialDiet);
  const [draftAllergies, setDraftAllergies] = useState<string[]>([...initialAllergies]);
  const [draftSpiciness, setDraftSpiciness] = useState(initialSpiciness);

  // Sync state if props change (e.g. after profile save or fetch)
  React.useEffect(() => {
    setDraftDiet(initialDiet);
    setDraftAllergies([...initialAllergies]);
    setDraftSpiciness(initialSpiciness);
  }, [initialDiet, initialAllergies, initialSpiciness]);

  const isDirty =
    draftDiet !== initialDiet ||
    draftSpiciness !== initialSpiciness ||
    draftAllergies.length !== initialAllergies.length ||
    draftAllergies.some(a => !initialAllergies.includes(a));

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);


  const canConfirm = isDirty && !!draftDiet;

  const handleConfirm = () => {
    if (canConfirm) onConfirm(draftDiet, draftAllergies, draftSpiciness);
  };

  // `type` dal DB e' string: DietSelector la usa solo per confronto con 'lifestyle'/'religious' (come prima, via any).
  const allDietOptions = [...groupedDiets.lifestyle, ...groupedDiets.culture] as DietOption[];
  return (
    <div className="space-y-6">
      {/* ── Allergy Section ── */}
      <div id="allergy-section" className="scroll-mt-24">
        <AllergySelector  options={allergyOptions}
          selected={draftAllergies}
          onChange={setDraftAllergies}
          allergyMap={allergyMap}
          showInfoCards={false}
        />
      </div>

      <AkhaPixelLine size={6} className="py-2" />

      {/* ── Diet Section ── */}
      <div id="diet-section" className="scroll-mt-24">
        <DietSelector
          options={allDietOptions}
          selected={draftDiet}
          onChange={setDraftDiet}
        />
      </div>

      <AkhaPixelLine size={6} className="py-2" />

      {/* ── Spiciness Section ── */}
      <div id="spiciness-section" className="scroll-mt-24">
        <SpicySelector
          options={spicinessOptions}
          selected={Number(draftSpiciness) || 0}
          onChange={(id) => setDraftSpiciness(id)}
        />
      </div>

      <AkhaPixelLine size={6} className="py-2" />

      {/* ── Confirm / Close Buttons ── */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              icon="close"
            >
              Close
            </Button>
          )}
          <Button
            variant="action"
            size="md"
            className={cn("px-8 transition-all duration-300", !canConfirm && "opacity-50 grayscale")}
            onClick={handleConfirm}
            disabled={!canConfirm}
            icon="save"
          >
            Confirm Passport
          </Button>
        </div>
        <Typography variant="paragraphS" color="muted" className="text-center max-w-sm leading-relaxed">
          Don't worry, you can change your data any time, and it would be fine for the teacher to keep following with your selection.
        </Typography>
      </div>
    </div>
  );
};

export default MegaMenuCard;
