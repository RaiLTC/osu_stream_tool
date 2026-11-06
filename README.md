# osu! Stream Tool

A browser-based osu!standard editor focused on streams. Import a `.osz` / `.osu`, place and shape streams, circles and sliders, and export a real `.osz`. Runs entirely in the browser; nothing is uploaded.

**Use it:** enable GitHub Pages (*Settings → Pages → Source: GitHub Actions*) and open the published site, or build locally (below).

## Project layout

```
src/
  index.html          page markup
  css/styles.css      styles
  js/NN-*.js          the editor, split by area, concatenated in filename order
  assets/skin/        default skin sprites (osu!lazer legacy)
vendor/jszip.min.js   JSZip 3.10.1 (reading/writing .osz)
scripts/build.mjs     build script (no dependencies)
tests/                smoke test + fixture map
.github/workflows/    GitHub Pages deploy
```

| File in `src/js/` | Area |
|---|---|
| `00-core` / `01-bodies` | state, streams as "bodies", spacing, import of timing |
| `02-history` | undo / redo (restores playhead and selection) |
| `03-path-math` | arc / bezier path maths |
| `04-drawing` / `05-skins` | playfield drawing, skins |
| `06-timelines` | top / bottom timelines, SV |
| `07-input` | playfield pointer + keyboard input |
| `08-slider-editing` | lazer-style slider editing |
| `09-rotation` / `10-scale` | rotate / scale dialogs and selection box |
| `11-stream-aim` | Shift aim preview, mirror (M) |
| `12-playback` / `13-import-export` | audio playback, .osz import / export, startup |
| `14-local-save` | local library: imported maps and autosaved edits kept in the browser (IndexedDB), "Recent" dialog |

The files are joined into one scope by the build (they share state), so they are fragments rather than ES modules. Splitting them into real modules is the next refactor.

## Build, run, test

```
npm run build     # -> dist/ (multi-file site) and dist/stream-maker.html (everything in ONE file)
npm run serve     # build + local web server
npm test          # build + smoke test (needs `npm install` once, for Playwright)
```

`dist/stream-maker.html` is fully self-contained (JSZip and sprites inlined) and works offline or from a file.

## Shortcuts

- **Stream tool (4):** drag to place; right-click while dragging bends; wheel changes the count.
- **Ctrl / Shift / Ctrl+Shift drag** from a circle, slider or a stream's last circle: lines / arcs / bezier. **Shift** with a last circle selected previews a direction (snaps to "straight" within 3°); right-click locks it. A quick right-click while Shift-dragging places a perfect-arc anchor; hold it for a bend node.
- **Spacing:** SV-step slider (0.001 SV, Shift 0.01) + SV box, *End circle moves with spacing*. **Stream base velocity / Stream SV** override spacing for streams only (never exported).
- **M:** mirror selected circles (S-shape) with a preview; M / Enter applies, Esc cancels.
- **Circle (2), Slider (3):** click to place; drag from the head for freehand sliders.
- **Ctrl+Shift+R** Rotate by, **Ctrl+Shift+S** Scale by, **Ctrl+, / Ctrl+.** rotate ∓90°.
- **Timeline:** Shift+click selects a combo; dragging a slider tail sets repeats.
- **Ctrl+Z / Ctrl+Y:** undo / redo.
