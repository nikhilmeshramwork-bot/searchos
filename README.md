# SearchOS

**An evidence-led control plane for a more disciplined job search.**

![SearchOS social preview](public/og.png)

SearchOS turns a scattered application process into a visible, reviewable
workflow. It brings job intake, fit scoring, evidence selection, approval gates,
and pipeline tracking into one product.

This repository contains the runnable product prototype and a recruiter-facing
portfolio route. The current MVP is intentionally local-first: it uses
deterministic scoring and browser storage, making every recommendation
inspectable and keeping the final decision with the applicant.

## The problem

High-volume job applications tend to fail in predictable ways:

- roles are pursued without a consistent fit test;
- resumes and outreach drift away from verified evidence;
- application status disappears across tabs and spreadsheets;
- automation encourages volume while removing human judgment.

SearchOS treats the job search as an operating system rather than a form-filling
exercise.

## What it does

- Captures a role and job description.
- Scores fit against a verified skills and evidence library.
- Separates strong, medium, and weak opportunities.
- Maintains a human approval queue before any application action.
- Tracks applications through a visible pipeline.
- Manages a product evidence library with public/draft controls.
- Provides a dedicated recruiter portfolio at `/portfolio`.
- Persists edits locally in the browser.

## Product principles

1. **Evidence before claims** — metrics and products must be verified.
2. **Human approval before action** — the system prepares; the user decides.
3. **Explainable scoring** — the MVP avoids opaque ranking.
4. **Quality over volume** — poor-fit applications are deprioritized.
5. **Drafts stay private** — unverified products are not shown publicly.

## Current scope

The prototype demonstrates the workflow and interaction model. It does not
submit applications, scrape job boards, or call an external AI service. Those
integrations belong behind explicit permission, privacy controls, and review
gates.

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production build:

```bash
npm run build
npm start
```

## Technology

- Next.js
- React
- TypeScript
- Tailwind CSS
- Local browser storage

## Product direction

Planned extensions include role-source connectors, structured resume variants,
approval-based outreach generation, analytics on conversion by channel, and
AI-assisted tailoring constrained to a verified evidence library.

## About

Designed and built by **Nikhil Meshram**, a Product Operations and AI Workflow
Builder with experience across logistics, B2B operations, workflow design, and
cross-functional execution.

- [LinkedIn](https://www.linkedin.com/in/nikhilmeshram31)
- [GitHub profile](https://github.com/nikhilmeshramwork-bot)

This public repository is shared for portfolio review. No license is granted for
commercial reuse.
