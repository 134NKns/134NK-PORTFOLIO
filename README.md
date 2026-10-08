# 134NK Portfolio

Static Astro portfolio with a navy / ice-blue retro theme. Node >=22.12.0.

The hero includes a terminal typing intro, gentle computer float, and smoothed mouse parallax on devices with a fine pointer. Reduced motion keeps the computer still and the role fully readable. CSS introduces the hero and dialog; IntersectionObserver reveals content once using native Web Animations. Content stays visible without JavaScript; reduced motion disables CSS motion and finishes active reveals. The taskbar includes a reading-progress line. Skills use responsive category rows with frameless icon/name groups, and projects use attachment-only panels. No animation dependencies.

The retro dock navigates Home, About, Work, Skills and Mail, tracking the visible section. Profile copy and skills are edited in `src/data/profile.json`; client project details are omitted. Native anchor links work without JavaScript, with keyboard focus and reduced-motion scrolling.

NSC and iiG certificates, QuinR-rai and SabaiJai project screenshots, and LINE message samples appear as attachment links. Project captures use existing demo-store data from locally running applications; protected admin pages and real orders were excluded. They load on demand in a native dialog, with close button, Escape, backdrop dismissal and focus restoration. Without JavaScript, the links open the image in the same tab.

```sh
npm install
npm run dev
npm run build
npm test
```

The homepage reimplements the active [21st.dev retropc recipe](https://21st.dev/community/ascii) using Canvas2D: averaged 9px LEGO cells with circular studs, source-photo background at 100%, contrast 115, edge emphasis 40, blue overlay tint at 45% (updated from the original green recipe), vignette 72 and flicker (speed 100, intensity 60). Density 0 keeps baseline LEGO detail; binary characters are inactive in LEGO mode.

The artwork and effects are cached once per resize; flicker composites the result at up to 30fps with a maximum 6% luminance variation. Reduced motion renders a still frame; hidden tabs and offscreen artwork pause animation. No runtime framework, API keys or external image requests.

This implements the supplied LEGO/flicker preset, not the editor’s other render modes or disabled effects. Active settings live in `src/lib/retropc.ts`; rendering lives in `src/components/RetroBackground.astro`.

Photo: [Macintosh Classic II by Ben Boldt, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Macintosh_Classic_II.png), released by its author into the public domain. Converted locally to WebP. A photo fallback remains when Canvas2D or JavaScript is unavailable.

Browser self-check: run `node tests/dock.browser.mjs` with the built preview on port 4321 and a dedicated headless Chrome instance on CDP port 9227. It verifies navigation, keyboard, overflow, Canvas rendering and attachment dialog behavior at 1440px, 390px and 320px, plus scroll reveals, reading progress, reduced motion and no-JavaScript content.

Stack badges use local SVG assets from [Simple Icons](https://github.com/simple-icons/simple-icons) (CC0) and [Devicon](https://github.com/devicons/devicon) (Java, MIT; license in `src/assets/stack/DEVICON-LICENSE.txt`). No runtime CDN requests. Icons are decorative beside visible names; hover restores their color, and touch devices show full color. Badge data lives with skills in `src/data/profile.json`.

Typography uses self-hosted Latin WOFF2 fonts: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) for headings and [IBM Plex Sans / Mono](https://github.com/IBM/plex) for body/UI and terminal labels. About 73 KB total; preload the heading face, use font-display: swap, and keep system fallbacks. SIL Open Font License files are included in `src/assets/fonts/`. No runtime Google Fonts requests.
