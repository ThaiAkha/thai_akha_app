import React, { useState } from 'react';
import { Typography, Icon, Toggle, Badge, Button } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

interface MegaMenuCardProps {
  initialDiet: string;
  initialAllergies: string[];
  allergyOptions: string[];
  groupedDiets: {
    lifestyle: any[];
    culture: any[];
  };
  onConfirm: (diet: string, allergies: string[]) => void;
}

const MegaMenuCard: React.FC<MegaMenuCardProps> = ({
  initialDiet,
  initialAllergies,
  allergyOptions,
  groupedDiets,
  onConfirm,
}) => {
  // Draft state — local until Confirm is clicked. Discarded on menu close without confirm.
  const [draftDiet, setDraftDiet] = useState(initialDiet);
  const [draftAllergies, setDraftAllergies] = useState<string[]>([...initialAllergies]);
  const [showAllergySection, setShowAllergySection] = useState(initialAllergies.length > 0);

  const isDirty =
    draftDiet !== initialDiet ||
    showAllergySection !== (initialAllergies.length > 0) ||
    draftAllergies.length !== initialAllergies.length ||
    draftAllergies.some(a => !initialAllergies.includes(a));

  const toggleAllergy = (allergen: string) => {
    setDraftAllergies(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };

  const handleAllergySwitch = (val: boolean) => {
    setShowAllergySection(val);
    if (!val) setDraftAllergies([]);
  };

  const handleConfirm = () => {
    if (isDirty) onConfirm(draftDiet, draftAllergies);
  };

  return (
    <div className="space-y-6">
      {/* ── Allergy Section ── */}
      <div id="allergy-section" className="space-y-4 pb-8 border-b border-white/10 scroll-mt-24">
        <div className="flex justify-center">
          <div
            className="flex items-center justify-between gap-6 p-2 pl-5 pr-2 bg-allergy/5 border border-allergy/20 rounded-full cursor-pointer hover:bg-allergy/10 transition-colors shadow-sm"
            onClick={() => handleAllergySwitch(!showAllergySection)}
          >
            <div className="flex items-center gap-3">
              <Icon name="warning" size="sm" className={cn("hidden md:block text-allergy", draftAllergies.length > 0 ? "animate-pulse" : "")} />
              <Typography variant="badge" className="text-allergy">
                ALLERGIES
              </Typography>
            </div>
            <div onClick={e => e.stopPropagation()}>
              <Toggle checked={showAllergySection} onChange={handleAllergySwitch} />
            </div>
          </div>
        </div>

        {showAllergySection && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
            {allergyOptions.map((allergen) => (
              <Badge
                key={allergen}
                variant="allergy"
                active={draftAllergies.includes(allergen)}
                onClick={() => toggleAllergy(allergen)}
                className="w-full justify-center py-2 px-2 [&_span]:!text-xs [&_span]:!font-accent [&_span]:!tracking-widest"
              >
                {allergen}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── Diet Section: Lifestyle (left) / Cultural (right) ── */}
      <div id="diet-section" className="scroll-mt-24">
        <div className="grid grid-cols-2 gap-3">

          {/* Lifestyle column */}
          <div className="space-y-3">
            <Typography variant="h6" color="sub">Lifestyle:</Typography>
            <div className="grid grid-cols-1 gap-3">
              {groupedDiets.lifestyle.map((diet) => (
                <Badge
                  key={diet.id}
                  variant="diet"
                  active={draftDiet === diet.id}
                  onClick={() => setDraftDiet(diet.id)}
                  className="w-full justify-start"
                >
                  <span className="hidden pr-4 md:inline-block text-lg md:text-xl leading-none">{diet.icon}</span>
                  <span className="truncate inline-block md:hidden">{diet.name.split(' ')[0]}</span>
                  <span className="truncate hidden md:inline-block">{diet.name}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Cultural column */}
          <div className="space-y-3">
            <Typography variant="h6" color="sub">Cultural:</Typography>
            <div className="grid grid-cols-1 gap-3">
              {groupedDiets.culture.map((diet) => (
                <Badge
                  key={diet.id}
                  variant="diet"
                  active={draftDiet === diet.id}
                  onClick={() => setDraftDiet(diet.id)}
                  className="w-full justify-start"
                >
                  <span className="hidden pr-4 md:inline-block text-lg md:text-xl leading-none">{diet.icon}</span>
                  <span className="truncate inline-block md:hidden">{diet.name.split(' ')[0]}</span>
                  <span className="truncate hidden md:inline-block">{diet.name}</span>
                </Badge>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Confirm Button ── */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <Button
          variant={isDirty ? 'action' : 'secondary'}
          size="xl"
          className="w-full"
          onClick={handleConfirm}
        >
          {isDirty ? (
            <>
              <Icon name="check_circle" size="lg" className="mr-2" />
              Confirm Selection
            </>
          ) : (
            <>
              <Icon name="tune" size="lg" className="mr-2" />
              Make a selection to confirm
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MegaMenuCard;
