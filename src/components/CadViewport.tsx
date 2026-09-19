import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, RotateCcw, Box, Eye, CheckCircle2, Code2, Sparkles, FileCode } from 'lucide-react';
import { ThreeJsCodeEditorModal } from './ThreeJsCodeEditorModal';
import { subscribeToCustomModel, getActiveCompiledGroup } from '../utils/threeJsModelStore';

export interface CADPartData {
  name: string;
  category: string;
  function: string;
  position: string;
  specs: string;
  voltage: string;
  temp: string;
  status: string;
}

declare global {
  interface Window {
    onCADPartSelect?: (data: CADPartData) => void;
    setAuvExplodeFactor?: (val: number) => void;
    toggleCADWireframe?: (state?: boolean) => boolean;
    resetCADCamera?: () => void;
    selectCADComponentByName?: (keyword: string) => void;
    openThreeJsCodeEditor?: () => void;
    switchCADModelVariant?: (variant: 'custom' | 'hdpe_twin') => void;
    setCADHullMode?: (mode: 'opaque' | 'ghost' | 'invisible') => void;
  }
}

interface CadViewportProps {
  explode?: number; // 0 to 1
  onPartSelect?: (data: CADPartData) => void;
  selectedPartName?: string | null;
  className?: string;
  showControls?: boolean;
}

export function CadViewport({ 
  explode = 0, 
  onPartSelect, 
  selectedPartName,
  className = "w-full h-full min-h-[360px]",
  showControls = true
}: CadViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [activePart, setActivePart] = useState<CADPartData | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [modelVariant, setModelVariant] = useState<'custom' | 'hdpe_twin'>('custom');
  const [hullMode, setHullMode] = useState<'opaque' | 'ghost' | 'invisible'>('ghost');

  // Store refs to methods for HUD controls
  const toggleWireframeRef = useRef<() => void>(() => {});
  const resetCameraRef = useRef<() => void>(() => {});
  const selectByNameRef = useRef<(name: string) => void>(() => {});
  const switchVariantRef = useRef<(variant: 'custom' | 'hdpe_twin') => void>(() => {});
  const setHullModeRef = useRef<(mode: 'opaque' | 'ghost' | 'invisible') => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060c18, 0.022);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(11.5, 5.0, 12.5);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear existing children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x182c44, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 2.2);
    dirLight1.position.set(15, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.4);
    dirLight2.position.set(-15, -8, -12);
    scene.add(dirLight2);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(0, 18, -10);
    scene.add(keyLight);

    // 5. CAD Grid
    const gridHelper = new THREE.GridHelper(32, 64, 0x00f0ff, 0x112236);
    gridHelper.position.y = -3.2;
    scene.add(gridHelper);

    // 6. LOCKED MATERIALS SPECIFICATION
    const materials = {
      // HDPE (High-Density Polyethylene) Hull Material: Translucent polymer with warm/amber subsurface glow
      hdpeHull: new THREE.MeshPhysicalMaterial({
        color: 0xe0a938,
        emissive: 0x221303,
        metalness: 0.08,
        roughness: 0.28,
        transmission: 0.62,
        transparent: true,
        opacity: 0.72,
        thickness: 1.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15
      }),
      glassDome: new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.88,
        transparent: true,
        opacity: 0.55,
        roughness: 0.08
      }),
      internalFrame: new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.35
      }),
      // Brushless DC Propulsion & ESC
      bldcMotor: new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0369a1,
        metalness: 0.88,
        roughness: 0.22
      }),
      propRotor: new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        metalness: 0.9,
        roughness: 0.18
      }),
      ductKort: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.3
      }),
      // Li-ion Battery Pack (24V 10Ah) & TP4055 / INA219
      liIonBattery: new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        emissive: 0x1e3a8a,
        metalness: 0.6,
        roughness: 0.35
      }),
      // Sonar SLAM & Occupancy Grid Transducers
      occupancySonar: new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        metalness: 0.7,
        roughness: 0.25
      }),
      electronicMcu: new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x4c1d95,
        metalness: 0.6,
        roughness: 0.3
      }),
      leakSensor: new THREE.MeshStandardMaterial({
        color: 0xeab308,
        emissive: 0x713f12,
        metalness: 0.4,
        roughness: 0.2
      }),
      // Acoustic Scanning Cone Beam (Sonar Swath for Occupancy Grid)
      sonarAcousticBeam: new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.14,
        wireframe: true
      })
    };

    // 7. Root AUV Group & Interactive Registry
    const auvRoot = new THREE.Group();
    scene.add(auvRoot);

    const defaultTwinRoot = new THREE.Group();
    const customModelRoot = new THREE.Group();
    auvRoot.add(defaultTwinRoot);
    auvRoot.add(customModelRoot);

    const interactiveParts: THREE.Mesh[] = [];
    function registerComponent(mesh: THREE.Mesh, data: CADPartData) {
      mesh.userData = { ...mesh.userData, ...data };
      interactiveParts.push(mesh);
    }

    // Sub-Assembly Groups for Exploded View
    const groupHull = new THREE.Group();
    const groupBowSensors = new THREE.Group();
    const groupElectronics = new THREE.Group();
    const groupPowerKeel = new THREE.Group();
    const groupBldcPropulsion = new THREE.Group();

    defaultTwinRoot.add(groupHull);
    defaultTwinRoot.add(groupBowSensors);
    defaultTwinRoot.add(groupElectronics);
    defaultTwinRoot.add(groupPowerKeel);
    defaultTwinRoot.add(groupBldcPropulsion);

    // Custom model tracking
    let customPropellerBlades: THREE.Object3D[] = [];
    let customHullMeshes: THREE.Mesh[] = [];
    let currentHullMode: 'opaque' | 'ghost' | 'invisible' = 'ghost';

    function applyHullMode(mode: 'opaque' | 'ghost' | 'invisible') {
      currentHullMode = mode;
      setHullMode(mode);

      // 1. Custom Model Hull Mode
      customModelRoot.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const name = (child.name || '').toLowerCase();
          const isHull = name.startsWith('hull') || name.includes('cone') || name.includes('fin') || name.includes('fairing') || name.includes('window');
          if (isHull) {
            if (mode === 'invisible') {
              child.visible = false;
            } else if (mode === 'ghost') {
              child.visible = true;
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((m: any) => {
                    m.transparent = true;
                    m.opacity = 0.22;
                    m.depthWrite = false;
                    if ('roughness' in m) m.roughness = 0.1;
                  });
                } else {
                  (child.material as any).transparent = true;
                  (child.material as any).opacity = 0.22;
                  (child.material as any).depthWrite = false;
                  if ('roughness' in child.material) (child.material as any).roughness = 0.1;
                }
              }
            } else { // 'opaque'
              child.visible = true;
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((m: any) => {
                    m.transparent = false;
                    m.opacity = 1.0;
                    m.depthWrite = true;
                    if ('roughness' in m) m.roughness = 0.35;
                  });
                } else {
                  (child.material as any).transparent = false;
                  (child.material as any).opacity = 1.0;
                  (child.material as any).depthWrite = true;
                  if ('roughness' in child.material) (child.material as any).roughness = 0.35;
                }
              }
            }
          }
        }
      });

      // 2. Default Twin Hull Mode
      if (groupHull) {
        if (mode === 'invisible') {
          groupHull.visible = false;
        } else if (mode === 'ghost') {
          groupHull.visible = true;
          groupHull.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              (child.material as any).transparent = true;
              (child.material as any).opacity = 0.22;
              (child.material as any).depthWrite = false;
            }
          });
        } else { // 'opaque'
          groupHull.visible = true;
          groupHull.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              (child.material as any).transparent = true;
              (child.material as any).opacity = 0.85;
              (child.material as any).depthWrite = true;
            }
          });
        }
      }
    }

    function mountCustomGroup(group: THREE.Group | null) {
      while (customModelRoot.children.length > 0) {
        customModelRoot.remove(customModelRoot.children[0]);
      }
      customPropellerBlades = [];
      customHullMeshes = [];

      if (group) {
        const cloned = group.clone(true);
        customModelRoot.add(cloned);

        cloned.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const partName = child.name || 'CAD Component';
            const nameLower = partName.toLowerCase();

            // Store original local position for exploded view
            child.userData.origPos = child.position.clone();

            if (nameLower.startsWith('hull') || nameLower.includes('cone') || nameLower.includes('fin')) {
              customHullMeshes.push(child);
            }

            // Rich Hackathon Hardware Metadata
            let partData: CADPartData = {
              name: partName,
              category: 'Custom Three.js Geometry',
              function: 'Active in 3D scene from editable Three.js createAuvModel()',
              position: `X: ${child.position.x.toFixed(2)} | Y: ${child.position.y.toFixed(2)} | Z: ${child.position.z.toFixed(2)}`,
              specs: `Vertices: ${child.geometry ? (child.geometry.attributes.position?.count || 0) : 0} | Material: ${child.material ? (child.material as any).type : 'Standard'}`,
              voltage: '11.1V 3S Li-ion bus',
              temp: '14.2 °C Subsea Ambient',
              status: 'OPERATIONAL'
            };

            if (nameLower.includes('3s li-ion') || nameLower.includes('18650') || nameLower.includes('battery')) {
              partData = {
                name: '3S Li-ion Battery Pack (11.1V ~2600mAh)',
                category: 'Power Subsystem / Energy Storage',
                function: 'Central 3S 18650 cylinder array supplying high-drain power to BLDC thruster, Class-D acoustic transmitter, and DC-DC step-down converters.',
                position: 'Internal Chassis Tray Center-Aft',
                specs: '3S1P INR18650 | Nominal: 11.1V | Max: 12.6V | Cutoff: 9.0V | Capacity: 28.86 Wh | Weight: 145g',
                voltage: '11.1V (94% SOC)',
                temp: '22.1 °C Internal',
                status: 'NOMINAL / BALANCED'
              };
            } else if (nameLower.includes('ina219')) {
              partData = {
                name: 'INA219 High-Side I2C Current & Voltage Sensor',
                category: 'Power Telemetry & Safety',
                function: 'Monitors total vehicle bus current draw across a 0.1Ω precision shunt resistor. Provides real-time mAh consumption and low-battery abort triggers to STM32F407.',
                position: 'Power Distribution Rail',
                specs: 'I2C Addr: 0x40 | Range: 0-26V, ±3.2A | Resolution: 0.8mA | 12-bit Delta-Sigma ADC',
                voltage: '3.3V Logic Rail',
                temp: '24.5 °C',
                status: 'MONITORING (3.42A DRAW)'
              };
            } else if (nameLower.includes('mp1584')) {
              const is5V = nameLower.includes('5v');
              partData = {
                name: is5V ? 'MP1584 DC-DC Buck Regulator (5V @ 3A)' : 'MP1584 DC-DC Buck Regulator (3.3V @ 2A)',
                category: 'Power Regulation',
                function: is5V 
                  ? 'Steps down 11.1V battery rail to 5.0V for the waterproof steering servos and Class-D sonar driver stage.' 
                  : 'Steps down battery rail to ultra-low-noise 3.3V for STM32 microcontrollers, ADS1115, and environmental sensors.',
                position: 'Power Distribution Rail',
                specs: 'Switching Freq: 1.5MHz | Efficiency: 92% | Ripple: <30mV | Thermal Cutoff: 150°C',
                voltage: is5V ? '5.0V Regulated' : '3.3V Regulated',
                temp: '27.8 °C',
                status: 'ONLINE / ACTIVE'
              };
            } else if (nameLower.includes('tp4055')) {
              partData = {
                name: 'TP4055 Li-ion Battery Charging Controller',
                category: 'Power Management / Charging',
                function: 'Autonomous linear CC/CV charging controller with internal power MOSFET. Powers benchtop charging via waterproof magnetic bulkhead port.',
                position: 'Bulkhead Interface Bay',
                specs: 'Charge Current: 500mA - 1000mA | CC/CV Profile | Over-temp thermal regulation',
                voltage: '5V USB Input',
                temp: '20.5 °C Standby',
                status: 'STANDBY (CRUISE MODE)'
              };
            } else if (nameLower.includes('stm32f407') || nameLower.includes('payload master')) {
              partData = {
                name: 'STM32F407 Payload Master MCU',
                category: 'Compute & Mission Logic',
                function: 'Payload Master: Synthesizes 200kHz PWM excitation bursts on TIM1, reads ADS1115 acoustic echoes, logs MS5837 depth & temperature, and runs RoboVac SLAM.',
                position: 'Internal Electronics Rack Forward-Center',
                specs: 'ARM Cortex-M4F @ 168MHz | 1MB Flash, 192KB SRAM | Hardware FPU | DMA Bus Matrix',
                voltage: '3.3V Logic Rail',
                temp: '31.2 °C Core',
                status: 'MASTER STATE: SURVEYING'
              };
            } else if (nameLower.includes('stm32f103') || nameLower.includes('navigation stub') || nameLower.includes('blue pill')) {
              partData = {
                name: 'STM32F103 Navigation Stub (Blue Pill)',
                category: 'Actuation & Low-Level Control',
                function: 'Navigation Coprocessor: Executes 100Hz PID attitude stabilization loop, reads MPU6050 IMU, outputs 50Hz PWM to rudder/elevator servos and BLDC ESC.',
                position: 'Internal Electronics Rack Aft-Center',
                specs: 'ARM Cortex-M3 @ 72MHz | 64KB Flash, 20KB SRAM | 50Hz Servo PWM Timers | USART Link to F407',
                voltage: '3.3V Logic Rail',
                temp: '26.8 °C Core',
                status: 'NAV LOOP: 100Hz LOCKED'
              };
            } else if (nameLower.includes('200khz pzt') || nameLower.includes('transducer')) {
              partData = {
                name: '200kHz PZT Piezoceramic Sonar Transducer',
                category: 'Software-Defined Acoustic Payload',
                function: 'Bow-mounted Lead Zirconate Titanate piezoceramic disc. Resonates at 200kHz to project narrow conical acoustic acoustic pings for bathymetry & obstacle sensing.',
                position: 'Forward Bow Apex (Acoustic Centerline)',
                specs: 'Resonant Freq: 200 kHz ±5% | Beamwidth: 60° Conical | Bandwidth: 15 kHz | Acoustic Imp: 30 MRayl',
                voltage: '±48Vpp Resonant Drive',
                temp: '14.2 °C Water-Coupled',
                status: 'TRANSMITTING (5Hz PING)'
              };
            } else if (nameLower.includes('class-d') || nameLower.includes('inductor')) {
              partData = {
                name: 'Class-D High-Efficiency Resonant Sonar Driver',
                category: 'Acoustic Transmitter Hardware',
                function: 'Full-bridge MOSFET switching driver with high-Q toroidal choke. Converts 5V logic pulses from STM32F407 into high-energy 48Vpp 200kHz resonant bursts.',
                position: 'Forward Payload Bay',
                specs: 'Topology: Full-Bridge Resonant | Efficiency: >88% | Inductor: 220µH Toroid | Peak Power: 25W',
                voltage: '11.1V Battery -> 48Vpp Resonant',
                temp: '26.4 °C',
                status: 'BURST READY'
              };
            } else if (nameLower.includes('tl072') || nameLower.includes('preamp')) {
              partData = {
                name: 'TL072 Low-Noise Preamplifier & AFE (LNA)',
                category: 'Acoustic Receiver Analog Stage',
                function: 'Analog Front-End (AFE): Dual low-noise JFET op-amp conditioning weak echo returns. Stage 1: +46dB LNA; Stage 2: Active 200kHz Bandpass Filter (Q=8).',
                position: 'Forward Payload Bay (Shielded)',
                specs: 'Input Noise: 18 nV/√Hz | Bandpass: 190-210 kHz | Diode Clamping Protection | Gain: +46 dB',
                voltage: '±5V Split Rail',
                temp: '23.0 °C',
                status: 'ECHO FILTERING'
              };
            } else if (nameLower.includes('ads1115')) {
              partData = {
                name: 'ADS1115 16-Bit Analog-to-Signal Processor (ASP)',
                category: 'Acoustic Digitizer / ADC',
                function: 'Analog-to-Signal Processor: 16-bit precision delta-sigma ADC digitizing acoustic echo envelope waveforms for time-of-flight range calculation.',
                position: 'Forward Payload Bay',
                specs: 'Resolution: 16-bit | Sample Rate: 860 SPS | Programmable Gain: 2/3x to 16x | I2C Addr: 0x48',
                voltage: '3.3V Logic Rail',
                temp: '22.8 °C',
                status: 'DIGITIZING (860 SPS)'
              };
            } else if (nameLower.includes('ms5837')) {
              partData = {
                name: 'MS5837-30BA Subsea Depth/Pressure Sensor',
                category: 'Environmental Sensors',
                function: 'High-resolution piezoresistive pressure sensor mounted in waterproof bulkhead penetrator. Measures subsea hydrostatic pressure to calculate vehicle depth.',
                position: 'Ventral Hull Bulkhead Penetrator',
                specs: 'Pressure Range: 0-30 bar (300m) | Resolution: 0.2 mbar (~2mm water depth) | 24-bit I2C',
                voltage: '3.3V Logic Rail',
                temp: '14.2 °C Seawater',
                status: 'DEPTH: 14.82m'
              };
            } else if (nameLower.includes('ds18b20') || nameLower.includes('temp')) {
              partData = {
                name: 'DS18B20 1-Wire Subsea Water Temperature Probe',
                category: 'Environmental Sensors',
                function: 'Measures ambient seawater temperature to calculate speed of sound dynamically: v = 1449.2 + 4.6T - 0.055T² + 0.00029T³ (m/s) for accurate sonar ranging.',
                position: 'External Hull Wet Well',
                specs: 'Range: -55°C to +125°C | Accuracy: ±0.5°C | Resolution: 12-bit | 1-Wire Bus',
                voltage: '3.3V Logic Rail',
                temp: '14.2 °C Seawater',
                status: 'SPEED OF SOUND: 1502.4 m/s'
              };
            } else if (nameLower.includes('leak') || nameLower.includes('bilge')) {
              partData = {
                name: 'Optical Bilge Leak & Moisture Monitor',
                category: 'Safety & Fail-Safe System',
                function: 'Infrared optical refraction prism located at the lowest internal hull keel. Detects even a single droplet of water ingress and trips emergency surfacing EXTI.',
                position: 'Lowest Keel Bilge Pocket',
                specs: 'Sensor Type: Optical Refraction | Response Time: <5ms | Fail-Safe Ascent Trigger',
                voltage: '3.3V Logic Rail',
                temp: '19.4 °C Bilge',
                status: 'DRY (0% MOISTURE)'
              };
            } else if (nameLower.includes('bldc') || nameLower.includes('motor') || nameLower.includes('propeller') || nameLower.includes('servo')) {
              partData = {
                name: 'BLDC Propulsion Motor & 3-Blade Propeller',
                category: 'Propulsion & Actuation',
                function: 'Underwater brushless direct-drive motor spinning a 60mm 3-blade hydrodynamic propeller. Twin 9g waterproof servos deflect cruciform rudder and elevator fins.',
                position: 'Aft Propulsion Stern',
                specs: 'Motor: 1200KV Outrunner | Prop: 3-Blade High Skew | Servos: 9g Metal-Gear IP68 | Thrust: 4.8 N',
                voltage: '11.1V Motor / 5.0V Servos',
                temp: '25.6 °C Motor Can',
                status: 'CRUISING (1200 RPM)'
              };
            } else if (nameLower.startsWith('hull') || nameLower.includes('torpedo shell')) {
              partData = {
                name: '3D-Printed PLA Torpedo Shell (450mm x 100mm)',
                category: 'Structure & Hydrodynamics',
                function: 'Campus 3D-printed PLA torpedo hull (450mm length, 100mm diameter). 20% gyroid infill provides buoyant rigidity; coated with 2-part marine epoxy for waterproofing.',
                position: 'Primary Outer Enclosure',
                specs: 'Length: 450 mm | Dia: 100 mm | Material: PLA Thermoplastic | Infill: 20% Gyroid | Waterproofing: Marine Epoxy',
                voltage: 'N/A (Dielectric Plastic)',
                temp: '14.2 °C Seawater',
                status: 'WATERTIGHT (IP68)'
              };
            }

            registerComponent(child, partData);
          }
          if (child.name && (child.name.toLowerCase().includes('propeller') || child.name.toLowerCase().includes('blade') || child.name.toLowerCase().includes('prop'))) {
            customPropellerBlades.push(child);
          }
        });

        // Apply initial hull visibility mode
        applyHullMode(currentHullMode);
      }
    }

    // Subscribe to custom model updates
    const unsubscribeCustomModel = subscribeToCustomModel((newGroup) => {
      mountCustomGroup(newGroup);
    });

    // Initially show custom model (PLA Torpedo)
    customModelRoot.visible = true;
    defaultTwinRoot.visible = false;

    // 1. HDPE TRANSLUCENT COMPOSITE HULL
    const hullCylGeom = new THREE.CylinderGeometry(1.2, 1.2, 5.6, 40, 12, true);
    hullCylGeom.rotateZ(Math.PI / 2);
    const hullMesh = new THREE.Mesh(hullCylGeom, materials.hdpeHull);
    hullMesh.castShadow = true;
    hullMesh.receiveShadow = true;
    groupHull.add(hullMesh);

    registerComponent(hullMesh, {
      name: 'HDPE Composite Monocoque Fuselage',
      category: 'Structural / Hull Composite',
      function: 'High-Density Polyethylene isobaric fairing. Acoustically transparent for internal sonar pings, near-neutral buoyancy in brine, zero galvanic corrosion.',
      position: 'Primary Outer Pressure Shell',
      specs: 'Density: 0.96 g/cm³ | Wall Thickness: 24 mm | Depth Rating: 300m Shallow-to-Mid',
      voltage: 'N/A (Galvanic Neutral)',
      temp: '4.8 °C Subsea Ambient',
      status: 'LOCKED CONFIG (HDPE)'
    });

    // Skeletal Internal Bulkheads
    for (let i = -2; i <= 2; i++) {
      const ribGeom = new THREE.TorusGeometry(1.14, 0.035, 16, 36);
      ribGeom.rotateY(Math.PI / 2);
      ribGeom.translate(i * 1.15, 0, 0);
      const ribMesh = new THREE.Mesh(ribGeom, materials.internalFrame);
      groupHull.add(ribMesh);
    }

    // 2. FORWARD SENSING: OCCUPANCY GRID SONAR & DVL SLAM CORE
    const domeGeom = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    domeGeom.rotateZ(-Math.PI / 2);
    domeGeom.translate(2.8, 0, 0);
    const bowDome = new THREE.Mesh(domeGeom, materials.glassDome);
    groupBowSensors.add(bowDome);

    // Forward Multi-Sector Sonar Array for Occupancy Grid Mapping
    const sonarHeadGeom = new THREE.CylinderGeometry(0.44, 0.44, 0.45, 32);
    sonarHeadGeom.rotateZ(Math.PI / 2);
    sonarHeadGeom.translate(3.1, 0, 0);
    const sonarHeadMesh = new THREE.Mesh(sonarHeadGeom, materials.occupancySonar);
    groupBowSensors.add(sonarHeadMesh);

    registerComponent(sonarHeadMesh, {
      name: 'Sonar Occupancy Grid & SLAM Transceiver Array',
      category: 'Mapping & Navigation (RoboVac)',
      function: 'Active multibeam phased acoustic ranger generating real-time 2D/3D probability occupancy grids (0.05m cell resolution) for autonomous obstacle avoidance.',
      position: 'Forward Acoustic Dome / Bow Array',
      specs: 'Frequency: 450 kHz / 900 kHz | Sector Swath: 120° Horizontal × 30° Vertical | Range: 60m',
      voltage: '12V Regulated DC',
      temp: '22.4 °C',
      status: 'SLAM GRID MAPPING (20 Hz)'
    });

    // Acoustic Swath Wireframe Cone (RoboVac Field-of-View)
    const swathGeom = new THREE.ConeGeometry(2.4, 4.2, 16, 4, true);
    swathGeom.rotateZ(-Math.PI / 2);
    swathGeom.translate(5.2, 0, 0);
    const swathMesh = new THREE.Mesh(swathGeom, materials.sonarAcousticBeam);
    groupBowSensors.add(swathMesh);

    // 3. MID-BAY ELECTRONICS: STM32F407 & REACTIVE POTENTIAL FIELD CONTROLLER
    const rackPlate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 1.2), materials.internalFrame);
    rackPlate.position.set(0.1, 0.05, 0);
    groupElectronics.add(rackPlate);

    const mcuGeom = new THREE.BoxGeometry(0.65, 0.14, 0.65);
    const mcuMesh = new THREE.Mesh(mcuGeom, materials.electronicMcu);
    mcuMesh.position.set(0.2, 0.18, 0);
    groupElectronics.add(mcuMesh);

    registerComponent(mcuMesh, {
      name: 'STM32F407 Reactive Pathfinding & SLAM Engine',
      category: 'Processing & Autonomy',
      function: 'Executes Potential Field Repulsion & Dynamic Window Approach (DWA). Calculates real-time collision hazards and updates occupancy matrix.',
      position: 'Central Electronics Carrier (Bay 2)',
      specs: '168MHz ARM Cortex-M4F | Real-time Occupancy Matrix 128x128 Cells | FreeRTOS',
      voltage: '3.3V Regulated (MP1584)',
      temp: '37.8 °C',
      status: 'AUTONOMOUS (DWA ACTIVE)'
    });

    // 4. LOWER KEEL: 24V 10Ah LITHIUM-ION BATTERY PACK & INA219 / TP4055
    const battBankGeom = new THREE.BoxGeometry(2.2, 0.45, 0.9);
    const battBankMesh = new THREE.Mesh(battBankGeom, materials.liIonBattery);
    battBankMesh.position.set(-0.3, -0.55, 0);
    groupPowerKeel.add(battBankMesh);

    registerComponent(battBankMesh, {
      name: 'Li-Ion 24V 10Ah Energy Core & TP4055 Monitor',
      category: 'Energy Storage (Locked)',
      function: 'Primary 240Wh modular energy pack powering BLDC motor bus and telemetry payload. Coupled with INA219 current shunt monitor.',
      position: 'Lower Keel Ballast Bay',
      specs: '24V Nominal (6S4P 18650 Cells) | Capacity: 240 Wh | INA219 Shunt: 0.1Ω | Max Discharge: 25A',
      voltage: '24.22V DC (Nominal)',
      temp: '28.6 °C',
      status: 'NOMINAL (94% SOC)'
    });

    // Bilge Moisture Sensor
    const leakMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), materials.leakSensor);
    leakMesh.position.set(0.0, -0.85, 0.0);
    groupPowerKeel.add(leakMesh);

    registerComponent(leakMesh, {
      name: 'Bilge Moisture & Optical Water Ingress Sensor',
      category: 'Hull Safety Interlock',
      function: 'Low-point optical refractance sensor; triggers emergency motor cutoff and ascent if water reaches 0.5 mL threshold.',
      position: 'Lowest Keel Bilge Well',
      specs: 'Detection Threshold: 0.5 mL | Trigger Response: < 30 ms interrupt',
      voltage: '3.3V DC Active Low',
      temp: '22.0 °C',
      status: 'ZERO INGRESS (DRY)'
    });

    // 5. STERN PROPULSION: DC BRUSHLESS MOTOR (BLDC) & 5-BLADE ROTOR
    const aftConeGeom = new THREE.ConeGeometry(1.2, 2.2, 32, 8, true);
    aftConeGeom.rotateZ(Math.PI / 2);
    aftConeGeom.translate(-3.9, 0, 0);
    const aftCone = new THREE.Mesh(aftConeGeom, materials.ductKort);
    groupBldcPropulsion.add(aftCone);

    const bldcMotorGeom = new THREE.CylinderGeometry(0.42, 0.42, 1.1, 24);
    bldcMotorGeom.rotateZ(Math.PI / 2);
    bldcMotorGeom.translate(-4.0, 0, 0);
    const bldcMesh = new THREE.Mesh(bldcMotorGeom, materials.bldcMotor);
    groupBldcPropulsion.add(bldcMesh);

    registerComponent(bldcMesh, {
      name: 'DC Brushless Propulsion Motor & ESC Core',
      category: 'Main Propulsion (Locked)',
      function: 'High-efficiency sensorless brushless DC motor driving ducted propeller via integrated sinusoidal ESC driver. Real-time RPM telemetry.',
      position: 'Aft Propulsion Chamber (Stern)',
      specs: 'Operating Voltage: 24V DC | Peak Power: 480W | Kv: 220 RPM/V | Max Thrust: 9.8 kgf',
      voltage: '24.18V DC (Bus Rail)',
      temp: '41.2 °C',
      status: 'CRUISE (1,450 RPM)'
    });

    // Kort Nozzle Duct
    const ductGeom = new THREE.CylinderGeometry(0.72, 0.68, 0.85, 32, 1, true);
    ductGeom.rotateZ(Math.PI / 2);
    ductGeom.translate(-5.2, 0, 0);
    const ductMesh = new THREE.Mesh(ductGeom, materials.ductKort);
    groupBldcPropulsion.add(ductMesh);

    // 5-Blade Variable Pitch Propeller
    const propBladesGroup = new THREE.Group();
    propBladesGroup.position.set(-5.2, 0, 0);
    for (let b = 0; b < 5; b++) {
      const bladeGeom = new THREE.BoxGeometry(0.08, 0.5, 0.03);
      bladeGeom.translate(0, 0.28, 0);
      bladeGeom.rotateX(0.42);
      const bladeMesh = new THREE.Mesh(bladeGeom, materials.propRotor);
      bladeMesh.rotation.x = (b * Math.PI * 2) / 5;
      propBladesGroup.add(bladeMesh);
    }
    groupBldcPropulsion.add(propBladesGroup);

    // Cruciform Control Rudders
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) => {
      const finGeom = new THREE.BoxGeometry(0.9, 0.05, 0.7);
      finGeom.translate(0, 0.55, 0);
      const finMesh = new THREE.Mesh(finGeom, materials.hdpeHull);
      finMesh.position.set(-4.2, 0, 0);
      finMesh.rotation.x = rot;
      groupBldcPropulsion.add(finMesh);
    });

    // Exploded Offsets Configuration
    let currentExplodeFactor = explode;
    const explodeOffsets = {
      hull: new THREE.Vector3(0, 2.2, 0),
      bow: new THREE.Vector3(2.6, 0.2, 0),
      electronics: new THREE.Vector3(0, 1.2, 0),
      power: new THREE.Vector3(0, -1.8, 0),
      propulsion: new THREE.Vector3(-2.8, 0, 0)
    };

    // Interaction States
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let targetRotY = 0.5;
    let targetRotX = 0.22;
    let autoRotate = true;
    let wireframeActive = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onPointerDown(e: MouseEvent | TouchEvent) {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouse = { x: clientX, y: clientY };
    }

    function onPointerMove(e: MouseEvent | TouchEvent) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const dx = clientX - prevMouse.x;
        const dy = clientY - prevMouse.y;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
        targetRotX = Math.max(-1.1, Math.min(1.1, targetRotX));
        prevMouse = { x: clientX, y: clientY };
        autoRotate = false;
        setIsRotating(false);
      }
    }

    function onPointerUp(e: MouseEvent | TouchEvent) {
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

      if (isDragging && Math.abs(clientX - prevMouse.x) < 5 && Math.abs(clientY - prevMouse.y) < 5) {
        raycaster.setFromCamera(mouse, camera);
        const visibleParts = interactiveParts.filter(p => p.visible && p.parent?.visible);
        const hits = raycaster.intersectObjects(visibleParts, false);
        if (hits.length > 0) {
          const picked = hits[0].object as THREE.Mesh;
          if (picked.userData?.name) {
            const data = picked.userData as CADPartData;
            setActivePart(data);
            if (onPartSelect) onPartSelect(data);
            if (window.onCADPartSelect) window.onCADPartSelect(data);
          }
        }
      }
      isDragging = false;
    }

    // Scroll wheel zoom
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.01;
      camera.position.z = Math.max(6, Math.min(26, camera.position.z + zoomDelta));
      camera.position.x = Math.max(5, Math.min(22, camera.position.x + zoomDelta * 0.9));
      camera.position.y = Math.max(2, Math.min(12, camera.position.y + zoomDelta * 0.4));
    }

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Touch support
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Global Control Bridges (Exposed to HUD / HTML)
    window.setAuvExplodeFactor = function(val: number) {
      currentExplodeFactor = Math.max(0, Math.min(1, val));
    };

    window.toggleCADWireframe = function(state?: boolean) {
      wireframeActive = state !== undefined ? state : !wireframeActive;
      setWireframe(wireframeActive);
      Object.values(materials).forEach(m => { 
        if ('wireframe' in m) (m as any).wireframe = wireframeActive; 
      });
      customModelRoot.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m: any) => { if ('wireframe' in m) m.wireframe = wireframeActive; });
          } else if ('wireframe' in child.material) {
            (child.material as any).wireframe = wireframeActive;
          }
        }
      });
      return wireframeActive;
    };

    window.openThreeJsCodeEditor = function() {
      setIsCodeEditorOpen(true);
    };

    window.setCADHullMode = function(mode: 'opaque' | 'ghost' | 'invisible') {
      applyHullMode(mode);
    };

    window.switchCADModelVariant = function(variant: 'custom' | 'hdpe_twin') {
      setModelVariant(variant);
      if (variant === 'custom') {
        customModelRoot.visible = true;
        defaultTwinRoot.visible = false;
      } else {
        customModelRoot.visible = false;
        defaultTwinRoot.visible = true;
      }
      applyHullMode(currentHullMode);
    };

    window.resetCADCamera = function() {
      targetRotX = 0.22;
      targetRotY = 0.5;
      camera.position.set(11.5, 5.0, 12.5);
      camera.lookAt(0, 0, 0);
      autoRotate = true;
      setIsRotating(true);
    };

    window.selectCADComponentByName = function(keyword: string) {
      const match = interactiveParts.find(p => p.userData?.name && p.userData.name.toLowerCase().includes(keyword.toLowerCase()));
      if (match) {
        const data = match.userData as CADPartData;
        setActivePart(data);
        if (onPartSelect) onPartSelect(data);
        if (window.onCADPartSelect) window.onCADPartSelect(data);
      }
    };

    // Store references to React buttons
    toggleWireframeRef.current = () => window.toggleCADWireframe?.();
    resetCameraRef.current = () => window.resetCADCamera?.();
    selectByNameRef.current = (name: string) => window.selectCADComponentByName?.(name);
    switchVariantRef.current = (variant) => window.switchCADModelVariant?.(variant);
    setHullModeRef.current = (mode) => window.setCADHullMode?.(mode);

    // Resize Handler with ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate) {
        targetRotY += 0.0025;
      }

      auvRoot.rotation.y += (targetRotY - auvRoot.rotation.y) * 0.08;
      auvRoot.rotation.x += (targetRotX - auvRoot.rotation.x) * 0.08;

      // Spin BLDC propeller rotor for default twin
      if (propBladesGroup && defaultTwinRoot.visible) {
        propBladesGroup.rotation.x += 0.06;
      }

      // Spin custom propeller blades for custom model
      if (customPropellerBlades.length > 0 && customModelRoot.visible) {
        customPropellerBlades.forEach(blade => {
          blade.rotation.x += 0.06;
        });
      }

      // Animate acoustic swath pulse
      if (swathMesh && defaultTwinRoot.visible) {
        const pulse = 1.0 + Math.sin(clock.getElapsedTime() * 4.0) * 0.04;
        swathMesh.scale.x = pulse;
        swathMesh.scale.y = pulse;
      }

      // Smooth Exploded View interpolation
      if (defaultTwinRoot.visible) {
        groupHull.position.lerp(explodeOffsets.hull.clone().multiplyScalar(currentExplodeFactor), 0.08);
        groupBowSensors.position.lerp(explodeOffsets.bow.clone().multiplyScalar(currentExplodeFactor), 0.08);
        groupElectronics.position.lerp(explodeOffsets.electronics.clone().multiplyScalar(currentExplodeFactor), 0.08);
        groupPowerKeel.position.lerp(explodeOffsets.power.clone().multiplyScalar(currentExplodeFactor), 0.08);
        groupBldcPropulsion.position.lerp(explodeOffsets.propulsion.clone().multiplyScalar(currentExplodeFactor), 0.08);
      } else if (customModelRoot.visible) {
        customModelRoot.traverse((child) => {
          if ((child instanceof THREE.Mesh || child instanceof THREE.Group) && child.userData.origPos) {
            const nameLower = (child.name || '').toLowerCase();
            const orig = child.userData.origPos as THREE.Vector3;
            const target = orig.clone();
            if (nameLower.includes('nose') || nameLower.includes('window') || nameLower.includes('transducer') || nameLower.includes('pzt')) {
              target.x += currentExplodeFactor * 2.2;
            } else if (nameLower.includes('tail') || nameLower.includes('fin') || nameLower.includes('propeller') || nameLower.includes('bldc') || nameLower.includes('servo')) {
              target.x -= currentExplodeFactor * 2.2;
            } else if (nameLower.startsWith('hull') || nameLower.includes('shell')) {
              target.y += currentExplodeFactor * 1.6;
            } else if (nameLower.includes('battery') || nameLower.includes('18650')) {
              target.y -= currentExplodeFactor * 0.9;
            } else if (nameLower.includes('stm32') || nameLower.includes('payload') || nameLower.includes('navigation')) {
              target.y += currentExplodeFactor * 1.0;
            } else if (nameLower.includes('class-d') || nameLower.includes('tl072') || nameLower.includes('ads1115')) {
              target.z += currentExplodeFactor * (nameLower.includes('ads1115') ? 0.9 : -0.9);
            }
            child.position.lerp(target, 0.08);
          }
        });
      }

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    // Set active part initially to Hull
    setActivePart(hullMesh.userData as CADPartData);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      unsubscribeCustomModel();
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  // Update explode factor whenever prop changes
  useEffect(() => {
    if (window.setAuvExplodeFactor) {
      window.setAuvExplodeFactor(explode);
    }
  }, [explode]);

  // Sync selectedPartName from props
  useEffect(() => {
    if (selectedPartName && window.selectCADComponentByName) {
      window.selectCADComponentByName(selectedPartName);
    }
  }, [selectedPartName]);

  return (
    <div className={`relative bg-[#040914] overflow-hidden ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={containerRef} 
        id="threejs-container-ANIMATION_7"
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Top Floating Telemetry / Status Overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none font-mono text-[10px]">
        <div className="flex items-center gap-2 bg-[#08101e]/90 border border-abyssal-border px-2.5 py-1 backdrop-blur rounded shadow-md">
          <span className="w-2 h-2 rounded-full bg-abyssal-green animate-pulse"></span>
          <span className="text-white font-bold tracking-wider">
            {modelVariant === 'custom' ? 'THREE.JS CUSTOM TORPEDO' : 'AUV-9 3D DIGITAL TWIN'}
          </span>
          <span className="text-abyssal-muted">•</span>
          <span className={modelVariant === 'custom' ? 'text-yellow-400 font-semibold' : 'text-abyssal-amber'}>
            {modelVariant === 'custom' ? 'LIVE JAVASCRIPT / THREE.JS' : 'HDPE ISOBARIC 300M'}
          </span>
        </div>
        {activePart && (
          <div className="bg-[#0b1626]/90 border border-abyssal-cyan/40 px-2.5 py-1 text-abyssal-cyan backdrop-blur rounded max-w-xs sm:max-w-md shadow-lg">
            <span className="text-abyssal-muted text-[9px] uppercase block tracking-wider">// SELECTED COMPONENT:</span>
            <span className="font-bold text-white text-xs block truncate">{activePart.name}</span>
            <span className="text-[10px] text-abyssal-text/80 block truncate">{activePart.specs}</span>
          </div>
        )}
      </div>

      {/* Top Right Viewport Quick Action Buttons */}
      {showControls && (
        <div className="absolute top-3 right-3 flex flex-wrap items-center justify-end gap-1.5 z-10 font-mono text-xs">
          
          {/* Model Switcher */}
          <div className="flex items-center bg-[#08101e]/90 border border-abyssal-border rounded p-0.5 text-[10px]">
            <button
              onClick={() => switchVariantRef.current('custom')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                modelVariant === 'custom'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-[0_0_8px_rgba(255,204,0,0.2)]'
                  : 'text-abyssal-muted hover:text-white'
              }`}
              title="View editable PLA Torpedo model from createAuvModel()"
            >
              PLA TORPEDO
            </button>
            <button
              onClick={() => switchVariantRef.current('hdpe_twin')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                modelVariant === 'hdpe_twin'
                  ? 'bg-abyssal-cyan/20 text-abyssal-cyan border border-abyssal-cyan/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : 'text-abyssal-muted hover:text-white'
              }`}
              title="View modular HDPE Digital Twin with exploded sub-assemblies"
            >
              HDPE TWIN
            </button>
          </div>

          {/* Hull Visibility / Ghost Mode Switcher */}
          <div className="flex items-center bg-[#08101e]/90 border border-abyssal-border rounded p-0.5 text-[10px]" title="Hull Shell Visibility Mode (X-Ray / Invisible)">
            <span className="text-abyssal-muted px-1.5 font-bold uppercase hidden md:inline text-[9px] tracking-wider flex items-center gap-1">
              <Eye size={11} className="text-abyssal-cyan" /> HULL:
            </span>
            <button
              onClick={() => setHullModeRef.current('opaque')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                hullMode === 'opaque'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                  : 'text-abyssal-muted hover:text-white'
              }`}
              title="Solid 3D-Printed PLA Hull Shell"
            >
              OPAQUE
            </button>
            <button
              onClick={() => setHullModeRef.current('ghost')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                hullMode === 'ghost'
                  ? 'bg-abyssal-cyan/25 text-abyssal-cyan border border-abyssal-cyan/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'text-abyssal-muted hover:text-white'
              }`}
              title="Ghost Mode (X-Ray): Translucent hull reveals 3S battery, STM32 MCUs, and sonar stack"
            >
              GHOST (X-RAY)
            </button>
            <button
              onClick={() => setHullModeRef.current('invisible')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                hullMode === 'invisible'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.25)]'
                  : 'text-abyssal-muted hover:text-white'
              }`}
              title="Invisible Hull: Shows internal chassis, electronics, and battery only"
            >
              INTERNAL ONLY
            </button>
          </div>

          {/* EDIT THREE.JS CODE BUTTON */}
          <button
            onClick={() => setIsCodeEditorOpen(true)}
            className="px-2.5 py-1 rounded border border-yellow-400/80 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(255,204,0,0.3)] hover:scale-105"
            title="Open Three.js live code editor and customize geometry"
          >
            <Code2 size={13} />
            <span className="text-[10px] uppercase tracking-wider">EDIT THREE.JS</span>
          </button>

          <button
            onClick={() => toggleWireframeRef.current()}
            className={`px-2 py-1 rounded border flex items-center gap-1 transition-all ${
              wireframe 
                ? 'bg-abyssal-cyan/20 border-abyssal-cyan text-abyssal-cyan font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                : 'bg-[#08101e]/85 border-abyssal-border text-abyssal-muted hover:text-white hover:border-abyssal-muted'
            }`}
            title="Toggle Wireframe CAD Mesh"
          >
            <Layers size={13} />
            <span className="hidden sm:inline text-[10px] uppercase">WIREFRAME</span>
          </button>
          <button
            onClick={() => resetCameraRef.current()}
            className="px-2 py-1 rounded border bg-[#08101e]/85 border-abyssal-border text-abyssal-muted hover:text-white hover:border-abyssal-muted flex items-center gap-1 transition-all"
            title="Reset Camera Orientation & Auto-Orbit"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline text-[10px] uppercase">RESET VIEW</span>
          </button>
        </div>
      )}

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        {modelVariant === 'custom' ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[#08101e]/90 p-1.5 px-2.5 border border-abyssal-border/80 backdrop-blur rounded text-[10px] font-mono text-abyssal-text pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b] border border-yellow-200/50"></span>
              <span>PLA Hull (450x100mm)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]"></span>
              <span>3S Li-ion (11.1V)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#1e3a8a]"></span>
              <span>STM32F407 Master</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7]"></span>
              <span>STM32F103 Nav</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#d97706]"></span>
              <span>200kHz PZT Sonar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#15803d]"></span>
              <span>INA219 / MP1584</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#64748b]"></span>
              <span>BLDC & Servos</span>
            </div>
            <button
              onClick={() => setIsCodeEditorOpen(true)}
              className="ml-1 text-yellow-400 hover:text-yellow-200 underline text-[10px] flex items-center gap-1 pointer-events-auto"
            >
              <span>Click to Edit Three.js</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[#08101e]/90 p-1.5 px-2.5 border border-abyssal-border/80 backdrop-blur rounded text-[10px] font-mono text-abyssal-text">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#e0a938] border border-yellow-200/50"></span>
              <span>HDPE Hull</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]"></span>
              <span>24V Li-Ion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#8b5cf6]"></span>
              <span>SLAM Core</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]"></span>
              <span>Sonar Array</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0ea5e9]"></span>
              <span>BLDC Motor</span>
            </div>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-abyssal-muted bg-[#08101e]/80 px-2.5 py-1 border border-abyssal-border/60 rounded backdrop-blur">
          <span>DRAG TO ROTATE</span>
          <span>•</span>
          <span>SCROLL TO ZOOM</span>
          <span>•</span>
          <span className="text-abyssal-cyan font-bold">CLICK PART TO INSPECT</span>
        </div>
      </div>

      {/* Live Three.js Code Editor Modal */}
      <ThreeJsCodeEditorModal 
        isOpen={isCodeEditorOpen} 
        onClose={() => setIsCodeEditorOpen(false)} 
        onModelUpdated={() => {
          if (modelVariant !== 'custom') {
            switchVariantRef.current('custom');
          }
        }}
      />
    </div>
  );
}
