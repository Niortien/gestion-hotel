// components/common/SectionHeading.tsx
interface Props {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function SectionHeading({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-end justify-between mb-6" data-animate>
      <div>
        <h1
          className="font-display text-4xl font-light tracking-wide"
          style={{ color: '#3D1F0F', fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: '#5C6068', fontFamily: 'inherit' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
      <div className="brass-line mt-3 w-full absolute left-0" style={{ bottom: 0 }} />
    </div>
  )
}
