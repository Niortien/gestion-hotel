// lib/animations/searchAnimations.ts
'use client'

import { gsap } from './gsap.config'
import type { RefObject } from 'react'

export function animateSearchFocus(
  lineRef: RefObject<HTMLElement | null>,
  bgRef: RefObject<HTMLElement | null>,
  labelRef: RefObject<HTMLElement | null>,
  cursorRef: RefObject<HTMLElement | null>
) {
  const tl = gsap.timeline()
  if (lineRef.current) {
    tl.fromTo(lineRef.current, { scaleX: 0, transformOrigin: 'right center' }, { scaleX: 1, duration: 0.3, ease: 'power2.out' })
  }
  if (bgRef.current) {
    tl.to(bgRef.current, { opacity: 1, borderRadius: 12, duration: 0.2 }, '-=0.1')
  }
  if (labelRef.current) {
    tl.to(labelRef.current, { y: -20, scale: 0.75, color: '#B5924C', duration: 0.25, transformOrigin: 'left center' }, '-=0.2')
  }
  if (cursorRef.current) {
    tl.to(cursorRef.current, { opacity: 1, duration: 0.1 }, '-=0.1')
    gsap.to(cursorRef.current, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'none' })
  }
  return tl
}

export function animateSearchBlur(
  lineRef: RefObject<HTMLElement | null>,
  bgRef: RefObject<HTMLElement | null>,
  labelRef: RefObject<HTMLElement | null>,
  cursorRef: RefObject<HTMLElement | null>,
  hasValue: boolean
) {
  const tl = gsap.timeline()
  if (cursorRef.current) {
    gsap.killTweensOf(cursorRef.current)
    tl.to(cursorRef.current, { opacity: 0, duration: 0.1 })
  }
  if (!hasValue) {
    if (labelRef.current) {
      tl.to(labelRef.current, { y: 0, scale: 1, color: '#5C6068', duration: 0.25 }, '-=0.05')
    }
  }
  if (bgRef.current) {
    tl.to(bgRef.current, { opacity: 0, duration: 0.15 }, '-=0.1')
  }
  return tl
}

export function animateResultsIn(container: HTMLElement) {
  const items = container.querySelectorAll('[data-result-item]')
  gsap.set(container, { height: 0, opacity: 0 })
  gsap.to(container, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' })
  if (items.length > 0) {
    gsap.fromTo(
      items,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
    )
  }
}

export function animateResultsOut(container: HTMLElement, onComplete?: () => void) {
  gsap.to(container, { height: 0, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete })
}

export function animateResultItemHover(item: HTMLElement, entering: boolean) {
  gsap.to(item, { x: entering ? 4 : 0, duration: 0.2, ease: 'power2.out' })
}
