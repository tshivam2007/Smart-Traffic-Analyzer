/* ═══════════════════════════════════════════════════════════════════════════
   Smart Traffic Analyzer — script.js
   Frontend Logic: Prediction Engine · Leaflet Map · Chart.js · Voice API
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

/* ────────────────────────────────────────────────────────────────────────────
   1.  DATA: FESTIVALS, CITY COORDS, SUGGESTIONS
   ──────────────────────────────────────────────────────────────────────────── */

/** Known Indian festivals with approximate month-day ranges (MM-DD) */
const FESTIVALS = [
  { name: "Diwali",   dates: ["10-20","10-21","10-22","10-23","11-01","11-02","11-03"] },
  { name: "Holi",     dates: ["03-14","03-15","03-16"] },
  { name: "Eid",      dates: ["04-10","04-11","06-17","06-18","03-30","03-31"] },
  { name: "New Year", dates: ["01-01","12-31"] },
  { name: "Navratri", dates: ["10-03","10-04","10-05","10-06","10-07","10-08","10-09","10-10","10-11","10-12"] },
  { name: "Durga Puja", dates: ["10-09","10-10","10-11","10-12","10-13"] },
  { name: "Christmas", dates: ["12-24","12-25","12-26"] },
  { name: "Independence Day", dates: ["08-15"] },
  { name: "Republic Day",     dates: ["01-26"] },
];

/** Rough geocoordinates for popular Indian cities (used if geocoder fails) */
const CITY_COORDS = {
  "delhi":    [28.6139, 77.2090],
  "mumbai":   [19.0760, 72.8777],
  "bangalore":[12.9716, 77.5946],
  "bengaluru":[12.9716, 77.5946],
  "hyderabad":[17.3850, 78.4867],
  "pune":     [18.5204, 73.8567],
  "chennai":  [13.0827, 80.2707],
  "kolkata":  [22.5726, 88.3639],
  "gurugram": [28.4595, 77.0266],
  "noida":    [28.5355, 77.3910],
  "jaipur":   [26.9124, 75.7873],
  "ahmedabad":[23.0225, 72.5714],
};

/** Traffic-level config: colors, delay estimates, route counts */
const TRAFFIC_CONFIG = {
  low:       { label:"Low",       cls:"low",       color:"#22c55e", delay:"+5 min",  routes:1, speed:42 },
  medium:    { label:"Medium",    cls:"medium",     color:"#eab308", delay:"+15 min", routes:2, speed:30 },
  high:      { label:"High",      cls:"high",       color:"#f97316", delay:"+30 min", routes:2, speed:18 },
  "very-high":{ label:"Very High", cls:"very-high",  color:"#ef4444", delay:"+50 min", routes:3, speed:10 },
};

/** Suggestions based on traffic level and area type */
const SUGGESTIONS = {
  low:        ["All clear — enjoy the ride! 🚗", "No significant delays expected.", "Perfect time to travel. Green lights ahead!"],
  medium:     ["Consider leaving 15 min earlier.", "Minor congestion ahead — stay patient.", "Check real-time updates before departing."],
  high:       ["Use alternate route via Ring Road.", "Take Metro for faster commute.", "Avoid this zone between 5–9 PM if possible."],
  "very-high":["⚠️ Take Metro / public transport.", "Festival traffic — avoid driving. Use Ola/Uber.", "Extreme congestion — postpone trip if possible."],
};

/* ────────────────────────────────────────────────────────────────────────────
   2.  DOM REFERENCES
   ──────────────────────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const predictBtn     = $("predictBtn");
const voiceBtn       = $("voiceBtn");
const originInput    = $("originInput");
const destInput      = $("destInput");
const dateInput      = $("dateInput");
const timeSelect     = $("timeSelect");
const areaSelect     = $("areaSelect");
const resultEmpty    = $("resultEmpty");
const resultData     = $("resultData");
const trafficBadge   = $("trafficBadge");
const badgeDot       = $("badgeDot");
const trafficLevelEl = $("trafficLevel");
const resultLocation = $("resultLocation");
const resultDatetime = $("resultDatetime");
const peakTimeEl     = $("peakTime");
const estDelayEl     = $("estDelay");
const altCountEl     = $("altCount");
const suggestionText = $("suggestionText");
const festivalRibbon = $("festivalRibbon");
const festivalName   = $("festivalName");
const notifBtn       = $("notifBtn");
const notifPanel     = $("notifPanel");
const closeNotif     = $("closeNotif");
const notifOverlay   = $("notifOverlay");
const notifList      = $("notifList");
const chartLabel     = $("chartLabel");
const toastStack     = $("toastStack");
const heatmapGrid    = $("heatmapGrid");
const toggleHeatmap  = $("toggleHeatmap");
const toggleTrafficLayer = $("toggleTrafficLayer");

// Live info panel
const infoRoutesEl   = $("infoRoutes");
const infoDayEl      = $("infoDay");
const infoFestivalEl = $("infoFestival");
const infoSpeedEl    = $("infoSpeed");
const infoLastPredEl = $("infoLastPred");

/* ────────────────────────────────────────────────────────────────────────────
   3.  LIVE CLOCK
   ──────────────────────────────────────────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");
  $("liveClock").textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ────────────────────────────────────────────────────────────────────────────
   4.  DATE INITIALISATION
   ──────────────────────────────────────────────────────────────────────────── */
(function initDate() {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2,"0");
  const dd    = String(today.getDate()).padStart(2,"0");
  dateInput.value = `${yyyy}-${mm}-${dd}`;

  // Weekday label
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  infoDayEl.textContent = days[today.getDay()] + " (Today)";

  // Next festival
  const nextFest = getNextFestival();
  infoFestivalEl.textContent = nextFest ? nextFest : "None soon";
})();

/* ────────────────────────────────────────────────────────────────────────────
   5.  FESTIVAL DETECTION
   ──────────────────────────────────────────────────────────────────────────── */

/** Returns festival name if the given date string (YYYY-MM-DD) is a festival */
function detectFestival(dateStr) {
  const mmdd = dateStr.slice(5); // "MM-DD"
  for (const f of FESTIVALS) {
    if (f.dates.includes(mmdd)) return f.name;
  }
  return null;
}

/** Find the next upcoming festival from today */
function getNextFestival() {
  const today  = new Date();
  const year   = today.getFullYear();
  let   nearest = null;
  let   nearestDiff = Infinity;

  for (const f of FESTIVALS) {
    for (const mmdd of f.dates) {
      const [mo, da] = mmdd.split("-").map(Number);
      let festDate = new Date(year, mo - 1, da);
      if (festDate < today) festDate = new Date(year + 1, mo - 1, da);
      const diff = festDate - today;
      if (diff < nearestDiff) { nearestDiff = diff; nearest = f.name; }
    }
  }
  return nearest;
}

/* ────────────────────────────────────────────────────────────────────────────
   6.  RULE-BASED TRAFFIC PREDICTION ENGINE
   This mirrors the Node.js backend logic so the UI can work offline too.
   ──────────────────────────────────────────────────────────────────────────── */
function predictTraffic({ date, time, areaType }) {
  const festival   = detectFestival(date);
  const dayOfWeek  = new Date(date).getDay();       // 0=Sun, 6=Sat
  const isWeekend  = (dayOfWeek === 0 || dayOfWeek === 6);
  const isOfficePeak = (time === "morning" || time === "evening");
  const isWeekdayPeak = !isWeekend && isOfficePeak;

  let level;

  // Priority order: festival > area-specific > weekday patterns > default
  if (festival && time === "evening") {
    level = "very-high";
  } else if (festival && time === "morning") {
    level = "high";
  } else if (festival) {
    level = "medium";
  } else if (areaType === "market" && isOfficePeak) {
    level = "high";
  } else if (areaType === "market" && !isWeekend) {
    level = "medium";
  } else if (areaType === "school" && time === "morning") {
    level = "high";
  } else if (areaType === "highway" && isWeekdayPeak) {
    level = "very-high";
  } else if (areaType === "highway") {
    level = "medium";
  } else if (areaType === "industrial" && time === "morning") {
    level = "high";
  } else if (isWeekdayPeak) {
    level = "medium";
  } else if (isWeekend && time === "afternoon") {
    level = "medium";
  } else {
    level = "low";
  }

  // Peak times by area/time
  const peakMap = {
    morning:   "7 AM – 10 AM",
    afternoon: "12 PM – 2 PM",
    evening:   "5 PM – 9 PM",
    night:     "10 PM – 12 AM",
  };
  const peak = festival ? "5 PM – 11 PM" : peakMap[time];

  // Random suggestion from appropriate bucket
  const sugs = SUGGESTIONS[level];
  const sug  = sugs[Math.floor(Math.random() * sugs.length)];

  return { level, festival, peak, suggestion: sug };
}

/* ────────────────────────────────────────────────────────────────────────────
   7.  TRAFFIC CHART (Chart.js)
   ──────────────────────────────────────────────────────────────────────────── */
let trafficChart = null;

function buildChart(level) {
  const ctx = document.getElementById("trafficChart").getContext("2d");
  const cfg  = TRAFFIC_CONFIG[level];

  // Traffic intensity by hour (0-23), shaped by level
  const baseValues = {
    low:        [5,4,3,3,4,8,18,22,16,12,14,16,18,16,14,16,24,28,22,16,12,10,8,6],
    medium:     [6,5,4,4,5,12,35,45,30,22,28,32,38,36,28,32,50,58,44,30,22,16,12,8],
    high:       [8,6,5,5,7,18,52,68,45,35,42,50,58,55,45,52,75,85,65,45,35,25,18,12],
    "very-high":[10,8,7,6,9,25,70,88,62,48,60,72,80,75,62,72,95,100,88,60,45,32,24,16],
  };

  const hours  = Array.from({length:24}, (_,i) => `${i}:00`);
  const values = baseValues[level];

  // Destroy previous chart if any
  if (trafficChart) trafficChart.destroy();

  trafficChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: hours,
      datasets: [{
        label: "Traffic %",
        data:  values,
        fill:  true,
        tension: 0.42,
        borderColor:          cfg.color,
        backgroundColor:      hexToRgba(cfg.color, 0.18),
        pointBackgroundColor: cfg.color,
        pointRadius:          3,
        pointHoverRadius:     6,
        borderWidth:          2.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode:"index", intersect:false },
      plugins: {
        legend: { display:false },
        tooltip: {
          backgroundColor: "rgba(13,20,36,0.95)",
          borderColor: cfg.color,
          borderWidth: 1,
          titleColor: "#c8d8f0",
          bodyColor:  cfg.color,
          callbacks: { label: ctx => ` ${ctx.parsed.y}% load` }
        }
      },
      scales: {
        x: {
          ticks: { color:"#3a5a7a", font:{size:9}, maxRotation:0, maxTicksLimit:8 },
          grid:  { color:"rgba(0,210,255,0.05)" }
        },
        y: {
          min: 0, max: 105,
          ticks: { color:"#3a5a7a", font:{size:9}, callback: v => v+"%" },
          grid:  { color:"rgba(0,210,255,0.05)" }
        }
      }
    }
  });
}

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ────────────────────────────────────────────────────────────────────────────
   8.  HEATMAP GRID (simulated)
   ──────────────────────────────────────────────────────────────────────────── */
function buildHeatmap(level) {
  heatmapGrid.innerHTML = "";
  const intensityMap = { low:0.25, medium:0.5, high:0.75, "very-high":0.95 };
  const base = intensityMap[level];

  for (let i = 0; i < 64; i++) {
    const cell = document.createElement("div");
    cell.className = "heatmap-cell";
    // Random variance around the base intensity
    const v = Math.max(0, Math.min(1, base + (Math.random() - 0.5) * 0.45));
    cell.style.background = heatColor(v);
    cell.style.opacity    = 0.6 + v * 0.4;
    cell.title = `Zone ${i+1}: ${Math.round(v*100)}% load`;
    heatmapGrid.appendChild(cell);
  }
}

/** Returns a CSS color from green → red based on value 0-1 */
function heatColor(v) {
  const stops = [
    [0,    34,197,94],   // green
    [0.33, 234,179,8],   // yellow
    [0.66, 249,115,22],  // orange
    [1,    239,68,68],   // red
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0,r0,g0,b0] = stops[i];
    const [t1,r1,g1,b1] = stops[i+1];
    if (v <= t1) {
      const t = (v - t0) / (t1 - t0);
      return `rgb(${lerp(r0,r1,t)},${lerp(g0,g1,t)},${lerp(b0,b1,t)})`;
    }
  }
  return "rgb(239,68,68)";
}
const lerp = (a,b,t) => Math.round(a + (b-a)*t);

/* ────────────────────────────────────────────────────────────────────────────
   9.  LEAFLET MAP SETUP
   ──────────────────────────────────────────────────────────────────────────── */
let map, routeControl, originMarker, destMarker, heatmapLayer, trafficLayerGroup;
let heatmapVisible   = false;
let trafficLayerOn   = false;

// Store exact selected coordinates from autocomplete
let selectedOriginCoords = null;
let selectedDestCoords   = null;

(function initMap() {
  map = L.map("map", { zoomControl:true, attributionControl:false }).setView([28.6139, 77.2090], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
  L.control.attribution({ prefix: false }).addAttribution("© OpenStreetMap contributors").addTo(map);
})();

/* ────────────────────────────────────────────────────────────────────────────
   9a. AUTOCOMPLETE ENGINE (Nominatim)
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Search Nominatim for location suggestions.
 * Returns array of { display_name, short, region, lat, lon }
 */
async function searchNominatim(query) {
  if (query.length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&countrycodes=in`;
    const res  = await fetch(url, { headers: { "Accept-Language": "en-IN" } });
    const data = await res.json();
    return data.map(item => {
      const addr  = item.address || {};
      // Build a short primary label
      const short = addr.suburb || addr.neighbourhood || addr.city_district
                 || addr.town   || addr.village       || addr.city
                 || item.name   || item.display_name.split(",")[0];
      // Secondary label: city + state
      const region = [addr.city || addr.town || addr.county, addr.state]
                       .filter(Boolean).join(", ");
      return {
        display: item.display_name,
        short:   short.trim(),
        region:  region,
        lat:     parseFloat(item.lat),
        lon:     parseFloat(item.lon),
      };
    });
  } catch (_) { return []; }
}

/**
 * Attach autocomplete behaviour to an input.
 * @param {HTMLInputElement} input
 * @param {HTMLUListElement} listEl
 * @param {function} onSelect  - called with { short, display, lat, lon }
 */
function attachAutocomplete(input, listEl, onSelect) {
  let debounceTimer = null;
  let results       = [];
  let activeIdx     = -1;

  function openList(items) {
    results   = items;
    activeIdx = -1;
    listEl.innerHTML = "";

    if (items.length === 0) {
      listEl.innerHTML = `<li class="sug-empty">No results found</li>`;
    } else {
      items.forEach((item, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="sug-icon-pin">📍</span>
          <span>
            <span class="sug-main">${item.short}</span>
            <span class="sug-sub">${item.region || item.display}</span>
          </span>`;
        li.addEventListener("mousedown", e => {
          e.preventDefault(); // prevent input blur before click fires
          selectItem(item);
        });
        listEl.appendChild(li);
      });
    }
    listEl.classList.add("open");
  }

  function closeList() { listEl.classList.remove("open"); listEl.innerHTML = ""; activeIdx = -1; }

  function selectItem(item) {
    input.value = item.short + (item.region ? ", " + item.region : "");
    closeList();
    onSelect(item);
  }

  // Highlight keyboard navigation
  function highlight(idx) {
    const items = listEl.querySelectorAll("li:not(.sug-empty):not(.sug-loading)");
    items.forEach(el => el.classList.remove("active"));
    if (idx >= 0 && idx < items.length) { items[idx].classList.add("active"); activeIdx = idx; }
  }

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (!q) { closeList(); return; }
    // Show loading state
    listEl.innerHTML = `<li class="sug-loading">🔍 Searching…</li>`;
    listEl.classList.add("open");
    debounceTimer = setTimeout(async () => {
      const items = await searchNominatim(q);
      openList(items);
    }, 350);
  });

  input.addEventListener("keydown", e => {
    const items = listEl.querySelectorAll("li:not(.sug-empty):not(.sug-loading)");
    if (e.key === "ArrowDown")  { e.preventDefault(); highlight(Math.min(activeIdx + 1, items.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); highlight(Math.max(activeIdx - 1, 0)); }
    if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); selectItem(results[activeIdx]); }
    if (e.key === "Escape")     { closeList(); }
  });

  input.addEventListener("blur", () => setTimeout(closeList, 150));
}

// Wire up both inputs
attachAutocomplete(originInput, $("originSuggestions"), item => {
  selectedOriginCoords = [item.lat, item.lon];
});
attachAutocomplete(destInput, $("destSuggestions"), item => {
  selectedDestCoords = [item.lat, item.lon];
});

/* ────────────────────────────────────────────────────────────────────────────
   9b. MAP MARKERS & ROUTING
   ──────────────────────────────────────────────────────────────────────────── */

/** Create a glowing pin marker */
function placeMarker(latlng, color, glowColor, label) {
  const icon = L.divIcon({
    className: "",
    html: `<div style="
      width:18px; height:18px;
      background:${color};
      border:3px solid rgba(255,255,255,0.85);
      border-radius:50%;
      box-shadow:0 0 0 3px ${glowColor}, 0 0 16px ${glowColor};
    "></div>`,
    iconSize:   [18, 18],
    iconAnchor: [9, 9],
    popupAnchor:[0, -14],
  });
  return L.marker(latlng, { icon }).addTo(map).bindPopup(
    `<span style="font-family:Oxanium,sans-serif;color:#00d2ff">${label}</span>`
  );
}

/** Draw route between two coordinate pairs */
function drawRoute(from, to, level) {
  if (routeControl) { map.removeControl(routeControl); routeControl = null; }
  const colors = { low:"#22c55e", medium:"#eab308", high:"#f97316", "very-high":"#ef4444" };
  routeControl = L.Routing.control({
    waypoints: [L.latLng(from), L.latLng(to)],
    routeWhileDragging: false,
    addWaypoints: false,
    fitSelectedRoutes: true,
    show: false,
    lineOptions: { styles: [{ color: colors[level], weight: 5, opacity: 0.85 }] },
    createMarker: () => null,
  }).addTo(map);
}

/** Simulated heatmap circles around a center point */
function showHeatmapLayer(center, level) {
  if (heatmapLayer) { map.removeLayer(heatmapLayer); heatmapLayer = null; }
  const cfg   = TRAFFIC_CONFIG[level];
  const count = { low:6, medium:10, high:14, "very-high":20 }[level];
  const group = L.layerGroup();
  for (let i = 0; i < count; i++) {
    const lat = center[0] + (Math.random() - 0.5) * 0.12;
    const lng = center[1] + (Math.random() - 0.5) * 0.12;
    const v   = 0.3 + Math.random() * 0.7;
    L.circle([lat, lng], {
      radius: 300 + Math.random() * 600,
      color: cfg.color, fillColor: cfg.color,
      fillOpacity: v * 0.35, weight: 0,
    }).addTo(group);
  }
  heatmapLayer = group;
  if (heatmapVisible) heatmapLayer.addTo(map);
}

/* Toggle heatmap */
toggleHeatmap.addEventListener("click", () => {
  heatmapVisible = !heatmapVisible;
  toggleHeatmap.classList.toggle("active", heatmapVisible);
  if (heatmapLayer) heatmapVisible ? heatmapLayer.addTo(map) : map.removeLayer(heatmapLayer);
});

/* Toggle traffic layer */
toggleTrafficLayer.addEventListener("click", () => {
  trafficLayerOn = !trafficLayerOn;
  toggleTrafficLayer.classList.toggle("active", trafficLayerOn);
  showToast(trafficLayerOn ? "🚦 Traffic overlay enabled" : "🚦 Traffic overlay hidden", "info");
});

// Reset stored coords if user clears input manually
originInput.addEventListener("input", () => { if (!originInput.value.trim()) selectedOriginCoords = null; });
destInput.addEventListener("input",   () => { if (!destInput.value.trim())   selectedDestCoords   = null; });

/* ────────────────────────────────────────────────────────────────────────────
   10. MAIN PREDICT HANDLER
   ──────────────────────────────────────────────────────────────────────────── */
predictBtn.addEventListener("click", async () => {
  const origin   = originInput.value.trim();
  const dest     = destInput.value.trim();
  const date     = dateInput.value;
  const time     = timeSelect.value;
  const areaType = areaSelect.value;

  // Validation
  if (!origin) { showToast("⚠️ Please enter an origin location.", "warning"); return; }
  if (!dest)   { showToast("⚠️ Please enter a destination.", "warning"); return; }
  if (!date)   { showToast("⚠️ Please select a date.", "warning"); return; }

  // Loading state
  setLoading(true);

  try {
    // ── Try backend first, fall back to client-side prediction ──
    let result;
    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ location:origin, date, time, area_type:areaType }),
        signal: AbortSignal.timeout(3000),  // 3s timeout
      });
      if (res.ok) result = await res.json();
    } catch(_) {
      /* Backend not available — use client-side engine */
    }

    if (!result) {
      result = predictTraffic({ date, time, areaType });
    }

    // Allow the loading animation to breathe
    await sleep(900);

    // ── Use coords from autocomplete selection; fallback to text geocode ──
    let fromCoords = selectedOriginCoords;
    let toCoords   = selectedDestCoords;

    // Fallback: if user typed without selecting suggestion, try geocoding the text
    if (!fromCoords) {
      const r = await searchNominatim(origin);
      if (r.length) fromCoords = [r[0].lat, r[0].lon];
    }
    if (!toCoords) {
      const r = await searchNominatim(dest);
      if (r.length) toCoords = [r[0].lat, r[0].lon];
    }

    const center = fromCoords || [28.6139, 77.2090];

    // ── Update map markers (Origin = Cyan, Destination = Orange-Red) ──
    if (originMarker) map.removeLayer(originMarker);
    if (destMarker)   map.removeLayer(destMarker);

    if (fromCoords) {
      originMarker = placeMarker(fromCoords, "#00d2ff", "rgba(0,210,255,0.5)", `📍 ${origin}`);
      originMarker.openPopup();
    }
    if (toCoords) {
      destMarker = placeMarker(toCoords, "#ff4500", "rgba(255,69,0,0.5)", `🎯 ${dest}`);
    }

    if (fromCoords && toCoords) drawRoute(fromCoords, toCoords, result.level);
    else if (fromCoords) map.setView(fromCoords, 13);

    showHeatmapLayer(center, result.level);

    // ── Update UI ──
    renderResult(result, origin, dest, date, time);
    buildChart(result.level);
    buildHeatmap(result.level);
    updateInfoPanel(result.level);

    // Auto-show heatmap on Very High
    if (result.level === "very-high" && !heatmapVisible) {
      heatmapVisible = true;
      toggleHeatmap.classList.add("active");
      if (heatmapLayer) heatmapLayer.addTo(map);
    }

    // Festival notification
    if (result.festival) {
      showToast(`🎉 ${result.festival} detected! Expect heavy congestion.`, "warning");
    }

  } catch (err) {
    console.error("Prediction error:", err);
    showToast("❌ Something went wrong. Please try again.", "error");
  } finally {
    setLoading(false);
  }
});

/** Render the result panel */
function renderResult(result, origin, dest, date, time) {
  const cfg = TRAFFIC_CONFIG[result.level];

  // Show result section
  resultEmpty.style.display = "none";
  resultData.style.display  = "";
  // Force re-animation
  resultData.classList.remove("animated");
  void resultData.offsetWidth;

  // Badge
  trafficBadge.className = `traffic-badge ${cfg.cls}`;
  trafficLevelEl.textContent = cfg.label;

  // Meta
  resultLocation.textContent = `${origin} → ${dest}`;
  const timeLabels = { morning:"Morning", afternoon:"Afternoon", evening:"Evening", night:"Night" };
  resultDatetime.textContent  = `${timeLabels[time]} · ${date}${result.festival ? " · " + result.festival : ""}`;

  // Stats
  peakTimeEl.textContent = result.peak;
  estDelayEl.textContent = cfg.delay;
  altCountEl.textContent = cfg.routes + " Available";

  // Suggestion
  suggestionText.textContent = result.suggestion;

  // Festival ribbon
  if (result.festival) {
    festivalRibbon.style.display = "flex";
    festivalName.textContent     = result.festival;
  } else {
    festivalRibbon.style.display = "none";
  }

  // Update last prediction time
  infoLastPredEl.textContent = new Date().toLocaleTimeString();

  // Scroll to result on mobile
  if (window.innerWidth < 900) {
    document.querySelector(".result-card").scrollIntoView({ behavior:"smooth", block:"start" });
  }
}

/** Update live intelligence panel */
function updateInfoPanel(level) {
  const cfg = TRAFFIC_CONFIG[level];
  infoRoutesEl.textContent = Math.floor(Math.random() * 50) + 20;
  infoSpeedEl.textContent  = cfg.speed + " km/h";
}

/* ────────────────────────────────────────────────────────────────────────────
   11. LOADING STATE
   ──────────────────────────────────────────────────────────────────────────── */
function setLoading(on) {
  predictBtn.classList.toggle("loading", on);
  predictBtn.disabled = on;
}

/* ────────────────────────────────────────────────────────────────────────────
   12. VOICE ASSISTANT (Web Speech API)
   ──────────────────────────────────────────────────────────────────────────── */
voiceBtn.addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    showToast("❌ Your browser doesn't support voice synthesis.", "error");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const level = trafficLevelEl.textContent;
  const loc   = resultLocation.textContent;
  const peak  = peakTimeEl.textContent;
  const sug   = suggestionText.textContent;

  if (!level || level === "HIGH" && loc === "Market Area") {
    showToast("⚠️ Run a prediction first to get voice summary.", "warning");
    return;
  }

  const text = `Traffic report for ${loc}. Current traffic level is ${level}. Peak congestion is expected from ${peak}. Tip: ${sug}`;

  const utter  = new SpeechSynthesisUtterance(text);
  utter.rate   = 0.9;
  utter.pitch  = 1.05;
  utter.volume = 1;

  // Try to pick a nice English voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
                 || voices.find(v => v.lang === "en-US")
                 || voices[0];
  if (preferred) utter.voice = preferred;

  utter.onstart = () => voiceBtn.classList.add("speaking");
  utter.onend   = () => voiceBtn.classList.remove("speaking");
  utter.onerror = () => voiceBtn.classList.remove("speaking");

  window.speechSynthesis.speak(utter);
});

// Ensure voices are loaded before use (Chrome fix)
if (window.speechSynthesis) window.speechSynthesis.getVoices();

/* ────────────────────────────────────────────────────────────────────────────
   13. NOTIFICATION PANEL
   ──────────────────────────────────────────────────────────────────────────── */
const ALERTS = [
  { type:"high", title:"⚠️ High Traffic Tomorrow Evening", body:"Market area expected to be heavily congested from 5–9 PM." },
  { type:"med",  title:"🎉 Upcoming Festival Alert",        body:`${getNextFestival()||"Festival"} approaching — plan alternate routes.` },
  { type:"med",  title:"🚧 Road Work on NH-48",             body:"Lane closures near Sheetla Mata Chowk until Friday." },
];

(function populateNotifications() {
  ALERTS.forEach(a => {
    const li = document.createElement("li");
    li.className = `notif-item ${a.type}`;
    li.innerHTML = `<div class="notif-title">${a.title}</div><div class="notif-body">${a.body}</div>`;
    notifList.appendChild(li);
  });
})();

notifBtn.addEventListener("click",  () => { notifPanel.classList.add("open"); notifOverlay.classList.add("show"); });
closeNotif.addEventListener("click",() => { notifPanel.classList.remove("open"); notifOverlay.classList.remove("show"); });
notifOverlay.addEventListener("click", () => { notifPanel.classList.remove("open"); notifOverlay.classList.remove("show"); });

/* ────────────────────────────────────────────────────────────────────────────
   14. TOAST NOTIFICATIONS
   ──────────────────────────────────────────────────────────────────────────── */
const toastIcons = { info:"ℹ️", warning:"⚠️", error:"❌", success:"✅" };

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${toastIcons[type]||"ℹ️"}</span><span>${message}</span>`;
  toastStack.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 320);
  }, 4000);
}

/* ────────────────────────────────────────────────────────────────────────────
   15. CANVAS BACKGROUND — ANIMATED GRID DOTS
   ──────────────────────────────────────────────────────────────────────────── */
(function initBackground() {
  const canvas  = $("bgCanvas");
  const ctx     = canvas.getContext("2d");
  let   W, H, dots;

  const DOT_COUNT = 80;
  const DOT_COLOR = "rgba(0,210,255,";

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initDots();
  }

  function initDots() {
    dots = Array.from({ length: DOT_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  1 + Math.random() * 2,
      a:  0.2 + Math.random() * 0.5,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connecting lines (graph network effect)
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx   = dots[i].x - dots[j].x;
        const dy   = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.strokeStyle = DOT_COLOR + (0.12 * (1 - dist / 120)) + ")";
          ctx.lineWidth   = 0.8;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = DOT_COLOR + d.a + ")";
      ctx.fill();

      // Move
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = W;
      if (d.x > W) d.x = 0;
      if (d.y < 0) d.y = H;
      if (d.y > H) d.y = 0;
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
})();

/* ────────────────────────────────────────────────────────────────────────────
   16. STATUS TICKER — duplicate content for seamless loop
   ──────────────────────────────────────────────────────────────────────────── */
(function duplicateTicker() {
  const ticker = $("statusTicker");
  ticker.innerHTML += ticker.innerHTML; // duplicate for infinite scroll
})();

/* ────────────────────────────────────────────────────────────────────────────
   17. INITIAL HEATMAP (placeholder until first prediction)
   ──────────────────────────────────────────────────────────────────────────── */
buildHeatmap("low");

/* ────────────────────────────────────────────────────────────────────────────
   18. WELCOME TOAST
   ──────────────────────────────────────────────────────────────────────────── */
setTimeout(() => {
  showToast("⚡ Smart Traffic Analyzer ready. Enter your route to begin!", "success");
}, 800);

/* ── Utility ── */
const sleep = ms => new Promise(r => setTimeout(r, ms));
