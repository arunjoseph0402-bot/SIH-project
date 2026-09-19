import React from 'react';
import { 
  Anchor, 
  Wind, 
  Waves, 
  Flame, 
  MapPin, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export function FieldDeploymentsSection() {
  const missions = [
    {
      title: 'Offshore Wind Monopile Scour Survey',
      location: 'Dogger Bank, North Sea',
      depth: '18m – 25m Depth',
      tag: 'INFRASTRUCTURE',
      icon: <Wind className="text-cyan-400" size={20} />,
      description: 'Autonomous sediment wash-out surveys around gravity foundations. RoboVac-style concentric sweeping maps seabed scour patterns with zero diver risk.',
      metrics: ['24 foundations surveyed', '100% swath acoustic coverage', 'Zero diver risk']
    },
    {
      title: 'Benthic Reef Micro-Bathymetry',
      location: 'Palau Barrier Shelf, Micronesia',
      depth: '8m – 20m Depth',
      tag: 'ENVIRONMENTAL SLAM',
      icon: <Waves className="text-emerald-400" size={20} />,
      description: 'High-density micro-topographic bathymetric profiling of shallow coral shelves using the 200kHz PZT acoustic transceiver through the 3D-printed PLA nose cone.',
      metrics: ['0.10m spatial resolution', 'Neutral buoyancy cruise', 'Silent BLDC propulsion']
    },
    {
      title: 'Subsea Cable Route Integrity',
      location: 'Celtic Sea Array',
      depth: '15m – 25m Depth',
      tag: 'POWER UTILITIES',
      icon: <Anchor className="text-amber-400" size={20} />,
      description: 'Reactive potential-field evasion guides the AUV-9 parallel to subsea power lines, identifying exposed spans and anchor drags while evading seabed obstacles.',
      metrics: ['12 km cable track inspected', 'Continuous INA219 power stability', 'Autonomous obstacle evasion']
    },
    {
      title: 'Academic Test-Tank Calibration',
      location: 'Marine Robotics Test Basin',
      depth: '6m Hydrodynamic Flume',
      tag: 'BENCHMARKING',
      icon: <Flame className="text-purple-400" size={20} />,
      description: 'Validation of 200kHz acoustic beam attenuation, INA219 current shunt calibration, and potential-field obstacle avoidance against submerged test pylons.',
      metrics: ['Rapid modular CAD swaps', 'Test tank certified', 'Deterministic 100Hz loop']
    }
  ];

  return (
    <section id="missions" className="py-24 bg-[#060709] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading matching template */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-sans text-neutral-300 mb-4">
            <Sparkles size={12} className="text-cyan-400" />
            <span>Operational Case Studies</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-white tracking-tight leading-[1.15]">
            Field Proven Subsea Deployments
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            From shallow benthic reef conservation to academic flume tanks, the AUV-9 prototype delivers repeatable, uncrewed bathymetric data across harsh aquatic environments.
          </p>
        </div>

        {/* 4 Mission Cards matching template bento style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map((mission, index) => (
            <div 
              key={index}
              className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {mission.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                      {mission.tag}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 block mt-1.5">
                      {mission.depth}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-sans text-neutral-400 mb-1.5">
                  <MapPin size={13} className="text-amber-400" />
                  <span>{mission.location}</span>
                </div>

                <h3 className="text-base font-sans font-semibold text-white mb-2 leading-tight">
                  {mission.title}
                </h3>

                <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-5">
                  {mission.description}
                </p>
              </div>

              {/* Metrics Pills */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-wrap gap-2 text-xs font-sans">
                {mission.metrics.map((metric, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.02] border border-white/[0.06] text-neutral-300 rounded-lg text-[11px]">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {metric}
                  </span>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
