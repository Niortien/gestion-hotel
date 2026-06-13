// lib/animations/pageTransitions.ts
'use client'

import { gsap } from './gsap.config'

export function animatePageIn(container: HTMLElement) {
  const children = container.querySelectorAll('[data-animate]')
  if (children.length > 0) {
    gsap.fromTo(
      children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' }
    )
  } else {
    gsap.fromTo(container, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' })
  }
}

export function animatePageOut(container: HTMLElement, onComplete?: () => void) {
  gsap.to(container, { y: -15, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete })
}

export function animateStagger(elements: NodeListOf<Element> | Element[], delay = 0) {
  gsap.fromTo(
    elements,
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay, ease: 'power2.out' }
  )
}

export function animateSlideIn(panel: HTMLElement, direction: 'right' | 'left' | 'bottom' = 'right') {
  const from = direction === 'right' ? { x: '100%' } : direction === 'left' ? { x: '-100%' } : { y: '100%' }
  const to = direction === 'right' ? { x: '0%' } : direction === 'left' ? { x: '0%' } : { y: '0%' }
  return gsap.fromTo(panel, from, { ...to, duration: 0.4, ease: 'power3.out' })
}

export function animateSlideOut(panel: HTMLElement, direction: 'right' | 'left' | 'bottom' = 'right', onComplete?: () => void) {
  const to = direction === 'right' ? { x: '100%' } : direction === 'left' ? { x: '-100%' } : { y: '100%' }
  return gsap.to(panel, { ...to, duration: 0.35, ease: 'power3.in', onComplete })
}

export function animateFormStep(outEl: HTMLElement, inEl: HTMLElement, direction: 'forward' | 'back') {
  const xOut = direction === 'forward' ? '-100%' : '100%'
  const xIn = direction === 'forward' ? '100%' : '-100%'
  const tl = gsap.timeline()
  tl.to(outEl, { x: xOut, opacity: 0, duration: 0.3, ease: 'power2.in' })
  tl.fromTo(inEl, { x: xIn, opacity: 0 }, { x: '0%', opacity: 1, duration: 0.3, ease: 'power2.out' })
  return tl
}
