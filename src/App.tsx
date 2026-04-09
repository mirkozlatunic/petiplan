import { ThemeProvider } from './context/ThemeContext';
import { ProjectProvider, useProjectState, useProjectDispatch } from './context/ProjectContext';
import Header from './components/layout/Header';
import SectionWrapper from './components/layout/SectionWrapper';
import ProjectSetupPanel from './components/project/ProjectSetupPanel';
import MaterialsCalculator from './components/materials/MaterialsCalculator';
import MachineCalculator from './components/machines/MachineCalculator';
import LaborCalculator from './components/labor/LaborCalculator';
import CostSummaryDashboard from './components/dashboard/CostSummaryDashboard';
import CapacityTimeline from './components/timeline/CapacityTimeline';
import ExportPanel from './components/export/ExportPanel';
import MobileSummaryBar from './components/layout/MobileSummaryBar';
import { usePdfExport } from './hooks/usePdfExport';
import { saveProject, listSavedProjects, loadProject } from './utils/storage';
import { Settings, FlaskRound, Cpu, Users, BarChart3, Calendar, Share2 } from 'lucide-react';
import { useState } from 'react';

function AppContent() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const { contentRef, exportPdf } = usePdfExport();
  const [showLoadModal, setShowLoadModal] = useState(false);

  const handleSave = () => {
    saveProject(state);
  };

  const handleLoad = () => {
    setShowLoadModal(!showLoadModal);
  };

  const savedProjects = listSavedProjects();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16 md:pb-0">
      <Header onSave={handleSave} onLoad={handleLoad} onExportPdf={exportPdf} />

      {showLoadModal && savedProjects.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Load Project</h3>
              <button onClick={() => setShowLoadModal(false)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Close</button>
            </div>
            <div className="space-y-1">
              {savedProjects.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    const loaded = loadProject(p.name);
                    if (loaded) dispatch({ type: 'LOAD_PROJECT', payload: loaded });
                    setShowLoadModal(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                >
                  {p.name}
                  <span className="text-xs text-gray-400 ml-2">{new Date(p.savedAt).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <SectionWrapper title="Project Setup" icon={<Settings className="w-5 h-5" />} defaultOpen={true}>
          <ProjectSetupPanel />
        </SectionWrapper>

        <SectionWrapper title="Amino Acid & Starting Materials" icon={<FlaskRound className="w-5 h-5" />}>
          <MaterialsCalculator />
        </SectionWrapper>

        <SectionWrapper title="Machine / Equipment" icon={<Cpu className="w-5 h-5" />} defaultOpen={false}>
          <MachineCalculator />
        </SectionWrapper>

        <SectionWrapper title="Labor" icon={<Users className="w-5 h-5" />} defaultOpen={false}>
          <LaborCalculator />
        </SectionWrapper>

        <SectionWrapper title="Cost Summary" icon={<BarChart3 className="w-5 h-5" />} defaultOpen={true}>
          <CostSummaryDashboard />
        </SectionWrapper>

        <SectionWrapper title="Capacity Timeline" icon={<Calendar className="w-5 h-5" />} defaultOpen={false}>
          <CapacityTimeline />
        </SectionWrapper>

        <SectionWrapper title="Export & Share" icon={<Share2 className="w-5 h-5" />} defaultOpen={false}>
          <ExportPanel onExportPdf={exportPdf} />
        </SectionWrapper>
      </main>

      <MobileSummaryBar />
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
