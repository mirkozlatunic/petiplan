export interface PtmPreset {
  name: string;
  costDelta: number;     // additional cost per batch ($)
  timeDeltaHours: number; // additional synthesis hours per batch
}

export const PTM_PRESETS: PtmPreset[] = [
  { name: 'N-terminal Acetylation',    costDelta: 150,  timeDeltaHours: 4  },
  { name: 'C-terminal Amidation',      costDelta: 200,  timeDeltaHours: 6  },
  { name: 'Disulfide Bond (1 pair)',   costDelta: 350,  timeDeltaHours: 12 },
  { name: 'Phosphorylation (1 site)',  costDelta: 500,  timeDeltaHours: 8  },
  { name: 'PEGylation (PEG2000)',      costDelta: 800,  timeDeltaHours: 16 },
];
