# Changelog

## 1.0.24 (Latest)

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

---

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
