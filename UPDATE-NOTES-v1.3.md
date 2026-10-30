# McIver College Logo Experience Lab v1.3 — Studio controls and preview layout

## Changed (implemented)

- Global studio backdrop picker: Midnight, Onyx, Ocean, Burgundy, Forest, Ivory, plus custom hex colour.
- Gradient background switch.
- Five lighting presets: Gallery, Softbox, Dramatic, Neon and Daylight.
- Key light, fill light, rim light, lamp colour, rim colour, and light-direction controls.
- Physical lighting controls affect the real 3D logo in React Three Fiber. The remaining tabs use the backdrop/colours as atmospheric design treatments, **not** actual 3D lamps.
- Optional 3D studio floor, off by default.
- Quick palette button at the top of the preview cycles studio background swatches.
- Settings panel scrolls independently on desktop, with the 3D preview sticky while scrolling the full work area. Mobile and tablet keep a natural stacked layout.
- Studio settings are kept when switching tabs and included in Export all settings.
- All new controls provide plain-language eye-icon hints.
- Both official original logo PNGs and their derived geometry are unmodified from v1.2.

## Proposed for v1.4 (awaiting selection)

- R3F: product configurator, vehicle/gallery turntable, architectural walkthrough, or interactive clothes showcase.
- Liquid Logo: full shader playground with text, buttons, hero transitions, and before/after shader comparison.
- Unlumen: premium portfolio, ecommerce/product cards, interactive navigation, and motion-driven forms.
- Magic UI: full SaaS landing page with animated hero, bento grid, buttons, steps, and ambient background.

## Notes

Use `start-lab.bat` on Windows, or `npm install` and `npm run dev` from the project directory. Requires Node.js and network access on first installation.

Source syntax was checked statically; a full interactive WebGL browser run must still be performed locally. Visual behaviour may vary with browser/GPU.
