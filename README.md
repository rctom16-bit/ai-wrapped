# AI Wrapped

> Your year in AI conversations, beautifully — 100% in your browser.

**Try it:** https://rctom16-bit.github.io/ai-wrapped/

Drop in your ChatGPT and/or Claude export and get a fun, shareable year-in-review. Nothing is uploaded. Nothing is stored. The page never talks to a server about your data.

## What it shows you

- How many conversations and messages you had
- When you talk to AI (peak hour, calendar rhythm, longest streak)
- Your top topics (Code, Cooking, Travel, Relationships, …)
- Your **AI Personality** — *The Night Coder*, *The Recipe Hunter*, *The Curious Polymath*, and more
- A side-by-side if you use both ChatGPT and Claude
- A downloadable share card (PNG) with stats only — never any of your actual chat content

## How to get your export

- **ChatGPT** — Settings → Data Controls → Export data → confirm via email → unzip → grab `conversations.json`.
- **Claude** — Settings → Privacy → Export data → confirm via email → unzip → grab `conversations.json`.

Drop the JSON file (or both) into the page and scroll.

## Why it's private

- **No backend.** The repo is a static site on GitHub Pages.
- **Your file stays local.** The browser's File API reads it; JavaScript parses it in memory. There is no upload.
- **Audit the source.** Search the repo — there are no `fetch` calls that touch your conversation data.
- **Verifiable build.** The deployed site is built from this exact repo via GitHub Actions.

## Analytics

This site uses [GoatCounter](https://www.goatcounter.com/) — a privacy-respecting, cookie-free, GDPR-friendly visitor counter. It counts page views only. It never sees, touches, uploads, or stores anything from your conversation files. Those stay on your device.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # produces dist/
npm run preview  # serve the built bundle
```

## Add your own AI Personality

See [CONTRIBUTING.md](CONTRIBUTING.md). It takes about five minutes.

## License

MIT.
