import React, { useState, useEffect, useRef, useCallback } from "react";
import AboutModal from "./AboutModal";
import DisclaimerModal from "./DisclaimerModal";
import SettingsModal from "./SettingsModal";
import Footer from "./Footer";
import { shouldCheckCrisis, hasKeywordMatch, markCrisisDetected } from "./CrisisTrigger";
import PoltergeistCanvas from "./PoltergeistCanvas";
import PlanchetteSvg from "./PlanchetteSvg";
import { useTheme } from "./themes.jsx";
import ThemeSelectorModal from "./ThemeSelectorModal";
import ShareCardModal from "./ShareCardModal";
import { initLanguage, t, ti, useLanguageRefresh, getLanguage } from "./i18n.jsx";

const BOARD_ITEMS = (() => {
  const items = {};

  items["YES"] = { x: 25, y: 8 };
  items["NO"] = { x: 75, y: 8 };
  items["MAYBE"] = { x: 50, y: 8 };

  const row1 = "ABCDEFGHIJKLM".split("");
  row1.forEach((ch, i) => {
    const t = i / (row1.length - 1);
    items[ch] = { x: 8 + t * 84, y: 30 + Math.sin(Math.PI * t) * -6 };
  });

  const row2 = "NOPQRSTUVWXYZ".split("");
  row2.forEach((ch, i) => {
    const t = i / (row2.length - 1);
    items[ch] = { x: 8 + t * 84, y: 50 + Math.sin(Math.PI * t) * -6 };
  });

  const nums = "1234567890".split("");
  nums.forEach((ch, i) => {
    const t = i / (nums.length - 1);
    items[ch] = { x: 15 + t * 70, y: 70 };
  });

  items["GOODBYE"] = { x: 50, y: 88 };
  items["_REST"] = { x: 50, y: 55 };

  return items;
})();

function stripDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const BOARD_WORDS = ["GOODBYE", "MAYBE", "YES", "NO"];

const IDLE_ANIMS = [
  { cls: "idle-breathing", duration: 4900 },
  { cls: "idle-shudder", duration: 1040 },
  { cls: "idle-levitate", duration: 3320 },
  { cls: "idle-flicker", duration: 1000 },
  { cls: "idle-tilt-right", duration: 6000 },
  { cls: "idle-tilt-left", duration: 6000 },
];

function cleanToken(token) {
  return stripDiacritics(token.replace(/\.\.\./g, "").replace(/[.\s]/g, "")).toUpperCase();
}

function lettersOf(str) {
  return str.split("").filter((ch) => BOARD_ITEMS[ch]);
}

async function streamQuestion(question, { onToken, onDone, onCrisis, signal, history }) {
  const resp = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history, checkCrisis: shouldCheckCrisis(question) }),
    signal,
  });

  const ct = resp.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await resp.json();
    throw new Error(data.error || "Unknown error");
  }

  if (resp.headers.get("X-Crisis") === "true") onCrisis();

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let fullAnswer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.done) {
          onDone(fullAnswer, data.perf || null);
          return;
        }
        if (data.token) {
          fullAnswer += data.token;
          onToken(data.token, fullAnswer);
        }
      } catch {
        /* skip */
      }
    }
  }
  onDone(fullAnswer, null);
}

export default function PlanchetteBoard() {
  useLanguageRefresh();
  const { theme } = useTheme();
  const [showThemes, setShowThemes] = useState(false);
  const [planchettePos, setPlanchettePos] = useState(BOARD_ITEMS["_REST"]);
  const [activeKey, setActiveKey] = useState(null);
  const [question, setQuestion] = useState("");
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(() => localStorage.getItem("__disclaimerAccepted") === "true");
  const [showSettings, setShowSettings] = useState(false);
  const [started, setStarted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [boardEffect, setBoardEffect] = useState(null);
  const boardEffectTimer = useRef(null);
  const [poltergeistTrigger, setPoltergeistTrigger] = useState(0);
  const animSpeedRef = useRef(1000);

  const audioRef = useRef(null);
  const interactRef = useRef(null);
  const noRef = useRef(null);
  const yesRef = useRef(null);
  const maybeRef = useRef(null);

  const [modelStatus, setModelStatus] = useState("checking");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const pollingRef = useRef(null);
  const abortRef = useRef(null);

  const [waiting, setWaiting] = useState(false);
  const waitTimerRef = useRef(null);

  const [showHelpline, setShowHelpline] = useState(false);
  const historyLimitRef = useRef(80);
  const DEBUG = false;
  const [showDebug, setShowDebug] = useState(false);
  const [verboseLog, setVerboseLog] = useState(false);
  const verboseLogRef = useRef(false);
  const [debugInfo, setDebugInfo] = useState({
    lastCrisisInput: "",
    lastCrisisLlmRaw: "",
    lastCrisisResult: "",
    lastResponseMs: 0,
    lastTokens: 0,
    lastHistoryLen: 0,
    lastHistoryLimit: 0,
  });

  const crisisRef = useRef(false);
  const [exporting, setExporting] = useState(false);
  const [askTapped, setAskTapped] = useState(false);
  const askRevertTimerRef = useRef(null);

  const [moveRotate, setMoveRotate] = useState(0);
  const lastTargetRef = useRef(null);

  // Ghost echo
  const [ghostPos, setGhostPos] = useState(BOARD_ITEMS["_REST"]);
  const [ghostRotate, setGhostRotate] = useState(0);
  const [ghostOpacity, setGhostOpacity] = useState(0);
  const ghostTimerRef = useRef(null);

  // Dynamic shadow
  const [shadowPos, setShadowPos] = useState(BOARD_ITEMS["_REST"]);
  const [shadowOffset, setShadowOffset] = useState({ x: 0, y: 0 });

  // Dust particles
  const DUST_POOL_SIZE = 15;
  const [dustParticles, setDustParticles] = useState(() => Array.from({ length: DUST_POOL_SIZE }, (_, i) => ({ id: i, x: 0, y: 0, opacity: 0, dx: 0, dy: 0, scale: 0.6, color: 0, drifted: false })));
  const dustIndexRef = useRef(0);

  const busyRef = useRef(false);
  const idleTimerRef = useRef(null);
  const idleAnimEndTimerRef = useRef(null);
  const [idleAnimClass, setIdleAnimClass] = useState(null);

  useEffect(() => {
    if (!busy) {
      setAskTapped(false);
      if (askRevertTimerRef.current) {
        clearTimeout(askRevertTimerRef.current);
        askRevertTimerRef.current = null;
      }
    }
  }, [busy]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  const handleStop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    animQueueRef.current = [];
    animatingRef.current = false;
    setBusy(false);
    setWaiting(false);
  }, []);

  const handleBusyTap = useCallback(() => {
    if (!askTapped) {
      setAskTapped(true);
      if (askRevertTimerRef.current) clearTimeout(askRevertTimerRef.current);
      askRevertTimerRef.current = setTimeout(() => setAskTapped(false), 3000);
    } else {
      if (askRevertTimerRef.current) {
        clearTimeout(askRevertTimerRef.current);
        askRevertTimerRef.current = null;
      }
      handleStop();
      setAskTapped(false);
    }
  }, [askTapped, handleStop]);

  const questionQueueRef = useRef([]);
  const processingRef = useRef(false);
  const processNextRef = useRef(null);

  const fadeRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio("/__data__/ambient.mp3");
      audio.loop = true;
      audio.volume = 0.2;
      audioRef.current = audio;
    }
    if (!interactRef.current) {
      const sfx = new Audio("/__data__/interact.mp3");
      sfx.volume = 0.5;
      interactRef.current = sfx;
    }
    if (!noRef.current) {
      const sfx = new Audio("/__data__/no01.mp3");
      sfx.volume = 0.5;
      noRef.current = sfx;
    }
    if (!yesRef.current) {
      const sfx = new Audio("/__data__/yes01.mp3");
      sfx.volume = 0.5;
      yesRef.current = sfx;
    }
    if (!maybeRef.current) {
      const sfx = new Audio("/__data__/maybe01.mp3");
      sfx.volume = 0.5;
      maybeRef.current = sfx;
    }
  }, []);

  const startSession = useCallback(() => {
    if (started || transitioning) return;
    if (!disclaimerAccepted) {
      setShowDisclaimer(true);
      return;
    }
    setTransitioning(true);
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
    if (interactRef.current) {
      interactRef.current.currentTime = 0;
      interactRef.current.play().catch(() => {});
    }
  }, [started, transitioning, disclaimerAccepted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || boardEffect === "shake") return;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);

    const target = busy ? 0.5 : 0.2;
    const step = () => {
      const diff = target - audio.volume;
      if (Math.abs(diff) < 0.005) {
        audio.volume = target;
        return;
      }
      audio.volume += diff * 0.06;
      fadeRef.current = requestAnimationFrame(step);
    };
    fadeRef.current = requestAnimationFrame(step);

    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    };
  }, [busy, boardEffect]);

  useEffect(() => {
    fetch("/api/model/status")
      .then((r) => r.json())
      .then((d) => {
        const status = d.status === "ready" ? "ready" : d.status === "downloading" ? "downloading" : d.status === "loading" ? "loading" : "idle";
        setDownloadProgress(d.progress || 0);
        if (status === "downloading" || status === "loading") {
          setModelStatus(status);
          startPolling();
        } else if (status === "idle") {
          fetch("/api/model/download", { method: "POST" });
          setModelStatus("downloading");
          startPolling();
        } else if (status === "ready") {
          loadTriggeredRef.current = true;
          fetch("/api/model/load", { method: "POST" });
          setModelStatus("loading");
          startPolling();
        }
      })
      .catch(() => setModelStatus("idle"));
  }, []);

  const loadTriggeredRef = useRef(false);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      try {
        const r = await fetch("/api/model/status");
        const d = await r.json();
        let status = d.status === "ready" ? "ready" : d.status === "downloading" ? "downloading" : d.status === "loading" ? "loading" : d.status === "error" ? "error" : d.status;

        if (status === "ready" && !loadTriggeredRef.current) {
          loadTriggeredRef.current = true;
          fetch("/api/model/load", { method: "POST" });
          status = "loading";
        }

        setModelStatus(status);
        setDownloadProgress(d.progress || 0);
        if (status === "ready" || status === "error") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } catch (e) {
        console.error("Failed to poll model status:", e);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (modelStatus === "ready") {
      processNextQuestion();
    }
  }, [modelStatus]);

  const animQueueRef = useRef([]);
  const animatingRef = useRef(false);
  const revealedRef = useRef("");
  const needsBreakRef = useRef(false);
  const afterEllipsisRef = useRef(false);
  const hasEmittedRef = useRef(false);
  const needsDotSepRef = useRef(false);
  const pendingBreakRef = useRef(false);
  const pendingMatchRef = useRef(null);
  const wordBufRef = useRef("");

  const moveTo = useCallback((key) => {
    const pos = BOARD_ITEMS[key];
    if (!pos) return;
    const prev = lastTargetRef.current || BOARD_ITEMS["_REST"];
    const dx = pos.x - prev.x;
    const dy = pos.y - prev.y;
    const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    const lean = Math.max(-15, Math.min(15, angle * 0.3));

    const count = 3 + Math.floor(Math.random() * 3);
    setDustParticles((pool) => {
      const next = [...pool];
      for (let i = 0; i < count; i++) {
        const idx = (dustIndexRef.current + i) % DUST_POOL_SIZE;
        next[idx] = {
          id: idx,
          x: prev.x + (Math.random() - 0.5) * 4,
          y: prev.y + (Math.random() - 0.5) * 4,
          opacity: 0.4,
          dx: (Math.random() - 0.5) * 2.5,
          dy: -(2 + Math.random() * 3.5),
          scale: 0.5 + Math.random() * 0.5,
          color: Math.floor(Math.random() * 3),
          drifted: false,
        };
      }
      dustIndexRef.current = (dustIndexRef.current + count) % DUST_POOL_SIZE;
      return next;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDustParticles((pool) => pool.map((p) => (p.opacity > 0 ? { ...p, opacity: 0, drifted: true } : p)));
      });
    });

    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const shadowOx = (-dx / dist) * 1.5;
    const shadowOy = (-dy / dist) * 1.5;
    setShadowPos(pos);
    setShadowOffset({ x: shadowOx, y: shadowOy });

    setGhostOpacity(0.13);
    if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current);
    ghostTimerRef.current = setTimeout(() => {
      setGhostPos(pos);
      setGhostRotate(lean);
    }, 100);

    lastTargetRef.current = pos;
    setPlanchettePos(pos);
    setActiveKey(key);
    setMoveRotate(lean);
  }, []);

  const rest = useCallback(() => {
    const pos = BOARD_ITEMS["_REST"];
    lastTargetRef.current = pos;
    setPlanchettePos(pos);
    setActiveKey(null);
    setMoveRotate(0);

    if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current);
    ghostTimerRef.current = setTimeout(() => {
      setGhostPos(pos);
      setGhostRotate(0);
    }, 100);
    setGhostOpacity(0);

    setShadowPos(pos);
    setShadowOffset({ x: 0, y: 0 });
  }, []);

  const processAnimQueue = useCallback(() => {
    if (animQueueRef.current.length === 0) {
      animatingRef.current = false;
      setTimeout(rest, 1500);
      return;
    }
    animatingRef.current = true;
    const key = animQueueRef.current.shift();

    if (key === "_BREAK") {
      revealedRef.current += " ";
      setRevealedLetters((prev) => [...prev, { key: "_BREAK", id: Date.now() }]);
      setTimeout(processAnimQueue, 300);
      return;
    }

    if (key === "_DOT") {
      revealedRef.current += ".";
      setRevealedLetters((prev) => [...prev, { key: "_DOT", id: Date.now() }]);
      setTimeout(processAnimQueue, 200);
      return;
    }

    moveTo(key);
    revealedRef.current += key;
    setRevealedLetters((prev) => [...prev, { key, id: Date.now() }]);

    const base = animSpeedRef.current;
    const delay = base > 500 ? 700 + Math.random() * 300 : base;
    setTimeout(processAnimQueue, delay);
  }, [moveTo, rest]);

  const enqueueAnim = useCallback(
    (targets) => {
      for (const t of targets) animQueueRef.current.push(t);
      if (!animatingRef.current && animQueueRef.current.length > 0) {
        processAnimQueue();
      }
    },
    [processAnimQueue],
  );

  const audioTransitionRef = useRef(null);
  const smoothAudioTransition = useCallback((targetVol, targetRate, speed = 0.04) => {
    if (audioTransitionRef.current) cancelAnimationFrame(audioTransitionRef.current);
    const audio = audioRef.current;
    if (!audio) return;
    const step = () => {
      let done = true;
      const vDiff = targetVol - audio.volume;
      if (Math.abs(vDiff) > 0.005) {
        audio.volume = Math.min(1, Math.max(0, audio.volume + vDiff * speed));
        done = false;
      } else {
        audio.volume = targetVol;
      }
      const rDiff = targetRate - audio.playbackRate;
      if (Math.abs(rDiff) > 0.005) {
        audio.playbackRate = Math.max(0.1, audio.playbackRate + rDiff * speed);
        done = false;
      } else {
        audio.playbackRate = targetRate;
      }
      if (!done) audioTransitionRef.current = requestAnimationFrame(step);
    };
    audioTransitionRef.current = requestAnimationFrame(step);
  }, []);

  const triggerEffect = useCallback(
    (type, duration) => {
      if (boardEffectTimer.current) clearTimeout(boardEffectTimer.current);
      setBoardEffect(type);
      if (type === "shake") {
        animSpeedRef.current = 350;
        smoothAudioTransition(0.9, 0.5);
        if (noRef.current) {
          noRef.current.currentTime = 0;
          noRef.current.play().catch(() => {});
        }
      }
      if (type === "glow") {
        if (yesRef.current) {
          yesRef.current.currentTime = 0;
          yesRef.current.play().catch(() => {});
        }
      }
      if (type === "flicker") {
        if (maybeRef.current) {
          maybeRef.current.currentTime = 0;
          maybeRef.current.play().catch(() => {});
        }
      }
      boardEffectTimer.current = setTimeout(() => {
        setBoardEffect(null);
        animSpeedRef.current = 1000;
        smoothAudioTransition(busy ? 0.5 : 0.2, 1.0);
        boardEffectTimer.current = null;
      }, duration);
    },
    [busy, smoothAudioTransition],
  );

  const doAskInternal = useCallback(
    async (q) => {
      const askStart = Date.now();

      setRevealedLetters([]);
      animQueueRef.current = [];
      animatingRef.current = false;
      revealedRef.current = "";
      needsBreakRef.current = false;
      afterEllipsisRef.current = false;
      hasEmittedRef.current = false;
      needsDotSepRef.current = false;
      pendingBreakRef.current = false;
      pendingMatchRef.current = null;
      wordBufRef.current = "";
      crisisRef.current = false;

      const controller = new AbortController();
      abortRef.current = controller;
      let verboseTokenCount = 0;

      if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
      waitTimerRef.current = setTimeout(() => setWaiting(true), 150);

      const recentLog = log.slice(-historyLimitRef.current);
      const history = recentLog.map((entry) => ({
        role: entry.role === "user" ? "user" : "assistant",
        content: entry.text,
      }));

      const MIN_THINKING_MS = 750;
      const MAX_THINKING_MS = 1750;
      const thinkingTarget = MIN_THINKING_MS + Math.random() * (MAX_THINKING_MS - MIN_THINKING_MS);
      const elapsed = Date.now() - askStart;
      if (elapsed < thinkingTarget) {
        await new Promise((resolve) => setTimeout(resolve, thinkingTarget - elapsed));
      }

      try {
        await streamQuestion(q, {
          signal: controller.signal,
          history,
          onCrisis() {
            crisisRef.current = true;
            if (hasKeywordMatch(q)) markCrisisDetected();
            setShowHelpline(true);
          },
          onToken(token, fullAnswer) {
            verboseTokenCount++;
            if (verboseLogRef.current) console.log(`[TOKEN ${verboseTokenCount}] "${token}"`);
            if (waitTimerRef.current) {
              clearTimeout(waitTimerRef.current);
              waitTimerRef.current = null;
              if (Math.random() < 0.05) setPoltergeistTrigger((n) => n + 1);
            }
            setWaiting(false);

            const clean = cleanToken(token);
            const stripped = token.replace(/\.\.\./g, "");
            const hasLeadingSep = /^[\s.]/.test(stripped);

            if (pendingMatchRef.current) {
              const pending = pendingMatchRef.current;
              pendingMatchRef.current = null;

              if (!clean || hasLeadingSep) {
                if (pending.word === "NO" && Math.random() < 0.2) triggerEffect("shake", 7000);
                else if (pending.word === "YES" && Math.random() < 0.2) triggerEffect("glow", 5000);
                else if (pending.word === "MAYBE" && Math.random() < 0.2) triggerEffect("flicker", 1500);
                else if (pending.word === "GOODBYE") triggerEffect("fadeout", 2500);

                const matchPrefix = [];
                if (needsDotSepRef.current) {
                  matchPrefix.push("_DOT", "_BREAK");
                  needsDotSepRef.current = false;
                } else if (pending.shouldBreak) {
                  matchPrefix.push("_BREAK");
                }
                hasEmittedRef.current = true;
                needsDotSepRef.current = pending.word !== "GOODBYE";
                enqueueAnim([...matchPrefix, pending.word]);
              } else {
                wordBufRef.current = pending.word;
                if (pending.shouldBreak) pendingBreakRef.current = true;
              }
            }

            // Separators
            if (!clean) {
              if (wordBufRef.current) {
                const flushed = lettersOf(wordBufRef.current);
                wordBufRef.current = "";
                if (flushed.length) {
                  const sepPrefix = [];
                  if (needsDotSepRef.current) {
                    sepPrefix.push("_DOT", "_BREAK");
                    needsDotSepRef.current = false;
                  } else if (needsBreakRef.current) {
                    sepPrefix.push("_BREAK");
                    needsBreakRef.current = false;
                  }
                  hasEmittedRef.current = true;
                  enqueueAnim([...sepPrefix, ...flushed]);
                }
              }
              if (token.includes("...")) {
                afterEllipsisRef.current = true;
                needsBreakRef.current = false;
              } else if (/[.\s]/.test(token)) {
                needsBreakRef.current = true;
                afterEllipsisRef.current = false;
              }
              return;
            }

            // Content
            const tokenHasBreak = hasLeadingSep && hasEmittedRef.current && !afterEllipsisRef.current;
            const shouldBreak = pendingBreakRef.current || needsBreakRef.current || tokenHasBreak;

            if (tokenHasBreak && wordBufRef.current) {
              const flushed = lettersOf(wordBufRef.current);
              wordBufRef.current = "";
              if (flushed.length) {
                const flushPrefix = [];
                if (needsDotSepRef.current) {
                  flushPrefix.push("_DOT", "_BREAK");
                  needsDotSepRef.current = false;
                } else {
                  flushPrefix.push("_BREAK");
                }
                hasEmittedRef.current = true;
                enqueueAnim([...flushPrefix, ...flushed]);
              }
            }

            wordBufRef.current += clean;
            const buf = wordBufRef.current;

            // Wait
            const matchedWord = BOARD_WORDS.find((w) => buf === w);
            if (matchedWord) {
              wordBufRef.current = "";
              pendingBreakRef.current = false;
              pendingMatchRef.current = { word: matchedWord, shouldBreak };
              needsBreakRef.current = /[\s.]$/.test(stripped);
              afterEllipsisRef.current = false;
              return;
            }

            const couldMatch = BOARD_WORDS.some((w) => w.startsWith(buf));
            if (couldMatch) {
              if (shouldBreak) pendingBreakRef.current = true;
              return;
            }

            wordBufRef.current = "";
            pendingBreakRef.current = false;
            const targets = lettersOf(buf);
            if (!targets.length) return;

            const prefix = [];
            if (needsDotSepRef.current) {
              prefix.push("_DOT", "_BREAK");
              needsDotSepRef.current = false;
            } else if (shouldBreak) {
              prefix.push("_BREAK");
            }

            needsBreakRef.current = /[\s.]$/.test(stripped);
            afterEllipsisRef.current = false;
            hasEmittedRef.current = true;

            enqueueAnim([...prefix, ...targets]);
          },
          onDone(fullAnswer, perf) {
            if (verboseLogRef.current) console.log(`[RAW OUTPUT] "${fullAnswer}"`);
            if (perf?.history_limit) historyLimitRef.current = perf.history_limit;
            if (DEBUG && perf) {
              setDebugInfo((prev) => ({
                ...prev,
                lastResponseMs: perf.response_ms,
                lastTokens: perf.tokens,
                lastHistoryLen: perf.history_len,
                lastHistoryLimit: perf.history_limit,
                ...(perf.crisis_input !== undefined
                  ? {
                      lastCrisisInput: perf.crisis_input,
                      lastCrisisLlmRaw: perf.crisis_llm_raw,
                      lastCrisisResult: perf.crisis_result,
                    }
                  : {}),
              }));
            }
            // Confirm
            if (pendingMatchRef.current) {
              const pending = pendingMatchRef.current;
              pendingMatchRef.current = null;
              if (pending.word === "NO" && Math.random() < 0.2) triggerEffect("shake", 7000);
              else if (pending.word === "YES" && Math.random() < 0.2) triggerEffect("glow", 5000);
              else if (pending.word === "MAYBE" && Math.random() < 0.2) triggerEffect("flicker", 1500);
              else if (pending.word === "GOODBYE") triggerEffect("fadeout", 2500);
              const matchPrefix = [];
              if (needsDotSepRef.current) {
                matchPrefix.push("_DOT", "_BREAK");
                needsDotSepRef.current = false;
              } else if (pending.shouldBreak) {
                matchPrefix.push("_BREAK");
              }
              hasEmittedRef.current = true;
              needsDotSepRef.current = pending.word !== "GOODBYE";
              enqueueAnim([...matchPrefix, pending.word]);
            }
            if (wordBufRef.current) {
              const remaining = lettersOf(wordBufRef.current);
              wordBufRef.current = "";
              if (remaining.length) {
                const endPrefix = [];
                if (needsDotSepRef.current) {
                  endPrefix.push("_DOT", "_BREAK");
                  needsDotSepRef.current = false;
                } else if (needsBreakRef.current) {
                  endPrefix.push("_BREAK");
                  needsBreakRef.current = false;
                }
                hasEmittedRef.current = true;
                enqueueAnim([...endPrefix, ...remaining]);
              }
            }
            if (hasEmittedRef.current) enqueueAnim(["_DOT"]);
            const waitForAnim = () => {
              if (animatingRef.current || animQueueRef.current.length > 0) {
                setTimeout(waitForAnim, 500);
              } else {
                setLog((prev) => [...prev, { role: "spirit", text: revealedRef.current, crisis: crisisRef.current }]);
                processingRef.current = false;
                abortRef.current = null;
                processNextRef.current();
              }
            };
            waitForAnim();
          },
        });
      } catch (e) {
        if (waitTimerRef.current) {
          clearTimeout(waitTimerRef.current);
          waitTimerRef.current = null;
        }
        setWaiting(false);
        if (e.name !== "AbortError") console.error(e);
        processingRef.current = false;
        abortRef.current = null;
        processNextRef.current();
      }
    },
    [enqueueAnim, log, triggerEffect],
  );

  const processNextQuestion = useCallback(() => {
    if (processingRef.current) return;
    const next = questionQueueRef.current.shift();
    if (!next) {
      setBusy(false);
      return;
    }
    processingRef.current = true;
    setBusy(true);
    doAskInternal(next);
  }, [doAskInternal]);

  processNextRef.current = processNextQuestion;

  // --- Idle nudge animations ---
  const cancelIdleAnim = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (idleAnimEndTimerRef.current) {
      clearTimeout(idleAnimEndTimerRef.current);
      idleAnimEndTimerRef.current = null;
    }
    setIdleAnimClass(null);
  }, []);

  const scheduleIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
    if (busyRef.current || animatingRef.current) return;
    const delay = 20000 + Math.random() * 15000;
    idleTimerRef.current = setTimeout(() => {
      if (busyRef.current || animatingRef.current) {
        scheduleIdleTimer();
        return;
      }
      const anim = IDLE_ANIMS[Math.floor(Math.random() * IDLE_ANIMS.length)];
      setIdleAnimClass(anim.cls);
      idleAnimEndTimerRef.current = setTimeout(() => {
        setIdleAnimClass(null);
        scheduleIdleTimer();
      }, anim.duration + 100);
    }, delay);
  }, []);

  useEffect(() => {
    if (started && !busy) {
      scheduleIdleTimer();
    } else {
      cancelIdleAnim();
    }
    return () => cancelIdleAnim();
  }, [started, busy, scheduleIdleTimer, cancelIdleAnim]);

  const handleAsk = useCallback(() => {
    const q = question.trim();
    if (!q || busy) return;

    cancelIdleAnim();

    if (showHelpline) setShowHelpline("closing");
    setLog((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");

    questionQueueRef.current.push(q);
    setBusy(true);

    if (modelStatus === "ready") {
      processNextQuestion();
    } else {
      if (modelStatus !== "downloading" && modelStatus !== "loading") {
        fetch("/api/model/download", { method: "POST" });
        setModelStatus("downloading");
      }
      startPolling();
    }
  }, [question, modelStatus, processNextQuestion, startPolling, cancelIdleAnim]);

  const exportPDF = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const dateLang = getLanguage() || "en";
      const date = new Date().toLocaleDateString(dateLang, { year: "numeric", month: "long", day: "numeric" });
      const acceptedISO = localStorage.getItem("__disclaimerAcceptedDate");
      const acceptedStr = acceptedISO ? new Date(acceptedISO).toLocaleDateString(dateLang, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Unknown";

      let logoB64 = "";
      let badgeB64 = "";
      try {
        const [logoResp, badgeResp] = await Promise.all([fetch("/__data__/logoSmall.png"), fetch("/__data__/appstore.png")]);
        const [logoBlob, badgeBlob] = await Promise.all([logoResp.blob(), badgeResp.blob()]);
        const toB64 = (blob) =>
          new Promise((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result);
            r.readAsDataURL(blob);
          });
        [logoB64, badgeB64] = await Promise.all([toB64(logoBlob), toB64(badgeBlob)]);
      } catch {}

      const { Document, Page, Text, View, Image, Link, StyleSheet, pdf } = await import("@react-pdf/renderer");

      const s = StyleSheet.create({
        page: { fontFamily: "Times-Roman", padding: 32, color: "#222" },
        logoWrap: { alignItems: "center", marginBottom: 12 },
        logo: { width: 48, height: 48, borderRadius: 10 },
        title: { fontSize: 22, letterSpacing: 4, textAlign: "center" },
        subtitle: { textAlign: "center", color: "#555", fontSize: 11, letterSpacing: 3, marginTop: 4 },
        edition: { textAlign: "center", color: "#999", fontSize: 9, letterSpacing: 2, marginTop: 2 },
        meta: { color: "#444", fontSize: 12, marginTop: 8 },
        hr: { borderBottomWidth: 1, borderBottomColor: "#ddd", marginVertical: 16 },
        userRow: { marginBottom: 4, flexDirection: "row", flexWrap: "wrap" },
        userLabel: { color: "#888", fontSize: 12, fontFamily: "Times-Bold" },
        userText: { color: "#222", fontSize: 12 },
        spiritRow: { marginBottom: 12, flexDirection: "row", flexWrap: "wrap" },
        spiritLabel: { color: "#b45309", fontSize: 12, fontFamily: "Times-Bold" },
        spiritText: { color: "#222", fontSize: 12, letterSpacing: 1 },
        footer: { color: "#aaa", fontSize: 9, textAlign: "center" },
        badgeWrap: { alignItems: "center", marginTop: 16 },
        badge: { height: 36 },
      });

      const el = React.createElement;
      const element = el(Document, null, el(Page, { size: "A4", style: s.page }, logoB64 ? el(View, { style: s.logoWrap }, el(Image, { src: logoB64, style: s.logo })) : null, el(Text, { style: s.title }, "PLANCHETTE"), el(Text, { style: s.subtitle }, t("THE TALKING BOARD \u2014 SESSION LOG")), el(Text, { style: s.edition }, "SELF-HOSTED EDITION"), el(Text, { style: s.meta }, ti("Date: {date}", { date })), el(Text, { style: s.meta }, ti("Disclaimer accepted: {date}", { date: acceptedStr })), el(View, { style: s.hr }), ...log.map((entry, i) => (entry.role === "user" ? el(View, { key: i, style: s.userRow }, el(Text, { style: s.userLabel }, t("You:") + " "), el(Text, { style: s.userText }, entry.text)) : el(View, { key: i, style: s.spiritRow }, el(Text, { style: s.spiritLabel }, t("Spirit:") + " "), el(Text, { style: s.spiritText }, entry.text)))), el(View, { style: s.hr }), el(Text, { style: s.footer }, t("Generated by Planchette \u2014 AI Spirit Talking Board")), badgeB64 ? el(View, { style: s.badgeWrap }, el(Link, { src: "https://apps.apple.com/us/app/planchette-the-talking-board/id6759858464" }, el(Image, { src: badgeB64, style: s.badge }))) : null));

      const blob = await pdf(element).toBlob();
      const dateSlug = new Date().toISOString().split("T")[0];
      const hash = Math.random().toString(36).substring(2, 10);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Planchette-Session-${dateSlug}-${hash}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [log, exporting]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !busy) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center select-none px-3 sm:px-4 relative" style={{ backgroundColor: theme.colors.boardBg, "--theme-active": theme.colors.activeColor, "--theme-glow-rgb": theme.colors.glowRgb, "--theme-spinner-rgb": theme.colors.spinnerRgb }}>
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-3 right-3 p-2 rounded-lg transition-colors z-10 cursor-pointer"
        style={{ color: theme.colors.uiTextDim }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = theme.colors.uiText;
          e.currentTarget.style.backgroundColor = theme.colors.uiAccent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme.colors.uiTextDim;
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        title="Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        onClick={() => setShowThemes(true)}
        className="absolute top-3 left-3 sm:top-14 sm:left-auto sm:right-3 p-2 rounded-lg transition-colors z-10 cursor-pointer"
        style={{ color: theme.colors.uiTextDim }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = theme.colors.uiText;
          e.currentTarget.style.backgroundColor = theme.colors.uiAccent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme.colors.uiTextDim;
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        title="Themes"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" stroke="currentColor" strokeWidth="0.2" d="M20 14c-.092.064-2 2.083-2 3.5c0 1.494.949 2.448 2 2.5c.906.044 2-.891 2-2.5c0-1.5-1.908-3.436-2-3.5M9.586 20c.378.378.88.586 1.414.586s1.036-.208 1.414-.586l7-7l-.707-.707L11 4.586L8.707 2.293L7.293 3.707L9.586 6L4 11.586c-.378.378-.586.88-.586 1.414s.208 1.036.586 1.414zM11 7.414L16.586 13H5.414z" />
        </svg>
      </button>

      <div className="flex items-center gap-2 mt-4 relative w-full justify-center">
        <img src="/__data__/logoSmall.png" alt="" className="h-7 sm:h-9 opacity-80 smoke-text" />
        <h1 className="text-2xl sm:text-3xl font-serif tracking-widest uppercase smoke-text" style={{ color: "rgba(253,230,138,0.8)" }}>
          Planchette
        </h1>
        {DEBUG && (
          <button onClick={() => setShowDebug((v) => !v)} className="absolute left-0 p-1 text-amber-200/30 opacity-50 hover:opacity-100 transition-opacity" title="Debug">
            <span className="text-lg">&#9881;</span>
          </button>
        )}
      </div>

      {showDebug && (
        <div className="w-full max-w-2xl bg-black/85 border border-amber-200/20 rounded-lg p-2.5 mb-2 font-mono text-[10px] text-amber-200/80 leading-relaxed">
          <div className="text-[11px] font-bold text-amber-400 mb-0.5">Debug</div>
          <div>
            Last response: {debugInfo.lastResponseMs}ms / {debugInfo.lastTokens} tokens
          </div>
          <div>
            History: {debugInfo.lastHistoryLen}/{debugInfo.lastHistoryLimit}
          </div>
          {debugInfo.lastCrisisInput !== "" && (
            <>
              <div className="text-[11px] font-bold text-amber-400 mt-1 mb-0.5">Crisis Classifier</div>
              <div>Input: {debugInfo.lastCrisisInput}</div>
              <div>LLM raw: &quot;{debugInfo.lastCrisisLlmRaw}&quot;</div>
              <div>Result: {debugInfo.lastCrisisResult}</div>
            </>
          )}
          <label className="flex items-center gap-1.5 mt-1 mb-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verboseLog}
              onChange={(e) => {
                const next = e.target.checked;
                setVerboseLog(next);
                verboseLogRef.current = next;
              }}
              className="w-3.5 h-3.5 accent-amber-600 rounded"
            />
            <span>Token logging</span>
          </label>
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={() => {
                setLog([]);
                setRevealedLetters([]);
              }}
              className="px-2.5 py-1 border border-amber-200/30 rounded text-amber-400 hover:bg-amber-900/30 transition-colors"
            >
              Clear Session
            </button>
            <button onClick={handleStop} className="px-2.5 py-1 border border-red-500/40 rounded text-red-500 hover:bg-red-900/20 transition-colors">
              Stop
            </button>
          </div>
        </div>
      )}
      <p className="text-[10px] mb-4 sm:text-xs sm:mb-4 tracking-[0.3em] uppercase subtitle-fade" style={{ color: "rgba(253,230,138,0.3)" }}>
        {t("THE TALKING BOARD")}
      </p>

      <div className={`relative w-full max-w-2xl aspect-[4/3] mx-auto cursor-pointer rounded-3xl ${transitioning ? "board-awaken" : ""} ${boardEffect === "shake" ? "board-shake" : ""} ${boardEffect === "glow" ? "board-glow" : ""} ${boardEffect === "flicker" ? "board-flicker" : ""} ${boardEffect === "fadeout" ? "board-fadeout" : ""}`} onClick={!started && !transitioning ? startSession : undefined}>
        <div className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden" style={{ borderWidth: "1.5px", borderStyle: "solid", borderColor: theme.colors.boardBorder, backgroundColor: theme.colors.boardBg }}>
          <div className="absolute inset-0" style={{ backgroundColor: theme.colors.boardGradient }} />
          <theme.BoardDecorations />
        </div>

        {!started && (
          <div
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-[2px] ${transitioning ? "overlay-dissolve" : ""}`}
            onAnimationEnd={() => {
              if (transitioning) {
                setStarted(true);
                setTransitioning(false);
              }
            }}
          >
            <img src="/__data__/logoSmall.png" alt="" className="h-12 sm:h-16 opacity-70 mb-3" />
            <h2 className="text-xl sm:text-2xl font-serif tracking-widest uppercase" style={{ color: "rgba(253,230,138,0.8)" }}>
              Planchette
            </h2>
            <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase mt-1 mb-6" style={{ color: "rgba(253,230,138,0.3)" }}>
              {t("THE TALKING BOARD")}
            </p>

            {(modelStatus === "checking" || modelStatus === "idle") && (
              <p className="text-xs sm:text-sm tracking-widest uppercase animate-pulse" style={{ color: theme.colors.uiTextDim }}>
                {t("Preparing...")}
              </p>
            )}

            {modelStatus === "downloading" && (
              <div className="text-center space-y-2 w-3/4">
                <p className="text-xs sm:text-sm" style={{ color: theme.colors.uiTextDim }}>
                  {ti("Summoning the spirits... {progress}%", { progress: Math.round(downloadProgress * 100) })}
                </p>
                <div className="w-48 sm:w-64 mx-auto progress-track">
                  <div className="progress-fill" style={{ width: `${downloadProgress * 100}%` }} />
                </div>
              </div>
            )}

            {modelStatus === "loading" && (
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm animate-pulse" style={{ color: theme.colors.uiTextDim }}>
                  {t("Awakening the spirits...")}
                </p>
              </div>
            )}

            {modelStatus === "ready" && (
              <button onClick={startSession} className="px-8 py-2.5 rounded-lg text-sm tracking-widest uppercase transition-colors cursor-pointer" style={{ backgroundColor: theme.colors.uiAccent, borderWidth: "1px", borderStyle: "solid", borderColor: theme.colors.uiBorder, color: theme.colors.uiText }}>
                {t("Begin Session")}
              </button>
            )}

            {modelStatus === "error" && (
              <div className="text-center space-y-3">
                <p className="text-red-400/70 text-xs sm:text-sm">{t("The spirits could not be reached.")}</p>
                <button
                  onClick={() => {
                    fetch("/api/model/download", { method: "POST" });
                    setModelStatus("downloading");
                    startPolling();
                  }}
                  className="px-6 py-2 rounded-lg text-sm transition-colors"
                  style={{ backgroundColor: theme.colors.uiAccent, borderWidth: "1px", borderStyle: "solid", borderColor: theme.colors.uiBorder, color: theme.colors.uiTextDim }}
                >
                  {t("Try Again")}
                </button>
              </div>
            )}
          </div>
        )}

        {Object.entries(BOARD_ITEMS)
          .filter(([k]) => k !== "_REST")
          .map(([key, pos]) => {
            const isActive = activeKey === key;
            const isWord = key.length > 1;
            return (
              <div
                key={key}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200
                  ${isWord ? "text-[10px] sm:text-sm tracking-wider font-serif" : "text-sm sm:text-xl font-serif"}
                  ${isActive ? "scale-125" : ""}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  color: isActive ? theme.colors.activeColor : theme.colors.letterColor,
                  textShadow: isActive ? `0 0 18px ${theme.colors.activeGlow}` : `0 0 4px ${theme.colors.letterShadow}`,
                }}
              >
                {key}
              </div>
            );
          })}

        <div className="absolute pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]" style={{ left: `${shadowPos.x + shadowOffset.x}%`, top: `${shadowPos.y + shadowOffset.y}%`, width: "11%", aspectRatio: "428/456", transform: "translate(-50%, -50%)", backgroundColor: "rgba(0,0,0,0.12)", borderRadius: "50%", filter: "blur(6px)" }} />

        {dustParticles.map((p) => (
          <div key={p.id} className="absolute pointer-events-none rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: 6, height: 6, backgroundColor: theme.colors.wood[2 + p.color] || theme.colors.wood[2], opacity: p.opacity, transform: `translate(-50%, -50%) translate(${p.drifted ? p.dx * 12 : 0}px, ${p.drifted ? p.dy * 8 : 0}px) scale(${p.drifted ? 0 : p.scale})`, transition: p.drifted ? "opacity 0.8s ease-out, transform 0.8s ease-out" : "none" }} />
        ))}

        <div className="absolute pointer-events-none transition-all duration-[800ms] ease-[cubic-bezier(0.3,0.1,0.25,1)]" style={{ left: `${ghostPos.x}%`, top: `${ghostPos.y}%`, width: "12.5%", aspectRatio: "428/456", transform: `translate(-50%, -56%) rotate(${ghostRotate}deg)`, opacity: ghostOpacity, transition: "left 0.8s cubic-bezier(0.3,0.1,0.25,1), top 0.8s cubic-bezier(0.3,0.1,0.25,1), transform 0.8s cubic-bezier(0.3,0.1,0.25,1), opacity 0.4s ease-out" }}>
          <PlanchetteSvg className="w-full h-full" wood1={theme.colors.wood[0]} wood2={theme.colors.wood[1]} wood3={theme.colors.wood[2]} wood4={theme.colors.wood[3]} wood5={theme.colors.wood[4]} crystal={theme.colors.crystal} />
        </div>

        <div className="absolute pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]" style={{ left: `${planchettePos.x}%`, top: `${planchettePos.y}%`, width: "12.5%", aspectRatio: "428/456", transform: `translate(-50%, -56%) rotate(${moveRotate}deg)` }}>
          <div className={`w-full h-full ${idleAnimClass || ""}`}>
            <PlanchetteSvg className={`w-full h-full ${waiting ? "planchette-hover" : ""}`} style={{ filter: `drop-shadow(0 0 24px ${theme.colors.glowColor}40)` }} wood1={theme.colors.wood[0]} wood2={theme.colors.wood[1]} wood3={theme.colors.wood[2]} wood4={theme.colors.wood[3]} wood5={theme.colors.wood[4]} crystal={theme.colors.crystal} />
          </div>
        </div>

        <PoltergeistCanvas trigger={poltergeistTrigger} colors={{ effectPrimary: theme.colors.effectPrimary, effectSecondary: theme.colors.effectSecondary, effectHighlight: theme.colors.effectHighlight }} />
      </div>

      {started && revealedLetters.length > 0 && (
        <div className="text-sm mt-2 sm:text-lg mt-4 px-6 py-1 max-w-2xl text-center font-mono tracking-[0.05em] flex flex-wrap justify-center">
          {revealedLetters.map((item) =>
            item.key === "_BREAK" ? (
              <span key={item.id} className="inline-block w-5" />
            ) : item.key === "_DOT" ? (
              <span key={item.id} className="inline-block animate-[letterReveal_0.5s_ease-out_forwards] mx-[1px]" style={{ color: theme.colors.uiSpiritText }}>
                .
              </span>
            ) : item.key.length > 1 ? (
              item.key.split("").map((ch, i) => (
                <span key={`${item.id}-${i}`} className="inline-block animate-[letterReveal_0.5s_ease-out_forwards] mx-[1px]" style={{ color: theme.colors.activeColor }}>
                  {ch}
                </span>
              ))
            ) : (
              <span key={item.id} className="inline-block animate-[letterReveal_0.5s_ease-out_forwards] mx-[1px]" style={{ color: theme.colors.activeColor }}>
                {item.key}
              </span>
            ),
          )}
        </div>
      )}

      {started && (
        <div className="mt-4 mb-8 w-full max-w-2xl ui-slide-in">
          <div className="flex gap-3">
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 150))} onKeyDown={handleKeyDown} maxLength={150} placeholder={busy ? t("The spirits are speaking…") : t("Ask the spirits…")} className="flex-1 min-w-0 text-base py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg outline-none transition-colors" style={{ backgroundColor: theme.colors.uiInputBg, borderWidth: "1px", borderStyle: "solid", borderColor: theme.colors.uiBorder, color: theme.colors.uiText }} />
            {busy ? (
              <button onClick={handleBusyTap} className={`w-[60px] flex items-center justify-center py-3 border rounded-lg transition-colors ${askTapped ? "bg-red-500/25 border-red-500/40" : ""}`} style={askTapped ? {} : { backgroundColor: theme.colors.uiAccent, borderColor: theme.colors.uiBorder }}>
                {askTapped ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                ) : <div className="ask-spinner" />}
              </button>
            ) : (
              <button onClick={handleAsk} disabled={!question.trim()} className="w-[60px] flex items-center justify-center py-3 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{ backgroundColor: theme.colors.uiAccent, borderWidth: "1px", borderStyle: "solid", borderColor: theme.colors.uiBorder, color: theme.colors.uiText }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            )}
          </div>

          {showHelpline && (
            <div
              className={`mt-3 space-y-2 ${showHelpline === "closing" ? "helpline-out" : ""}`}
              onAnimationEnd={() => {
                if (showHelpline === "closing") setShowHelpline(false);
              }}
            >
              <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="helpline-pulse w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/30 hover:bg-red-900/30 border border-red-900/30 rounded-lg text-red-300/70 text-xs sm:text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {t("Need to talk to someone? Find a helpline")}
              </a>
              <p className="helpline-disclaimer text-[10px] sm:text-xs text-neutral-500 text-center leading-relaxed">{t("Planchette is an entertainment app powered by a language model. It is not a real spirit and cannot offer guidance or support, click the link above to find someone who can. If you are in crisis, please reach out to a trusted person or contact a helpline immediately.")}</p>
            </div>
          )}

          {log.length > 0 && (
            <>
              <div className="mt-6 space-y-2 text-xs max-h-36 sm:text-sm sm:max-h-48 overflow-y-auto">
                {(() => {
                  const pairs = [];
                  for (let j = 0; j < log.length; j += 2) {
                    const userEntry = log[j];
                    const spiritEntry = log[j + 1];
                    pairs.push({ userEntry, spiritEntry, idx: j });
                  }
                  const isLastPairWaiting = busy && pairs.length > 0 && !pairs[pairs.length - 1].spiritEntry;
                  let newestSpiritIdx = -1;
                  for (let j = pairs.length - 1; j >= 0; j--) {
                    if (pairs[j].spiritEntry) {
                      newestSpiritIdx = pairs[j].idx;
                      break;
                    }
                  }
                  return [...pairs].reverse().map(({ userEntry, spiritEntry, idx }, i) => {
                    const hasAnswer = !!spiritEntry;
                    return (
                      <div key={idx} className="log-pair flex items-center gap-1.5">
                        {/* Share icon or crisis-blocked icon */}
                        {spiritEntry?.crisis ? (
                          <span className="flex-shrink-0 p-1 opacity-40" title="Sharing disabled for this response">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.4)" strokeWidth="2" strokeLinecap="round">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M4.93 4.93l14.14 14.14" />
                            </svg>
                          </span>
                        ) : (
                          <button onClick={hasAnswer ? () => setShareData({ question: userEntry.text, answer: spiritEntry.text }) : undefined} disabled={!hasAnswer} className={`flex-shrink-0 p-1 rounded transition-all ${hasAnswer ? "cursor-pointer opacity-40 hover:opacity-80" : "opacity-20 cursor-default"}`} style={{ color: theme.colors.uiSpiritText }} title={hasAnswer ? "Share as card" : "Waiting for response..."}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2L12 15M12 2L8 6M12 2L16 6" />
                              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" />
                            </svg>
                          </button>
                        )}
                        {/* Question + answer block */}
                        <div className="flex-1 border-l-2 pl-2 py-1 space-y-0.5" style={{ borderColor: theme.colors.uiLogBorder }}>
                          <div style={{ color: "rgba(163,163,163,0.6)" }}>
                            <span className="mr-2 font-mono" style={{ color: "rgba(115,115,115,0.6)" }}>
                              {t("You:")}
                            </span>
                            {userEntry.text}
                          </div>
                          {spiritEntry ? (
                            <div className={spiritEntry.crisis ? "text-red-400/70 font-mono tracking-wider" : "font-mono tracking-wider"} style={spiritEntry.crisis ? {} : { color: theme.colors.uiSpiritText }}>
                              <span className="mr-2" style={{ color: "rgba(115,115,115,0.6)" }}>
                                {t("Spirit:")}
                              </span>
                              {idx === newestSpiritIdx
                                ? spiritEntry.text.split("").map((ch, ci) =>
                                    ch === " " ? (
                                      <span key={ci} className="log-letter-space" />
                                    ) : (
                                      <span key={ci} className="log-letter" style={{ animationDelay: `${ci * 50}ms` }}>
                                        {ch}
                                      </span>
                                    ),
                                  )
                                : spiritEntry.text}
                              {spiritEntry.crisis && (
                                <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center ml-2 text-red-400/50 hover:text-red-400/80 transition-colors align-middle" title="Find a helpline">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          ) : (
                            i === 0 &&
                            isLastPairWaiting && (
                              <div className="font-mono tracking-wider" style={{ color: theme.colors.uiSpiritText, opacity: 0.7 }}>
                                <span className="mr-2" style={{ color: "rgba(115,115,115,0.6)" }}>
                                  {t("Spirit:")}
                                </span>
                                <span className="typing-dot">.</span>
                                <span className="typing-dot">.</span>
                                <span className="typing-dot">.</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <button onClick={exportPDF} disabled={exporting} className="mt-3 w-full rounded-lg text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-2" style={{ height: 38, borderWidth: "1px", borderStyle: "solid", borderColor: theme.colors.uiBorder, backgroundColor: theme.colors.uiAccent, color: theme.colors.uiTextDim, opacity: exporting ? 0.5 : 1, cursor: exporting ? "not-allowed" : "pointer" }}>
                {exporting && <div className="ask-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
                {exporting ? t("Exporting\u2026") : t("Export this Session")}
              </button>
            </>
          )}
        </div>
      )}

      <Footer onAbout={() => setShowAbout(true)} onDisclaimer={() => setShowDisclaimer(true)} />

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showDisclaimer && (
        <DisclaimerModal
          mandatory={!disclaimerAccepted}
          onClose={() => {
            setShowDisclaimer(false);
            if (localStorage.getItem("__disclaimerAccepted") === "true") {
              setDisclaimerAccepted(true);
            }
          }}
        />
      )}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showThemes && <ThemeSelectorModal onClose={() => setShowThemes(false)} />}
      {shareData && <ShareCardModal question={shareData.question} answer={shareData.answer} onClose={() => setShareData(null)} />}
    </div>
  );
}
