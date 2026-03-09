import React, { createContext, useContext, useState, useEffect } from "react";

// Classic
function ClassicDecorations() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
      <defs>
        <radialGradient id="boardVignette" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="rgb(120,53,15)" stopOpacity="0.96" />
          <stop offset="12%" stopColor="rgb(110,48,14)" stopOpacity="0.88" />
          <stop offset="24%" stopColor="rgb(95,42,12)" stopOpacity="0.76" />
          <stop offset="36%" stopColor="rgb(80,35,10)" stopOpacity="0.64" />
          <stop offset="48%" stopColor="rgb(65,28,8)" stopOpacity="0.52" />
          <stop offset="58%" stopColor="rgb(50,22,6)" stopOpacity="0.46" />
          <stop offset="68%" stopColor="rgb(35,15,4)" stopOpacity="0.50" />
          <stop offset="78%" stopColor="rgb(22,8,2)" stopOpacity="0.56" />
          <stop offset="90%" stopColor="rgb(8,3,1)" stopOpacity="0.66" />
          <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <path d="M0 0 H400 V300 H0 Z" fill="url(#boardVignette)" />
      <path d="M28 12 L372 12 Q388 12 388 28 L388 272 Q388 288 372 288 L28 288 Q12 288 12 272 L12 28 Q12 12 28 12 Z" fill="none" stroke="rgba(139,105,20,0.25)" strokeWidth="1" />
      <path d="M34 18 L366 18 Q382 18 382 34 L382 266 Q382 282 366 282 L34 282 Q18 282 18 266 L18 34 Q18 18 34 18 Z" fill="none" stroke="rgba(139,105,20,0.12)" strokeWidth="0.6" />
      <circle cx="46" cy="42" r="10" fill="rgba(251,191,36,0.05)" stroke="rgba(251,191,36,0.2)" strokeWidth="0.7" />
      <circle cx="46" cy="42" r="5.5" fill="rgba(251,191,36,0.08)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return <path key={`sr${angle}`} d={`M${(46 + Math.cos(rad) * 13).toFixed(1)} ${(42 + Math.sin(rad) * 13).toFixed(1)} L${(46 + Math.cos(rad) * 17).toFixed(1)} ${(42 + Math.sin(rad) * 17).toFixed(1)}`} stroke="rgba(251,191,36,0.18)" strokeWidth="0.7" strokeLinecap="round" />;
      })}
      <path d="M354 32 A12 12 0 1 1 354 52 A8 8 0 1 0 354 32" fill="rgba(251,191,36,0.05)" stroke="rgba(251,191,36,0.18)" strokeWidth="0.7" />
      <circle cx="30" cy="65" r="1.2" fill="rgba(251,191,36,0.15)" />
      <circle cx="370" cy="65" r="1.2" fill="rgba(251,191,36,0.15)" />
      <circle cx="20" cy="150" r="0.9" fill="rgba(251,191,36,0.1)" />
      <circle cx="380" cy="150" r="0.9" fill="rgba(251,191,36,0.1)" />
      <circle cx="26" cy="220" r="0.7" fill="rgba(251,191,36,0.08)" />
      <circle cx="374" cy="220" r="0.7" fill="rgba(251,191,36,0.08)" />
      <path d="M70 183 Q200 178 330 183" fill="none" stroke="rgba(139,105,20,0.12)" strokeWidth="0.5" />
      <path d="M18 40 Q18 18 40 18" fill="none" stroke="rgba(139,105,20,0.3)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 36 Q24 24 36 24" fill="none" stroke="rgba(139,105,20,0.15)" strokeWidth="0.5" />
      <path d="M382 40 Q382 18 360 18" fill="none" stroke="rgba(139,105,20,0.3)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 36 Q376 24 364 24" fill="none" stroke="rgba(139,105,20,0.15)" strokeWidth="0.5" />
      <path d="M18 260 Q18 282 40 282" fill="none" stroke="rgba(139,105,20,0.3)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 264 Q24 276 36 276" fill="none" stroke="rgba(139,105,20,0.15)" strokeWidth="0.5" />
      <path d="M382 260 Q382 282 360 282" fill="none" stroke="rgba(139,105,20,0.3)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 264 Q376 276 364 276" fill="none" stroke="rgba(139,105,20,0.15)" strokeWidth="0.5" />
      <path d="M200 230 L205 238 L200 246 L195 238 Z" fill="none" stroke="rgba(251,191,36,0.18)" strokeWidth="0.6" />
      <path d="M200 233 L203 238 L200 243 L197 238 Z" fill="rgba(251,191,36,0.06)" stroke="none" />
      <path d="M150 238 L188 238" fill="none" stroke="rgba(139,105,20,0.15)" strokeWidth="0.5" />
      <path d="M212 238 L250 238" fill="none" stroke="rgba(139,105,20,0.15)" strokeWidth="0.5" />
      <path d="M75 268 Q90 252 110 258 Q120 262 125 258" fill="none" stroke="rgba(139,105,20,0.2)" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M80 272 Q92 260 108 264" fill="none" stroke="rgba(139,105,20,0.1)" strokeWidth="0.4" />
      <path d="M325 268 Q310 252 290 258 Q280 262 275 258" fill="none" stroke="rgba(139,105,20,0.2)" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M320 272 Q308 260 292 264" fill="none" stroke="rgba(139,105,20,0.1)" strokeWidth="0.4" />
      <path d="M130 262 Q200 276 270 262" fill="none" stroke="rgba(139,105,20,0.18)" strokeWidth="0.6" />
      <circle cx="110" cy="240" r="0.8" fill="rgba(251,191,36,0.1)" />
      <circle cx="290" cy="240" r="0.8" fill="rgba(251,191,36,0.1)" />
      <circle cx="90" cy="255" r="0.6" fill="rgba(251,191,36,0.07)" />
      <circle cx="310" cy="255" r="0.6" fill="rgba(251,191,36,0.07)" />
    </svg>
  );
}

// Skull
function SkullDecorations() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
      <defs>
        <radialGradient id="boardVignetteSk" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="rgb(100,100,120)" stopOpacity="0.32" />
          <stop offset="12%" stopColor="rgb(90,90,110)" stopOpacity="0.30" />
          <stop offset="24%" stopColor="rgb(78,78,98)" stopOpacity="0.30" />
          <stop offset="36%" stopColor="rgb(65,65,82)" stopOpacity="0.32" />
          <stop offset="48%" stopColor="rgb(52,52,68)" stopOpacity="0.36" />
          <stop offset="58%" stopColor="rgb(40,40,55)" stopOpacity="0.40" />
          <stop offset="68%" stopColor="rgb(28,28,40)" stopOpacity="0.48" />
          <stop offset="78%" stopColor="rgb(18,18,28)" stopOpacity="0.56" />
          <stop offset="90%" stopColor="rgb(6,6,12)" stopOpacity="0.66" />
          <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <path d="M0 0 H400 V300 H0 Z" fill="url(#boardVignetteSk)" />
      <path d="M28 12 L372 12 Q388 12 388 28 L388 272 Q388 288 372 288 L28 288 Q12 288 12 272 L12 28 Q12 12 28 12 Z" fill="none" stroke="rgba(140,140,160,0.12)" strokeWidth="1" />
      <path d="M34 18 L366 18 Q382 18 382 34 L382 266 Q382 282 366 282 L34 282 Q18 282 18 266 L18 34 Q18 18 34 18 Z" fill="none" stroke="rgba(140,140,160,0.06)" strokeWidth="0.6" />
      {/* Hourglass top-left */}
      <path d="M28 26 L48 26 L48 28 Q48 34 42 38 L34 38 Q28 34 28 28 Z" fill="rgba(160,160,180,0.03)" stroke="rgba(160,160,180,0.1)" strokeWidth="0.7" />
      <path d="M28 58 L48 58 L48 56 Q48 50 42 46 L34 46 Q28 50 28 56 Z" fill="rgba(160,160,180,0.03)" stroke="rgba(160,160,180,0.1)" strokeWidth="0.7" />
      <path d="M34 38 Q38 42 42 38" fill="none" stroke="rgba(160,160,180,0.1)" strokeWidth="0.7" />
      <path d="M34 46 Q38 42 42 46" fill="none" stroke="rgba(160,160,180,0.1)" strokeWidth="0.7" />
      <circle cx="38" cy="42" r="1.2" fill="rgba(160,160,180,0.06)" />
      <path d="M26 26 L50 26" stroke="rgba(160,160,180,0.12)" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M26 58 L50 58" stroke="rgba(160,160,180,0.12)" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M32 31 Q34 30 38 30 Q42 30 44 31 L42 36 Q38 39 34 36 Z" fill="rgba(160,160,180,0.05)" stroke="none" />
      <path d="M38 39 L38 45" stroke="rgba(160,160,180,0.07)" strokeWidth="0.4" />
      <path d="M32 56 Q34 53 38 52 Q42 53 44 56" fill="rgba(160,160,180,0.06)" stroke="none" />
      <circle cx="27" cy="26" r="1" fill="rgba(160,160,180,0.06)" stroke="rgba(160,160,180,0.08)" strokeWidth="0.3" />
      <circle cx="49" cy="26" r="1" fill="rgba(160,160,180,0.06)" stroke="rgba(160,160,180,0.08)" strokeWidth="0.3" />
      <circle cx="27" cy="58" r="1" fill="rgba(160,160,180,0.06)" stroke="rgba(160,160,180,0.08)" strokeWidth="0.3" />
      <circle cx="49" cy="58" r="1" fill="rgba(160,160,180,0.06)" stroke="rgba(160,160,180,0.08)" strokeWidth="0.3" />
      <path d="M29 28 L29 56" stroke="rgba(160,160,180,0.05)" strokeWidth="0.4" />
      <path d="M47 28 L47 56" stroke="rgba(160,160,180,0.05)" strokeWidth="0.4" />
      {/* Skull top-right */}
      <path d="M350 43 Q350 28 362 26 Q374 28 374 43" fill="rgba(160,160,180,0.03)" stroke="rgba(160,160,180,0.1)" strokeWidth="0.7" />
      <path d="M350 43 Q349 47 351 50 L355 52 L355 56 Q358 58 362 58 Q366 58 369 56 L369 52 L373 50 Q375 47 374 43" fill="rgba(160,160,180,0.02)" stroke="rgba(160,160,180,0.1)" strokeWidth="0.7" />
      <path d="M351 38 Q352 41 351 43" fill="none" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M373 38 Q372 41 373 43" fill="none" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M354 37 L353 42 L358 43 L359 38 Z" fill="rgba(160,160,180,0.07)" stroke="rgba(160,160,180,0.09)" strokeWidth="0.4" />
      <path d="M365 38 L366 43 L371 42 L370 37 Z" fill="rgba(160,160,180,0.07)" stroke="rgba(160,160,180,0.09)" strokeWidth="0.4" />
      <path d="M360.5 44 Q359.5 47 360 50 Q361 51 362 51 Q363 51 364 50 Q364.5 47 363.5 44" fill="rgba(160,160,180,0.06)" stroke="rgba(160,160,180,0.07)" strokeWidth="0.3" />
      <path d="M360.8 49 L362 50.5 L363.2 49" fill="none" stroke="rgba(160,160,180,0.05)" strokeWidth="0.3" />
      <path d="M356 54 L356 56" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M358 54 L358 56.5" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M360 54 L360 57" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M362 54 L362 57" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M364 54 L364 57" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M366 54 L366 56.5" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M368 54 L368 56" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M353 36 Q357 34 362 35 Q367 34 371 36" fill="none" stroke="rgba(160,160,180,0.07)" strokeWidth="0.5" />
      {/* Cross accents */}
      <path d="M30 63 L30 67 M28 65 L32 65" stroke="rgba(160,160,180,0.08)" strokeWidth="0.5" />
      <path d="M370 63 L370 67 M368 65 L372 65" stroke="rgba(160,160,180,0.08)" strokeWidth="0.5" />
      <path d="M20 148 L20 152 M18 150 L22 150" stroke="rgba(160,160,180,0.05)" strokeWidth="0.4" />
      <path d="M380 148 L380 152 M378 150 L382 150" stroke="rgba(160,160,180,0.05)" strokeWidth="0.4" />
      <path d="M26 218 L26 222 M24 220 L28 220" stroke="rgba(160,160,180,0.04)" strokeWidth="0.4" />
      <path d="M374 218 L374 222 M372 220 L376 220" stroke="rgba(160,160,180,0.04)" strokeWidth="0.4" />
      <path d="M70 183 Q200 178 330 183" fill="none" stroke="rgba(140,140,160,0.06)" strokeWidth="0.5" />
      <path d="M18 40 Q18 18 40 18" fill="none" stroke="rgba(140,140,160,0.15)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 36 Q24 24 36 24" fill="none" stroke="rgba(140,140,160,0.07)" strokeWidth="0.5" />
      <path d="M382 40 Q382 18 360 18" fill="none" stroke="rgba(140,140,160,0.15)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 36 Q376 24 364 24" fill="none" stroke="rgba(140,140,160,0.07)" strokeWidth="0.5" />
      <path d="M18 260 Q18 282 40 282" fill="none" stroke="rgba(140,140,160,0.15)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 264 Q24 276 36 276" fill="none" stroke="rgba(140,140,160,0.07)" strokeWidth="0.5" />
      <path d="M382 260 Q382 282 360 282" fill="none" stroke="rgba(140,140,160,0.15)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 264 Q376 276 364 276" fill="none" stroke="rgba(140,140,160,0.07)" strokeWidth="0.5" />
      <path d="M200 230 L205 238 L200 246 L195 238 Z" fill="none" stroke="rgba(160,160,180,0.09)" strokeWidth="0.6" />
      <path d="M200 233 L203 238 L200 243 L197 238 Z" fill="rgba(160,160,180,0.03)" stroke="none" />
      <path d="M150 238 L188 238" fill="none" stroke="rgba(140,140,160,0.07)" strokeWidth="0.5" />
      <path d="M212 238 L250 238" fill="none" stroke="rgba(140,140,160,0.07)" strokeWidth="0.5" />
      <circle cx="85" cy="265" r="2.5" fill="rgba(160,160,180,0.03)" stroke="rgba(160,160,180,0.07)" strokeWidth="0.5" />
      <path d="M88 265 L120 265" fill="none" stroke="rgba(140,140,160,0.07)" strokeWidth="0.6" strokeLinecap="round" />
      <circle cx="122" cy="265" r="2" fill="rgba(160,160,180,0.03)" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <circle cx="315" cy="265" r="2.5" fill="rgba(160,160,180,0.03)" stroke="rgba(160,160,180,0.07)" strokeWidth="0.5" />
      <path d="M312 265 L280 265" fill="none" stroke="rgba(140,140,160,0.07)" strokeWidth="0.6" strokeLinecap="round" />
      <circle cx="278" cy="265" r="2" fill="rgba(160,160,180,0.03)" stroke="rgba(160,160,180,0.06)" strokeWidth="0.4" />
      <path d="M130 262 Q200 276 270 262" fill="none" stroke="rgba(140,140,160,0.08)" strokeWidth="0.6" />
      <path d="M110 239 L110 241 M109 240 L111 240" stroke="rgba(160,160,180,0.05)" strokeWidth="0.4" />
      <path d="M290 239 L290 241 M289 240 L291 240" stroke="rgba(160,160,180,0.05)" strokeWidth="0.4" />
      <path d="M90 254 L90 256 M89 255 L91 255" stroke="rgba(160,160,180,0.04)" strokeWidth="0.4" />
      <path d="M310 254 L310 256 M309 255 L311 255" stroke="rgba(160,160,180,0.04)" strokeWidth="0.4" />
    </svg>
  );
}

// Ocean
function OceanDecorations() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
      <defs>
        <radialGradient id="boardVignetteOc" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="rgb(6,95,130)" stopOpacity="0.96" />
          <stop offset="12%" stopColor="rgb(6,88,122)" stopOpacity="0.88" />
          <stop offset="24%" stopColor="rgb(7,78,108)" stopOpacity="0.76" />
          <stop offset="36%" stopColor="rgb(7,65,92)" stopOpacity="0.64" />
          <stop offset="48%" stopColor="rgb(8,55,80)" stopOpacity="0.52" />
          <stop offset="58%" stopColor="rgb(6,42,62)" stopOpacity="0.46" />
          <stop offset="68%" stopColor="rgb(4,30,46)" stopOpacity="0.50" />
          <stop offset="78%" stopColor="rgb(2,18,30)" stopOpacity="0.56" />
          <stop offset="90%" stopColor="rgb(1,6,12)" stopOpacity="0.66" />
          <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <path d="M0 0 H400 V300 H0 Z" fill="url(#boardVignetteOc)" />
      <path d="M28 12 L372 12 Q388 12 388 28 L388 272 Q388 288 372 288 L28 288 Q12 288 12 272 L12 28 Q12 12 28 12 Z" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
      <path d="M34 18 L366 18 Q382 18 382 34 L382 266 Q382 282 366 282 L34 282 Q18 282 18 266 L18 34 Q18 18 34 18 Z" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.6" />
      {/* Anchor top-left */}
      <path d="M38 35 L38 55" stroke="rgba(34,211,238,0.18)" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M32 53 Q35 59 38 59 Q41 59 44 53" fill="none" stroke="rgba(34,211,238,0.18)" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="38" cy="35" r="3" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.15)" strokeWidth="0.6" />
      <path d="M34 43 L42 43" stroke="rgba(34,211,238,0.14)" strokeWidth="0.6" strokeLinecap="round" />
      {/* Helm wheel top-right */}
      <circle cx="358" cy="42" r="11" fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.16)" strokeWidth="0.7" />
      <circle cx="358" cy="42" r="5" fill="rgba(34,211,238,0.06)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return <path key={`wh${angle}`} d={`M${(358 + Math.cos(rad) * 5.5).toFixed(1)} ${(42 + Math.sin(rad) * 5.5).toFixed(1)} L${(358 + Math.cos(rad) * 11).toFixed(1)} ${(42 + Math.sin(rad) * 11).toFixed(1)}`} stroke="rgba(34,211,238,0.14)" strokeWidth="0.5" />;
      })}
      {/* Starfish accents */}
      {[
        [30, 65],
        [370, 65],
      ].map(([cx, cy], i) => (
        <React.Fragment key={`sf${i}`}>
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return <path key={`sfa${i}_${angle}`} d={`M${cx} ${cy} L${(cx + Math.cos(rad) * 2.5).toFixed(1)} ${(cy + Math.sin(rad) * 2.5).toFixed(1)}`} stroke="rgba(34,211,238,0.12)" strokeWidth="0.5" strokeLinecap="round" />;
          })}
        </React.Fragment>
      ))}
      <circle cx="20" cy="150" r="0.9" fill="rgba(34,211,238,0.08)" />
      <circle cx="380" cy="150" r="0.9" fill="rgba(34,211,238,0.08)" />
      <circle cx="26" cy="220" r="0.7" fill="rgba(34,211,238,0.06)" />
      <circle cx="374" cy="220" r="0.7" fill="rgba(34,211,238,0.06)" />
      <path d="M70 183 Q110 176 150 183 Q190 190 230 183 Q270 176 310 183 Q330 186 330 183" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="0.6" />
      <path d="M18 40 Q18 18 40 18" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M20 34 Q22 22 34 20" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5" />
      <path d="M382 40 Q382 18 360 18" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M380 34 Q378 22 366 20" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5" />
      <path d="M18 260 Q18 282 40 282" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M20 266 Q22 278 34 280" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5" />
      <path d="M382 260 Q382 282 360 282" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M380 266 Q378 278 366 280" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5" />
      <path d="M200 230 L205 238 L200 246 L195 238 Z" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="0.6" />
      <path d="M200 233 L203 238 L200 243 L197 238 Z" fill="rgba(34,211,238,0.04)" stroke="none" />
      <path d="M150 238 Q160 235 170 238 Q180 241 188 238" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5" />
      <path d="M212 238 Q222 235 232 238 Q242 241 250 238" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5" />
      <path d="M75 268 Q85 258 95 265 Q105 272 115 262 Q120 258 125 260" fill="none" stroke="rgba(6,182,212,0.16)" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M80 272 Q88 264 96 270 Q104 276 110 268" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.4" />
      <path d="M325 268 Q315 258 305 265 Q295 272 285 262 Q280 258 275 260" fill="none" stroke="rgba(6,182,212,0.16)" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M320 272 Q312 264 304 270 Q296 276 290 268" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.4" />
      <path d="M130 262 Q200 276 270 262" fill="none" stroke="rgba(6,182,212,0.14)" strokeWidth="0.6" />
      <circle cx="110" cy="240" r="1" fill="rgba(34,211,238,0.08)" />
      <circle cx="290" cy="240" r="1" fill="rgba(34,211,238,0.08)" />
      <circle cx="90" cy="255" r="0.7" fill="rgba(34,211,238,0.06)" />
      <circle cx="310" cy="255" r="0.7" fill="rgba(34,211,238,0.06)" />
      <circle cx="100" cy="248" r="0.5" fill="rgba(34,211,238,0.05)" />
      <circle cx="300" cy="248" r="0.5" fill="rgba(34,211,238,0.05)" />
    </svg>
  );
}

// Fire
function FireDecorations() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
      <defs>
        <radialGradient id="boardVignetteFi" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="rgb(180,30,10)" stopOpacity="0.80" />
          <stop offset="12%" stopColor="rgb(165,28,10)" stopOpacity="0.74" />
          <stop offset="24%" stopColor="rgb(140,24,8)" stopOpacity="0.66" />
          <stop offset="36%" stopColor="rgb(115,20,7)" stopOpacity="0.56" />
          <stop offset="48%" stopColor="rgb(90,16,6)" stopOpacity="0.48" />
          <stop offset="58%" stopColor="rgb(68,12,4)" stopOpacity="0.44" />
          <stop offset="68%" stopColor="rgb(48,8,3)" stopOpacity="0.50" />
          <stop offset="78%" stopColor="rgb(28,5,2)" stopOpacity="0.56" />
          <stop offset="90%" stopColor="rgb(10,2,1)" stopOpacity="0.66" />
          <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <path d="M0 0 H400 V300 H0 Z" fill="url(#boardVignetteFi)" />
      <path d="M28 12 L372 12 Q388 12 388 28 L388 272 Q388 288 372 288 L28 288 Q12 288 12 272 L12 28 Q12 12 28 12 Z" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="1" />
      <path d="M34 18 L366 18 Q382 18 382 34 L382 266 Q382 282 366 282 L34 282 Q18 282 18 266 L18 34 Q18 18 34 18 Z" fill="none" stroke="rgba(239,68,68,0.08)" strokeWidth="0.6" />
      {/* Flame top-left */}
      <path d="M38 58 Q30 46 34 37 Q37 28 38 22 Q39 28 42 37 Q46 46 38 58" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.18)" strokeWidth="0.7" />
      <path d="M38 55 Q32 46 35 39 Q37 32 38 28 Q39 32 41 39 Q44 46 38 55" fill="rgba(251,146,60,0.08)" stroke="none" />
      <path d="M38 52 Q35 46 36.5 41 Q37.5 36 38 34 Q38.5 36 39.5 41 Q41 46 38 52" fill="rgba(253,224,71,0.1)" stroke="none" />
      <path d="M33 38 Q31 34 32 30 Q33 33 34 36" fill="rgba(251,146,60,0.05)" stroke="rgba(239,68,68,0.08)" strokeWidth="0.4" />
      <path d="M43 38 Q45 34 44 30 Q43 33 42 36" fill="rgba(251,146,60,0.05)" stroke="rgba(239,68,68,0.08)" strokeWidth="0.4" />
      {/* Pentagram top-right */}
      <circle cx="360" cy="42" r="13" fill="rgba(239,68,68,0.03)" stroke="rgba(239,68,68,0.12)" strokeWidth="0.6" />
      <path d="M360 29 L367.6 52.5 L347.6 38.0 L372.4 38.0 L352.4 52.5 Z" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.14)" strokeWidth="0.5" />
      <circle cx="360" cy="42" r="5.5" fill="rgba(251,146,60,0.05)" />
      {/* Ember accents */}
      <circle cx="30" cy="65" r="1.2" fill="rgba(239,68,68,0.12)" />
      <circle cx="370" cy="65" r="1.2" fill="rgba(239,68,68,0.12)" />
      <circle cx="20" cy="150" r="0.9" fill="rgba(251,146,60,0.08)" />
      <circle cx="380" cy="150" r="0.9" fill="rgba(251,146,60,0.08)" />
      <circle cx="26" cy="220" r="0.7" fill="rgba(239,68,68,0.06)" />
      <circle cx="374" cy="220" r="0.7" fill="rgba(239,68,68,0.06)" />
      <circle cx="35" cy="100" r="0.5" fill="rgba(253,224,71,0.08)" />
      <circle cx="365" cy="100" r="0.5" fill="rgba(253,224,71,0.08)" />
      <circle cx="22" cy="190" r="0.6" fill="rgba(251,146,60,0.06)" />
      <circle cx="378" cy="190" r="0.6" fill="rgba(251,146,60,0.06)" />
      <path d="M70 183 Q130 178 160 183 Q190 188 220 183 Q250 178 280 183 Q310 188 330 183" fill="none" stroke="rgba(239,68,68,0.1)" strokeWidth="0.5" />
      <path d="M18 40 Q18 18 40 18" fill="none" stroke="rgba(239,68,68,0.25)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 36 Q24 24 36 24" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="0.5" />
      <path d="M382 40 Q382 18 360 18" fill="none" stroke="rgba(239,68,68,0.25)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 36 Q376 24 364 24" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="0.5" />
      <path d="M18 260 Q18 282 40 282" fill="none" stroke="rgba(239,68,68,0.25)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 264 Q24 276 36 276" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="0.5" />
      <path d="M382 260 Q382 282 360 282" fill="none" stroke="rgba(239,68,68,0.25)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 264 Q376 276 364 276" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="0.5" />
      <path d="M200 230 L205 238 L200 246 L195 238 Z" fill="none" stroke="rgba(239,68,68,0.16)" strokeWidth="0.6" />
      <path d="M200 233 L203 238 L200 243 L197 238 Z" fill="rgba(239,68,68,0.05)" stroke="none" />
      <path d="M150 238 L188 238" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="0.5" />
      <path d="M212 238 L250 238" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="0.5" />
      <path d="M85 270 Q88 260 92 264 Q96 268 100 258 Q104 264 108 260 Q112 256 116 262" fill="none" stroke="rgba(239,68,68,0.16)" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M90 272 Q94 264 98 268 Q102 272 106 264" fill="none" stroke="rgba(251,146,60,0.08)" strokeWidth="0.4" />
      <path d="M315 270 Q312 260 308 264 Q304 268 300 258 Q296 264 292 260 Q288 256 284 262" fill="none" stroke="rgba(239,68,68,0.16)" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M310 272 Q306 264 302 268 Q298 272 294 264" fill="none" stroke="rgba(251,146,60,0.08)" strokeWidth="0.4" />
      <path d="M130 262 Q200 276 270 262" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="0.6" />
      <circle cx="110" cy="240" r="0.8" fill="rgba(251,146,60,0.1)" />
      <circle cx="290" cy="240" r="0.8" fill="rgba(251,146,60,0.1)" />
      <circle cx="90" cy="255" r="0.6" fill="rgba(239,68,68,0.07)" />
      <circle cx="310" cy="255" r="0.6" fill="rgba(239,68,68,0.07)" />
      <circle cx="120" cy="250" r="0.4" fill="rgba(253,224,71,0.06)" />
      <circle cx="280" cy="250" r="0.4" fill="rgba(253,224,71,0.06)" />
    </svg>
  );
}

// Universe
function UniverseDecorations() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
      <defs>
        <radialGradient id="boardVignetteUn" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="rgb(40,40,60)" stopOpacity="0.48" />
          <stop offset="12%" stopColor="rgb(38,38,56)" stopOpacity="0.44" />
          <stop offset="24%" stopColor="rgb(34,34,50)" stopOpacity="0.40" />
          <stop offset="36%" stopColor="rgb(28,28,44)" stopOpacity="0.38" />
          <stop offset="48%" stopColor="rgb(24,24,38)" stopOpacity="0.38" />
          <stop offset="58%" stopColor="rgb(18,18,32)" stopOpacity="0.42" />
          <stop offset="68%" stopColor="rgb(14,14,24)" stopOpacity="0.48" />
          <stop offset="78%" stopColor="rgb(8,8,16)" stopOpacity="0.56" />
          <stop offset="90%" stopColor="rgb(3,3,6)" stopOpacity="0.66" />
          <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <path d="M0 0 H400 V300 H0 Z" fill="url(#boardVignetteUn)" />
      <path d="M28 12 L372 12 Q388 12 388 28 L388 272 Q388 288 372 288 L28 288 Q12 288 12 272 L12 28 Q12 12 28 12 Z" fill="none" stroke="rgba(200,200,220,0.1)" strokeWidth="1" />
      <path d="M34 18 L366 18 Q382 18 382 34 L382 266 Q382 282 366 282 L34 282 Q18 282 18 266 L18 34 Q18 18 34 18 Z" fill="none" stroke="rgba(200,200,220,0.05)" strokeWidth="0.6" />
      {/* North Star top-left */}
      <path d="M38 25 L41.5 35.5 L51 39 L41.5 42.5 L38 53 L34.5 42.5 L25 39 L34.5 35.5 Z" fill="rgba(220,220,240,0.06)" stroke="rgba(220,220,240,0.15)" strokeWidth="0.7" />
      <circle cx="38" cy="39" r="3.5" fill="rgba(240,240,255,0.1)" />
      <path d="M29 32 L33 34" stroke="rgba(220,220,240,0.07)" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M47 32 L43 34" stroke="rgba(220,220,240,0.07)" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M29 46 L33 44" stroke="rgba(220,220,240,0.07)" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M47 46 L43 44" stroke="rgba(220,220,240,0.07)" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M38 20 L38 24" stroke="rgba(220,220,240,0.08)" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M38 54 L38 58" stroke="rgba(220,220,240,0.08)" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M20 39 L24 39" stroke="rgba(220,220,240,0.08)" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M52 39 L56 39" stroke="rgba(220,220,240,0.08)" strokeWidth="0.4" strokeLinecap="round" />
      {/* Saturn top-right */}
      <g transform="translate(339, 24) scale(1.5)">
        <path d="M19.039 11.459c.001.015.022.244.03.407c.006.113 0 .29 0 .3c.003 0 .029.023.03.024c1.428 1.17 2.943 2.767 3.204 3.94c.073.325.056.618-.072.868c-.152.293-.439.503-.834.638c-2.046.7-6.925-.642-10.907-2.609c-2.845-1.406-5.342-3.081-7.032-4.719c-1.57-1.523-1.995-2.71-1.59-3.427c.155-.271.42-.472.776-.609c1.299-.507 3.788-.152 6.239.579c-1.16.866-1.968 2.034-2.342 3.202l-.001.007l-.001.006c-.115 1.07 1.434 2.47 3 3.25c-.002-.006.084.032.084.026c-.002-.006-.015-.109-.017-.113c-.366-2.66 1.648-6.64 3.765-7.513c.136-.056.254-.09.27-.095l-.273-.027q-.11-.01-.228-.015a8 8 0 0 0-.272-.01a6.44 6.44 0 0 0-3.4.892C5.378 5.057 2.383 4.892 1.13 5.31q-.747.251-1 .751c-.174.35-.175.79-.002 1.306c.57 1.704 3.058 4.032 6.211 6.099c.457 2.407 2.615 4.875 5.703 5.204l.142.015a.3.3 0 0 1 .05 0l-.173-.132c-.955-.736-1.813-1.949-2.107-3l.185.093l.143.07c4.985 2.465 10.215 3.72 12.53 2.947c.519-.174.9-.418 1.075-.768c.167-.335.139-.78-.029-1.278c-.436-1.3-2.304-3.284-4.675-5.052l-.145-.107" fill="rgba(200,200,220,0.08)" stroke="rgba(220,220,240,0.12)" strokeWidth="0.2" />
      </g>
      {/* Star accents */}
      <circle cx="30" cy="65" r="1.0" fill="rgba(220,220,240,0.12)" />
      <circle cx="370" cy="65" r="1.0" fill="rgba(220,220,240,0.12)" />
      <circle cx="20" cy="150" r="0.8" fill="rgba(220,220,240,0.08)" />
      <circle cx="380" cy="150" r="0.8" fill="rgba(220,220,240,0.08)" />
      <circle cx="26" cy="220" r="0.6" fill="rgba(220,220,240,0.06)" />
      <circle cx="374" cy="220" r="0.6" fill="rgba(220,220,240,0.06)" />
      <circle cx="60" cy="85" r="0.4" fill="rgba(240,240,255,0.1)" />
      <circle cx="340" cy="95" r="0.5" fill="rgba(240,240,255,0.08)" />
      <circle cx="50" cy="170" r="0.3" fill="rgba(240,240,255,0.07)" />
      <circle cx="350" cy="180" r="0.4" fill="rgba(240,240,255,0.06)" />
      <circle cx="45" cy="130" r="0.5" fill="rgba(240,240,255,0.05)" />
      <circle cx="355" cy="140" r="0.3" fill="rgba(240,240,255,0.07)" />
      {/* Constellation lines */}
      <path d="M30 65 L60 85" fill="none" stroke="rgba(200,200,220,0.04)" strokeWidth="0.3" />
      <path d="M60 85 L45 130" fill="none" stroke="rgba(200,200,220,0.04)" strokeWidth="0.3" />
      <path d="M370 65 L340 95" fill="none" stroke="rgba(200,200,220,0.04)" strokeWidth="0.3" />
      <path d="M340 95 L355 140" fill="none" stroke="rgba(200,200,220,0.04)" strokeWidth="0.3" />
      <path d="M70 183 Q200 178 330 183" fill="none" stroke="rgba(200,200,220,0.05)" strokeWidth="0.5" />
      <path d="M18 40 Q18 18 40 18" fill="none" stroke="rgba(200,200,220,0.12)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 36 Q24 24 36 24" fill="none" stroke="rgba(200,200,220,0.06)" strokeWidth="0.5" />
      <path d="M382 40 Q382 18 360 18" fill="none" stroke="rgba(200,200,220,0.12)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 36 Q376 24 364 24" fill="none" stroke="rgba(200,200,220,0.06)" strokeWidth="0.5" />
      <path d="M18 260 Q18 282 40 282" fill="none" stroke="rgba(200,200,220,0.12)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 264 Q24 276 36 276" fill="none" stroke="rgba(200,200,220,0.06)" strokeWidth="0.5" />
      <path d="M382 260 Q382 282 360 282" fill="none" stroke="rgba(200,200,220,0.12)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 264 Q376 276 364 276" fill="none" stroke="rgba(200,200,220,0.06)" strokeWidth="0.5" />
      <path d="M200 230 L205 238 L200 246 L195 238 Z" fill="none" stroke="rgba(220,220,240,0.1)" strokeWidth="0.6" />
      <path d="M200 233 L203 238 L200 243 L197 238 Z" fill="rgba(220,220,240,0.03)" stroke="none" />
      <path d="M150 238 L188 238" fill="none" stroke="rgba(200,200,220,0.06)" strokeWidth="0.5" />
      <path d="M212 238 L250 238" fill="none" stroke="rgba(200,200,220,0.06)" strokeWidth="0.5" />
      <circle cx="85" cy="265" r="1.5" fill="rgba(220,220,240,0.06)" />
      <path d="M87 265 L125 262" fill="none" stroke="rgba(200,200,220,0.08)" strokeWidth="0.5" strokeLinecap="round" />
      <path d="M90 267 L120 265" fill="none" stroke="rgba(200,200,220,0.04)" strokeWidth="0.3" />
      <circle cx="315" cy="265" r="1.5" fill="rgba(220,220,240,0.06)" />
      <path d="M313 265 L275 262" fill="none" stroke="rgba(200,200,220,0.08)" strokeWidth="0.5" strokeLinecap="round" />
      <path d="M310 267 L280 265" fill="none" stroke="rgba(200,200,220,0.04)" strokeWidth="0.3" />
      <path d="M130 262 Q200 276 270 262" fill="none" stroke="rgba(200,200,220,0.08)" strokeWidth="0.6" />
      <circle cx="110" cy="240" r="0.7" fill="rgba(220,220,240,0.08)" />
      <circle cx="290" cy="240" r="0.7" fill="rgba(220,220,240,0.08)" />
      <circle cx="90" cy="255" r="0.5" fill="rgba(220,220,240,0.05)" />
      <circle cx="310" cy="255" r="0.5" fill="rgba(220,220,240,0.05)" />
    </svg>
  );
}

// Garden
function GardenDecorations() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
      <defs>
        <radialGradient id="boardVignetteGa" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="rgb(22,101,52)" stopOpacity="0.80" />
          <stop offset="12%" stopColor="rgb(20,92,48)" stopOpacity="0.74" />
          <stop offset="24%" stopColor="rgb(18,80,42)" stopOpacity="0.66" />
          <stop offset="36%" stopColor="rgb(15,68,35)" stopOpacity="0.56" />
          <stop offset="48%" stopColor="rgb(12,55,28)" stopOpacity="0.48" />
          <stop offset="58%" stopColor="rgb(10,42,22)" stopOpacity="0.44" />
          <stop offset="68%" stopColor="rgb(7,30,15)" stopOpacity="0.50" />
          <stop offset="78%" stopColor="rgb(4,18,9)" stopOpacity="0.56" />
          <stop offset="90%" stopColor="rgb(1,6,3)" stopOpacity="0.66" />
          <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <path d="M0 0 H400 V300 H0 Z" fill="url(#boardVignetteGa)" />
      <path d="M28 12 L372 12 Q388 12 388 28 L388 272 Q388 288 372 288 L28 288 Q12 288 12 272 L12 28 Q12 12 28 12 Z" fill="none" stroke="rgba(34,197,94,0.18)" strokeWidth="1" />
      <path d="M34 18 L366 18 Q382 18 382 34 L382 266 Q382 282 366 282 L34 282 Q18 282 18 266 L18 34 Q18 18 34 18 Z" fill="none" stroke="rgba(34,197,94,0.07)" strokeWidth="0.6" />
      {/* Flower top-left */}
      {[0, 72, 144, 216, 288].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const px = 41 + Math.cos(rad) * 8;
        const py = 39 + Math.sin(rad) * 8;
        return <circle key={`fp${angle}`} cx={px.toFixed(1)} cy={py.toFixed(1)} r="4" fill="rgba(74,222,128,0.04)" stroke="rgba(74,222,128,0.1)" strokeWidth="0.5" />;
      })}
      <circle cx="41" cy="39" r="3.5" fill="rgba(34,197,94,0.06)" stroke="rgba(74,222,128,0.12)" strokeWidth="0.6" />
      <circle cx="41" cy="39" r="1.5" fill="rgba(74,222,128,0.08)" />
      {/* Yin-Yang top-right */}
      <circle cx="362" cy="42" r="12" fill="none" stroke="rgba(34,197,94,0.14)" strokeWidth="0.6" />
      <path d="M362 30 A12 12 0 0 1 362 54 A6 6 0 0 1 362 42 A6 6 0 0 0 362 30 Z" fill="rgba(34,197,94,0.06)" stroke="none" />
      <path d="M362 30 A6 6 0 0 1 362 42 A6 6 0 0 0 362 54" fill="none" stroke="rgba(74,222,128,0.1)" strokeWidth="0.4" />
      <circle cx="362" cy="48" r="2" fill="none" stroke="rgba(74,222,128,0.12)" strokeWidth="0.5" />
      <circle cx="362" cy="36" r="2" fill="rgba(34,197,94,0.07)" />
      {/* Leaf accents */}
      <circle cx="30" cy="65" r="1.2" fill="rgba(74,222,128,0.1)" />
      <circle cx="370" cy="65" r="1.2" fill="rgba(74,222,128,0.1)" />
      <circle cx="20" cy="150" r="0.9" fill="rgba(74,222,128,0.07)" />
      <circle cx="380" cy="150" r="0.9" fill="rgba(74,222,128,0.07)" />
      <circle cx="26" cy="220" r="0.7" fill="rgba(74,222,128,0.05)" />
      <circle cx="374" cy="220" r="0.7" fill="rgba(74,222,128,0.05)" />
      <path d="M33 63 Q30 60 30 65" fill="none" stroke="rgba(34,197,94,0.06)" strokeWidth="0.4" />
      <path d="M367 63 Q370 60 370 65" fill="none" stroke="rgba(34,197,94,0.06)" strokeWidth="0.4" />
      <path d="M70 183 Q110 178 150 183 Q190 188 230 183 Q270 178 310 183 Q330 186 330 183" fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="0.5" />
      <path d="M130 181 Q128 178 132 179" fill="rgba(74,222,128,0.04)" stroke="rgba(34,197,94,0.06)" strokeWidth="0.3" />
      <path d="M230 183 Q228 180 232 181" fill="rgba(74,222,128,0.04)" stroke="rgba(34,197,94,0.06)" strokeWidth="0.3" />
      <path d="M18 40 Q18 18 40 18" fill="none" stroke="rgba(34,197,94,0.22)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 36 Q24 24 36 24" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="0.5" />
      <path d="M382 40 Q382 18 360 18" fill="none" stroke="rgba(34,197,94,0.22)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 36 Q376 24 364 24" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="0.5" />
      <path d="M18 260 Q18 282 40 282" fill="none" stroke="rgba(34,197,94,0.22)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 264 Q24 276 36 276" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="0.5" />
      <path d="M382 260 Q382 282 360 282" fill="none" stroke="rgba(34,197,94,0.22)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M376 264 Q376 276 364 276" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="0.5" />
      <path d="M22 20 Q18 16 22 14 Q20 18 22 20" fill="rgba(74,222,128,0.05)" stroke="rgba(34,197,94,0.08)" strokeWidth="0.3" />
      <path d="M378 20 Q382 16 378 14 Q380 18 378 20" fill="rgba(74,222,128,0.05)" stroke="rgba(34,197,94,0.08)" strokeWidth="0.3" />
      <path d="M200 230 L205 238 L200 246 L195 238 Z" fill="none" stroke="rgba(74,222,128,0.14)" strokeWidth="0.6" />
      <path d="M200 233 L203 238 L200 243 L197 238 Z" fill="rgba(74,222,128,0.04)" stroke="none" />
      <path d="M150 238 Q160 236 170 238 Q180 240 188 238" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="0.5" />
      <path d="M212 238 Q222 236 232 238 Q242 240 250 238" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="0.5" />
      <path d="M75 268 Q85 258 95 264 Q105 270 115 260 Q120 256 125 258" fill="none" stroke="rgba(34,197,94,0.14)" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M80 272 Q88 264 96 268 Q104 272 110 266" fill="none" stroke="rgba(34,197,94,0.07)" strokeWidth="0.4" />
      <path d="M95 262 Q92 258 96 260" fill="rgba(74,222,128,0.04)" stroke="rgba(34,197,94,0.06)" strokeWidth="0.3" />
      <path d="M325 268 Q315 258 305 264 Q295 270 285 260 Q280 256 275 258" fill="none" stroke="rgba(34,197,94,0.14)" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M320 272 Q312 264 304 268 Q296 272 290 266" fill="none" stroke="rgba(34,197,94,0.07)" strokeWidth="0.4" />
      <path d="M305 262 Q308 258 304 260" fill="rgba(74,222,128,0.04)" stroke="rgba(34,197,94,0.06)" strokeWidth="0.3" />
      <path d="M130 262 Q200 276 270 262" fill="none" stroke="rgba(34,197,94,0.12)" strokeWidth="0.6" />
      <circle cx="110" cy="240" r="0.8" fill="rgba(74,222,128,0.08)" />
      <circle cx="290" cy="240" r="0.8" fill="rgba(74,222,128,0.08)" />
      <circle cx="90" cy="255" r="0.6" fill="rgba(74,222,128,0.05)" />
      <circle cx="310" cy="255" r="0.6" fill="rgba(74,222,128,0.05)" />
    </svg>
  );
}

// Defs
export const THEMES = {
  classic: {
    id: "classic",
    name: "Classic",
    colors: {
      boardBg: "#141210",
      boardBorder: "rgba(139,105,20,0.35)",
      boardGradient: "rgba(120,53,15,0.64)",
      vignetteInner: "rgba(120,53,15,0.12)",
      vignetteMiddle: "rgba(60,30,8,0.04)",
      vignetteOuter: "rgba(0,0,0,0.2)",
      letterColor: "rgba(253,230,138,0.65)",
      wordColor: "rgba(253,230,138,0.55)",
      activeColor: "#fcd34d",
      activeGlow: "rgba(251,191,36,0.8)",
      letterShadow: "rgba(251,191,36,0.12)",
      ornamentPrimary: "rgba(139,105,20,0.25)",
      ornamentSecondary: "rgba(251,191,36,0.18)",
      glowColor: "#fbbf24",
      wood: ["#6a3918", "#4b2713", "#f4bf49", "#592f16", "#3f1f0e"],
      crystal: "#8b6914",
      effectPrimary: "rgba(251,191,36,0.4)",
      effectSecondary: "rgba(217,119,6,0.04)",
      effectHighlight: "rgba(255,251,235,0.25)",
      uiInputBg: "#171717",
      uiAccent: "rgba(120,53,15,0.4)",
      uiBorder: "rgba(120,75,20,0.25)",
      uiText: "rgba(253,230,138,0.8)",
      uiTextDim: "rgba(253,230,138,0.5)",
      uiTextGhost: "rgba(253,230,138,0.15)",
      uiSpiritText: "rgba(251,191,36,0.5)",
      uiLogBorder: "rgba(180,83,9,0.3)",
      glowRgb: "251,191,36",
      spinnerRgb: "253,230,138",
    },
    BoardDecorations: ClassicDecorations,
  },
  skull: {
    id: "skull",
    name: "Skull",
    colors: {
      boardBg: "#0a0a0e",
      boardBorder: "rgba(140,140,160,0.12)",
      boardGradient: "rgba(30,30,45,0.40)",
      vignetteInner: "rgba(100,100,120,0.04)",
      vignetteMiddle: "rgba(40,40,55,0.02)",
      vignetteOuter: "rgba(0,0,0,0.15)",
      letterColor: "rgba(190,190,210,0.75)",
      wordColor: "rgba(190,190,210,0.65)",
      activeColor: "#cbd5e1",
      activeGlow: "rgba(180,180,200,0.6)",
      letterShadow: "rgba(160,160,180,0.08)",
      ornamentPrimary: "rgba(140,140,160,0.12)",
      ornamentSecondary: "rgba(160,160,180,0.1)",
      glowColor: "#64748b",
      wood: ["#222230", "#1a1a25", "#7a8090", "#1e1e2a", "#14141c"],
      crystal: "#4b5563",
      effectPrimary: "rgba(160,160,180,0.35)",
      effectSecondary: "rgba(80,80,100,0.03)",
      effectHighlight: "rgba(210,210,225,0.2)",
      uiInputBg: "#121215",
      uiAccent: "rgba(60,60,80,0.4)",
      uiBorder: "rgba(100,100,130,0.2)",
      uiText: "rgba(190,190,210,0.8)",
      uiTextDim: "rgba(190,190,210,0.5)",
      uiTextGhost: "rgba(190,190,210,0.15)",
      uiSpiritText: "rgba(160,160,180,0.5)",
      uiLogBorder: "rgba(100,100,130,0.3)",
      glowRgb: "180,180,200",
      spinnerRgb: "190,190,210",
    },
    BoardDecorations: SkullDecorations,
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    colors: {
      boardBg: "#0a1520",
      boardBorder: "rgba(6,182,212,0.25)",
      boardGradient: "rgba(6,95,130,0.64)",
      vignetteInner: "rgba(6,95,130,0.12)",
      vignetteMiddle: "rgba(8,50,80,0.04)",
      vignetteOuter: "rgba(0,0,0,0.22)",
      letterColor: "rgba(165,228,252,0.6)",
      wordColor: "rgba(165,228,252,0.5)",
      activeColor: "#22d3ee",
      activeGlow: "rgba(34,211,238,0.7)",
      letterShadow: "rgba(34,211,238,0.1)",
      ornamentPrimary: "rgba(6,182,212,0.2)",
      ornamentSecondary: "rgba(34,211,238,0.15)",
      glowColor: "#06b6d4",
      wood: ["#1a3a4a", "#13293a", "#22d3ee", "#16303f", "#0e2230"],
      crystal: "#0e7490",
      effectPrimary: "rgba(34,211,238,0.4)",
      effectSecondary: "rgba(6,95,130,0.04)",
      effectHighlight: "rgba(207,250,254,0.25)",
      uiInputBg: "#0c1820",
      uiAccent: "rgba(6,95,130,0.4)",
      uiBorder: "rgba(6,182,212,0.2)",
      uiText: "rgba(165,228,252,0.8)",
      uiTextDim: "rgba(165,228,252,0.5)",
      uiTextGhost: "rgba(165,228,252,0.15)",
      uiSpiritText: "rgba(34,211,238,0.5)",
      uiLogBorder: "rgba(6,182,212,0.3)",
      glowRgb: "34,211,238",
      spinnerRgb: "165,228,252",
    },
    BoardDecorations: OceanDecorations,
  },
  fire: {
    id: "fire",
    name: "Fire",
    colors: {
      boardBg: "#1a0a08",
      boardBorder: "rgba(239,68,68,0.25)",
      boardGradient: "rgba(180,30,10,0.48)",
      vignetteInner: "rgba(180,30,10,0.1)",
      vignetteMiddle: "rgba(80,15,5,0.04)",
      vignetteOuter: "rgba(0,0,0,0.22)",
      letterColor: "rgba(254,202,170,0.6)",
      wordColor: "rgba(254,202,170,0.5)",
      activeColor: "#f87171",
      activeGlow: "rgba(239,68,68,0.7)",
      letterShadow: "rgba(239,68,68,0.1)",
      ornamentPrimary: "rgba(239,68,68,0.2)",
      ornamentSecondary: "rgba(251,146,60,0.15)",
      glowColor: "#ef4444",
      wood: ["#5a1a10", "#3d1208", "#f87171", "#4a1610", "#2d0e08"],
      crystal: "#991b1b",
      effectPrimary: "rgba(239,68,68,0.4)",
      effectSecondary: "rgba(180,30,10,0.04)",
      effectHighlight: "rgba(254,226,226,0.25)",
      uiInputBg: "#1a100c",
      uiAccent: "rgba(120,20,10,0.4)",
      uiBorder: "rgba(239,68,68,0.2)",
      uiText: "rgba(254,202,170,0.8)",
      uiTextDim: "rgba(254,202,170,0.5)",
      uiTextGhost: "rgba(254,202,170,0.15)",
      uiSpiritText: "rgba(251,146,60,0.5)",
      uiLogBorder: "rgba(239,68,68,0.3)",
      glowRgb: "239,68,68",
      spinnerRgb: "254,202,170",
    },
    BoardDecorations: FireDecorations,
  },
  universe: {
    id: "universe",
    name: "Universe",
    colors: {
      boardBg: "#000000",
      boardBorder: "rgba(200,200,220,0.12)",
      boardGradient: "rgba(40,40,60,0.32)",
      vignetteInner: "rgba(40,40,60,0.06)",
      vignetteMiddle: "rgba(20,20,35,0.03)",
      vignetteOuter: "rgba(0,0,0,0.25)",
      letterColor: "rgba(225,225,240,0.7)",
      wordColor: "rgba(225,225,240,0.6)",
      activeColor: "#f0f0f5",
      activeGlow: "rgba(220,220,240,0.7)",
      letterShadow: "rgba(200,200,220,0.1)",
      ornamentPrimary: "rgba(200,200,220,0.1)",
      ornamentSecondary: "rgba(220,220,240,0.08)",
      glowColor: "#d4d4dc",
      wood: ["#18181e", "#0e0e14", "#c0c0d0", "#141418", "#0a0a0e"],
      crystal: "#3a3a48",
      effectPrimary: "rgba(200,200,220,0.35)",
      effectSecondary: "rgba(60,60,80,0.03)",
      effectHighlight: "rgba(240,240,250,0.2)",
      uiInputBg: "#060608",
      uiAccent: "rgba(40,40,55,0.5)",
      uiBorder: "rgba(180,180,200,0.15)",
      uiText: "rgba(220,220,235,0.85)",
      uiTextDim: "rgba(200,200,215,0.5)",
      uiTextGhost: "rgba(200,200,215,0.12)",
      uiSpiritText: "rgba(190,190,210,0.55)",
      uiLogBorder: "rgba(150,150,170,0.25)",
      glowRgb: "220,220,240",
      spinnerRgb: "220,220,235",
    },
    BoardDecorations: UniverseDecorations,
  },
  garden: {
    id: "garden",
    name: "Garden",
    colors: {
      boardBg: "#080e08",
      boardBorder: "rgba(34,197,94,0.22)",
      boardGradient: "rgba(22,101,52,0.48)",
      vignetteInner: "rgba(22,101,52,0.1)",
      vignetteMiddle: "rgba(10,50,25,0.04)",
      vignetteOuter: "rgba(0,0,0,0.2)",
      letterColor: "rgba(187,247,208,0.6)",
      wordColor: "rgba(187,247,208,0.5)",
      activeColor: "#4ade80",
      activeGlow: "rgba(34,197,94,0.7)",
      letterShadow: "rgba(34,197,94,0.1)",
      ornamentPrimary: "rgba(34,197,94,0.18)",
      ornamentSecondary: "rgba(74,222,128,0.12)",
      glowColor: "#22c55e",
      wood: ["#1a3a1a", "#132913", "#4ade80", "#163016", "#0e220e"],
      crystal: "#166534",
      effectPrimary: "rgba(34,197,94,0.4)",
      effectSecondary: "rgba(22,101,52,0.04)",
      effectHighlight: "rgba(220,252,231,0.25)",
      uiInputBg: "#0a120a",
      uiAccent: "rgba(22,101,52,0.4)",
      uiBorder: "rgba(34,197,94,0.2)",
      uiText: "rgba(187,247,208,0.8)",
      uiTextDim: "rgba(187,247,208,0.5)",
      uiTextGhost: "rgba(187,247,208,0.15)",
      uiSpiritText: "rgba(74,222,128,0.5)",
      uiLogBorder: "rgba(34,197,94,0.3)",
      glowRgb: "34,197,94",
      spinnerRgb: "187,247,208",
    },
    BoardDecorations: GardenDecorations,
  },
};

export const THEME_ORDER = ["classic", "skull", "ocean", "fire", "universe", "garden"];

// ── Theme Context ───────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    try {
      const saved = localStorage.getItem("__selectedTheme");
      if (saved && THEMES[saved]) return saved;
    } catch {}
    return "classic";
  });

  useEffect(() => {
    try {
      localStorage.setItem("__selectedTheme", themeId);
    } catch {}
  }, [themeId]);

  const theme = THEMES[themeId];
  const value = { theme, themeId, setThemeId };

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: THEMES.classic, themeId: "classic", setThemeId: () => {} };
  return ctx;
}
