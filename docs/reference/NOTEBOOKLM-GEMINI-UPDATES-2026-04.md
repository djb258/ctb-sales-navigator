# NotebookLM + Gemini Updates — April 2026
## Source: https://youtu.be/6YWPGjqOEmk
### What changed and what it means for the gate video pipeline

---

## Key Updates

### 1. Notebooks Inside Gemini Chats
- In Gemini, click + → More Uploads → Notebooks
- Insert any notebook into any Gemini chat
- Gemini can then create anything from that notebook: research papers, images, blog posts, scripts
- **Way faster** than generating artifacts inside NotebookLM directly

### 2. Notebooks in Gems
- Gems = custom agents inside Gemini (like GPTs)
- Under Knowledge → + → add notebooks
- Build a Gem with your notebook as its knowledge base
- The Gem responds grounded in YOUR content

### 3. Cinematic Videos (Veo 3.1)
- NotebookLM now creates full cinematic videos with motion graphics
- Uses Veo 3.1 under the hood
- Old way: slideshow with audio overlay
- New way: actual motion graphics, professional quality
- Veo 3.1 Light: 5 cents per output (cheapest video model)

### 4. Chat Customization per Notebook
- Configure how NotebookLM responds: role, response length, context
- Different config per notebook (school project vs work project)

### 5. Better Infographics
- Choose visual type, detail level, orientation
- More control over output format

### 6. Memory Import from Other LLMs
- Settings → Import Memory from Gemini
- Copy prompt → paste into Claude/ChatGPT/Grok → get response → paste back into Gemini
- Gemini absorbs context from other AI interactions

### 7. Import Chats from ChatGPT
- ChatGPT → Settings → Data Controls → Export
- Upload zip file into Gemini
- Full context transfer

### 8. Google Workspace Flows
- `flows.workspace.google.com`
- Automation builder: triggers (schedule, email, form) → AI skills (summarize, extract, decide) → actions (Gmail, Calendar, Sheets, Drive, Docs, Tasks)
- Template library or custom builds
- Example: "Catch me up on yesterday" → reads email + calendar → sends summary via chat

### 9. New Models in Google AI Studio
- Gemma models (small, can run offline/on-device)
- Gemini 3.1 Flash Live Preview (better latency, real-time dialogue, multimodal awareness)
- Veo 3.1 Light (5¢/output)

---

## What This Means for Our Pipeline

### The Old Approach (documented in LBB)
1. Create notebook in NotebookLM
2. Add sources
3. Generate artifacts (10-45 min per artifact)
4. Download via Chrome DevTools MCP
5. Upload to CF Pages

### The New Approach
1. Create notebook in NotebookLM with prospect data as sources
2. Insert notebook into Gemini chat
3. Ask Gemini to generate gate video script (fast — seconds, not minutes)
4. Use NotebookLM cinematic video (Veo 3.1) for the actual render
5. Download → R2 → CF Pages

OR even simpler:
1. Build a **Gem** with the sales content notebooks as knowledge
2. For each prospect: open the Gem, provide prospect data, ask for gate script
3. Render cinematic video in NotebookLM
4. Download → R2 → CF Pages

### The Tool
- **Chrome DevTools MCP** controls everything
- Already logged in as `dbarton@svg.agency` with Workspace AI Expanded Access
- No additional MCP servers needed
- One tool, all of Google's AI stack

---

## Transcript Summary

The video (by a NotebookLM power user) walks through all the April 2026 updates. The core insight is that NotebookLM notebooks are now a **data source type** inside Gemini — not a separate product. You work in Gemini (fast, multimodal, can generate anything) with notebooks providing the grounded knowledge base. NotebookLM's own UI is still useful for cinematic video rendering (Veo 3.1) and specialized artifacts, but the heavy content generation moves to Gemini.

The presenter hints at an unrevealed feature ("early access, can't talk about it yet, hoping by end of week") that he says is "pretty crazy." Worth watching for follow-up.

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-04-07 |
| Source Video | https://youtu.be/6YWPGjqOEmk |
| Account | dbarton@svg.agency (Workspace AI Expanded Access) |
| Version | 1.0.0 |
