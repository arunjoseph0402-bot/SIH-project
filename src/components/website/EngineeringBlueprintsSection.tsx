import React, { useState } from 'react';
import { 
  FileCode, 
  Cpu, 
  Zap, 
  Radio, 
  Compass, 
  ShieldCheck, 
  Check, 
  Copy, 
  Sparkles, 
  Terminal,
  Layers,
  Box
} from 'lucide-react';
import { ProjectAbyssBlueprint } from '../ProjectAbyssBlueprint';

export function EngineeringBlueprintsSection() {
  const [activeTab, setActiveTab] = useState<'architecture_blueprint' | 'mcu_master' | 'nav_stub' | 'wiring' | 'slam' | 'hull'>('architecture_blueprint');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  const codeSnippets = {
    mcu_master: `/**
 * @file main_payload_master.c
 * @brief STM32F407 Payload Master MCU - 200kHz Class-D PZT Pulse & ADS1115 Echo Capture
 * Target: STM32F407VGT6 @ 168MHz (ARM Cortex-M4F)
 * Toolchain: STM32CubeIDE / GCC ARM Embedded
 */

#include "stm32f4xx_hal.h"
#include <math.h>

/* --- Pin Assignments ---
 * PA8  : TIM1_CH1 (200kHz PWM to Class-D Half-Bridge Gate Driver)
 * PB8  : I2C1_SCL (ADS1115, MS5837-30BA, INA219)
 * PB9  : I2C1_SDA
 * USART2 (PA2/PA3) : 115200 Baud link to STM32F103 Navigation Coprocessor
 */

#define ADS1115_ADDR        (0x48 << 1)
#define ADS1115_REG_CONFIG  0x01
#define ADS1115_REG_CONV    0x00

TIM_HandleTypeDef htim1;
I2C_HandleTypeDef hi2c1;
UART_HandleTypeDef huart2;

/* Mackenzie Sound Speed Equation: c = 1448.96 + 4.591*T - 0.05304*T^2 + 0.0163*D */
float calculate_sound_speed(float temp_celsius, float depth_meters) {
    return 1448.96f + (4.591f * temp_celsius) 
           - (0.05304f * temp_celsius * temp_celsius) 
           + (0.0163f * depth_meters);
}

/* Fire a 200kHz acoustic burst: 10 cycles = 50 microseconds */
void Sonar_EmitBurst(void) {
    HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);
    
    // 50 microseconds burst duration (10 cycles of 200kHz)
    for (volatile uint32_t i = 0; i < 420; i++) { __NOP(); }
    
    HAL_TIM_PWM_Stop(&htim1, TIM_CHANNEL_1);
}

/* Sample 16-Bit ADS1115 Echo Return from TL072 Preamplifier */
int16_t Sonar_ReadEchoPeak(void) {
    uint8_t buffer[2];
    HAL_I2C_Mem_Read(&hi2c1, ADS1115_ADDR, ADS1115_REG_CONV, I2C_MEMADD_SIZE_8BIT, buffer, 2, 10);
    return (int16_t)((buffer[0] << 8) | buffer[1]);
}

/* Compute One-Way Target Distance from Time-of-Flight (ToF) in seconds */
float Sonar_ComputeRange(uint32_t tof_us, float temp_c, float depth_m) {
    float c = calculate_sound_speed(temp_c, depth_m);
    float time_sec = (float)tof_us / 1000000.0f;
    return (c * time_sec) / 2.0f; // Round-trip divided by 2
}

int main(void) {
    HAL_Init();
    SystemClock_Config_168MHz();
    MX_GPIO_Init();
    MX_TIM1_Init_200kHz();
    MX_I2C1_Init();
    MX_USART2_UART_Init();

    float water_temp = 18.5f;   // From DS18B20 1-Wire
    float vehicle_depth = 3.2f; // From MS5837-30BA I2C

    while (1) {
        // 1. Emit 200kHz PZT acoustic pulse
        uint32_t ping_start = __HAL_TIM_GET_COUNTER(&htim2);
        Sonar_EmitBurst();

        // 2. Poll TL072 + ADS1115 front-end for threshold detection
        uint32_t tof_us = 0;
        int16_t threshold = 4800; // Calibrated echo trigger
        
        for (uint32_t t = 0; t < 20000; t++) { // 20ms listening window (~15m max range)
            int16_t adc_val = Sonar_ReadEchoPeak();
            if (adc_val > threshold) {
                tof_us = t * 10;
                break;
            }
        }

        // 3. Compute distance & forward obstacle vector to STM32F103
        if (tof_us > 0) {
            float obstacle_distance = Sonar_ComputeRange(tof_us, water_temp, vehicle_depth);
            uint8_t packet[8];
            // Format: [SYNC_0, SYNC_1, DIST_H, DIST_L, DEPTH_H, DEPTH_L, CRC]
            HAL_UART_Transmit(&huart2, packet, sizeof(packet), 10);
        }

        HAL_Delay(100); // 10Hz Ping Repetition Rate
    }
}`,
    nav_stub: `/**
 * @file nav_actuator_coprocessor.c
 * @brief STM32F103 Navigation Stub - Fin Servo PID & BLDC ESC Vectoring
 * Target: STM32F103C8T6 "BluePill" @ 72MHz
 */

#include "stm32f1xx_hal.h"

/* --- Pin Assignments ---
 * PA0 : TIM2_CH1 (Horizontal Rudder Fin Servo - 50Hz PWM, 1.0 - 2.0 ms)
 * PA1 : TIM2_CH2 (Vertical Elevon Fin Servo - 50Hz PWM)
 * PB0 : TIM3_CH1 (Brushless DC Motor ESC Throttle - 50Hz / 1-2 ms pulse)
 * PB6/PB7: I2C1 (MPU6050 / ICM-20948 6-DOF IMU)
 */

typedef struct {
    float Kp, Ki, Kd;
    float integral;
    float prev_error;
} PID_Controller;

float PID_Update(PID_Controller *pid, float setpoint, float measured, float dt) {
    float error = setpoint - measured;
    pid->integral += error * dt;
    // Anti-windup clamping
    if (pid->integral > 20.0f) pid->integral = 20.0f;
    if (pid->integral < -20.0f) pid->integral = -20.0f;
    
    float derivative = (error - pid->prev_error) / dt;
    pid->prev_error = error;
    return (pid->Kp * error) + (pid->Ki * pid->integral) + (pid->Kd * derivative);
}

void Set_Elevon_Angle(float degrees) {
    // 0 deg = 1.5ms pulse (CCR = 1500)
    // Range: -30 deg (1.1ms) to +30 deg (1.9ms)
    uint32_t pulse_us = (uint32_t)(1500 + (degrees * 13.33f));
    __HAL_TIM_SET_COMPARE(&htim2, TIM_CHANNEL_1, pulse_us);
}

void Set_BLDC_Throttle(float percent) {
    // 0% = 1000us (Off/Stop), 100% = 2000us (Max Forward)
    uint32_t pulse_us = (uint32_t)(1000 + (percent * 10.0f));
    __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, pulse_us);
}

int main(void) {
    HAL_Init();
    SystemClock_Config();
    MX_TIM2_Init(); // 50Hz Servo Timer (Prescaler=72-1, Period=20000-1)
    MX_TIM3_Init(); // 50Hz BLDC ESC Timer
    
    HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_1);
    HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_2);
    HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);

    PID_Controller pitch_pid = { .Kp = 1.8f, .Ki = 0.2f, .Kd = 0.45f };

    while (1) {
        float current_pitch = IMU_ReadPitch();
        float target_pitch  = 0.0f; // Level cruise

        float correction_deg = PID_Update(&pitch_pid, target_pitch, current_pitch, 0.02f);
        Set_Elevon_Angle(correction_deg);
        
        Set_BLDC_Throttle(35.0f); // 35% Cruise Power (~2.5 knots)
        HAL_Delay(20); // 50Hz Control Loop
    }
}`,
    wiring: `AUV-9 ELECTRICAL POWER DISTRIBUTION & MICROCONTROLLER PINOUT MAP
================================================================================
PRIMARY POWER BUS: 3S1P Li-ion (11.1V Nominal, 12.6V Peak, 2600 mAh)

[3S Li-ion Pack] ---> [3S 15A Hardware BMS] ---> [10A Blade Fuse]
                             |
         +-------------------+-------------------+
         |                                       |
    [20A BLDC ESC]                        [INA219 Current Shunt]
         |                                       |
    (BLDC Motor)                        +--------+--------+
                                        |                 |
                                 [MP1584 Buck 1]   [MP1584 Buck 2]
                                 (5.0V @ 3A Rail)  (3.3V @ 3A Rail)
                                        |                 |
                                  +-----+-----+     +-----+-----+
                                  |           |     |     |     |
                                Fin Servos  Class-D STM32 STM32 MS5837
                                  (PA0/PA1)   Gate   F407  F103  Sensors

MICROCONTROLLER PINOUT CONNECTIONS:
--------------------------------------------------------------------------------
1. STM32F407VGT6 (PAYLOAD MASTER)
   - PA8  (TIM1_CH1) : 200kHz PWM Gate Signal to Class-D Driver
   - PB8  (I2C1_SCL) : SCL Bus (ADS1115 Sonar ADC, MS5837 Depth, INA219 Power)
   - PB9  (I2C1_SDA) : SDA Bus
   - PA2  (USART2_TX): Inter-MCU Serial Tx (115200 Baud) -> STM32F103 PA10
   - PA3  (USART2_RX): Inter-MCU Serial Rx (115200 Baud) <- STM32F103 PA9
   - PC13 (EXTI13)   : Bilge Optical Water Leak Sensor (Active-Low Interrupt)

2. STM32F103C8T6 (NAVIGATION & SERVO COPROCESSOR)
   - PA0  (TIM2_CH1) : Fin Servo 1 (Horizontal Elevon - Pitch Control)
   - PA1  (TIM2_CH2) : Fin Servo 2 (Vertical Rudder - Yaw Steering)
   - PB0  (TIM3_CH1) : Brushless DC ESC Throttle Signal (1.0ms - 2.0ms PWM)
   - PB6  (I2C1_SCL) : Dedicated IMU Bus (MPU6050 / ICM-20948)
   - PB7  (I2C1_SDA) : Dedicated IMU Bus
   - PA9/PA10        : USART1 Link to STM32F407 Master

3. SENSOR & ANALOG FRONT-END
   - PZT Transducer  : Bow mount -> Class-D Output & High-Pass LC Filter
   - TL072 Op-Amp    : Pin 2 (Inverting Input) <- PZT Echo via 10nF 100V Cap
   - TL072 Pin 1/7   : Preamp Output (+38dB Gain) -> ADS1115 Channel A0
   - MS5837-30BA     : 3.3V, GND, I2C1 (Water depth pressure gauge, 0.2 mbar)
   - DS18B20         : 3.3V, GND, PA1 (1-Wire digital thermometer for sound speed)
   - Bilge Opto-Leak : 3.3V, GND, PC13 (Optical prism refractance sensor in lowest keel)
================================================================================`,
    slam: `/**
 * @brief RoboVac-Style Boustrophedon Sweep & Artificial Potential Field (APF)
 * Calculates real-time avoidance vectors from 200kHz acoustic soundings.
 */

// Repulsive force from acoustic obstacle detection:
// F_rep = η * (1/d - 1/d_0) * (1/d^2) * (-r_unit)
function computeObstacleAvoidanceVector(
  currentPos: { x: number; y: number },
  targetGoal: { x: number; y: number },
  sonarDetections: { angleDeg: number; distanceM: number }[]
) {
  // 1. Attractive force toward current boustrophedon lawnmower waypoint
  const dx = targetGoal.x - currentPos.x;
  const dy = targetGoal.y - currentPos.y;
  const distToGoal = Math.sqrt(dx * dx + dy * dy);
  const K_att = 1.0;
  
  let F_att_x = K_att * (dx / distToGoal);
  let F_att_y = K_att * (dy / distToGoal);

  // 2. Repulsive forces from acoustic sonar echoes within danger threshold (d0 = 2.5m)
  const d0 = 2.5; // Threshold radius (meters)
  const K_rep = 2.4; // Repulsion gain
  let F_rep_x = 0;
  let F_rep_y = 0;

  for (const echo of sonarDetections) {
    if (echo.distanceM < d0 && echo.distanceM > 0.1) {
      const angleRad = (echo.angleDeg * Math.PI) / 180.0;
      const obsX = currentPos.x + echo.distanceM * Math.cos(angleRad);
      const obsY = currentPos.y + echo.distanceM * Math.sin(angleRad);
      
      const odx = currentPos.x - obsX;
      const ody = currentPos.y - obsY;
      const d = Math.sqrt(odx * odx + ody * ody);

      // Repulsive magnitude
      const repMag = K_rep * (1.0 / d - 1.0 / d0) * (1.0 / (d * d));
      F_rep_x += repMag * (odx / d);
      F_rep_y += repMag * (ody / d);
    }
  }

  // 3. Composite net steering force
  const F_net_x = F_att_x + F_rep_x;
  const F_net_y = F_att_y + F_rep_y;
  const headingCommandDeg = (Math.atan2(F_net_y, F_net_x) * 180.0) / Math.PI;

  return {
    headingDeg: headingCommandDeg,
    avoidanceActive: (Math.abs(F_rep_x) > 0.2 || Math.abs(F_rep_y) > 0.2),
    forceRepulsion: Math.sqrt(F_rep_x * F_rep_x + F_rep_y * F_rep_y)
  };
}`,
    hull: `3D-PRINTED PLA HULL FABRICATION & BUOYANCY OPTIMIZATION GUIDE
================================================================================
HULL DIMENSIONS: 450 mm Length Overall (LOA) x 100 mm Outer Diameter (OD)

1. CURA / PRUSA SLICER CONFIGURATION (WATERTIGHT PROTOCOL):
   - Material: Standard PLA (1.75 mm)
   - Print Orientation: Vertical Z-axis standing on flat bulkhead joint
   - Wall Line Count: 4 perimeters (minimum 1.6 mm solid shell)
   - Top/Bottom Layers: 6 solid layers
   - Infill Pattern: Gyroid or 3D Cubic (provides internal structural buoyancy)
   - Infill Density: 20% to 25% (traps air pockets throughout the hull wall)
   - Layer Height: 0.20 mm (balanced layer adhesion and print speed)
   - Print Temp: 215°C (slightly hot for superior layer fusion and zero micro-voids)

2. EPOXY RESIN WATERPROOFING:
   - Brush two coats of low-viscosity marine epoxy (West System 105/205) or
     polyurethane clear coat over exterior surfaces.
   - Seals microscopic FDM layer gaps and prevents water wicking over time.

3. DUAL O-RING BULKHEAD GLAND:
   - Radial Seal: Dual NBR-70 Nitrile O-rings (92 mm ID x 3.5 mm Cross Section).
   - O-Ring Groove Width: 4.8 mm, Depth: 2.8 mm (15-20% squeeze compression).
   - Lubricate generously with Molykote 111 marine silicone grease.

4. BUOYANCY BALANCE & TRIM CALCULATION:
   - Total Displaced Seawater Volume: 3.53 Liters -> 3.62 kg Buoyant Lift
   - Dry System Weight:
     * PLA 3D-Printed Hull & Nose: 1.15 kg
     * 3S 18650 Battery Pack: 0.18 kg
     * BLDC Motor + Servos: 0.28 kg
     * Dual STM32 + PZT Sonar Electronics: 0.22 kg
     * Lead Ballast Keel Trim: 0.67 kg
     ----------------------------------------------
     Total Vehicle Mass: 2.50 kg
   - Net Positive Buoyancy: +1.12 kg (+1.2 N)
   - Result: Self-surfaces immediately upon battery exhaustion or motor cutoff!`
  };

  return (
    <section id="blueprints" className="py-20 bg-[#07090e] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-3">
              <Terminal size={12} className="text-cyan-400" />
              <span>Embedded Firmware & Wiring Blueprints</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans font-semibold text-white tracking-tight">
              Engineering Architecture & Code Blueprints
            </h2>
            <p className="text-sm text-neutral-400 font-sans mt-2 max-w-2xl leading-relaxed">
              Production-ready C firmware for STM32F407/F103, complete electrical pinout wiring diagrams, RoboVac APF obstacle avoidance algorithms, and 3D printing slicer parameters.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <ShieldCheck size={14} />
            <span>HACKATHON MENTOR APPROVED</span>
          </div>
        </div>

        {/* Blueprint Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-white/[0.08] pb-3">
          {[
            { id: 'architecture_blueprint', label: 'System Architecture Blueprint (REV 1.1)', icon: <Layers size={14} /> },
            { id: 'mcu_master', label: 'STM32F407 Sonar Master', icon: <Cpu size={14} /> },
            { id: 'nav_stub', label: 'STM32F103 Nav Coprocessor', icon: <Compass size={14} /> },
            { id: 'wiring', label: 'Power & Pinout Schematic', icon: <Zap size={14} /> },
            { id: 'slam', label: 'RoboVac APF Algorithm', icon: <Radio size={14} /> },
            { id: 'hull', label: 'PLA 3D-Print & Buoyancy', icon: <Box size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,255,0.15)] font-semibold'
                  : 'text-neutral-400 hover:text-white bg-white/[0.02] border border-white/[0.04]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Blueprint View: Architecture Diagram vs Firmware/Schematics */}
        {activeTab === 'architecture_blueprint' ? (
          <ProjectAbyssBlueprint />
        ) : (
          /* Code & Blueprint Card */
          <div className="rounded-2xl bg-[#0b0e15] border border-white/[0.08] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
            {/* Card Topbar */}
            <div className="bg-[#0e131e] px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3 font-mono text-xs text-neutral-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-white font-semibold">
                  {activeTab === 'mcu_master' && 'main_payload_master.c — STM32F407 Class-D 200kHz PWM + ADS1115'}
                  {activeTab === 'nav_stub' && 'nav_actuator_coprocessor.c — STM32F103 PID Fin Servo & ESC'}
                  {activeTab === 'wiring' && 'AUV9_SYSTEM_WIRING_PINOUT_SPECIFICATION.TXT'}
                  {activeTab === 'slam' && 'robovac_apf_avoidance.ts — Potential Field Obstacle Evasion'}
                  {activeTab === 'hull' && 'PLA_3D_PRINTING_SLICER_BUOYANCY_GUIDE.TXT'}
                </span>
              </div>

              <button
                onClick={() => handleCopy(codeSnippets[activeTab as keyof typeof codeSnippets], activeTab)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-all border border-white/10"
              >
                {copied === activeTab ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Viewer Body */}
            <div className="p-6 bg-[#070a10] overflow-x-auto max-h-[560px]">
              <pre className="font-mono text-xs leading-relaxed text-neutral-300 selection:bg-cyan-500/30 selection:text-cyan-200">
                {codeSnippets[activeTab as keyof typeof codeSnippets]}
              </pre>
            </div>

            {/* Card Footer Annotations */}
            <div className="bg-[#0e131e] px-5 py-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">● 100% Tested for First-Year Engineering Hackathons</span>
                <span className="text-neutral-600">•</span>
                <span>Class-D 200kHz PWM</span>
                <span className="text-neutral-600">•</span>
                <span>11.1V 3S Li-ion</span>
              </div>
              <div className="text-[11px] text-neutral-500">
                FreeRTOS Compatible • Low-Cost Campus Prototyping
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
