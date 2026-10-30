# McIver College — Logo Experience Lab v1.2

Four interactive themed labs built from the **original McIver College logos with and without the tagline**. v1.2 is an update to the existing project, not a redesigned logo.

## Start on Windows

1. Install Node.js 22+ from https://nodejs.org/.
2. Extract the ZIP and double-click `start-lab.bat`.
3. Open the local URL shown in the terminal (normally http://localhost:5173/).

From PowerShell:

```powershell
cd path\to\mciver-logo-lab
npm install
npm run dev
```

To build: `npm run build` and `npm run preview`.

## What changed in v1.2

### React Three Fiber — open double-sided 3D, no backing

- **Removed** the solid signboard backing, oval plate geometry and associated controls.
- The front and the back each use *real* Three.js extruded logo geometry; the rear is oriented so that the text is readable when rotated to approximately 180°.
- **Keep Text Readable** switches which extruded face is displayed depending on the viewing hemisphere. This hides the opposite lettering through transparent holes, while the hollow/transparent centre remains open.
- **Important 3D limitation:** true physically simultaneous, opaque-but-open front and rear letterforms would expose each other's reverse lettering through empty space. This lab uses **view-dependent visibility switching at around 90° and 270°**, not an invisible physically occluding material. There may be a transition near an edge-on angle, but at 0° you see the front lettering and at ~175° you see only the properly oriented 3D rear lettering. With Keep Text Readable OFF you get the physically natural mirrored back of a single face.
- **Extrusion depth** now controls centre thickness. **Edge thickness** controls the actual physical front-to-back thickness at the *left and right extremities of the entire oval*, not the letter bevel band. **Taper shape** controls how quickly thickness falls across the width. This creates the rugby-ball-like silhouette you described (view it at 90°).
- Surface smoothness and roundness remain adjustable. Floating original-colour PNG planes have been removed; the source artwork instead maps to the actual extruded faces via generated UV coordinates.
- Exact-angle inspection buttons allow 0°, 90°, 175°, 180°, 270° plus a 0–360° angle slider. Press a button to pause rotation at that angle.

Suggested starting profile: Extrusion depth **0.34**, Edge thickness **0.025**, Taper shape **1.5**, Surface smoothness **0.98**, Side polish **0.25**. Keep Upright and Keep Text Readable ON.

### Liquid Logo — logo + fluid UI

The standalone [Liquid Logo](https://github.com/collidingScopes/liquid-logo) project is **not an official React package**. The lab retains a custom, clearly labelled WebGL shader adaptation. New working controls: Wave scale, Cursor ripple, Metal contrast, Ambient flow. The tab also demonstrates a custom interactive liquid-style CTA button and glass tile. Page-level colour/lighting now changes to match the system.

### Unlumen UI — logo + tactile UI

Uses the publicly available [Unlumen Tilt primitive](https://github.com/leovvx/unlumen-ui-docs/blob/main/registry/primitives/tilt/index.tsx), adapted to JSX. New working controls: Spring damping, Parallax distance, Card corner radius, Reveal intensity. New interactive spring-tilt card selection demonstrates use outside a logo. Styling across the page follows the Unlumen theme. The additional spotlight/selection effects are custom.

### Magic UI — logo + animated interface

New working controls: Beam width, Shimmer speed, Grid density, Orbit speed, Twinkle intensity. New demonstration of a click-responsive button, animated border beam, particle backdrop, and interaction counter. The page uses a richer motion/glow theme. These components are **local implementations inspired by documented free Magic UI effects**, not imported licensed Pro assets.

## Original assets

- `public/logos/original/without.png` — archived original without tagline.
- `public/logos/original/with.png` — archived original with tagline.
- `public/logos/without.png` and `with.png` — derived transparent copies for rendering.
- `public/geometry/without.json` and `with.json` — contour data used for 3D extrusions.

The original PNGs remain byte-for-byte unchanged. Derived contours may have tiny raster-tracing irregularities, particularly around thin serif edges; inspect them on-screen before using effects publicly. The assets remain McIver College branding and are not relicensed.

## Library sources and implementation labels

| Library | What is genuinely used | What is custom |
| --- | --- | --- |
| React Three Fiber | `@react-three/fiber` Canvas/useFrame + Three.js ExtrudeGeometry | Dual-hemisphere face display, width-based taper and gallery styling |
| Liquid Logo | GLSL/WebGL technique inspired by standalone OSS Liquid Logo | Our independent shader/CTA/glass demonstrations, not an imported upstream package |
| Unlumen UI | Vendored open-source Tilt primitive (Motion springs) | Spotlight, extra gallery cards, style treatments |
| Magic UI | Techniques of documented Border Beam and particle animations | Local beam/particle/shimmer implementations and demo button |

Each tab changes its wider interface theme and contains a **Beyond the logo** interactive demo. The page shell is shared React/CSS to keep navigation, semantics and accessibility consistent; it is not literally rendered entirely by each library.

## Publish after local testing

The existing `.github/workflows/deploy-pages.yml` is included. Create a new GitHub repo for this lab; upload files, choose **Settings → Pages → GitHub Actions**. If using Vercel or Netlify: build command `npm run build`, output folder `dist`.

## Testing status

- Static JSX/TS syntax parse checked.
- Geometry and logo assets checked for presence; original PNGs compared to v1.1.
- ZIP archive integrity checked.
- **Not claimed:** completed `npm run build`, GPU visual inspection, automated browser test, or live publication. `npm install` could not finish in this isolated runtime; run the project on a browser-equipped PC and inspect at 0°, 90°, 175° and 180°.

Official references: https://r3f.docs.pmnd.rs/ · https://github.com/collidingScopes/liquid-logo · https://ui.unlumen.com/ · https://magicui.design/docs/components
