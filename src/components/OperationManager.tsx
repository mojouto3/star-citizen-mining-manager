/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MINING_MATERIALS, MINING_SHIPS, REFINERY_METHODS } from "../data/miningData";
import { SOLAR_SYSTEMS, REFINERY_STATIONS, getStationBonus } from "../data/refineryData";
import { Participant, CargoLoad, Expense, OperationSession, ScannedCluster, SaddlebagSwap } from "../types";
import { 
  Plus, 
  Trash2, 
  Landmark, 
  Copy, 
  Check, 
  FileText, 
  ArrowRight,
  Clock,
  Map,
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCircle2,
  DollarSign,
  Gauge,
  Settings,
  RotateCcw,
  X,
  Radar,
  Radio,
  Compass
} from "lucide-react";

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  const hStr = hours > 0 ? `${hours}h ` : "";
  const mStr = minutes > 0 || hours > 0 ? `${minutes}m ` : "";
  const sStr = `${seconds}s`;
  
  return `${hStr}${mStr}${sStr}`;
}

export function OperationManager() {
  const [session, setSession] = useState<OperationSession>({
    id: "session-1",
    title: "New Mining Operation",
    date: new Date().toLocaleDateString("en-US"),
    splitMethod: "Equal",
    roleShares: {
      Miner: 45,
      "Raw Hauler": 20,
      "Refine Hauler": 25,
      Coordinator: 10,
    },
    participants: [],
    cargoLoads: [],
    expenses: [],
    notes: "",
  });

  // UI state
  const [copiedIndex, setCopiedIndex] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<string>("Miner");
  const [newPlayerShip, setNewPlayerShip] = useState("prospector");

  // Dynamic Crew Roles state
  const [crewRoles, setCrewRoles] = useState<{ id: string; name: string; defaultWeight: number }[]>(() => {
    const saved = localStorage.getItem("refinery_crew_roles");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading crew roles", e);
      }
    }
    return [
      { id: "pilot", name: "Pilot", defaultWeight: 25 },
      { id: "scanner", name: "Scanner", defaultWeight: 15 },
      { id: "laser_operator", name: "Laser Operator", defaultWeight: 25 },
      { id: "miner", name: "Miner", defaultWeight: 25 },
      { id: "raw_hauler", name: "Raw Hauler", defaultWeight: 15 },
      { id: "refine_hauler", name: "Refine Hauler", defaultWeight: 20 },
      { id: "coordinator", name: "Coordinator", defaultWeight: 20 },
    ];
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalError, setRoleModalError] = useState("");
  const [newRoleInputName, setNewRoleInputName] = useState("");
  const [newRoleInputWeight, setNewRoleInputWeight] = useState(20);
  const [activeLogisticsTab, setActiveLogisticsTab] = useState<"scout" | "saddlebag">("scout");

  // Sync crew roles to localStorage
  useEffect(() => {
    localStorage.setItem("refinery_crew_roles", JSON.stringify(crewRoles));
  }, [crewRoles]);

  const updateCrewRoleName = (id: string, newName: string) => {
    if (!newName.trim()) return;
    const oldRole = crewRoles.find((r) => r.id === id);
    if (!oldRole) return;
    const oldName = oldRole.name;
    const cleanNewName = newName.trim();

    // Prevent duplicates
    if (crewRoles.some((r) => r.id !== id && r.name.toLowerCase() === cleanNewName.toLowerCase())) {
      setRoleModalError(`Role with name "${cleanNewName}" already exists.`);
      return;
    }
    setRoleModalError("");

    // Update the role list
    setCrewRoles((prev) => prev.map((r) => (r.id === id ? { ...r, name: cleanNewName } : r)));

    // Update participants' roles to the new name if they were using the old one
    const updatedParticipants = session.participants.map((p) => {
      if (p.role === oldName) {
        return { ...p, role: cleanNewName };
      }
      return p;
    });

    // Also update roleShares session mappings
    const nextShares = { ...session.roleShares };
    if (nextShares[oldName] !== undefined) {
      nextShares[cleanNewName] = nextShares[oldName];
      delete nextShares[oldName];
    }

    const updated = { ...session, participants: updatedParticipants, roleShares: nextShares };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const updateCrewRoleWeight = (id: string, weight: number) => {
    const target = crewRoles.find((r) => r.id === id);
    if (!target) return;
    const cleanWeight = Math.max(0, weight);

    setCrewRoles((prev) => prev.map((r) => (r.id === id ? { ...r, defaultWeight: cleanWeight } : r)));

    // Also sync to active session's roleShares so it applies immediately if Role-Based is chosen
    const nextShares = { ...session.roleShares, [target.name]: cleanWeight };
    const updated = { ...session, roleShares: nextShares };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const normalizeCrewRoleWeights = () => {
    const total = crewRoles.reduce((sum, r) => sum + r.defaultWeight, 0);
    if (total === 0) {
      const equalShare = Math.floor(100 / crewRoles.length);
      const remainder = 100 % crewRoles.length;
      const next = crewRoles.map((r, idx) => ({
        ...r,
        defaultWeight: equalShare + (idx < remainder ? 1 : 0)
      }));
      setCrewRoles(next);
      const nextShares = { ...session.roleShares };
      next.forEach((n) => {
        nextShares[n.name] = n.defaultWeight;
      });
      const updated = { ...session, roleShares: nextShares };
      setSession(updated);
      saveToLocalStorage(updated);
      return;
    }

    let currentSum = 0;
    const next = crewRoles.map((r) => {
      const rawShare = (r.defaultWeight / total) * 100;
      const roundedShare = Math.round(rawShare);
      currentSum += roundedShare;
      return {
        ...r,
        defaultWeight: roundedShare
      };
    });

    const diff = 100 - currentSum;
    if (diff !== 0 && next.length > 0) {
      const maxIdx = next.reduce((maxI, r, idx, arr) => r.defaultWeight > arr[maxI].defaultWeight ? idx : maxI, 0);
      next[maxIdx].defaultWeight += diff;
    }

    setCrewRoles(next);

    const nextShares = { ...session.roleShares };
    next.forEach((n) => {
      nextShares[n.name] = n.defaultWeight;
    });
    const updated = { ...session, roleShares: nextShares };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const addCrewRole = () => {
    const cleanName = newRoleInputName.trim();
    if (!cleanName) {
      setRoleModalError("Role name cannot be empty.");
      return;
    }
    if (crewRoles.some((r) => r.name.toLowerCase() === cleanName.toLowerCase())) {
      setRoleModalError(`A role named "${cleanName}" already exists.`);
      return;
    }

    const newRole = {
      id: "role-" + Date.now(),
      name: cleanName,
      defaultWeight: Math.max(0, newRoleInputWeight),
    };

    setCrewRoles((prev) => [...prev, newRole]);
    setNewRoleInputName("");
    setRoleModalError("");

    // Automatically add to session roleShares
    const nextShares = { ...session.roleShares, [newRole.name]: newRole.defaultWeight };
    const updated = { ...session, roleShares: nextShares };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const deleteCrewRole = (id: string) => {
    const target = crewRoles.find((r) => r.id === id);
    if (!target) return;

    // Check if any active crew is using this role
    const isUsed = session.participants.some((p) => p.role === target.name);
    if (isUsed) {
      setRoleModalError(`Cannot delete "${target.name}" because it is currently assigned to one or more active crew members.`);
      return;
    }

    if (crewRoles.length <= 1) {
      setRoleModalError("At least one crew role must be defined.");
      return;
    }

    setCrewRoles((prev) => prev.filter((r) => r.id !== id));
    setRoleModalError("");

    // Remove from active session's roleShares if present
    const nextShares = { ...session.roleShares };
    delete nextShares[target.name];
    const updated = { ...session, roleShares: nextShares };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const resetCrewRolesToDefault = () => {
    const defaults = [
      { id: "pilot", name: "Pilot", defaultWeight: 25 },
      { id: "scanner", name: "Scanner", defaultWeight: 15 },
      { id: "laser_operator", name: "Laser Operator", defaultWeight: 25 },
      { id: "miner", name: "Miner", defaultWeight: 25 },
      { id: "raw_hauler", name: "Raw Hauler", defaultWeight: 15 },
      { id: "refine_hauler", name: "Refine Hauler", defaultWeight: 20 },
      { id: "coordinator", name: "Coordinator", defaultWeight: 20 },
    ];
    setCrewRoles(defaults);
    setRoleModalError("");

    // Sync state
    const nextShares = { ...session.roleShares };
    defaults.forEach((d) => {
      nextShares[d.name] = d.defaultWeight;
    });
    const updated = { ...session, roleShares: nextShares };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  // Custom double-confirm states for iframe-safe operations
  const [clearConfirmActive, setClearConfirmActive] = useState(false);
  const [clearCrewConfirmActive, setClearCrewConfirmActive] = useState(false);
  const [resetConfirmActive, setResetConfirmActive] = useState(false);

  // Field Operations Log States
  const [scannedClusters, setScannedClusters] = useState<ScannedCluster[]>(() => {
    const saved = localStorage.getItem("sc_scanned_clusters");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading scanned clusters", e);
      }
    }
    return [];
  });

  const [saddlebagSwaps, setSaddlebagSwaps] = useState<SaddlebagSwap[]>(() => {
    const saved = localStorage.getItem("sc_saddlebag_swaps");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading saddlebag swaps", e);
      }
    }
    return [];
  });

  // Sync Field Operations Log States
  useEffect(() => {
    localStorage.setItem("sc_scanned_clusters", JSON.stringify(scannedClusters));
  }, [scannedClusters]);

  useEffect(() => {
    localStorage.setItem("sc_saddlebag_swaps", JSON.stringify(saddlebagSwaps));
  }, [saddlebagSwaps]);

  // Field Operations adder states
  const [addClusterScout, setAddClusterScout] = useState("");
  const [addClusterLocation, setAddClusterLocation] = useState("");
  const [addClusterOres, setAddClusterOres] = useState("");
  const [addClusterStatus, setAddClusterStatus] = useState<ScannedCluster["status"]>("Scouted");
  const [addClusterNotes, setAddClusterNotes] = useState("");
  const [addClusterAssigned, setAddClusterAssigned] = useState("");
  const [addClusterMinerStatus, setAddClusterMinerStatus] = useState<ScannedCluster["minerStatus"]>("idle");

  const [addSwapMiner, setAddSwapMiner] = useState("");
  const [addSwapHauler, setAddSwapHauler] = useState("");
  const [addSwapBags, setAddSwapBags] = useState(4);
  const [addSwapSCU, setAddSwapSCU] = useState(32);
  const [addSwapMaterial, setAddSwapMaterial] = useState("Quantainium");
  const [addSwapNotes, setAddSwapNotes] = useState("");

  const handleAddCluster = () => {
    const scout = addClusterScout.trim() || session.participants[0]?.name || "Commandant_ST";
    const loc = addClusterLocation.trim() || "Lyria OM-1";
    const ores = addClusterOres.trim() || "Quantainium 40%";
    
    const newCluster: ScannedCluster = {
      id: "cluster-" + Date.now(),
      scoutName: scout,
      location: loc,
      oresDetected: ores,
      status: addClusterStatus,
      assignedMiner: addClusterAssigned || undefined,
      minerStatus: addClusterAssigned ? addClusterMinerStatus : "idle",
      notes: addClusterNotes.trim() ? addClusterNotes.trim() : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setScannedClusters(prev => [newCluster, ...prev]);
    setAddClusterLocation("");
    setAddClusterOres("");
    setAddClusterNotes("");
    setAddClusterAssigned("");
    setAddClusterMinerStatus("idle");
  };

  const updateClusterMiner = (clusterId: string, minerName: string) => {
    setScannedClusters(prev => prev.map(c => {
      if (c.id === clusterId) {
        return {
          ...c,
          assignedMiner: minerName || undefined,
          minerStatus: minerName ? "en_route" : "idle"
        };
      }
      return c;
    }));
  };

  const updateClusterMinerStatus = (clusterId: string, status: ScannedCluster["minerStatus"]) => {
    setScannedClusters(prev => prev.map(c => {
      if (c.id === clusterId) {
        let nextStatus = c.status;
        if (status === "mining" && c.status === "Scouted") {
          nextStatus = "Splitting";
        }
        return {
          ...c,
          minerStatus: status,
          status: nextStatus
        };
      }
      return c;
    }));
  };

  const handleAddBagSwap = () => {
    const miners = session.participants.filter(p => p.role.toLowerCase().includes("miner") || p.role.toLowerCase().includes("laser") || p.role.toLowerCase().includes("pilot"));
    const haulers = session.participants.filter(p => p.role.toLowerCase().includes("hauler"));
    
    const miner = addSwapMiner.trim() || miners[0]?.name || session.participants[1]?.name || "StarMinerX";
    const hauler = addSwapHauler.trim() || haulers[0]?.name || session.participants[2]?.name || "Cargo_Maximus";
    
    const minerPilot = session.participants.find(p => p.name === miner);
    const haulerPilot = session.participants.find(p => p.name === hauler);

    const mShip = minerPilot ? MINING_SHIPS.find(s => s.id === minerPilot.shipId)?.name || minerPilot.shipId : "MISC Prospector";
    const hShip = haulerPilot ? MINING_SHIPS.find(s => s.id === haulerPilot.shipId)?.name || haulerPilot.shipId : "C2 Hercules";

    const newSwap: SaddlebagSwap = {
      id: "swap-" + Date.now(),
      minerName: miner,
      minerShip: mShip,
      haulerName: hauler,
      haulerShip: hShip,
      bagCount: Math.max(0, addSwapBags),
      totalSCU: Math.max(0, addSwapSCU),
      materialName: addSwapMaterial.trim() || "Quantainium",
      notes: addSwapNotes.trim() ? addSwapNotes.trim() : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setSaddlebagSwaps(prev => [newSwap, ...prev]);
    setAddSwapNotes("");
  };

  const removeCluster = (id: string) => {
    setScannedClusters(prev => prev.filter(c => c.id !== id));
  };

  const removeBagSwap = (id: string) => {
    setSaddlebagSwaps(prev => prev.filter(s => s.id !== id));
  };

  // Cargo adder state
  const [addMaterialId, setAddMaterialId] = useState("quantainium");
  const [addSCU, setAddSCU] = useState(32);
  const [addMethod, setAddMethod] = useState<CargoLoad["refineMethod"]>("Cormack");
  const [addSystemId, setAddSystemId] = useState<string>("stanton");
  const [addStationId, setAddStationId] = useState<string>("arc_l1");
  const [addTimerMode, setAddTimerMode] = useState<"instant" | "timer">("instant");
  const [autoLogRefineryFee, setAutoLogRefineryFee] = useState<boolean>(true);

  // Auto-switch station to first of the chosen system
  useEffect(() => {
    const filteredStations = REFINERY_STATIONS.filter((s) => s.systemId === addSystemId);
    if (filteredStations.length > 0) {
      setAddStationId(filteredStations[0].id);
    }
  }, [addSystemId]);

  // Interval timer loop for active refinery jobs
  useEffect(() => {
    const hasActiveJobs = session.cargoLoads.some(
      (l) => l.isRefined && l.refineryJobStatus === "processing"
    );
    if (!hasActiveJobs) return;

    const timer = setInterval(() => {
      const now = Date.now();
      let hasCompletedAny = false;

      const nextLoads = session.cargoLoads.map((load) => {
        if (load.isRefined && load.refineryJobStatus === "processing") {
          if (load.jobEndsAt && now >= load.jobEndsAt) {
            hasCompletedAny = true;
            return { ...load, refineryJobStatus: "completed" as const };
          }
        }
        return load;
      });

      if (hasCompletedAny) {
        setSession((prev) => {
          const updated = { ...prev, cargoLoads: nextLoads };
          saveToLocalStorage(updated);
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session.cargoLoads]);

  // Expense adder state
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expensePaidBy, setExpensePaidBy] = useState("p-1");

  // Load / Save localStorage helper
  useEffect(() => {
    const saved = localStorage.getItem("sc_mining_session");
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved session", e);
      }
    }
  }, []);

  const saveToLocalStorage = (newSession: OperationSession) => {
    localStorage.setItem("sc_mining_session", JSON.stringify(newSession));
  };

  // Participant actions
  const addParticipant = () => {
    if (!newPlayerName.trim()) return;
    const newPart: Participant = {
      id: "p-" + Date.now(),
      name: newPlayerName.trim(),
      role: newPlayerRole,
      shipId: newPlayerShip,
      sharePercentage: 1, // Default share count in case of custom shares
      customAdditions: 0,
      status: "Standby",
    };
    const nextParts = [...session.participants, newPart];
    const updated = { ...session, participants: nextParts };
    setSession(updated);
    saveToLocalStorage(updated);
    setNewPlayerName("");
  };

  const removeParticipant = (id: string) => {
    const nextParts = session.participants.filter((p) => p.id !== id);
    const nextExpenses = session.expenses.map((e) => {
      if (e.paidByParticipantId === id) {
        return { ...e, paidByParticipantId: nextParts[0]?.id || "" };
      }
      return e;
    });
    const updated = { ...session, participants: nextParts, expenses: nextExpenses };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const updateParticipantShare = (id: string, val: number) => {
    const updatedParts = session.participants.map((p) => {
      if (p.id === id) {
        return { ...p, sharePercentage: Math.max(0, val) };
      }
      return p;
    });
    const updated = { ...session, participants: updatedParts };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const updateParticipantRole = (id: string, role: Participant["role"]) => {
    const updatedParts = session.participants.map((p) => {
      if (p.id === id) {
        return { ...p, role };
      }
      return p;
    });
    const updated = { ...session, participants: updatedParts };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const updateParticipantStatus = (id: string, status: Participant["status"]) => {
    const updatedParts = session.participants.map((p) => {
      if (p.id === id) {
        return { ...p, status };
      }
      return p;
    });
    const updated = { ...session, participants: updatedParts };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const updateParticipantAdjustment = (id: string, val: number) => {
    const updatedParts = session.participants.map((p) => {
      if (p.id === id) {
        return { ...p, customAdditions: val };
      }
      return p;
    });
    const updated = { ...session, participants: updatedParts };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  // Cargo Log actions
  const getRefineryCostEst = () => {
    const mat = MINING_MATERIALS.find((m) => m.id === addMaterialId);
    if (!mat || addMethod === "Unrefined") return 0;

    const stationObj = REFINERY_STATIONS.find((s) => s.id === addStationId);
    const methodObj = REFINERY_METHODS.find((rm) => rm.id === addMethod);

    const costMod = stationObj?.costModifier || 1.0;
    const methodCostFactor = methodObj?.costFactor || 1.0;

    const baseFee = addSCU * mat.baseValueRaw * methodCostFactor * costMod * 0.15;
    return Math.round(baseFee);
  };

  const addCargoLoad = () => {
    const mat = MINING_MATERIALS.find((m) => m.id === addMaterialId);
    if (!mat) return;

    const isRefined = addMethod !== "Unrefined";
    const baseValue = isRefined ? mat.baseValueRefined : mat.baseValueRaw;
    const now = Date.now();

    let durationSec = 10;
    let costEst = 0;

    if (isRefined) {
      const stationObj = REFINERY_STATIONS.find((s) => s.id === addStationId);
      const methodObj = REFINERY_METHODS.find((rm) => rm.id === addMethod);
      const matWeight = mat.weight || 5.0;
      const speedMod = stationObj?.speedModifier || 1.0;
      const methodTimeFactor = methodObj?.timeFactor || 1.0;
      
      // Compute realistic in-game duration in seconds
      // SCU * Material Weight * Refinery Method Time Factor * Station Speed Modifier * 60 (for authentic duration mapping)
      durationSec = Math.round(addSCU * matWeight * methodTimeFactor * speedMod * 60);
      
      // Calculate Refinery Processing Fee
      const costMod = stationObj?.costModifier || 1.0;
      const methodCostFactor = methodObj?.costFactor || 1.0;
      costEst = Math.round(addSCU * mat.baseValueRaw * methodCostFactor * costMod * 0.15);
    }

    const newLoad: CargoLoad = {
      id: "c-" + Date.now(),
      materialId: addMaterialId,
      quantitySCU: addSCU,
      refineMethod: addMethod,
      isRefined,
      actualSellPricePerSCU: baseValue,
      systemId: isRefined ? addSystemId : undefined,
      stationId: isRefined ? addStationId : undefined,
      refineryJobStatus: isRefined 
        ? (addTimerMode === "timer" ? "processing" : "completed") 
        : undefined,
      jobStartedAt: isRefined && addTimerMode === "timer" ? now : undefined,
      jobEndsAt: isRefined && addTimerMode === "timer" ? now + durationSec * 1000 : undefined,
      jobTotalDurationSec: isRefined && addTimerMode === "timer" ? durationSec : undefined
    };

    let nextExpenses = [...session.expenses];
    if (isRefined && autoLogRefineryFee && costEst > 0) {
      const payerId = session.participants[0]?.id || "p-1";
      const stationObj = REFINERY_STATIONS.find((s) => s.id === addStationId);
      const expTitle = `Refinement Fee: ${addSCU} SCU ${mat.name} (${stationObj?.name || "Refinery"})`;
      
      nextExpenses.push({
        id: "e-" + (Date.now() + 1),
        description: expTitle,
        amount: costEst,
        paidByParticipantId: payerId,
      });
    }

    const updated = { 
      ...session, 
      cargoLoads: [...session.cargoLoads, newLoad],
      expenses: nextExpenses
    };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const completeJobInstantly = (loadId: string) => {
    const nextLoads = session.cargoLoads.map((load) => {
      if (load.id === loadId) {
        return {
          ...load,
          refineryJobStatus: "completed" as const,
          jobEndsAt: Date.now()
        };
      }
      return load;
    });
    const updated = { ...session, cargoLoads: nextLoads };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const speedUpJob = (loadId: string) => {
    const now = Date.now();
    const nextLoads = session.cargoLoads.map((load) => {
      if (load.id === loadId && load.jobEndsAt && load.jobStartsAt) {
        const remaining = load.jobEndsAt - now;
        if (remaining > 3000) {
          // Divides remaining time by 10
          const newRemaining = Math.max(2000, remaining / 10);
          return {
            ...load,
            jobEndsAt: now + newRemaining,
          };
        }
      }
      return load;
    });
    const updated = { ...session, cargoLoads: nextLoads };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const toggleParticipantPayoutStatus = (playerId: string) => {
    const nextParts = session.participants.map((p) => {
      if (p.id === playerId) {
        const currentStatus = p.payoutStatus || "unpaid";
        return {
          ...p,
          payoutStatus: currentStatus === "unpaid" ? ("paid" as const) : ("unpaid" as const),
          paidAtTimestamp: currentStatus === "unpaid" ? Date.now() : undefined,
        };
      }
      return p;
    });
    const updated = { ...session, participants: nextParts };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const removeCargoLoad = (id: string) => {
    const updated = { ...session, cargoLoads: session.cargoLoads.filter((c) => c.id !== id) };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const updateCargoSellPrice = (id: string, val: number) => {
    const updatedLoads = session.cargoLoads.map((c) => {
      if (c.id === id) {
        return { ...c, actualSellPricePerSCU: val };
      }
      return c;
    });
    const updated = { ...session, cargoLoads: updatedLoads };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  // Expenses actions
  const addExpense = () => {
    if (!expenseDesc.trim() || expenseAmount <= 0) return;
    const newExp: Expense = {
      id: "e-" + Date.now(),
      description: expenseDesc.trim(),
      amount: expenseAmount,
      paidByParticipantId: expensePaidBy,
    };
    const updated = { ...session, expenses: [...session.expenses, newExp] };
    setSession(updated);
    saveToLocalStorage(updated);
    setExpenseDesc("");
    setExpenseAmount(0);
  };

  const removeExpense = (id: string) => {
    const updated = { ...session, expenses: session.expenses.filter((e) => e.id !== id) };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const clearSessionCargoAndExpenses = () => {
    if (!clearConfirmActive) {
      setClearConfirmActive(true);
      setTimeout(() => setClearConfirmActive(false), 3500);
      return;
    }

    const updated = {
      ...session,
      cargoLoads: [],
      expenses: [],
      notes: ""
    };
    setSession(updated);
    saveToLocalStorage(updated);
    setClearConfirmActive(false);
  };

  const clearCrewOnly = () => {
    if (!clearCrewConfirmActive) {
      setClearCrewConfirmActive(true);
      setTimeout(() => setClearCrewConfirmActive(false), 3500);
      return;
    }

    const updated = {
      ...session,
      participants: []
    };
    setSession(updated);
    saveToLocalStorage(updated);
    setClearCrewConfirmActive(false);
  };

  const loadDefaultDemoCrew = () => {
    const updated = {
      ...session,
      participants: [
        { id: "p-1", name: "Commandant_ST", role: "Coordinator" as const, shipId: "mole", sharePercentage: 25, customAdditions: 0, status: "Scouting" as const },
        { id: "p-2", name: "StarMinerX", role: "Miner" as const, shipId: "prospector", sharePercentage: 25, customAdditions: 0, status: "Mining" as const },
        { id: "p-3", name: "Cargo_Maximus", role: "Raw Hauler" as const, shipId: "prospector", sharePercentage: 25, customAdditions: 0, status: "Hauling" as const },
        { id: "p-4", name: "TDD_Seller_ST", role: "Refine Hauler" as const, shipId: "mole", sharePercentage: 25, customAdditions: 0, status: "Refining" as const },
      ]
    };
    setSession(updated);
    saveToLocalStorage(updated);
  };

  const loadScoutLogisticsDemo = () => {
    // Add custom roles if not already present in catalog
    const requiredRoles = [
      { id: "role-cc-1", name: "Coordinator & Scout", defaultWeight: 30 },
      { id: "role-cc-2", name: "Laser Operator", defaultWeight: 25 },
      { id: "role-cc-3", name: "Raw Hauler", defaultWeight: 20 },
      { id: "role-cc-4", name: "Refine Hauler", defaultWeight: 25 }
    ];
    setCrewRoles(prev => {
      const next = [...prev];
      requiredRoles.forEach(req => {
        if (!next.some(r => r.name === req.name)) {
          next.push(req);
        }
      });
      return next;
    });

    const updated = {
      ...session,
      title: "Advanced Scout & Logistics Co-op",
      splitMethod: "Role-Based" as const,
      roleShares: {
        "Coordinator & Scout": 30,
        "Laser Operator": 25,
        "Raw Hauler": 20,
        "Refine Hauler": 25
      },
      participants: [
        { id: "p-scout-1", name: "Commandant_ST", role: "Coordinator & Scout", shipId: "arrastra", sharePercentage: 30, customAdditions: 0, status: "Scouting" as const },
        { id: "p-scout-2", name: "StarMinerX", role: "Laser Operator", shipId: "prospector", sharePercentage: 25, customAdditions: 0, status: "Mining" as const },
        { id: "p-scout-3", name: "Cargo_Maximus", role: "Raw Hauler", shipId: "c2_hercules", sharePercentage: 20, customAdditions: 0, status: "Hauling" as const },
        { id: "p-scout-4", name: "TDD_Seller_ST", role: "Refine Hauler", shipId: "caterpillar", sharePercentage: 25, customAdditions: 0, status: "Refining" as const }
      ],
      cargoLoads: [
        { id: "scout-c-1", materialId: "quantainium", quantitySCU: 32, refineMethod: "Cormack" as const, isRefined: true, actualSellPricePerSCU: 25600, systemId: "stanton", stationId: "arc_l1", refineryJobStatus: "processing" as const }
      ],
      expenses: [
        { id: "scout-e-1", description: "Cormack Refinery Processing Fee (32 SCU)", amount: 24000, paidByParticipantId: "p-scout-1" }
      ],
      notes: "Scout Commandant_ST scanned and bookmarked a high purity Quantainium cluster on Lyria. StarMinerX Cracked the rocks, Cargo_Maximus swappped bags using the C2 Hercules, and TDD_Seller_ST is running the Cormack refinery job."
    };

    setSession(updated);
    saveToLocalStorage(updated);

    // Load demo entries inside cluster and bag swaps
    const demoClusters: ScannedCluster[] = [
      {
        id: "cluster-demo-1",
        scoutName: "Commandant_ST",
        location: "Lyria - OM-1 - Cluster Alpha (Sector 4)",
        oresDetected: "Quantainium 48.5% • Laranite 12.0%",
        status: "Extracted",
        assignedMiner: "StarMinerX",
        minerStatus: "mining",
        notes: "Excellent. Bag swapped 32.0 SCU to Cargo_Maximus.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
      {
        id: "cluster-demo-2",
        scoutName: "Commandant_ST",
        location: "Lyria - OM-1 - Sector 9 (Deep Belt)",
        oresDetected: "Quantainium 41.2% • Agricium 15.6%",
        status: "Splitting",
        assignedMiner: "StarMinerX",
        minerStatus: "mining",
        notes: "Massive 8K rock, high stability. StarMinerX is actively cracking.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ];

    const demoSwaps: SaddlebagSwap[] = [
      {
        id: "swap-demo-1",
        minerName: "StarMinerX",
        minerShip: "MISC Prospector",
        haulerName: "Cargo_Maximus",
        haulerShip: "C2 Hercules (Cargo)",
        bagCount: 4,
        totalSCU: 32,
        materialName: "Quantainium",
        notes: "Containers docked securely on the cargo grid. Ready for refinery.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ];

    setScannedClusters(demoClusters);
    setSaddlebagSwaps(demoSwaps);
  };

  const resetEntireSession = () => {
    if (!resetConfirmActive) {
      setResetConfirmActive(true);
      setTimeout(() => setResetConfirmActive(false), 3500);
      return;
    }

    const defaultSession = {
      id: "session-1",
      title: "New Mining Operation",
      date: new Date().toLocaleDateString("en-US"),
      splitMethod: "Equal" as const,
      roleShares: {
        Miner: 45,
        "Raw Hauler": 20,
        "Refine Hauler": 25,
        Coordinator: 10,
      },
      participants: [], // Start with empty crew for fully private setups
      cargoLoads: [],
      expenses: [],
      notes: "",
    };
    setSession(defaultSession);
    saveToLocalStorage(defaultSession);
    setScannedClusters([]);
    setSaddlebagSwaps([]);
    setResetConfirmActive(false);
  };

  // Core Calculations
  const calculateTotals = () => {
    let totalRevenue = 0;
    let potentialRevenue = 0;

    session.cargoLoads.forEach((load) => {
      const mat = MINING_MATERIALS.find((m) => m.id === load.materialId);
      if (!mat) return;

      const baseVal = load.actualSellPricePerSCU ?? (load.isRefined ? mat.baseValueRefined : mat.baseValueRaw);

      if (load.isRefined) {
        const methodObj = REFINERY_METHODS.find((rm) => rm.id === load.refineMethod);
        const baseYield = methodObj ? methodObj.yield : 1.0;
        const stationBonus = getStationBonus(load.stationId, load.materialId);
        const finalYield = Math.max(0, baseYield + stationBonus);
        const value = load.quantitySCU * baseVal * finalYield;

        if (load.refineryJobStatus === "processing" || load.refineryJobStatus === "queued") {
          potentialRevenue += value;
        } else {
          totalRevenue += value;
        }
      } else {
        totalRevenue += load.quantitySCU * baseVal;
      }
    });

    const totalExpenses = session.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = Math.max(0, totalRevenue - totalExpenses);
    const potentialNetProfit = Math.max(0, (totalRevenue + potentialRevenue) - totalExpenses);

    return {
      totalRevenue: Math.round(totalRevenue),
      potentialRevenue: Math.round(potentialRevenue),
      totalExpenses: Math.round(totalExpenses),
      netProfit: Math.round(netProfit),
      potentialNetProfit: Math.round(potentialNetProfit),
    };
  };

  const { totalRevenue, potentialRevenue, totalExpenses, netProfit, potentialNetProfit } = calculateTotals();

  // Draw payout distribution per person
  const getPayoutBreakdown = () => {
    const pCount = session.participants.length;
    if (pCount === 0) return [];

    let roleSum = 0;
    session.participants.forEach((p) => {
      const defaultWeight = crewRoles.find((r) => r.name === p.role)?.defaultWeight || 10;
      const weight = session.roleShares[p.role] !== undefined ? session.roleShares[p.role] : defaultWeight;
      roleSum += weight;
    });

    return session.participants.map((p) => {
      let shareFraction = 0;
      if (session.splitMethod === "Equal") {
        shareFraction = 1 / pCount;
      } else if (session.splitMethod === "Custom-Shares") {
        const totalShares = session.participants.reduce((sum, part) => sum + part.sharePercentage, 0) || 1;
        shareFraction = p.sharePercentage / totalShares;
      } else {
        const defaultWeight = crewRoles.find((r) => r.name === p.role)?.defaultWeight || 10;
        const targetPercent = session.roleShares[p.role] !== undefined ? session.roleShares[p.role] : defaultWeight;
        shareFraction = targetPercent / (roleSum || 1);
      }

      // Proportional net profit share
      const profitShare = Math.round(netProfit * shareFraction);

      // Refund this pilot any amount paid toward out-of-pocket expedition expenses
      const reimbursements = session.expenses
        .filter((e) => e.paidByParticipantId === p.id)
        .reduce((sum, e) => sum + e.amount, 0);

      // Other manual adjustments
      const adjustment = p.customAdditions;

      const finalReceive = Math.round(profitShare + reimbursements + adjustment);

      return {
        ...p,
        profitShare,
        reimbursements,
        finalReceive,
      };
    });
  };

  const payouts = getPayoutBreakdown();

  const [revenueHolderId, setRevenueHolderId] = useState<string>(
    session.participants.find((p) => p.role === "Refine Hauler" || p.role === "Coordinator")?.id ||
    session.participants[0]?.id ||
    ""
  );

  useEffect(() => {
    if (session.participants.length > 0 && !session.participants.some((p) => p.id === revenueHolderId)) {
      setRevenueHolderId(session.participants[0].id);
    }
  }, [session.participants, revenueHolderId]);

  const getSettlementInstructions = () => {
    if (!revenueHolderId) return [];

    const holderIdx = payouts.findIndex((p) => p.id === revenueHolderId);
    if (holderIdx === -1) return [];

    const holder = payouts[holderIdx];
    const transfers: { from: string; to: string; amount: number }[] = [];

    payouts.forEach((p) => {
      if (p.id === revenueHolderId) return;
      if (p.finalReceive > 0) {
        transfers.push({
          from: holder.name,
          to: p.name,
          amount: p.finalReceive,
        });
      }
    });

    return transfers;
  };

  const transfers = getSettlementInstructions();

  // Create clean Markdown Briefing Report
  const generateReport = () => {
    const splitMethodLabel =
      session.splitMethod === "Equal"
        ? "Equal Split"
        : session.splitMethod === "Custom-Shares"
        ? "Proportional Shares weight"
        : "Operational Role-Based Percentage";

    let text = `🚀 **STAR CITIZEN CO-OP EXPEDITION LOG & PAYOUT Briefing** 🚀\n`;
    text += `==========================================================\n`;
    text += `📅 Date: ${session.date}\n`;
    text += `🏷️ Mission Name / Notes: **${session.notes || session.title}**\n`;
    text += `⚖️ Capital Split Strategy: **${splitMethodLabel}**\n\n`;

    text += `📦 **CARGO MANIFEST & ORE LOG:**\n`;
    session.cargoLoads.forEach((l) => {
      const mat = MINING_MATERIALS.find((m) => m.id === l.materialId);
      const station = REFINERY_STATIONS.find((s) => s.id === l.stationId);
      const system = SOLAR_SYSTEMS.find((s) => s.id === l.systemId);
      let locText = "";
      if (l.isRefined && station) {
        locText = ` at ${station.name} (${system?.name || ""})`;
      }
      
      let statusText = l.isRefined ? "Refined Commodity" : "Raw Ore";
      if (l.refineryJobStatus === "processing") {
        statusText = "⏳ Refining In-Progress";
      } else if (l.refineryJobStatus === "completed") {
        statusText = "✓ Refined & Ready";
      }

      text += `- ${l.quantitySCU} SCU ${mat?.name || "Ore"} (${statusText})${locText} - Method: ${l.refineMethod}\n`;
    });
    text += `\n`;

    text += `💰 **MISSION FINANCIAL LEDGER:**\n`;
    text += `- **Gross Revenues (Settled):** \`${totalRevenue.toLocaleString()} aUEC\`\n`;
    if (potentialRevenue > 0) {
      text += `- **Pending Refinery Assets:** \`+${potentialRevenue.toLocaleString()} aUEC\`\n`;
    }
    text += `- **Total Expenditures:** \`-${totalExpenses.toLocaleString()} aUEC\`\n`;
    text += `- **Net Profit Pool (Settled):** \`***${netProfit.toLocaleString()} aUEC***\`\n`;
    if (potentialRevenue > 0) {
      text += `- **Projected Future Net Profit:** \`***${potentialNetProfit.toLocaleString()} aUEC***\`\n`;
    }
    text += `\n`;

    text += `📊 **CREW DIVIDENDS & PAYOUT DISBURSEMENT:**\n`;
    payouts.forEach((p) => {
      const participantObj = session.participants.find((part) => part.id === p.id);
      const isPaid = participantObj?.payoutStatus === "paid";
      const paidStatusEmoji = isPaid ? "✅ (Settled)" : "⏳ (Pending Wire)";
      text += `- **${p.name}** (${p.role}): Profit share \`+${p.profitShare.toLocaleString()} aUEC\` | Exp Refunded: \`+${p.reimbursements.toLocaleString()} aUEC\` -> **Net Receivable: \`${p.finalReceive.toLocaleString()} aUEC\`** [Status: ${paidStatusEmoji}]\n`;
    });
    text += `\n`;

    text += `💳 **mo.TRADER WIRE SETTLEMENT ORDERS:**\n`;
    if (transfers.length > 0) {
      transfers.forEach((t) => {
        const targetPilot = session.participants.find((p) => p.name === t.to);
        const isPaid = targetPilot?.payoutStatus === "paid";
        text += `- **${t.from}** ➡️ Send \`${t.amount.toLocaleString()} aUEC\` to **${t.to}** ${isPaid ? "[SETTLED ✓]" : "[PENDING WIRE]"}\n`;
      });
    } else {
      text += `- All accounts and payouts are fully satisfied and balanced.\n`;
    }

    text += `\n*Processed safely via Star Citizen Custom Mining and Payout Logistics Engine*`;
    return text;
  };

  const copyReportToClipboard = () => {
    const rpt = generateReport();
    navigator.clipboard.writeText(rpt);
    setCopiedIndex(true);
    setTimeout(() => setCopiedIndex(false), 2000);
  };

  return (
    <div className="space-y-6 w-full" id="operation_manager_container">
      {/* 📊 Real-Time Session HUD Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="operations_summary_dashboard">
        {/* Realized Gross Revenue Card */}
        <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:border-slate-700/80 transition-all duration-300" id="dash_card_gross">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Realized Gross Revenue
            </span>
            <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-emerald-450 tracking-tight leading-none text-emerald-400">
              {totalRevenue.toLocaleString()} <span className="text-xs font-normal text-emerald-500">aUEC</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2.5 flex items-center gap-1.5 min-h-[1.25rem]">
              {potentialRevenue > 0 ? (
                <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  +{potentialRevenue.toLocaleString()} aUEC locked in processing
                </span>
              ) : (
                <span className="text-slate-500">✓ All refinery loads settled</span>
              )}
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:border-slate-700/80 transition-all duration-300" id="dash_card_expenses">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Expenses
            </span>
            <div className="w-7 h-7 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-450 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-red-400 tracking-tight leading-none">
              {totalExpenses.toLocaleString()} <span className="text-xs font-normal text-red-500">aUEC</span>
            </div>
            <div className="text-[10px] text-slate-550 font-mono mt-2.5 min-h-[1.25rem] flex items-center text-slate-500">
              <span>Refinery processing fees & operational logs</span>
            </div>
          </div>
        </div>

        {/* Net Profit Pot Card */}
        <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/20 hover:border-slate-700/80 transition-all duration-300 shadow-md shadow-amber-950/2" id="dash_card_net">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Net Profit Pool (Pot)
            </span>
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-550 text-amber-500">
              <Gauge className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-amber-500 tracking-tight leading-none">
              {netProfit.toLocaleString()} <span className="text-xs font-normal text-amber-600">aUEC</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-2.5 min-h-[1.25rem] flex items-center">
              {potentialRevenue > 0 ? (
                <span className="text-slate-400">Projected net pool: <b className="text-amber-400 font-bold">{potentialNetProfit.toLocaleString()} aUEC</b></span>
              ) : (
                <span>Distributed claimable dividend credits</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="operation_manager_layout">
        {/* LEFT: Configure Participants & Loads */}
      <div className="xl:col-span-8 space-y-6" id="op_config_left">
        {/* Session settings, split method */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-sans text-lg font-semibold tracking-wide text-amber-500">
                Co-op Mission Log Management
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Log active crew members, operational expenditures, cargo sheets, and calibrate profit dividing logic.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={session.notes}
                onChange={(e) => {
                  const updated = { ...session, notes: e.target.value };
                  setSession(updated);
                  saveToLocalStorage(updated);
                }}
                placeholder="Mission Notes / Op Name..."
                className="bg-slate-950 border border-slate-800 text-xs italic text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 w-40 sm:w-48"
                id="notes_input_ledger"
              />
              <button
                onClick={resetEntireSession}
                className={`px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer ${
                  resetConfirmActive
                    ? "bg-red-600 hover:bg-red-700 border border-red-500 text-white animate-pulse"
                    : "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40"
                }`}
                style={!resetConfirmActive ? { color: "#f87171" } : undefined}
                title="Completely reset the whole session, clearing all cargo, expenses, notes, and crew members"
                id="full_factory_reset_ledger_btn"
              >
                {resetConfirmActive ? "⚠️ Confirm Reset?" : "Full Reset"}
              </button>
              <button
                onClick={clearCrewOnly}
                className={`px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer ${
                  clearCrewConfirmActive
                    ? "bg-red-600 hover:bg-red-700 border border-red-500 text-white animate-pulse"
                    : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40"
                }`}
                style={!clearCrewConfirmActive ? { color: "#f59e0b" } : undefined}
                title="Clear all pilots from the active crew list"
                id="clear_crew_btn"
              >
                {clearCrewConfirmActive ? "⚠️ Confirm Clear?" : "Clear Crew"}
              </button>
              <button
                onClick={clearSessionCargoAndExpenses}
                className={`px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer ${
                  clearConfirmActive
                    ? "bg-red-600/90 hover:bg-red-700 border border-red-500 text-white animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100"
                }`}
                title="Clear all logged ores and costs to start a clean ledger sheet"
                id="clear_cargo_costs_btn"
              >
                {clearConfirmActive ? "⚠️ Confirm Clear?" : "Clear Ores"}
              </button>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-lg">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Mission Profit Split Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "Equal", label: "Equal Split", desc: "Even payout distributed to all active participants in the crew." },
                { id: "Role-Based", label: "By Role %", desc: "Custom adjustable weight distributions tailored per role." },
                { id: "Custom-Shares", label: "Custom Shares", desc: "Assign direct proportional share counts on a per-pilot basis." },
              ].map((m) => {
                const isActive = session.splitMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      const updated = { ...session, splitMethod: m.id as any };
                      setSession(updated);
                      saveToLocalStorage(updated);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isActive
                        ? "bg-amber-950/20 border-amber-600 text-amber-100"
                        : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">{m.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{m.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Configurable target weights if Role % is chosen */}
            {session.splitMethod === "Role-Based" && (
              <div className="mt-4 p-4 bg-slate-950/80 border border-slate-850 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Adjust Active Weights for this Session
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Changes here override defaults for this session only
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {crewRoles.map((roleObj) => (
                    <div key={roleObj.id}>
                      <label className="text-[9px] text-slate-400 font-mono block mb-1 truncate" title={`${roleObj.name} Share %`}>
                        {roleObj.name} %
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={session.roleShares[roleObj.name] !== undefined ? session.roleShares[roleObj.name] : roleObj.defaultWeight}
                        onChange={(e) => {
                          const nextShares = { 
                            ...session.roleShares, 
                            [roleObj.name]: Math.max(0, Number(e.target.value)) 
                          };
                          const updated = { ...session, roleShares: nextShares };
                          setSession(updated);
                          saveToLocalStorage(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-amber-500 font-mono text-center rounded py-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. Crew setup */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-6 backdrop-blur-md">
          <div className="border-b border-slate-800 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-200">
                👥 Active Crew & Flight Roles
              </h4>
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-550 hover:border-amber-500/30 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer flex items-center gap-1.5"
                id="open_role_modal_btn"
              >
                <Settings className="w-3.5 h-3.5 text-amber-500" />
                <span>Configure Roles</span>
              </button>
              <button
                onClick={loadScoutLogisticsDemo}
                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-550 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer flex items-center gap-1.5"
                id="load_scout_sandbox_btn"
                title="Loads a complex co-op test scenario with Scout/Scanner role and bag-swapping logs"
              >
                <Radar className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Logistics Scenario</span>
              </button>
            </div>
            <span className="text-xs font-mono text-amber-500 font-bold">
              {session.participants.length} Crew Enlisted
            </span>
          </div>

          <div className="space-y-3 mb-5">
            {session.participants.length === 0 ? (
              <div className="bg-slate-950/40 border border-dashed border-slate-800 p-6 rounded-lg text-center" id="empty_crew_placeholder">
                <p className="text-xs text-slate-400 mb-3 font-sans">
                  🛸 Active crew list is empty. Enlist your party pilots below to start logging shares, or load a pre-configured cooperative demo scenario!
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={loadDefaultDemoCrew}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 text-[10px] font-mono font-bold uppercase rounded transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                    id="load_demo_crew_btn"
                  >
                    Load Demo Crew
                  </button>
                  <button
                    onClick={loadScoutLogisticsDemo}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-500 text-[10px] font-mono font-bold uppercase rounded transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                    id="load_scout_demo_crew_btn"
                  >
                    <Radar className="w-3.5 h-3.5 text-amber-550" />
                    Load Logistics Scenario
                  </button>
                </div>
              </div>
            ) : (
              session.participants.map((player) => {
                return (
                  <div
                    key={player.id}
                    className="bg-slate-950/60 border border-slate-850 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-mono text-amber-400 font-bold">
                        {player.name[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200 font-sans flex items-center gap-2 flex-wrap">
                          <span>{player.name}</span>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                            player.status === "Scouting" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                            player.status === "Mining" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            player.status === "Hauling" ? "bg-indigo-505/10 text-indigo-400 border-indigo-500/20" :
                            player.status === "Refining" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                            "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}>
                            {player.status || "Standby"}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">
                          Ship: {player.shipId}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:flex items-center gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
                      {/* Role selector dropdown */}
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-mono mb-0.5 uppercase">Role</span>
                        <select
                          value={player.role}
                          onChange={(e) => updateParticipantRole(player.id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-xs rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500"
                        >
                          {crewRoles.map((roleObj) => (
                            <option key={roleObj.id} value={roleObj.name}>
                              {roleObj.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status selector dropdown */}
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-505 font-mono mb-0.5 uppercase">Status</span>
                        <select
                          value={player.status || "Standby"}
                          onChange={(e) => updateParticipantStatus(player.id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-800 text-xs rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="Standby">💤 Standby</option>
                          <option value="Scouting">📡 Scouting</option>
                          <option value="Mining">⛏️ Mining</option>
                          <option value="Hauling">📦 Hauling</option>
                          <option value="Refining">🧪 Refining</option>
                        </select>
                      </div>

                      {/* Weight shares (only if custom share models exist) */}
                      {session.splitMethod === "Custom-Shares" && (
                        <div className="flex flex-col w-20">
                          <span className="text-[9px] text-slate-500 font-mono mb-0.5 uppercase">Shares</span>
                          <input
                            type="number"
                            value={player.sharePercentage}
                            onChange={(e) => updateParticipantShare(player.id, Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 text-xs text-center rounded py-1 text-amber-500 font-mono"
                          />
                        </div>
                      )}

                      {/* Individual direct ledger shifts */}
                      <div className="flex flex-col w-24">
                        <span className="text-[9px] text-slate-500 font-mono mb-0.5 uppercase">Offset (aUEC)</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={player.customAdditions || ""}
                          onChange={(e) => updateParticipantAdjustment(player.id, Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 text-xs text-center rounded py-1 text-slate-300 font-mono"
                        />
                      </div>

                      <button
                        onClick={() => removeParticipant(player.id)}
                        className="p-1 px-2.5 rounded text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-xs font-mono font-bold flex items-center md:items-end gap-1.5 shrink-0 self-end mt-4 sm:mt-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Player Box */}
          <div className="p-4 bg-slate-950/40 border border-slate-850/80 rounded-lg">
            <h5 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3 text-amber-500/80">
              + Enlist New Crew Member
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="text-[10px] text-slate-500 font-mono block mb-1">Pilot Handle (In-Game Name)</label>
                <input
                  type="text"
                  placeholder="e.g. CommanderX"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] text-slate-500 font-mono block mb-1">Crew Role</label>
                <select
                  value={newPlayerRole}
                  onChange={(e) => setNewPlayerRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  {crewRoles.map((roleObj) => (
                    <option key={roleObj.id} value={roleObj.name}>
                      {roleObj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] text-slate-500 font-mono block mb-1">Operational Ship</label>
                <select
                  value={newPlayerShip}
                  onChange={(e) => setNewPlayerShip(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="prospector">MISC Prospector</option>
                  <option value="mole">ARGO MOLE</option>
                  <option value="arrastra">RSI Arrastra (Heavy)</option>
                  <option value="orion">RSI Orion (Capital)</option>
                  <option value="roc">Greycat ROC (Ground)</option>
                  <option value="roc_ds">Greycat ROC-DS (Ground)</option>
                  <option value="multitool">Pyro RYT Multi-Tool (Hand)</option>
                  <option value="c2_hercules">C2 Hercules (Cargo)</option>
                  <option value="caterpillar">Caterpillar (Cargo)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  onClick={addParticipant}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold h-8.5 rounded-lg flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Enlist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1.5. Field Operations Radar & Logistics Log */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-6 backdrop-blur-md">
          <div className="border-b border-slate-800 pb-3 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Radar className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>🛰️ Patrol Coordinates & Logistics Swap</span>
              </h4>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                Pinpoint high purity mining rocks & document saddlebag swapping routines in real time
              </p>
            </div>

            {/* Custom Tab Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-start md:self-auto shadow-inner">
              <button
                onClick={() => setActiveLogisticsTab("scout")}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                  activeLogisticsTab === "scout"
                    ? "bg-teal-500 text-slate-950 shadow-md transform scale-102"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${activeLogisticsTab === "scout" ? "text-slate-950" : "text-teal-450"}`} />
                <span>Scouted Bookmarks ({scannedClusters.length})</span>
              </button>
              <button
                onClick={() => setActiveLogisticsTab("saddlebag")}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                  activeLogisticsTab === "saddlebag"
                    ? "bg-amber-500 text-slate-950 shadow-md transform scale-102"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${activeLogisticsTab === "saddlebag" ? "text-slate-950" : "text-amber-500"}`} />
                <span>Saddlebag Swaps ({saddlebagSwaps.length})</span>
              </button>
            </div>
          </div>

          <div className="transition-all duration-300">
            {activeLogisticsTab === "scout" ? (
              /* LEFT: Scanned Clusters Tracker */
              <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-mono font-bold uppercase text-slate-300">Scouted Cluster Bookmarks</span>
                </div>
                <span className="text-[10px] font-mono text-teal-550 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                  {scannedClusters.length} Active Targets
                </span>
              </div>

              {/* Add cluster bookmark form */}
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3">
                <h5 className="text-[10px] font-mono font-bold text-teal-500 uppercase flex items-center gap-1.5 border-b border-slate-850 pb-1.5">
                  <Plus className="w-3.5 h-3.5" /> Bookmarks / Pockets Scouted
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Scout Pilot</label>
                    <select
                      value={addClusterScout}
                      onChange={(e) => setAddClusterScout(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- Choose Scout --</option>
                      {session.participants.map(p => (
                        <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
                      ))}
                      <option value="Guest Scout">External Guest</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Grid Coordinates / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Lyria OM-1 - Cluster Echo"
                      value={addClusterLocation}
                      onChange={(e) => setAddClusterLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500 placeholder-slate-705"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Purity & Ores Detected</label>
                    <input
                      type="text"
                      placeholder="e.g. Quantainium 48%, Laranite 10%"
                      value={addClusterOres}
                      onChange={(e) => setAddClusterOres(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500 placeholder-slate-705"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Mining Status</label>
                    <select
                      value={addClusterStatus}
                      onChange={(e) => setAddClusterStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Scouted">🎯 Scouted / Bookmarked</option>
                      <option value="Splitting">⚡ Active Laser Splitting</option>
                      <option value="Extracted">✅ Ores Extracted / Cleared</option>
                    </select>
                  </div>
                </div>

                {/* Dispatch Assign Selection Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Assign Initial Miner Vessel (Optional)</label>
                    <select
                      value={addClusterAssigned}
                      onChange={(e) => setAddClusterAssigned(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-305 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- No Direct Dispatch --</option>
                      {session.participants.map(p => (
                        <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
                      ))}
                      {!session.participants.some(p => p.name === "StarMinerX") && (
                        <option value="StarMinerX">StarMinerX (Miner)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Dispatch / Traveler Status</label>
                    <select
                      value={addClusterMinerStatus}
                      onChange={(e) => setAddClusterMinerStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-305 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                      disabled={!addClusterAssigned}
                    >
                      <option value="idle">💤 Not Ready / Standby</option>
                      <option value="en_route">🚀 Heading to Location</option>
                      <option value="mining">⛏️ Actively Mining Cluster</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1">Field Observation / Thermal Safety Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. High pressure rock. Keep laser throttle at 35%."
                    value={addClusterNotes}
                    onChange={(e) => setAddClusterNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500 placeholder-slate-705"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleAddCluster}
                    className="px-3.5 py-1.5 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-slate-950 text-xs font-bold font-mono uppercase rounded border border-teal-500/20 hover:border-transparent transition-all active:scale-95 cursor-pointer"
                  >
                    Deploy Bookmark
                  </button>
                </div>
              </div>

              {/* Scanned clusters list */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {scannedClusters.length === 0 ? (
                  <div className="text-center p-6 bg-slate-950/20 border border-dashed border-slate-850 rounded-lg text-[10px] text-slate-500">
                    No active targets cataloged. Select high value clusters to dispatch crew.
                  </div>
                ) : (
                  scannedClusters.map(c => {
                    let badgeColor = "bg-teal-500/10 text-teal-400 border-teal-500/20";
                    if (c.status === "Splitting") badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                    if (c.status === "Extracted") badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

                    return (
                      <div key={c.id} className="bg-slate-950/40 border border-slate-850 p-3 rounded-lg hover:border-slate-800 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 block">{c.timestamp} • Scouted by {c.scoutName}</span>
                            <h6 className="text-[13px] font-bold text-slate-200 font-sans mt-0.5">{c.location}</h6>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
                              {c.status}
                            </span>
                            <button
                              onClick={() => removeCluster(c.id)}
                              className="text-slate-600 hover:text-red-400 p-0.5 rounded transition-all cursor-pointer"
                              title="Delete bookmark"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-1 bg-slate-900/60 p-2 rounded text-[11px] font-mono border border-slate-850">
                          <div>
                            <span className="text-slate-500 text-[10px]">Ore Composition</span>
                            <span className="block text-teal-400 font-bold mt-0.5">{c.oresDetected}</span>
                          </div>
                        </div>

                        {c.notes && (
                          <p className="mt-2 text-xs text-slate-400 italic bg-slate-900/25 p-1.5 px-2 border-l-2 border-teal-500/30 rounded-r">
                            "{c.notes}"
                          </p>
                        )}

                        {/* Assignment Logistics and Traveler States */}
                        <div className="mt-3 text-xs border-t border-slate-850 pt-2 space-y-2" id={`assign_box_${c.id}`}>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[9px] text-slate-500 uppercase">Assigned Miner:</span>
                              {c.assignedMiner ? (
                                <span className="font-bold text-emerald-400 font-sans ml-1 text-[11px] flex items-center gap-1">
                                  <span>👤 {c.assignedMiner}</span>
                                </span>
                              ) : (
                                <span className="text-slate-600 italic text-[11px] ml-1">None deployed</span>
                              )}
                            </div>

                            {/* Dropdown to assign or swap on-the-fly */}
                            <div>
                              <select
                                value={c.assignedMiner || ""}
                                onChange={(e) => updateClusterMiner(c.id, e.target.value)}
                                className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                              >
                                <option value="">Deploy Pilot...</option>
                                {session.participants.map(p => (
                                  <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
                                ))}
                                {!session.participants.some(p => p.name === "StarMinerX") && (
                                  <option value="StarMinerX">StarMinerX (Miner)</option>
                                )}
                              </select>
                            </div>
                          </div>

                          {/* Show route state indicator and action togglers if someone is assigned */}
                          {c.assignedMiner && (
                            <div className="bg-slate-900/40 border border-slate-850/50 p-2 rounded flex flex-col gap-2">
                              {/* Status Display badge */}
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-slate-500 text-[10px]">Sub-orbital Stage</span>
                                {c.minerStatus === "en_route" && (
                                  <span className="text-cyan-400 font-bold flex items-center gap-1 animate-pulse">
                                    🚀 Traveling (En Route)
                                  </span>
                                )}
                                {c.minerStatus === "mining" && (
                                  <span className="text-amber-500 font-bold flex items-center gap-1">
                                    ⚡ Actively Mining Pocket
                                  </span>
                                )}
                                {(c.minerStatus === "idle" || !c.minerStatus) && (
                                  <span className="text-slate-500 font-bold">
                                    💤 Dispatched / Standby
                                  </span>
                                )}
                              </div>

                              {/* Live Status transition buttons */}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateClusterMinerStatus(c.id, "en_route")}
                                  className={`flex-1 text-[9px] font-mono font-bold uppercase py-1 rounded transition-all cursor-pointer text-center ${
                                    c.minerStatus === "en_route"
                                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-550/40"
                                      : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800"
                                  }`}
                                  title="Mark pilot as traveling to pocket location"
                                >
                                  En Route
                                </button>
                                <button
                                  onClick={() => updateClusterMinerStatus(c.id, "mining")}
                                  className={`flex-1 text-[9px] font-mono font-bold uppercase py-1 rounded transition-all cursor-pointer text-center ${
                                    c.minerStatus === "mining"
                                      ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
                                      : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800"
                                  }`}
                                  title="Mark pilot as arrived and cracking raw rocks there"
                                >
                                  At Target / Mining
                                </button>
                                <button
                                  onClick={() => updateClusterMinerStatus(c.id, "idle")}
                                  className={`px-1.5 text-[9px] font-mono font-bold uppercase py-1 rounded transition-all cursor-pointer text-center ${
                                    c.minerStatus === "idle" || !c.minerStatus
                                      ? "bg-slate-800 text-slate-300 border border-slate-700"
                                      : "bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800"
                                  }`}
                                  title="Clear / Standby assignment state"
                                >
                                  Standby
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* RIGHT: Saddlebag swap & cargo logistics tracking */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-mono font-bold uppercase text-slate-300">Saddlebag Swap & Shuttle Records</span>
                </div>
                <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {saddlebagSwaps.length} Swaps Synced
                </span>
              </div>

              {/* Add swap log form */}
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3">
                <h5 className="text-[10px] font-mono font-bold text-amber-500 uppercase flex items-center gap-1.5 border-b border-slate-850 pb-1.5">
                  <Plus className="w-3.5 h-3.5" /> Log Saddlebag Swap / Shuttle Run
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Detaching Miner / Ship</label>
                    <select
                      value={addSwapMiner}
                      onChange={(e) => setAddSwapMiner(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Select Miner --</option>
                      {session.participants.map(p => (
                        <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
                      ))}
                      <option value="Guest Miner">Guest Prospector</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Receiving Hauler / Ship</label>
                    <select
                      value={addSwapHauler}
                      onChange={(e) => setAddSwapHauler(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Select Hauler --</option>
                      {session.participants.map(p => (
                        <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
                      ))}
                      <option value="Guest Hauler">Guest Transport</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Bag Count</label>
                    <input
                      type="number"
                      min="1"
                      value={addSwapBags}
                      onChange={(e) => setAddSwapBags(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-amber-500 font-mono rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Total SCU Cargo</label>
                    <input
                      type="number"
                      min="1"
                      value={addSwapSCU}
                      onChange={(e) => setAddSwapSCU(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-amber-500 font-mono rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 font-mono block mb-1">Material Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Quantainium"
                      value={addSwapMaterial}
                      onChange={(e) => setAddSwapMaterial(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1">Saddlebag Transfer Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Bags snapped to latch mechanism. Pressure nominal."
                    value={addSwapNotes}
                    onChange={(e) => setAddSwapNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 placeholder-slate-705"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleAddBagSwap}
                    className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-500 hover:text-slate-950 text-xs font-bold font-mono uppercase rounded border border-amber-500/20 hover:border-transparent transition-all active:scale-95 cursor-pointer"
                  >
                    Log Container Swap
                  </button>
                </div>
              </div>

              {/* Saddlebag swaps list */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {saddlebagSwaps.length === 0 ? (
                  <div className="text-center p-6 bg-slate-950/20 border border-dashed border-slate-850 rounded-lg text-[10px] text-slate-500">
                    No swap logs stored. Fill a Prospector and dispatch hauler bags to start logging transfers.
                  </div>
                ) : (
                  saddlebagSwaps.map(s => (
                    <div key={s.id} className="bg-slate-950/40 border border-slate-850 p-3 rounded-lg hover:border-slate-800 transition-all font-sans text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-mono text-[9px] text-slate-500">
                          {s.timestamp} • Cooperative Logistics Block
                        </div>
                        <button
                          onClick={() => removeBagSwap(s.id)}
                          className="text-slate-600 hover:text-red-400 p-0.5 rounded transition-all"
                          title="Delete record"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap font-sans text-[12px]">
                        <span className="font-semibold text-slate-200">{s.minerName}</span>
                        <span className="text-[10px] bg-slate-900 border border-slate-850 px-1.5 py-0.5 font-mono text-slate-400 rounded">
                          {s.minerShip}
                        </span>
                        <span className="text-amber-505 text-[10px] font-mono">➔ swapped {s.bagCount} bags ({s.totalSCU} SCU) to</span>
                        <span className="font-semibold text-slate-200">{s.haulerName}</span>
                        <span className="text-[10px] bg-slate-900 border border-slate-850 px-1.5 py-0.5 font-mono text-slate-400 rounded">
                          {s.haulerShip}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between bg-slate-900/60 p-1.5 px-2.5 rounded border border-slate-850 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-500 text-[9px]">Transferred Materiel</span>
                          <span className="block text-amber-500 font-bold">{s.materialName}</span>
                        </div>
                      </div>

                      {s.notes && (
                        <p className="mt-2 text-xs text-slate-400 italic bg-slate-900/25 p-1.5 px-2 border-l-2 border-teal-500/30 rounded-r">
                          "{s.notes}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* 2. Cargo sheet logs */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-6 backdrop-blur-md">
          <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-205">
              📦 Cargo Manifest & Extracted Ore Log
            </h4>
            <span className="text-xs font-mono text-emerald-500 font-bold">
              {session.cargoLoads.length} Ores Logged
            </span>
          </div>

          <div className="space-y-4 mb-5">
            {session.cargoLoads.length === 0 ? (
              <div className="bg-slate-950/40 p-6 rounded-lg text-center text-xs text-slate-500 border border-slate-850">
                No cargo loaded. Record extracted materials from the asteroid belts below to generate wealth.
              </div>
            ) : (
              session.cargoLoads.map((load) => {
                const mat = MINING_MATERIALS.find((m) => m.id === load.materialId);
                if (!mat) return null;

                const stationObj = REFINERY_STATIONS.find((s) => s.id === load.stationId);
                const systemObj = SOLAR_SYSTEMS.find((s) => s.id === load.systemId);

                const pricePerSCU = load.actualSellPricePerSCU ?? (load.isRefined ? mat.baseValueRefined : mat.baseValueRaw);
                
                // Calculate Yield modifying the base SCU for output calculation
                let yieldPercentageText = "100%";
                let finalCalculatedValue = load.quantitySCU * pricePerSCU;
                
                if (load.isRefined) {
                  const methodObj = REFINERY_METHODS.find((rm) => rm.id === load.refineMethod);
                  const mYield = methodObj ? methodObj.yield : 1.0;
                  const sBonus = getStationBonus(load.stationId, load.materialId);
                  const totalYield = Math.max(0, mYield + sBonus);
                  yieldPercentageText = `${Math.round(totalYield * 100)}% (${methodObj?.name || ""} Method base ${Math.round(mYield * 100)}% + Station ${sBonus >= 0 ? "+" : ""}${Math.round(sBonus * 100)}%)`;
                  finalCalculatedValue = load.quantitySCU * pricePerSCU * totalYield;
                }

                const isCurrentlyRefining = load.isRefined && load.refineryJobStatus === "processing";
                const isRefinedJobDone = load.isRefined && load.refineryJobStatus === "completed";
                
                let percentComplete = 0;
                let remainingTimeMs = 0;
                if (isCurrentlyRefining && load.jobEndsAt && load.jobStartedAt) {
                  const totalTimeMs = load.jobEndsAt - load.jobStartedAt;
                  remainingTimeMs = Math.max(0, load.jobEndsAt - Date.now());
                  percentComplete = totalTimeMs > 0 ? Math.min(100, Math.round(((totalTimeMs - remainingTimeMs) / totalTimeMs) * 100)) : 100;
                }

                return (
                  <div
                    key={load.id}
                    className={`bg-slate-950/60 border rounded-lg p-4 flex flex-col gap-4 hover:border-slate-800 transition-all ${
                      isCurrentlyRefining ? "border-amber-500/30 bg-slate-950/70 shadow-lg shadow-amber-500/5 animate-pulse-slow" : "border-slate-850"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                          <span className="text-sm font-bold text-slate-200">{mat.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold uppercase tracking-wider ${
                              load.isRefined ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {load.isRefined ? "Refined Cargo" : "Raw Ore (Instant Sale)"}
                          </span>
                          {isCurrentlyRefining && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-0.5" />
                              Refining...
                            </span>
                          )}
                          {isRefinedJobDone && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              COMPLETED
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs font-mono text-slate-400 flex flex-wrap gap-y-1 gap-x-4">
                          <span>Payload: <b className="text-slate-200">{load.quantitySCU} SCU</b></span>
                          {load.isRefined && (
                            <>
                              <span>Method: <b className="text-slate-200">{load.refineMethod}</b></span>
                              {stationObj && (
                                <span>Refinery: <b className="text-amber-500/90">{stationObj.name} ({systemObj?.name})</b></span>
                              )}
                              <span>Total Yield: <b className="text-emerald-400">{yieldPercentageText}</b></span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase font-mono block tracking-wider">
                          {isCurrentlyRefining ? "Estimated Value (Locked)" : "Realizable Market Revenue"}
                        </span>
                        <span className={`text-sm font-bold font-mono tracking-tight ${isCurrentlyRefining ? "text-slate-400" : "text-emerald-400"}`}>
                          {Math.round(finalCalculatedValue).toLocaleString()} aUEC
                        </span>
                      </div>
                    </div>

                    {/* Countdown Progress bar and trigger action */}
                    {isCurrentlyRefining && (
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                        <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                            Refinery Ticker: <b className="text-slate-200">{formatTimeRemaining(remainingTimeMs)}</b>
                          </span>
                          <span className="text-amber-400 font-bold">{percentComplete}%</span>
                        </div>
                        
                        <div className="w-full bg-slate-950 h-2 rounded overflow-hidden mb-3 border border-slate-850">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-1000"
                            style={{ width: `${percentComplete}%` }}
                          />
                        </div>

                        <div className="p-2.5 border border-amber-500/20 bg-amber-500/5 rounded font-mono text-[10px] text-amber-400 flex items-center gap-2 leading-relaxed">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          <span><b>Locked in Refinery Module:</b> Processing strictly matches the real-world schedule. Profit estimation is virtualized until the job reaches full completion. No manual bypasses allowed.</span>
                        </div>
                      </div>
                    )}

                    {/* Inputs panel & Action buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-t border-slate-850/60 pt-3 gap-3">
                      <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-mono mb-0.5">Custom Price Modifier (aUEC/SCU)</span>
                          <input
                            type="number"
                            value={load.actualSellPricePerSCU || ""}
                            onChange={(e) => updateCargoSellPrice(load.id, Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 text-xs text-left rounded py-1 px-2.5 text-amber-500 font-mono w-32 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        {stationObj && (
                          <div className="text-[10px] text-slate-400 border border-slate-855 bg-slate-950/40 rounded px-2.5 py-1 select-none">
                            🏢 <span className="font-mono text-slate-500">Taxes:</span> <b className="text-slate-350">{stationObj.costModifier}x Cost</b> • <span className="font-mono text-slate-500">Length:</span> <b className="text-slate-350">{stationObj.speedModifier}x</b>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeCargoLoad(load.id)}
                        className="p-1 px-2.5 rounded text-red-400 hover:text-red-300 bg-red-950/10 hover:bg-red-950/30 border border-red-900/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all self-end shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Dispose Run</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Cargo Adder */}
          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-lg space-y-4">
            <h5 className="text-xs font-mono font-bold text-slate-400 uppercase text-amber-500/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Record Extracted Cargo Run</span>
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              <div className="md:col-span-4">
                <label className="text-[10px] text-slate-500 font-mono block mb-1">Commodity Material</label>
                <select
                  value={addMaterialId}
                  onChange={(e) => setAddMaterialId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  {MINING_MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="text-[10px] text-slate-500 font-mono block mb-1">Cargo Volume (SCU)</label>
                <input
                  type="number"
                  min="1"
                  value={addSCU}
                  onChange={(e) => setAddSCU(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-[10px] text-slate-500 font-mono block mb-1">Processing Path</label>
                <select
                  value={addMethod}
                  onChange={(e) => setAddMethod(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  {REFINERY_METHODS.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} {rm.id !== "Unrefined" ? `(Base Yield: ${rm.yield * 100}%)` : "(Direct Immediate Sale)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Render Refinery Routing options if refined method is selected */}
            {addMethod !== "Unrefined" && (
              <div className="p-3 bg-slate-900/60 rounded border border-slate-850/80 animate-fade-in space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-mono block mb-1">Solar System Jurisdiction</label>
                    <select
                      value={addSystemId}
                      onChange={(e) => setAddSystemId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      {SOLAR_SYSTEMS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-mono block mb-1">Refinery Station</label>
                    <select
                      value={addStationId}
                      onChange={(e) => setAddStationId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      {REFINERY_STATIONS.filter((s) => s.systemId === addSystemId).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-mono block mb-1">Refinery Ticker Option</label>
                    <select
                      value={addTimerMode}
                      onChange={(e) => setAddTimerMode(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="instant">Claim Refined Instantly</option>
                      <option value="timer">Start Live Countdown (Simulation)</option>
                    </select>
                  </div>
                </div>

                {/* Live preview for Yield Bonus & Tax Estimator */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-300">
                    {(() => {
                      const matObj = MINING_MATERIALS.find((m) => m.id === addMaterialId);
                      const bonus = getStationBonus(addStationId, addMaterialId);
                      const station = REFINERY_STATIONS.find((s) => s.id === addStationId);
                      if (!matObj || !station) return null;
                      return (
                        <span className="flex flex-wrap items-center gap-1.5">
                          <b className="text-amber-500">{station.fullName} Analyses:</b>
                          {bonus !== 0 ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono leading-none font-bold ${
                              bonus > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>
                              Yield {bonus >= 0 ? "+" : ""}{Math.round(bonus * 100)}% for {matObj.name}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono">No specific yield modifiers.</span>
                          )}
                          <span className="text-slate-500">• Speed: {station.speedModifier}x length • Taxes: {station.costModifier}x</span>
                        </span>
                      );
                    })()}
                  </div>

                  <div className="text-[11px] font-mono text-amber-500 text-right w-full sm:w-auto">
                    Est Fee: <b className="text-slate-100">{getRefineryCostEst().toLocaleString()} aUEC</b>
                  </div>
                </div>

                {/* Auto log checkbox */}
                <label className="flex items-center gap-2 select-none cursor-pointer pt-1 block">
                  <input
                    type="checkbox"
                    checked={autoLogRefineryFee}
                    onChange={(e) => setAutoLogRefineryFee(e.target.checked)}
                    className="accent-amber-500 rounded bg-slate-950 border-slate-800 w-3.5 h-3.5"
                  />
                  <span className="text-[10px] font-mono text-slate-400">
                    Auto-log processing fee inside mission expenses
                  </span>
                </label>
              </div>
            )}

            <button
              onClick={addCargoLoad}
              className="w-full bg-amber-500 hover:bg-amber-600 active:translate-y-px text-slate-950 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 text-slate-950 font-bold" />
              <span>Record cargo and deploy routing</span>
            </button>
          </div>
        </div>

        {/* 3. Expenses log */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-6 backdrop-blur-md">
          <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-200">
              🛠️ Operational Expenditures & Refinery Taxes
            </h4>
            <span className="text-xs font-mono text-red-400 font-bold">
              {totalExpenses.toLocaleString()} aUEC Total Outlays
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {session.expenses.map((exp) => {
              const payer = session.participants.find((p) => p.id === exp.paidByParticipantId);
              return (
                <div
                  key={exp.id}
                  className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-lg flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{exp.description}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      Settled By: <b className="text-slate-400">{payer?.name || "Unknown Pilot"}</b>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-mono font-bold text-red-400">
                      -{exp.amount.toLocaleString()} aUEC
                    </span>
                    <button
                      onClick={() => removeExpense(exp.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/20 rounded border border-red-900/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add out-of-pocket expenses */}
          <div className="p-4 bg-slate-950/40 border border-slate-850/80 rounded-lg">
            <h5 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3 text-amber-500/80">
              + Add Out-of-Pocket Expense
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="text-[10px] text-slate-500 font-mono block mb-1">Expense Details</label>
                <input
                  type="text"
                  placeholder="e.g. Fuel Top-off, Refinery Fee, Laser Head Rent"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-500 font-mono block mb-1">Amount (aUEC)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={expenseAmount || ""}
                  onChange={(e) => setExpenseAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] text-slate-500 font-mono block mb-1">Paid by Pilot</label>
                <select
                  value={expensePaidBy}
                  onChange={(e) => setExpensePaidBy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  {session.participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  onClick={addExpense}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold h-8.5 rounded-lg flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Outlay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Financial Results & Transfer Settler */}
      <div className="xl:col-span-4 space-y-6" id="op_results_right">
        {/* Pot Summary */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-amber-500 mb-4 border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-amber-500" />
            <span>💰 Mission Ledger & Pot Summary</span>
          </h3>

          <div className="space-y-3.5 font-mono font-bold">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Gross Cargo Revenues (Settled):</span>
              <span className="text-slate-100">{totalRevenue.toLocaleString()} aUEC</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Reimbursed Outlays:</span>
              <span className="text-red-400">-{totalExpenses.toLocaleString()} aUEC</span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3">
              <span className="text-slate-300">Net Profit Pool (Pot):</span>
              <span className="text-base text-emerald-400 tracking-tight">
                {netProfit.toLocaleString()} aUEC
              </span>
            </div>

            {potentialRevenue > 0 && (
              <div className="border-t border-slate-800 pt-3 mt-1.5 space-y-2">
                <div className="flex justify-between items-center text-xs text-amber-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow animate-pulse" />
                    Pending Refinery Wealth:
                  </span>
                  <span>+{potentialRevenue.toLocaleString()} aUEC</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>Projected Unlocked Pot:</span>
                  <span>{potentialNetProfit.toLocaleString()} aUEC</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dividends */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 backdrop-blur-md">
          <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Landmark className="w-4 h-4 text-amber-500" />
            <span>Salary Dividends (Net Payout per Crew)</span>
          </h3>

          <div className="space-y-3 mb-5">
            {payouts.map((p) => {
              const participantObj = session.participants.find((part) => part.id === p.id);
              const isPaid = participantObj?.payoutStatus === "paid";
              return (
                <div 
                  key={p.id} 
                  className={`border p-3 rounded-lg flex justify-between items-center transition-all ${
                    isPaid 
                      ? "bg-emerald-950/15 border-emerald-900/30 opacity-70" 
                      : "bg-slate-950/60 border-slate-850/80 hover:border-slate-800"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {isPaid ? (
                        <span className="text-[8px] px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-mono uppercase font-bold tracking-wider">
                          Settled
                        </span>
                      ) : (
                        <span className="text-[8px] px-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono uppercase font-bold tracking-wider">
                          Pending Wire
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {p.role} • Share: {p.profitShare.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="text-xs font-mono font-extrabold text-amber-500 block">
                        {p.finalReceive.toLocaleString()} aUEC
                      </span>
                      {p.reimbursements > 0 && (
                        <div className="text-[9px] text-emerald-400 font-mono">
                          (Incl. +{p.reimbursements.toLocaleString()} refund)
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggleParticipantPayoutStatus(p.id)}
                      className={`p-1.5 rounded transition-all ${
                        isPaid 
                          ? "bg-emerald-500 text-slate-950 hover:bg-emerald-600 border border-emerald-600" 
                          : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                      title={isPaid ? "Mark as Unpaid/Unsent" : "Mark as Wired (Settled)"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              Who sold the materials? (Holds the Credits Pot)
            </span>
            <select
              value={revenueHolderId}
              onChange={(e) => setRevenueHolderId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {session.participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 font-sans mt-1">
              * Select the pilot who completed the TDD cargo trade in-game and possesses the raw credits in their mobiGlas wallet.
            </p>
          </div>
        </div>

        {/* Settlement Orders */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 backdrop-blur-md">
          <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <ArrowRight className="w-4 h-4" />
            <span>mo.TRADER Transfer Instructions</span>
          </h3>

          <div className="space-y-2.5">
            {transfers.length === 0 ? (
              <div className="bg-slate-950/40 p-3 rounded-lg text-center text-xs text-slate-500">
                No active settlements. Enlist crew and log cargo to generate transactions.
              </div>
            ) : (
              transfers.map((t, idx) => {
                const targetPilot = session.participants.find(p => p.name === t.to);
                const isPaid = targetPilot?.payoutStatus === "paid";
                return (
                  <div
                    key={idx}
                    className={`border p-3 rounded-lg flex flex-col justify-between font-mono transition-all ${
                      isPaid 
                        ? "bg-emerald-950/10 border-emerald-900/20 opacity-60" 
                        : "bg-slate-950/80 border-slate-850"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase mb-1">
                      <span>Transfer Order #{idx + 1}</span>
                      {isPaid && <span className="text-emerald-400 font-bold">SETTLED ✓</span>}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold">{t.from}</span>
                      <span className="text-[10px] text-slate-500">➡️</span>
                      <span className="text-slate-100 font-semibold">{t.to}</span>
                    </div>
                    <div className="text-xs font-bold text-amber-500 mt-1 pb-1 flex items-center justify-between">
                      <span>Pay:</span>
                      <span>{t.amount.toLocaleString()} aUEC</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-900 mt-1">
                      <p className="text-[9px] text-slate-500 leading-tight flex-1">
                        * Wire via mobiGlas mo.TRADER inside Star Citizen.
                      </p>
                      {targetPilot && (
                        <button
                          onClick={() => toggleParticipantPayoutStatus(targetPilot.id)}
                          className={`px-2 py-0.5 rounded font-sans text-[9px] font-bold ${
                            isPaid 
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                              : "bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold"
                          }`}
                        >
                          {isPaid ? "Paid ✓" : "Mark Paid"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Export briefing card */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 backdrop-blur-md">
          <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-205 mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Share Expedition Briefing</span>
          </h3>

          <p className="text-xs text-slate-400 mb-3">
            Generate and copy a perfectly formatted Markdown briefing to paste into your Star Citizen Org's Discord fleet-ops log!
          </p>

          <button
            onClick={copyReportToClipboard}
            className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
              copiedIndex
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950"
            }`}
          >
            {copiedIndex ? (
              <>
                <Check className="w-4 h-4" />
                 Briefing Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Briefing for Discord
              </>
            )}
          </button>
        </div>
      </div>
    </div>

    {/* Dynamic Crew Role Assignment Modal */}
    <AnimatePresence>
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsRoleModalOpen(false);
              setRoleModalError("");
            }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm"
            id="role_modal_backdrop"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl p-6 overflow-hidden z-10"
            id="role_modal_box"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                  <Settings className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-slate-200">
                    Crew Role Configuration Matrix
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    Pre-define organization roles & weighted default split distributions
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setRoleModalError("");
                }}
                className="p-1 px-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
                id="close_role_modal_btn_top"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Informational Warning section */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3.5 mb-4 text-[11px] leading-relaxed text-slate-400 font-sans flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-550 mt-0.5 shrink-0" />
              <div>
                Changing role names inside this master catalog will dynamically propagate the update to any active flight pilots. Weights assigned here set the global default; you can still tweak override weights for each individual session under the Split Strategy controls.
              </div>
            </div>

            {roleModalError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs font-sans mb-4 flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <span>{roleModalError}</span>
              </div>
            )}

            {/* Add Custom Role form */}
            <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg mb-5">
              <h4 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest mb-3">
                + Create Custom Operational Role
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-6">
                  <label className="text-[9px] text-slate-500 font-mono block mb-1 uppercase">Role Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Laser Operator, Driver"
                    value={newRoleInputName}
                    onChange={(e) => setNewRoleInputName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 focus:bg-slate-900/60 placeholder-slate-600"
                    id="new_role_title_input"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[9px] text-slate-500 font-mono block mb-1 uppercase">Default Weight %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newRoleInputWeight}
                    onChange={(e) => setNewRoleInputWeight(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-amber-500 font-mono rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 text-center"
                    id="new_role_weight_input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    onClick={addCrewRole}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-8.5 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
                    id="create_role_btn"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Distribution Summary Tracker */}
            <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg mb-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                    📊 Total Percentage Distribution
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Ensuring all default role shares sum to exactly 100% to prevent fractional payout issues
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {crewRoles.reduce((sum, r) => sum + r.defaultWeight, 0) === 100 ? (
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/35 px-2 py-1 rounded flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                      <span>SECURE (100%)</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-1 rounded flex items-center gap-1">
                        ⚠️ UNBALANCED ({crewRoles.reduce((sum, r) => sum + r.defaultWeight, 0)}%)
                      </span>
                      <button
                        onClick={normalizeCrewRoleWeights}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer shadow active:scale-95 flex items-center gap-1"
                        title="Rescale all role weights proportionally to sum to exactly 100%"
                      >
                        ⚡ Normalize
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Proportional Segmented Progress Bar */}
              <div className="w-full h-3.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden flex">
                {crewRoles.length === 0 ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[9px] font-mono text-slate-600">
                    No roles created
                  </div>
                ) : (
                  crewRoles.map((roleObj, idx) => {
                    const totalWeight = crewRoles.reduce((sum, r) => sum + r.defaultWeight, 0) || 1;
                    const percent = (roleObj.defaultWeight / totalWeight) * 100;
                    if (percent <= 0) return null;

                    // Nice palette of clean background colors
                    const tailwindBgColors = [
                      "bg-cyan-500",
                      "bg-amber-500",
                      "bg-emerald-500",
                      "bg-indigo-500",
                      "bg-purple-500",
                      "bg-teal-500",
                      "bg-pink-500",
                      "bg-rose-500",
                      "bg-blue-500"
                    ];
                    const selectedColorClass = tailwindBgColors[idx % tailwindBgColors.length];

                    return (
                      <div
                        key={roleObj.id}
                        className={`${selectedColorClass} h-full transition-all border-r border-slate-900/40 last:border-0`}
                        style={{ width: `${percent}%` }}
                        title={`${roleObj.name}: ${roleObj.defaultWeight}%`}
                      />
                    );
                  })
                )}
              </div>

              {/* Detailed dynamic breakdown of percentages to visual chips */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {crewRoles.map((roleObj, idx) => {
                  const totalWeight = crewRoles.reduce((sum, r) => sum + r.defaultWeight, 0) || 1;
                  const actualP = ((roleObj.defaultWeight / totalWeight) * 100).toFixed(1);
                  const textDotColors = [
                    "text-cyan-400 bg-cyan-400/10 border-cyan-500/20",
                    "text-amber-400 bg-amber-400/10 border-amber-500/20",
                    "text-emerald-400 bg-emerald-400/10 border-emerald-500/20",
                    "text-indigo-400 bg-indigo-400/10 border-indigo-500/20",
                    "text-purple-400 bg-purple-400/10 border-purple-500/20",
                    "text-teal-400 bg-teal-400/10 border-teal-500/20",
                    "text-pink-400 bg-pink-400/10 border-pink-500/20",
                    "text-rose-400 bg-rose-400/10 border-rose-500/20",
                    "text-blue-400 bg-blue-400/10 border-blue-500/20"
                  ];
                  const chipColor = textDotColors[idx % textDotColors.length];

                  return (
                    <div key={roleObj.id} className={`text-[9px] font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 ${chipColor}`}>
                      <span className="font-bold">{roleObj.name}</span>
                      <span className="text-slate-500 opacity-60">|</span>
                      <span className="font-bold text-slate-100">{roleObj.defaultWeight}%</span>
                      {Math.abs(Number(actualP) - roleObj.defaultWeight) > 0.05 && (
                        <span className="text-[8px] text-slate-400 italic">({actualP}%)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Master Roles List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-500 uppercase border-b border-slate-850 pb-1 mb-1.5">
                <span>Pre-defined Roles & Names</span>
                <span className="mr-32">Payout Weight (Shares Count)</span>
              </div>
              {crewRoles.map((roleObj) => {
                const isAssigned = session.participants.some((p) => p.role === roleObj.name);
                return (
                  <div
                    key={roleObj.id}
                    className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-lg flex items-center justify-between gap-4 group hover:border-slate-700 hover:bg-slate-950/80 transition-all font-sans"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={roleObj.name}
                        onChange={(e) => updateCrewRoleName(roleObj.id, e.target.value)}
                        className="bg-transparent border-b border-transparent group-hover:border-slate-800 hover:border-amber-500/40 text-xs text-slate-200 font-medium px-1 py-0.5 focus:outline-none focus:border-amber-500 focus:bg-slate-900 w-44 font-sans rounded"
                      />
                      {isAssigned && (
                        <span className="text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                          Active Crew Attached
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={roleObj.defaultWeight}
                          onChange={(e) => updateCrewRoleWeight(roleObj.id, Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 text-xs text-amber-400 font-mono text-center rounded py-1 px-1.5 w-16 focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">pts</span>
                      </div>

                      <button
                        onClick={() => deleteCrewRole(roleObj.id)}
                        disabled={isAssigned}
                        className={`p-1.5 rounded border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${
                          isAssigned
                            ? "text-slate-600 border-slate-850 bg-slate-950/10 cursor-not-allowed"
                            : "text-red-400 border-red-950/40 hover:bg-red-950/20 hover:border-red-905 hover:text-red-350"
                        }`}
                        title={isAssigned ? "Cannot delete role while active pilots are using it" : "Remove role"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer controls */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-5">
              <button
                onClick={resetCrewRolesToDefault}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 text-[10px] font-mono font-bold uppercase rounded transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                id="reset_default_roles_btn"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-500" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setRoleModalError("");
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-250 text-xs font-semibold rounded-md transition-all cursor-pointer active:scale-95"
                id="dismiss_role_modal_btn"
              >
                Confirm & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
  );
}
