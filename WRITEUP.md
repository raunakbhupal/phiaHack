# Phia Gifting — AI-Powered Gift Discovery

## Why this problem?

Every recommendation system today optimizes for the shopper's own preferences. But gift-giving is fundamentally different — you're trying to understand someone else's personality, interests, and tastes. Try searching "romantic but not too romantic birthday gift for a friend who likes art and coffee" on any shopping site. You'll get generic listicles, not personalized results.

Phia already solves the "find the best deal" problem brilliantly. We wanted to solve the step before that: **figuring out what to buy in the first place.**

## The Solution

Phia Gifting flips the shopping model: instead of searching for products, you describe the person. Our AI understands who they are — their age, interests, personality, the occasion, your relationship — and searches the internet to find gifts matched specifically to them.

**Key features:**
- **Natural language input** — describe the recipient like you'd tell a friend: "My sister is 28, loves hiking and photography, very outdoorsy"
- **Smart follow-up questions** — if your description is vague, the AI asks 1-2 clarifying questions in a chat interface before searching
- **Live product search** — searches Google Shopping across Amazon, Walmart, Target, Etsy, and thousands of stores in real-time
- **Diversity-enforced results** — if someone likes cricket AND Harry Potter AND photography, you get gifts for ALL three interests, not 9 cricket jerseys
- **Confidence-weighted ranking** — uses Wilson score statistical lower bound for review confidence, not just star ratings. A 4.5★ product with 5,000 reviews ranks higher than a 5.0★ with 3 reviews
- **"Why This Gift?" explanations** — every recommendation includes an AI-generated explanation of why it fits the recipient
- **Compare Prices** — inline price comparison across stores for every product
- **Wishlist** — save gifts for later, persists across sessions
- **Refine without restarting** — adjust budget or add details from the results page

## Technical Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Python, FastAPI, Pydantic
- **AI:** Claude Sonnet (Anthropic API) — 3 calls per search: recipient parsing, query generation, scoring & explanations
- **Product Search:** SerpAPI (Google Shopping) — 8 parallel searches with price range filters and diversity enforcement
- **Scoring Algorithm:** Wilson score lower bound + tag matching + occasion matching + gift quality tiers
- **Deployment:** Render (backend web service + frontend static site)
- **Storage:** localStorage for wishlist, sessionStorage for result persistence

## Technical Challenges

**1. Diversity problem** — Early versions returned 12 Messi jerseys when someone liked "football and Harry Potter." We solved this by enforcing a max of 4 products per category BEFORE Claude sees the candidates, forcing diverse selection.

**2. Claude returning non-JSON** — Claude occasionally adds preamble text before JSON responses. We built a robust JSON extractor that bracket-matches to find JSON objects/arrays regardless of surrounding text, with separate handling for expected objects vs arrays.

**3. Budget respect** — Google Shopping defaults to showing cheap popular items regardless of budget. We added the `tbs` price range parameter to SerpAPI queries AND budget-aware search terms ("premium", "luxury" for high budgets) to surface appropriate products.

**4. Store URLs** — SerpAPI shopping results only provide Google redirect URLs, not direct store links. We built a store-specific URL builder that generates direct search URLs for 12+ major retailers (Amazon, Walmart, Target, Etsy, etc.) with simplified product names for better search accuracy.

**5. Follow-up intelligence** — Getting the right balance of when to ask vs when to search directly. Too aggressive = annoying. Too passive = bad results. We tuned it to only ask when age or interests are genuinely missing, and skip when the description is rich enough.

## Links

- **Live demo:** https://phia-gifts-ui.onrender.com/
- **GitHub:** https://github.com/raunakbhupal/phiaHack

*Note: The backend runs on Render's free tier — first request may take ~50 seconds to cold start after inactivity.*
