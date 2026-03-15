/** Layout config for a deck — all values in 360-base coords (scaled by width/360) */

export const DEFAULT_LAYOUT = {
  overlayOpacity: 0.55,
  paddingHorizontal: 28,
  logo: { top: 22, size: 22 },
  title: { top: 58, fontSize: 22, letterSpacing: 5 },
  subtitle: { marginTop: 4, fontSize: 11, letterSpacing: 4 },
  answerTop: 60,
  spiritLabel: { fontSize: 10, letterSpacing: 3, marginBottom: 14 },
  answer: { letterSpacing: 3, sizes: [20, 26, 32] },
  qr: { marginBottom: 40, size: 62, borderRadius: 4 },
  noQrSpacing: 40,
};

export const DECKS = [
  {
    id: "realm",
    name: "Realm",
    color: "#D97706",
    layout: {
      ...DEFAULT_LAYOUT,
    },
    cards: [
      { id: "realm-01", src: "/__data__/cards/realm-01.webp" },
      { id: "realm-02", src: "/__data__/cards/realm-02.webp" },
      { id: "realm-03", src: "/__data__/cards/realm-03.webp" },
      { id: "realm-04", src: "/__data__/cards/realm-04.webp" },
      { id: "realm-05", src: "/__data__/cards/realm-05.webp" },
      { id: "realm-06", src: "/__data__/cards/realm-06.webp" },
      { id: "realm-07", src: "/__data__/cards/realm-07.webp" },
      { id: "realm-08", src: "/__data__/cards/realm-08.webp" },
    ],
  },
  {
    id: "medley",
    name: "Medley",
    color: "#A855F7",
    layout: {
      ...DEFAULT_LAYOUT,
      logo: { top: 42, size: 22 },
      title: { top: 78, fontSize: 22, letterSpacing: 5 },
    },
    cards: [
      { id: "medley-01", src: "/__data__/cards/medley-01.webp" },
      { id: "medley-02", src: "/__data__/cards/medley-02.webp" },
      { id: "medley-03", src: "/__data__/cards/medley-03.webp" },
      { id: "medley-04", src: "/__data__/cards/medley-04.webp" },
      { id: "medley-05", src: "/__data__/cards/medley-05.webp" },
      { id: "medley-06", src: "/__data__/cards/medley-06.webp" },
    ],
  },
  {
    id: "ocean",
    name: "Ocean",
    color: "#38BDF8",
    layout: {
      ...DEFAULT_LAYOUT,
      logo: { top: 38, size: 22 },
      title: { top: 74, fontSize: 22, letterSpacing: 5 },
    },
    cards: [
      { id: "ocean-01", src: "/__data__/cards/ocean-01.webp" },
      { id: "ocean-02", src: "/__data__/cards/ocean-02.webp" },
      { id: "ocean-03", src: "/__data__/cards/ocean-03.webp" },
    ],
  },
  {
    id: "presence",
    name: "Presence",
    color: "#FB7185",
    layout: {
      ...DEFAULT_LAYOUT,
      logo: { top: 26, size: 22 },
      title: { top: 62, fontSize: 22, letterSpacing: 5 },
    },
    cards: [
      { id: "presence-01", src: "/__data__/cards/presence-01.webp" },
      { id: "presence-02", src: "/__data__/cards/presence-02.webp" },
      { id: "presence-03", src: "/__data__/cards/presence-03.webp" },
    ],
  },
  {
    id: "mirror",
    name: "Mirror",
    color: "#94A3B8",
    layout: {
      ...DEFAULT_LAYOUT,
      logo: { top: 42, size: 22 },
      title: { top: 78, fontSize: 22, letterSpacing: 5 },
    },
    cards: [
      { id: "mirror-01", src: "/__data__/cards/mirror-01.webp" },
      { id: "mirror-02", src: "/__data__/cards/mirror-02.webp" },
      { id: "mirror-03", src: "/__data__/cards/mirror-03.webp" },
      { id: "mirror-04", src: "/__data__/cards/mirror-04.webp" },
      { id: "mirror-05", src: "/__data__/cards/mirror-05.webp" },
      { id: "mirror-06", src: "/__data__/cards/mirror-06.webp" },
    ],
  },
  {
    id: "the-sin",
    name: "The Sin",
    color: "#EF4444",
    layout: {
      ...DEFAULT_LAYOUT,
      logo: { top: 34, size: 22 },
      title: { top: 68, fontSize: 22, letterSpacing: 5 },
    },
    cards: [
      { id: "the-sin-01", src: "/__data__/cards/the-sin-01.webp" },
      { id: "the-sin-02", src: "/__data__/cards/the-sin-02.webp" },
      { id: "the-sin-03", src: "/__data__/cards/the-sin-03.webp" },
      { id: "the-sin-04", src: "/__data__/cards/the-sin-04.webp" },
      { id: "the-sin-05", src: "/__data__/cards/the-sin-05.webp" },
      { id: "the-sin-06", src: "/__data__/cards/the-sin-06.webp" },
    ],
  },
];

/** Flat list of all cards with their deck layout attached */
export const CARD_DESIGNS = DECKS.flatMap((deck) =>
  deck.cards.map((card) => ({
    ...card,
    deckId: deck.id,
    deckName: deck.name,
    deckColor: deck.color,
    layout: deck.layout,
  })),
);

export const CARD_ASPECT = 1354 / 828;
