import type { AminoAcidCode, AminoAcidEntry } from '../types';
import { AMINO_ACIDS, VALID_AA_CODES } from '../constants/aminoAcids';

export interface ParseResult {
  entries: AminoAcidEntry[];
  errors: string[];
  totalResidues: number;
}

export function parseSequence(
  sequence: string,
  scaleGrams: number,
  excessFactor: number,
): ParseResult {
  const cleaned = sequence.replace(/[\s\-\d]/g, '').toUpperCase();
  const errors: string[] = [];
  const counts = new Map<AminoAcidCode, number>();

  for (const char of cleaned) {
    if (VALID_AA_CODES.has(char)) {
      const code = char as AminoAcidCode;
      counts.set(code, (counts.get(code) || 0) + 1);
    } else {
      errors.push(`Invalid amino acid code: "${char}"`);
    }
  }

  const entries: AminoAcidEntry[] = [];
  for (const [code, count] of counts) {
    const info = AMINO_ACIDS[code];
    const gramsNeeded = scaleGrams * excessFactor * count;
    entries.push({
      code,
      name: info.name,
      tier: info.tier,
      count,
      costPerGram: info.defaultCostPerGram,
      gramsNeeded,
      subtotal: gramsNeeded * info.defaultCostPerGram,
    });
  }

  entries.sort((a, b) => {
    const order = cleaned.indexOf(a.code) - cleaned.indexOf(b.code);
    return order;
  });

  return {
    entries,
    errors: [...new Set(errors)],
    totalResidues: cleaned.length,
  };
}

export function recalcAminoAcid(
  entry: AminoAcidEntry,
  scaleGrams: number,
  excessFactor: number,
): AminoAcidEntry {
  const gramsNeeded = scaleGrams * excessFactor * entry.count;
  return {
    ...entry,
    gramsNeeded,
    subtotal: gramsNeeded * entry.costPerGram,
  };
}
