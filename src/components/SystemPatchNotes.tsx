import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Terminal, 
  History, 
  Layers, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle, 
  Cpu, 
  ChevronRight, 
  Sparkles,
  Info
} from "lucide-react";

export interface PatchNote {
  id: string;
  version: string;
  date: string;
  title: string;
  notes: string[];
  category: "added" | "fixed" | "improved" | "system";
}

const DEFAULT_PATCH_NOTES: PatchNote[] = [
  {
    id: "patch-new",
    version: "v3.2.0",
    date: "June 03, 2026",
    title: "Crew Dispatch Routing & Exact Share Normalization Tools",
    category: "added",
    notes: [
      "Implemented a scouted target allocation option, allowing logs to assign target rock-clusters directly to specific fleet miner ships with Live traveler statuses (Travel/Mining/Standby).",
      "Introduced live toggleable crew operational state badges (Standby, Scouting, Mining, Hauling, Refining) next to names so the entire crew is informed of active location statuses.",
      "Engineered an elegant share distribution visualizer in the Crew Config modal alongside a one-click automatic normalization button to scale and balance split weights to exactly 100%."
    ]
  },
  {
    id: "patch-3.1.0",
    version: "v3.1.0",
    date: "June 02, 2026",
    title: "Expanded Mining Fleet Database & Handheld Attachment Support",
    category: "added",
    notes: [
      "Integrated heavy industrial and capital class vessels (RSI Arrastra, RSI Orion) with high SCU capacities and official turret slot configurations.",
      "Added native support for specialized handheld gemstone mining utilizing the Pyro RYT Multi-Tool with OreBit attachment.",
      "Expanded co-op operations selector list to support all newly integrated fleet ships dynamically for crew enlistment."
    ]
  },
  {
    id: "patch-0",
    version: "v3.0.0",
    date: "June 02, 2026",
    title: "Multi-System Refinery Jurisdictions & Real-Time Yield Schedules",
    category: "added",
    notes: [
      "Integrated authentic Star Citizen Lagrange and Pyro/Magnus system refinery databases.",
      "Engineered real-world time countdown simulations mapped key-for-key to in-game refinery speeds.",
      "Secured Refinery Locks that disable manual bypass keys to enforce strictly realistic schedule tracking.",
      "Introduced detailed transaction ledger checkboxes to wire and settle dividends via mo.TRADER orders visually."
    ]
  },
  {
    id: "patch-1",
    version: "v2.4.1",
    date: "June 01, 2026",
    title: "Laser Simulator & Mass Calibration Fix",
    category: "fixed",
    notes: [
      "Resolved className render block inside Lancet recommendation conditions.",
      "Optimized active module indicator colors on high mass asteroid deposits (>8,000 kg).",
      "Corrected special character encoding glitches in HTML-safety tags inside vehicle cards."
    ]
  },
  {
    id: "patch-2",
    version: "v2.4.0",
    date: "May 28, 2026",
    title: "Advanced Mining Rock Gadgets",
    category: "added",
    notes: [
      "Added support for planetary mining rock gadgets: Magnus, Optimus, Wave, and Saboteur.",
      "Integrated dynamic module variables to instantly calculate laser instability mitigation curves.",
      "Created optimal extraction window safety timers based on vehicle capacity bounds."
    ]
  },
  {
    id: "patch-3",
    version: "v2.3.5",
    date: "May 20, 2026",
    title: "mo.TRADER Command Generator",
    category: "improved",
    notes: [
      "Upgraded copy-to-clipboard functionality to automatically inject exact Star Citizen console chat inputs.",
      "Formulated payout list strings with safety buffers for cooperative members without aUEC fees.",
      "Added individual ledger items tracking to mark transactions as complete directly from the panel."
    ]
  },
  {
    id: "patch-4",
    version: "v2.3.0",
    date: "May 12, 2026",
    title: "Interactive Raw vs Refined Calculator",
    category: "added",
    notes: [
      "Engineered dynamic profit comparison sliders for materials such as Quantainium and Bexalite.",
      "Introduced visual refinery feedback markers highlighting current yield premiums (%) for each item.",
      "Configured Aaron Halo and Stanton planetary deposit filters to easily locate high-tier ores."
    ]
  },
  {
    id: "patch-5",
    version: "v2.2.0",
    date: "May 03, 2026",
    title: "ARGO MOLE Multi-Crew Simulator",
    category: "improved",
    notes: [
      "Expanded laser fitment grids to fully support three concurrent laser configurations for ARGO MOLE fits.",
      "Implemented quick-filters to easily switch tuning setups between MISC Prospector and ROC vehicles.",
      "Stored laser fitting parameters locally in client state to preserve configurations between tab switches."
    ]
  }
];

interface SystemPatchNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemPatchNotes({ isOpen, onClose }: SystemPatchNotesProps) {
  const [activeTab, setActiveTab] = useState<"features" | "patches">("features");
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  
  // Custom Form State
  const [userVersion, setUserVersion] = useState("");
  const [userTitle, setUserTitle] = useState("");
  const [userDate, setUserDate] = useState("");
  const [userNotesText, setUserNotesText] = useState("");
  const [userCategory, setUserCategory] = useState<"added" | "fixed" | "improved" | "system">("added");
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  
  // Custom confirm state
  const [resetConfirmActive, setResetConfirmActive] = useState(false);

  // Load from localStorage or save default
  useEffect(() => {
    const saved = localStorage.getItem("aetheros_patch_notes");
    if (saved) {
      try {
        setPatchNotes(JSON.parse(saved));
      } catch (e) {
        setPatchNotes(DEFAULT_PATCH_NOTES);
      }
    } else {
      setPatchNotes(DEFAULT_PATCH_NOTES);
      localStorage.setItem("aetheros_patch_notes", JSON.stringify(DEFAULT_PATCH_NOTES));
    }
  }, []);

  // Sync to LS when updated
  const updatePatchNotes = (newNotes: PatchNote[]) => {
    setPatchNotes(newNotes);
    localStorage.setItem("aetheros_patch_notes", JSON.stringify(newNotes));
  };

  const handleAddPatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userVersion || !userTitle || !userNotesText) {
      setStatusMessage("⚠️ Please fill in all required fields.");
      return;
    }

    const bulletPoints = userNotesText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (bulletPoints.length === 0) {
      setStatusMessage("⚠️ Please enter at least one patch note bullet point.");
      return;
    }

    const dateStr = userDate || new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "2-digit" 
    });

    const newPatch: PatchNote = {
      id: `custom-patch-${Date.now()}`,
      version: userVersion.startsWith("v") ? userVersion : `v${userVersion}`,
      date: dateStr,
      title: userTitle,
      category: userCategory,
      notes: bulletPoints
    };

    const updated = [newPatch, ...patchNotes];
    updatePatchNotes(updated);

    // Reset Form
    setUserVersion("");
    setUserTitle("");
    setUserDate("");
    setUserNotesText("");
    setUserCategory("added");
    setShowAddForm(false);
    setStatusMessage("✅ New patch deployed to system log successfully!");
    
    setTimeout(() => {
      setStatusMessage("");
    }, 4000);
  };

  const handleDeletePatch = (id: string) => {
    const filtered = patchNotes.filter(p => p.id !== id);
    updatePatchNotes(filtered);
    setStatusMessage("🗑️ Patch note deleted from local log");
    setTimeout(() => setStatusMessage(""), 2000);
  };

  const handleResetDefaults = () => {
    if (!resetConfirmActive) {
      setResetConfirmActive(true);
      setTimeout(() => setResetConfirmActive(false), 3500);
      return;
    }
    updatePatchNotes(DEFAULT_PATCH_NOTES);
    setStatusMessage("🔄 Core database restored.");
    setTimeout(() => setStatusMessage(""), 2000);
    setResetConfirmActive(false);
  };

  // Render Category Badge
  const renderCategoryBadge = (category: PatchNote["category"]) => {
    switch (category) {
      case "added":
        return (
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider">
            [ADDED]
          </span>
        );
      case "fixed":
        return (
          <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider">
            [FIXED]
          </span>
        );
      case "improved":
        return (
          <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider">
            [IMPROVED]
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider">
            [SYSTEM]
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            id="patch_notes_backdrop"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg md:max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden text-slate-100"
            id="patch_notes_panel"
          >
            {/* High Tech Header */}
            <div className="p-6 border-b border-amber-500/20 bg-slate-950 relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-mono text-sm tracking-widest uppercase font-bold text-slate-100 flex items-center gap-1.5">
                      SYSTEM PANEL <span className="text-amber-500">v3.2.0</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5 uppercase tracking-wider">
                      Core Operations Registry & Deployment Log
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-all"
                  id="close_patches_btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className="mt-4 p-2 bg-slate-900 border border-amber-500/20 rounded font-mono text-xs text-amber-400 text-center animate-pulse">
                  {statusMessage}
                </div>
              )}

              {/* HUD Tabs Navigation */}
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800/80 mt-5">
                <button
                  onClick={() => { setActiveTab("features"); setShowAddForm(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-mono text-xs font-bold transition-all ${
                    activeTab === "features"
                      ? "bg-amber-500 text-slate-950"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_sys_features"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>APP FEATURES ({4})</span>
                </button>
                <button
                  onClick={() => setActiveTab("patches")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-mono text-xs font-bold transition-all ${
                    activeTab === "patches"
                      ? "bg-amber-500 text-slate-950"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_sys_patches"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>PATCH NOTES ({patchNotes.length})</span>
                </button>
              </div>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
              
              {/* Tab 1: APPS FEATURES LIST */}
              {activeTab === "features" && (
                <div className="space-y-6" id="features_list_view">
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/50">
                    <div className="flex gap-2.5 items-start">
                      <Cpu className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-widest">
                          Aetheros Operational Systems
                        </h3>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                          List and status of fully implemented core systems within the ledger environment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 1. OPERATIONS LEDGER */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider">
                          1. Operations & Payouts Engine
                        </h4>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                        ACTIVE
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300 font-sans">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Roles Assignments:</strong> Setup specific crew configurations with Miner, Raw Hauler, Refine Hauler, and Refined Purchaser flags.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Accrued Expenses:</strong> Log fuel, logistics, and refining fees details. Automatically reimburses the specific funding player directly from the gross profit.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Smart Dividend Math:</strong> Dynamically calculates proportional cuts using custom parameters, deducting costs to present final clear net percentages for all crew members.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>mo.TRADER Exporter:</strong> Automatically copies perfect Star Citizen gameplay console command syntax (e.g. <code>/motrader transfer [name] [amount]</code>) for speedy payouts.</span>
                      </li>
                    </ul>
                  </div>

                  {/* 2. ORE COMMODITY GUIDE */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider">
                          2. Ore Value Commodity Index
                        </h4>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                        ACTIVE
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300 font-sans">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Stanton Ore Dictionary:</strong> Inspect parameters for high-value resources like Quantainium, Bexalite, Laranite, Gold, or Agricium.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Raw vs Refined Differentials:</strong> Toggle pricing margins to compare immediate raw sales versus refined cargo distributions.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Instability & Resistance Indicators:</strong> High-risk ratings for unstable items like Quantainium to calibrate laser focus strategies.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Planetary Guides:</strong> Instantly check local asteroid belts or microTech / Hurston / ArcCorp moon coordinates.</span>
                      </li>
                    </ul>
                  </div>

                  {/* 3. TUNING SIMULATOR */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider">
                          3. Laser Rig Tuning & Calibrations
                        </h4>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                        ACTIVE
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300 font-sans">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Vehicle Frame Loadouts:</strong> Support tuning setups optimized for the MISC Prospector, ARGO MOLE, or Greycat ROC.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Modularity Sockets:</strong> Swap physical heads (Helix, Lancet, Arbor) alongside active and passive enhancement modules.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Laser Gadgets Fitting:</strong> Fit specific tactile gadgets (Magnus, Optimus, Wave) to enhance mitigation rates.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Real-time Math Solver:</strong> Simulates overall power impact, instability mitigation percentages, and resistance dampening rules instantly.</span>
                      </li>
                    </ul>
                  </div>

                  {/* 4. REFINERY LOGISTICS & TICKERS */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider">
                          4. Refinery Logistics & Ticker Schedules
                        </h4>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                        ACTIVE
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300 font-sans">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Authentic Stations Database:</strong> Includes distinct, interactive stations (HUR-L1, CRU-L1, ARC-L1, MIC-L1) with official yield rate modifiers.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Refining Method Time Factor:</strong> Computes durations using in-game variables for Cormorant, Dinyx, Gireux, and Pyrometric processes.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Live Simulated countdowns:</strong> Built-in ticking countdown progress bars tracking exactly how much time is remaining on active refinery runs.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Refinery Locks Enabled:</strong> Features tamper-proof countdown timers that match real-world duration schedules perfectly without bypasses.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: PATCH NOTES LOG & FORM */}
              {activeTab === "patches" && (
                <div className="space-y-6" id="patch_notes_view">
                  
                  {/* Control Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                      Internal Logs Database
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetDefaults}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded text-[10px] font-mono transition-all cursor-pointer ${
                          resetConfirmActive
                            ? "bg-amber-600/20 border-amber-500 text-amber-300 animate-pulse"
                            : "bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                        title="Factory Reset logs to original defaults (Click twice to confirm)"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{resetConfirmActive ? "⚠️ Confirm Reset?" : "Reset Defaults"}</span>
                      </button>

                      <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded text-[10px] font-mono font-bold uppercase transition-all shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{showAddForm ? "Cancel Form" : "Add Patch Note"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Patch Form Toggleable */}
                  {showAddForm && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleAddPatch}
                      className="p-5 bg-slate-950 border border-amber-500/20 rounded-xl space-y-4 shadow-inner"
                      id="create_patch_form"
                    >
                      <h4 className="font-mono text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                        <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                        Deploy New Ledger Patch
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wide block">
                            Version Number *
                          </label>
                          <input
                            type="text"
                            placeholder="v2.4.2"
                            value={userVersion}
                            onChange={(e) => setUserVersion(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wide block">
                            Date
                          </label>
                          <input
                            type="text"
                            placeholder="Today"
                            value={userDate}
                            onChange={(e) => setUserDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 col-span-2 md:col-span-1">
                          <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wide block">
                            Patch Subtitle / Focus *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Refining Operations Boost"
                            value={userTitle}
                            onChange={(e) => setUserTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                            required
                          />
                        </div>
                        <div className="space-y-1 col-span-2 md:col-span-1">
                          <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wide block">
                            Classification Category
                          </label>
                          <select
                            value={userCategory}
                            onChange={(e) => setUserCategory(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                          >
                            <option value="added">Added (New Feature)</option>
                            <option value="improved">Improved (Refinement)</option>
                            <option value="fixed">Fixed (Bug Fix)</option>
                            <option value="system">System (Core Engine)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wide block">
                          Change Notes Bullet Points * (one per line)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="- Custom refined yields calculations upgraded.&#10;- Resolved ROC mining scanner alignment delay in ROC vehicles.&#10;- Configured automatic dark text contrast calibrations."
                          value={userNotesText}
                          onChange={(e) => setUserNotesText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-amber-500/50 focus:ring-0 leading-relaxed"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono text-xs font-bold uppercase rounded-lg shadow transition-all cursor-pointer"
                      >
                        Publish System Patch
                      </button>
                    </motion.form>
                  )}

                  {/* Patch Notes Iteration */}
                  <div className="space-y-4">
                    {patchNotes.map((patch) => (
                      <div 
                        key={patch.id} 
                        className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl relative hover:border-slate-700/60 transition-all group"
                      >
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-900 pb-2.5 mb-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-amber-500">
                                {patch.version}
                              </span>
                              {renderCategoryBadge(patch.category)}
                              <span className="font-sans text-[10px] text-slate-500">
                                {patch.date}
                              </span>
                            </div>
                            <h4 className="font-medium text-xs text-slate-100 font-sans mt-0.5">
                              {patch.title}
                            </h4>
                          </div>
                          
                          {/* Trash Delete button if custom patch */}
                          {patch.id.startsWith("custom-patch-") && (
                            <button
                              onClick={() => handleDeletePatch(patch.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 bg-slate-900 rounded shrink-0 transition-opacity cursor-pointer"
                              title="Delete this custom entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Bullet Items */}
                        <ul className="space-y-1.5 text-[11px] text-slate-300 font-sans pl-2 leading-relaxed">
                          {patch.notes.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-500 shrink-0 mt-1 font-mono text-[9px]">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Panel Actions / Status Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-850 shrink-0 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                DATABASE LOGS ONLINE
              </span>
              <span>AETHEROS SYSTEM DIAGNOSTICS</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
