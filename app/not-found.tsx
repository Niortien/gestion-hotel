'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { IconRocket, IconArrowLeft, IconPlanet, IconStars } from '@tabler/icons-react'

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLHeadingElement>(null)
  const rocketRef = useRef<HTMLDivElement>(null)
  const starsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stars fade in
      gsap.fromTo(
        '.star',
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: 'back.out(2)',
        }
      )

      // 404 text glitch entrance
      gsap.fromTo(
        codeRef.current,
        { opacity: 0, y: -60, skewX: -10 },
        { opacity: 1, y: 0, skewX: 0, duration: 0.8, ease: 'expo.out', delay: 0.3 }
      )

      // Content fade up
      gsap.fromTo(
        '.not-found-content',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.6, stagger: 0.1 }
      )

      // Rocket floating loop
      gsap.to(rocketRef.current, {
        y: -18,
        rotation: 8,
        duration: 2.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      // Rocket trail pulse
      gsap.to('.rocket-trail', {
        scaleY: 1.4,
        opacity: 0.4,
        duration: 1.1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.15,
      })

      // Planets slow rotation
      gsap.to('.planet-orbit', {
        rotation: 360,
        duration: 20,
        ease: 'none',
        repeat: -1,
        transformOrigin: '50% 50%',
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-base-100 px-6"
    >
      {/* Stars background */}
      <div ref={starsRef} className="pointer-events-none absolute inset-0">
        {Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            className="star absolute rounded-full bg-primary/40"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Orbiting planet */}
      <div className="planet-orbit pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute -right-8 top-0 opacity-30">
          <IconPlanet size={40} className="text-secondary" />
        </div>
      </div>

      {/* 404 */}
      <h1
        ref={codeRef}
        className="select-none font-mono text-[clamp(6rem,20vw,14rem)] font-black leading-none tracking-tighter text-primary opacity-0"
        style={{ textShadow: '4px 4px 0 oklch(var(--color-secondary) / 0.3)' }}
      >
        404
      </h1>

      {/* Rocket */}
      <div ref={rocketRef} className="relative my-2">
        <IconRocket size={72} className="text-secondary drop-shadow-lg" />
        {/* Trails */}
        <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-1">
          {[14, 10, 14].map((h, i) => (
            <span
              key={i}
              className="rocket-trail block w-1.5 origin-top rounded-full bg-primary/60"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      </div>

      {/* Text */}
      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <p className="not-found-content flex items-center gap-2 text-2xl font-bold text-base-content">
          <IconStars size={24} className="text-primary" />
          Page introuvable
          <IconStars size={24} className="text-primary" />
        </p>
        <p className="not-found-content max-w-sm text-base-content/60">
          Cette page s'est perdue dans l'espace. Elle dérive quelque part entre deux galaxies.
        </p>

        <Link
          href="/"
          className="not-found-content btn btn-primary mt-4 gap-2"
        >
          <IconArrowLeft size={18} />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
