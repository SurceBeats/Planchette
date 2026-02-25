import React, { useState, useEffect, useRef, useCallback } from "react";
import AboutModal from "./AboutModal";
import DisclaimerModal from "./DisclaimerModal";
import SettingsModal from "./SettingsModal";
import Footer from "./Footer";

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
    body: JSON.stringify({ question, history }),
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
  const [planchettePos, setPlanchettePos] = useState(BOARD_ITEMS["_REST"]);
  const [activeKey, setActiveKey] = useState(null);
  const [question, setQuestion] = useState("");
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(() => localStorage.getItem("__disclaimerShown") !== "true");
  const [showSettings, setShowSettings] = useState(false);
  const [started, setStarted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [boardEffect, setBoardEffect] = useState(null);
  const boardEffectTimer = useRef(null);
  const animSpeedRef = useRef(1000);

  const audioRef = useRef(null);
  const interactRef = useRef(null);
  const angerRef = useRef(null);

  const [modelStatus, setModelStatus] = useState("checking");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const pollingRef = useRef(null);
  const abortRef = useRef(null);

  const [waiting, setWaiting] = useState(false);
  const waitTimerRef = useRef(null);

  const [showHelpline, setShowHelpline] = useState(false);
  const historyLimitRef = useRef(80);
  const DEBUG = true;
  const [debugPerf, setDebugPerf] = useState(null);

  const crisisRef = useRef(false);

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
    if (!angerRef.current) {
      const sfx = new Audio("/__data__/anger.mp3");
      sfx.volume = 0.3;
      angerRef.current = sfx;
    }
  }, []);

  const startSession = useCallback(() => {
    if (started || transitioning) return;
    setTransitioning(true);
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
    if (interactRef.current) {
      interactRef.current.currentTime = 0;
      interactRef.current.play().catch(() => {});
    }
  }, [started, transitioning]);

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
        const status = d.status === "ready" ? "ready" : d.status === "downloading" ? "downloading" : "idle";
        setModelStatus(status);
        setDownloadProgress(d.progress || 0);
        if (status === "downloading") startPolling();
      })
      .catch(() => setModelStatus("idle"));
  }, []);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      try {
        const r = await fetch("/api/model/status");
        const d = await r.json();
        setModelStatus(d.status);
        setDownloadProgress(d.progress || 0);
        if (d.status === "ready" || d.status === "error") {
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
  const wordBufRef = useRef("");

  const moveTo = useCallback((key) => {
    const pos = BOARD_ITEMS[key];
    if (pos) {
      setPlanchettePos(pos);
      setActiveKey(key);
    }
  }, []);

  const rest = useCallback(() => {
    setPlanchettePos(BOARD_ITEMS["_REST"]);
    setActiveKey(null);
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
        if (angerRef.current) {
          angerRef.current.currentTime = 0;
          angerRef.current.play().catch(() => {});
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
      setRevealedLetters([]);
      animQueueRef.current = [];
      animatingRef.current = false;
      revealedRef.current = "";
      needsBreakRef.current = false;
      afterEllipsisRef.current = false;
      hasEmittedRef.current = false;
      needsDotSepRef.current = false;
      wordBufRef.current = "";
      crisisRef.current = false;

      const controller = new AbortController();
      abortRef.current = controller;

      if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
      waitTimerRef.current = setTimeout(() => setWaiting(true), 150);

      const recentLog = log.slice(-historyLimitRef.current);
      const history = recentLog.map((entry) => ({
        role: entry.role === "user" ? "user" : "assistant",
        content: entry.text,
      }));

      try {
        await streamQuestion(q, {
          signal: controller.signal,
          history,
          onCrisis() {
            crisisRef.current = true;
            setShowHelpline(true);
          },
          onToken(token) {
            if (waitTimerRef.current) {
              clearTimeout(waitTimerRef.current);
              waitTimerRef.current = null;
            }
            setWaiting(false);
            const clean = cleanToken(token);

            if (!clean) {
              if (wordBufRef.current) {
                const flushed = lettersOf(wordBufRef.current);
                wordBufRef.current = "";
                if (flushed.length) enqueueAnim(flushed);
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

            const stripped = token.replace(/\.\.\./g, "");
            const hasLeadingSpace = /^\s/.test(stripped);
            const shouldBreak = needsBreakRef.current || (hasLeadingSpace && hasEmittedRef.current && !afterEllipsisRef.current);

            if (shouldBreak && wordBufRef.current) {
              const flushed = lettersOf(wordBufRef.current);
              wordBufRef.current = "";
              if (flushed.length) enqueueAnim(flushed);
            }

            wordBufRef.current += clean;
            const buf = wordBufRef.current;

            const matchedWord = BOARD_WORDS.find((w) => buf === w);
            if (matchedWord) {
              wordBufRef.current = "";
              needsBreakRef.current = false;
              afterEllipsisRef.current = false;

              if (matchedWord === "NO" && Math.random() < 0.2) triggerEffect("shake", 7000);
              else if (matchedWord === "YES" && Math.random() < 0.1) triggerEffect("glow", 5000);
              else if (matchedWord === "MAYBE" && Math.random() < 0.4) triggerEffect("flicker", 1500);
              else if (matchedWord === "GOODBYE") triggerEffect("fadeout", 2500);

              const targets = [matchedWord];
              hasEmittedRef.current = true;
              needsDotSepRef.current = matchedWord !== "GOODBYE";
              if (shouldBreak) {
                enqueueAnim(["_BREAK", ...targets]);
              } else {
                enqueueAnim(targets);
              }
              return;
            }

            const couldMatch = BOARD_WORDS.some((w) => w.startsWith(buf));
            if (couldMatch) return;

            wordBufRef.current = "";
            const targets = lettersOf(buf);
            if (!targets.length) return;

            const prefix = [];
            if (needsDotSepRef.current) {
              prefix.push("_DOT", "_BREAK");
              needsDotSepRef.current = false;
            } else if (shouldBreak) {
              prefix.push("_BREAK");
            }

            needsBreakRef.current = false;
            afterEllipsisRef.current = false;
            hasEmittedRef.current = true;

            enqueueAnim([...prefix, ...targets]);
          },
          onDone(_, perf) {
            if (perf?.history_limit) historyLimitRef.current = perf.history_limit;
            if (perf) setDebugPerf(perf);
            if (wordBufRef.current) {
              const remaining = lettersOf(wordBufRef.current);
              wordBufRef.current = "";
              if (remaining.length) enqueueAnim(remaining);
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

  const handleAsk = useCallback(() => {
    const q = question.trim();
    if (!q || busy) return;

    if (showHelpline) setShowHelpline("closing");
    setLog((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");

    questionQueueRef.current.push(q);
    setBusy(true);

    if (modelStatus === "ready") {
      processNextQuestion();
    } else {
      if (modelStatus !== "downloading") {
        fetch("/api/model/download", { method: "POST" });
        setModelStatus("downloading");
      }
      startPolling();
    }
  }, [question, modelStatus, processNextQuestion, startPolling]);

  const exportMarkdown = useCallback(() => {
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    let md = `# Planchette Talking Board — Session Log\n\n`;
    md += `**Date:** ${date}  \n`;
    md += `**Model:** Ouija-3B\n\n---\n\n`;
    for (const entry of log) {
      if (entry.role === "user") {
        md += `**You:** ${entry.text}\n\n`;
      } else if (entry.crisis) {
        md += `**Spirit:** ${entry.text} *(crisis alert triggered — helpline shown: [findahelpline.com](https://findahelpline.com))*\n\n`;
      } else {
        md += `**Spirit:** ${entry.text}\n\n`;
      }
    }
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planchette-session-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [log]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !busy) {
      e.preventDefault();
      handleAsk();
    }
  };

  const isDownloading = modelStatus === "downloading";

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center select-none px-3 sm:px-4 relative">
      {DEBUG && debugPerf && (
        <div className="fixed top-2 left-2 z-50 bg-black/80 border border-amber-900/40 rounded-lg px-3 py-2 font-mono text-[11px] text-amber-300/70 leading-relaxed">
          <div className="text-amber-500/90 font-bold mb-1">PERF</div>
          <div>Crisis: {debugPerf.crisis_ms}ms</div>
          <div>Response: {debugPerf.response_ms}ms</div>
          <div>Total: {debugPerf.total_ms}ms</div>
          <div>Tokens: {debugPerf.tokens}</div>
          <div>
            History: {debugPerf.history_len}/{debugPerf.history_limit}
          </div>
        </div>
      )}
      <button onClick={() => setShowSettings(true)} className="absolute top-3 right-3 p-2 rounded-lg text-amber-200/30 hover:text-amber-200/70 hover:bg-amber-200/10 transition-colors z-10" title="Settings">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      <div className="flex items-center gap-2 mt-4">
        <img src="/__data__/logoSmall.png" alt="" className="h-7 sm:h-9 opacity-80 smoke-text" />
        <h1 className="text-2xl sm:text-3xl font-serif tracking-widest text-amber-200/80 uppercase smoke-text">Planchette</h1>
      </div>
      <p className="text-[10px] mb-4 sm:text-xs sm:mb-4 tracking-[0.3em] text-amber-200/30 uppercase subtitle-fade">Talking Board</p>

      <div className={`relative w-full max-w-2xl aspect-[4/3] mx-auto cursor-pointer ${transitioning ? "board-awaken" : ""} ${boardEffect === "shake" ? "board-shake" : ""} ${boardEffect === "glow" ? "board-glow" : ""} ${boardEffect === "flicker" ? "board-flicker" : ""} ${boardEffect === "fadeout" ? "board-fadeout" : ""}`} onClick={!started && !transitioning ? startSession : undefined}>
        <div className="absolute inset-0 rounded-2xl border border-amber-900/40 bg-gradient-to-b from-amber-950/30 via-neutral-900 to-neutral-950 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-700 to-transparent" />
        </div>

        {!started && (
          <div
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px] ${transitioning ? "overlay-dissolve" : ""}`}
            onAnimationEnd={() => {
              if (transitioning) {
                setStarted(true);
                setTransitioning(false);
              }
            }}
          >
            <p className="text-amber-200/60 text-xs sm:text-sm tracking-widest uppercase animate-pulse">Click on the board to begin</p>
            <p className="text-amber-200/20 text-xs tracking-wider mt-2">the spirits await</p>
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
                  ${isWord ? "text-[10px] sm:text-sm tracking-wider" : "text-sm sm:text-xl font-serif"}
                  ${isActive ? "text-amber-300 scale-125 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" : "text-amber-200/50"}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {key}
              </div>
            );
          })}

        <div className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-[4.25rem] sm:w-20 sm:h-24 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]" style={{ left: `${planchettePos.x}%`, top: `${planchettePos.y}%` }}>
          <svg viewBox="0 0 80 100" className={`w-full h-full drop-shadow-[0_0_24px_rgba(251,191,36,0.25)] ${waiting ? "planchette-hover" : ""}`}>
            <defs>
              <radialGradient id="planchette-glow" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="rgba(251,191,36,0.12)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <linearGradient id="planchette-wood" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5c3a1e" />
                <stop offset="50%" stopColor="#3d2410" />
                <stop offset="100%" stopColor="#2a1809" />
              </linearGradient>
            </defs>
            <path d="M40 6 C52 6 70 22 70 40 C70 58 56 80 40 94 C24 80 10 58 10 40 C10 22 28 6 40 6 Z" fill="url(#planchette-wood)" stroke="#8b6914" strokeWidth="1.5" opacity="0.85" />
            <path d="M40 6 C52 6 70 22 70 40 C70 58 56 80 40 94 C24 80 10 58 10 40 C10 22 28 6 40 6 Z" fill="url(#planchette-glow)" />
            <path d="M40 14 C49 14 62 26 62 40 C62 54 51 72 40 82 C29 72 18 54 18 40 C18 26 31 14 40 14 Z" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="0.8" />
            <circle cx="40" cy="36" r="10" fill="rgba(0,0,0,0.5)" stroke="#8b6914" strokeWidth="1.2" />
            <circle cx="40" cy="36" r="7" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="0.6" />
            <ellipse cx="37" cy="33" rx="3" ry="2" fill="rgba(251,191,36,0.08)" />
            <circle cx="40" cy="88" r="2.5" fill="#2a1809" stroke="#8b6914" strokeWidth="0.8" />
            <circle cx="18" cy="36" r="2.5" fill="#2a1809" stroke="#8b6914" strokeWidth="0.8" />
            <circle cx="62" cy="36" r="2.5" fill="#2a1809" stroke="#8b6914" strokeWidth="0.8" />
          </svg>
        </div>
      </div>

      {started && revealedLetters.length > 0 && (
        <div className="text-sm mt-2 sm:text-lg sm:mt-4 px-6 py-3 max-w-2xl text-center font-mono tracking-[0.05em] flex flex-wrap justify-center">
          {revealedLetters.map((item) =>
            item.key === "_BREAK" ? (
              <span key={item.id} className="inline-block w-5" />
            ) : item.key === "_DOT" ? (
              <span key={item.id} className="inline-block text-amber-300/50 animate-[letterReveal_0.5s_ease-out_forwards] mx-[1px]">
                .
              </span>
            ) : (
              <span key={item.id} className="inline-block text-amber-300 animate-[letterReveal_0.5s_ease-out_forwards] mx-[1px]">
                {item.key}
              </span>
            ),
          )}
        </div>
      )}

      {isDownloading && (
        <div className="mt-4 text-center space-y-2">
          <p className="text-amber-200/50 text-sm">Summoning the spirits… {Math.round(downloadProgress * 100)}%</p>
          <div className="w-48 sm:w-64 mx-auto progress-track">
            <div className="progress-fill" style={{ width: `${downloadProgress * 100}%` }} />
          </div>
        </div>
      )}

      {modelStatus === "error" && <p className="mt-4 text-red-400 text-sm">The spirits could not be reached. Try again.</p>}

      {started && (
        <div className="mt-6 mb-8 w-full max-w-2xl ui-slide-in">
          <div className="flex gap-3">
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 150))} onKeyDown={handleKeyDown} maxLength={150} placeholder={busy ? "The spirits are speaking…" : "Ask the spirits…"} className="flex-1 min-w-0 text-sm py-2.5 px-3 sm:text-base sm:py-3 sm:px-4 bg-neutral-900 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors" />
            <button onClick={handleAsk} disabled={!question.trim() || busy} className="px-4 text-sm sm:px-6 sm:text-base py-3 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-900/40 rounded-lg text-amber-200/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {busy ? "…" : "Ask"}
            </button>
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
                Need to talk to someone? Find a helpline
              </a>
              <p className="helpline-disclaimer text-[10px] sm:text-xs text-neutral-500 text-center leading-relaxed">Planchette is an entertainment app powered by a language model. It is not a real spirit and cannot offer guidance or support, click the link above to find someone who can. If you are in crisis, please reach out to a trusted person or contact a helpline immediately.</p>
            </div>
          )}

          {log.length > 0 && (
            <>
              <div className="mt-6 space-y-3 text-xs max-h-36 sm:text-sm sm:max-h-48 overflow-y-auto">
                {[...log].reverse().map((entry, i) => (
                  <div key={log.length - 1 - i} className={`log-entry ${entry.role === "user" ? "text-neutral-500" : entry.crisis ? "text-red-400/70 font-mono tracking-wider" : "text-amber-400/70 font-mono tracking-wider"}`}>
                    <span className="text-neutral-600 mr-2">{entry.role === "user" ? "You:" : "Spirit:"}</span>
                    {entry.text}
                    {entry.crisis && (
                      <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center ml-2 text-red-400/50 hover:text-red-400/80 transition-colors align-middle" title="Find a helpline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={exportMarkdown} className="mt-3 text-[10px] sm:text-xs text-amber-200/20 hover:text-amber-200/50 transition-colors">
                Export as Markdown
              </button>
            </>
          )}
        </div>
      )}

      <Footer onAbout={() => setShowAbout(true)} onDisclaimer={() => setShowDisclaimer(true)} />

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showDisclaimer && (
        <DisclaimerModal
          onClose={() => {
            setShowDisclaimer(false);
            localStorage.setItem("__disclaimerShown", "true");
          }}
        />
      )}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
