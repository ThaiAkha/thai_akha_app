import React, { useState } from 'react';
import { Button } from '../ui/index';
import { Typography } from '../ui/Typography';
import AkhaPixelLine from '../ui/AkhaPixelLine';
import { cn } from '@thaiakha/shared/lib/utils';
import { AllergySelector, DietSelector, SpicySelector } from '../menu';

interface MegaMenuCardProps {
  initialDiet: string;
  initialAllergies: string[];
  initialSpiciness?: string | number;
  spicinessOptions?: any[];
  allergyOptions: string[];
  allergyMap?: Record<string, string>;
  groupedDiets: {
    lifestyle: any[];
    culture: any[];
  };
  onConfirm: (diet: string, allergies: string[], spiciness?: string | number) => void;
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


  const canConfirm = isDirty && !!draftDiet;

  const handleConfirm = () => {
    if (canConfirm) onConfirm(draftDiet, draftAllergies, draftSpiciness);
  };

  const allDietOptions = [...groupedDiets.lifestyle, ...groupedDiets.culture];
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

      <AkhaPixelLine variant="line_divider" size={5} className="py-2" />

      {/* ── Diet Section ── */}
      <div id="diet-section" className="scroll-mt-24">
        <DietSelector
          options={allDietOptions}
          selected={draftDiet}
          onChange={setDraftDiet}
        />
      </div>

      <AkhaPixelLine variant="line_divider" size={5} className="py-2" />

      {/* ── Spiciness Section ── */}
      <div id="spiciness-section" className="scroll-mt-24">
        <SpicySelector
          options={spicinessOptions}
          selected={Number(draftSpiciness) || 0}
          onChange={(id) => setDraftSpiciness(id)}
        />
      </div>

      <AkhaPixelLine variant="line_divider" size={5} className="py-2" />

      {/* ── Confirm Button ── */}
      <div className="flex flex-col items-center gap-3">
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
        <Typography variant="paragraphS" color="muted" className="text-center max-w-sm leading-relaxed">
          Don't worry, you can change your data any time, and it would be fine for the teacher to keep following with your selection.
        </Typography>
      </div>
    </div>
  );
};

export default MegaMenuCard;
