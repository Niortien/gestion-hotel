// components/common/AnimatedSearchBar.tsx
'use client'

import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { gsap } from '@/lib/animations/gsap.config'
import { animateSearchFocus, animateSearchBlur } from '@/lib/animations/searchAnimations'

interface Props {
  value: string
  onChange: (val: string) => void
  label: string
  isSearching?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

export const AnimatedSearchBar = forwardRef<HTMLInputElement, Props>(function AnimatedSearchBar(
  { value, onChange, label, isSearching = false, onFocus, onBlur },
  forwardedRef
) {
  const lineRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement)

  const handleFocus = useCallback(() => {
    animateSearchFocus(
      lineRef as React.RefObject<HTMLElement>,
      bgRef as React.RefObject<HTMLElement>,
      labelRef as React.RefObject<HTMLElement>,
      cursorRef as React.RefObject<HTMLElement>
    )
    onFocus?.()
  }, [onFocus])

  const handleBlur = useCallback(() => {
    animateSearchBlur(
      lineRef as React.RefObject<HTMLElement>,
      bgRef as React.RefObject<HTMLElement>,
      labelRef as React.RefObject<HTMLElement>,
      cursorRef as React.RefObject<HTMLElement>,
      value.length > 0
    )
    onBlur?.()
  }, [value, onBlur])

  const handleClear = useCallback(() => {
    onChange('')
    inputRef.current?.focus()
  }, [onChange])

  // Loader animation
  const prevSearching = useRef(false)
  if (loaderRef.current) {
    if (isSearching && !prevSearching.current) {
      gsap.to(loaderRef.current, { opacity: 1, duration: 0.2 })
      gsap.to(loaderRef.current.querySelector('svg'), { rotation: 360, duration: 0.8, repeat: -1, ease: 'none' })
    } else if (!isSearching && prevSearching.current) {
      gsap.to(loaderRef.current, { opacity: 0, duration: 0.2 })
    }
  }
  prevSearching.current = isSearching

  return (
    <div
      style={{ position: 'relative', width: '100%' }}
      data-animate
    >
      {/* Background (appears on focus) */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: '-4px -8px',
          background: '#FAF7F2',
          borderRadius: 12,
          border: '1px solid #EDE8DF',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Input row */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6 }}>
        <Search size={16} strokeWidth={1.25} style={{ color: '#B5924C', flexShrink: 0 }} />

        <div style={{ flex: 1, position: 'relative' }}>
          {/* Floating label */}
          <span
            ref={labelRef}
            onClick={() => inputRef.current?.focus()}
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              transformOrigin: 'left center',
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 15,
              color: value ? '#B5924C' : '#5C6068',
              pointerEvents: value ? 'none' : 'auto',
              cursor: 'text',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              display: value ? 'none' : 'block',
            }}
          >
            {label}
          </span>

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: '#3D1F0F',
              fontFamily: 'inherit',
              caretColor: '#B5924C',
              lineHeight: 1.6,
            }}
            autoComplete="off"
          />

          {/* Cursor blink (shown on focus when empty) */}
          {!value && (
            <span
              ref={cursorRef}
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)',
                width: 1.5,
                height: 18,
                background: '#B5924C',
                display: 'block',
                opacity: 0,
                borderRadius: 1,
              }}
              className="cursor-blink"
            />
          )}
        </div>

        {/* Loader */}
        <div
          ref={loaderRef}
          style={{ opacity: 0, flexShrink: 0, display: 'flex', alignItems: 'center' }}
        >
          <Loader2 size={14} strokeWidth={1.5} style={{ color: '#B5924C' }} />
        </div>

        {/* Clear button */}
        {value && (
          <button
            onMouseDown={(e) => { e.preventDefault(); handleClear() }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#5C6068',
              padding: 2,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} strokeWidth={1.25} />
          </button>
        )}
      </div>

      {/* Bottom line */}
      <div
        ref={lineRef}
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, #B5924C 20%, #B5924C 80%, transparent)',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  )
})
