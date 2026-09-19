import * as THREE from 'three';

export interface AuvCadModelOutput {
  masterGroup: THREE.Group;
  hullGroup: THREE.Group;
  internalsGroup: THREE.Group;
  propGroup: THREE.Group;
  hullMaterial: THREE.MeshStandardMaterial;
  interactiveParts: THREE.Mesh[];
}

/**
 * Generates the complete Three.js group for the AUV internal CAD layout,
 * including the 3D-printed PLA hull (with ghost/transparency toggle) 
 * and all internal electronics/payload components.
 */
export function createInternalAuvCad(isHullTransparent = true): THREE.Group {
  const masterGroup = new THREE.Group();

  // --- MATERIALS ---
  const hullMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcc00, // PLA Yellow
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: isHullTransparent ? 0.15 : 1.0,
    wireframe: false,
    depthWrite: !isHullTransparent
  });

  const trayMaterial = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.5 }); // Dark electronic tray
  const pztMaterial = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8 }); // Green PZT Transducer
  const mcuMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue STM32F407 MCU
  const batteryMaterial = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4 }); // Red 3S Li-ion Pack
  const motorMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 }); // Brushless Motor
  const metalPinMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.1 });

  // --- 1. OUTER PLA TORPEDO HULL ---
  const hullGroup = new THREE.Group();
  hullGroup.name = "OuterHull";

  // Main Cylinder Body
  const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 3.5, 32);
  bodyGeo.rotateZ(Math.PI / 2);
  const bodyMesh = new THREE.Mesh(bodyGeo, hullMaterial);
  bodyMesh.userData = { name: 'PLA Torpedo Hull: 450 mm × 100 mm 3D-printed watertight fuselage with O-ring bulkheads.' };
  hullGroup.add(bodyMesh);

  // Forward Nose Cone (Sensor Bay)
  const noseGeo = new THREE.ConeGeometry(0.6, 1.2, 32);
  noseGeo.rotateZ(-Math.PI / 2);
  const noseMesh = new THREE.Mesh(noseGeo, hullMaterial);
  noseMesh.position.set(2.35, 0, 0);
  noseMesh.userData = { name: 'PLA Nose Cone: Hydrodynamic fairing housing the 200kHz bow acoustic transducer.' };
  hullGroup.add(noseMesh);

  // Tail Propulsion Cone
  const tailGeo = new THREE.CylinderGeometry(0.6, 0.3, 1.0, 32);
  tailGeo.rotateZ(Math.PI / 2);
  const tailMesh = new THREE.Mesh(tailGeo, hullMaterial);
  tailMesh.position.set(-2.25, 0, 0);
  tailMesh.userData = { name: 'PLA Tail Cone: Propulsion and servo control surface mounting section.' };
  hullGroup.add(tailMesh);

  masterGroup.add(hullGroup);

  // --- 2. INTERNAL STRUCTURAL & ELECTRONICS PAYLOAD ---
  const internalsGroup = new THREE.Group();
  internalsGroup.name = "InternalComponents";

  // Central Mounting Tray (Android-phone-width equivalent flat chassis)
  const trayGeo = new THREE.BoxGeometry(2.8, 0.05, 0.45);
  const trayMesh = new THREE.Mesh(trayGeo, trayMaterial);
  trayMesh.position.set(0, -0.15, 0);
  trayMesh.userData = { name: 'Central Mounting Tray: Rigid 3D-printed electronics chassis.' };
  internalsGroup.add(trayMesh);

  // PZT Transducer (Forward Bow Acoustic Bay)
  const pztGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 16);
  pztGeo.rotateZ(Math.PI / 2);
  const pztMesh = new THREE.Mesh(pztGeo, pztMaterial);
  pztMesh.position.set(2.7, 0, 0);
  pztMesh.userData = { name: 'PZT Transducer: 200kHz Bow-mounted ceramic element for acoustic ping generation.' };
  internalsGroup.add(pztMesh);

  // STM32F407 Payload Master MCU & Sonar Shield
  const mcuGeo = new THREE.BoxGeometry(0.6, 0.12, 0.5);
  const mcuMesh = new THREE.Mesh(mcuGeo, mcuMaterial);
  mcuMesh.position.set(0.8, 0.05, 0);
  mcuMesh.userData = { name: 'STM32F407 MCU: Central microcontroller executing mission control and digital signal processing.' };
  internalsGroup.add(mcuMesh);

  // TL072 LNA Preamp & ADS1115 ASP Sub-Board
  const aspGeo = new THREE.BoxGeometry(0.4, 0.08, 0.35);
  const aspMesh = new THREE.Mesh(aspGeo, new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 }));
  aspMesh.position.set(0.1, 0.05, 0);
  aspMesh.userData = { name: 'TL072 LNA Preamp & ADS1115 ASP: 16-Bit analog signal processing sub-board for sonar echo amplification.' };
  internalsGroup.add(aspMesh);

  // 3S 11.1V Lithium-ion Battery Pack (Center/Low CG Placement)
  const batteryGeo = new THREE.BoxGeometry(1.0, 0.3, 0.5);
  const batteryMesh = new THREE.Mesh(batteryGeo, batteryMaterial);
  batteryMesh.position.set(-0.5, -0.02, 0);
  batteryMesh.userData = { name: 'Li-ion Battery Pack: 3S 11.1V pack providing energy for a 45-minute PoC run time.' };
  internalsGroup.add(batteryMesh);

  // TP4055 & MP1584 Power Distribution Board
  const pmuGeo = new THREE.BoxGeometry(0.4, 0.08, 0.3);
  const pmuMesh = new THREE.Mesh(pmuGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 }));
  pmuMesh.position.set(-1.2, 0.05, 0);
  pmuMesh.userData = { name: 'TP4055 & MP1584 PMU: Power management sub-board regulating 5V & 3.3V rails with charging protection.' };
  internalsGroup.add(pmuMesh);

  // Brushless DC Motor (Tail Propulsion Section)
  const motorGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16);
  motorGeo.rotateZ(Math.PI / 2);
  const motorMesh = new THREE.Mesh(motorGeo, motorMaterial);
  motorMesh.position.set(-1.8, 0, 0);
  motorMesh.userData = { name: 'Brushless DC Motor: High-torque motor coupled to a 3-blade propeller in the tail section.' };
  internalsGroup.add(motorMesh);

  // 3-Blade Propeller
  const propGroup = new THREE.Group();
  propGroup.name = "PropellerGroup";
  propGroup.position.set(-2.4, 0, 0);
  for (let i = 0; i < 3; i++) {
    const bladeGeo = new THREE.BoxGeometry(0.02, 0.25, 0.08);
    const blade = new THREE.Mesh(bladeGeo, metalPinMaterial);
    blade.rotation.x = (i * Math.PI * 2) / 3;
    propGroup.add(blade);
  }
  internalsGroup.add(propGroup);

  masterGroup.add(internalsGroup);

  return masterGroup;
}
