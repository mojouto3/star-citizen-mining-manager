/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MINING_MATERIALS } from "../data/miningData";
import { MiningMaterial } from "../types";
import { Search, MapPin, ShieldAlert, Award, Calculator, TrendingUp } from "lucide-react";

export function MaterialsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<MiningMaterial>(MINING_MATERIALS[0]);
  const [scuQuantity, setScuQuantity] = useState<number>(32); // Default Prospector size

  const filteredMaterials = MINING_MATERIALS.filter((mat) => {
    const term = searchTerm.toLowerCase();
    return (
      mat.name.toLowerCase().includes(term) ||
      mat.locations.some((loc) => loc.toLowerCase().includes(term))
    );
  });

  const rawValue = scuQuantity * selectedMaterial.baseValueRaw;
  const refinedValue = scuQuantity * selectedMaterial.baseValueRefined;
  const refineryProfit = refinedValue - rawValue;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sc_materials_section">
      {/* Sidebar: Material List */}
      <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col h-[650px]" id="materials_sidebar">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <h3 className="font-sans text-lg font-semibold tracking-wide text-amber-500 flex items-center gap-2 mb-4">
          <Award className="w-5 h-5" />
          <span>Mining Ores & Materials</span>
        </h3>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search ores, locations, or tiers..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List of Materials */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
          {filteredMaterials.map((mat) => {
            const isSelected = selectedMaterial.id === mat.id;
            const isTier1 = mat.tier === "Tier 1";
            const isTier2 = mat.tier === "Tier 2";

            return (
              <button
                key={mat.id}
                onClick={() => setSelectedMaterial(mat)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center justify-between group ${
                  isSelected
                    ? "bg-amber-950/40 border-amber-500/80 text-amber-100 shadow-lg shadow-amber-950/10"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/30"
                }`}
              >
                <div>
                  <div className="font-semibold text-sm tracking-wide mb-0.5 group-hover:text-amber-400 transition-colors">
                    {mat.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{mat.locations[0] || "Stanton Zone"}</div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium tracking-wide ${
                      isTier1
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : isTier2
                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700/50"
                    }`}
                  >
                    {mat.tier}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-500">
                    {mat.baseValueRefined.toLocaleString()} aUEC
                  </span>
                </div>
              </button>
            );
          })}

          {filteredMaterials.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              No mining ores found matching those criteria.
            </div>
          )}
        </div>
      </div>

      {/* Main Panel: Material Details & Calculator */}
      <div className="lg:col-span-7 space-y-6" id="material_details_panel">
        {/* Selected Ore Information */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold text-amber-500 tracking-wider uppercase">
                  {selectedMaterial.tier} Mineral
                </span>
                <span className="text-xs text-slate-500 font-mono">•</span>
                <span className="text-xs font-mono text-slate-400">Purity Factor: {selectedMaterial.weight} Vector</span>
              </div>
              <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-100">
                {selectedMaterial.name}
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 italic">Detailed commodity structure</p>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
              <span className="text-xs text-slate-400">Refined Price:</span>
              <span className="text-2xl font-mono font-black text-amber-500 tracking-tight">
                {selectedMaterial.baseValueRefined.toLocaleString()}{" "}
                <span className="text-xs font-semibold text-slate-400">aUEC/SCU</span>
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-400 font-medium">Instability Signatures</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      selectedMaterial.instability === "Very High"
                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        : selectedMaterial.instability === "High"
                        ? "bg-orange-500"
                        : selectedMaterial.instability === "Medium"
                        ? "bg-yellow-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  {selectedMaterial.instability}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-400 font-medium">Resistance Rating</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      selectedMaterial.resistance === "Very High"
                        ? "bg-red-500"
                        : selectedMaterial.resistance === "High"
                        ? "bg-orange-400"
                        : selectedMaterial.resistance === "Medium"
                        ? "bg-yellow-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  {selectedMaterial.resistance}
                </div>
              </div>
            </div>
          </div>

          {/* Description & Locations */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                Technical Description
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {selectedMaterial.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Habitats & Sourcing Locations</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedMaterial.locations.map((loc, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded font-sans hover:border-amber-500/50 transition-colors"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Value Calculator */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-6 backdrop-blur-md relative overflow-hidden">
          <h3 className="font-sans text-lg font-semibold tracking-wide text-amber-500 flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5" />
            <span>Load Income & Profit Yield Calculator</span>
          </h3>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-slate-400 font-medium">Cargo Volume (SCU):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={scuQuantity}
                    onChange={(e) => setScuQuantity(Math.max(0, Number(e.target.value)))}
                    className="w-16 bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono text-center rounded px-1.5 py-0.5 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-300">SCU</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="120"
                step="1"
                value={scuQuantity}
                onChange={(e) => setScuQuantity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>1 SCU (ROC Vehicle)</span>
                <span>32 SCU (Prospector)</span>
                <span>96 SCU (MOLE Heavy)</span>
                <span>120 SCU (Freelancer Max)</span>
              </div>
            </div>

            {/* Calculations Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Raw Sale Value</span>
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-red-400 inline-block font-mono mb-2">
                    Raw Ore (Unrefined)
                  </span>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-slate-200">
                    {rawValue.toLocaleString()} aUEC
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedMaterial.baseValueRaw} aUEC / SCU
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-lg flex flex-col justify-between border-amber-500/20">
                <div>
                  <span className="text-xs text-amber-400 font-semibold block mb-1">Processed Value</span>
                  <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded text-amber-400 inline-block font-mono mb-2">
                    Refined Ore (Processed)
                  </span>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-amber-400">
                    {refinedValue.toLocaleString()} aUEC
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedMaterial.baseValueRefined} aUEC / SCU
                  </span>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Refinery Profit Surplus</span>
                  </span>
                  <span className="text-[10px] text-slate-405 block mb-2">Refinery Added Value</span>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-emerald-400">
                    +{refineryProfit.toLocaleString()} aUEC
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    +{Math.round((refineryProfit / (rawValue || 1)) * 100)}% value increase
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
