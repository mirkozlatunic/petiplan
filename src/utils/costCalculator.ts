import type { AminoAcidEntry, CustomMaterial, Machine, LaborRole, PhaseConfig, GmpStatus, ScaleOption } from '../types';

export function scaleToGrams(scale: ScaleOption, customGrams: number): number {
  const map: Record<string, number> = {
    '1g': 1,
    '5g': 5,
    '10g': 10,
    '50g': 50,
    '100g': 100,
    '500g': 500,
    '1kg': 1000,
  };
  if (scale === 'custom') return customGrams;
  return map[scale] ?? 10;
}

/** Returns the product of all phase yields as a decimal (e.g. 0.726 for 72.6% cumulative yield). */
export function calculateCumulativeYield(phases: PhaseConfig[]): number {
  if (phases.length === 0) return 1;
  return phases.reduce((y, p) => y * (p.yieldPercent / 100), 1);
}

export interface MaterialsCostResult {
  aaCost: number;
  couplingCost: number;
  resinCost: number;
  customCost: number;
  otherMaterialsCost: number;
  ptmCost: number;
  totalMaterialsCost: number;
}

export function calculateMaterialsCost(
  aminoAcids: AminoAcidEntry[],
  resinCostPerGram: number,
  scaleGrams: number,
  customMaterials: CustomMaterial[],
  otherMaterials: CustomMaterial[] = [],
  ptmCostPerBatch: number = 0,
): MaterialsCostResult {
  const aaCost = aminoAcids.reduce((sum, aa) => sum + aa.subtotal, 0);
  const couplingCost = aaCost * 0.30;
  const resinCost = resinCostPerGram * scaleGrams;
  const customCost = customMaterials.reduce((sum, m) => sum + m.subtotal, 0);
  const otherMaterialsCost = otherMaterials.reduce((sum, m) => sum + m.subtotal, 0);
  return {
    aaCost,
    couplingCost,
    resinCost,
    customCost,
    otherMaterialsCost,
    ptmCost: ptmCostPerBatch,
    totalMaterialsCost: aaCost + couplingCost + resinCost + customCost + otherMaterialsCost + ptmCostPerBatch,
  };
}

export interface MachineCostResult {
  perMachine: { id: string; name: string; totalCost: number }[];
  totalMachineCost: number;
}

export function calculateMachineCost(
  machines: Machine[],
  batchCount: number,
): MachineCostResult {
  const perMachine = machines.map((m) => ({
    id: m.id,
    name: m.name,
    totalCost: m.costPerBatch * batchCount,
  }));
  return {
    perMachine,
    totalMachineCost: perMachine.reduce((sum, m) => sum + m.totalCost, 0),
  };
}

export interface LaborCostResult {
  perRole: { id: string; name: string; totalCost: number; fte: number }[];
  totalLaborCost: number;
  totalPersonHours: number;
  totalFte: number;
  gmpOverheadCost: number; // extra cost due to GMP 15% uplift; 0 for non-GMP
}

export function calculateLaborCost(
  laborRoles: LaborRole[],
  batchCount: number,
  gmpStatus: GmpStatus = 'non-gmp',
): LaborCostResult {
  const gmpMultiplier = gmpStatus === 'gmp' ? 1.15 : 1.0;
  const perRole = laborRoles.map((r) => ({
    id: r.id,
    name: r.name,
    totalCost: r.costPerBatch * batchCount * gmpMultiplier,
    fte: (r.hoursPerBatch * r.headcount * batchCount) / 2080,
  }));
  const baseLaborCost = laborRoles.reduce((sum, r) => sum + r.costPerBatch * batchCount, 0);
  const gmpOverheadCost = gmpStatus === 'gmp' ? baseLaborCost * 0.15 : 0;
  const totalPersonHours = laborRoles.reduce(
    (sum, r) => sum + r.hoursPerBatch * r.headcount * batchCount,
    0,
  );
  return {
    perRole,
    totalLaborCost: perRole.reduce((sum, r) => sum + r.totalCost, 0),
    totalPersonHours,
    totalFte: totalPersonHours / 2080,
    gmpOverheadCost,
  };
}

export interface TotalCostResult {
  totalCost: number;
  costPerBatch: number;
  /** Cost per gram of deliverable product (after yield losses). */
  costPerGram: number;
  /** Grams of product actually recovered after all phase yield losses. */
  deliverableGrams: number;
  /** Combined yield of all phases as a decimal (0–1). */
  cumulativeYield: number;
}

export function calculateTotalCost(
  materialsCost: number,
  machineCost: number,
  laborCost: number,
  batchCount: number,
  scaleGrams: number,
  cumulativeYield: number = 1,
): TotalCostResult {
  const totalCost = materialsCost + machineCost + laborCost;
  const deliverableGrams = scaleGrams * Math.max(0, Math.min(1, cumulativeYield));
  const totalDeliverableGrams = deliverableGrams * batchCount;
  return {
    totalCost,
    costPerBatch: batchCount > 0 ? totalCost / batchCount : 0,
    costPerGram: totalDeliverableGrams > 0 ? totalCost / totalDeliverableGrams : 0,
    deliverableGrams,
    cumulativeYield,
  };
}

export interface MarginResult {
  revenue: number;
  grossProfit: number;
  marginPercent: number;
}

export function calculateMargin(
  totalCost: number,
  sellingPricePerGram: number,
  deliverableGrams: number,
  batchCount: number,
): MarginResult {
  const totalDeliverableGrams = deliverableGrams * batchCount;
  const revenue = sellingPricePerGram * totalDeliverableGrams;
  const grossProfit = revenue - totalCost;
  const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  return { revenue, grossProfit, marginPercent };
}
