import type { ToasterProps } from 'react-hot-toast'

// ─── App ──────────────────────────────────────────────────────────────────────

export const appConfig = {
  name: 'Frontend Starter',
  description: 'Next.js starter with DaisyUI, HeroUI, TanStack Query, Zustand, Zod',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const

// ─── Theme ────────────────────────────────────────────────────────────────────

/**
 * DaisyUI theme.
 * Liste complète : https://daisyui.com/docs/themes/
 * Valeurs possibles : "light" | "dark" | "cupcake" | "bumblebee" | "emerald" |
 *   "corporate" | "synthwave" | "retro" | "cyberpunk" | "valentine" | "halloween" |
 *   "garden" | "forest" | "aqua" | "lofi" | "pastel" | "fantasy" | "wireframe" |
 *   "black" | "luxury" | "dracula" | "cmyk" | "autumn" | "business" | "acid" |
 *   "lemonade" | "night" | "coffee" | "winter" | "dim" | "nord" | "sunset"
 */
export const themeConfig = {
  /** Thème par défaut (light mode) */
  default: 'light',
  /** Thème utilisé en dark mode */
  dark: 'dark',
} as const

export type AppTheme = (typeof themeConfig)[keyof typeof themeConfig]

// ─── Colors ───────────────────────────────────────────────────────────────────
/**
 * Couleurs principales de l'app.
 * Ces valeurs sont utilisées dans globals.css via les variables CSS DaisyUI :
 *   --color-primary   → colorConfig.primary
 *   --color-secondary → colorConfig.secondary
 *
 * Les modifier ici ET dans globals.css (section "Color overrides").
 * Utilisables aussi en JS pour GSAP, canvas, etc.
 */
export const colorConfig = {
  /** Couleur principale — utilisée par btn-primary, text-primary, bg-primary… */
  primary: '#63f17b',
  /** Contenu sur fond primary (texte/icône) */
  primaryContent: '#ffffff',
  /** Couleur secondaire — utilisée par btn-secondary, text-secondary… */
  secondary: '#8b5cf6',
  /** Contenu sur fond secondary */
  secondaryContent: '#ffffff',
} as const

// ─── Toast (react-hot-toast) ──────────────────────────────────────────────────

export const toastConfig: ToasterProps = {
  position: 'top-right',
  toastOptions: {
    duration: 4000,
    style: {
      borderRadius: '8px',
      fontSize: '14px',
    },
    success: {
      duration: 3000,
    },
    error: {
      duration: 5000,
    },
  },
}

// ─── TanStack Query ───────────────────────────────────────────────────────────

export const queryConfig = {
  /** Durée avant qu'une donnée soit considérée périmée (ms) */
  staleTime: 60 * 1000,
  /** Nombre de tentatives en cas d'erreur */
  retry: 1,
  /** Revalider au focus de la fenêtre */
  refetchOnWindowFocus: false,
} as const

// ─── API ──────────────────────────────────────────────────────────────────────

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  timeout: 10_000,
} as const
