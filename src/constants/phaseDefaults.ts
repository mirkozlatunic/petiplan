import type { Phase, PhaseConfig } from '../types';

export const DEFAULT_PHASES: PhaseConfig[] = [
  { phase: 'synthesis',      label: 'Synthesis',      daysPerBatch: 3, color: '#1E3A5F', yieldPercent: 98 },
  { phase: 'cleavage',       label: 'Cleavage',       daysPerBatch: 1, color: '#DC2626', yieldPercent: 95 },
  { phase: 'purification',   label: 'Purification',   daysPerBatch: 2, color: '#0D9488', yieldPercent: 80 },
  { phase: 'lyophilization', label: 'Lyophilization', daysPerBatch: 2, color: '#F59E0B', yieldPercent: 97 },
  { phase: 'qc',             label: 'QC/Analysis',    daysPerBatch: 1, color: '#8B5CF6', yieldPercent: 100 },
];

// Used when loading old saved projects that pre-date the yieldPercent field
export const DEFAULT_YIELD_BY_PHASE: Record<Phase, number> = {
  synthesis:      98,
  cleavage:       95,
  purification:   80,
  lyophilization: 97,
  qc:             100,
};
