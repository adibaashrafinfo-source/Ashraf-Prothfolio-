// Tweakable constants for the sticky card-stack scroll experience.

/** Scroll distance (in viewport heights) each card "owns" before the next one covers it. */
export const CARD_SCROLL_HEIGHT = '100vh'

/** Sticky offset for the first card — clears the fixed navbar. */
export const BASE_TOP = 96

/** Extra sticky-top offset added per card index, so earlier cards peek above later ones. */
export const PEEK_OFFSET = 24

/** Same idea as PEEK_OFFSET, but tighter for small screens. */
export const PEEK_OFFSET_MOBILE = 12

/** Stop increasing the peek stagger after this many cards. */
export const MAX_PEEK_STEPS = 5

/** Scale a card settles at once the next card has fully covered it (desktop). */
export const MIN_SCALE = 0.82

/** Same idea as MIN_SCALE, but subtler for small screens. */
export const MIN_SCALE_MOBILE = 0.92

/** 3D backward lean applied to a fully-covered card (desktop only). */
export const MAX_ROTATE_X = 10

/** Dimming applied to a fully-covered card via brightness filter. */
export const MIN_BRIGHTNESS = 0.7

/** Text-column opacity once a card is fully covered. */
export const MIN_CONTENT_OPACITY = 0.4

export const SPRING_CONFIG = { stiffness: 120, damping: 24, mass: 0.4 }
