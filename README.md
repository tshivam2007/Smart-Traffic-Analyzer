<<<<<<< HEAD
<div align="center">

# 🚦 Smart Traffic Analyzer

### *Predict. Navigate. Arrive.*

**AI-powered traffic intelligence for smarter commutes**  
Real-time predictions · Alternate routes · Festival alerts · Voice assistant · Heatmaps

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-1100cc?style=for-the-badge)](https://smart-traffic-analyzer.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/Repository-181717?style=for-the-badge&logo=github)](https://github.com/tshivam2007/Smart-Traffic-Analyzer)
[![Made with Node.js](https://img.shields.io/badge/Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Leaflet Maps](https://img.shields.io/badge/Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Chart.js](https://img.shields.io/badge/Graphs-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://chartjs.org)
[![License: MIT](https://img.shields.io/badge/MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> 🏆 **Built for Hackathon 2026** — Hackathon Edition v2.4

</div>

---

## 📌 Table of Contents

- [🎯 About The Project](#-about-the-project)
- [✨ Features](#-features)
- [🖥️ Demo](#️-demo)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [📡 API Reference](#-api-reference)
- [🧠 Prediction Logic](#-prediction-logic)
- [🗺️ Map Features](#️-map-features)
- [🎙️ Voice Assistant](#️-voice-assistant)
- [🎉 Festival Intelligence](#-festival-intelligence)
- [📱 Responsive Design](#-responsive-design)
- [🔧 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 About The Project

**Smart Traffic Analyzer** is a full-stack web application that predicts future traffic conditions using a rule-based AI engine, provides real-time route visualization on an interactive map, and offers smart suggestions to help users avoid congestion.

Unlike simple traffic apps, Smart Traffic Analyzer combines:
- 🧠 **Contextual intelligence** — weekday/weekend patterns, festival calendar, area-type logic
- 🗺️ **Visual route planning** — draw routes, show alternate paths, overlay heatmaps
- 🎙️ **Hands-free UX** — Web Speech API reads results aloud
- 📊 **Data visualization** — 24-hour traffic intensity graph with Chart.js
- 🔔 **Proactive alerts** — Festival warnings, road-work notifications, traffic advisories

The project is designed to feel like a **real startup product** — with a cyberpunk dark UI, live animations, particle background, autocomplete location search, and a fully functional Node.js REST API backend.

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔮 **Smart Prediction** | Rule-based engine with 10+ traffic scenarios — festival, weekday peaks, area type |
| 2 | 🗺️ **Interactive Map** | Leaflet.js with Nominatim geocoding, route drawing and alternate routes |
| 3 | 🔍 **Location Autocomplete** | Google Maps-style live suggestions as you type — exact coordinates |
| 4 | 🔥 **Traffic Heatmap** | Toggle-able intensity overlay showing congestion zones on the map |
| 5 | 📊 **Traffic Graph** | 24-hour Chart.js visualization of traffic intensity by hour |
| 6 | 🎙️ **Voice Assistant** | Web Speech API reads your full traffic report aloud — hands-free |
| 7 | 🎉 **Festival Detection** | 10+ Indian festivals detected — Diwali, Holi, Eid, Navratri and more |
| 8 | 🔔 **Smart Alerts** | Notification panel with proactive traffic advisories and road-work updates |
| 9 | 🌙 **Dark Theme UI** | Cyberpunk command-center aesthetic with glassmorphism cards and animations |
| 10 | 📱 **Fully Responsive** | Mobile-first design — works on any screen size from 320px to 4K |
| 11 | ⚡ **Offline Capable** | Client-side prediction engine works even without the Node.js backend |
| 12 | 🚀 **REST API** | Full Node.js + Express backend with /predict, /festivals, /health endpoints |

---

## 🖥️ Demo

### 🌐 Live Site
👉 **[smart-traffic-analyzer.onrender.com](https://smart-traffic-analyzer.onrender.com)**

> ⚠️ First load may take ~30 seconds (free tier cold start). After that it's fast!

### 🎬 How To Use
1. Enter your **Origin** and **Destination** (autocomplete suggestions appear as you type)
2. Select **Date**, **Time Slot**, and **Area Type**
3. Click **"Predict Traffic"** and wait for the analysis
4. View your **Traffic Level**, **Peak Time**, **Delay Estimate** and **Smart Suggestion**
5. See the **route drawn on the map** with traffic color coding
6. Toggle **🔥 Heatmap** for congestion zone overlay
7. Click **🎙️ Voice Summary** to hear the report read aloud

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 + CSS3 | Structure and cyberpunk dark UI |
| Vanilla JavaScript ES2022 | All interactivity and logic |
| Leaflet.js v1.9 | Interactive map rendering |
| Leaflet Routing Machine | Route drawing between locations |
| Nominatim API | Free geocoding and location autocomplete |
| Chart.js v4 | 24-hour traffic intensity graph |
| Web Speech API | Voice assistant built into browsers |
| Google Fonts | Oxanium display + DM Sans body |
| Canvas API | Animated particle background |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| cors | Cross-origin requests |

### Deployment
| Service | Purpose |
|---------|---------|
| GitHub | Version control and source code |
| Render.com | Free hosting with auto-deploy |
| OpenStreetMap | Free map tiles, no API key needed |

> 💡 **Zero paid APIs** — The entire project runs on free, open-source services.

---

## 📁 Project Structure

```
Smart-Traffic-Analyzer/
│
├── 📄 index.html        ← Main UI — header, inputs, map, chart, heatmap, notifications
├── 🎨 style.css         ← Cyberpunk dark theme — glassmorphism, animations, gradients
├── ⚡ script.js         ← All frontend logic — map, chart, voice, autocomplete, prediction
├── 🖥️  server.js        ← Node.js + Express REST API with rule-based prediction engine
├── 📦 package.json      ← NPM dependencies and start scripts
└── 📖 README.md         ← This file
```

### Key Files Explained

**`index.html`** — Single-page application with:
- Sticky header with live clock, logo and notification bell
- 3-column responsive grid layout
- Input panel (origin, destination, date, time, area type)
- Result panel with traffic badge, stats tiles and suggestion box
- Leaflet map with heatmap and traffic toggle controls
- Chart.js traffic graph and simulated heatmap grid
- Live intelligence sidebar

**`style.css`** — 600+ lines of premium CSS with:
- CSS custom properties for full theming
- Glassmorphism card effects
- Keyframe animations (pulse, shimmer, ticker, bounce)
- Mobile-first responsive breakpoints at 600px, 900px, 1200px

**`script.js`** — 500+ lines of vanilla JS with:
- Nominatim autocomplete engine with debouncing
- Leaflet map initialization and marker management
- Leaflet Routing Machine for route drawing
- Chart.js 24-hour traffic visualization
- Web Speech API voice assistant
- Canvas particle network background animation
- Rule-based client-side prediction engine (offline fallback)

**`server.js`** — Node.js backend with:
- POST /predict — main prediction endpoint
- GET /festivals — festival calendar endpoint
- GET /health — health check endpoint
- Static file serving for frontend

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or higher
- npm v7 or higher
- Any modern browser (Chrome, Edge, Firefox, Safari)

## 📡 API Reference

Base URL Live: `https://smart-traffic-analyzer.onrender.com`

---

### POST /predict

Predicts traffic conditions for a given location, date, time and area type.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "location":  "Connaught Place, Delhi",
  "date":      "2025-10-22",
  "time":      "evening",
  "area_type": "market"
}
```

**Parameters:**

| Field | Type | Required | Valid Values |
|-------|------|----------|--------------|
| location | string | Yes | Any location name |
| date | string | Yes | YYYY-MM-DD format |
| time | string | Yes | morning, afternoon, evening, night |
| area_type | string | Yes | market, highway, residential, industrial, school |

**Success Response 200:**
```json
{
  "location":   "Connaught Place, Delhi",
  "level":      "very-high",
  "festival":   "Diwali",
  "peak":       "5 PM – 11 PM",
  "suggestion": "Extreme congestion due to festival. Use public transport.",
  "delay":      "+50 min",
  "confidence": 95,
  "meta": {
    "isWeekend":  false,
    "isPeakHour": true,
    "area_type":  "market",
    "analysedAt": "2025-10-22T17:30:00.000Z"
  }
}
```

**Error Response 400:**
```json
{
  "error": "Missing required fields: location, date, time, area_type"
}
```

**Traffic Level Colors:**

| Level | Color | Meaning |
|-------|-------|---------|
| low | 🟢 Green | Clear roads, smooth flow |
| medium | 🟡 Yellow | Moderate congestion |
| high | 🟠 Orange | Heavy traffic, expect delays |
| very-high | 🔴 Red | Severe congestion, avoid if possible |

---

### GET /festivals

Returns the full Indian festival calendar.

```json
{
  "10-20": "Diwali",
  "03-14": "Holi",
  "04-10": "Eid",
  "01-01": "New Year",
  "12-25": "Christmas",
  "08-15": "Independence Day"
}
```

---

### GET /health

Health check endpoint.

```json
{
  "status": "ok",
  "timestamp": "2025-10-22T17:30:00.000Z",
  "version": "2.4.0"
}
```

---

## 🧠 Prediction Logic

The engine uses a **priority-ordered rule table** with confidence scores:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PREDICTION RULE ENGINE                       │
├─────────────────────────────┬───────────────┬──────────────────┤
│ Condition                   │ Traffic Level │ Confidence       │
├─────────────────────────────┼───────────────┼──────────────────┤
│ Festival + Evening          │ Very High     │ 95%              │
│ Festival + Morning          │ High          │ 90%              │
│ Festival (other time)       │ Medium        │ 80%              │
│ Highway + Weekday Peak      │ Very High     │ 88%              │
│ Market + Weekday Peak       │ High          │ 85%              │
│ School Zone + Morning       │ High          │ 82%              │
│ Industrial + Morning        │ High          │ 80%              │
│ Weekday Peak Hour           │ Medium        │ 78%              │
│ Market on Weekday           │ Medium        │ 72%              │
│ Highway on Weekend          │ Medium        │ 70%              │
│ Weekend Afternoon           │ Medium        │ 68%              │
│ Residential or Night        │ Low           │ 90%              │
│ Default                     │ Low           │ 65%              │
└─────────────────────────────┴───────────────┴──────────────────┘
```

**Peak Times by Time Slot:**

| Time Slot | Normal Peak | Festival Override |
|-----------|-------------|------------------|
| Morning | 7 AM – 10 AM | 5 PM – 11 PM |
| Afternoon | 12 PM – 2 PM | 5 PM – 11 PM |
| Evening | 5 PM – 9 PM | 5 PM – 11 PM |
| Night | 10 PM – 12 AM | 5 PM – 11 PM |

---

## 🗺️ Map Features

- **Origin Marker** — Cyan glowing pin at starting location
- **Destination Marker** — Orange-red glowing pin at destination
- **Route Drawing** — Actual road route drawn using Leaflet Routing Machine
- **Color-coded Routes** — Route color changes based on traffic level
- **Heatmap Toggle** — Simulated congestion circles overlay
- **Autocomplete Search** — Nominatim API provides live location suggestions
- **Dark Map Theme** — CSS filter for cyberpunk aesthetic
- **Auto-fit Zoom** — Map automatically zooms to fit the drawn route

---

## 🎙️ Voice Assistant

Uses the **Web Speech API** — no API key needed, built into all modern browsers.

**Example output:**
> "Traffic report for Connaught Place to Cyber City. Current traffic level is Very High. Peak congestion is expected from 5 PM to 11 PM. Tip: Extreme congestion due to Diwali. Use public transport."

Works in Chrome, Edge, Safari and Firefox.

---

## 🎉 Festival Intelligence

| Festival | Dates | Traffic Impact |
|----------|-------|----------------|
| Diwali | Oct 20-23, Nov 1-3 | Very High evening |
| Holi | Mar 14-16 | High |
| Eid | Apr 10-11, Jun 17-18 | High |
| New Year | Dec 31, Jan 1 | Very High night |
| Navratri | Oct 3-12 | High evening |
| Durga Puja | Oct 9-13 | High |
| Christmas | Dec 24-25 | Medium |
| Independence Day | Aug 15 | Medium |
| Republic Day | Jan 26 | High |

---

## 📱 Responsive Design

| Screen Size | Layout |
|-------------|--------|
| Mobile under 600px | Single column, stacked sections |
| Tablet 600 to 900px | 2-column grid |
| Laptop 900 to 1200px | 2-column + bottom row |
| Desktop over 1200px | Full 3-column command center |

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo, then:
git checkout -b feature/YourFeature
git commit -m "Add YourFeature"
git push origin feature/YourFeature
# Open a Pull Request
```

**Ideas for future features:**
- Real traffic data API integration (TomTom / HERE Maps)
- Trip history saved in localStorage
- PWA support for offline app
- More Indian cities in coordinate dictionary
- Dark / Light theme toggle

---

## 📄 License

Distributed under the MIT License.

---

<div align="center">

**Built with ❤️ 2026**

*If this project helped you, please give it a ⭐ star on GitHub!*

[![GitHub stars](https://img.shields.io/github/stars/tshivam2007/Smart-Traffic-Analyzer?style=social)](https://github.com/tshivam2007/Smart-Traffic-Analyzer)

</div>
=======
# Smart Traffic Analyzer
This site is work to predict taffics conditions on the specific dates and areas by analysing the different-different rules that we implemented in the site.
https://smart-traffic-analyzer.onrender.com/
>>>>>>> 4d3f5c83da0f2ec6ffca2b03ddaa01bd4106bb5f
