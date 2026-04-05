import React, { useState } from 'react';
import { Typography, Icon, Toggle, Badge, Button } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

interface MegaMenuCardProps {
  initialDiet: string;
  initialAllergies: string[];
  initialSpiciness?: string | number;
  spicinessOptions?: any[];
  allergyOptions: string[];
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
  groupedDiets,
  onConfirm,
}) => {
  // Draft state — local until Confirm is clicked. Discarded on menu close without confirm.
  const [draftDiet, setDraftDiet] = useState(initialDiet);
  const [draftAllergies, setDraftAllergies] = useState<string[]>([...initialAllergies]);
  const [draftSpiciness, setDraftSpiciness] = useState(initialSpiciness);
  const [showAllergySection, setShowAllergySection] = useState(initialAllergies.length > 0);

  // Sync state if props change (e.g. after profile save or fetch)
  React.useEffect(() => {
    setDraftDiet(initialDiet);
    setDraftAllergies([...initialAllergies]);
    setDraftSpiciness(initialSpiciness);
    setShowAllergySection(initialAllergies.length > 0);
  }, [initialDiet, initialAllergies, initialSpiciness]);

  const isDirty =
    draftDiet !== initialDiet ||
    draftSpiciness !== initialSpiciness ||
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

  const canConfirm = isDirty && !!draftDiet;

  const handleConfirm = () => {
    if (canConfirm) onConfirm(draftDiet, draftAllergies, draftSpiciness);
  };

  const internalSpiceLevels = spicinessOptions || [];

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
              <button
                key={allergen}
                onClick={() => toggleAllergy(allergen)}
                className={cn(
                  "w-full flex items-center justify-center py-2 px-2.5 rounded-xl border transition-all text-xs font-black tracking-widest",
                  draftAllergies.includes(allergen)
                    ? "bg-allergy text-white border-allergy shadow-lg"
                    : "bg-surface border-border text-gray-400 hover:border-allergy/50 hover:text-allergy"
                )}
              >
                {allergen}
              </button>
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
                <button
                  key={diet.id}
                  onClick={() => setDraftDiet(diet.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left",
                    draftDiet === diet.id
                      ? "bg-action/10 text-action border-action shadow-inner font-bold"
                      : "bg-surface border-border text-gray-600 dark:text-gray-400 hover:border-action/50"
                  )}
                >
                  <span className="text-xl leading-none">{diet.icon}</span>
                  <span className="truncate text-sm font-black uppercase tracking-widest leading-none pt-0.5">{diet.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cultural column */}
          <div className="space-y-3">
            <Typography variant="h6" color="sub">Cultural:</Typography>
            <div className="grid grid-cols-1 gap-3">
              {groupedDiets.culture.map((diet) => (
                <button
                  key={diet.id}
                  onClick={() => setDraftDiet(diet.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left",
                    draftDiet === diet.id
                      ? "bg-action/10 text-action border-action shadow-inner font-bold"
                      : "bg-surface border-border text-gray-600 dark:text-gray-400 hover:border-action/50"
                  )}
                >
                  <span className="text-xl leading-none">{diet.icon}</span>
                  <span className="truncate text-sm font-black uppercase tracking-widest leading-none pt-0.5">{diet.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Spiciness Section ── */}
      <div id="spiciness-section" className="space-y-4 pt-8 border-t border-white/10">
        <Typography variant="h6" color="sub">Dish Spiciness:</Typography>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {internalSpiceLevels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setDraftSpiciness(lvl.id)}
              className={cn(
                "flex flex-col items-center justify-center p-4 gap-2 rounded-2xl border transition-all text-center",
                String(draftSpiciness) === String(lvl.id)
                  ? "bg-action/10 text-action border-action shadow-inner"
                  : "bg-surface border-border text-gray-500 hover:border-action/50 hover:text-action"
              )}
            >
              <Icon name={lvl.icon || 'local_fire_department'} size="md" />
              <Typography variant="badge" color="inherit" className="leading-none pt-0.5">{lvl.title}</Typography>
            </button>
          ))}
        </div>
      </div>

      {/* ── Confirm Button ── */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <Button
          variant={canConfirm ? 'action' : 'outline'}
          size="lg"
          className={cn("w-full transition-all duration-300", !canConfirm && "opacity-50 grayscale")}
          onClick={handleConfirm}
          disabled={!canConfirm}
        >
          {!draftDiet ? (
            <>
              <Icon name="info" size="lg" className="mr-2" />
              Select a Dietary Style
            </>
          ) : !isDirty ? (
            <>
              <Icon name="tune" size="lg" className="mr-2" />
              No changes to save
            </>
          ) : (
            <>
              <Icon name="check_circle" size="lg" className="mr-2" />
              Confirm Selection
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MegaMenuCard;
