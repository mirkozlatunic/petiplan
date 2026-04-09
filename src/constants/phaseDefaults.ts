import type { PhaseConfig } from '../types';

export const DEFAULT_PHASES: PhaseConfig[] = [
  { phase: 'synthesis', label: 'Synthesis', daysPerBatch: 3, color: '#1E3A5F' },
  { phase: 'purification', label: 'Purification', daysPerBatch: 2, color: '#0D9488' },
  { phase: 'lyophilization', label: 'Lyophilization', daysPerBatch: 2, color: '#F59E0B' },
  { phase: 'qc', label: 'QC/Analysis', daysPerBatch: 1, color: '#8B5CF6' },
];
