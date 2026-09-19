import * as THREE from 'three';

export interface CompilationResult {
  success: boolean;
  meshCount: number;
  vertexCount: number;
  error?: string;
  group?: THREE.Group;
}

export const USER_PLA_TORPEDO_CODE = `import * as THREE from 'three';

/**
 * Proof-of-Concept Autonomous Underwater Vehicle (AUV) CAD Assembly
 * 
 * Hardware Specs:
 * - Hull: 3D-Printed PLA Torpedo Shell (~450 mm length, ~100 mm diameter)
 * - Power: 3S Li-ion Battery Pack (11.1V, 2600mAh), INA219, MP1584 (5V/3.3V), TP4055
 * - Microcontrollers: STM32F407 Payload Master + STM32F103 Navigation Stub
 * - Sonar: Bow 200kHz PZT Transducer, Class-D Driver, TL072 Preamp, ADS1115 16-bit ASP
 * - Sensors: MS5837-30BA Depth, DS18B20 Temp, Optical Bilge Leak Detector
 * - Propulsion: BLDC Motor, 3-Blade Propeller, 9g Waterproof Servos + Linkages
 */
export function createAuvModel() {
  const auvGroup = new THREE.Group();

  // --- Materials Palette ---
  // 1. 3D-Printed PLA Yellow Hull (Layer-line satin finish)
  const plaHullMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Warm PLA Gold/Yellow
    roughness: 0.35,
    metalness: 0.1,
    name: 'plaHullMat'
  });

  // 2. Optical Acrylic / Transparent Sensor Window
  const opticalWindowMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f0ff,
    transmission: 0.85,
    opacity: 0.9,
    transparent: true,
    roughness: 0.1,
    metalness: 0.1
  });

  // 3. Marine Aluminum / Stainless Steel Alloy
  const alloyMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.25,
    metalness: 0.85
  });

  // 4. Gold / Brass Piezoceramic Electrodes
  const goldPztMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.2,
    metalness: 0.9
  });

  // 5. FR4 Printed Circuit Board (Dark Teal / Blue)
  const pcbMatF407 = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // STM32 Navy
    roughness: 0.4,
    metalness: 0.3
  });

  const pcbMatF103 = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // STM32 Blue Pill
    roughness: 0.4,
    metalness: 0.3
  });

  const pcbMatGreen = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Sensor & Analog PCB
    roughness: 0.4,
    metalness: 0.2
  });

  // 6. Lithium-Ion Battery Blue Shrink Wrap
  const liIonMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.3,
    metalness: 0.15
  });

  // 7. Internal Acrylic Mounting Chassis (Clear / Smoked)
  const chassisTrayMat = new THREE.MeshPhysicalMaterial({
    color: 0x94a3b8,
    transmission: 0.7,
    transparent: true,
    opacity: 0.55,
    roughness: 0.2
  });

  // 8. Silicon / Wiring / Seal Black
  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.6,
    metalness: 0.2
  });

  // ==========================================
  // SECTION A: EXTERIOR 3D-PRINTED PLA HULL (~450mm x ~100mm)
  // ==========================================

  // 1. Main Cylindrical PLA Torpedo Hull (Length: 3.2 units = ~320mm, Radius: 0.5 = 100mm dia)
  const hullGeo = new THREE.CylinderGeometry(0.5, 0.5, 3.0, 36, 1, true);
  hullGeo.rotateZ(Math.PI / 2);
  const hullMesh = new THREE.Mesh(hullGeo, plaHullMat);
  hullMesh.name = "Hull: 3D-Printed PLA Torpedo Shell (450mm x 100mm)";
  auvGroup.add(hullMesh);

  // 2. Forward Nose Cone (Acoustic & Sensor Bay Fairing, Length: ~100mm)
  const noseGeo = new THREE.ConeGeometry(0.5, 1.0, 36, 1, true);
  noseGeo.rotateZ(-Math.PI / 2);
  const noseMesh = new THREE.Mesh(noseGeo, plaHullMat);
  noseMesh.name = "Hull: Forward Sonar Nose Cone (Gyroid Infill)";
  noseMesh.position.set(2.0, 0, 0);
  auvGroup.add(noseMesh);

  // 3. Acoustic Bow Sonar Window (Acoustically matched polyurethane/acrylic)
  const windowGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 24);
  windowGeo.rotateZ(-Math.PI / 2);
  const windowMesh = new THREE.Mesh(windowGeo, opticalWindowMat);
  windowMesh.name = "Hull: Acoustic Sonar Window";
  windowMesh.position.set(2.52, 0, 0);
  auvGroup.add(windowMesh);

  // 4. Tail Propulsion Section (Transition from 100mm to 60mm motor mount)
  const tailGeo = new THREE.CylinderGeometry(0.5, 0.32, 0.8, 36, 1, true);
  tailGeo.rotateZ(Math.PI / 2);
  const tailMesh = new THREE.Mesh(tailGeo, plaHullMat);
  tailMesh.name = "Hull: Tail Propulsion & Servo Fairing";
  tailMesh.position.set(-1.9, 0, 0);
  auvGroup.add(tailMesh);

  // 5. Cruciform Tail Control Fins (Rudder & Elevator for 3D trajectory control)
  const finGeo = new THREE.BoxGeometry(0.04, 0.65, 0.5);
  
  const topFin = new THREE.Mesh(finGeo, plaHullMat);
  topFin.name = "Hull: Top Vertical Rudder Fin";
  topFin.position.set(-1.8, 0.55, 0);
  auvGroup.add(topFin);

  const bottomFin = new THREE.Mesh(finGeo, plaHullMat);
  bottomFin.name = "Hull: Bottom Vertical Keel Fin";
  bottomFin.position.set(-1.8, -0.55, 0);
  auvGroup.add(bottomFin);

  const starFin = new THREE.Mesh(finGeo, plaHullMat);
  starFin.name = "Hull: Starboard Elevator Fin";
  starFin.rotation.x = Math.PI / 2;
  starFin.position.set(-1.8, 0, 0.55);
  auvGroup.add(starFin);

  const portFin = new THREE.Mesh(finGeo, plaHullMat);
  portFin.name = "Hull: Port Elevator Fin";
  portFin.rotation.x = Math.PI / 2;
  portFin.position.set(-1.8, 0, -0.55);
  auvGroup.add(portFin);

  // ==========================================
  // SECTION B: INTERNAL CHASSIS & ELECTRONICS TRAY
  // ==========================================

  // Internal acrylic backbone mounting tray
  const chassisGeo = new THREE.BoxGeometry(3.6, 0.04, 0.65);
  const chassisMesh = new THREE.Mesh(chassisGeo, chassisTrayMat);
  chassisMesh.name = "Internal: Laser-Cut Chassis Tray (Electronics Backbone)";
  chassisMesh.position.set(0.1, -0.15, 0);
  auvGroup.add(chassisMesh);

  // Bulkhead support rings (Front, Center, Rear)
  const ringGeo = new THREE.TorusGeometry(0.47, 0.02, 12, 32);
  ringGeo.rotateY(Math.PI / 2);
  [-1.2, 0.1, 1.4].forEach((xPos, idx) => {
    const ring = new THREE.Mesh(ringGeo, alloyMat);
    ring.name = "Internal: Structural Bulkhead O-Ring Rib #" + (idx + 1);
    ring.position.set(xPos, 0, 0);
    auvGroup.add(ring);
  });

  // ==========================================
  // SECTION C: 3S LITHIUM-ION BATTERY & POWER MANAGEMENT
  // ==========================================

  // 1. 3S 18650 Li-ion Battery Pack (11.1V, ~2600mAh) - 3 cylindrical cells in series
  const battGroup = new THREE.Group();
  battGroup.name = "Internal: 3S Li-ion Battery Pack (11.1V 2600mAh)";
  for (let c = 0; c < 3; c++) {
    const cellGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.65, 16);
    cellGeo.rotateZ(Math.PI / 2);
    const cell = new THREE.Mesh(cellGeo, liIonMat);
    cell.name = "Internal: 18650 Li-ion Cell " + (c + 1) + " (3.7V Nominal)";
    cell.position.set(-0.35, -0.05, (c - 1) * 0.2);
    battGroup.add(cell);

    // Terminal Caps
    const capGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12);
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, alloyMat);
    cap.position.set(-0.02, -0.05, (c - 1) * 0.2);
    battGroup.add(cap);
  }
  auvGroup.add(battGroup);

  // 2. INA219 High-Side I2C Current & Voltage Sensor Board
  const inaGeo = new THREE.BoxGeometry(0.22, 0.03, 0.18);
  const inaMesh = new THREE.Mesh(inaGeo, pcbMatGreen);
  inaMesh.name = "Internal: INA219 High-Side Current Sensor (0.1R Shunt)";
  inaMesh.position.set(-0.75, -0.08, 0.18);
  auvGroup.add(inaMesh);

  // 3. MP1584 DC-DC Buck Regulators (5V Servo Rail & 3.3V Logic Rail)
  const buck5v = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.15), pcbMatGreen);
  buck5v.name = "Internal: MP1584 DC-DC Buck Regulator (5V @ 3A Rail)";
  buck5v.position.set(-0.75, -0.08, -0.15);
  auvGroup.add(buck5v);

  const buck3v3 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.15), pcbMatGreen);
  buck3v3.name = "Internal: MP1584 DC-DC Buck Regulator (3.3V @ 2A Rail)";
  buck3v3.position.set(-1.0, -0.08, -0.15);
  auvGroup.add(buck3v3);

  // 4. TP4055 Lithium-Ion Battery Charging Controller
  const tp4055 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.14), pcbMatGreen);
  tp4055.name = "Internal: TP4055 Li-ion Battery Charger Module";
  tp4055.position.set(-1.0, -0.08, 0.18);
  auvGroup.add(tp4055);

  // ==========================================
  // SECTION D: MICROCONTROLLERS & COMPUTE STACK
  // ==========================================

  // 1. STM32F407 Payload Master MCU (ARM Cortex-M4 @ 168MHz)
  const f407Group = new THREE.Group();
  f407Group.name = "Internal: STM32F407 Payload Master Board";
  const f407Pcb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.03, 0.42), pcbMatF407);
  f407Pcb.name = "Internal: STM32F407 Payload Master MCU (Mission Logic)";
  f407Pcb.position.set(0.45, -0.08, 0);
  f407Group.add(f407Pcb);

  // Cortex-M4 IC Chip
  const mcuIc = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.16), blackMat);
  mcuIc.name = "Internal: STM32F407VGT6 Cortex-M4 Chip (1MB Flash, 192KB RAM)";
  mcuIc.position.set(0.45, -0.05, 0);
  f407Group.add(mcuIc);
  auvGroup.add(f407Group);

  // 2. STM32F103 Navigation Stub (ARM Cortex-M3 @ 72MHz "Blue Pill")
  const f103Pcb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.22), pcbMatF103);
  f103Pcb.name = "Internal: STM32F103 Navigation Stub (IMU & Fin Actuation)";
  f103Pcb.position.set(0.45, 0.12, 0.15);
  auvGroup.add(f103Pcb);

  // ==========================================
  // SECTION E: SOFTWARE-DEFINED SONAR & ACOUSTIC PAYLOAD
  // ==========================================

  // 1. Bow 200kHz PZT Piezoceramic Element Transducer Disc
  const pztDiscGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 24);
  pztDiscGeo.rotateZ(Math.PI / 2);
  const pztDisc = new THREE.Mesh(pztDiscGeo, goldPztMat);
  pztDisc.name = "Internal: 200kHz PZT Piezoceramic Sonar Transducer";
  pztDisc.position.set(2.2, 0, 0);
  auvGroup.add(pztDisc);

  // 2. Class-D High-Efficiency Resonant Sonar Driver Module
  const classD = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.3), pcbMatGreen);
  classD.name = "Internal: Class-D Resonant Acoustic Transmitter Amplifier";
  classD.position.set(1.65, -0.08, 0);
  auvGroup.add(classD);

  // Toroidal Power Inductor on Class-D
  const inductorGeo = new THREE.TorusGeometry(0.06, 0.025, 8, 16);
  const inductor = new THREE.Mesh(inductorGeo, alloyMat);
  inductor.name = "Internal: Sonar Tuning Toroid Inductor";
  inductor.position.set(1.65, -0.04, 0);
  auvGroup.add(inductor);

  // 3. TL072 Low-Noise Preamplifier Analog Front-End (LNA)
  const tl072 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.22), pcbMatGreen);
  tl072.name = "Internal: TL072 LNA & Bandpass Analog Front-End";
  tl072.position.set(1.15, -0.08, -0.15);
  auvGroup.add(tl072);

  // 4. ADS1115 16-Bit Analog-to-Signal Processor (ADC/ASP)
  const ads1115 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.18), pcbMatF103);
  ads1115.name = "Internal: ADS1115 16-bit Precision ADC/ASP Module";
  ads1115.position.set(1.15, -0.08, 0.15);
  auvGroup.add(ads1115);

  // ==========================================
  // SECTION F: ENVIRONMENTAL SENSORS
  // ==========================================

  // 1. MS5837-30BA Subsea Pressure & Depth Bulkhead Penetrator
  const depthSensorGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 16);
  const depthSensor = new THREE.Mesh(depthSensorGeo, alloyMat);
  depthSensor.name = "Internal: MS5837-30BA Subsea Depth/Pressure Sensor (0.2mbar)";
  depthSensor.position.set(0.9, -0.38, 0);
  auvGroup.add(depthSensor);

  // 2. DS18B20 1-Wire Digital Water Temperature Sensor Probe
  const tempProbeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 12);
  const tempProbe = new THREE.Mesh(tempProbeGeo, alloyMat);
  tempProbe.name = "Internal: DS18B20 Subsea Water Temperature Probe";
  tempProbe.position.set(0.65, -0.38, 0.15);
  auvGroup.add(tempProbe);

  // 3. Optical Bilge Leak & Enclosure Humidity Sensor
  const leakSensorGeo = new THREE.BoxGeometry(0.12, 0.04, 0.12);
  const leakSensor = new THREE.Mesh(leakSensorGeo, blackMat);
  leakSensor.name = "Internal: Optical Bilge Leak & Humidity Monitor";
  leakSensor.position.set(0.0, -0.42, 0);
  auvGroup.add(leakSensor);

  // ==========================================
  // SECTION G: PROPULSION & FIN ACTUATION
  // ==========================================

  // 1. Brushless DC Underwater Motor
  const bldcGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24);
  bldcGeo.rotateZ(Math.PI / 2);
  const bldcMesh = new THREE.Mesh(bldcGeo, alloyMat);
  bldcMesh.name = "Internal: Brushless DC Motor Drive (1200KV)";
  bldcMesh.position.set(-1.8, 0, 0);
  auvGroup.add(bldcMesh);

  // 2. Dual 9g Waterproof Fin Servos (Rudder & Elevator)
  const servoGeo = new THREE.BoxGeometry(0.14, 0.18, 0.22);
  const rudderServo = new THREE.Mesh(servoGeo, blackMat);
  rudderServo.name = "Internal: Waterproof Rudder Steering Servo (9g Metal Gear)";
  rudderServo.position.set(-1.4, 0.1, 0);
  auvGroup.add(rudderServo);

  const elevatorServo = new THREE.Mesh(servoGeo, blackMat);
  elevatorServo.name = "Internal: Waterproof Elevator Pitch Servo (9g Metal Gear)";
  elevatorServo.position.set(-1.4, -0.1, 0);
  auvGroup.add(elevatorServo);

  // 3. 3-Blade Hydrodynamic Propeller Assembly
  const propGroup = new THREE.Group();
  propGroup.name = "propellerGroup";
  propGroup.position.set(-2.45, 0, 0);

  // Hub Spinner
  const hubGeo = new THREE.ConeGeometry(0.09, 0.18, 16);
  hubGeo.rotateZ(Math.PI / 2);
  const hubMesh = new THREE.Mesh(hubGeo, alloyMat);
  hubMesh.name = "Propeller Hub Spinner";
  propGroup.add(hubMesh);

  // 3 High-Skew Propeller Blades
  for (let i = 0; i < 3; i++) {
    const bladeGeo = new THREE.BoxGeometry(0.03, 0.38, 0.12);
    const blade = new THREE.Mesh(bladeGeo, alloyMat);
    blade.name = "Propeller Blade " + (i + 1);
    blade.rotation.x = (i * Math.PI * 2) / 3;
    blade.position.set(-0.04, 0, 0);
    propGroup.add(blade);
  }
  auvGroup.add(propGroup);

  return auvGroup;
}
`;

export const PRESET_KORT_SONAR_CODE = `import * as THREE from 'three';

/**
 * Advanced AUV-9 Subsea Variant with Kort Nozzle, 5-Blade Rotor, 
 * Phased Sonar Transceiver, and Bilge Sensor Bay.
 */
export function createAuvModel() {
  const auvGroup = new THREE.Group();

  // Materials
  const amberHull = new THREE.MeshPhysicalMaterial({
    color: 0xe0a938,
    roughness: 0.25,
    metalness: 0.1,
    transmission: 0.5,
    transparent: true,
    opacity: 0.85
  });

  const alloyMetal = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.85,
    roughness: 0.25
  });

  const cyanGlow = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00a3cc,
    metalness: 0.5,
    roughness: 0.2
  });

  // 1. Monocoque Hull (Length: 4.2m, Radius: 0.6m)
  const hullGeo = new THREE.CylinderGeometry(0.6, 0.6, 4.2, 36);
  hullGeo.rotateZ(Math.PI / 2);
  const hull = new THREE.Mesh(hullGeo, amberHull);
  hull.name = "HDPE Amber Isobaric Hull";
  auvGroup.add(hull);

  // 2. Parabolic Sonar Nose Dome
  const noseGeo = new THREE.SphereGeometry(0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  noseGeo.rotateZ(-Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, amberHull);
  nose.name = "Forward Sonar Dome";
  nose.position.set(2.1, 0, 0);
  auvGroup.add(nose);

  // Multibeam Phased Sonar Emitter
  const emitterGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 32);
  emitterGeo.rotateZ(Math.PI / 2);
  const emitter = new THREE.Mesh(emitterGeo, cyanGlow);
  emitter.name = "450kHz Phased Sonar Emitter";
  emitter.position.set(2.65, 0, 0);
  auvGroup.add(emitter);

  // 3. Kort Propulsion Duct Ring
  const ductGeo = new THREE.CylinderGeometry(0.72, 0.68, 0.5, 32, 1, true);
  ductGeo.rotateZ(Math.PI / 2);
  const duct = new THREE.Mesh(ductGeo, alloyMetal);
  duct.name = "Hydrodynamic Kort Nozzle Duct";
  duct.position.set(-2.5, 0, 0);
  auvGroup.add(duct);

  // 4. 5-Blade Variable Pitch Propeller
  const propGroup = new THREE.Group();
  propGroup.name = "propellerGroup";
  propGroup.position.set(-2.5, 0, 0);

  const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 16);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, alloyMetal);
  propGroup.add(hub);

  for (let i = 0; i < 5; i++) {
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.45, 0.12);
    bladeGeo.translate(0, 0.25, 0);
    bladeGeo.rotateX(0.4);
    const blade = new THREE.Mesh(bladeGeo, cyanGlow);
    blade.rotation.x = (i * Math.PI * 2) / 5;
    propGroup.add(blade);
  }
  auvGroup.add(propGroup);

  // 5. Cruciform Rudders
  [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot, idx) => {
    const finGeo = new THREE.BoxGeometry(0.6, 0.04, 0.5);
    finGeo.translate(0, 0.45, 0);
    const fin = new THREE.Mesh(finGeo, alloyMetal);
    fin.name = "Stabilization Fin " + (idx + 1);
    fin.position.set(-1.8, 0, 0);
    fin.rotation.x = rot;
    auvGroup.add(fin);
  });

  return auvGroup;
}
`;

export const PRESET_DEEP_EXPLORER_CODE = `import * as THREE from 'three';

/**
 * Deep-Trench Survey Drone with Twin Keel Thrusters, 
 * LED Floodlights & Multi-Camera Bathymetry Rig.
 */
export function createAuvModel() {
  const auvGroup = new THREE.Group();

  const stealthMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.3
  });

  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    metalness: 0.2,
    roughness: 0.4
  });

  const lightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  // Central Twin-Tube Pod
  [-0.4, 0.4].forEach((zOffset, idx) => {
    const podGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.8, 24);
    podGeo.rotateZ(Math.PI / 2);
    const pod = new THREE.Mesh(podGeo, stealthMat);
    pod.name = "Pressure Pod " + (idx === 0 ? "Port" : "Starboard");
    pod.position.set(0, 0, zOffset);
    auvGroup.add(pod);

    // Front Dome
    const frontDome = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), hazardMat);
    frontDome.position.set(1.9, 0, zOffset);
    auvGroup.add(frontDome);
  });

  // Bridge Fairing
  const bridgeGeo = new THREE.BoxGeometry(2.4, 0.15, 0.9);
  const bridge = new THREE.Mesh(bridgeGeo, hazardMat);
  bridge.name = "Center Structural Spar";
  auvGroup.add(bridge);

  // Twin Floodlights
  [-0.35, 0.35].forEach((z) => {
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16), lightMat);
    lamp.rotateZ(Math.PI / 2);
    lamp.position.set(2.2, 0, z);
    auvGroup.add(lamp);
  });

  // Dual Thrusters
  const propGroup = new THREE.Group();
  propGroup.name = "propellerGroup";
  [-0.4, 0.4].forEach((z) => {
    const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16, 1, true), stealthMat);
    duct.rotateZ(Math.PI / 2);
    duct.position.set(-2.1, 0, z);
    auvGroup.add(duct);

    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.08), hazardMat);
      blade.position.set(-2.1, 0, z);
      blade.rotation.x = (b * Math.PI * 2) / 4;
      propGroup.add(blade);
    }
  });
  auvGroup.add(propGroup);

  return auvGroup;
}
`;

/**
 * Execute Three.js code in a sandboxed Function constructor
 */
export function compileThreeJsCode(code: string): CompilationResult {
  try {
    // Strip ES6 imports and exports cleanly
    const cleaned = code
      .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '')
      .replace(/export\s+function\s+/g, 'function ')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+const\s+/g, 'const ');

    const wrapper = `
      "use strict";
      ${cleaned}
      
      if (typeof createAuvModel === 'function') {
        return createAuvModel();
      } else if (typeof auvGroup !== 'undefined') {
        return auvGroup;
      }
      throw new Error("Function createAuvModel() returning a THREE.Group was not found.");
    `;

    const runner = new Function('THREE', wrapper);
    const result = runner(THREE);

    if (!result || !(result instanceof THREE.Object3D)) {
      return {
        success: false,
        meshCount: 0,
        vertexCount: 0,
        error: "Code executed but did not return a valid THREE.Group or THREE.Object3D."
      };
    }

    let meshCount = 0;
    let vertexCount = 0;

    result.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;
        if (child.geometry) {
          const geom = child.geometry;
          if (geom.attributes.position) {
            vertexCount += geom.attributes.position.count;
          }
        }
      }
    });

    return {
      success: true,
      meshCount,
      vertexCount,
      group: result as THREE.Group
    };
  } catch (err: any) {
    return {
      success: false,
      meshCount: 0,
      vertexCount: 0,
      error: err?.message || String(err)
    };
  }
}

/**
 * Global reactive event bridge for Three.js custom model
 */
type ModelChangeListener = (group: THREE.Group | null, code: string) => void;
const listeners: Set<ModelChangeListener> = new Set();

let activeCustomCode: string = USER_PLA_TORPEDO_CODE;
let activeCompiledGroup: THREE.Group | null = null;

// Initial compile
const initial = compileThreeJsCode(USER_PLA_TORPEDO_CODE);
if (initial.success && initial.group) {
  activeCompiledGroup = initial.group;
}

export function subscribeToCustomModel(listener: ModelChangeListener) {
  listeners.add(listener);
  // Send current state immediately
  listener(activeCompiledGroup, activeCustomCode);
  return () => {
    listeners.delete(listener);
  };
}

export function updateCustomModelCode(newCode: string): CompilationResult {
  const result = compileThreeJsCode(newCode);
  if (result.success && result.group) {
    activeCustomCode = newCode;
    activeCompiledGroup = result.group;
    listeners.forEach(l => l(result.group!, newCode));
  }
  return result;
}

export function resetToDefaultTwin() {
  activeCompiledGroup = null;
  listeners.forEach(l => l(null, activeCustomCode));
}

export function getActiveCustomCode(): string {
  return activeCustomCode;
}

export function getActiveCompiledGroup(): THREE.Group | null {
  return activeCompiledGroup;
}
