import React from "react";
import { CARD_DESIGNS, DEFAULT_LAYOUT, CARD_ASPECT } from "./cardDesigns.jsx";

export default function TarotCard({ question, answer, designIndex, width = 360, showQR = true, showQuestion = true }) {
  const design = CARD_DESIGNS[designIndex] ?? CARD_DESIGNS[0];
  const layout = design.layout ?? DEFAULT_LAYOUT;
  const height = Math.round(width * CARD_ASPECT);
  const s = width / 360;

  const answerSize = answer.length > 120 ? layout.answer.sizes[0] : answer.length > 60 ? layout.answer.sizes[1] : layout.answer.sizes[2];
  const questionSize = question && question.length > 80 ? layout.answer.sizes[0] * 0.65 : question && question.length > 40 ? layout.answer.sizes[0] * 0.75 : layout.answer.sizes[1] * 0.7;

  const shadow = "0 2px 16px rgba(0,0,0,1)";

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        flexShrink: 0,
      }}
    >
      {/* Card background image — brightness replaces the overlay to respect transparency */}
      <img src={design.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: `brightness(${1 - layout.overlayOpacity})` }} draggable={false} />

      {/* Logo */}
      <img
        src="/__data__/logoSmall.png"
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          top: layout.logo.top * s,
          left: "50%",
          transform: "translateX(-50%)",
          width: layout.logo.size * s,
          height: layout.logo.size * s,
          objectFit: "contain",
          zIndex: 1,
        }}
      />

      {/* Title block */}
      <div
        style={{
          position: "absolute",
          top: layout.title.top * s,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            color: "#FEF3C7",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: layout.title.fontSize * s,
            letterSpacing: layout.title.letterSpacing * s,
            lineHeight: 1.2,
            textShadow: shadow,
          }}
        >
          PLANCHETTE
        </div>
        <div
          style={{
            color: "rgba(254,243,199,0.75)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: layout.subtitle.fontSize * s,
            letterSpacing: layout.subtitle.letterSpacing * s,
            marginTop: layout.subtitle.marginTop * s,
            lineHeight: 1.2,
            textShadow: shadow,
          }}
        >
          THE TALKING BOARD
        </div>
      </div>

      {/* Answer content area */}
      <div
        style={{
          position: "absolute",
          top: layout.answerTop * s,
          left: layout.paddingHorizontal * s,
          right: layout.paddingHorizontal * s,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Answer block — vertically centered */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {showQuestion && question && question.length > 0 && (
            <>
              <div
                style={{
                  color: "rgba(254,243,199,0.75)",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: layout.spiritLabel.fontSize * s,
                  letterSpacing: layout.spiritLabel.letterSpacing * s,
                  lineHeight: 1.2,
                  marginBottom: 4 * s,
                  textShadow: shadow,
                }}
              >
                YOU ASKED
              </div>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.78)",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  textAlign: "center",
                  fontSize: questionSize * s,
                  letterSpacing: layout.answer.letterSpacing * 0.5 * s,
                  lineHeight: 1.3,
                  marginBottom: layout.spiritLabel.marginBottom * s,
                  textShadow: shadow,
                }}
              >
                {question}
              </div>
            </>
          )}
          <div
            style={{
              color: "rgba(254,243,199,0.75)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: layout.spiritLabel.fontSize * s,
              letterSpacing: layout.spiritLabel.letterSpacing * s,
              lineHeight: 1.2,
              marginBottom: layout.spiritLabel.marginBottom * s,
              textShadow: shadow,
            }}
          >
            THE SPIRIT SPOKE
          </div>
          <div
            style={{
              color: "#FFFFFF",
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: 700,
              fontSize: answerSize * s,
              letterSpacing: layout.answer.letterSpacing * s,
              lineHeight: 1.3,
              textAlign: "center",
              textShadow: shadow,
            }}
          >
            {answer}
          </div>
        </div>

        {/* QR code */}
        {showQR && (
          <div style={{ marginBottom: layout.qr.marginBottom * s, display: "flex", justifyContent: "center" }}>
            <img
              src="/__data__/qr-appstore.png"
              alt=""
              draggable={false}
              style={{
                width: layout.qr.size * s,
                height: layout.qr.size * s,
                borderRadius: layout.qr.borderRadius * s,
                border: "0.5px solid rgba(254,243,199,0.25)",
                objectFit: "contain",
              }}
            />
          </div>
        )}
        {!showQR && <div style={{ height: layout.noQrSpacing * s }} />}
      </div>
    </div>
  );
}
