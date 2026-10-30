# McIver College — Logo Experience Lab v1.4

**Download / open locally:** A React 19 + Vite interactive demonstration with two original college logos, four visual-library tabs and three interactive React Three Fiber showrooms.

## Windows quick start

1. Install Node.js 22+ from https://nodejs.org/ if needed.
2. Extract the ZIP. Double-click `start-lab.bat`.
3. Open the address shown by Vite, usually `http://localhost:5173`.

PowerShell alternative:

```powershell
cd C:\path\to\mciver-logo-lab
npm install
npm run dev
```

Build for deployment:

```powershell
npm run build
npm run preview
```

The GitHub Pages workflow is in `.github/workflows/deploy-pages.yml`. Vercel/Netlify: build command `npm run build`, output folder `dist`.

## Explore the lab

| Tab | Primary capability | Website showcase |
| --- | --- | --- |
| React Three Fiber | True 3D extruded logo, taper, smooth sides, front/rear views, studio lights, Glass/Metal | Switchable two-car showroom, sneaker configurator and two-floor interior explorer |
| Liquid Logo | Original custom WebGL liquid-shader adaptation | Fluid website, liquid CTA, theme colours, interactive layout |
| Unlumen UI | Spring-tilt primitive, pointer spotlight, radius and background blend | Editorial store, interactive hover cards, favourites and navigation |
| Magic UI | Local border-beam, orbit, shimmer, particle treatments | Animated SaaS page, bento grid, counters, pricing and buttons |

**Preserved originals:** `public/logos/original/without.png` and `public/logos/original/with.png`. Separately derived transparent versions and traced 3D contour geometry are supplied for rendering.

**Glass update:** In React Three Fiber, opacity 0 gives highly clear optical glass, with transmissive sidewalls as well as front surfaces. On Metal and other presets, opacity is conventional alpha transparency. See `UPDATE-NOTES-v1.4.md` for technical details.

**Unlumen update:** Card radius is applied to all visible layers and the shadow; new **Card surface blend** and **Frosted blur** controls allow adjustment against the global studio background.

**Showroom models:** The built-in 3D models are original source-based procedural meshes and work offline. Optional Khronos public `.glb` models are selected under **3D asset source** and load over the internet. They are **not bundled**, to keep the ZIP small. Credits/licences are in the UI and update notes. An online model can take time to load and may fall back to the built-in alternative if unavailable.

**Implementation honesty:** React Three Fiber and the vendored Unlumen Tilt primitive are genuine code from those technologies. Liquid Logo and Magic UI visuals are independently coded local adaptations, not official bundled packages or premium proprietary components. The demos use local-only form/commerce states and do not transact or subscribe anyone.

## Testing limitation

The source has been statically checked for JSX/JS and CSS syntax, but dependencies were not available to do `npm run build` or inspect the full WebGL application here. Run on your PC for the final visual check, particularly material changes and Unlumen rounded corners.

For older changes, see `UPDATE-NOTES-v1.1.md`, `UPDATE-NOTES-v1.2.md`, and `UPDATE-NOTES-v1.3.md`.
