# McIver Logo Experience Lab — v1.2 Update

## Summary
- **No backing plate.** All Signboard backing/Centre thickness/Outer rim/Backing colour controls removed.
- **Two readable extruded faces.** When Keep Text Readable is on, the render selects either the extruded front or the extruded rear based on the viewer's hemisphere; the inactive face is hidden, rather than allowing see-through mirrored text.
- **Real horizontal taper.** Extrusion depth = centre thickness; Edge thickness = front-to-back measurement at the left/right tips; Taper shape adjusts the falloff. The code applies this to vertex Z positions of the real extruded logo shapes.
- **No floating raster face plane.** The official-derived transparent artwork is mapped onto the actual triangulated caps.
- **Instant inspection angles.** Presets for 0°/90°/175°/180°/270°, plus a 360° slider, pause for close inspection.
- **Expanded library showcases.** Each tab now changes more of the page theme and includes a hands-on example of UI usage beyond the logo, along with additional linked controls.

## What is technically impossible without a compromise?

Because the oval has genuine transparent holes, two simultaneously visible independent physical letter layers would be seen through one another at some angles. Rather than conceal the gaps with a plate, this version switches rendered geometry to the front-facing or rear-facing 3D surface. It is a deliberate rendering illusion; it can visibly switch as the camera passes 90° or 270°.

## How to test
1. React Three Fiber → Keep Upright ON, Keep Text Readable ON, Auto-rotate OFF.
2. Click **0°**. Confirm front reads normally and the interior is open.
3. Click **90°**. Move **Edge thickness** lower and **Extrusion depth** higher. Confirm side-on rugby-ball taper.
4. Click **175°** then **180°**. Confirm rear lettering reads correctly and no mirrored front is visible through the gaps.
5. Test each other tab's **Beyond the logo** panel and the additional slider controls.

**Validation:** static syntax and asset checks only. Requires a WebGL-enabled browser for final user acceptance.
