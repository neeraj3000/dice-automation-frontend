# Dice Automation Frontend

React 19 + TypeScript + Vite web interface for Dice Job Application Automation MVP.

Features a modern Material UI (MUI) dashboard with dark mode styling, candidate resume management, intelligent JD matching, search profile creation, review queue, and interactive application controls.

---

## Tech Stack
- **Framework**: React 19, TypeScript, Vite
- **UI Library**: Material UI (MUI) v6, Emotion, Lucide Icons
- **HTTP Client**: Axios
- **Routing**: React Router DOM v7

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Configuration
Copy .env.example to .env (defaults to backend running on http://localhost:8000):
`ash
cp .env.example .env
`

### 3. Installation & Run
`ash
# Install dependencies
npm install

# Start development server
npm run dev
`

App will run at: http://localhost:5173

---

## Available Scripts
- 
pm run dev - Start development server with HMR
- 
pm run build - TypeScript validation (	sc -b) and Vite production bundle build
- 
pm run preview - Preview production build locally
- 
pm run lint - Oxlint linter check
