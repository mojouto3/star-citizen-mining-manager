/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MiningMaterial {
  id: string;
  name: string;
  baseValueRaw: number; // aUEC per SCU
  baseValueRefined: number; // aUEC per SCU
  instability: "Very High" | "High" | "Medium" | "Low" | "None";
  resistance: "Very High" | "High" | "Medium" | "Low" | "None";
  locations: string[];
  description: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3" | "Low-Tier";
  weight: number; // Priority factor or density weight
}

export interface MiningShip {
  id: string;
  name: string;
  scuCapacity: number;
  crewMax: number;
  laserSlots: number;
  moduleSlotsPerLaser: number;
  description: string;
  type: "ship" | "ground" | "hand";
}

export interface LaserHead {
  id: string;
  name: string;
  power: number; // Laser power (W)
  optimalWindow: number; // Optimal charge window multiplier
  instabilityModifier: number; // percentage change (e.g., -0.4 for -40%)
  resistanceModifier: number; // percentage change
  moduleSlots: number;
  description: string;
}

export interface MiningModule {
  id: string;
  name: string;
  type: "Passive" | "Active";
  powerModifier: number;
  optimalWindowModifier: number;
  instabilityModifier: number;
  resistanceModifier: number;
  description: string;
}

export interface MiningGadget {
  id: string;
  name: string;
  instabilityModifier: number;
  resistanceModifier: number;
  optimalWindowModifier: number;
  shatterDamageModifier: number;
  description: string;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  shipId: string;
  sharePercentage: number; // if manual share is enabled
  customAdditions: number; // positive or negative aUEC adjustments (like fuel / refinery paid by them)
  payoutStatus?: "unpaid" | "paid";
  paidAtTimestamp?: number;
  status?: "Standby" | "Scouting" | "Mining" | "Hauling" | "Refining";
}

export interface CargoLoad {
  id: string;
  materialId: string;
  quantitySCU: number; // SCU quantity
  refineMethod: "Cormack" | "Dinyan" | "Ferron" | "Gallow" | "Pyrometric" | "Unrefined";
  isRefined: boolean;
  actualSellPricePerSCU?: number; // fallback to default refined if undefined
  systemId?: string; // e.g. "stanton"
  stationId?: string; // e.g. "arc_l1"
  refineryJobStatus?: "completed" | "processing" | "queued";
  jobStartedAt?: number; // timestamp in ms
  jobEndsAt?: number; // timestamp in ms
  jobTotalDurationSec?: number; // total duration
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidByParticipantId: string; // Who paid for this expense (e.g., fuels, repairs, refinery fees)
}

export interface OperationSession {
  id: string;
  title: string;
  date: string;
  splitMethod: "Equal" | "Role-Based" | "Custom-Shares";
  roleShares: {
    [role: string]: number;
  };
  participants: Participant[];
  cargoLoads: CargoLoad[];
  expenses: Expense[];
  notes: string;
}

export interface ScannedCluster {
  id: string;
  scoutName: string;
  location: string;
  oresDetected: string;
  status: "Scouted" | "Splitting" | "Extracted";
  assignedMiner?: string;
  minerStatus?: "idle" | "en_route" | "mining";
  notes?: string;
  timestamp: string;
}

export interface SaddlebagSwap {
  id: string;
  minerName: string;
  minerShip: string;
  haulerName: string;
  haulerShip: string;
  bagCount: number;
  totalSCU: number;
  materialName: string;
  notes?: string;
  timestamp: string;
}

