// lib/animations/gsap.config.ts
'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

let initialized = false

export function initGSAP() {
  if (initialized || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, Flip)
  gsap.defaults({ ease: 'power2.out' })
  initialized = true
}

export { gsap, ScrollTrigger, Flip }
