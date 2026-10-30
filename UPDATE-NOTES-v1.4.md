# McIver College Logo Experience Lab — v1.4

## What is included

**Existing lab preserved:** React Three Fiber, Liquid Logo-style WebGL, Unlumen UI, and Magic UI tabs, original logos (with and without tagline), global studio background/lighting controls, separately scrollable settings, opacity/colour/rotation and 3D taper controls.

### Fix: Glass applies to every surface

The old mix of material definitions could make the glass front translucent while the outer extruded edges still looked metallic (or give different results depending on control order). In v1.4 a single physically based **Three.js `MeshPhysicalMaterial` configuration** is applied to both the caps and sidewalls of each extruded logo shape whenever Glass is selected. Material instances are remounted when the finish is changed.

**Glass opacity means optical clarity/tint, not ordinary alpha:** At 0, `transmission` approaches 0.99 and sidewalls still have physically based reflections/refraction; at 1, glass has more tint. For non-glass materials, opacity is ordinary transparency and at 0 the shape is invisible. Three.js needs opaque alpha (`opacity: 1`, `transparent: false`) for transmissive glass to render correctly.

Glass may still produce different Fresnel highlights on the edge versus the front, as real glass does. Refraction and light transport vary by GPU/browser and require testing on the actual machine.

### Fix: Unlumen UI blending, corner clipping, radius

- The preview card no longer has a square painted layer or rectangular box shadow visible behind the rounded corners.
- One radius drives the card, border, gloss and surface clip; corner decorations move inward as the radius increases.
- Card colour is derived from the current **studio background**, with adjustable **Card surface blend** and **Frosted blur** sliders.
- Atmospheric pointer spotlight stays behind the card, not as an independent rectangular patch.
- The radius also affects the demo storefront product cards.

### React Three Fiber: three additional interactive website demonstrations

Below the original logo preview, choose from:

1. **Car showroom:** Two cars (Toy Car and Car Concept) with independent colour choices, wheel styles in the built-in models, light controls, unrestricted drag-to-rotate (including upside down), camera reset, and an option to load public glTF models over the internet.
2. **Sneaker studio:** Change colours, soles, laces, suede/leather/mesh appearance, lighting and view. Optional public Shopify materials-variant shoe model online.
3. **Interior explorer:** Two floors, wall visibility, furniture toggle, finishing colour, rotation and lighting. The interior is original procedural Three.js geometry (no third-party building asset necessary).

**Offline-first:** Each option has small original procedural geometry built into the source that works without loading other 3D models. The public Khronos `.glb` files are **linked remotely, not included in the ZIP**, and require internet access on the machine running the browser. A public model can be 5–12 MB. While downloading or if the remote model fails, the built-in shape remains visible. Public car textures or manufacturer marks are not relabelled McIver branding.

### Full website demonstrations on other tabs

- **Liquid Logo:** Fluid immersive landing page, colour themes, responsive CTA buttons, layout choices, clickable features, and a sample email form with local-only state.
- **Unlumen UI:** Editorial ecommerce homepage with spring-tilt cards, interactive category navigation, favourites, and local-only bag counter.
- **Magic UI:** Animated SaaS landing page, particles, beams, working pricing period and tier controls, counters, and a sample trial state.

The page/website demos are *original local adaptations*, not a claim that each is an official library template. The Unlumen Tilt primitive is ported from its public source; React Three Fiber uses its actual WebGL renderer; custom shaders and motion effects are labelled.

## Sources and licences

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber): MIT.
- [Unlumen UI Tilt primitive](https://github.com/leovvx/unlumen-ui-docs/blob/main/registry/primitives/tilt/index.tsx): source from the MIT-licensed public Unlumen UI project.
- [Magic UI](https://magicui.design/docs/components): independently implemented visuals, not Pro components.
- [Liquid Logo](https://github.com/collidingScopes/liquid-logo): custom liquid-style WebGL study; not presented as upstream React components.
- [Khronos Toy Car](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ToyCar): original model by Guido Odendahl; materials work by Eric Chadwick, **CC0-1.0**.
- [Khronos Car Concept](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept): project contributors named in the model's upstream README, **CC-BY-4.0**; upstream trademarks are excluded from this licence.
- [Materials Variants Shoe](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe): Shopify, **CC-BY-4.0**.

For attribution, retain the source hyperlinks and these credits when redistributing the demo. The McIver original logo artwork remains proprietary to its owner and is not relicensed by including it in this project.

## How to run

1. Install Node.js 22+ on Windows.
2. Extract ZIP and double click `start-lab.bat` (or run `npm install` then `npm run dev`).
3. Open the local Vite URL, normally `http://localhost:5173`.
4. Test React Three Fiber **Glass at 0 opacity**, adjust material to Metal and back, then inspect edges at 90°, 175° and 180°.
5. On Unlumen UI choose the Ivory backdrop, then test card radius from 0–76px, surface blend 0–1 and frosted blur 0–32px.
6. In the React Three Fiber **Beyond the Crest** section, open each of the three showroom tabs. Toggle **3D asset source** to online for the public glTF model.

## Validation status

- JSX/JS files parsed with the TypeScript transpiler, zero syntax errors.
- CSS parsed with PostCSS, zero syntax errors.
- Original McIver logos are stored separately and were not modified.
- ZIP file structure and checksum checks completed.
- **Not verified:** successful `npm run build`, live browser WebGL rendering, remote downloads, or deployment. This environment could not download npm dependencies or model binaries; browser testing is still required.
