# Kraken Tools

A collection of lightweight, server-hosted web tools and utilities built to integrate directly into [Kraken Launcher](https://github.com/rendomnet/tauri-app).

## Architecture

1. **Manifest Catalog (`manifest.json`):**
   - The master index mapping game identifiers (`slay-the-spire-2`, `world-of-warcraft`, etc.) to available tools.
   - Kraken fetches this file via jsDelivr CDN (`https://cdn.jsdelivr.net/gh/rendomnet/kraken-tools@main/manifest.json`) once on boot and caches it in memory.
2. **Independent Deployment (GitHub Pages):**
   - Each tool lives under `tools/<game-id>/<tool-name>/`.
   - On git push to `main`, GitHub Actions automatically deploys the latest static tools to GitHub Pages.
   - Tools can be updated or added at any time without releasing new versions of Kraken or resubmitting Chrome extension packages.
3. **Embed Mode (`?embed=kraken`):**
   - When loaded inside Kraken's Game Details iframe, tools detect `?embed=kraken` to automatically hide external headers/footers and harmonize with Kraken's dark theme tokens.

## Available Tools

- **Slay the Spire 2 — Deck & Synergy Planner** (`tools/slay-the-spire-2/deck-builder/`):
  - Interactive card catalog for Ironclad, Silent, and Necrobinder.
  - Deck builder with energy curve stats and attack/skill/power distribution.
  - Deck code export and import.

## Adding a New Tool

1. Create a new folder under `tools/<game-id>/<tool-name>/`.
2. Add your static files (`index.html`, `style.css`, `app.js`). Support `?embed=kraken` if you want it cleanly embedded in the launcher.
3. Register the tool entry in `manifest.json`.
4. Open a pull request or push to `main`.
