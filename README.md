# Star Citizen Mining & Payout Manager 🚀💎

An intuitive logistics ledger and simulator for Star Citizen mining operations. Calibrate lasers, search up-to-date ore values, track crew expenses, and calculate exact cooperative payouts with mo.TRADER instructions.

## ✨ Features
- **Dynamic Laser Calibration**: Simulate and calibrate laser power for various ore deposits.
- **Up-to-Date Ore Values**: Quickly search and reference current ore market values.
- **Logistics Ledger**: Track crew expenses, consumables, fuel, and refine costs.
- **Cooperative Payout Splitter**: Automatically calculate exact splits for your crew and generate copy-pasteable custom `mo.TRADER` trading instructions.
- **Responsive Interface**: Optimised for use on a tablet, secondary monitor, or mobile device while flying.

---

## 🛠️ Get Started Locally

Follow these steps to run the application on your computer:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
Extract the downloaded ZIP file and open your terminal / command prompt in that directory:

```bash
# Install dependencies
npm install
```

### 3. Running in Development
Start the local Vite development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Production Build
To build the app for production, compile the static files into the `dist/` folder:

```bash
npm run build
```

---

## 🌐 Deploy to GitHub Pages

This project is configured for automated deployment to GitHub Pages via the `gh-pages` package.

### Configuration
Ensure your `vite.config.ts` has the correct `base` path alignment matching your repository name:
```typescript
base: '/star-citizen-mining-manager/',
```

### Deploying
Simply execute:
```bash
npm run deploy
```
This will automatically build your app and publish the compiled files directly to the `gh-pages` branch.
