export interface MachinePreset {
  name: string;
  hourlyCost: number;
  hoursPerBatch: number;
  unitsAvailable: number;
  utilization: number;
}

export const MACHINE_PRESETS: MachinePreset[] = [
  { name: 'Peptide Synthesizer', hourlyCost: 50, hoursPerBatch: 24, unitsAvailable: 1, utilization: 0.85 },
  { name: 'HPLC (Preparative)', hourlyCost: 75, hoursPerBatch: 16, unitsAvailable: 1, utilization: 0.85 },
  { name: 'HPLC (Analytical)', hourlyCost: 40, hoursPerBatch: 4, unitsAvailable: 1, utilization: 0.85 },
  { name: 'Lyophilizer', hourlyCost: 30, hoursPerBatch: 48, unitsAvailable: 1, utilization: 0.85 },
  { name: 'Rotary Evaporator', hourlyCost: 15, hoursPerBatch: 4, unitsAvailable: 1, utilization: 0.85 },
  { name: 'Reactor Vessel', hourlyCost: 35, hoursPerBatch: 8, unitsAvailable: 1, utilization: 0.85 },
];
