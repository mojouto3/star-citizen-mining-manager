/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MiningMaterial, MiningShip, LaserHead, MiningModule, MiningGadget } from "../types";

export const MINING_MATERIALS: MiningMaterial[] = [
  {
    id: "quantainium",
    name: "Quantainium",
    baseValueRaw: 12000,
    baseValueRefined: 25600,
    instability: "Very High",
    resistance: "Very High",
    locations: ["Aaron Halo", "Lyria (ArcCorp)", "Belt Asteroids", "Daymar (Stanton 2a)"],
    description: "Extremely unstable and radioactive ore. Triggers a volatile countdown timer once extracted. Highest overall value in the system.",
    tier: "Tier 1",
    weight: 9.5
  },
  {
    id: "bexalite",
    name: "Bexalite",
    baseValueRaw: 4200,
    baseValueRefined: 9200,
    instability: "High",
    resistance: "High",
    locations: ["Cellin (Crusader)", "Aberdeen (Hurston)", "Daymar", "Aaron Halo"],
    description: "Highly valuable, crystalline structural material containing precious mineral compound fibers. Moderate difficulty to crack.",
    tier: "Tier 1",
    weight: 7.0
  },
  {
    id: "taranite",
    name: "Taranite",
    baseValueRaw: 3805,
    baseValueRefined: 8250,
    instability: "High",
    resistance: "Medium",
    locations: ["Aberdeen (Hurston)", "Arial", "Yela (Crusader)", "Ita"],
    description: "Extremely dense alloy precursor. Often found deep in moon environments with high humidity or pressure.",
    tier: "Tier 1",
    weight: 6.8
  },
  {
    id: "gold",
    name: "Gold",
    baseValueRaw: 3100,
    baseValueRefined: 6800,
    instability: "Low",
    resistance: "Low",
    locations: ["Aberdeen", "Yela", "Cellin", "Daymar", "Aaron Halo"],
    description: "Precious structural and highly conductive metal. Very stable, making it excellent for reliable, safe mining runs.",
    tier: "Tier 1",
    weight: 6.0
  },
  {
    id: "agricium",
    name: "Agricium",
    baseValueRaw: 2750,
    baseValueRefined: 5850,
    instability: "Medium",
    resistance: "Medium",
    locations: ["Yela (Crusader)", "Arial (Hurston)", "Daymar", "Stanton Planets"],
    description: "An essential element for agricultural soil enhancers, terraforming projects, and high-purity industrial glass.",
    tier: "Tier 2",
    weight: 5.5
  },
  {
    id: "borase",
    name: "Borase",
    baseValueRaw: 1800,
    baseValueRefined: 3980,
    instability: "Medium",
    resistance: "Medium",
    locations: ["Cellin", "Daymar", "Yela", "Wala"],
    description: "Mainly processed into chemical solvents, rocket fuels, and boron-based crystal composite armor layers.",
    tier: "Tier 2",
    weight: 4.5
  },
  {
    id: "hephaestite",
    name: "Hephaestite",
    baseValueRaw: 1515,
    baseValueRefined: 3650,
    instability: "Medium",
    resistance: "High",
    locations: ["Arial", "Aberdeen", "Wala", "Ita"],
    description: "A core component of volcanic thermal shields and advanced heavy spaceship machinery armor plates.",
    tier: "Tier 2",
    weight: 4.8
  },
  {
    id: "laranite",
    name: "Laranite",
    baseValueRaw: 1450,
    baseValueRefined: 3120,
    instability: "Low",
    resistance: "Medium",
    locations: ["Wala (ArcCorp)", "Lyria", "Aberdeen", "Arial"],
    description: "Highly sought after for premium electronic substrates and space shuttle high-stress joints.",
    tier: "Tier 2",
    weight: 4.0
  },
  {
    id: "titanium",
    name: "Titanium",
    baseValueRaw: 480,
    baseValueRefined: 1050,
    instability: "Low",
    resistance: "Low",
    locations: ["All moons", "Planet Asteroid Rings", "Aaron Halo"],
    description: "Common sturdy structural metal used in spaceframes. High physical availability and fast extraction speeds.",
    tier: "Tier 3",
    weight: 2.2
  },
  {
    id: "copper",
    name: "Copper",
    baseValueRaw: 350,
    baseValueRefined: 820,
    instability: "None",
    resistance: "Low",
    locations: ["All moons", "Asteroids"],
    description: "Essential conductant for power wiring grids and electronic components. Extremely stable during fracturing.",
    tier: "Tier 3",
    weight: 1.8
  },
  {
    id: "beryl",
    name: "Beryl",
    baseValueRaw: 260,
    baseValueRefined: 590,
    instability: "Low",
    resistance: "Low",
    locations: ["Wala", "Lyria", "Daymar", "Cellin"],
    description: "Industrial grade gemstone crystal. Fairly common and very easy to crack using cheap beginner lasers.",
    tier: "Tier 3",
    weight: 1.5
  },
  {
    id: "corundum",
    name: "Corundum",
    baseValueRaw: 160,
    baseValueRefined: 380,
    instability: "None",
    resistance: "Medium",
    locations: ["All bodies"],
    description: "Hard abrasive silicate material used directly for grinding wheels or industrial armor polishing compounds.",
    tier: "Low-Tier",
    weight: 1.0
  }
];

export const MINING_SHIPS: MiningShip[] = [
  {
    id: "prospector",
    name: "MISC Prospector",
    scuCapacity: 32,
    crewMax: 1,
    laserSlots: 1,
    moduleSlotsPerLaser: 3,
    description: "The premier single-pilot mining ship. Portable saddle container bags allow dropping raw ore bags for hauling.",
    type: "ship"
  },
  {
    id: "mole",
    name: "ARGO MOLE",
    scuCapacity: 96,
    crewMax: 4,
    laserSlots: 3,
    moduleSlotsPerLaser: 3,
    description: "Multi-Operator Laser Extractor. Features 3 independent mining turrets for heavy crewed operations.",
    type: "ship"
  },
  {
    id: "arrastra",
    name: "RSI Arrastra",
    scuCapacity: 512,
    crewMax: 5,
    laserSlots: 3,
    moduleSlotsPerLaser: 3,
    description: "Heavy multi-crew mining and mobile refining cruiser. Equipped with three automated size 2 mining turrets and deep ore processing facilities.",
    type: "ship"
  },
  {
    id: "orion",
    name: "RSI Orion",
    scuCapacity: 16288,
    crewMax: 6,
    laserSlots: 4,
    moduleSlotsPerLaser: 4,
    description: "Industrial capital-scale strip miner. Outfitted with massive pulverizers, multi-beam mining matrices, and a high-yield integrated material refinery.",
    type: "ship"
  },
  {
    id: "roc",
    name: "Greycat ROC",
    scuCapacity: 0.8, // 80 units
    crewMax: 1,
    laserSlots: 1,
    moduleSlotsPerLaser: 0,
    description: "Ground mining vehicle designed for small raw gemstone extraction (Hadanite, Dolivine, Aphorite).",
    type: "ground"
  },
  {
    id: "roc_ds",
    name: "Greycat ROC-DS",
    scuCapacity: 3.5,
    crewMax: 2,
    laserSlots: 1,
    moduleSlotsPerLaser: 0,
    description: "Dual-Seat ground vehicle with expanded cargo and a dedicated manual mining arm operator seat.",
    type: "ground"
  },
  {
    id: "multitool",
    name: "Pyro RYT Multi-Tool",
    scuCapacity: 0.05,
    crewMax: 1,
    laserSlots: 1,
    moduleSlotsPerLaser: 0,
    description: "Handheld modular utility tool equipped with an OreBit mining attachment for extracting surface crystalline gemstone deposits.",
    type: "hand"
  }
];

export const LASER_HEADS: LaserHead[] = [
  {
    id: "lancet",
    name: "Lancet MH2 (Refinery Grade)",
    power: 1200,
    optimalWindow: 1.5,
    instabilityModifier: -0.45, // -45% instability
    resistanceModifier: -0.25, // -25% resistance
    moduleSlots: 3,
    description: "The meta choice for big rocks. Drastically reduces instability and resistance, but has low overall thermal power."
  },
  {
    id: "helix",
    name: "Helix II (Industrial)",
    power: 3200,
    optimalWindow: 0.8,
    instabilityModifier: 0.20, // +20% instability
    resistanceModifier: -0.10, // -10% resistance
    moduleSlots: 3,
    description: "Raw brute force laser. Shreds high mass rocks quickly but elevates risk of sudden volatile overcharges."
  },
  {
    id: "hofstede",
    name: "Hofstede II",
    power: 1800,
    optimalWindow: 1.15,
    instabilityModifier: -0.15,
    resistanceModifier: 0.05,
    moduleSlots: 3,
    description: "Balanced corporate head. Provides a decent optimal window boost with mild dampening of rock shifts."
  },
  {
    id: "arbor",
    name: "Arbor MH1 (Stock)",
    power: 1500,
    optimalWindow: 1.0,
    instabilityModifier: 0.0,
    resistanceModifier: 0.0,
    moduleSlots: 1,
    description: "Default manufacturer head fitted standard on Prospector and MOLE. Basic, reliable with one mod slot."
  }
];

export const MINING_MODULES: MiningModule[] = [
  {
    id: "torrent",
    name: "Torrent III (Passive)",
    type: "Passive",
    powerModifier: 0.15, // +15% power
    optimalWindowModifier: 0.05,
    instabilityModifier: 0.02,
    resistanceModifier: -0.05,
    description: "Passive power amplifier. Elevates mining heat generation continuously with minimal safety penalties."
  },
  {
    id: "optimum",
    name: "Optimum II (Passive)",
    type: "Passive",
    powerModifier: -0.05,
    optimalWindowModifier: 0.35, // +35% optimal window size
    instabilityModifier: -0.10,
    resistanceModifier: 0.0,
    description: "Widens the optimal extraction 'Green Zone' greatly. Crucial for volatile materials like Quantainium."
  },
  {
    id: "filter",
    name: "Filter-XL (Passive)",
    type: "Passive",
    powerModifier: -0.08,
    optimalWindowModifier: 0.0,
    instabilityModifier: 0.0,
    resistanceModifier: -0.15, // Reduces rock resistance
    description: "Assists laser penetration by filtering beam wavelength scatter against dense stone blocks."
  },
  {
    id: "surge",
    name: "Surge (Active Module)",
    type: "Active",
    powerModifier: 0.50, // Massive temporary power
    optimalWindowModifier: -0.10,
    instabilityModifier: 0.15,
    resistanceModifier: 0.0,
    description: "Injects an intense energy spike into the rock to pump energy levels up instantly. Cooldown applies."
  },
  {
    id: "brandt",
    name: "Brandt (Active Module)",
    type: "Active",
    powerModifier: -0.10,
    optimalWindowModifier: 0.20,
    instabilityModifier: -0.50, // Halves instability temporarily
    resistanceModifier: 0.0,
    description: "Unleashes an emergency coolant compound, dropping volatility and instability to safe margins."
  }
];

export const MINING_GADGETS: MiningGadget[] = [
  {
    id: "bohr",
    name: "Bohr Rock-Buster",
    instabilityModifier: -0.25,
    resistanceModifier: -0.15,
    optimalWindowModifier: 0.15,
    shatterDamageModifier: -0.30,
    description: "Attached directly to rocks to damp vibrations, making fracturing much safer and calmer."
  },
  {
    id: "optimus",
    name: "Optimus Prime-Clasps",
    instabilityModifier: -0.10,
    resistanceModifier: -0.30, // Lowers resistance by 30%
    optimalWindowModifier: 0.20,
    shatterDamageModifier: -0.10,
    description: "Heavy magnetic clamp focused on softening rock molecular bonds, dramatically dropping resistance."
  },
  {
    id: "waveshift",
    name: "Waveshift Frequency Stabilizer",
    instabilityModifier: -0.50, // Massive -50% instability
    resistanceModifier: 0.10,
    optimalWindowModifier: 0.30,
    shatterDamageModifier: -0.20,
    description: "Harmonizes ore frequency fluctuations. The ultimate gadget to stabilize high percentage Quantainium deposits."
  }
];

// Refinery Efficiency and Speed Multipliers
export const REFINERY_METHODS = [
  {
    id: "Cormack",
    name: "Cormack Method",
    yield: 0.98, // 98% material return
    costFactor: 1.0, // base cost
    timeFactor: 4.0, // very slow
    description: "High yield, slow processing time, standard cost."
  },
  {
    id: "Dinyan",
    name: "Dinyan Solvents",
    yield: 0.90, // 90% yield
    costFactor: 0.7, // cheaper
    timeFactor: 1.5, // fast
    description: "Medium high yield, low cost, relatively fast."
  },
  {
    id: "Ferron",
    name: "Ferron Exchange",
    yield: 0.95,
    costFactor: 1.5, // expensive
    timeFactor: 1.0, // very fast
    description: "High yield, extremely fast, high processing costs."
  },
  {
    id: "Gallow",
    name: "Gallow Process",
    yield: 0.85,
    costFactor: 0.5, // very cheap
    timeFactor: 3.0, // slow
    description: "Low yield, extremely economical option, slow speed."
  },
  {
    id: "Pyrometric",
    name: "Pyrometric Chromalizing",
    yield: 0.93,
    costFactor: 1.1,
    timeFactor: 2.0,
    description: "Balanced production standard. Good yield, average cost and time."
  },
  {
    id: "Unrefined",
    name: "Sell Unrefined / Raw",
    yield: 1.0,
    costFactor: 0.0,
    timeFactor: 0.0,
    description: "Immediate transfer. Sell raw ore with no refinery taxes but much lower price."
  }
];
