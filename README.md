# AI Trading Research Assistant — Option 1 Mini Prototype

**Focus:** Understand the question → Structure it as an experiment → Identify missing information → Present the experiment cleanly.

## How to run

Open `index.html` in any modern browser.  
No build step, no server required.

## What it does

1. **Understand** – Extracts instrument, direction, entry condition, timeframe, filters, holding period, exit, and the user’s goal from natural language.
2. **Flag missing info** – Explicitly asks the user to clarify important parameters instead of inventing them.
3. **Structure** – Produces a clean, readable experiment card that can be handed to a backtesting engine.
4. **Export** – One-click JSON export of the structured experiment (bonus).

## Example flow

User types:  
“Does buying NIFTY after a 1% fall work better during high-volatility periods?”

System extracts:
- Instrument: NIFTY
- Entry: falls ≥ 1%
- Filter: High volatility periods
- Goal: Does it have a positive edge?

Then asks for the missing pieces (holding period, exit rule, exact timeframe) before showing the final experiment.

## Tech choices

- Vanilla HTML + JavaScript + Tailwind CDN
- Zero dependencies, zero friction
- Extraction logic is rule-based and transparent (easy to replace with an LLM later)
- Designed so the structured JSON can be passed to a real backtester

## Key product decision

**Never silently invent critical parameters.**  
If holding period or exit rule is missing, the system asks. This is the core behaviour the assignment wants to see.

## What I would improve with more time

- Replace the simple regex/keyword extractor with a real LLM call that returns structured JSON
- Add a “suggested defaults” panel so the user can accept sensible defaults in one click
- Persist previous experiments
- Add a tiny visual of how the JSON would look when sent to a backtesting API
