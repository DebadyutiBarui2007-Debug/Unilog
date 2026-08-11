# 📦 Unilog Product Intelligence & AI Enrichment Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38Bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

An enterprise-grade, full-stack catalog intelligence and product enrichment platform powered by **Google Gemini AI**, TypeScript, React 18, Express, and Firebase. Designed for automated UNSPSC taxonomy matching, batch catalog enrichment, recursive learning workflows, and rigorous audit trails.

---

## 🌟 Key Capabilities

- **Catalog Batch Enrichment Engine**: High-throughput bulk intelligence transformation across supplier lines with real-time confidence scores, auto-approval thresholds ($\ge90\%$), and manual review queues.
- **Recursive Learning Studio**: Advanced multi-layer neural prompt orchestration, feedback loops, and RAG tracing.
- **Multi-Modal AI Workspace**: Real-time voice interaction via WebSockets (`gemini-3.1-flash-live-preview`), multimodal search, image analysis, and audio transcription.
- **Traceability & System Audit Trail**: Immutable logging of pipeline transactions, model latencies, token consumption, and governance checks.
- **System Health Dashboard**: Real-time telemetry monitoring service latency, database cluster heartbeat, memory allocation, and active throughput metrics.
- **Engine & Governance Configuration**: Fine-grained controls for classification confidence thresholds, auto-approval policies, and safety filters.
- **Security & Profile Management**: Secure Firebase Authentication with email/password authentication, password recovery, robust session tracking, and account data purge capabilities.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide React Icons, Recharts (analytics & metrics), Motion (smooth animations & transitions).
- **Backend**: Express.js server bundled via `esbuild` supporting real-time WebSocket communication and secure API route proxying.
- **AI Integration**: `@google/genai` SDK executing server-side Gemini queries (`gemini-2.5-flash` and `gemini-3.1-flash-live-preview`).
- **Persistence**: Firebase Firestore and Firebase Auth with secure security rules.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ installed
- npm or bun

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/unilog-product-enrichment.git
cd unilog-product-enrichment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and configure your keys:
```bash
cp .env.example .env
```
Add your credentials in `.env`:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Deployment

### Build Command
```bash
npm run build
```
This compiles the client via Vite and bundles the server entry point (`server.ts`) into a standalone optimized CJS bundle (`dist/server.cjs`).

### Start Production Server
```bash
npm run start
```

---

## ☁️ Deployment Guides

### 🐳 Docker & Google Cloud Run
This project includes a production-ready `Dockerfile`.
```bash
docker build -t unilog-product-enrichment .
docker run -p 3000:3000 -e GEMINI_API_KEY="your-key" unilog-product-enrichment
```
For Google Cloud Run, push to Artifact Registry and deploy with `--port 3000`.

### 🚀 Render
1. Connect your GitHub repository to Render.
2. Render automatically detects `render.yaml`.
3. Set `GEMINI_API_KEY` in the Environment Variables dashboard.

### ▲ Vercel / Netlify
Static export & serverless functions configured via `vercel.json` and `netlify.toml`.

---

## 🛡️ License

This project is licensed under the MIT License.
