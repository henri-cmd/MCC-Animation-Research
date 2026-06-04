// The maturity spectrum (young → old). A bar/band samples this ramp by age:
// 0–17 maps across the nine stops; 17+ / 99 resolves to the crimson end.

export const SPECTRUM_STOPS = [
  '#E8A33D', // cream-gold   (toddler)
  '#EE7A47', // warm orange
  '#5FA862', // green
  '#3690C9', // blue
  '#6655C9', // indigo
  '#9B6FD6', // violet
  '#D6457A', // magenta-pink
  '#E0552B', // burnt orange
  '#C0392B', // deep crimson (adult)
] as const

export const MAX_REAL_AGE = 17

export interface RGB {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

const STOP_RGB = SPECTRUM_STOPS.map(hexToRgb)

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

/** Sample the spectrum at a given viewing age, returning an RGB triple. */
export function spectrumRGB(age: number): RGB {
  const t = clamp01(Math.min(age, MAX_REAL_AGE) / MAX_REAL_AGE)
  const pos = t * (STOP_RGB.length - 1)
  const i = Math.floor(pos)
  if (i >= STOP_RGB.length - 1) return STOP_RGB[STOP_RGB.length - 1]
  const f = pos - i
  const a = STOP_RGB[i]
  const b = STOP_RGB[i + 1]
  return {
    r: Math.round(lerp(a.r, b.r, f)),
    g: Math.round(lerp(a.g, b.g, f)),
    b: Math.round(lerp(a.b, b.b, f)),
  }
}

export const rgbCss = ({ r, g, b }: RGB, alpha = 1) =>
  alpha >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`

/** Solid spectrum colour for a given age, as a CSS string. */
export function spectrumColor(age: number, alpha = 1): string {
  return rgbCss(spectrumRGB(age), alpha)
}

/** Relative luminance (0–1) — used to pick readable text colour over a bar. */
export function luminance({ r, g, b }: RGB): number {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** Pick near-black or near-white ink for legible text on a spectrum colour. */
export function inkOn(age: number): string {
  return luminance(spectrumRGB(age)) > 0.5 ? '#1B1714' : '#FBF7F0'
}
