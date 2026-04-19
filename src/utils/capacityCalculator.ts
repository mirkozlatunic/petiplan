import type { Machine, PhaseConfig } from '../types';

export interface BottleneckResult {
  machineId: string | null;
  machineName: string;
  effectiveHoursPerBatch: number;
}

export function detectBottleneck(machines: Machine[]): BottleneckResult | null {
  if (machines.length === 0) return null;

  let worst: Machine | null = null;
  let worstEffective = 0;

  for (const m of machines) {
    // Guard against division by zero: machines with 0 utilization are excluded from bottleneck detection
    const denominator = m.unitsAvailable * m.utilization;
    if (denominator <= 0) continue;
    const effective = m.hoursPerBatch / denominator;
    if (effective > worstEffective) {
      worstEffective = effective;
      worst = m;
    }
  }

  if (!worst) return null;
  return {
    machineId: worst.id,
    machineName: worst.name,
    effectiveHoursPerBatch: worstEffective,
  };
}

export interface BatchPhase {
  phase: string;
  label: string;
  startDay: number;
  endDay: number;
  color: string;
  exceedsTarget: boolean;
}

export interface BatchTimeline {
  batchNumber: number;
  phases: BatchPhase[];
}

export function generateTimeline(
  phases: PhaseConfig[],
  batchCount: number,
  startDate: string,
  targetEndDate: string,
): { batches: BatchTimeline[]; totalDays: number; exceedsTarget: boolean } {
  const totalPhaseDays = phases.reduce((sum, p) => sum + p.daysPerBatch, 0);

  // Only compute targetDays when both dates are present and valid
  let targetDays: number | null = null;
  if (targetEndDate && startDate) {
    const diff = Math.ceil(
      (new Date(targetEndDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff > 0) targetDays = diff;
  }

  const batches: BatchTimeline[] = [];
  for (let i = 0; i < batchCount; i++) {
    const batchStart = i * totalPhaseDays;
    let dayOffset = batchStart;
    const batchPhases: BatchPhase[] = [];

    for (const phase of phases) {
      const endDay = dayOffset + phase.daysPerBatch;
      batchPhases.push({
        phase: phase.phase,
        label: phase.label,
        startDay: dayOffset,
        endDay,
        color: phase.color,
        exceedsTarget: targetDays !== null ? endDay > targetDays : false,
      });
      dayOffset = endDay;
    }
    batches.push({ batchNumber: i + 1, phases: batchPhases });
  }

  const totalDays = batchCount * totalPhaseDays;
  return {
    batches,
    totalDays,
    exceedsTarget: targetDays !== null ? totalDays > targetDays : false,
  };
}

export function estimatedCompletionDays(phases: PhaseConfig[], batchCount: number): number {
  const totalPhaseDays = phases.reduce((sum, p) => sum + p.daysPerBatch, 0);
  return batchCount * totalPhaseDays;
}
