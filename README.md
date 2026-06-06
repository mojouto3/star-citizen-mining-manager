# 🚀💎 Star Citizen Mining & Payout Manager (Aetheros Ledger)

An elegant, real-time cooperative logistics ledger, tuning simulator, and profit-distribution engine designed for Star Citizen mining orgs and industrial squads. Easily calibrate laser setups, find current Stanton commodity values, log refinery schedules, and automatically settle crew dividends using in-game terminal transfer instructions.

---

## 📖 Players & Operatives Manual

If you are a fleet captain, coordinator, or pilot, use this guide to successfully run and distribute cooperative profits from multi-crew mining expeditions.

### 👥 1. Core Fleet Roles Explained
- **Coordinator & Scout**: Operates agile scanner ships (e.g., Anvil C8X Pisces or RSI Mantis), finding high-purity asteroid/planetary cluster locations (Quantainium, Bexalite, etc.) and registering logs.
- **Laser Operator (Miner)**: Dispatches heavy mining ships (e.g., MISC Prospector or ARGO MOLE) with advanced laser configurations to safely fracture highly unstable rocks.
- **Raw Hauler**: Swaps empty saddlebags for packed containers on-site, ferrying material quickly to keep miners operational in deep space.
- **Refine Hauler & TDD Seller**: Receives the raw cargo bags, starts specialized refinery processes at station terminals, tracks yields, loads transport freighters (e.g., Crusader C2/M2 Hercules), and sells them at Trade & Development Division (TDD) markets.

---

### ⚙️ 2. Step-by-Step Mission Workflow

#### 🛰️ Step 1: Enlist Your Crew
- Navigate to the **Co-op Mission Log Management** section.
- Click **Enlist New Crew Member** to add player handle nicknames.
- Assign their active **Role**, **Active Vessel**, and **Vessel Status** (e.g., Scouting, Mining, Hauling, standby).
- *Tip*: If you just want to see how the system handles active mathematics, click **Load Logistics Scenario** or **Load Demo Crew** to populate a scenario!

#### 💎 Step 2: Log Field Operations (Optional)
- **Scanned Clusters**: Log detected rocks with their location (e.g., `Lyria - Sector 9`) and composition percentages (`Quantainium 45%`) to allocate miners to coordinates.
- **Saddlebag Swaps**: Record container exchanges in real-time between your active miners and bulk haulers (`StarMinerX -> Cargo_Maximus`).

#### 📦 Step 3: Record Extracted Runs
- Once a cargo run is completed or delivered, go to **Record Extracted Cargo Run**.
- Enter the **Commodity Material** (e.g., Quantainium), **SCU Volume** (e.g., 32 SCU), and **Processing Path** (refined or unrefined).
- If refining, choose your **Refinery Station** (e.g., ARC-L1 Wide Forest) and **Refining Method** (e.g., Cormack, Dinyx, etc.).
- Enable **Auto-log processing fee inside mission expenses** so the ledger automatically tracks out-of-pocket tax costs.
- Click **Record Cargo & Deploy Routing** to lock the load into your cooperative manifest.

#### 💸 Step 4: Add Operational Expenditures & Surcharges
- Log any fuel refills, laser head rentals, or custom refinery processing fees under **Operational Expenditures**.
- Note the nickname of the pilot who paid for it.
- **The Ledger Math Rule**: The system automatically reimburses these out-of-pocket costs to that specific pilot *before* calculating dividends. No one loses their hard-earned money over shared logistics!

#### ⚖️ Step 5: Choose Your Split Strategy
- **Equal Split**: Distribute the remaining net profit pot equally to all active crew members.
- **By Role %**: Distribute profits using adjustable weights mapped to critical operational roles (e.g. Miner gets 40%, Scout gets 20%).
- **Custom Shares**: Direct adjustable proportional splits per pilot for fine-tuned organization shares.

#### 💬 Step 6: Execute Payments in Star Citizen
- Once everyone's dividends are calculated, scroll to the **`mo.TRADER` Transfer Commands** section at the bottom.
- Select specific command lines (e.g., `/transfer Commandant_ST 210254`) and click **Copy**.
- Open your chat console inside Star Citizen (`ENTER`) and paste (`CTRL+V`) to instantly send the exact currency amounts to your crew mates without hassle or rounding mistakes!

---

## 🛠️ Developer Local Onboarding

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your computer.

### 2. Installation
Extract the package files, open your terminal / command prompt in the directory of the project, and run:
```bash
# Install required npm packages
npm install
```

### 3. Running in Development Mode
Start the high-speed Vite development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Build & Production Compilation
To compile static files into the web production `dist/` bundle:
```bash
npm run build
```

---

## 🌐 Deployed Sandbox
This application is designed to be easily deployed to GitHub Pages and contains pre-configured workspace paths:
- Deploy command: `npm run deploy`
- Custom configuration target: `/star-citizen-mining-manager/` (Vite base pointer).
