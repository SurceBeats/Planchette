# Changelog

## 1.2.106 (Latest)

- 2 new card decks: **Space Time** (8 cards, blue `#3B82F6`) and **Wiccan** (6 cards, pink `#EC4899`) — ported all changes from iOS version
- Fixed crisis classifier not triggering: added missing `stop` tokens to the LLM classification call (ported from iOS `localLlm.ts`), which caused the 1.7B model to generate garbage tokens instead of a clean SAFE/CRISIS response
- Crisis responses can no longer be shared as cards — the share button is replaced with a red blocked icon (circle-slash), matching iOS behaviour

## 1.2.104

- New card deck: **Magick** (6 cards, white `#FFFFFF`) — ported from iOS
- Multilanguage support too D:
- Card thumbnails: added `generate_thumbnails.mjs` script (Sharp, dev dependency) that generates 120px-wide webp thumbnails for the card selector (392 KB vs 21 MB full-size), run with `npm run thumbnails`
- Collapsible deck selector: card decks now display as a stacked hand — collapsed decks show a peek (~13px) of each card behind the first with progressive dark overlay, expanding on click to reveal all cards with selection borders (matches iOS `DeckItem` behaviour)
- Deck sorting: the deck matching the hashed answer appears first with its matched card leading, remaining decks follow
- Only one deck expanded at a time: expanding a new deck collapses the previous one and auto-selects its first card
- Card preview roll animation: switching cards triggers a slide-down + fade-in transition (`cardRollIn`, 250ms)
- Deck footer shows "Collection" suffix only when expanded
- Auto-scroll on expand: when an expanded deck's left edge is clipped by the scroll container, it smoothly scrolls into view with 8px margin
- Mouse drag-to-scroll: horizontal card selector supports click-and-drag scrolling on desktop, with `>3px` movement threshold to distinguish drag from click
- Safe modal dismiss: overlay close now requires both mousedown and mouseup on the overlay itself — dragging from inside the panel no longer accidentally closes the modal

## 1.2.58

- Transparent card export: removed artificial rounded-rect clipping from canvas export, card images' own transparency is now preserved using `source-atop` compositing for the dark overlay
- Transparent card preview: replaced rectangular overlay div with CSS `filter: brightness()` on the card image so transparent corners render cleanly in the modal preview
- Removed `borderRadius` and `overflow: hidden` from TarotCard preview container and ShareCardModal preview wrapper
- New card deck: **Eduard** (6 cards, goldenrod `#B8860B`)

## 1.2.52

- 2 new card decks: **Mirror** (6 cards, slate `#94A3B8`) and **The Sin** (6 cards, red `#EF4444`), 12 new card designs
- Question on share card: cards now show "YOU ASKED" with the original question in italic above "THE SPIRIT SPOKE", with dynamic font sizing based on question length
- New `showQuestion` prop on TarotCard with full Canvas 2D export support (question text rendered in italic serif with wrapping)
- Option chips replacing QR toggle: horizontal pill-style chips for "Hide QR" and "Add Question" replace the old toggle switch
- Button sizing fixes: Share and Close buttons now fixed at 36px height with 13px font, spinner scaled to 0.8 to prevent layout shift
- Spirit label color brightened from `rgba(254,243,199,0.55)` to `0.75` for better legibility

## 1.2.46

- Export button now shows a loading spinner and "Exporting..." text while the PDF is being generated
- Export button disabled during export to prevent duplicate clicks and potential hangs
- Fixed height (38px) on export button to prevent layout shift when spinner appears
- Directional planchette rotation: the planchette now leans toward its target letter as it moves across the board (ported from iOS), using `atan2` angle calculation clamped to ±15° with CSS transition matching the existing movement easing
- Ghost echo: semi-transparent duplicate planchette follows 100ms behind with slower 800ms easing, fades out on rest — creates a spectral trail effect
- Dynamic shadow: dark blurred ellipse under the planchette that shifts opposite to the movement direction, giving the illusion of shifting light as the planchette glides
- Dust particles: 3–5 wood-toned particles spawn from the planchette's departure position with randomised drift, scale, and fade-out — pool of 15 always-mounted elements to avoid mount/unmount overhead
- Randomised "thinking" delay (750–1750ms) before inference starts, so fast devices don't break the illusion of the board thinking

## 1.2.44

- Removed third-party audio credits from About modal, all FX is now produced by Surce Beats (yes, me, I'm a music producer and sound designer too, a modern renaissance man)

## 1.2.42

- Share as Card: new `ShareCardModal` for exporting spirit responses as tarot-style shareable card images
- TarotCard component with scalable layout system (360-base coordinates), dark overlay, text shadows, and vertical centering
- 4 card decks with 20 unique designs: Realm (8), Medley (6), Ocean (3), Presence (3), each with custom background art
- Card design selector grouped by deck with color-coded borders and collection labels
- Canvas 2D export engine: pixel-perfect PNG rendering bypassing html2canvas, with cover-mode background, rounded corners, text wrapping, and shadow effects
- Optional QR code on exported cards linking to the App Store, with toggle to remove
- Card filename includes sanitized answer text and timestamp (`Planchette-Tarot-Card-{answer}-{date}.png`)
- Share icon button on each question-answer pair in conversation log to trigger card creation
- Card design auto-selected by hashing the answer text, with full manual override via deck browser
- App Store QR code asset (`qr-appstore.png`) added

## 1.1.26

- Planchette idle animations: when the board is idle, the planchette occasionally comes alive on its own breathing, shuddering, levitating and slamming down, flickering between dimensions, or tilting as if examined by an unseen force
- Full 6-theme system: Classic, Skull, Ocean, Fire, Universe, Garden — all freely available
- New `themes.jsx` with ThemeProvider context, localStorage persistence, and per-theme BoardDecorations SVG components
- Theme selector modal with board previews, checkmark selection, and smooth open/close animations
- All board elements themed: background, border, vignette gradient, letters, words, active glow, planchette colors, input/log UI
- CSS animations now use CSS custom properties (`--theme-active`, `--theme-glow-rgb`, `--theme-spinner-rgb`) for per-theme effects
- PlanchetteSvg accepts dynamic wood/crystal color props from active theme
- PoltergeistCanvas effects adapt to theme colors (effectPrimary/Secondary/Highlight)
- SVG radialGradient vignette with 10-stop smooth gradient for realistic board depth
- Conversation log uses neutral grays for You/Spirit labels
- Increased letter spacing in conversation log (0.25em → 0.6em) for better readability
- Theme button: top-left on mobile, below gear on desktop
- Board container with proper overflow-hidden and rounded corners

## 1.1.24

- New board, ornate double inner border, warm vignette gradient overlay
- Added board decorative SVG elements: sun symbol (top-left), moon crescent (top-right), star accents, corner ornaments, diamond separator, scroll flourishes near GOODBYE, decorative arc and accent stars
- Added detailed and realistic wood-textured planchette, vector with 5 color layers, crystal viewing hole mask, and brass ring accents, replaces the old simple teardrop SVG
- Made planchette size responsive (percentage-based width relative to board) instead of fixed pixel dimensions
- Updated board letter styling to match iOS: warm amber text color (`rgba(253, 230, 138, 0.65)`) with subtle text shadow, brighter active glow (`#fcd34d` with 18px amber shadow)
- Moved disclaimer acceptance checkbox and button inside the scrollable content area, ensuring users must scroll through the full disclaimer before accepting

## 1.0.34

- Reduced context window from 4096 to 2048 tokens, halves KV cache memory (~200MB → ~100MB), faster prompt processing; 2048 covers worst-case real usage (~1300 tokens) with margin
- Reduced max generation tokens from 128 to 33 (ordo ab chao) for normal responses, limits worst-case generation time to ~1/4; spirit responses rarely exceed 21 tokens even in longest spelling cases
- Enabled Flash Attention (`flash_attn=True`), this is for same output, less memory, faster inference; benefits GPU (CUDA/Metal) most, safe on CPU-only

## 1.0.32

- Real PDF export: replaced `window.open()` + `window.print()` with `@react-pdf/renderer` for actual `.pdf` file generation that works on mobile Safari/Chrome
- PDF lazy-loaded via dynamic `import()` — only fetched when user taps Export
- App Store badge in PDF is now a clickable link
- Added `flask-compress` for gzip/brotli compression on all responses
- Build output files renamed to `planchette-{hash}.{ext}` pattern
- Increased Vite chunk size warning limit to 2MB, take that homie!

## 1.0.30

- Anti-repeat system: two-tier cache (seen + ban) strips repeated spirit responses from conversation context, forcing varied answers without extra inference
- 120-second response cache with automatic expiry
- Session PDF export now includes "Download on the App Store" badge (yes, we ported it)
- Reorganized `model_manager.py`: extracted `_create_llm()` helper, grouped constants, added section headers, removed dead `ctypes` import
- Moved crisis classification, message building, prompts and adaptive history logic into `model_manager.py`
- Added `ensure_loaded()` for non-blocking async model loading with "loading" status
- Model status endpoint now reports `loading` state during initialization
- Crisis classifier now receives recent conversation history for context-aware detection
- Crisis perf data (`crisis_input`, `crisis_llm_raw`, `crisis_result`) included in SSE response
- Expanded crisis keyword list: added body-part and method-specific terms across all 20+ languages
- Shortened crisis keyword stems for broader fuzzy matching coverage
- Removed duplicate keywords across language sections
- Updated About modal: added Banshee Technologies credit, privacy section, GitHub link, license info
- Updated Disclaimer modal styling and content
- Switched AI model from Ouija-3B to Ouija2-1.7B (Q4_K_M)
- Updated model download URL to HuggingFace BansheeTechnologies/Ouija2-1.7B (Apache2)
- Updated README to reference Ouija2-1.7B with HuggingFace link
- Added App Store download button to footer
- Added `cursor-pointer` to footer buttons
- Added CSS loading spinner for ask button
- Auto-cleanup of old model files (`.gguf`, `.gguf.part`) before downloading a new version
- Adjusted inference parameters: `repeat_penalty` 1.4→1.3, `frequency_penalty` 0.8→0.0
- Added `___PLANCHETTE_IOS___/` to `.gitignore` (used just for RN porting schedule)

## 1.0.28

- Canvas-based poltergeist effects overlay on the spirit board (5% chance per response)
- Smoke wisps: semi-transparent amber particles drift upward with sinusoidal wobble
- Static/interference: noise pixels and horizontal scanlines like EMF camera footage
- Shadow figure: dark translucent silhouette materializes and dissolves with faint amber eyes
- Spirit orbs: glowing amber/white spheres with soft radial glow drift across the board
- Scratches: thin golden lines progressively drawn with jagged paths, then fade
- Effects use `<canvas>` overlay with `pointer-events: none` — zero layout interference
- 60fps rendering via requestAnimationFrame with automatic cleanup
- DPI-aware canvas scaling for sharp rendering on retina displays

## 1.0.26

- Fixed iOS Safari auto-zoom on chat input focus (font-size bumped to 16px on mobile)
- Added `maximum-scale=1.0` to viewport meta tag across all templates for consistent zoom prevention
- Unified viewport meta tags in login, setup, and main board pages
- Replaced anger sound with "Scary Horn" by Poligonstudio (CC0) — freesound.org/s/397318
- Increased anger sound volume from 0.3 to 0.5
- Renamed anger.mp3 to no01.mp3
- YES glow effect probability increased from 10% to 20% (matches NO shake)
- MAYBE flicker effect probability adjusted from 40% to 20% (matches NO/YES)

## 1.0.24

- Client-side crisis keyword pre-filter (CrisisTrigger) with 490+ keywords across 20+ languages
- Two-stage crisis detection: fast local keyword match triggers LLM classification on the server
- Fuzzy matching for typo tolerance on crisis keywords of 6+ characters
- Text normalization (NFD + diacritic stripping) for accent-insensitive crisis matching
- Crisis classifier fails closed (assumes crisis if LLM errors) for safety
- Sanitized crisis LLM prompt input to mitigate prompt injection
- Hardened system prompt for stricter binary SAFE/CRISIS classification
- Crisis detection only runs when pre-filter triggers (saves latency on clean messages)
- Fixed SSE socket spam on client disconnect (GeneratorExit handling in generator)
- Finer-grained adaptive history limit scaling for high-latency scenarios (5s–8s+ thresholds)
- Added cmake to Dockerfile for llama-cpp-python fallback builds
- Platform-aware llama-cpp-python install with full x86-64-v3 optimization (AVX2/FMA/F16C)

## 1.0.2

- Dynamic CPU thread allocation (uses all available cores minus one)
- KV cache reset before each inference for cleaner and faster responses
- Safe fallback to 2 threads when CPU core count is unavailable

## 1.0.0 - Initial Release

- Interactive AI-powered spirit board with Ouija-3B model (Q4_K_M)
- Planchette moves across the board spelling answers letter by letter
- Classic spirit board responses: YES, NO, MAYBE, single words, spelled-out names
- Real-time streaming responses via Server-Sent Events
- Board shake effect on negative responses with ghostly sound
- Golden glow effect on affirmative responses
- Flicker effect on uncertain responses
- Fadeout effect when the spirit says GOODBYE
- Ambient background audio with dynamic volume
- Letter reveal animations with blur-to-focus golden glow
- Letter-by-letter animation in conversation log for latest response
- Typing indicator (animated dots) while the spirit is responding
- Paired question-answer display in conversation history
- Real-time crisis detection on every message (suicidal ideation, self-harm, emotional distress)
- Multilingual crisis detection support
- Helpline banner with link to findahelpline.com when crisis detected
- Crisis-flagged responses marked in session export
- Adaptive history system based on response latency
- Performance monitoring (crisis time, response time, token count, history metrics)
- Optional debug overlay for real-time performance data
- First-run account setup flow
- Username and password authentication with bcrypt hashing
- Settings panel to change username or password
- Session persistence with Flask-Login
- Automatic model download from HuggingFace with progress bar
- GPU acceleration with CPU fallback
- 5-minute idle timeout to unload model and free memory
- 4096 token context window
- Anti-repetition sampling (repeat_penalty 1.4, frequency_penalty 0.8)
- SSL/HTTPS auto-detection from certificates in ssl/ directory
- Certificate info display on startup (issuer, validity dates)
- Dockerfile and docker-compose.yml for containerized deployment
- Smart entrypoint preserving config, SSL certs, and model across restarts
- Session export as Markdown file
- Disclaimer modal on first visit
- About modal with credits and licenses
- Responsive design (mobile and desktop)
- AGPL-3.0 license
