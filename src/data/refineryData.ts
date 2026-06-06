/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemData {
  id: string;
  name: string;
  description: string;
  riskFactor: number; // multiplier for rewards/danger
}

export interface MaterialModifier {
  yieldBonus: number; // percentage (e.g. 0.05 for +5%, -0.04 for -4%)
}

export interface StationData {
  id: string;
  systemId: string;
  name: string;
  fullName: string;
  locationDetails: string;
  costModifier: number; // e.g. 0.9 for 10% cheaper
  speedModifier: number; // e.g. 1.2 for 20% slower
  materialModifiers: Record<string, MaterialModifier>; // key matches MaterialId
}

export const SOLAR_SYSTEMS: SystemData[] = [
  {
    id: "stanton",
    name: "Stanton",
    description: "The primary high-tech corporate system controlled by major mega-corps. Extremely safe with secure shipping lanes and moderate corporate refinery taxes.",
    riskFactor: 1.0,
  },
  {
    id: "pyro",
    name: "Pyro (Alpha 4.0)",
    description: "An outlaw solar system lacking law enforcement. High solar activity and extreme security risks, but stations offer spectacular yield bonuses for high-grade ores.",
    riskFactor: 1.5,
  },
  {
    id: "magnus",
    name: "Magnus",
    description: "A decaying former ship-manufacturing hub now experiencing a massive revival. Offering cheap corporate industrial rates and good heavy-metal yields.",
    riskFactor: 1.1,
  }
];

export const REFINERY_STATIONS: StationData[] = [
  // STANTON SYSTEM
  {
    id: "arc_l1",
    systemId: "stanton",
    name: "ARC-L1 Wide Forest",
    fullName: "ARC-L1 Wide Forest Station",
    locationDetails: "ArcCorp Lagrange Point 1",
    costModifier: 1.0,
    speedModifier: 1.0,
    materialModifiers: {
      quantainium: { yieldBonus: 0.04 },
      gold: { yieldBonus: 0.06 },
      copper: { yieldBonus: 0.10 },
      corundum: { yieldBonus: 0.12 },
      beryl: { yieldBonus: 0.10 },
      laranite: { yieldBonus: 0.05 },
      agricium: { yieldBonus: -0.03 },
      bexalite: { yieldBonus: -0.04 }
    }
  },
  {
    id: "cru_l1",
    systemId: "stanton",
    name: "CRU-L1 Ambitious Glimmer",
    fullName: "CRU-L1 Ambitious Glimmer Station",
    locationDetails: "Crusader Lagrange Point 1",
    costModifier: 0.95,
    speedModifier: 1.05,
    materialModifiers: {
      bexalite: { yieldBonus: 0.05 },
      hephaestite: { yieldBonus: 0.05 },
      gold: { yieldBonus: 0.03 },
      copper: { yieldBonus: 0.04 },
      titanium: { yieldBonus: 0.07 },
      quantainium: { yieldBonus: -0.03 },
      taranite: { yieldBonus: -0.03 }
    }
  },
  {
    id: "hur_l1",
    systemId: "stanton",
    name: "HUR-L1 Green Meadow",
    fullName: "HUR-L1 Green Meadow Station",
    locationDetails: "Hurston Lagrange Point 1",
    costModifier: 1.05,
    speedModifier: 0.95,
    materialModifiers: {
      agricium: { yieldBonus: 0.10 },
      gold: { yieldBonus: 0.05 },
      copper: { yieldBonus: 0.50 }, // Legendary Copper bonus
      corundum: { yieldBonus: 0.05 },
      beryl: { yieldBonus: 0.05 },
      bexalite: { yieldBonus: -0.05 },
      laranite: { yieldBonus: -0.02 }
    }
  },
  {
    id: "mic_l1",
    systemId: "stanton",
    name: "MIC-L1 Shallow Frontier",
    fullName: "MIC-L1 Shallow Frontier Station",
    locationDetails: "microTech Lagrange Point 1",
    costModifier: 1.0,
    speedModifier: 1.0,
    materialModifiers: {
      bexalite: { yieldBonus: 0.07 },
      taranite: { yieldBonus: 0.06 },
      gold: { yieldBonus: 0.04 },
      copper: { yieldBonus: 0.04 },
      titanium: { yieldBonus: 0.05 },
      agricium: { yieldBonus: -0.05 },
      laranite: { yieldBonus: -0.03 }
    }
  },
  {
    id: "hur_l2",
    systemId: "stanton",
    name: "HUR-L2 Faithful Dream",
    fullName: "HUR-L2 Faithful Dream Station",
    locationDetails: "Hurston Lagrange Point 2",
    costModifier: 0.9,
    speedModifier: 1.1,
    materialModifiers: {
      agricium: { yieldBonus: 0.05 },
      gold: { yieldBonus: 0.04 },
      titanium: { yieldBonus: 0.05 },
      beryl: { yieldBonus: 0.08 },
      quantainium: { yieldBonus: -0.05 }
    }
  },

  // PYRO SYSTEM (Lawless system)
  {
    id: "pyro_patchwork",
    systemId: "pyro",
    name: "Patchwork Station",
    fullName: "Patchwork Gas Station (Pyro IV)",
    locationDetails: "Pyro IV Lagrange Point Asteroid Belts",
    costModifier: 1.35, // High protection tax
    speedModifier: 0.75, // Pirates move fast
    materialModifiers: {
      taranite: { yieldBonus: 0.15 }, // High danger high yield
      bexalite: { yieldBonus: 0.12 },
      hephaestite: { yieldBonus: 0.10 },
      copper: { yieldBonus: 0.15 },
      agricium: { yieldBonus: -0.10 },
      gold: { yieldBonus: -0.05 }
    }
  },
  {
    id: "pyro_bloom",
    systemId: "pyro",
    name: "Bloom Station",
    fullName: "Bloom Megastructure (Pyro III)",
    locationDetails: "Pyro III High Orbit Hub",
    costModifier: 1.25,
    speedModifier: 0.85,
    materialModifiers: {
      quantainium: { yieldBonus: 0.14 }, // Massive Quantainium refinery hot zone!
      laranite: { yieldBonus: 0.10 },
      beryl: { yieldBonus: 0.18 },
      gold: { yieldBonus: 0.08 },
      titanium: { yieldBonus: -0.09 }
    }
  },
  {
    id: "pyro_dharma",
    systemId: "pyro",
    name: "Dharma Hub",
    fullName: "Dharma Free-Port Station",
    locationDetails: "Pyro II Orbital Cluster",
    costModifier: 1.1,
    speedModifier: 1.15,
    materialModifiers: {
      gold: { yieldBonus: 0.15 },
      agricium: { yieldBonus: 0.12 },
      corundum: { yieldBonus: 0.25 },
      laranite: { yieldBonus: -0.08 },
      bexalite: { yieldBonus: -0.08 }
    }
  },

  // MAGNUS SYSTEM
  {
    id: "magnus_gateway",
    systemId: "magnus",
    name: "Magnus Gateway Refinery",
    fullName: "Magnus Gateway Station & Logistics Hub",
    locationDetails: "Magnus Orbit Station",
    costModifier: 0.85, // Cheap institutional processing
    speedModifier: 0.9, // Fast automated conveyor systems
    materialModifiers: {
      titanium: { yieldBonus: 0.12 },
      copper: { yieldBonus: 0.18 },
      hephaestite: { yieldBonus: 0.10 },
      gold: { yieldBonus: 0.05 },
      quantainium: { yieldBonus: -0.06 }
    }
  },
  {
    id: "magnus_deep",
    systemId: "magnus",
    name: "Odin-Magnus Belt Hub",
    fullName: "Odin V Lagrange 2 Asteroid Depot",
    locationDetails: "Deep Space Sector Asteroids",
    costModifier: 1.15,
    speedModifier: 1.2,
    materialModifiers: {
      bexalite: { yieldBonus: 0.10 },
      quantainium: { yieldBonus: 0.07 },
      laranite: { yieldBonus: 0.08 },
      corundum: { yieldBonus: 0.15 },
      beryl: { yieldBonus: -0.08 }
    }
  }
];

export function getStationBonus(stationId: string | undefined, materialId: string): number {
  if (!stationId) return 0;
  const stat = REFINERY_STATIONS.find(s => s.id === stationId);
  if (!stat) return 0;
  return stat.materialModifiers[materialId]?.yieldBonus || 0;
}
