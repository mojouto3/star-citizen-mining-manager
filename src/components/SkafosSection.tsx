/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MINING_SHIPS, LASER_HEADS, MINING_MODULES, MINING_GADGETS } from "../data/miningData";
import { MiningShip, LaserHead, MiningModule, MiningGadget } from "../types";
import { Gauge, Ship, Zap, Compass, RotateCcw } from "lucide-react";

export function SkafosSection() {
  const [selectedShip, setSelectedShip] = useState<MiningShip>(MINING_SHIPS[0]);
  const [selectedLaser, setSelectedLaser] = useState<LaserHead>(LASER_HEADS[0]); // Default to Lancet for safety
  const [selectedModules, setSelectedModules] = useState<(MiningModule | null)[]>([null, null, null]);
  const [selectedGadget, setSelectedGadget] = useState<MiningGadget | null>(null);

  // Simulation test state
  const [laserIntensity, setLaserIntensity] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStatus, setSimulationStatus] = useState<string>("Standby");

  // Helper to handle modules attachment
  const handleModuleChange = (index: number, moduleId: string) => {
    const mod = MINING_MODULES.find((m) => m.id === moduleId) || null;
    const nextMods = [...selectedModules];
    nextMods[index] = mod;
    setSelectedModules(nextMods);
  };

  const resetBuild = () => {
    setSelectedLaser(LASER_HEADS[0]); // Lancet
    setSelectedModules([null, null, null]);
    setSelectedGadget(null);
    setLaserIntensity(0);
    setIsSimulating(false);
    setSimulationStatus("Standby");
  };

  // Calculations for total modifiers
  // Modules slots based on selected Ship & Laser head.
  const activeModuleSlots = Math.min(selectedShip.moduleSlotsPerLaser, selectedLaser.moduleSlots);

  // Sum modifiers
  let powerMultiplier = 1;
  let stabilityModifierSum = 0; // Negative is good (reduces instability)
  let resistanceModifierSum = 0; // Negative is good (reduces resistance)
  let optimalWindowMultiplier = 1;

  // 1. Applying Laser head modifiers
  stabilityModifierSum += selectedLaser.instabilityModifier;
  resistanceModifierSum += selectedLaser.resistanceModifier;
  optimalWindowMultiplier *= selectedLaser.optimalWindow;

  // 2. Applying only equipped modules up to allowed slots limit
  selectedModules.slice(0, activeModuleSlots).forEach((mod) => {
    if (mod) {
      powerMultiplier += mod.powerModifier;
      stabilityModifierSum += mod.instabilityModifier;
      resistanceModifierSum += mod.resistanceModifier;
      optimalWindowMultiplier *= (1 + mod.optimalWindowModifier);
    }
  });

  // 3. Applying optionally applied rock gadget
  if (selectedGadget) {
    stabilityModifierSum += selectedGadget.instabilityModifier;
    resistanceModifierSum += selectedGadget.resistanceModifier;
    optimalWindowMultiplier *= (1 + selectedGadget.optimalWindowModifier);
  }

  const finalPower = Math.round(selectedLaser.power * powerMultiplier);
  const finalInstabilityChange = Math.round(stabilityModifierSum * 100);
  const finalResistanceChange = Math.round(resistanceModifierSum * 100);
  const finalGreenZonePercent = Math.round((optimalWindowMultiplier - 1) * 100);

  // Simulate laser firing helper
  const triggerSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStatus("CHARGING COIL CAPACITORS...");
    let charge = 0;
    const interval = setInterval(() => {
      charge += Math.floor(Math.random() * 8) + 4;
      if (charge >= 100) {
        charge = 100;
        setLaserIntensity(charge);
        setSimulationStatus("ROCK REACHED OPTIMAL WINDOW! (ESTABLISHING INTERIOR FRACTURE PRESSURE)");
        clearInterval(interval);
        setTimeout(() => {
          setSimulationStatus("FRACTURE COMPLETED successfully!");
          setIsSimulating(false);
        }, 1500);
      } else {
        setLaserIntensity(charge);
        // Varying statuses
        if (charge > 40 && charge < 80) {
          setSimulationStatus("LASER STABILIZED. HEAT DISSIPATION NOMINAL");
        } else if (charge >= 80) {
          setSimulationStatus("MAX SPECTRAL PRESSURE ACCUMULATING... STANDBY");
        }
      }
    }, 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sc_ships_section">
      {/* Ship & Equipment Selector */}
      <div className="lg:col-span-8 space-y-6" id="ship_tuning_panel">
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <h3 className="font-sans text-lg font-semibold tracking-wide text-amber-500 flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-5">
            <span className="flex items-center gap-2">
              <Ship className="w-5 h-5" />
              <span>Ship Customization & Module Config</span>
            </span>
            <button
              onClick={resetBuild}
              className="text-xs bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-amber-500 border border-slate-800 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Build
            </button>
          </h3>

          {/* Select Platform Ship */}
          <div className="space-y-4 mb-6">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              1. Choose Mining Platform
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {MINING_SHIPS.map((ship) => {
                const isSelected = selectedShip.id === ship.id;
                return (
                  <button
                    key={ship.id}
                    onClick={() => {
                      setSelectedShip(ship);
                      // Adjust modules array size if ship changes
                      setSelectedModules(Array(ship.moduleSlotsPerLaser).fill(null));
                    }}
                    className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-200 ${
                      isSelected
                        ? "bg-amber-950/30 border-amber-500 text-amber-100 shadow-md"
                        : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-mono font-bold text-slate-500 mb-1 uppercase tracking-wide">
                      {ship.type === "ship" ? "Spaceship" : "Ground Unit"}
                    </div>
                    <div className="text-sm font-bold tracking-tight mb-2 truncate">
                      {ship.name}
                    </div>
                    <div className="text-xs font-mono text-slate-400 flex justify-between">
                      <span>Cargo Bag:</span>
                      <span className="text-amber-500 font-bold">{ship.scuCapacity} SCU</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 font-sans italic mt-1">
              * {selectedShip.description}
            </p>
          </div>

          {/* Select laser head */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800/60 pt-5">
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                2. Mining Laser Head
              </label>
              <div className="space-y-2">
                {LASER_HEADS.map((laser) => {
                  const isSelected = selectedLaser.id === laser.id;
                  return (
                    <button
                      key={laser.id}
                      onClick={() => setSelectedLaser(laser)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-amber-950/20 border-amber-600 text-amber-100"
                          : "bg-slate-950/30 border-slate-850 hover:border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold font-sans">{laser.name}</span>
                        <span className="text-[10px] font-mono text-amber-500 font-bold">
                          {laser.power} W
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans line-clamp-1">
                        {laser.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select modules slots based on what is allowed */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  3. Upgrades & Modules
                </label>
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded font-mono font-bold">
                  Available Upgraded Slots: {activeModuleSlots} / 3
                </span>
              </div>

              {activeModuleSlots === 0 ? (
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-lg text-center text-xs text-slate-500">
                  This ground vehicle layout (ROC/Ground) does not support mining laser upgrade modules.
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: activeModuleSlots }).map((_, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-xs font-mono font-bold text-slate-500 w-16 shrink-0">
                        Slot #{index + 1}:
                      </span>
                      <select
                        onChange={(e) => handleModuleChange(index, e.target.value)}
                        value={selectedModules[index]?.id || ""}
                        className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">-- [ EMPTY Upgraded Slot ] --</option>
                        {MINING_MODULES.map((mod) => (
                          <option key={mod.id} value={mod.id}>
                            {mod.name} ({mod.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-505 font-sans leading-relaxed">
                    * Passive modules provide persistent performance buffs, while Active modules require cockpit hotkey triggering during critical laser pressure build stages.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Select Gadgets on the Rock */}
          <div className="border-t border-slate-800/60 pt-5 mt-5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
              4. Rock Gadget Calibration
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setSelectedGadget(null)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedGadget === null
                    ? "bg-amber-950/20 border-amber-600 text-amber-100"
                    : "bg-slate-950/30 border-slate-850 hover:border-slate-800 text-slate-400"
                }`}
              >
                <div className="text-xs font-bold mb-1">No Gadget Applied</div>
                <div className="text-[10px] text-slate-500">No external gadget calibrated.</div>
              </button>

              {MINING_GADGETS.map((gad) => {
                const isSelected = selectedGadget?.id === gad.id;
                return (
                  <button
                    key={gad.id}
                    onClick={() => setSelectedGadget(gad)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-amber-950/20 border-amber-600 text-amber-100"
                        : "bg-slate-950/30 border-slate-850 hover:border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1 line-clamp-1">{gad.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {gad.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Analysis Panel & Interactive LASER HUD */}
      <div className="lg:col-span-4 space-y-6" id="ship_stats_hud_panel">
        {/* Realtime Calculated Stats */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 backdrop-blur-md text-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Gauge className="w-4 h-4" />
            <span>Telemetry & Modifiers (Calculated Stats)</span>
          </h3>

          <div className="space-y-4">
            {/* 1. Laser Power */}
            <div className="bg-slate-950/60 border border-slate-850/80 p-3 rounded-lg">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-medium">Effective Laser Power:</span>
                <span className="font-mono font-bold text-amber-400">{finalPower} W</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (finalPower / 4000) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>0 W</span>
                <span>Max: 4000 W</span>
              </div>
            </div>

            {/* 2. Instability reduction */}
            <div className="bg-slate-950/60 border border-slate-850/80 p-3 rounded-lg">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-medium">Rock Instability Modifier:</span>
                <span
                  className={`font-mono font-bold ${
                    finalInstabilityChange < 0 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {finalInstabilityChange > 0 ? `+${finalInstabilityChange}%` : `${finalInstabilityChange}%`}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    finalInstabilityChange < 0 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.max(10, Math.min(100, 50 - finalInstabilityChange / 2))}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1 font-sans">
                * Negatives are highly beneficial. Lower stability keeps rock heat transitions smooth.
              </p>
            </div>

            {/* 3. Resistance reduction */}
            <div className="bg-slate-950/60 border border-slate-850/80 p-3 rounded-lg">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-medium">Rock Resistance Modifier:</span>
                <span
                  className={`font-mono font-bold ${
                    finalResistanceChange < 0 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {finalResistanceChange > 0 ? `+${finalResistanceChange}%` : `${finalResistanceChange}%`}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(10, Math.min(100, 50 - finalResistanceChange / 2))}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1 font-sans">
                * High mass deposits (e.g., Quantainium &gt;8,000 kg) usually require Lancet laser heads or Surge active modules.
              </p>
            </div>

            {/* 4. Green Zone bonus */}
            <div className="bg-slate-950/60 border border-slate-850/80 p-3 rounded-lg">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-medium">Optimal Window 'Green Zone' Gain:</span>
                <span className="font-mono font-bold text-emerald-400">+{finalGreenZonePercent}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, 20 + finalGreenZonePercent / 1.5)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cockpit HUD Interactive Laser Simulator */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-[250px] border-amber-500/30">
          {/* Laser grids lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          <div className="relative flex justify-between items-center border-b border-amber-500/20 pb-2 mb-3">
            <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>COCKPIT LASER EMITTER HUD v3.2</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">ACTIVE: {selectedShip.name}</span>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4 relative z-10">
            {/* Visual simulation status text */}
            <div className="text-center">
              <div className="text-xs font-mono text-amber-400 uppercase tracking-widest h-8 flex items-center justify-center font-bold px-4">
                {simulationStatus}
              </div>
            </div>

            {/* Visual feedback progress bar */}
            <div>
              <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-1">
                <span>LASER CHARGE CAPACITOR</span>
                <span>{laserIntensity}%</span>
              </div>
              <div className="w-full bg-slate-900 h-4 rounded border border-amber-500/20 p-0.5 overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-75 flex items-center justify-end pr-2 overflow-hidden ${
                    laserIntensity > 90
                      ? "bg-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                      : laserIntensity > 60
                      ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                      : "bg-teal-500/80"
                  }`}
                  style={{ width: `${laserIntensity}%` }}
                >
                  {laserIntensity > 15 && (
                    <span className="text-[8px] font-mono text-slate-950 font-extrabold animate-pulse">
                      STATUS: EMITTING
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 relative z-10">
            <button
              onClick={triggerSimulation}
              disabled={isSimulating}
              className={`w-full py-2 ${isSimulating ? "bg-amber-500/10 text-amber-500 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/15"} rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2`}
              style={isSimulating ? { background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", cursor: "not-allowed" } : {}}
            >
              <Compass className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
              {isSimulating ? "Simulating..." : "Fire Test Laser Simulator"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
