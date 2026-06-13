// components/common/SearchResults.tsx
'use client'

import { useRef, useEffect } from 'react'
import { animateResultItemHover } from '@/lib/animations/searchAnimations'

interface ResultItem {
  id: string
  primary: string
  secondary?: string
  badge?: React.ReactNode
  onClick?: () => void
}

interface Props {
  items: ResultItem[]
  query: string
  containerRef: React.RefObject<HTMLDivElement | null>
  visible: boolean
}

function highlight(text: string, query: string) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: '#B5924C28',
          color: '#B5924C',
          borderRadius: 2,
          padding: '0 1px',
          fontWeight: 600,
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchResults({ items, query, containerRef, visible }: Props) {
  if (!visible) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderRadius: '0 0 16px 16px',
        border: '1px solid #EDE8DF',
        borderTop: 'none',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(61,31,15,0.1)',
        maxHeight: 320,
        overflowY: 'auto',
      }}
    >
      {items.length === 0 ? (
        <div
          style={{ padding: '16px 20px', color: '#5C6068', fontSize: 13, textAlign: 'center' }}
          data-result-item
        >
          Aucun résultat
        </div>
      ) : (
        items.map((item) => (
          <ResultRow key={item.id} item={item} query={query} />
        ))
      )}
    </div>
  )
}

function ResultRow({ item, query }: { item: ResultItem; query: string }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      data-result-item
      onClick={item.onClick}
      onMouseEnter={() => ref.current && animateResultItemHover(ref.current, true)}
      onMouseLeave={() => ref.current && animateResultItemHover(ref.current, false)}
      style={{
        padding: '10px 20px',
        cursor: item.onClick ? 'pointer' : 'default',
        borderBottom: '1px solid #EDE8DF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        transition: 'background 0.15s',
      }}
      onMouseOver={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#FAF7F2' }}
      onMouseOut={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#3D1F0F' }}>
          {highlight(item.primary, query)}
        </div>
        {item.secondary && (
          <div style={{ fontSize: 11, color: '#5C6068', marginTop: 1 }}>
            {highlight(item.secondary, query)}
          </div>
        )}
      </div>
      {item.badge}
    </div>
  )
}
