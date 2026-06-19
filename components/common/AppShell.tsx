// components/common/AppShell.tsx
'use client'

import { useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarDays,
  Receipt,
  FileText,
  Settings,
  LogOut,
  Activity,
  DoorOpen,
} from 'lucide-react'
import { gsap } from '@/lib/animations/gsap.config'
import { initGSAP } from '@/lib/animations/gsap.config'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useHotelStore } from '@/store/hotel-store'
import { useAuthStore } from '@/store/auth-store'

const NAV_ITEMS = [
  { href: '/dashboard',    Icon: LayoutDashboard, labelFr: 'Tableau de bord',  labelEn: 'Dashboard' },
  { href: '/resume',       Icon: Activity,        labelFr: 'Résumé',           labelEn: 'Daily Summary' },
  { href: '/accueil',      Icon: DoorOpen,        labelFr: 'Accueil immédiat', labelEn: 'Walk-in' },
  { href: '/chambres',     Icon: BedDouble,       labelFr: 'Chambres',         labelEn: 'Rooms' },
  { href: '/clients',      Icon: Users,           labelFr: 'Clients',          labelEn: 'Guests' },
  { href: '/reservations', Icon: CalendarDays,    labelFr: 'Réservations',     labelEn: 'Reservations' },
  { href: '/depenses',     Icon: Receipt,         labelFr: 'Dépenses',         labelEn: 'Expenses' },
  { href: '/rapports',     Icon: FileText,        labelFr: 'Rapports',         labelEn: 'Reports' },
  { href: '/parametres',   Icon: Settings,        labelFr: 'Paramètres',       labelEn: 'Settings' },
]

interface Props { children: React.ReactNode }

export function AppShell({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useHotelStore((s) => s.locale)
  const { isAuthenticated, clearAuth, _hasHydrated } = useAuthStore()
  const activeIndicatorRef = useRef<HTMLDivElement>(null)

  // Only redirect after the store has been hydrated from localStorage
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, _hasHydrated, router])
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const tooltipRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => { initGSAP() }, [])

  // Animate active indicator on route change
  useEffect(() => {
    const activeIdx = NAV_ITEMS.findIndex((item) => pathname.startsWith(item.href))
    if (activeIdx === -1 || !activeIndicatorRef.current) return
    const el = navItemRefs.current[activeIdx]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const railTop = el.closest('.nav-rail')?.getBoundingClientRect().top ?? 0
    gsap.to(activeIndicatorRef.current, {
      y: rect.top - railTop,
      opacity: 1,
      duration: 0.35,
      ease: 'power3.out',
    })
  }, [pathname])

  const handleNavEnter = useCallback((idx: number) => {
    const tooltip = tooltipRefs.current[idx]
    if (!tooltip) return
    gsap.fromTo(tooltip, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' })
    tooltip.style.display = 'block'
  }, [])

  const handleNavLeave = useCallback((idx: number) => {
    const tooltip = tooltipRefs.current[idx]
    if (!tooltip) return
    gsap.to(tooltip, {
      opacity: 0,
      x: -6,
      duration: 0.15,
      onComplete: () => { if (tooltip) tooltip.style.display = 'none' },
    })
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#FAF7F2' }}>
      {/* ── Rail Navigation ── */}
      <nav className="nav-rail">
        {/* Logo */}
        <div
          style={{
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderBottom: '1px solid #EDE8DF',
            width: '100%',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#B5924C',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              textAlign: 'center',
            }}
          >
            PMS
          </span>
        </div>

        {/* Active indicator bar */}
        <div
          ref={activeIndicatorRef}
          style={{
            position: 'absolute',
            left: 0,
            width: 3,
            height: 44,
            background: 'linear-gradient(180deg, #B5924C, #D4AF72)',
            borderRadius: '0 3px 3px 0',
            top: 72 + 14,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 10,
            transition: 'none',
          }}
        />

        {/* Nav items */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 12, width: '100%' }}>
          {NAV_ITEMS.map(({ href, Icon, labelFr, labelEn }, idx) => {
            const isActive = pathname.startsWith(href)
            const label = locale === 'fr' ? labelFr : labelEn

            return (
              <div key={href} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Link
                  href={href}
                  ref={(el) => { navItemRefs.current[idx] = el }}
                  onMouseEnter={() => handleNavEnter(idx)}
                  onMouseLeave={() => handleNavLeave(idx)}
                  style={{
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    background: isActive ? 'linear-gradient(135deg, #B5924C18, #D4AF7212)' : 'transparent',
                    color: isActive ? '#B5924C' : '#5C6068',
                    transition: 'background 0.2s, color 0.2s',
                    textDecoration: 'none',
                    position: 'relative',
                  }}
                >
                  <Icon size={20} strokeWidth={1.25} />
                </Link>

                {/* Tooltip */}
                <span
                  ref={(el) => { tooltipRefs.current[idx] = el }}
                  style={{
                    display: 'none',
                    position: 'absolute',
                    left: 64,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#3D1F0F',
                    color: '#FAF7F2',
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '5px 10px',
                    borderRadius: 8,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 200,
                    boxShadow: '0 4px 12px rgba(61,31,15,0.2)',
                  }}
                >
                  {label}
                  <span
                    style={{
                      position: 'absolute',
                      right: '100%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: '5px solid transparent',
                      borderRightColor: '#3D1F0F',
                    }}
                  />
                </span>
              </div>
            )
          })}
        </div>

        {/* Language switcher + logout at bottom */}
        <div style={{ paddingBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <LanguageSwitcher />
          <button
            onClick={() => { clearAuth(); router.replace('/login') }}
            title="Déconnexion"
            style={{
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12, background: 'transparent',
              color: '#5C6068', border: 'none', cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#B5924C' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#5C6068' }}
          >
            <LogOut size={18} strokeWidth={1.25} />
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="page-content" style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  )
}
