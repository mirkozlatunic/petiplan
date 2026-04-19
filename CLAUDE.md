# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PeptiPlan is a client-side peptide manufacturing capacity and cost planning tool for pharma/biotech operations. It is a single-page React application with no backend — all state is ephemeral and persisted to `localStorage`.

## Commands

```bash
npm run dev       # Start Vite dev server at localhost:5173
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint check (flat config, strict TypeScript rules)
npm run preview   # Preview production build locally
```

There are no tests. TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`) serves as the primary correctness gate — `npm run build` must pass clean.

## Architecture

### State Management

State flows through a single React Context with `useReducer`. There are two separated contexts to avoid unnecessary re-renders:

- `ProjectStateContext` — read-only state
- `ProjectDispatchContext` — dispatch only

Access them via `useProjectState()` and `useProjectDispatch()` hooks defined in `src/context/ProjectContext.tsx`. All mutations go through `src/reducers/projectReducer.ts`.

### Two-Page Navigation

`App.tsx` manages navigation between two views:
- **Builder** (`page === 'builder'`): The main form with 6 collapsible sections (project setup, materials, machines, labor, timeline, dashboard)
- **Review** (`page === 'review'`): Full cost breakdown with PDF export

Transitioning to review requires all 6 sections to pass validation. On failure, the app smooth-scrolls to the first incomplete section.

### Calculation Layer

**Always use `useProjectCosts()` in components** (`src/hooks/useProjectCosts.ts`) — it provides all cost results with full `useMemo` memoization and is the single source of truth for rendered cost data.

Pure utility functions handle domain logic:

- `src/utils/costCalculator.ts` — material, machine, and labor cost calculations; GMP overhead; yield-adjusted `costPerGram`; PTM costs
- `src/utils/capacityCalculator.ts` — timeline and throughput calculations
- `src/utils/sequenceParser.ts` — parses peptide sequences (single-letter codes or FASTA format) into per-residue amino acid counts
- `src/utils/storage.ts` — versioned `localStorage` save/load (schema version 2)

### Key Domain Concepts

- **GMP mode**: when `gmpStatus === 'gmp'`, `calculateLaborCost()` applies a 15% multiplier and `laborCost.gmpOverheadCost` shows the extra amount.
- **Yield tracking**: each `PhaseConfig` has a `yieldPercent` (0–100). `calculateCumulativeYield(phases)` returns the combined decimal yield. `TotalCostResult.costPerGram` and `deliverableGrams` are based on deliverable product, not input grams.
- **PTM modifications**: `ProjectState.ptmModifications` holds selected post-translational mods. Their `costDelta` is included in `calculateMaterialsCost()` as a `ptmCostPerBatch` argument.
- **Bidirectional phase/machine sync**: updating machine hours syncs the linked phase duration; updating phase days syncs linked machine hours.
- **Coupling reagent cost** is derived as 30% of total amino acid cost, not entered directly.
- **Sequence input**: FASTA headers (`>…`) and multi-line sequences are stripped automatically in `sequenceParser.ts`. Dispatch is debounced 300ms in `ProjectSetupPanel.tsx`.

### Constants & Presets

`src/constants/` contains pre-configured options for:
- `aminoAcids.ts` — 20 amino acids with tier classification (common/moderate/expensive) and default costs
- `machinePresets.ts`, `laborPresets.ts` — pre-built machine/labor selections
- `phaseDefaults.ts` — 5 synthesis phases with default durations, colors, and yield percentages; also exports `DEFAULT_YIELD_BY_PHASE` for migration
- `ptmPresets.ts` — common PTM presets (acetylation, amidation, disulfide, phosphorylation, PEGylation) with cost and time deltas

### Shared UI Components

- `src/components/ui/Delta.tsx` — renders a cost delta with trend icon and percent change; used in `ComparisonPanel` and `ReviewPage`
- `src/components/ui/Card.tsx` — standard card wrapper

## Tech Stack

- React 19 + TypeScript (strict) + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin) — custom `@theme` color variables defined in `src/index.css`
- `cn()` helper at `src/lib/utils.ts` (clsx + tailwind-merge)
- Recharts for pie chart and Gantt visualization
- framer-motion for animated UI elements
- html2canvas-pro + jsPDF for PDF export (`src/hooks/usePdfExport.ts`)
- Path alias: `@/` → `src/`
