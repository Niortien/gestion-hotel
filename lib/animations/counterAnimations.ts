// lib/animations/counterAnimations.ts
'use client'

import { gsap } from './gsap.config'

export function animateCounter(
  el: HTMLElement,
  target: number,
  duration = 1.5,
  formatter?: (val: number) => string
) {
  const obj = { val: 0 }
  gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate() {
      const rounded = Math.round(obj.val)
      el.textContent = formatter ? formatter(rounded) : String(rounded)
    },
    onComplete() {
      el.textContent = formatter ? formatter(target) : String(target)
    },
  })
}

export function animateCounterDecimal(
  el: HTMLElement,
  target: number,
  decimals = 1,
  duration = 1.5,
  suffix = ''
) {
  const obj = { val: 0 }
  gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate() {
      el.textContent = obj.val.toFixed(decimals) + suffix
    },
    onComplete() {
      el.textContent = target.toFixed(decimals) + suffix
    },
  })
}

export function animateOccupancyArc(
  svgPath: SVGPathElement,
  percentage: number,
  totalLength: number
) {
  const targetOffset = totalLength - (totalLength * percentage) / 100
  gsap.fromTo(
    svgPath,
    { strokeDashoffset: totalLength },
    { strokeDashoffset: targetOffset, duration: 1.8, ease: 'power3.out' }
  )
}

export function animateRevenueTicker(strip: HTMLElement) {
  gsap.killTweensOf(strip)
  gsap.to(strip, {
    x: '-50%',
    duration: 22,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x: number) => {
        const val = parseFloat(String(x))
        return val <= -50 ? val + 50 : val
      }, '%'),
    },
  })
}
