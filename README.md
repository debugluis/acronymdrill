# AcronymDrill

**Live:** https://acronymdrill.vercel.app

AcronymDrill is a mobile-first PWA built to drill every acronym on the CompTIA Security+ SY0-701 exam. The app tracks how well you know each acronym individually — not just your overall score — and surfaces the ones you keep getting wrong. The more you miss something, the more it shows up. Over time, the weak spots shrink and your mastery score climbs toward exam-ready.

It works as a study companion for the last few weeks before the exam: quick training sessions on your phone, adaptive tests that punish guessing, and AI-generated explanations when something doesn't click.

## Features

- **311 acronyms** across all 5 SY0-701 domains
- **Training mode** — swipe cards (left = practice, right = confident), random or reinforcement-focused
- **Test mode** — 6 question types (MCQ, true/false, match pairs, fill-in-blank, scenario), 20/35/50 questions
- **Hard mode** — weighted selection by weakness score, harder question type distribution
- **Progress tracking** — mastery levels, weakness scores, streak, domain breakdown
- **AI explanations** — per-acronym explanation via Claude API (authenticated)
- **PWA** — installable on iOS (Safari) and Android (Chrome), offline-capable

## Stack

Next.js 14 · TypeScript · Tailwind CSS · Firebase Auth + Firestore · Anthropic Claude API · Vercel

---

*Personal study tool. Not affiliated with CompTIA.*
