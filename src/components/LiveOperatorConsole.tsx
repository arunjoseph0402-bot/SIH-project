import React, { useState } from 'react';
import { Header, OperatorTab } from './Header';
import { Sidebar } from './Sidebar';
import { InspectorPanel } from './InspectorPanel';
import { FooterStats } from './FooterStats';
import { AuvCadViewer } from './AuvCadViewer';
import { SlamMap } from './SlamMap';
import { ProjectAbyssBlueprint } from './ProjectAbyssBlueprint';
import { TelemetryAuditView } from './TelemetryAuditView';
import { ThreeJsCodeEditorModal } from './ThreeJsCodeEditorModal';

interface LiveOperatorConsoleProps {
  onReturnToWebsite: () => void;
}

export function LiveOperatorConsole({ onReturnToWebsite }: LiveOperatorConsoleProps) {
  const [activeTab, setActiveTab] = useState<OperatorTab>('3d');
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState<boolean>(false);
  const [showSubsystems, setShowSubsystems] = useState<boolean>(false);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  const handleToggleZenMode = () => {
    setIsZenMode(prev => !prev);
    if (!isZenMode) {
      setShowSubsystems(false);
      setShowInspector(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050811] text-abyssal-text overflow-hidden font-mono select-none">
      {/* Unified Streamlined Command Bar */}
      <Header 
        onReturnToWebsite={onReturnToWebsite}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        showSubsystems={showSubsystems}
        onToggleSubsystems={() => {
          if (isZenMode) setIsZenMode(false);
          setShowSubsystems(prev => !prev);
        }}
        showInspector={showInspector}
        onToggleInspector={() => {
          if (isZenMode) setIsZenMode(false);
          setShowInspector(prev => !prev);
        }}
        isZenMode={isZenMode}
        onToggleZenMode={handleToggleZenMode}
      />

      {/* Main Workstation Canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Optional Collapsible Left Subsystems & Radar Drawer */}
        {showSubsystems && !isZenMode && (
          <aside className="shrink-0 z-20 h-full shadow-2xl border-r border-white/10 animate-in fade-in slide-in-from-left duration-200">
            <Sidebar />
          </aside>
        )}

        {/* Center Primary Stage */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-[#04060d]">
          <div className="flex-1 overflow-hidden relative p-1.5 flex flex-col">
            {activeTab === '3d' && (
              <div className="flex-1 h-full w-full">
                <AuvCadViewer onOpenCodeEditor={() => setIsCodeEditorOpen(true)} />
              </div>
            )}

            {activeTab === 'blueprint' && (
              <div className="flex-1 overflow-y-auto pr-1 rounded-xl border border-white/10 bg-[#060911]">
                <ProjectAbyssBlueprint />
              </div>
            )}

            {activeTab === 'slam' && (
              <div className="flex-1 overflow-y-auto pr-1 rounded-xl border border-white/10 bg-[#060911]">
                <SlamMap />
              </div>
            )}

            {activeTab === 'telemetry' && (
              <div className="flex-1 overflow-y-auto pr-1 rounded-xl border border-white/10 bg-[#060911]">
                <TelemetryAuditView />
              </div>
            )}
          </div>

          {/* Streamlined Subsea Status Strip */}
          <FooterStats />
        </main>

        {/* Optional Collapsible Right Hardware Inspector Drawer */}
        {showInspector && !isZenMode && (
          <aside className="shrink-0 z-20 h-full shadow-2xl border-l border-white/10 animate-in fade-in slide-in-from-right duration-200">
            <InspectorPanel />
          </aside>
        )}
      </div>

      {/* Three.js Live Code Editor Modal */}
      <ThreeJsCodeEditorModal 
        isOpen={isCodeEditorOpen} 
        onClose={() => setIsCodeEditorOpen(false)} 
      />
    </div>
  );
}
