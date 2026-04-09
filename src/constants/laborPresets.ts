export interface LaborPreset {
  name: string;
  hourlyRate: number;
  hoursPerBatch: number;
  headcount: number;
}

export const LABOR_PRESETS: LaborPreset[] = [
  { name: 'Chemist', hourlyRate: 65, hoursPerBatch: 16, headcount: 1 },
  { name: 'Lab Technician', hourlyRate: 45, hoursPerBatch: 24, headcount: 2 },
  { name: 'QC Analyst', hourlyRate: 55, hoursPerBatch: 8, headcount: 1 },
  { name: 'Production Operator', hourlyRate: 40, hoursPerBatch: 20, headcount: 2 },
  { name: 'Project Manager', hourlyRate: 75, hoursPerBatch: 4, headcount: 1 },
];
