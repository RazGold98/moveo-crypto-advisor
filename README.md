# Moveo - AI Crypto Advisor

A personalized crypto investor dashboard. After signing up and answering a short
onboarding quiz, each user gets a daily dashboard with market news, live coin
prices, an AI-generated insight, and a fun crypto meme, tailored to their
preferences. Users give thumbs up/down feedback on each section, which is stored
for future recommendation improvements.

## Live demo

- **App (frontend):** https://moveo-crypto-advisor-five.vercel.app
- **API (backend):** https://moveo-crypto-advisor-sadc.onrender.com
- *Note: the backend runs on Render's free tier and sleeps after inactivity, so
  the first request after a while may take ~30-60s to wake up.*

## Features

- **Auth**, register (email, name, password) and login with JWT; passwords are
  hashed with bcrypt.
- **Onboarding quiz**, assets, investor type, and content preferences, saved to
  the database per user.
- **Daily dashboard**, four preference-aware sections:
  - Coin prices (CoinGecko)
  - Market news (CryptoCompare, with a static fallback)
  - AI insight of the day (Groq LLM, with a personalized fallback)
  - A dynamic crypto meme (meme-api, with a fallback)
- **Voting**, thumbs up/down per section, stored per user (one vote per section,
  upserted) for future model improvements.

## Tech stack

- **Frontend:** React + Vite + TypeScript, React Router, Axios
- **Backend:** NestJS (modular architecture, DI, guards, DTO validation)
- **Database:** MongoDB (Mongoose) on MongoDB Atlas
- **Auth:** JWT (Passport)

## Architecture

The React SPA talks only to our NestJS API over REST, sending a JWT on each
request. The API is split into feature modules (auth, users, dashboard, votes)
and is the only layer that holds secrets and talks to MongoDB and the external
crypto APIs. The dashboard endpoint aggregates the four sources in parallel and
tailors them to the user's saved preferences. Every external call degrades
gracefully to a fallback so one failing provider never breaks the page.

## Project structure

```
backend/    NestJS API (auth, users, dashboard, votes)
frontend/   React single-page app
```

## Local development

Prerequisites: Node.js 18+ and a MongoDB connection string (e.g. Atlas).

### Backend
```
cd backend
npm install
# create a .env file (see backend/.env.example)
npm run start:dev        # http://localhost:3000
```

### Frontend
```
cd frontend
npm install
# create a .env file (see frontend/.env.example)
npm run dev              # http://localhost:5173
```

## Environment variables

**backend/.env**

| Key | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `PORT` | Port for local dev (default 3000) |
| `GROQ_API_KEY` | Free Groq API key for the AI insight |
| `COINGECKO_API_KEY` | Free CoinGecko demo key (needed for prices from cloud IPs) |
| `NEWS_API_KEY` | *(optional)* CryptoCompare key; without it, news uses a static fallback |

**frontend/.env**

| Key | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend API |

## Deployment

- **Database:** MongoDB Atlas (free tier).
- **Backend:** Render (Root Directory `backend`, build `npm install --include=dev && npm run build`, start `npm run start:prod`).
- **Frontend:** Vercel (Root Directory `frontend`, Vite preset, `VITE_API_URL` set to the backend URL).

## Bonus - feedback storage & future model training

Every vote is stored as `{ userId, section, value (+1 / -1), createdAt }`. This
turns everyday user feedback into a labeled dataset that could power future
personalization without any change to the app's data flow. A realistic path:

1. **Collect**, votes accumulate per user and per content type, timestamped.
2. **Aggregate**, build per-user preference signals (e.g. this user upvotes news
   but downvotes memes; HODLers engage more with insights than day traders).
3. **Improve recommendations**, feed these signals into ranking: prioritize the
   sections and asset topics a user tends to upvote, and de-emphasize what they
   downvote. The onboarding preferences give a cold-start prior; votes refine it
   over time.
4. **Improve the AI insight**, aggregated upvote/downvote patterns on insights
   can guide prompt tuning, or serve as preference pairs to fine-tune / align a
   model (RLHF-style) toward the styles users actually value.
5. **Close the loop**, A/B test changes and keep measuring vote rates to confirm
   the model is improving, retraining periodically as more feedback arrives.

The current schema (a timestamped, per-user, per-section signal) is exactly the
shape such a pipeline needs, so no data-model changes would be required to begin.
