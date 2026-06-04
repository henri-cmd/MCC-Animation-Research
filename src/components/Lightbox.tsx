import { useEffect } from 'react'

interface Props {
  images: string[]
  index: number
  title: string
  onClose: () => void
  onIndex: (i: number) => void
}

/** Fullscreen, keyboard-navigable image gallery (click a still in the drawer to open). */
export function Lightbox({ images, index, title, onClose, onIndex }: Props) {
  const go = (i: number) => onIndex((i + images.length) % images.length)

  useEffect(() => {
    // Capture phase + stopImmediatePropagation so Esc/arrows act on the lightbox,
    // not the detail drawer underneath.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        onClose()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopImmediatePropagation()
        go(index + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopImmediatePropagation()
        go(index - 1)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length])

  const arrow =
    'absolute top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-ink-900/70 text-2xl text-bone ring-1 ring-white/15 backdrop-blur transition hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-spectrum-4'

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-fade-in flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — image gallery`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-mono text-xs tabular-nums text-bone/70">
          {title} · {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close gallery"
          autoFocus
          className="rounded-full p-2 text-bone/80 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-spectrum-4"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-2"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {images.length > 1 && (
          <button onClick={() => go(index - 1)} aria-label="Previous image" className={`${arrow} left-3`}>
            ‹
          </button>
        )}
        <img
          src={images[index]}
          alt={`${title} still ${index + 1}`}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        />
        {images.length > 1 && (
          <button onClick={() => go(index + 1)} aria-label="Next image" className={`${arrow} right-3`}>
            ›
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex justify-start gap-2 overflow-x-auto px-4 py-3 sm:justify-center">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => onIndex(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === index}
              className={`h-12 w-20 shrink-0 overflow-hidden rounded ring-1 transition ${
                i === index ? 'ring-2 ring-bone' : 'opacity-50 ring-white/15 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
