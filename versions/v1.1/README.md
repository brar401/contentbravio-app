# McIver College — Logo Experience Lab

A source project for an interactive four-section logo-effects playground. Uses the **two McIver logo images from the previous conversation**, archived as originals and processed into clean alpha assets for rendering.

**Status (v1.1 — 30 October 2026):** React and JSX files have been syntax-parsed, the generated archive has been checked and the two original PNGs remain unchanged. **A full Vite build and browser/WebGL test could not be run here** because package downloads were unavailable. The project is **not yet publicly hosted**. It should be tested locally before deployment.

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
| React Three Fiber | True extruded emblem contours, smoothed side-wall shading, adjustable edge profile, optional convex rotating-sign backing, readable rear printing and drag-to-orbit | `@react-three/fiber` with Three.js `ExtrudeGeometry`, custom normals and oval backplate geometry |
| Liquid Logo | GPU-rendered fluid chrome, reflective highlights, transparent negative space, mouse-disturbed flow | **Custom WebGL port** inspired by [collidingScopes/liquid-logo](https://github.com/collidingScopes/liquid-logo). The upstream project is a standalone tool, not a standard npm React package. |
| Unlumen UI | Cinematic gallery, motion-spring cursor tilt, local spotlight and refractions | The public **[Unlumen UI Tilt primitive](https://github.com/leovvx/unlumen-ui-docs/blob/main/registry/primitives/tilt/index.tsx)** (MIT) ported from TSX to JSX; custom spotlight/gallery treatment is labelled as such. |
| Magic UI | Beam tracing, particle ambience and masked shimmer | Local adaptations of [Border Beam](https://magicui.design/docs/components/border-beam) and [Particles](https://magicui.design/docs/components/particles). **Not exact upstream component code.** |

### 3D rotation modes

- **Keep Upright:** drag left/right, model stays vertically upright (yaw-only). `Auto-rotate` performs full 360° yaw cycles without turning upside down.
- **Keep Text Readable:** the rear imprint is a **flat, separately oriented texture**, rotated 180° around the Y-axis. At 175–180° the words are readable rather than mirrored.
- **Signboard backing ON (default):** a closed, opaque physical oval separates the front and rear. The convex *front* is thickest at its centre and thinnest at its outside edge; the **rear is planar**, so its printing is thin and sharp. Crucially, you do not see the front lettering through the back.
- **Signboard backing OFF:** the original crest has transparent openings. This looks lighter, but **front lettering may show through from the rear**. This is physically normal for an open structure. Use backing ON when clean front/rear separation is the priority.
- **Edge thickness:** sets the straight centre band of the extruded letters and oval.
- **Rounded edge width / Edge sharpness:** independently control how pill-like or crisp the bevel looks.
- **Surface smoothness:** smooths normals across adjoining side panels and simplifies the traced oval's 1-pixel staircase. It does not blur the logo's printed front texture.
- **Side polish:** adjusts the roughness of metallic side walls.
- **Centre thickness / Outer rim thickness / Centre roundness:** control the signboard's sculpted front profile without changing the original oval artwork.
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

The original images were white-backed raster graphics; contour extraction does not claim perfect vector fidelity. The **precise raster silhouettes** are retained as textures on the front caps when original colours are enabled and as correctly oriented rear printing when Keep Text Readable is active. Source images are never overwritten. Do not distribute the McIver brand artwork as if it is open-source.

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

## New in version 1.1 — smooth signboard and control explanations

1. Smooth bevelled extrusion with adjustable **Edge thickness**, **Rounded edge width**, **Edge sharpness** and **Surface smoothness**. The original thin horizontal contour staircases have been reduced without inventing replacement text.
2. Physically curved oval signboard backing with independently adjustable **Centre thickness** and **Outer rim thickness**, plus a completely flat reverse for correctly oriented artwork. The front can have relief while the rear has only a clean printed texture.
3. When the opaque signboard is enabled, back/front lettering is **occluded rather than visibly doubled** at angles approaching 180°.
4. Every adjustable slider, colour picker, switch and preset in all four sections now offers an **eye-shaped help icon**. Hover, focus, or click/tap it for a plain-language explanation.
5. The previously confusing **ASSET INTEGRITY: PRESERVED** status now reads **ORIGINAL LOGOS: UNCHANGED**. It means the archived source images are preserved, not that effects are disabled.

### Useful starting settings

- **Clean, smooth metal:** Surface smoothness `0.9–1`, Side polish `0.20–0.35`, Rounded edge width `0.008–0.02`.
- **Rounded shop sign:** Enable Signboard backing; Centre thickness `0.15–0.25`, Outer rim thickness `0.02–0.04`, Centre roundness `0.6–0.9`.
- **Clean 180° reverse:** Keep Text Readable **ON**, Signboard backing **ON**, Keep Upright **ON**. Drag horizontally to `175–180°`.
- **Open transparent crest:** Switch Signboard backing **OFF**; note that see-through geometry may naturally reveal the opposite relief.

### Known limitations / next verification

- The new geometry and page controls have passed static JSX parsing, **not full runtime or visual regression testing**. Install dependencies with npm, start the app, and inspect 0°, 90°, 175° and 180° on your own GPU.
- Extremely high bevel widths can distort thin serifs; keep Rounded edge width under `0.025` for the most faithful typography.
- The signboard backing is a genuine new **custom Three.js mesh**; it is not part of the official source logo. It is fully optional.
