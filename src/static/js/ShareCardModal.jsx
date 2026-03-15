import React, { useState, useRef, useCallback, useMemo } from "react";
import TarotCard from "./TarotCard.jsx";
import { CARD_DESIGNS, CARD_ASPECT, DEFAULT_LAYOUT, DECKS } from "./cardDesigns.jsx";

const PREVIEW_WIDTH = 180;
const EXPORT_WIDTH = 828;

function hashDesign(answer) {
  let h = 0;
  for (let i = 0; i < answer.length; i++) {
    h = ((h << 5) - h + answer.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % CARD_DESIGNS.length;
}

function orderByDeck(primary) {
  const primaryDeck = CARD_DESIGNS[primary].deckId;
  const primaryDeckCards = CARD_DESIGNS.map((_, i) => i).filter((i) => CARD_DESIGNS[i].deckId === primaryDeck);
  const primaryOrdered = [primary, ...primaryDeckCards.filter((i) => i !== primary)];
  const otherDeckIds = DECKS.map((d) => d.id).filter((id) => id !== primaryDeck);
  for (let i = otherDeckIds.length - 1; i > 0; i--) {
    const j = (primary * 31 + i * 17) % (i + 1);
    [otherDeckIds[i], otherDeckIds[j]] = [otherDeckIds[j], otherDeckIds[i]];
  }
  const otherCards = otherDeckIds.flatMap((deckId) => CARD_DESIGNS.map((_, i) => i).filter((i) => CARD_DESIGNS[i].deckId === deckId));
  return [...primaryOrdered, ...otherCards];
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

  // Rounded-rect clip
  const radius = 12 * s;
  roundRectPath(ctx, 0, 0, W, H, radius);
  ctx.clip();

  // Background (cover)
  const bg = await loadImg(design.src);
  drawCover(ctx, bg, 0, 0, W, H);

  // Overlay
  ctx.fillStyle = `rgba(0,0,0,${layout.overlayOpacity})`;
  ctx.fillRect(0, 0, W, H);

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
  ctx.fillText("THE TALKING BOARD", W / 2, subY);

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
    ctx.fillText("YOU ASKED", W / 2, curY);
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
  ctx.fillText("THE SPIRIT SPOKE", W / 2, curY);

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

/* ── Component ── */

export default function ShareCardModal({ question, answer, onClose }) {
  const primaryDesign = useMemo(() => hashDesign(answer), [answer]);
  const designOrder = useMemo(() => orderByDeck(primaryDesign), [primaryDesign]);
  const deckGroups = useMemo(() => {
    const groups = [];
    for (const idx of designOrder) {
      const card = CARD_DESIGNS[idx];
      const last = groups[groups.length - 1];
      if (last && last.deckId === card.deckId) {
        last.indices.push(idx);
      } else {
        groups.push({ deckId: card.deckId, deckName: card.deckName, deckColor: card.deckColor, indices: [idx] });
      }
    }
    return groups;
  }, [designOrder]);

  const [selectedDesign, setSelectedDesign] = useState(primaryDesign);
  const [hideQR, setHideQR] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [closing, setClosing] = useState(false);

  const showQR = !hideQR;

  const handleClose = () => setClosing(true);

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
      onClick={handleClose}
      onAnimationEnd={() => {
        if (closing) onClose();
      }}
    >
      <div className={`relative w-full max-w-[400px] max-h-[85vh] overflow-y-auto rounded-2xl mx-4 ${closing ? "modal-panel-out" : "modal-panel-in"}`} style={{ backgroundColor: "#1a1a1a", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(120,75,20,0.3)", padding: 24 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <h2 className="text-lg font-serif tracking-[4px] text-center mb-4" style={{ color: "rgba(253,230,138,0.8)" }}>
          SHARE AS CARD
        </h2>

        {/* Card preview */}
        <div className="flex justify-center mb-4">
          <div style={{ borderRadius: 10, overflow: "hidden", lineHeight: 0 }}>
            <TarotCard question={question} answer={answer} designIndex={selectedDesign} width={PREVIEW_WIDTH} showQR={showQR} showQuestion={showQuestion} />
          </div>
        </div>

        {/* Design selector — grouped by deck */}
        {CARD_DESIGNS.length > 1 && (
          <div className="overflow-x-auto mb-1.5" style={{ marginLeft: -4, marginRight: -4 }}>
            <div className="flex gap-0 px-1" style={{ width: "max-content" }}>
              {deckGroups.map((group, gi) => (
                <div key={group.deckId} className="flex flex-col items-center" style={{ marginLeft: gi > 0 ? 12 : 0 }}>
                  <div className="flex gap-1.5">
                    {group.indices.map((designIdx) => (
                      <button key={CARD_DESIGNS[designIdx].id} onClick={() => setSelectedDesign(designIdx)} className="cursor-pointer" style={{ padding: 0, background: "none", border: "none" }}>
                        <div
                          style={{
                            width: 52,
                            height: Math.round(52 * CARD_ASPECT),
                            borderRadius: 6,
                            overflow: "hidden",
                            borderWidth: 2,
                            borderStyle: "solid",
                            borderColor: selectedDesign === designIdx ? group.deckColor : "transparent",
                          }}
                        >
                          <img src={CARD_DESIGNS[designIdx].src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} draggable={false} />
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 w-full">
                    <span className="font-serif text-[10px] whitespace-nowrap" style={{ color: group.deckColor, opacity: 0.7 }}>
                      {group.deckName} Collection
                    </span>
                    <div className="flex-1 h-[1.5px] rounded-full" style={{ backgroundColor: group.deckColor, opacity: 0.4 }} />
                  </div>
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
              Hide QR
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
              Add Question
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
              Download Card
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
          Close
        </button>
      </div>
    </div>
  );
}
