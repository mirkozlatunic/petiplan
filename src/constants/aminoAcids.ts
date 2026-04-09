import type { AminoAcidCode, CostTier } from '../types';

export interface AminoAcidInfo {
  code: AminoAcidCode;
  name: string;
  threeLetterCode: string;
  tier: CostTier;
  defaultCostPerGram: number;
}

export const AMINO_ACIDS: Record<AminoAcidCode, AminoAcidInfo> = {
  A: { code: 'A', name: 'Alanine', threeLetterCode: 'Ala', tier: 'common', defaultCostPerGram: 0.50 },
  G: { code: 'G', name: 'Glycine', threeLetterCode: 'Gly', tier: 'common', defaultCostPerGram: 0.50 },
  L: { code: 'L', name: 'Leucine', threeLetterCode: 'Leu', tier: 'common', defaultCostPerGram: 0.50 },
  V: { code: 'V', name: 'Valine', threeLetterCode: 'Val', tier: 'common', defaultCostPerGram: 0.50 },
  I: { code: 'I', name: 'Isoleucine', threeLetterCode: 'Ile', tier: 'common', defaultCostPerGram: 0.50 },
  F: { code: 'F', name: 'Phenylalanine', threeLetterCode: 'Phe', tier: 'common', defaultCostPerGram: 0.50 },
  P: { code: 'P', name: 'Proline', threeLetterCode: 'Pro', tier: 'common', defaultCostPerGram: 0.50 },
  D: { code: 'D', name: 'Aspartic Acid', threeLetterCode: 'Asp', tier: 'moderate', defaultCostPerGram: 1.00 },
  E: { code: 'E', name: 'Glutamic Acid', threeLetterCode: 'Glu', tier: 'moderate', defaultCostPerGram: 1.00 },
  K: { code: 'K', name: 'Lysine', threeLetterCode: 'Lys', tier: 'moderate', defaultCostPerGram: 1.00 },
  R: { code: 'R', name: 'Arginine', threeLetterCode: 'Arg', tier: 'moderate', defaultCostPerGram: 1.00 },
  S: { code: 'S', name: 'Serine', threeLetterCode: 'Ser', tier: 'moderate', defaultCostPerGram: 1.00 },
  T: { code: 'T', name: 'Threonine', threeLetterCode: 'Thr', tier: 'moderate', defaultCostPerGram: 1.00 },
  N: { code: 'N', name: 'Asparagine', threeLetterCode: 'Asn', tier: 'moderate', defaultCostPerGram: 1.00 },
  Q: { code: 'Q', name: 'Glutamine', threeLetterCode: 'Gln', tier: 'moderate', defaultCostPerGram: 1.00 },
  W: { code: 'W', name: 'Tryptophan', threeLetterCode: 'Trp', tier: 'moderate', defaultCostPerGram: 1.00 },
  C: { code: 'C', name: 'Cysteine', threeLetterCode: 'Cys', tier: 'expensive', defaultCostPerGram: 1.50 },
  M: { code: 'M', name: 'Methionine', threeLetterCode: 'Met', tier: 'expensive', defaultCostPerGram: 1.50 },
  H: { code: 'H', name: 'Histidine', threeLetterCode: 'His', tier: 'expensive', defaultCostPerGram: 1.50 },
  Y: { code: 'Y', name: 'Tyrosine', threeLetterCode: 'Tyr', tier: 'expensive', defaultCostPerGram: 1.50 },
};

export const VALID_AA_CODES = new Set(Object.keys(AMINO_ACIDS));
