import type { ProjectState, ScaleOption, GmpStatus, AminoAcidEntry, CustomMaterial, Machine, LaborRole, CostSnapshot, Phase, PtmModification } from '../types';
import { parseSequence, recalcAminoAcid } from '../utils/sequenceParser';
import { scaleToGrams } from '../utils/costCalculator';
import { DEFAULT_PHASES, DEFAULT_YIELD_BY_PHASE } from '../constants/phaseDefaults';

export const initialState: ProjectState = {
  projectName: '',
  gmpStatus: 'non-gmp',
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
  otherMaterials: [],
  machines: [],
  laborRoles: [],
  phases: DEFAULT_PHASES,
  previousSnapshot: null,
  sellingPricePerGram: 0,
  ptmModifications: [],
};

export type ProjectAction =
  | { type: 'SET_PROJECT_NAME'; payload: string }
  | { type: 'SET_GMP_STATUS'; payload: GmpStatus }
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
  | { type: 'ADD_OTHER_MATERIAL'; payload: Omit<CustomMaterial, 'id' | 'subtotal'> }
  | { type: 'UPDATE_OTHER_MATERIAL'; payload: { id: string; updates: Partial<CustomMaterial> } }
  | { type: 'REMOVE_OTHER_MATERIAL'; payload: string }
  | { type: 'ADD_MACHINE'; payload: Omit<Machine, 'id' | 'costPerBatch'> }
  | { type: 'UPDATE_MACHINE'; payload: { id: string; updates: Partial<Machine> } }
  | { type: 'REMOVE_MACHINE'; payload: string }
  | { type: 'ADD_LABOR_ROLE'; payload: Omit<LaborRole, 'id' | 'costPerBatch' | 'fte'> }
  | { type: 'UPDATE_LABOR_ROLE'; payload: { id: string; updates: Partial<LaborRole> } }
  | { type: 'REMOVE_LABOR_ROLE'; payload: string }
  | { type: 'UPDATE_PHASE'; payload: { phase: Phase; daysPerBatch: number } }
  | { type: 'UPDATE_PHASE_YIELD'; payload: { phase: Phase; yieldPercent: number } }
  | { type: 'SAVE_SNAPSHOT'; payload: CostSnapshot }
  | { type: 'SET_SELLING_PRICE'; payload: number }
  | { type: 'ADD_PTM'; payload: Omit<PtmModification, 'id'> }
  | { type: 'REMOVE_PTM'; payload: string }
  | { type: 'LOAD_PROJECT'; payload: ProjectState }
  | { type: 'RESET_PROJECT' };

function reparse(state: ProjectState): AminoAcidEntry[] {
  const grams = scaleToGrams(state.scale, state.customScaleGrams);
  const result = parseSequence(state.sequence, grams, state.couplingExcessFactor);

  // O(n) lookup with a Map instead of O(n²) Array.find
  const costMap = new Map(state.parsedAminoAcids.map((e) => [e.code, e.costPerGram]));

  return result.entries.map((newEntry) => {
    const existingCost = costMap.get(newEntry.code);
    if (existingCost !== undefined) {
      return recalcAminoAcid(
        { ...newEntry, costPerGram: existingCost },
        grams,
        state.couplingExcessFactor,
      );
    }
    return newEntry;
  });
}

function computeMachineCost(m: Partial<Machine> & { hourlyCost: number; hoursPerBatch: number }): number {
  return Math.max(0, m.hourlyCost) * Math.max(0, m.hoursPerBatch);
}

function computeLaborCost(r: Partial<LaborRole> & { hourlyRate: number; hoursPerBatch: number; headcount: number }): number {
  return Math.max(0, r.hourlyRate) * Math.max(0, r.hoursPerBatch) * Math.max(1, r.headcount);
}

function computeFte(r: { hoursPerBatch: number; headcount: number }, batchCount: number): number {
  return (Math.max(0, r.hoursPerBatch) * Math.max(1, r.headcount) * batchCount) / 2080;
}

export function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.payload };

    case 'SET_GMP_STATUS':
      return { ...state, gmpStatus: action.payload };

    case 'SET_SEQUENCE': {
      const newState = { ...state, sequence: action.payload };
      newState.parsedAminoAcids = reparse(newState);
      return newState;
    }

    case 'SET_BATCH_COUNT': {
      const newState = { ...state, batchCount: Math.max(1, Math.floor(action.payload)) };
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
      const newState = { ...state, customScaleGrams: Math.max(0.1, Math.min(1_000_000, action.payload)) };
      newState.parsedAminoAcids = reparse(newState);
      return newState;
    }

    case 'SET_START_DATE':
      return { ...state, startDate: action.payload };

    case 'SET_TARGET_END_DATE':
      return { ...state, targetEndDate: action.payload };

    case 'SET_COUPLING_EXCESS_FACTOR': {
      const newState = { ...state, couplingExcessFactor: Math.max(1, Math.min(100, action.payload)) };
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
              { ...aa, costPerGram: Math.max(0, action.payload.costPerGram) },
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
      return { ...state, resinCostPerGram: Math.max(0, action.payload) };

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

    case 'ADD_OTHER_MATERIAL': {
      const newMaterial: CustomMaterial = {
        ...action.payload,
        id: crypto.randomUUID(),
        subtotal: action.payload.quantity * action.payload.costPerUnit,
      };
      return { ...state, otherMaterials: [...state.otherMaterials, newMaterial] };
    }

    case 'UPDATE_OTHER_MATERIAL': {
      return {
        ...state,
        otherMaterials: state.otherMaterials.map((m) => {
          if (m.id === action.payload.id) {
            const updated = { ...m, ...action.payload.updates };
            updated.subtotal = updated.quantity * updated.costPerUnit;
            return updated;
          }
          return m;
        }),
      };
    }

    case 'REMOVE_OTHER_MATERIAL':
      return {
        ...state,
        otherMaterials: state.otherMaterials.filter((m) => m.id !== action.payload),
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
      const updatedMachines = state.machines.map((m) => {
        if (m.id === action.payload.id) {
          const updated = { ...m, ...action.payload.updates };
          updated.costPerBatch = computeMachineCost(updated);
          return updated;
        }
        return m;
      });

      // Sync: if hoursPerBatch changed on a machine with a linkedPhase, update that phase's daysPerBatch
      const changedMachine = updatedMachines.find((m) => m.id === action.payload.id);
      let updatedPhases = state.phases;
      if (
        changedMachine?.linkedPhase &&
        action.payload.updates.hoursPerBatch !== undefined
      ) {
        updatedPhases = state.phases.map((p) =>
          p.phase === changedMachine.linkedPhase
            ? { ...p, daysPerBatch: Math.max(0.5, Math.round((changedMachine.hoursPerBatch / 24) * 2) / 2) }
            : p,
        );
      }

      return { ...state, machines: updatedMachines, phases: updatedPhases };
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
      const newDays = Math.max(0.5, action.payload.daysPerBatch);
      const newPhases = state.phases.map((p) =>
        p.phase === action.payload.phase ? { ...p, daysPerBatch: newDays } : p,
      );

      // Sync: update hoursPerBatch on all machines linked to this phase
      const newHours = newDays * 24;
      const syncedMachines = state.machines.map((m) => {
        if (m.linkedPhase === action.payload.phase) {
          const updated = { ...m, hoursPerBatch: newHours };
          updated.costPerBatch = computeMachineCost(updated);
          return updated;
        }
        return m;
      });

      return { ...state, phases: newPhases, machines: syncedMachines };
    }

    case 'UPDATE_PHASE_YIELD': {
      const clampedYield = Math.max(0, Math.min(100, action.payload.yieldPercent));
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.phase === action.payload.phase ? { ...p, yieldPercent: clampedYield } : p,
        ),
      };
    }

    case 'SAVE_SNAPSHOT':
      return { ...state, previousSnapshot: action.payload };

    case 'SET_SELLING_PRICE':
      return { ...state, sellingPricePerGram: Math.max(0, action.payload) };

    case 'ADD_PTM': {
      const newPtm: PtmModification = {
        ...action.payload,
        id: crypto.randomUUID(),
      };
      return { ...state, ptmModifications: [...state.ptmModifications, newPtm] };
    }

    case 'REMOVE_PTM':
      return { ...state, ptmModifications: state.ptmModifications.filter((p) => p.id !== action.payload) };

    case 'LOAD_PROJECT': {
      const loaded = action.payload;
      // Migrate old saves: ensure phases have yieldPercent and ptmModifications exists
      const migratedPhases = loaded.phases.map((p) => ({
        ...p,
        yieldPercent: p.yieldPercent ?? DEFAULT_YIELD_BY_PHASE[p.phase] ?? 95,
      }));
      return {
        ...initialState,
        ...loaded,
        phases: migratedPhases,
        ptmModifications: loaded.ptmModifications ?? [],
      };
    }

    case 'RESET_PROJECT':
      return initialState;

    default:
      return state;
  }
}
