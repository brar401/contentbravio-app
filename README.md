# McIver College — Logo Experience Lab

A source project for an interactive four-section logo-effects playground. Uses the **two McIver logo images from the previous conversation**, archived as originals and processed into clean alpha assets for rendering.

**Status:** source built and asset processing verified. The npm build and complete browser runtime **have not been verified in this sandbox** because npm registry access was unavailable. The project is **not yet publicly hosted**. Do not describe it as deployed.

## Start on Windows

1. Install **Node.js 22 LTS** from https://nodejs.org/ if needed.
2. Unzip the project and double-click **`start-lab.bat`**.
3. Your browser should open the local Vite app (normally `http://localhost:5173`).

Or from PowerShell:

```powershell
cd path\to\mciver-logo-lab
npm install
npm run dev
```

For a production build:

```powershell
npm run build
npm run preview
```

## Four intentionally different sections

| Section | Main technique | Implementation |
| --- | --- | --- |
| React Three Fiber | True extruded emblem contours, gold/burgundy metal/glass/hologram materials, rear-facing legible text, drag-to-orbit | `@react-three/fiber` with Three.js `ExtrudeGeometry` and contour data traced from the original images |
| Liquid Logo | GPU-rendered fluid chrome, reflective highlights, transparent negative space, mouse-disturbed flow | **Custom WebGL port** inspired by [collidingScopes/liquid-logo](https://github.com/collidingScopes/liquid-logo). The upstream project is a standalone tool, not a standard npm React package. |
| Unlumen UI | Cinematic gallery, motion-spring cursor tilt, local spotlight and refractions | The public **[Unlumen UI Tilt primitive](https://github.com/leovvx/unlumen-ui-docs/blob/main/registry/primitives/tilt/index.tsx)** (MIT) ported from TSX to JSX; custom spotlight/gallery treatment is labelled as such. |
| Magic UI | Beam tracing, particle ambience and masked shimmer | Local adaptations of [Border Beam](https://magicui.design/docs/components/border-beam) and [Particles](https://magicui.design/docs/components/particles). **Not exact upstream component code.** |

### 3D rotation modes

- **Keep Upright:** drag left/right, model stays vertically upright (yaw-only). `Auto-rotate` performs full 360° yaw cycles without turning upside down.
- **Keep Text Readable:** the **rear imprint is a separate mesh rotated 180°**, so it is correctly readable when viewed from behind, rather than flipping the whole model.
- **Free Rotation Mode:** drag for pitch/yaw; **Shift + drag** for roll. The upright lock is disabled while free rotation is active.
- Pause/resume, reset, depth and material controls are independent of the other sections.

Note: 360° **physical** rotation is implemented in the React Three Fiber section because the other three libraries are designed for *2D shader/image and UI interaction*, not true geometry. Their unique interactions deliberately remain distinct.

## The two original images and derivatives

```
public/logos/original/without.png  ← archived source; no modification
public/logos/original/with.png     ← archived source; no modification
public/logos/without.png          ← derived transparent/antialiased image
public/logos/with.png             ← derived transparent/antialiased image
public/geometry/without.json      ← vector-style contour data for 3D sidewalls
public/geometry/with.json         ← vector-style contour data for 3D sidewalls
```

The original images were white-backed raster graphics; contour extraction does not claim perfect vector fidelity. The **precise raster silhouettes** are retained as textures on the front and rear 3D caps when original colours are enabled. Source images are never overwritten. Do not distribute the McIver brand artwork as if it is open-source.

## Rebuild the transparent logos and 3D contour data (optional)

The generated files are included. Regeneration is only needed if you replace the source artwork. From the repository root, install the optional Python dependencies and run:

```powershell
python -m pip install -r tools/requirements.txt
python tools/regenerate_logo_assets.py
```

The original artwork is never modified. Always inspect derived output before publishing.

## Publish on GitHub Pages (after testing locally)

1. Create a **new public repository** (e.g., `mciver-logo-lab`) on GitHub.
2. Upload the project files to the repository's **`main`** branch. Upload the project contents, not the outer ZIP folder.
3. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. The supplied `.github/workflows/deploy-pages.yml` builds and publishes the site. Open the workflow under **Actions** to confirm success. URL will resemble `https://YOUR-GITHUB-USERNAME.github.io/mciver-logo-lab/`.

This app uses relative URLs and `base: './'` for project subpaths. If you publish it with Vercel or Netlify, use build command `npm run build`, output directory `dist`.

## Design/technical attribution

- React Three Fiber: https://r3f.docs.pmnd.rs/
- Three.js ExtrudeGeometry: https://threejs.org/docs/pages/ExtrudeGeometry.html
- Liquid Logo: https://github.com/collidingScopes/liquid-logo (MIT)
- Unlumen UI: https://ui.unlumen.com/ (free/Pro components; locally adapted behaviour)
- Magic UI: https://magicui.design/ (free/Pro components; locally adapted behaviour)

Original McIver College artwork remains McIver College branding. Custom lab code is for the requested demonstration. No proprietary components are embedded. Google Fonts are loaded from the web; system font fallback works if offline. A WebGL-capable browser is needed for 3D/shader sections.
