# MTG Proxy Generator

Local web app to create custom Magic: The Gathering proxy cards with AI art generation via Stable Diffusion.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Card Editor
- **Scryfall import** — search and import any card by name (name, type line, rules text, mana cost, P/T, artist)
- **Nickname system** — display a custom name on the card with the real name shown smaller below
- **Mana symbols** — renders W, U, B, R, G, C, X, T and numeric symbols inline in rules text and mana cost
- **Custom mana images** — upload your own images per symbol with 3-tier priority: custom → default → SVG fallback
- **Rules text formatting** — bold (`**text**`) and italic (`*text*`) with toolbar buttons; justified text toggle
- **Toggle rules text** — hide rules text entirely (useful for tokens and emblems)
- **Flavor text** — rendered in italic below the rules text
- **P/T display** — power/toughness with sword and shield icons for creature cards
- **PNG export** — high-resolution export (~1200 DPI) via `html-to-image`

### Art Controls
- **Image upload** — drag & drop or click to upload JPG, PNG, WebP
- **Position & zoom** — horizontal/vertical position sliders + zoom
- **Overlay gradient** — control start position, transition zone width, and maximum darkness independently
- **Image adjustments** — brightness, contrast, saturation

### AI Art Generation (Stable Diffusion)
- **Basic mode** — style presets (Epic Fantasy, Dark, Creature, Landscape, Mythic, Artifact) with artist references
- **Advanced mode** — full manual control: prompt, negative prompt, steps, CFG scale, sampler, clip skip, seed
- **LoRA support** — browse available LoRAs from SD, toggle per LoRA with individual weight slider (0.1–1.5)
- **Hires.fix** — upscale after generation with configurable target size, steps, denoise strength and upscaler
- **Resolution presets** — landscape (768×512, 960×640, 1024×576), square (512×512) and portrait options
- **Connectivity test** — ping button to verify SD connection before generating

---

## Installation

Download the latest installer from [Releases](../../releases):

- **`MTG Proxy Generator_x.x.x_x64-setup.exe`** — Windows installer (recommended)
- **`MTG Proxy Generator_x.x.x_x64_en-US.msi`** — Windows MSI package

No additional software required. The app runs standalone on Windows 10/11.

> For AI art generation, Stable Diffusion WebUI Forge must be running separately — see [Stable Diffusion Setup](#stable-diffusion-setup) below.

---

## Requirements (for development)

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (for building the desktop app)
- [Stable Diffusion WebUI Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge) (optional, for AI art generation)

### Recommended SD Models (SD 1.5)
- **DreamShaper 8** — general fantasy illustration
- **Deliberate** — detailed painterly style
- **ReV Animated** — anime/fantasy hybrid

> Only SD 1.5 and SDXL base models are compatible with Forge. Models based on ZImageBase, Flux or SD3 are not supported.

---

## Development Setup

```bash
# Install dependencies
npm install

# Start web dev server
npm run dev

# Start desktop app (Tauri)
npm run tauri:dev
```

Open [http://localhost:5173](http://localhost:5173)

### Stable Diffusion Setup

1. Launch Forge with the following flags:
   ```
   --api --cors-allow-origins=*
   ```
   In `webui-user.bat`:
   ```bat
   set COMMANDLINE_ARGS=--api --xformers --cors-allow-origins=*
   ```

2. Place checkpoint models in:
   ```
   stable-diffusion-webui-forge/models/Stable-diffusion/
   ```

3. Place LoRA models in:
   ```
   stable-diffusion-webui-forge/models/Lora/
   ```

4. Place upscaler models (ESRGAN) in:
   ```
   stable-diffusion-webui-forge/models/ESRGAN/
   ```

---

## Build

```bash
# Web only
npm run build

# Desktop installer (requires Rust)
npm run tauri:build
```

Web output goes to `dist/`. Desktop installers go to `src-tauri/target/release/bundle/`.

---

## Project Structure

```
src/
  MTGProxyGenerator.jsx   # Main component (all UI and logic)
public/
  symbols/                # Default mana symbol images (W U B R G C T)
  favicon.svg
index.html
```

---

## License

MIT
