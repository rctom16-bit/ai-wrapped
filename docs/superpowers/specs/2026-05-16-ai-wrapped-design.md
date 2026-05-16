# AI Wrapped — Design Spec

**Date:** 2026-05-16
**Status:** Draft awaiting user approval
**Name:** AI Wrapped

---

## Overview

A single-page website where anyone can drop in their ChatGPT and/or Claude export file and instantly get a beautiful, scrollable "year in review" of their AI conversations — similar in vibe to Spotify Wrapped. Everything runs in the visitor's browser; no data is ever uploaded or sent to a server. The visitor can save a clean PNG share card to post on social.

The repo is published on GitHub and the site is hosted free on GitHub Pages.

## Goals

- **For visitors:** A 60-second "wow, this is fun" experience that's screenshot-worthy and easy to share.
- **For the project owner:** A portfolio-worthy, viral-capable open-source project that's genuinely useful and showcases clean code.
- **For privacy-conscious users:** Total confidence that their chat data never leaves their device.
- **For the GitHub audience:** A clean, well-documented parser for both ChatGPT and Claude exports that other developers can fork and learn from.

## Non-goals

- Storing or syncing user data anywhere.
- Editing or managing conversations.
- AI-generated commentary on conversations (no LLM calls — too slow, breaks privacy story, adds cost/keys).
- Mobile app (the site is mobile-responsive, but no native app).
- Account system, login, or any backend.
- Importing other AI tools beyond ChatGPT and Claude in v1 (Gemini etc. can come later).

---

## The visitor experience

### Landing page
- One bold headline: "Your year in AI conversations."
- Privacy promise front and center: "100% in your browser. Nothing leaves your device. No upload. No account."
- Two big drop zones: "ChatGPT export" and "Claude export" — visitor can use either or both.
- A short "How do I get my export?" expandable section with screenshots for each service.
- Subtle "View on GitHub" link in the footer.

### Loading
- A short playful animation while the browser parses the file (typically <2 seconds, even for large exports).
- A reassuring progress message ("Reading your chats… still local, still private").

### The report — scrollable slides

Each slide is full-screen on mobile, large card on desktop. Bold colors, big numbers, gradient backgrounds.

1. **The Numbers** — Total conversations. Total messages. Words you wrote vs. words the AI wrote. Hours of your life spent chatting (estimated from message count).
2. **Your Rhythm** — A calendar heatmap of when you chat (mornings vs. nights, weekdays vs. weekends). Peak hour ("you're a 11pm person"). Longest streak of consecutive days.
3. **What You Talk About** — Top 5 topics (Cooking, Code, Travel, Relationships, Dogs, etc.) as colorful pills with relative sizing.
4. **Your AI Personality** — One auto-detected archetype (e.g., *The Night Coder*, *The Recipe Hunter*, *The Curious Polymath*) with a one-line description. This is the social hook.
5. **ChatGPT vs. Claude** — Only shown if both files uploaded. Quick comparison: which you use more, which you reach for what topic.
6. **The Highlights** — Longest single conversation (length only, no content). Most common opening phrase ("Can you help me…", "Write a…"). Busiest day of the year.
7. **Share Card** — A "Save your card" button generates a clean PNG (1080×1920 for stories, 1080×1080 for square) with aggregated stats only. No conversation content ever appears in the share card.

### What never appears anywhere visible
- Actual message text from conversations.
- Conversation titles in the share card.
- Anything that could leak sensitive info if someone screenshots and posts.

---

## Privacy model (the key differentiator)

- **No backend.** The site is static HTML/CSS/JS. Nothing to send data to even if we wanted to.
- **No analytics that touch data.** If we add usage analytics, they record page views only (no parsed content).
- **No third-party calls during parsing.** No fonts/scripts that could exfiltrate. All processing libraries are bundled.
- **Verifiable.** The repo is public; anyone can audit the code and confirm nothing leaves the browser. The site is built and deployed from the same repo via GitHub Pages (transparent build).
- **Privacy promise is a marketing feature, not boilerplate.** The landing page leads with it. The README features it prominently.

---

## Technical approach (high level)

Detailed implementation will come in the plan doc. This section is just enough context for the user to understand what we're building with.

- **Static site** (HTML/CSS/JS), no backend, no build step or a minimal one (Vite).
- **Hosted on GitHub Pages** from the repo's `main` branch.
- **Parsing:** Read the dropped file with the browser's FileReader API. Parse the JSON in a Web Worker so the UI never freezes for large exports.
- **Topic detection (v1):** Curated keyword-category dictionary (~15 categories like Code, Cooking, Travel, Relationships, Work, Health, etc.). Match user-message words against categories; count and rank. Fast, reliable, no ML model to ship.
- **AI Personality detection:** Rule-based scoring across ~15 archetypes. Each archetype has a small predicate (e.g., "code is top topic AND peak hour > 22:00 → Night Coder"). Easy to extend.
- **Visualizations:** Lightweight — vanilla canvas for the heatmap, simple animated counters for numbers, CSS for pills. Probably no chart library needed.
- **Share card generation:** Render an offscreen element styled as the card, capture with `html2canvas` (or canvas API directly), trigger a PNG download.
- **Cross-format support:** A small adapter layer turns both ChatGPT's and Claude's export shapes into a single internal `Conversation[]` model. The rest of the app works against that model only.

---

## What the GitHub repo looks like

- `README.md` with screenshots, the privacy story, "Try it" link, and a clean "How it works" section.
- `LICENSE` — MIT (permissive, encourages forks).
- `index.html` + `src/` for code.
- `docs/` for the spec and design notes.
- A "How to add a new archetype" guide in `CONTRIBUTING.md` — invites contributions (people love submitting their own archetypes).
- Sample anonymized export files for testing.

---

## Decisions

1. **Name:** AI Wrapped.
2. **Time range:** Last 12 months by default. (No toggle in v1 — keep it simple.)
3. **Visual direction:** Bold and playful — Spotify-Wrapped energy. Gradient backgrounds, big numbers, animated transitions between slides.
4. **Analytics:** A single privacy-respecting page-view counter (Plausible or a similar cookie-free, GDPR-friendly service). Counts visits only — never touches parsed data. Disclosed honestly in the README and on the landing page.

---

## Success criteria

- We can ship a usable v1 to GitHub Pages in 2–3 working sessions.
- A non-technical visitor can land, drop a file, see their report, and save a share card in under 90 seconds.
- The privacy claim is verifiable from source.
- Code is clean enough that a developer browsing the repo would consider starring it as a reference for parsing AI exports.

## Timeline (rough)

- **Session 1:** Implementation plan written. Repo scaffolded. Parsers for ChatGPT + Claude built and tested against real exports.
- **Session 2:** Slides built, styled, animated. Topic and personality logic. Share card generation.
- **Session 3:** Polish, README, deploy to GitHub Pages, walk user through publishing.
