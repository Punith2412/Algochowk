// ============================================
// Option 1 — Mini Prototype
// Understand → Structure → Flag missing → Present experiment
// ============================================

let current = {
  original: "",
  extracted: {},
  missing: [],
  clarifications: {},
  experiment: null
};

function fillExample() {
  document.getElementById("question").value =
    "Does buying NIFTY after a 1% fall work better during high-volatility periods?";
}

function analyze() {
  const q = document.getElementById("question").value.trim();
  if (!q) {
    alert("Please enter a question first.");
    return;
  }

  current.original = q;
  current.extracted = extract(q);
  current.missing = findMissing(current.extracted);
  current.clarifications = {};
  current.experiment = null;

  renderExtracted();
  renderMissing();
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("experiment-box").classList.add("hidden");
  document.getElementById("missing-box").classList.remove("hidden");

  // Scroll to results
  document.getElementById("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Simple but useful extraction (can be replaced by LLM) ----------
function extract(text) {
  const lower = text.toLowerCase();
  const result = {
    instrument: null,
    timeframe: null,
    entry: null,
    exit: null,
    holdingPeriod: null,
    filters: [],
    goal: null,
    direction: null
  };

  // Instrument
  if (lower.includes("banknifty") || lower.includes("bank nifty")) result.instrument = "BANKNIFTY";
  else if (lower.includes("nifty")) result.instrument = "NIFTY";
  else if (lower.includes("sensex")) result.instrument = "SENSEX";

  // Direction
  if (lower.includes("buying") || lower.includes("buy ") || lower.includes("long")) result.direction = "Buy / Long";
  if (lower.includes("selling") || lower.includes("sell ") || lower.includes("short")) result.direction = "Sell / Short";

  // Entry condition – look for percentage fall/rise
  const fallMatch = lower.match(/(?:after|on|following)?\s*(?:a\s+)?(\d+(?:\.\d+)?)\s*%?\s*(?:fall|drop|decline|down)/);
  const riseMatch = lower.match(/(?:after|on|following)?\s*(?:a\s+)?(\d+(?:\.\d+)?)\s*%?\s*(?:rise|rally|up|gain)/);
  if (fallMatch) {
    result.entry = `${result.instrument || "Instrument"} falls ≥ ${fallMatch[1]}%`;
  } else if (riseMatch) {
    result.entry = `${result.instrument || "Instrument"} rises ≥ ${riseMatch[1]}%`;
  } else if (lower.includes("sharp fall") || lower.includes("sharp drop")) {
    result.entry = "Sharp fall (definition not specified)";
  }

  // Timeframe hints
  if (lower.includes("daily") || lower.includes("day")) result.timeframe = "Daily";
  else if (lower.includes("weekly") || lower.includes("week")) result.timeframe = "Weekly";
  else if (lower.includes("intraday") || lower.includes("hourly")) result.timeframe = "Intraday";

  // Filters
  if (lower.includes("high-volatility") || lower.includes("high volatility") || lower.includes("high vol")) {
    result.filters.push("High volatility periods");
  }
  if (lower.includes("low-volatility") || lower.includes("low volatility") || lower.includes("low vol")) {
    result.filters.push("Low volatility periods");
  }
  if (lower.includes("bull") || lower.includes("uptrend")) result.filters.push("Bull / uptrend market");
  if (lower.includes("bear") || lower.includes("downtrend")) result.filters.push("Bear / downtrend market");

  // Holding period
  const holdMatch = lower.match(/(?:hold|holding|for)\s+(\d+)\s*(day|days|week|weeks)/);
  if (holdMatch) {
    result.holdingPeriod = `${holdMatch[1]} ${holdMatch[2]}`;
  }

  // Exit
  if (lower.includes("target") || lower.includes("take profit")) result.exit = "Profit target mentioned (details unclear)";
  if (lower.includes("stop") || lower.includes("stoploss") || lower.includes("stop-loss")) {
    result.exit = (result.exit ? result.exit + " + " : "") + "Stop-loss mentioned (details unclear)";
  }

  // Goal
  if (lower.includes("edge") || lower.includes("work better") || lower.includes("work?") || lower.includes("positive")) {
    result.goal = "Does the idea have a positive edge / expectancy?";
  } else {
    result.goal = "Evaluate whether the described approach is profitable";
  }

  return result;
}

// ---------- Identify missing critical information ----------
function findMissing(ext) {
  const missing = [];

  if (!ext.instrument) {
    missing.push({
      id: "instrument",
      question: "Which instrument / market?",
      type: "select",
      options: ["NIFTY", "BANKNIFTY", "SENSEX", "Other"]
    });
  }

  if (!ext.entry || ext.entry.includes("not specified") || ext.entry.includes("Sharp fall")) {
    missing.push({
      id: "entry",
      question: "How exactly should the entry condition be defined?",
      type: "text",
      placeholder: "e.g. NIFTY falls ≥ 1.5% in 1 day"
    });
  }

  if (!ext.holdingPeriod) {
    missing.push({
      id: "holdingPeriod",
      question: "How long should the position be held?",
      type: "text",
      placeholder: "e.g. 5 trading days / until +2% or –1.5%"
    });
  }

  if (!ext.exit) {
    missing.push({
      id: "exit",
      question: "What is the exit rule? (or is it just a fixed holding period?)",
      type: "text",
      placeholder: "e.g. Close after 5 days, or +2% target / –1.5% stop"
    });
  }

  if (!ext.timeframe) {
    missing.push({
      id: "timeframe",
      question: "Which timeframe should we use?",
      type: "select",
      options: ["Daily", "Weekly", "Intraday (hourly)", "Not sure – use Daily"]
    });
  }

  // Always useful to confirm the goal when filters are present
  if (ext.filters.length > 0 && !ext.goal.includes("volatility")) {
    // already covered by filters
  }

  return missing;
}

// ---------- Render ----------
function renderExtracted() {
  const e = current.extracted;
  const fields = [
    { label: "Instrument", value: e.instrument },
    { label: "Direction", value: e.direction },
    { label: "Timeframe", value: e.timeframe },
    { label: "Entry condition", value: e.entry },
    { label: "Exit condition", value: e.exit },
    { label: "Holding period", value: e.holdingPeriod },
    { label: "Filters / variables", value: e.filters.length ? e.filters.join(", ") : null },
    { label: "What user wants to know", value: e.goal }
  ];

  document.getElementById("extracted").innerHTML = fields.map(f => `
    <div class="flex flex-col p-3 rounded-lg ${f.value ? 'bg-green-50 border border-green-100' : 'bg-slate-50 border border-slate-100'}">
      <span class="text-xs text-slate-500 uppercase tracking-wide">${f.label}</span>
      <span class="font-medium mt-0.5 ${f.value ? 'text-slate-800' : 'text-slate-400 italic'}">
        ${f.value || "Not specified"}
      </span>
    </div>
  `).join("");
}

function renderMissing() {
  const list = document.getElementById("missing-list");

  if (current.missing.length === 0) {
    list.innerHTML = `
      <div class="text-green-700 font-medium">No critical information is missing. You can proceed to the structured experiment.</div>
    `;
    // Auto-build experiment
    setTimeout(() => applyClarifications(), 300);
    return;
  }

  list.innerHTML = current.missing.map(m => {
    if (m.type === "select") {
      return `
        <div>
          <label class="block text-sm font-medium text-amber-900 mb-1">${m.question}</label>
          <select id="clar-${m.id}" class="w-full border border-amber-300 rounded-lg px-3 py-2 bg-white">
            <option value="">— select —</option>
            ${m.options.map(o => `<option value="${o}">${o}</option>`).join("")}
          </select>
        </div>
      `;
    }
    return `
      <div>
        <label class="block text-sm font-medium text-amber-900 mb-1">${m.question}</label>
        <input id="clar-${m.id}" type="text" placeholder="${m.placeholder || ''}"
          class="w-full border border-amber-300 rounded-lg px-3 py-2 bg-white" />
      </div>
    `;
  }).join("");
}

function applyClarifications() {
  // Collect answers
  current.missing.forEach(m => {
    const el = document.getElementById(`clar-${m.id}`);
    if (el && el.value.trim()) {
      current.clarifications[m.id] = el.value.trim();
    }
  });

  // Merge into extracted
  const e = { ...current.extracted };
  if (current.clarifications.instrument) e.instrument = current.clarifications.instrument;
  if (current.clarifications.entry) e.entry = current.clarifications.entry;
  if (current.clarifications.holdingPeriod) e.holdingPeriod = current.clarifications.holdingPeriod;
  if (current.clarifications.exit) e.exit = current.clarifications.exit;
  if (current.clarifications.timeframe) e.timeframe = current.clarifications.timeframe;

  // Build final experiment object
  current.experiment = {
    instrument: e.instrument || "Not specified",
    timeframe: e.timeframe || "Daily (assumed)",
    direction: e.direction || "Buy",
    entry: e.entry || "Not specified",
    exit: e.exit || "Not specified",
    holdingPeriod: e.holdingPeriod || "Not specified",
    filters: e.filters.length ? e.filters : ["None"],
    question: e.goal || current.original,
    originalQuestion: current.original,
    assumptions: []
  };

  // Record what we still had to assume
  if (!e.timeframe) current.experiment.assumptions.push("Timeframe defaulted to Daily");
  if (!e.exit && !e.holdingPeriod) {
    current.experiment.assumptions.push("Exit / holding period still incomplete — backtest will need a rule");
  }

  renderExperiment();
  document.getElementById("missing-box").classList.add("hidden");
  document.getElementById("experiment-box").classList.remove("hidden");
  document.getElementById("experiment-box").classList.add("fade-in");
}

function renderExperiment() {
  const exp = current.experiment;
  document.getElementById("experiment").innerHTML = `
    <div class="grid grid-cols-[130px_1fr] gap-y-2.5">
      <div class="text-slate-500">Instrument</div>
      <div class="font-semibold">${exp.instrument}</div>

      <div class="text-slate-500">Timeframe</div>
      <div>${exp.timeframe}</div>

      <div class="text-slate-500">Direction</div>
      <div>${exp.direction}</div>

      <div class="text-slate-500">Entry</div>
      <div>${exp.entry}</div>

      <div class="text-slate-500">Exit</div>
      <div>${exp.exit}</div>

      <div class="text-slate-500">Holding period</div>
      <div>${exp.holdingPeriod}</div>

      <div class="text-slate-500">Filters</div>
      <div>${exp.filters.join(", ")}</div>

      <div class="text-slate-500">Question</div>
      <div>${exp.question}</div>
    </div>
    ${exp.assumptions.length ? `
      <div class="mt-4 pt-3 border-t border-slate-200 text-amber-700 text-xs">
        Remaining assumptions: ${exp.assumptions.join(" · ")}
      </div>
    ` : ""}
  `;
}

function exportJSON() {
  if (!current.experiment) return;
  const blob = new Blob([JSON.stringify(current.experiment, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "experiment.json";
  a.click();
  URL.revokeObjectURL(url);
}

function resetAll() {
  current = { original: "", extracted: {}, missing: [], clarifications: {}, experiment: null };
  document.getElementById("question").value = "";
  document.getElementById("result").classList.add("hidden");
}
