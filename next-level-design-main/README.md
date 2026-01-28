# 🌍 Spatio-Temporal Analytics Dashboard (React + Vite)

A premium, high-performance visualization interface for the Spatio-Temporal Event Analytics Engine. Built with **React 18**, **TypeScript**, and **Tailwind CSS**, this dashboard provides an immersive experience for analyzing spatial and temporal data.

---

## ✨ Key Features

This frontend represents a significant upgrade over the legacy HTML interface, featuring:

### 🎨 Visual Excellence
- **Glassmorphism Design**: Frosted glass panels, backdrop blurs, and depth effects.
- **Animated Backgrounds**: Mesh gradients and floating particles for a dynamic feel.
- **Premium Interactions**: 3D lift effects, glow animations, and magnetic hover states.
- **Data Visualization**: Interactive canvas-based map with pulsating hotspots and temporal heatmaps.

### 🛠️ Advanced Controls
- **Spatial Queries**: Draggable map regions or precise coordinate inputs.
- **Temporal Filtering**: Dual-range sliders for time-of-day filtering.
- **Quick Presets**: One-click filters for "Morning Rush", "Night Shift", etc.
- **Hotspot Detection**: Automatic visualization of high-density event clusters.

### ⚡ Performance
- **Vite-Powered**: Instant HMR and lightning-fast builds.
- **Optimized Rendering**: efficiently handles thousands of data points on the canvas.
- **Responsive Layout**: Seamlessly adapts to desktop, tablet, and mobile screens.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: CSS Transitions + Framer Motion concepts

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd next-level-design-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal) to view the dashboard.

---

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components (Buttons, Cards, Inputs)
│   ├── ui/             # Shadcn primitive components
│   └── ...
├── pages/             # Main application pages
│   └── Index.tsx      # Dashboard layout
├── hooks/             # Custom React hooks (use-toast, etc.)
├── lib/               # Utility functions
└── index.css          # Global styles and Tailwind directives
```

---

## 🔌 Integration with Backend

This frontend is designed to visualize data processed by the C++ Spatio-Temporal Engine. 
- Currently, it utilizes **sample data generation** for demonstration purposes.
- To connect with the real C++ backend, it expects standard JSON/CSV data formats (integration details in `docs/integation_guide.md`).

---

## 🎨 Customization

You can customize the theme in `tailwind.config.ts`.
- **Primary Color**: Indigo (`#6366f1`)
- **Accent Color**: Pink (`#ec4899`)
- **Background**: Dark theme defaults

---

*Built for the Semester 3 DSA Project - Advanced Agentic Coding*
