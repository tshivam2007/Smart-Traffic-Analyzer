/* ═══════════════════════════════════════════════════════════════════════════
   Smart Traffic Analyzer — server.js  (Node.js + Express Backend)
   Run: npm install express cors && node server.js
   API: POST /predict  →  { level, peak, suggestion, festival, delay }
   ═══════════════════════════════════════════════════════════════════════════ */

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─── Middleware ──────────────────────────────────────────────────────────── */
app.use(cors());
app.use(express.json());
// Serve the frontend static files from the same folder
app.use(express.static(path.join(__dirname)));

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Indian festival calendar — stored as MM-DD strings.
 * In production this would be fetched from a live API or database.
 */
const FESTIVALS = {
  "10-20": "Diwali", "10-21": "Diwali", "10-22": "Diwali",
  "10-23": "Diwali", "11-01": "Diwali", "11-02": "Diwali",
  "03-14": "Holi",   "03-15": "Holi",   "03-16": "Holi",
  "04-10": "Eid",    "04-11": "Eid",
  "06-17": "Eid al-Adha", "06-18": "Eid al-Adha",
  "01-01": "New Year", "12-31": "New Year Eve",
  "10-03": "Navratri","10-04": "Navratri","10-05": "Navratri",
  "10-06": "Navratri","10-07": "Navratri","10-08": "Navratri",
  "10-09": "Navratri / Durga Puja",
  "10-10": "Durga Puja","10-11": "Durga Puja","10-12": "Durga Puja",
  "10-13": "Durga Puja",
  "12-24": "Christmas Eve", "12-25": "Christmas",
  "08-15": "Independence Day",
  "01-26": "Republic Day",
};

/** Returns festival name or null for a YYYY-MM-DD date string */
function getFestival(dateStr) {
  const mmdd = dateStr.slice(5);
  return FESTIVALS[mmdd] || null;
}

/**
 * Traffic suggestions per level.
 * The backend always picks the first (most official) suggestion.
 * The frontend adds randomness for demo variety.
 */
const SUGGESTIONS = {
  low:         "Roads are clear — enjoy a smooth journey!",
  medium:      "Moderate traffic expected. Leave 10–15 min earlier.",
  high:        "Heavy congestion. Consider Metro or alternate route via Ring Road.",
  "very-high": "Extreme congestion due to festival/peak hour. Use public transport or postpone trip.",
};

const PEAK_TIMES = {
  morning:   "7 AM – 10 AM",
  afternoon: "12 PM – 2 PM",
  evening:   "5 PM – 9 PM",
  night:     "10 PM – 12 AM",
};

const DELAY_ESTIMATES = {
  low:         "+5 min",
  medium:      "+15 min",
  high:        "+30 min",
  "very-high": "+50 min",
};

/* ═══════════════════════════════════════════════════════════════════════════
   CORE PREDICTION ENGINE
   Rule-based logic (can be replaced with an ML model later)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Predict traffic level based on contextual rules.
 *
 * @param {string} date      - ISO date "YYYY-MM-DD"
 * @param {string} time      - "morning" | "afternoon" | "evening" | "night"
 * @param {string} area_type - "market" | "highway" | "residential" | "industrial" | "school"
 * @returns {{ level, festival, peak, suggestion, delay, confidence }}
 */
function predictTraffic(date, time, area_type) {
  // ── Detect festival ──
  const festival   = getFestival(date);

  // ── Detect weekday/weekend ──
  const dayOfWeek  = new Date(date).getDay();   // 0=Sun, 6=Sat
  const isWeekend  = dayOfWeek === 0 || dayOfWeek === 6;
  const isWeekday  = !isWeekend;

  // ── Office peak hours ──
  const isPeakHour = (time === "morning" || time === "evening");

  // ─────────────────────────────────────────────────────────────────────────
  // RULE TABLE (priority highest → lowest)
  // ─────────────────────────────────────────────────────────────────────────
  let level;
  let confidence = 85; // percent

  if (festival && time === "evening") {
    // Festival evening: worst case
    level      = "very-high";
    confidence = 95;

  } else if (festival && time === "morning") {
    // Festival morning: very busy
    level      = "high";
    confidence = 90;

  } else if (festival) {
    // Festival off-peak
    level      = "medium";
    confidence = 80;

  } else if (area_type === "highway" && isWeekday && isPeakHour) {
    // Expressways choke during rush hour on weekdays
    level      = "very-high";
    confidence = 88;

  } else if (area_type === "market" && isPeakHour && isWeekday) {
    // Commercial areas are packed during office rush
    level      = "high";
    confidence = 85;

  } else if (area_type === "school" && time === "morning") {
    // School zones — morning drop-off chaos
    level      = "high";
    confidence = 82;

  } else if (area_type === "industrial" && time === "morning") {
    // Shift start at factories
    level      = "high";
    confidence = 80;

  } else if (isWeekday && isPeakHour) {
    // Typical weekday office rush
    level      = "medium";
    confidence = 78;

  } else if (area_type === "market" && !isWeekend) {
    // Market on normal weekday
    level      = "medium";
    confidence = 72;

  } else if (area_type === "highway" && isWeekend) {
    // Weekend highway — leisure traffic
    level      = "medium";
    confidence = 70;

  } else if (isWeekend && time === "afternoon") {
    // Weekend afternoon — malls / outings
    level      = "medium";
    confidence = 68;

  } else if (area_type === "residential" || time === "night") {
    // Quiet residential or late night
    level      = "low";
    confidence = 90;

  } else {
    level      = "low";
    confidence = 65;
  }

  // Festival overrides peak time display
  const peak = festival ? "5 PM – 11 PM" : PEAK_TIMES[time] || PEAK_TIMES.evening;

  return {
    level,
    festival: festival || null,
    peak,
    suggestion: SUGGESTIONS[level],
    delay:      DELAY_ESTIMATES[level],
    confidence,
    meta: {
      isWeekend,
      isPeakHour,
      area_type,
      analysedAt: new Date().toISOString(),
    }
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   API ROUTES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * POST /predict
 * Body: { location, date, time, area_type }
 * Response: { level, festival, peak, suggestion, delay, confidence, meta }
 */
app.post("/predict", (req, res) => {
  const { location, date, time, area_type } = req.body;

  // ── Input validation ──
  if (!location || !date || !time || !area_type) {
    return res.status(400).json({
      error: "Missing required fields: location, date, time, area_type"
    });
  }

  const validTimes = ["morning","afternoon","evening","night"];
  const validAreas = ["market","highway","residential","industrial","school"];

  if (!validTimes.includes(time)) {
    return res.status(400).json({ error: `Invalid time. Must be one of: ${validTimes.join(", ")}` });
  }
  if (!validAreas.includes(area_type)) {
    return res.status(400).json({ error: `Invalid area_type. Must be one of: ${validAreas.join(", ")}` });
  }

  // ── Predict ──
  const result = predictTraffic(date, time, area_type);

  console.log(`[${new Date().toISOString()}] PREDICT: ${location} | ${date} | ${time} | ${area_type} → ${result.level.toUpperCase()}`);

  res.json({ location, ...result });
});

/**
 * GET /festivals
 * Returns the full festival calendar
 */
app.get("/festivals", (req, res) => {
  res.json(FESTIVALS);
});

/**
 * GET /health
 * Simple health-check endpoint
 */
app.get("/health", (req, res) => {
  res.json({ status:"ok", timestamp: new Date().toISOString(), version:"2.4.0" });
});

/* ═══════════════════════════════════════════════════════════════════════════
   START SERVER
   ═══════════════════════════════════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║      Smart Traffic Analyzer — Server v2.4        ║");
  console.log(`║  Listening on http://localhost:${PORT}              ║`);
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("\n  Endpoints:");
  console.log(`  POST http://localhost:${PORT}/predict`);
  console.log(`  GET  http://localhost:${PORT}/festivals`);
  console.log(`  GET  http://localhost:${PORT}/health\n`);
});
