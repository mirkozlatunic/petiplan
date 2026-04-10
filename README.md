# PeptiPlan

Peptide manufacturing capacity and cost planning tool. Built for pharma/biotech operations teams to estimate production costs (labor, machine time, raw materials) and plan capacity timelines.

## Features

- **Project Setup** - Define project name, GMP/Non-GMP classification, batch count, scale, peptide sequence, and target dates
- **Amino Acid Calculator** - Parses peptide sequences, calculates material costs per residue with editable per-gram pricing, coupling reagents, and resin costs
- **Other Materials & Consumables** - Add solvents, silica gel, HPLC columns, and other items from presets or custom entries
- **Machine / Equipment Calculator** - Add equipment from presets (synthesizers, HPLC, lyophilizers, cleavage reactors, etc.), track hourly costs, utilization, and bottleneck detection
- **Labor Calculator** - Define roles with hourly rates, hours per batch, headcount, and automatic FTE calculation
- **Capacity Timeline** - Gantt-style chart with calendar dates, phase editor with bidirectional sync to machine hours, and target deadline tracking
- **Cost Review Page** - Full cost breakdown with KPI cards, pie chart, margin calculator, snapshot comparison, and per-section edit buttons
- **Export & Share** - PDF export (single-page, titled with project name/scale/GMP), clipboard copy, localStorage save/load
- **Dark Mode** - Full dark mode support with animated toggle
- **Responsive** - Mobile summary bar, collapsible sections, responsive grids

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Recharts (pie chart + Gantt timeline)
- jsPDF + html2canvas-pro (PDF export)
- framer-motion (theme toggle animation)
- lucide-react (icons)
- No backend - localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

## Project Structure

```
src/
  types/              Type definitions (ProjectState, Machine, LaborRole, etc.)
  constants/          Amino acid costs, machine presets, labor presets, phase defaults
  context/            ProjectContext (state + dispatch), ThemeContext
  reducers/           projectReducer with all state actions
  hooks/              usePdfExport
  utils/              sequenceParser, costCalculator, capacityCalculator, formatters, clipboard, storage
  components/
    layout/           Header, SectionWrapper, MobileSummaryBar
    project/          ProjectSetupPanel
    materials/        MaterialsCalculator, AminoAcidTable, CouplingResinSummary, CustomLineItem, OtherMaterialsCalculator
    machines/         MachineCalculator, MachineCard, BottleneckBadge
    labor/            LaborCalculator, LaborRoleCard
    dashboard/        CostPieChart, KpiCard, MarginCalculator, ComparisonPanel
    timeline/         CapacityTimeline, GanttChart, PhaseEditor
    review/           ReviewPage
    export/           ExportPanel
    ui/               Card, toggle-theme
```
