import { ThemeProvider } from './context/ThemeContext';
import { ProjectProvider, useProjectState } from './context/ProjectContext';
import Header from './components/layout/Header';
import SectionWrapper from './components/layout/SectionWrapper';
import type { SectionStatus } from './components/layout/SectionWrapper';
import ProjectSetupPanel from './components/project/ProjectSetupPanel';
import MaterialsCalculator from './components/materials/MaterialsCalculator';
import OtherMaterialsCalculator from './components/materials/OtherMaterialsCalculator';
import MachineCalculator from './components/machines/MachineCalculator';
import LaborCalculator from './components/labor/LaborCalculator';
import CapacityTimeline from './components/timeline/CapacityTimeline';
import ReviewPage from './components/review/ReviewPage';
import MobileSummaryBar from './components/layout/MobileSummaryBar';
import { Settings, FlaskRound, Beaker, Cpu, Users, Calendar, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { useMemo, useState, useRef, useCallback } from 'react';

export type Page = 'builder' | 'review';

export interface SectionStatuses {
  projectSetup: SectionStatus;
  materials: SectionStatus;
  otherMaterials: SectionStatus;
  machines: SectionStatus;
  labor: SectionStatus;
  timeline: SectionStatus;
}

const SECTION_IDS = {
  projectSetup: 'section-project-setup',
  materials: 'section-materials',
  otherMaterials: 'section-other-materials',
  machines: 'section-machines',
  labor: 'section-labor',
  timeline: 'section-timeline',
} as const;

export type SectionKey = keyof typeof SECTION_IDS;

const SECTION_LABELS: Record<SectionKey, string> = {
  projectSetup: 'Project Setup',
  materials: 'Amino Acid & Starting Materials',
  otherMaterials: 'Other Materials & Consumables',
  machines: 'Machine / Equipment',
  labor: 'Labor',
  timeline: 'Capacity Timeline',
};

function useProjectStatus(): SectionStatuses {
  const state = useProjectState();

  return useMemo(() => {
    const projectSetup: SectionStatus =
      state.projectName.trim() !== '' &&
      state.sequence.trim() !== '' &&
      state.batchCount >= 1 &&
      state.startDate !== '' &&
      state.targetEndDate !== ''
        ? 'complete'
        : 'incomplete';

    const materials: SectionStatus =
      state.parsedAminoAcids.length > 0 ? 'complete' : 'incomplete';

    const otherMaterials: SectionStatus =
      state.otherMaterials.length > 0 ? 'complete' : 'incomplete';

    const machines: SectionStatus =
      state.machines.length > 0 ? 'complete' : 'incomplete';

    const labor: SectionStatus =
      state.laborRoles.length > 0 ? 'complete' : 'incomplete';

    const timeline: SectionStatus =
      state.startDate !== '' && state.targetEndDate !== '' && state.machines.length > 0 && state.phases.length > 0
        ? 'complete'
        : 'incomplete';

    return { projectSetup, materials, otherMaterials, machines, labor, timeline };
  }, [state]);
}

function BuilderPage({ onNavigateToReview }: { onNavigateToReview: () => void }) {
  const status = useProjectStatus();
  const [warning, setWarning] = useState<string | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const allComplete = Object.values(status).every((s) => s === 'complete');

  const handleReviewClick = useCallback(() => {
    if (allComplete) {
      onNavigateToReview();
      return;
    }

    // Find first incomplete section
    const sectionKeys: SectionKey[] = ['projectSetup', 'materials', 'otherMaterials', 'machines', 'labor', 'timeline'];
    const firstIncomplete = sectionKeys.find((key) => status[key] === 'incomplete');

    if (firstIncomplete) {
      const label = SECTION_LABELS[firstIncomplete];
      setWarning(`Please complete "${label}" before proceeding to review.`);

      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => setWarning(null), 4000);

      const el = document.getElementById(SECTION_IDS[firstIncomplete]);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Flash the section
        el.classList.add('ring-2', 'ring-warning', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-warning', 'ring-offset-2'), 2000);
      }
    }
  }, [allComplete, status, onNavigateToReview]);

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div id={SECTION_IDS.projectSetup} className="scroll-mt-20 rounded-xl transition-all duration-300">
          <SectionWrapper title="Project Setup" icon={<Settings className="w-5 h-5" />} defaultOpen={true} status={status.projectSetup}>
            <ProjectSetupPanel />
          </SectionWrapper>
        </div>

        <div id={SECTION_IDS.materials} className="scroll-mt-20 rounded-xl transition-all duration-300">
          <SectionWrapper title="Amino Acid & Starting Materials" icon={<FlaskRound className="w-5 h-5" />} defaultOpen={true} status={status.materials}>
            <MaterialsCalculator />
          </SectionWrapper>
        </div>

        <div id={SECTION_IDS.otherMaterials} className="scroll-mt-20 rounded-xl transition-all duration-300">
          <SectionWrapper title="Other Materials & Consumables" icon={<Beaker className="w-5 h-5" />} defaultOpen={true} status={status.otherMaterials}>
            <OtherMaterialsCalculator />
          </SectionWrapper>
        </div>

        <div id={SECTION_IDS.machines} className="scroll-mt-20 rounded-xl transition-all duration-300">
          <SectionWrapper title="Machine / Equipment" icon={<Cpu className="w-5 h-5" />} defaultOpen={true} status={status.machines}>
            <MachineCalculator />
          </SectionWrapper>
        </div>

        <div id={SECTION_IDS.labor} className="scroll-mt-20 rounded-xl transition-all duration-300">
          <SectionWrapper title="Labor" icon={<Users className="w-5 h-5" />} defaultOpen={true} status={status.labor}>
            <LaborCalculator />
          </SectionWrapper>
        </div>

        <div id={SECTION_IDS.timeline} className="scroll-mt-20 rounded-xl transition-all duration-300">
          <SectionWrapper title="Capacity Timeline" icon={<Calendar className="w-5 h-5" />} defaultOpen={true} status={status.timeline}>
            <CapacityTimeline />
          </SectionWrapper>
        </div>

        {/* Review button */}
        <div className="pt-4">
          {warning && (
            <div className="mb-3 flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {warning}
            </div>
          )}
          <button
            onClick={handleReviewClick}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl transition-colors ${
              allComplete
                ? 'text-white bg-accent-500 hover:bg-accent-600 shadow-lg shadow-accent-500/25'
                : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            Review Cost Summary
          </button>
        </div>
      </main>

      <MobileSummaryBar />
    </>
  );
}

function AppContent() {
  const [page, setPage] = useState<Page>('builder');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16 md:pb-0">
      {page === 'builder' ? (
        <BuilderPage onNavigateToReview={() => { setPage('review'); window.scrollTo(0, 0); }} />
      ) : (
        <ReviewPage onBack={() => { setPage('builder'); window.scrollTo(0, 0); }} onEditSection={(section: SectionKey) => {
          setPage('builder');
          requestAnimationFrame(() => {
            const el = document.getElementById(SECTION_IDS[section]);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }} />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;
