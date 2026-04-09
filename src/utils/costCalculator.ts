import type { AminoAcidEntry, CustomMaterial, Machine, LaborRole, ScaleOption } from '../types';

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

export interface MaterialsCostResult {
  aaCost: number;
  couplingCost: number;
  resinCost: number;
  customCost: number;
  totalMaterialsCost: number;
}

export function calculateMaterialsCost(
  aminoAcids: AminoAcidEntry[],
  resinCostPerGram: number,
  scaleGrams: number,
  customMaterials: CustomMaterial[],
): MaterialsCostResult {
  const aaCost = aminoAcids.reduce((sum, aa) => sum + aa.subtotal, 0);
  const couplingCost = aaCost * 0.30;
  const resinCost = resinCostPerGram * scaleGrams;
  const customCost = customMaterials.reduce((sum, m) => sum + m.subtotal, 0);
  return {
    aaCost,
    couplingCost,
    resinCost,
    customCost,
    totalMaterialsCost: aaCost + couplingCost + resinCost + customCost,
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
}

export function calculateLaborCost(
  laborRoles: LaborRole[],
  batchCount: number,
): LaborCostResult {
  const perRole = laborRoles.map((r) => ({
    id: r.id,
    name: r.name,
    totalCost: r.costPerBatch * batchCount,
    fte: (r.hoursPerBatch * r.headcount * batchCount) / 2080,
  }));
  const totalPersonHours = laborRoles.reduce(
    (sum, r) => sum + r.hoursPerBatch * r.headcount * batchCount,
    0,
  );
  return {
    perRole,
    totalLaborCost: perRole.reduce((sum, r) => sum + r.totalCost, 0),
    totalPersonHours,
    totalFte: totalPersonHours / 2080,
  };
}

export interface TotalCostResult {
  totalCost: number;
  costPerBatch: number;
  costPerGram: number;
}

export function calculateTotalCost(
  materialsCost: number,
  machineCost: number,
  laborCost: number,
  batchCount: number,
  scaleGrams: number,
): TotalCostResult {
  const totalCost = materialsCost + machineCost + laborCost;
  const totalGrams = scaleGrams * batchCount;
  return {
    totalCost,
    costPerBatch: batchCount > 0 ? totalCost / batchCount : 0,
    costPerGram: totalGrams > 0 ? totalCost / totalGrams : 0,
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
  scaleGrams: number,
  batchCount: number,
): MarginResult {
  const totalGrams = scaleGrams * batchCount;
  const revenue = sellingPricePerGram * totalGrams;
  const grossProfit = revenue - totalCost;
  const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  return { revenue, grossProfit, marginPercent };
}
