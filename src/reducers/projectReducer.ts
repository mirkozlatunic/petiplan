import type { ProjectState, ScaleOption, AminoAcidEntry, CustomMaterial, Machine, LaborRole, CostSnapshot, Phase } from '../types';
import { parseSequence, recalcAminoAcid } from '../utils/sequenceParser';
import { scaleToGrams } from '../utils/costCalculator';
import { DEFAULT_PHASES } from '../constants/phaseDefaults';

export const initialState: ProjectState = {
  projectName: '',
  sequence: '',
  batchCount: 1,
  scale: '10g',
  customScaleGrams: 10,
  startDate: '',
  targetEndDate: '',
  parsedAminoAcids: [],
  couplingExcessFactor: 3,
  resinCostPerGram: 150,
  customMaterials: [],
  machines: [],
  laborRoles: [],
  phases: DEFAULT_PHASES,
  previousSnapshot: null,
  sellingPricePerGram: 0,
};

export type ProjectAction =
  | { type: 'SET_PROJECT_NAME'; payload: string }
  | { type: 'SET_SEQUENCE'; payload: string }
  | { type: 'SET_BATCH_COUNT'; payload: number }
  | { type: 'SET_SCALE'; payload: ScaleOption }
  | { type: 'SET_CUSTOM_SCALE'; payload: number }
  | { type: 'SET_START_DATE'; payload: string }
  | { type: 'SET_TARGET_END_DATE'; payload: string }
  | { type: 'SET_COUPLING_EXCESS_FACTOR'; payload: number }
  | { type: 'UPDATE_AA_COST'; payload: { code: string; costPerGram: number } }
  | { type: 'SET_RESIN_COST'; payload: number }
  | { type: 'ADD_CUSTOM_MATERIAL'; payload: Omit<CustomMaterial, 'id' | 'subtotal'> }
  | { type: 'UPDATE_CUSTOM_MATERIAL'; payload: { id: string; updates: Partial<CustomMaterial> } }
  | { type: 'REMOVE_CUSTOM_MATERIAL'; payload: string }
  | { type: 'ADD_MACHINE'; payload: Omit<Machine, 'id' | 'costPerBatch'> }
  | { type: 'UPDATE_MACHINE'; payload: { id: string; updates: Partial<Machine> } }
  | { type: 'REMOVE_MACHINE'; payload: string }
  | { type: 'ADD_LABOR_ROLE'; payload: Omit<LaborRole, 'id' | 'costPerBatch' | 'fte'> }
  | { type: 'UPDATE_LABOR_ROLE'; payload: { id: string; updates: Partial<LaborRole> } }
  | { type: 'REMOVE_LABOR_ROLE'; payload: string }
  | { type: 'UPDATE_PHASE'; payload: { phase: Phase; daysPerBatch: number } }
  | { type: 'SAVE_SNAPSHOT'; payload: CostSnapshot }
  | { type: 'SET_SELLING_PRICE'; payload: number }
  | { type: 'LOAD_PROJECT'; payload: ProjectState }
  | { type: 'RESET_PROJECT' };

function reparse(state: ProjectState): AminoAcidEntry[] {
  const grams = scaleToGrams(state.scale, state.customScaleGrams);
  const result = parseSequence(state.sequence, grams, state.couplingExcessFactor);

  return result.entries.map((newEntry) => {
    const existing = state.parsedAminoAcids.find((e) => e.code === newEntry.code);
    if (existing) {
      return recalcAminoAcid(
        { ...newEntry, costPerGram: existing.costPerGram },
        grams,
        state.couplingExcessFactor,
      );
    }
    return newEntry;
  });
}

function computeMachineCost(m: Partial<Machine> & { hourlyCost: number; hoursPerBatch: number }): number {
  return m.hourlyCost * m.hoursPerBatch;
}

function computeLaborCost(r: Partial<LaborRole> & { hourlyRate: number; hoursPerBatch: number; headcount: number }): number {
  return r.hourlyRate * r.hoursPerBatch * r.headcount;
}

function computeFte(r: { hoursPerBatch: number; headcount: number }, batchCount: number): number {
  return (r.hoursPerBatch * r.headcount * batchCount) / 2080;
}

export function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.payload };

    case 'SET_SEQUENCE': {
      const newState = { ...state, sequence: action.payload };
      newState.parsedAminoAcids = reparse(newState);
      return newState;
    }

    case 'SET_BATCH_COUNT': {
      const newState = { ...state, batchCount: Math.max(1, action.payload) };
      newState.laborRoles = newState.laborRoles.map((r) => ({
        ...r,
        fte: computeFte(r, newState.batchCount),
      }));
      return newState;
    }

    case 'SET_SCALE': {
      const newState = { ...state, scale: action.payload };
      newState.parsedAminoAcids = reparse(newState);
      return newState;
    }

    case 'SET_CUSTOM_SCALE': {
      const newState = { ...state, customScaleGrams: Math.max(0.1, action.payload) };
      newState.parsedAminoAcids = reparse(newState);
      return newState;
    }

    case 'SET_START_DATE':
      return { ...state, startDate: action.payload };

    case 'SET_TARGET_END_DATE':
      return { ...state, targetEndDate: action.payload };

    case 'SET_COUPLING_EXCESS_FACTOR': {
      const newState = { ...state, couplingExcessFactor: Math.max(1, action.payload) };
      newState.parsedAminoAcids = reparse(newState);
      return newState;
    }

    case 'UPDATE_AA_COST': {
      const newState = {
        ...state,
        parsedAminoAcids: state.parsedAminoAcids.map((aa) => {
          if (aa.code === action.payload.code) {
            const grams = scaleToGrams(state.scale, state.customScaleGrams);
            return recalcAminoAcid(
              { ...aa, costPerGram: action.payload.costPerGram },
              grams,
              state.couplingExcessFactor,
            );
          }
          return aa;
        }),
      };
      return newState;
    }

    case 'SET_RESIN_COST':
      return { ...state, resinCostPerGram: action.payload };

    case 'ADD_CUSTOM_MATERIAL': {
      const newMaterial: CustomMaterial = {
        ...action.payload,
        id: crypto.randomUUID(),
        subtotal: action.payload.quantity * action.payload.costPerUnit,
      };
      return { ...state, customMaterials: [...state.customMaterials, newMaterial] };
    }

    case 'UPDATE_CUSTOM_MATERIAL': {
      return {
        ...state,
        customMaterials: state.customMaterials.map((m) => {
          if (m.id === action.payload.id) {
            const updated = { ...m, ...action.payload.updates };
            updated.subtotal = updated.quantity * updated.costPerUnit;
            return updated;
          }
          return m;
        }),
      };
    }

    case 'REMOVE_CUSTOM_MATERIAL':
      return {
        ...state,
        customMaterials: state.customMaterials.filter((m) => m.id !== action.payload),
      };

    case 'ADD_MACHINE': {
      const newMachine: Machine = {
        ...action.payload,
        id: crypto.randomUUID(),
        costPerBatch: computeMachineCost(action.payload),
      };
      return { ...state, machines: [...state.machines, newMachine] };
    }

    case 'UPDATE_MACHINE': {
      return {
        ...state,
        machines: state.machines.map((m) => {
          if (m.id === action.payload.id) {
            const updated = { ...m, ...action.payload.updates };
            updated.costPerBatch = computeMachineCost(updated);
            return updated;
          }
          return m;
        }),
      };
    }

    case 'REMOVE_MACHINE':
      return { ...state, machines: state.machines.filter((m) => m.id !== action.payload) };

    case 'ADD_LABOR_ROLE': {
      const newRole: LaborRole = {
        ...action.payload,
        id: crypto.randomUUID(),
        costPerBatch: computeLaborCost(action.payload),
        fte: computeFte(action.payload, state.batchCount),
      };
      return { ...state, laborRoles: [...state.laborRoles, newRole] };
    }

    case 'UPDATE_LABOR_ROLE': {
      return {
        ...state,
        laborRoles: state.laborRoles.map((r) => {
          if (r.id === action.payload.id) {
            const updated = { ...r, ...action.payload.updates };
            updated.costPerBatch = computeLaborCost(updated);
            updated.fte = computeFte(updated, state.batchCount);
            return updated;
          }
          return r;
        }),
      };
    }

    case 'REMOVE_LABOR_ROLE':
      return { ...state, laborRoles: state.laborRoles.filter((r) => r.id !== action.payload) };

    case 'UPDATE_PHASE': {
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.phase === action.payload.phase
            ? { ...p, daysPerBatch: Math.max(0.5, action.payload.daysPerBatch) }
            : p,
        ),
      };
    }

    case 'SAVE_SNAPSHOT':
      return { ...state, previousSnapshot: action.payload };

    case 'SET_SELLING_PRICE':
      return { ...state, sellingPricePerGram: action.payload };

    case 'LOAD_PROJECT':
      return action.payload;

    case 'RESET_PROJECT':
      return initialState;

    default:
      return state;
  }
}
