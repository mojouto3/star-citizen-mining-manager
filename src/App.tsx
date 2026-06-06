/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MaterialsSection } from "./components/MaterialsSection";
import { SkafosSection } from "./components/SkafosSection";
import { OperationManager } from "./components/OperationManager";
import { Award, Compass, Landmark, Ship, Shield, Terminal } from "lucide-react";
import { SystemPatchNotes } from "./components/SystemPatchNotes";

export default function App() {
  const [activeTab, setActiveTab] = useState<"operations" | "materials" | "ships">("operations");
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200" id="sc_main_container">
      {/* Interactive Cyber HUD Header */}
      <header className="border-b border-amber-500/20 bg-slate-900/40 backdrop-blur-md relative overflow-hidden" id="app_header">
        {/* Glow behind logo */}
        <div className="absolute top-0 left-10 w-48 h-12 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-950/20 shrink-0">
              <Compass className="w-6 h-6 text-amber-500 animate-spin-slow" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-sans text-xl font-black tracking-wider text-slate-100 uppercase">
                  AETHEROS <span className="text-amber-500">MINING</span>
                </h1>
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                  CO-OP LEDGER v2.4
                </span>
                <button
                  onClick={() => setIsPatchNotesOpen(true)}
                  className="group flex items-center gap-1.5 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/20 hover:border-amber-500/40 text-amber-400 hover:text-amber-300 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wide cursor-pointer transition-all active:scale-95 duration-200"
                  title="View active features list & release patch notes"
                  id="header_patches_trigger"
                >
                  <span className="relative flex h-1.5 w-1.5 mr-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                  <span>SYSTEM LOGS & PATCHES</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Star Citizen Mining Operations & Automatic Profits Distribution Ledger
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80" id="main_navigation">
            {[
              { id: "operations", label: "💼 Operations & Dividends", icon: Landmark },
              { id: "materials", label: "📦 Ore Commodity Guide", icon: Award },
              { id: "ships", label: "🚀 Laser Rig Tuning", icon: Ship },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/15"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                  id={`tab_trigger_${tab.id}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="sc_main_content">
        {activeTab === "operations" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/15 p-4 rounded-xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-1">
                  Cooperative Mining & Payout Ledger
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Coordinate and track who mines (Miner), who hauls raw saddlebags to stations (Raw Hauler), and who routes refined items to TDD terminals for sales (Refine Hauler). The ledger automatically settles out-of-pocket expenses (fuel bills, refinery fees, laser rentals) and formats perfect mo.TRADER transfer instructions for your crew!
                </p>
              </div>
            </div>
            <OperationManager />
          </div>
        )}

        {activeTab === "materials" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-gradient-to-r from-teal-500/10 via-teal-600/5 to-transparent border border-teal-500/15 p-4 rounded-xl flex items-start gap-3">
              <Award className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-1">
                  Ore Commodity Guide & Yield Estimates
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Inspect all mining materials found in the Stanton planetary system & Aaron Halo asteroid cluster. Track instability ratings, resistance levels, local deposits sources, and compare direct Raw vs Processed market values instantly.
                </p>
              </div>
            </div>
            <MaterialsSection />
          </div>
        )}

        {activeTab === "ships" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-gradient-to-r from-cyan-500/10 via-cyan-600/5 to-transparent border border-cyan-500/15 p-4 rounded-xl flex items-start gap-3">
              <Ship className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  Mining Laser & Fitment Tuning
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Simulate advanced laser fitments for the MISC Prospector, ARGO MOLE, or Greycat ROC vehicles. Install different laser heads (Lancet, Helix, Arbor), attach active/passive modules, tune localized rock gadgets, and monitor changes in overall thermal power, instability mitigation, and resistance dampening rules.
                </p>
              </div>
            </div>
            <SkafosSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 py-6 bg-slate-950/80 text-center text-xs text-slate-500 font-sans" id="app_footer">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Aetheros Star Citizen Org Mining Logistics. Designed for Star Citizen Miners & Industrialists Guild.</p>
          <p className="mt-1.5 font-mono text-[10px] text-slate-600">This is an unofficial fan utility. Game assets and indicators are property of Cloud Imperium Games.</p>
        </div>
      </footer>

      {/* Interactive System Diagnostics, Features Registry & Custom Patches Drawer */}
      <SystemPatchNotes isOpen={isPatchNotesOpen} onClose={() => setIsPatchNotesOpen(false)} />
    </div>
  );
}
