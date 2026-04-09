import { ThemeProvider } from './context/ThemeContext';
import { ProjectProvider } from './context/ProjectContext';
import Header from './components/layout/Header';
import SectionWrapper from './components/layout/SectionWrapper';
import { Settings, FlaskRound, Cpu, Users, BarChart3, Calendar } from 'lucide-react';

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <SectionWrapper title="Project Setup" icon={<Settings className="w-5 h-5" />} defaultOpen={true}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Project setup form coming next...</p>
        </SectionWrapper>

        <SectionWrapper title="Amino Acid & Starting Materials" icon={<FlaskRound className="w-5 h-5" />}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Materials calculator coming next...</p>
        </SectionWrapper>

        <SectionWrapper title="Machine / Equipment" icon={<Cpu className="w-5 h-5" />} defaultOpen={false}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Machine calculator coming next...</p>
        </SectionWrapper>

        <SectionWrapper title="Labor" icon={<Users className="w-5 h-5" />} defaultOpen={false}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Labor calculator coming next...</p>
        </SectionWrapper>

        <SectionWrapper title="Cost Summary" icon={<BarChart3 className="w-5 h-5" />} defaultOpen={true}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Cost dashboard coming next...</p>
        </SectionWrapper>

        <SectionWrapper title="Capacity Timeline" icon={<Calendar className="w-5 h-5" />} defaultOpen={false}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Timeline view coming next...</p>
        </SectionWrapper>
      </main>
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
