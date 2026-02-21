# AcronymDrill

Personal study app for CompTIA Security+ SY0-701 acronyms.

## What it does
- Trains you on all ~200 official SY0-701 acronyms
- Tracks your mastery per acronym, by domain, by category
- Three modes: Training (cards), Normal Test, Hard Mode
- PWA — installs on iPhone via Safari "Add to Home Screen"
- Syncs progress across devices via Firebase

## Stack
Next.js 14 · TypeScript · Tailwind CSS · Firebase · Anthropic Claude API

## Local Development

### Prerequisites
- Node.js 20+
- WSL (Windows Subsystem for Linux) or macOS/Linux

### Setup
1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in your keys
3. Install dependencies:
   ```
   npm install
   ```
4. Run development server:
   ```
   npm run dev
   ```
5. Open http://localhost:3000

### Environment Variables
See `.env.local.example` for required variables.
Firebase config values come from Firebase Console → Project Settings → Your apps.
Anthropic API key from console.anthropic.com.

## Deploy
Deployed to Vercel. Push to main branch triggers automatic deployment.

## Study Notes
This app is for personal use only. Not affiliated with CompTIA.
