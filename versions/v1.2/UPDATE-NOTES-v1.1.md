# McIver College Logo Experience Lab — Update v1.1

Based on screenshots of the original React Three Fiber section (front, side, rear ~175°, and oblique rear view).

## What was fixed

- **Striped/jagged sides:** the large golden oval's original pixel-staircase contour is simplified within a small tolerance. Side-wall vertex normals are blended without blurring the front or back cap normals, and bevels use more segments for smoother reflections.
- **Thick middle / thin edge option:** turn on **Signboard backing**. The backing has a real, convex 3D front, a thin outer edge and a planar back. Change **Centre thickness**, **Outer rim thickness** and **Centre roundness** to shape it. The original logo artwork is not replaced.
- **Front/back text overlap:** the backing is opaque and physically separates the raised front lettering from the rear. Rear wording uses a separate, correctly oriented **flat print**. At a rear angle near 175°, the face seen is the back; the extruded letters on the front are hidden by the solid backing.
- **Letter bevels:** change **Edge thickness**, **Rounded edge width**, **Edge sharpness** and **Surface smoothness** to go from crisp and straight to rounded with soft side reflections.
- **Control explanations:** hover, focus or tap the **eye icon** beside each setting, switch, preset and colour input across all four effects. There are separate explanations for *Flow speed*, *Spring stiffness*, *Particle count*, *Keep Text Readable*, etc.
- **Plain language:** "ASSET INTEGRITY: PRESERVED" has been renamed **ORIGINAL LOGOS: UNCHANGED**. It simply means the original PNGs are included separately and have not been overwritten.

## Important trade-off

**Signboard backing ON** (default) produces the clean, legible rear side you requested but fills the crest's otherwise transparent centre with a dark backing. **Signboard backing OFF** returns to an open, transparent emblem. With an open emblem, you can naturally see some opposite-side relief through the openings. The UI explains this when the backing is off.

## Recommended settings

| Want this look? | Set these controls |
| --- | --- |
| Smooth and professional metallic sides | Surface smoothness 0.9–1; Side polish 0.25–0.4 |
| Sharp, precise lettering | Rounded edge width 0.005–0.015; Edge sharpness 0.4–0.8 |
| Rounded signboard silhouette | Signboard backing ON; Centre thickness 0.2; Outer rim thickness 0.025; Centre roundness 0.8 |
| Clean, flat text at 175–180 degrees | Keep Text Readable ON; Signboard backing ON; Keep Upright ON |
| Transparent crest without any backing | Signboard backing OFF (rear may show through) |

## Verify locally

Open `start-lab.bat` on Windows and inspect the logo at 0°, 90°, 175° and 180° in each logo variant. Try the new sliders while rotating.

**Validation:** static JSX syntax parsed successfully; original logo file bytes preserved; ZIP integrity verified. A full `npm run build` and in-browser WebGL/visual test **was not possible in this environment** because npm package installation was unavailable. This update is therefore supplied as tested source structure, not a claim of successful end-to-end runtime validation or published hosting.
