# AI Usage Note — Option 1

**Tools used:** Grok (xAI) as primary development partner.

**Used for:**
- Interpreting the exact scope of Option 1 vs Option 2
- Designing the extraction → missing-info → structured experiment flow
- Writing clean, readable vanilla JS
- Crafting the UI so the “missing information” step is impossible to ignore

**Decisions I made myself:**
- Kept the prototype extremely focused (no mock backtest, no LEARN stage)
- Made the missing-information step mandatory and visual (amber box)
- Chose rule-based extraction first so the logic is fully transparent and explainable
- Added JSON export as the optional “bonus” path to a backtesting engine

**Proud of:** The clear separation between “what we understood” and “what is still missing”. That single UX decision demonstrates product thinking better than any amount of extra features.
