import React from 'react';
import { Typography, Icon } from '../ui/index';

interface RecipeMetaBarProps {
  servings?: string;
  prepTimeMin?: number;
  cookTimeMin?: number;
  difficulty?: string;
  spiceLevel?: string;
}

const RecipeMetaBar: React.FC<RecipeMetaBarProps> = ({
  servings, prepTimeMin, cookTimeMin, difficulty, spiceLevel,
}) => {
  const total = (prepTimeMin || 0) + (cookTimeMin || 0);
  const hasAny = servings || prepTimeMin || cookTimeMin || difficulty || spiceLevel;
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap justify-center [gap:var(--space-fluid-xs)] [padding-top:var(--space-fluid-l)] [padding-bottom:var(--space-fluid-m)]">

      {servings && (
        <div className="flex items-center [gap:var(--space-fluid-2xs)] [padding:var(--space-fluid-2xs)_var(--space-fluid-xs)] rounded-full bg-action/10 border border-action/20">
          <Icon name="group" size="xs" className="text-action" />
          <Typography variant="caption" className="text-action uppercase tracking-wider font-bold not-italic">Serves: {servings}</Typography>
        </div>
      )}

      {prepTimeMin ? (
        <div className="flex items-center [gap:var(--space-fluid-2xs)] [padding:var(--space-fluid-2xs)_var(--space-fluid-xs)] rounded-full bg-action/10 border border-action/20">
          <Icon name="schedule" size="xs" className="text-action" />
          <Typography variant="caption" className="text-action uppercase tracking-wider font-bold not-italic">Prep: {prepTimeMin} min</Typography>
        </div>
      ) : null}

      {cookTimeMin ? (
        <div className="flex items-center [gap:var(--space-fluid-2xs)] [padding:var(--space-fluid-2xs)_var(--space-fluid-xs)] rounded-full bg-action/10 border border-action/20">
          <Icon name="whatshot" size="xs" className="text-action" />
          <Typography variant="caption" className="text-action uppercase tracking-wider font-bold not-italic">Cook: {cookTimeMin} min</Typography>
        </div>
      ) : null}

      {total > 0 && (
        <div className="flex items-center [gap:var(--space-fluid-2xs)] [padding:var(--space-fluid-2xs)_var(--space-fluid-xs)] rounded-full bg-action/10 border border-action/20">
          <Icon name="timer" size="xs" className="text-action" />
          <Typography variant="caption" className="text-action uppercase tracking-wider font-bold not-italic">
            Total: {total} min
          </Typography>
        </div>
      )}

      {difficulty && (
        <div className="flex items-center [gap:var(--space-fluid-2xs)] [padding:var(--space-fluid-2xs)_var(--space-fluid-xs)] rounded-full bg-action/10 border border-action/20">
          <Icon name="signal_cellular_alt" size="xs" className="text-action" />
          <Typography variant="caption" className="text-action uppercase tracking-wider font-bold not-italic">Level: {difficulty}</Typography>
        </div>
      )}

      {spiceLevel && (
        <div className="flex items-center [gap:var(--space-fluid-2xs)] [padding:var(--space-fluid-2xs)_var(--space-fluid-xs)] rounded-full bg-action/10 border border-action/20">
          <Icon name="local_fire_department" size="xs" className="text-action" />
          <Typography variant="caption" className="text-action uppercase tracking-wider font-bold not-italic">Spice: {spiceLevel}</Typography>
        </div>
      )}

    </div>
  );
};

export default RecipeMetaBar;
