<div align="center">

# 🚀 SmartCashback AI

### Hyperlocal Merchant Growth & Personalized Rewards Engine

*Paytm AI Hackathon — Track 1: Merchant Growth AI*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)](https://neon.tech/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?logo=google)](https://ai.google.dev/)

</div>

---

## 📌 Problem Statement

Small local merchants (restaurants, salons, clothing stores) struggle to acquire and retain customers. They lack data-driven marketing tools that large chains have. Meanwhile, customers make repetitive spending decisions without discovering better nearby alternatives that match their taste and budget.

## 💡 Our Solution

**SmartCashback AI** turns every payment into a personalized discovery moment. When a customer pays at any merchant, our AI engine instantly analyzes their spending history, geographic proximity (5 km radius), category relationships, and price similarity to generate the **Top 3 personalized merchant recommendations** — each with a transparent match-rate score and clear rationale.

### How It Works

```
Customer Pays at Merchant → AI Engine Activates
       ↓
Loads User's Category-Specific Spending Profile
       ↓
Finds Related Categories (from DB graph)
       ↓
Discovers Nearby Merchants (within 5 km radius)
       ↓
Scores Each Candidate Across 4 Dimensions
       ↓
Generates Top 3 Recommendations with Explanations
       ↓
User Sees: "Most Suitable for You" + Match Rate %
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Recommendation Engine** | Custom deterministic scoring across 4 weighted dimensions — fully explainable, no black-box |
| 📍 **Hyperlocal Discovery** | 5 km radius merchant-centered search with interactive map visualization |
| 🎫 **Smart Coupons** | Merchants create coupons; customers manually select and apply during payment |
| 📊 **Merchant Analytics** | Real-time revenue charts, customer insights, and campaign management dashboard |
| 🗺️ **Geographic Context Map** | Admin can visualize transaction origin, candidate merchants, and search radius on a live map |
| 🔍 **Decision Engine Audit** | Full transparency — every recommendation shows Category, Price, History, and Distance scores |
| 🤖 **Gemini AI Layer** | Optional natural-language explanations powered by Google Gemini 2.0 Flash |

---

## 🏗️ Architecture

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│  Frontend (Next.js 14)      │────▶│  Backend (FastAPI)            │
│  TypeScript + Tailwind CSS  │     │  Python 3.12 + SQLAlchemy     │
│  React Leaflet (Maps)       │     │  Recommendation Engine        │
│  Recharts (Analytics)       │     │  Gemini AI Integration        │
└─────────────────────────────┘     └──────────┬───────────────────┘
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                         ┌────▼────┐    ┌──────▼─────┐  ┌──────▼──────┐
                         │  Neon   │    │   Redis    │  │   Gemini    │
                         │Postgres │    │  (Cache)   │  │   AI API    │
                         └─────────┘    └────────────┘  └─────────────┘
```

---

## 🧮 Recommendation Scoring Algorithm

```
final_score = Category Relevance  × 0.30   (category relationship graph)
            + Price Similarity    × 0.30   (Gaussian similarity function)
            + User History        × 0.20   (spending profile match)
            + Distance Score      × 0.20   (Haversine formula, 5km radius)
```

Each recommendation shows a **Match Rate %** and a detailed breakdown of why it was suggested — making the AI fully transparent and trustworthy.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ | Node.js 18+ | PostgreSQL (Neon) | Google Gemini API Key

### 1. Clone & Setup

```bash
git clone https://github.com/Prathmesh-S27/Paytm_AI_Hackathon_SmartCashback_AI.git
cd Paytm_AI_Hackathon_SmartCashback_AI
cp .env.example .env
# Edit .env with your credentials
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python create_tables.py        # Create database tables
python seed.py                 # Seed Mumbai demo data (~80 merchants, 100+ users)
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🔑 Demo Credentials

| Role | Email | Description |
|------|-------|-------------|
| 👤 Customer | `rahul@demo.com` | Primary demo user |
| 👤 Customer | `priya@demo.com` | Secondary demo user |
| 🏪 Merchant | `merchant@demo.com` | Restaurant owner dashboard |
| ⚙️ Admin | `admin@demo.com` | Platform analytics & decision engine |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email + role |
| POST | `/api/payments` | Make payment + get AI recommendations |
| GET | `/api/users/{id}/spending` | User category spending profiles |
| GET | `/api/merchants` | List/filter merchants |
| GET | `/api/merchants/{id}/analytics` | Merchant revenue analytics |
| GET | `/api/coupons` | List available coupons |
| GET | `/api/admin/analytics` | Platform overview (GMV, users, merchants) |
| GET | `/api/admin/recommendation-logs` | Full recommendation audit trail |

---

## 📁 Project Structure

```
SmartCashback-AI/
├── frontend/                  # Next.js 14 Application
│   ├── app/                   # Pages (App Router)
│   │   ├── customer/          # Customer dashboard, vouchers, transactions
│   │   ├── merchant/          # Merchant analytics, campaigns
│   │   ├── admin/             # Admin dashboard, decision engine
│   │   └── pay/               # Payment flow with coupon selection
│   ├── components/            # UI components, charts, maps
│   ├── lib/                   # API client, utilities, constants
│   └── types/                 # TypeScript interfaces
├── backend/                   # FastAPI Application
│   ├── app/
│   │   ├── api/               # REST API routes
│   │   ├── models/            # SQLAlchemy models (13 tables)
│   │   ├── schemas/           # Pydantic v2 schemas
│   │   ├── services/          # Business logic (geo, pricing, distance)
│   │   ├── recommendation/    # Scoring engine, validator
│   │   └── ai/                # Gemini AI integration
│   ├── create_tables.py       # Database initialization
│   └── seed.py                # Mumbai demo data seeder
├── .env.example               # Environment template
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Maps | Leaflet.js + React-Leaflet (OpenStreetMap) |
| Charts | Recharts |
| Backend | FastAPI, Python 3.12 |
| Database | PostgreSQL (Neon Serverless) via AsyncPG |
| Cache | Redis (optional, graceful fallback) |
| AI | Google Gemini API (gemini-2.0-flash) |
| Validation | Pydantic v2, Async SQLAlchemy 2.0 |
| Dev Tool | Google Antigravity (Gemini AI coding assistant) |

---

## 🔒 Privacy & Safety

- Only anonymized data (user_id, category stats) sent to Gemini AI
- No personal info (emails, phones) in AI requests
- Full audit logging for every recommendation decision
- Gemini is optional — engine works 100% without it

---

## 👨‍💻 Team

**Prathmesh S** — Full Stack Developer

---

<div align="center">
  <sub>Built with ❤️ for the Paytm AI Hackathon</sub>
</div>
