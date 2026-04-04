import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import TarotCard from "./TarotCard.jsx";
import { CARD_DESIGNS, CARD_ASPECT, DEFAULT_LAYOUT, DECKS } from "./cardDesigns.jsx";
import { t, useLanguageRefresh } from "./i18n.jsx";

const PREVIEW_WIDTH = 180;
const EXPORT_WIDTH = 828;
const THUMB_W = 52;
const THUMB_H = Math.round(THUMB_W * CARD_ASPECT);
const PEEK = Math.round(THUMB_W * 0.25);

function hashDesign(answer) {
  let h = 0;
  for (let i = 0; i < answer.length; i++) {
    h = ((h << 5) - h + answer.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % CARD_DESIGNS.length;
}

function sanitizeFilename(answer) {
  return answer
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .toLowerCase();
}

function buildFilename(answer) {
  const response = sanitizeFilename(answer) || "card";
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  return `Planchette-Tarot-Card-${response}-${date}.png`;
}

/* ── Canvas 2D export (replaces html2canvas) ── */

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const cr = w / h;
  let sx, sy, sw, sh;
  if (ir > cr) {
    sh = img.height;
    sw = sh * cr;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / cr;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  if (!words.length) return [text];
  const lines = [];
  let line = words[0];
  for (let i = 1; i < words.length; i++) {
    const test = line + " " + words[i];
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = words[i];
    } else line = test;
  }
  lines.push(line);
  return lines;
}

async function renderExportCanvas({ question, answer, designIndex, showQR, showQuestion }) {
  const design = CARD_DESIGNS[designIndex] ?? CARD_DESIGNS[0];
  const layout = design.layout ?? DEFAULT_LAYOUT;
  const W = EXPORT_WIDTH;
  const H = Math.round(W * CARD_ASPECT);
  const s = W / 360;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background (cover) — no artificial clip, card images carry their own transparency
  const bg = await loadImg(design.src);
  drawCover(ctx, bg, 0, 0, W, H);

  // Overlay — source-atop so it only darkens where the card image has pixels
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = `rgba(0,0,0,${layout.overlayOpacity})`;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";

  // Shadow helpers
  const shadow = () => {
    ctx.shadowColor = "rgba(0,0,0,1)";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 16;
  };
  const noShadow = () => {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  // Logo
  const logo = await loadImg("/__data__/logoSmall.png");
  const logoSz = layout.logo.size * s;
  shadow();
  ctx.drawImage(logo, (W - logoSz) / 2, layout.logo.top * s, logoSz, logoSz);
  noShadow();

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  shadow();

  // Title
  const titleFs = layout.title.fontSize * s;
  ctx.fillStyle = "#FEF3C7";
  ctx.font = `700 ${titleFs}px Georgia, "Times New Roman", serif`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${layout.title.letterSpacing * s}px`;
  ctx.fillText("PLANCHETTE", W / 2, layout.title.top * s);

  // Subtitle
  const subFs = layout.subtitle.fontSize * s;
  ctx.fillStyle = "rgba(254,243,199,0.75)";
  ctx.font = `${subFs}px Georgia, "Times New Roman", serif`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${layout.subtitle.letterSpacing * s}px`;
  const subY = layout.title.top * s + titleFs * 1.2 + layout.subtitle.marginTop * s;
  ctx.fillText(t("THE TALKING BOARD"), W / 2, subY);

  // Answer area geometry
  const answerFontSizeBase = answer.length > 120 ? layout.answer.sizes[0] : answer.length > 60 ? layout.answer.sizes[1] : layout.answer.sizes[2];
  const answerFs = answerFontSizeBase * s;
  const spiritFs = layout.spiritLabel.fontSize * s;
  const gap = layout.spiritLabel.marginBottom * s;
  const textW = W - 2 * layout.paddingHorizontal * s;

  const spiritLh = spiritFs * 1.2;

  // Measure question with wrapping (if shown)
  const hasQuestion = showQuestion && question && question.length > 0;
  const questionFontSizeBase = hasQuestion ? (question.length > 80 ? layout.answer.sizes[0] * 0.65 : question.length > 40 ? layout.answer.sizes[0] * 0.75 : layout.answer.sizes[1] * 0.7) : 0;
  const questionFs = questionFontSizeBase * s;
  let questionLines = [];
  let questionLh = 0;
  let questionTotalH = 0;
  let youAskedH = 0;
  if (hasQuestion) {
    ctx.font = `italic ${questionFs}px Georgia, "Times New Roman", serif`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${layout.answer.letterSpacing * 0.5 * s}px`;
    questionLines = wrapLines(ctx, question, textW);
    questionLh = questionFs * 1.3;
    questionTotalH = questionLines.length * questionLh;
    youAskedH = spiritLh + 4 * s; // "YOU ASKED" label + small gap
  }

  // Measure answer with wrapping
  ctx.font = `700 ${answerFs}px "Courier New", Courier, monospace`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${layout.answer.letterSpacing * s}px`;
  const answerLines = wrapLines(ctx, answer, textW);
  const answerLh = answerFs * 1.3;
  const answerTotalH = answerLines.length * answerLh;

  const totalTextH = (hasQuestion ? youAskedH + questionTotalH + gap : 0) + spiritLh + gap + answerTotalH;
  const areaTop = layout.answerTop * s;
  const qrAreaH = (showQR ? layout.qr.marginBottom + layout.qr.size : layout.noQrSpacing) * s;
  const areaH = H - areaTop - qrAreaH;
  let curY = areaTop + (areaH - totalTextH) / 2;

  // "YOU ASKED" label + question text
  if (hasQuestion) {
    ctx.fillStyle = "rgba(254,243,199,0.75)";
    ctx.font = `${spiritFs}px Georgia, "Times New Roman", serif`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${layout.spiritLabel.letterSpacing * s}px`;
    ctx.fillText(t("YOU ASKED"), W / 2, curY);
    curY += spiritLh + 4 * s;

    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.font = `italic ${questionFs}px Georgia, "Times New Roman", serif`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${layout.answer.letterSpacing * 0.5 * s}px`;
    for (let i = 0; i < questionLines.length; i++) {
      ctx.fillText(questionLines[i], W / 2, curY + i * questionLh);
    }
    curY += questionTotalH + gap;
  }

  // Spirit label
  ctx.fillStyle = "rgba(254,243,199,0.75)";
  ctx.font = `${spiritFs}px Georgia, "Times New Roman", serif`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${layout.spiritLabel.letterSpacing * s}px`;
  ctx.fillText(t("THE SPIRIT SPOKE"), W / 2, curY);

  // Answer
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${answerFs}px "Courier New", Courier, monospace`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${layout.answer.letterSpacing * s}px`;
  const ansStartY = curY + spiritLh + gap;
  for (let i = 0; i < answerLines.length; i++) {
    ctx.fillText(answerLines[i], W / 2, ansStartY + i * answerLh);
  }

  noShadow();

  // QR
  if (showQR) {
    const qr = await loadImg("/__data__/qr-appstore.png");
    const qrSz = layout.qr.size * s;
    const qrX = (W - qrSz) / 2;
    const qrY = H - layout.qr.marginBottom * s - qrSz;
    const qrR = layout.qr.borderRadius * s;
    ctx.save();
    roundRectPath(ctx, qrX, qrY, qrSz, qrSz, qrR);
    ctx.clip();
    ctx.drawImage(qr, qrX, qrY, qrSz, qrSz);
    ctx.restore();
    ctx.strokeStyle = "rgba(254,243,199,0.25)";
    ctx.lineWidth = 0.5;
    roundRectPath(ctx, qrX, qrY, qrSz, qrSz, qrR);
    ctx.stroke();
  }

  return canvas;
}

/* ── DeckItem (collapse / expand hand of cards) ── */

function DeckItem({ deck, expanded, selectedDesign, onExpand, onSelectCard }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {deck.cards.map((card, i) => {
          const designIdx = CARD_DESIGNS.findIndex((c) => c.id === card.id);
          const isSelected = designIdx === selectedDesign;

          return (
            <button
              key={card.id}
              onClick={() => (expanded ? onSelectCard(designIdx) : onExpand())}
              className="cursor-pointer"
              style={{
                padding: 0,
                background: "none",
                border: "none",
                zIndex: deck.cards.length - i,
                marginLeft: i > 0 ? (expanded ? 6 : -(THUMB_W - PEEK)) : 0,
                transition: "margin-left 0.3s ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: THUMB_W,
                  height: THUMB_H,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <img src={card.src.replace("/cards/", "/cards/thumbnails/")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} draggable={false} />
                {/* Dark overlay on peeking (collapsed) cards */}
                {i > 0 && !expanded && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 4,
                      backgroundColor: `rgba(0,0,0,${0.2 + (i / (deck.cards.length - 1)) * 0.45})`,
                      transition: "opacity 0.3s ease",
                    }}
                  />
                )}
                {/* Selection / hover border when expanded */}
                {expanded && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor: isSelected ? deck.color : "rgba(255,255,255,0.15)",
                      pointerEvents: "none",
                      transition: "border-color 0.2s ease",
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
      {/* Deck footer label + line */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 6, alignSelf: "stretch", gap: 6 }}>
        <span className="font-serif" style={{ fontSize: 10, color: deck.color, opacity: 0.85, whiteSpace: "nowrap" }}>
          {deck.name}{expanded ? " " + t("Collection") : ""}
        </span>
        <div style={{ height: 1.5, borderRadius: 1, flex: 1, backgroundColor: deck.color, opacity: 0.4 }} />
      </div>
    </div>
  );
}

/* ── Component ── */

export default function ShareCardModal({ question, answer, onClose }) {
  const primaryDesign = useMemo(() => hashDesign(answer), [answer]);
  const primaryDeckId = useMemo(() => CARD_DESIGNS[primaryDesign].deckId, [primaryDesign]);

  // Decks sorted: primary deck first (hashed card leading), then the rest
  const sortedDecks = useMemo(() => {
    const primary = DECKS.find((d) => d.id === primaryDeckId);
    const primaryCardId = CARD_DESIGNS[primaryDesign].id;
    const reorderedPrimary = {
      ...primary,
      cards: [primary.cards.find((c) => c.id === primaryCardId), ...primary.cards.filter((c) => c.id !== primaryCardId)],
    };
    const rest = DECKS.filter((d) => d.id !== primaryDeckId);
    return [reorderedPrimary, ...rest];
  }, [primaryDeckId, primaryDesign]);

  useLanguageRefresh();

  const [expandedDeckId, setExpandedDeckId] = useState(primaryDeckId);
  const [selectedDesign, setSelectedDesign] = useState(primaryDesign);
  const [hideQR, setHideQR] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [rollKey, setRollKey] = useState(0);
  const isFirstRender = useRef(true);
  const selectorRef = useRef(null);
  const deckElsRef = useRef({});

  const showQR = !hideQR;

  // Roll animation trigger on design change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setRollKey((k) => k + 1);
  }, [selectedDesign]);

  const handleExpandDeck = useCallback(
    (deck) => {
      setExpandedDeckId(deck.id);
      // Select first card of newly expanded deck
      const cardId = deck.cards[0].id;
      const designIdx = CARD_DESIGNS.findIndex((c) => c.id === cardId);
      setSelectedDesign(designIdx);
      // After CSS transition settles, ensure the start of the deck is visible
      setTimeout(() => {
        const container = selectorRef.current;
        const el = deckElsRef.current[deck.id];
        if (!container || !el) return;
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        // If the left edge of the deck is clipped, scroll so it's flush with 8px padding
        if (elRect.left < containerRect.left) {
          const diff = containerRect.left - elRect.left;
          container.scrollTo({ left: container.scrollLeft - diff - 8, behavior: "smooth" });
        }
      }, 350);
    },
    [],
  );

  // Mouse drag-to-scroll for the deck selector
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const handleDragStart = useCallback((e) => {
    const container = selectorRef.current;
    if (!container) return;
    dragState.current = { active: true, startX: e.clientX, scrollLeft: container.scrollLeft, moved: false };
    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  }, []);
  const handleDragMove = useCallback((e) => {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 3) dragState.current.moved = true;
    selectorRef.current.scrollLeft = dragState.current.scrollLeft - dx;
  }, []);
  const handleDragEnd = useCallback(() => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    const container = selectorRef.current;
    if (container) {
      container.style.cursor = "grab";
      container.style.userSelect = "";
    }
  }, []);

  const handleClose = () => setClosing(true);
  const overlayMouseDown = useRef(false);

  const handleDownload = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const canvas = await renderExportCanvas({ question, answer, designIndex: selectedDesign, showQR, showQuestion });
      const url = canvas.toDataURL("image/png", 1);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildFilename(answer);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Share error:", e);
    } finally {
      setSharing(false);
    }
  }, [sharing, question, answer, selectedDesign, showQR, showQuestion]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${closing ? "modal-overlay-out" : "modal-overlay-in"}`}
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) overlayMouseDown.current = true; }}
      onMouseUp={(e) => { if (e.target === e.currentTarget && overlayMouseDown.current) handleClose(); overlayMouseDown.current = false; }}
      onAnimationEnd={() => {
        if (closing) onClose();
      }}
    >
      <div className={`relative w-full max-w-[400px] max-h-[85vh] overflow-y-auto rounded-2xl mx-4 ${closing ? "modal-panel-out" : "modal-panel-in"}`} style={{ backgroundColor: "#1a1a1a", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(120,75,20,0.3)", padding: 24 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <h2 className="text-lg font-serif tracking-[4px] text-center mb-4" style={{ color: "rgba(253,230,138,0.8)" }}>
          {t("SHARE AS CARD")}
        </h2>

        {/* Card preview with roll animation */}
        <div className="flex justify-center mb-4">
          <div key={rollKey} className="card-roll-in" style={{ lineHeight: 0 }}>
            <TarotCard question={question} answer={answer} designIndex={selectedDesign} width={PREVIEW_WIDTH} showQR={showQR} showQuestion={showQuestion} />
          </div>
        </div>

        {/* Deck selector — collapsible hand of cards, drag-to-scroll */}
        {DECKS.length > 1 && (
          <div
            ref={selectorRef}
            className="overflow-x-auto mb-2.5"
            style={{ marginLeft: -4, marginRight: -4, cursor: "grab" }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div style={{ display: "flex", gap: 14, paddingLeft: 8, paddingRight: 8, width: "max-content", alignItems: "flex-end" }}>
              {sortedDecks.map((deck) => (
                <div key={deck.id} ref={(el) => { deckElsRef.current[deck.id] = el; }}>
                  <DeckItem
                    deck={deck}
                    expanded={deck.id === expandedDeckId}
                    selectedDesign={selectedDesign}
                    onExpand={() => { if (!dragState.current.moved) handleExpandDeck(deck); }}
                    onSelectCard={(idx) => { if (!dragState.current.moved) setSelectedDesign(idx); }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Option chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setHideQR((v) => !v)}
            className="flex items-center cursor-pointer"
            style={{
              paddingBlock: 6,
              paddingInline: 10,
              borderRadius: 20,
              border: `1px solid ${hideQR ? "rgba(251, 191, 36, 0.4)" : "rgba(255,255,255,0.1)"}`,
              backgroundColor: hideQR ? "rgba(251, 191, 36, 0.15)" : "rgba(255,255,255,0.04)",
            }}
          >
            <span className="font-serif text-xs" style={{ color: hideQR ? "rgba(253,230,138,0.8)" : "rgba(253,230,138,0.5)" }}>
              {t("Hide QR")}
            </span>
          </button>
          <button
            onClick={() => setShowQuestion((v) => !v)}
            className="flex items-center cursor-pointer"
            style={{
              paddingBlock: 6,
              paddingInline: 10,
              borderRadius: 20,
              border: `1px solid ${showQuestion ? "rgba(251, 191, 36, 0.4)" : "rgba(255,255,255,0.1)"}`,
              backgroundColor: showQuestion ? "rgba(251, 191, 36, 0.15)" : "rgba(255,255,255,0.04)",
            }}
          >
            <span className="font-serif text-xs" style={{ color: showQuestion ? "rgba(253,230,138,0.8)" : "rgba(253,230,138,0.5)" }}>
              {t("Add Question")}
            </span>
          </button>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={sharing}
          className="w-full flex items-center justify-center gap-2 rounded-xl text-[13px] cursor-pointer transition-colors mt-2"
          style={{
            height: 36,
            backgroundColor: "rgba(120,53,15,0.4)",
            border: "1px solid rgba(120,75,20,0.25)",
            color: "rgba(253,230,138,0.8)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(120,53,15,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(120,53,15,0.4)";
          }}
        >
          {sharing ? (
            <div className="ask-spinner" style={{ width: 14, height: 14, transform: "scale(0.8)" }} />
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t("Download Card")}
            </>
          )}
        </button>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="w-full rounded-xl text-[13px] text-center cursor-pointer transition-colors mt-2"
          style={{
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(120,53,15,0.3)",
            border: "1px solid rgba(120,75,20,0.25)",
            color: "rgba(253,230,138,0.5)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(120,53,15,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(120,53,15,0.3)";
          }}
        >
          {t("Close")}
        </button>
      </div>
    </div>
  );
}
