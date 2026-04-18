# ✦ Phia Gifts — AI-Powered Gift Discovery

> Describe the person, not the product. Our AI searches the internet and finds gifts matched to their personality, interests, and your budget.

Built for the [Phia](https://phia.com/) Hackathon.

![TypeScript](https://img.shields.io/badge/TypeScript-59%25-blue)
![Python](https://img.shields.io/badge/Python-35%25-yellow)
![Claude AI](https://img.shields.io/badge/Powered%20by-Claude%20AI-purple)

---

## How It Works

```
User describes recipient → AI extracts personality & interests
                         → Generates targeted search queries
                         → Searches Google Shopping in parallel
                         → Ranks by match score + review confidence
                         → Returns 12 diverse, personalized gift picks
```

**1. Describe the recipient** — free-text about who they are, what they love, the occasion, and your budget.

**2. AI follow-up** — if the description is vague, Claude asks 1–3 clarifying questions to sharpen results.

**3. Smart search** — Claude generates 8 diverse search queries (covering every interest), SerpAPI searches Google Shopping in parallel across Amazon, Etsy, Target, and more.

**4. Diversity-enforced ranking** — results are capped at 4 per category before Claude scores them, ensuring you get gifts across all interests (not 12 jerseys).

**5. Confidence-weighted scoring** — each gift is ranked using:
- **Semantic match** to recipient interests (via Claude)
- **Wilson score** review confidence (not just star ratings)
- **Price fit** within budget range
- **Store trust** signals

**6. Refine without restarting** — adjust budget or add details from the results page and re-search instantly.

---

## Features

| Feature | Description |
|---|---|
| 🧠 **AI Recipient Parsing** | Claude extracts interests, personality traits, age, relationship from natural language |
| 🤔 **Smart Follow-ups** | Asks clarifying questions only when the description is too vague |
| 🌍 **Live Product Search** | SerpAPI searches Google Shopping across 40k+ stores in parallel |
| 🎯 **Diversity Enforcement** | Max 4 products per category — covers all interests, not just the dominant one |
| 📊 **Wilson Score Ranking** | Review confidence based on statistical lower bound, not naive star averages |
| 💡 **"Why This Gift?" Modal** | AI-generated explanation of why each gift fits the recipient |
| 🛒 **Smart Buy Links** | Price-filtered Amazon search + Google Shopping comparison |
| ✏️ **Refine from Results** | Adjust budget or add forgotten details without starting over |
| 🏪 **Store Badges** | Shows which store each product comes from |
| 📱 **Responsive UI** | Works on desktop, tablet, and mobile |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Python, FastAPI, Pydantic |
| **AI** | Claude Sonnet (Anthropic API) — recipient parsing, query generation, scoring & explanations |
| **Search** | SerpAPI (Google Shopping) — live product search with parallel execution |
| **Scoring** | Wilson score lower bound, tag matching, occasion matching, price fit |

---

## Architecture

```
┌─────────────┐     POST /api/find-gifts     ┌──────────────────┐
│   React UI  │ ──────────────────────────▶  │   FastAPI Server  │
│  (Vite/TS)  │ ◀──────────────────────────  │                  │
└─────────────┘     FindGiftsResponse         │  1. Claude: parse │
                                              │  2. Claude: queries│
                                              │  3. SerpAPI: search│
                                              │  4. Diversity filter│
                                              │  5. Claude: rank   │
                                              └──────────────────┘
```

**API Endpoints:**
- `POST /api/check-followup` — analyze if description needs clarification
- `POST /api/find-gifts` — full pipeline: parse → search → rank → explain
- `POST /api/gift-message` — generate personalized gift card message
- `GET /health` — health check

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Anthropic API key](https://console.anthropic.com/)
- [SerpAPI key](https://serpapi.com/) (optional — falls back to curated catalog)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create .env with your keys
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your-key-here
SERPAPI_KEY=your-key-here
EOF

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## Project Structure

```
phiaHack/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   ├── recipient.py         # RecipientInput, RecipientProfile
│   │   └── gift.py              # Product, GiftResult, FindGiftsResponse
│   ├── routers/
│   │   └── gifts.py             # API endpoints
│   ├── services/
│   │   ├── claude_service.py    # All Claude AI interactions
│   │   ├── serpapi_service.py   # Google Shopping search + diversity
│   │   ├── catalog_service.py   # Curated product fallback
│   │   └── scoring.py           # Wilson score, tag matching, ranking
│   └── data/
│       └── products.json        # 95 curated fallback products
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── api/client.ts        # API client
        ├── types/index.ts       # TypeScript interfaces
        ├── store/giftStore.tsx   # State management (useReducer)
        ├── pages/
        │   ├── SearchPage.tsx    # Landing page with form
        │   ├── FollowUpPage.tsx  # AI follow-up questions
        │   └── ResultsPage.tsx   # Gift grid with filters
        └── components/
            ├── RecipientForm.tsx
            ├── RecipientCard.tsx
            ├── GiftCard.tsx      # Card + WhyModal
            ├── GiftGrid.tsx
            ├── ScoreRing.tsx
            ├── BudgetSlider.tsx
            └── LoadingOverlay.tsx
```

---

## The Scoring Algorithm

Each product is scored using a weighted combination:

```
final_score = 0.45 × tag_match + 0.25 × wilson_score + 0.15 × occasion_match + 0.15 × base
```

**Wilson Score Lower Bound** — measures review confidence, not just average rating:
```python
wilson = (p + z²/2n - z√(p(1-p)/n + z²/4n²)) / (1 + z²/n)
# where p = normalized rating, n = review count, z = 1.96
```

A 4.5★ product with 5,000 reviews scores higher than a 5.0★ product with 3 reviews.

**Diversity Enforcement** — before Claude sees the candidates, products are capped at 4 per category. This prevents a single interest from dominating results.

---

## License

Built for the Phia Hackathon 2026.
