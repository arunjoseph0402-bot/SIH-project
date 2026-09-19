/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WebsiteNavbar } from './components/website/WebsiteNavbar';
import { WebsiteHero } from './components/website/WebsiteHero';
import { Website3DViewer } from './components/website/Website3DViewer';
import { SubsystemsSection } from './components/website/SubsystemsSection';
import { SlamAutonomySection } from './components/website/SlamAutonomySection';
import { TelemetryLiveSection } from './components/website/TelemetryLiveSection';
import { TechSpecsSection } from './components/website/TechSpecsSection';
import { EngineeringBlueprintsSection } from './components/website/EngineeringBlueprintsSection';
import { FieldDeploymentsSection } from './components/website/FieldDeploymentsSection';
import { ContactSection } from './components/website/ContactSection';
import { WebsiteFooter } from './components/website/WebsiteFooter';

import { LiveOperatorConsole } from './components/LiveOperatorConsole';
import { Terminal, ArrowRight } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'website' | 'console'>('website');
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Track active section for navbar highlighting
  useEffect(() => {
    if (viewMode !== 'website') return;

    const sections = ['overview', 'digital-twin', 'subsystems', 'autonomy', 'telemetry', 'specs', 'blueprints', 'missions', 'contact'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  // If in Operator Console Cockpit mode
  if (viewMode === 'console') {
    return <LiveOperatorConsole onReturnToWebsite={() => setViewMode('website')} />;
  }

  // Primary Website Mode matching template
  return (
    <div className="min-h-screen w-full bg-[#060709] text-white font-sans selection:bg-white selection:text-black">
      <WebsiteNavbar 
        onOpenConsole={() => setViewMode('console')} 
        activeSection={activeSection} 
      />

      <main>
        <WebsiteHero onOpenConsole={() => setViewMode('console')} />
        <Website3DViewer />
        <SubsystemsSection />
        <SlamAutonomySection />
        <TelemetryLiveSection />
        <TechSpecsSection />
        <EngineeringBlueprintsSection />
        <FieldDeploymentsSection />
        <ContactSection onOpenConsole={() => setViewMode('console')} />
      </main>

      <WebsiteFooter onOpenConsole={() => setViewMode('console')} />

      {/* Persistent Floating Operator Cockpit Trigger matching template */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setViewMode('console')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 font-sans text-xs font-semibold tracking-tight rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all group"
          title="Open Live Mission Control Workstation"
        >
          <Terminal size={14} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Operator Console</span>
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
