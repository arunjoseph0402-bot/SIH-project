import React from 'react';
import { 
  Shield, 
  BatteryCharging, 
  Radio, 
  Cpu, 
  Check, 
  Disc,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

export function SubsystemsSection() {
  const subsystems = [
    {
      id: 'hull',
      title: 'PLA 3D-Printed Torpedo Fuselage',
      subtitle: 'BUOYANT RAPID-PROTOTYPING AIRFRAME',
      badge: 'PLA 3D-PRINT',
      badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
      icon: <Shield className="text-amber-400" size={20} />,
      points: [
        'Modular 450 mm length × 100 mm diameter torpedo shell for standard campus 3D printing.',
        'Tunable internal cubic/gyroid infill creates closed air pockets providing +1.2 N net buoyancy in seawater.',
        'Epoxy resin outer brush coat seals micro-porosities across 3D-printed layer lines.',
        'Dual radial NBR-70 O-ring grooves seal the fore payload bay, central tray, and aft thruster cone.',
        'Removable internal electronics tray slides out on continuous guiding rails for fast bench servicing.'
      ],
      comparison: {
        traditional: 'Machined Aluminum: Prohibitive CNC machine time and high material scrap cost.',
        advantage: '3D-Printed PLA: Overnight turnaround, sub-millimeter custom mounting brackets, and inherent positive buoyancy.'
      }
    },
    {
      id: 'propulsion',
      title: 'Brushless DC Drive & Fin Actuators',
      subtitle: 'HIGH-TORQUE VECTORING PROPULSION',
      badge: 'BLDC + FINS',
      badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
      icon: <Disc className="text-cyan-400" size={20} />,
      points: [
        'High-torque sensorless BLDC outrunner motor directly coupled to a 3-blade high-skew propeller.',
        '20A Bi-directional electronic speed controller (ESC) supports rapid throttle and dynamic braking.',
        'Twin servo-actuated tail control fins provide active pitch and yaw vectoring.',
        'Cruise survey speed of 2.5 knots with a maximum sprint velocity of 3.8 knots.',
        'Low acoustic noise profile prevents acoustic interference with the 200kHz sounding transceiver.'
      ],
      comparison: {
        traditional: 'Brushed DC Motors: Commutator brush erosion and acoustic spark interference in sonar band.',
        advantage: 'Brushless DC: Maintenance-free brushless rotation, high electrical efficiency, and near-silent operation.'
      }
    },
    {
      id: 'battery',
      title: '3S Li-ion Battery (11.1V) & INA219',
      subtitle: 'PRECISION I2C POWER MONITORING',
      badge: '3S1P LI-ION',
      badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
      icon: <BatteryCharging className="text-emerald-400" size={20} />,
      points: [
        '3S1P array of 18650 high-drain Li-ion cells (11.1V nominal, 12.6V peak, 2600mAh capacity).',
        'Texas Instruments INA219 high-side I2C current and bus voltage monitor sampled at 100Hz.',
        'Dedicated hardware BMS board protects against over-discharge, over-current, and cell imbalance.',
        'Integrated low in the chassis bottom to maximize passive righting moment and pitch stability.',
        'Continuous power telemetry displays real-time wattage draw, millivolts, and remaining runtime.'
      ],
      comparison: {
        traditional: 'Lead-Acid / NiMH: Heavy, sluggish discharge rate, and severe voltage sag under thrust.',
        advantage: '3S Li-ion + INA219: High energy-to-weight ratio with calibrated milliampere-hour telemetry.'
      }
    },
    {
      id: 'mcu',
      title: 'Dual STM32 Embedded Guidance Core',
      subtitle: 'ISOLATED HIGH-SPEED COMPUTE',
      badge: 'DUAL ARM CORTEX',
      badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
      icon: <Cpu className="text-purple-400" size={20} />,
      points: [
        'Master Controller: STM32F407 ARM Cortex-M4 (168MHz) handles acoustic DSP, SLAM, and logging.',
        'Navigation Sub-controller: STM32F103 (72MHz) dedicated to fin servo PWM, IMU, and attitude.',
        'Isolated inter-processor bus guarantees zero-jitter interrupt handling for 200kHz ADC sampling.',
        'Deterministic 100Hz flight-control loop ensures rapid reaction to obstacles and depth perturbations.',
        'Fail-safe watchdog timers automatically command positive pitch and thruster cutoff upon timeout.'
      ],
      comparison: {
        traditional: 'Single Low-Cost MCU: Prone to missed ADC samples during complex trigonometry calculations.',
        advantage: 'Dual STM32 Pipeline: Strict separation between high-bandwidth acoustic signal capture and servo actuation.'
      }
    },
    {
      id: 'sonar',
      title: '200kHz PZT Transceiver & ADS1115 AFE',
      subtitle: 'SOFTWARE-DEFINED BATHYMETRY',
      badge: '200kHz PZT AFE',
      badgeColor: 'border-pink-500/30 text-pink-300 bg-pink-500/10',
      icon: <Radio className="text-pink-400" size={20} />,
      points: [
        'Forward-looking 200kHz disc piezoceramic (PZT) transducer element encapsulated in acoustically matched epoxy.',
        'Half-bridge transistor transmitter circuit generates clean 200kHz excitation pulses into water.',
        'TL072 dual low-noise operational amplifier provides pre-amplification and active bandpass filtering.',
        'Texas Instruments ADS1115 16-bit analog-to-digital converter digitizes echo envelopes at 860 SPS.',
        'Mackenzie sound-speed algorithm compensates acoustic distance calculations based on temperature and depth.'
      ],
      comparison: {
        traditional: 'Fixed Hardware Sonar: Black-box proprietary firmware with no access to raw waveform data.',
        advantage: 'Software-Defined PZT: Full programmatic control over ping intervals, gain stages, and threshold detection.'
      }
    },
    {
      id: 'slam',
      title: 'RoboVac Boustrophedon SLAM & APF',
      subtitle: 'AUTONOMOUS SEABED BATHYMETRY',
      badge: 'SWEEP SLAM',
      badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
      icon: <Layers className="text-blue-400" size={20} />,
      points: [
        'Systematic lawnmower/boustrophedon sweeping pattern guarantees complete acoustic coverage of target survey areas.',
        '2D probabilistic occupancy raster classifies cells into unexplored (gray), clear (green), and obstacle (red).',
        'Artificial Potential Field (APF) generates attractive forces toward target waypoints and repulsive forces away from obstacles.',
        'Automatic turn-around logic reverses sweep direction upon detecting test tank boundaries or bathymetric drops.',
        'Dead-reckoning fusion combines motor RPM feedback, IMU gyro rates, and pressure sensor depth.'
      ],
      comparison: {
        traditional: 'Manual Tethered RC: Highly constrained cable tether prone to snagging on submerged obstacles.',
        advantage: 'Autonomous Sweep: Fully untethered exploration with real-time reactive obstacle evasion.'
      }
    }
  ];

  return (
    <section id="subsystems" className="py-24 bg-[#060709] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading matching template */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-sans text-neutral-300 mb-4">
            <Sparkles size={12} className="text-cyan-400" />
            <span>Locked Architecture Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-white tracking-tight leading-[1.15]">
            Hardened Subsea Hardware Architecture
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            Every subsystem is built according to locked marine robotic standards—prioritizing acoustic clarity, structural buoyancy, electrical safety, and autonomous self-reliance.
          </p>
        </div>

        {/* 6 Subsystems Grid matching the template's dark rounded-2xl bento style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subsystems.map((sub) => (
            <div 
              key={sub.id}
              className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-6 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {sub.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-neutral-400 block uppercase">
                        {sub.subtitle}
                      </span>
                      <h3 className="text-base font-sans font-semibold text-white leading-tight">
                        {sub.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${sub.badgeColor}`}>
                    {sub.badge}
                  </span>
                </div>

                {/* Key Spec Points */}
                <div className="space-y-2.5 my-4">
                  {sub.points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 font-sans leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Callout Box */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-sans">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                  <div className="text-[11px] text-neutral-500">
                    <strong className="text-neutral-400">Baseline:</strong> {sub.comparison.traditional}
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    <strong className="text-cyan-400">AUV-9 Edge:</strong> {sub.comparison.advantage}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
