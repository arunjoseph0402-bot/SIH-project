import React from 'react';
import { SlamMap } from '../SlamMap';
import { 
  Navigation, 
  Compass, 
  ShieldAlert, 
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function SlamAutonomySection() {
  return (
    <section id="autonomy" className="py-24 bg-[#060709] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching template */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-sans text-neutral-300 mb-3">
              <Navigation size={13} className="text-purple-400" />
              <span>Acoustic SLAM & Path Planning</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans font-semibold text-white tracking-tight">
              RoboVac-Style Autonomous Seabed Sweeper
            </h2>
            <p className="text-sm text-neutral-400 font-sans mt-2 max-w-2xl leading-relaxed">
              Inspired by robotic vacuum sweep patterns, AUV-9 utilizes forward-looking 200kHz acoustic returns to construct a real-time probabilistic occupancy grid of uncharted seafloors while autonomously evading underwater hazards.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2 font-mono text-xs text-neutral-400 bg-white/[0.03] px-3.5 py-2 border border-white/[0.08] rounded-xl">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 font-semibold">ARTIFICIAL POTENTIAL FIELDS ACTIVE</span>
          </div>
        </div>

        {/* Interactive SLAM Sandbox Component inside sleek card */}
        <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0e12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)] min-h-[480px] flex flex-col">
          <SlamMap />
        </div>

        {/* Algorithmic Methodology Bento Cards matching template */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 font-sans text-xs">
          
          <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 mb-2 font-semibold">
                <Compass size={16} />
                <span>1. Lawnmower Sweep Frontier</span>
              </div>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Equidistant parallel bathymetric soundings ensure 100% swath acoustic coverage over complex topography, eliminating seabed survey gaps and data holidays.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-neutral-500">
              BOUSTROPHEDON PATH PATTERN
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-2 font-semibold">
                <ShieldAlert size={16} />
                <span>2. Reactive Artificial Potential Field</span>
              </div>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Virtual repulsive forces push the vehicle away from detected obstacles and tank boundaries while an attractive force pulls it smoothly toward waypoint goals.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-neutral-500">
              150ms DYNAMIC WINDOW COMPUTATION
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 mb-2 font-semibold">
                <Layers size={16} />
                <span>3. Bayesian Occupancy Grid</span>
              </div>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Sonar echo envelopes are mapped into log-odds probabilities. Repeated acoustic detections reinforce verified obstacle locations against sensor noise.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-neutral-500">
              0.1m RASTER RESOLUTION
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
