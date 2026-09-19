import React, { useState } from 'react';
import { CadViewport, CADPartData } from '../CadViewport';
import { AuvCadViewer } from '../AuvCadViewer';
import { 
  Rotate3d,
  Layers, 
  Code2,
  Sliders,
  Box,
  Cpu,
  BatteryCharging,
  Radio,
  Disc,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';

export function Website3DViewer() {
  const [viewMode, setViewMode] = useState<'interactive_cad' | 'exploded_assembly'>('interactive_cad');
  const [explodeValue, setExplodeValue] = useState(20);
  const [selectedComponent, setSelectedComponent] = useState<'hull' | 'battery' | 'cpu' | 'sonar' | 'motor'>('hull');
  const [hullMode, setHullMode] = useState<'opaque' | 'ghost' | 'invisible'>('ghost');
  const { pitch, roll, yaw, depth } = useTelemetry();

  const handlePartSelect = (data: CADPartData) => {
    const name = (data.name || '').toLowerCase();
    if (name.includes('pla') || name.includes('hull') || name.includes('shell')) {
      setSelectedComponent('hull');
    } else if (name.includes('battery') || name.includes('18650') || name.includes('bms')) {
      setSelectedComponent('battery');
    } else if (name.includes('stm32') || name.includes('mcu') || name.includes('board') || name.includes('controller')) {
      setSelectedComponent('cpu');
    } else if (name.includes('sonar') || name.includes('pzt') || name.includes('transducer') || name.includes('ads1115')) {
      setSelectedComponent('sonar');
    } else if (name.includes('motor') || name.includes('bldc') || name.includes('propeller') || name.includes('servo')) {
      setSelectedComponent('motor');
    }
  };

  const handleHullModeChange = (mode: 'opaque' | 'ghost' | 'invisible') => {
    setHullMode(mode);
    window.setCADHullMode?.(mode);
  };

  const componentDetails = {
    hull: {
      title: 'PLA 3D-Printed Torpedo Fuselage (450x100mm)',
      category: 'PRIMARY HULL & BUOYANCY',
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      specs: [
        { label: 'Form Factor', value: 'Torpedo Cylinder (450 mm L × 100 mm Ø)' },
        { label: 'Print Profile', value: 'Cubic Infill (Buoyancy Core) + Epoxy Coat' },
        { label: 'Sealing O-Ring', value: 'Dual NBR-70 Radial Gaskets' },
        { label: 'Displacement', value: '3.53 L (+1.2 N Net Buoyant in Seawater)' },
        { label: 'Ballast Trim', value: 'Adjustable Keel Trim Weights' },
        { label: 'Max Depth Rating', value: '25 – 30 meters (Prototype Proof-of-Concept)' },
      ],
      description: 'Modular campus 3D-printable PLA torpedo housing split into fore payload bay, central electronics tray, and aft propulsion cone with internal rails.'
    },
    battery: {
      title: '3S Li-ion Battery (11.1V 2600mAh) & INA219',
      category: 'POWER MANAGEMENT & BMS',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      specs: [
        { label: 'Chemistry', value: '3S1P 18650 Li-ion Cells (11.1V Nominal)' },
        { label: 'Peak Voltage', value: '12.60 V Full Charge (9.60V Cutoff)' },
        { label: 'Power Telemetry', value: 'Texas Instruments INA219 High-Side I2C' },
        { label: 'BMS Protection', value: '3S Cell Balancing & UVLO Protection' },
        { label: 'Survey Endurance', value: '1.5 – 2.0 hours continuous at 2.5 knots' },
        { label: 'Internal Weight', value: '145 g (Integrated into bottom tray ballast)' },
      ],
      description: 'Centralized 3S Li-ion battery pack with cell balancing, hardware under-voltage lockout, and precision INA219 current and power telemetry.'
    },
    cpu: {
      title: 'Dual STM32 Embedded Architecture',
      category: 'AUTONOMOUS GUIDANCE & COMPUTE',
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      specs: [
        { label: 'Master DSP Core', value: 'STM32F407 ARM Cortex-M4 @ 168MHz' },
        { label: 'Nav & Servo Core', value: 'STM32F103 dedicated attitude sub-processor' },
        { label: 'Inter-MCU Bus', value: 'High-speed SPI / I2C hardware synchrony' },
        { label: 'Acoustic Uplink', value: '40Hz UDP acoustic telemetry stream' },
        { label: 'Attitude Loop', value: '100Hz real-time path planning refresh' },
        { label: 'Operating Voltage', value: 'Regulated 5.0V / 3.3V dual-rail DC-DC' },
      ],
      description: 'Dual ARM Cortex architecture isolating high-throughput 200kHz acoustic signal digitizing from deterministic fin servo PWM attitude control.'
    },
    sonar: {
      title: '200kHz Software-Defined Acoustic Transceiver',
      category: 'ACOUSTIC PAYLOAD & BATHYMETRY',
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      specs: [
        { label: 'Transducer Element', value: '200kHz Disc PZT Transducer (Epoxy Potted)' },
        { label: 'Transmitter', value: 'Class-D Half-Bridge Transistor Driver' },
        { label: 'Signal Pre-amp', value: 'TL072 Dual Low-Noise Operational Amplifier' },
        { label: 'Digitizer ADC', value: 'ADS1115 16-Bit I2C ADC @ 860 SPS' },
        { label: 'Sounding Range', value: '0.4 m to 30.0 m operational distance' },
        { label: 'Beam Angle', value: 'Conical 15° acoustic sounding envelope' },
      ],
      description: 'Forward-looking software-defined acoustic transceiver pulsing 200kHz chirps to construct live bathymetric occupancy grids.'
    },
    motor: {
      title: 'BLDC Motor Thruster & Fin Actuators',
      category: 'PROPULSION & HYDRODYNAMICS',
      color: 'text-orange-400',
      borderColor: 'border-orange-500/40',
      specs: [
        { label: 'Propulsion Motor', value: 'Brushless DC Outrunner (Magnetic Drive)' },
        { label: 'ESC Controller', value: '20A Bi-directional ESC with DShot/PWM' },
        { label: 'Fin Servos', value: 'Dual Waterproof Micro Servos (Elevon/Rudder)' },
        { label: 'Propeller Assembly', value: '3-Blade High-Pitch Torpedo Screw' },
        { label: 'Survey Speed', value: '2.5 knots nominal (3.8 knots sprint)' },
        { label: 'Rudder Vectoring', value: '±25° deflection for rapid yaw/pitch response' },
      ],
      description: 'Rear-mounted brushless thruster with twin stabilizing rudders providing pitch and yaw attitude correction at 100Hz.'
    },
  };

  const currentComp = componentDetails[selectedComponent];

  return (
    <section id="digital-twin" className="py-24 bg-[#060709] border-b border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading matching template */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-sans text-neutral-300 mb-3">
              <Rotate3d size={13} className="text-cyan-400" />
              <span>Interactive Digital Twin</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans font-semibold text-white tracking-tight">
              Interactive 3D CAD Assembly
            </h2>
            <p className="text-sm text-neutral-400 font-sans mt-2 max-w-xl leading-relaxed">
              Explore the AUV-9 torpedo digital twin. Orbit 360°, adjust explosion disassembly, or toggle the PLA hull into ghost X-ray mode to view internal components.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2 font-mono text-xs text-neutral-400 bg-white/[0.03] px-3.5 py-2 border border-white/[0.08] rounded-xl">
            <span>ATTITUDE:</span>
            <span className="text-white font-bold">{pitch.toFixed(1)}° P</span>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-bold">{roll.toFixed(1)}° R</span>
            <span className="text-neutral-600">/</span>
            <span className="text-cyan-400 font-bold">{yaw.toFixed(1)}° HDG</span>
          </div>
        </div>

        {/* Viewport Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <button
            onClick={() => setViewMode('interactive_cad')}
            className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
              viewMode === 'interactive_cad'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,255,0.2)] font-semibold'
                : 'text-neutral-400 bg-white/[0.03] border border-white/[0.08] hover:text-white'
            }`}
          >
            <Sparkles size={13} className="text-cyan-400" />
            <span>Hackathon CAD Digital Twin (Hull Ghost & Raycasting)</span>
          </button>
          <button
            onClick={() => setViewMode('exploded_assembly')}
            className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
              viewMode === 'exploded_assembly'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,255,0.2)] font-semibold'
                : 'text-neutral-400 bg-white/[0.03] border border-white/[0.08] hover:text-white'
            }`}
          >
            <Layers size={13} className="text-amber-400" />
            <span>Exploded Multi-Bay Subsystem Inspection</span>
          </button>
        </div>

        {/* Active CAD Stage */}
        {viewMode === 'interactive_cad' ? (
          <AuvCadViewer />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* 3D Canvas Viewport Box */}
          <div className="lg:col-span-8 rounded-2xl bg-[#0d0e12] border border-white/[0.08] overflow-hidden flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)] relative min-h-[520px]">
            
            {/* Top Toolbar Overlay */}
            <div className="p-3.5 bg-[#0a0c10]/95 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs font-sans z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>360° Orbit & Zoom</span>
                </span>
                
                {/* Hull Mode Quick Toggle */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px]">
                  <button
                    onClick={() => handleHullModeChange('opaque')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      hullMode === 'opaque'
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Opaque
                  </button>
                  <button
                    onClick={() => handleHullModeChange('ghost')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      hullMode === 'ghost'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Ghost
                  </button>
                  <button
                    onClick={() => handleHullModeChange('invisible')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      hullMode === 'invisible'
                        ? 'bg-purple-500/20 text-purple-300 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Internal
                  </button>
                </div>
              </div>

              {/* Explode Assembly Range Slider */}
              <div className="flex items-center gap-2.5 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.08]">
                <Layers size={13} className="text-cyan-400" />
                <span className="text-neutral-400 text-[11px] font-sans font-medium">EXPLODE:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={explodeValue}
                  onChange={(e) => setExplodeValue(parseInt(e.target.value))}
                  className="w-20 sm:w-28 h-1 cursor-pointer accent-white bg-neutral-700 rounded-lg"
                />
                <span className="text-white font-mono text-[11px] w-7 text-right">{explodeValue}%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => window.openThreeJsCodeEditor?.()}
                  className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-[11px] font-medium rounded-full border border-yellow-500/30 flex items-center gap-1 transition-all"
                  title="Open live Three.js CAD code editor"
                >
                  <Code2 size={12} />
                  <span>Edit Three.js</span>
                </button>
              </div>
            </div>

            {/* 3D WebGL Canvas */}
            <div className="flex-1 w-full min-h-[460px] relative">
              <CadViewport 
                explode={explodeValue / 100} 
                onPartSelect={handlePartSelect}
                selectedPartName={
                  selectedComponent === 'hull' ? 'Hull' :
                  selectedComponent === 'battery' ? '18650' :
                  selectedComponent === 'cpu' ? 'STM32' :
                  selectedComponent === 'sonar' ? 'PZT' : 'BLDC'
                }
              />
            </div>

            {/* Bottom Quick-Select Component Hotbar matching template */}
            <div className="p-3 bg-[#0a0c10]/95 border-t border-white/[0.06] flex flex-wrap gap-2 text-xs font-sans">
              <span className="text-neutral-500 py-1 mr-1 text-[11px] self-center uppercase font-mono">INSPECT:</span>
              
              <button
                onClick={() => {
                  setSelectedComponent('hull');
                  window.selectCADComponentByName?.('Hull');
                }}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedComponent === 'hull' 
                    ? 'bg-amber-500/20 border border-amber-400 text-amber-300 font-medium' 
                    : 'bg-white/[0.03] border border-white/[0.06] text-neutral-400 hover:text-white'
                }`}
              >
                PLA Shell
              </button>
              
              <button
                onClick={() => {
                  setSelectedComponent('motor');
                  window.selectCADComponentByName?.('BLDC');
                }}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedComponent === 'motor' 
                    ? 'bg-sky-500/20 border border-sky-400 text-sky-300 font-medium' 
                    : 'bg-white/[0.03] border border-white/[0.06] text-neutral-400 hover:text-white'
                }`}
              >
                BLDC Thruster
              </button>

              <button
                onClick={() => {
                  setSelectedComponent('battery');
                  window.selectCADComponentByName?.('18650');
                }}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedComponent === 'battery' 
                    ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-medium' 
                    : 'bg-white/[0.03] border border-white/[0.06] text-neutral-400 hover:text-white'
                }`}
              >
                3S Li-ion Battery
              </button>

              <button
                onClick={() => {
                  setSelectedComponent('cpu');
                  window.selectCADComponentByName?.('STM32');
                }}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedComponent === 'cpu' 
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-medium' 
                    : 'bg-white/[0.03] border border-white/[0.06] text-neutral-400 hover:text-white'
                }`}
              >
                Dual STM32
              </button>

              <button
                onClick={() => {
                  setSelectedComponent('sonar');
                  window.selectCADComponentByName?.('PZT');
                }}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedComponent === 'sonar' 
                    ? 'bg-amber-500/20 border border-amber-400 text-amber-300 font-medium' 
                    : 'bg-white/[0.03] border border-white/[0.06] text-neutral-400 hover:text-white'
                }`}
              >
                200kHz Sonar
              </button>
            </div>
          </div>

          {/* Right Column: Detailed Component Engineering Dossier */}
          <div className="lg:col-span-4 rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)]">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                  {currentComp.category}
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  ONLINE
                </span>
              </div>

              <h3 className={`text-lg font-sans font-semibold ${currentComp.color} mb-2`}>
                {currentComp.title}
              </h3>
              
              <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-5">
                {currentComp.description}
              </p>

              {/* Specs Table */}
              <div className="space-y-2 font-sans text-xs">
                {currentComp.specs.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/[0.04] text-[11px]">
                    <span className="text-neutral-400">{item.label}</span>
                    <span className="text-white font-medium text-right max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
              <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04] text-[11px] text-neutral-400 flex items-center justify-between font-mono">
                <span>CAD TOLERANCE:</span>
                <span className="text-emerald-400 font-bold">±0.12 mm FDM 3D-PRINT</span>
              </div>
              <a
                href="#subsystems"
                className="w-full py-2.5 bg-white/10 hover:bg-white hover:text-black border border-white/20 text-white text-center rounded-full block font-sans text-xs font-semibold transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
              >
                View Full Subsystems Matrix →
              </a>
            </div>

          </div>

        </div>
        )}

      </div>
    </section>
  );
}
