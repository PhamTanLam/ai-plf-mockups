import type { ReactNode } from 'react'

export function Avatar({ size = 8 }: { size?: number }) {
  const sizeClass = size === 6 ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
  return (
    <div className={`${sizeClass} ai-grad rounded-lg shrink-0 flex items-center justify-center text-white font-bold`}>
      AI
    </div>
  )
}

export function UserAvatar({ size = 8, initial = '金' }: { size?: number; initial?: string }) {
  const sizeClass = size === 6 ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
  return (
    <div className={`${sizeClass} bg-brand-600 rounded-lg shrink-0 flex items-center justify-center text-white font-bold`}>
      {initial}
    </div>
  )
}

export function AiBubble({
  time,
  who,
  children,
  badge,
  badgeCls,
  compact = false,
}: {
  time: string
  who?: string
  children: ReactNode
  badge?: string
  badgeCls?: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Avatar size={6} />
          <span className="text-xs text-ink-300">{time}</span>
          {badge && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${badgeCls ?? 'bg-ai-50 text-ai-700'}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="relative bg-[#F5F8FF] border border-brand-100 rounded-lg p-2.5 text-sm bubble-ai ml-8">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-2 mb-1">
          {who && <span className="text-xs font-medium text-ai-600">{who}</span>}
          <span className="text-xs text-ink-300">{time}</span>
          {badge && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${badgeCls ?? 'bg-ai-50 text-ai-700'}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="bg-surface border border-line rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

export function UserBubble({
  time,
  userName,
  children,
  initial = '金',
  compact = false,
}: {
  time: string
  userName?: string
  children: ReactNode
  initial?: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-1 justify-end">
          <span className="text-xs text-ink-300">{time}</span>
          <UserAvatar size={6} initial={initial} />
        </div>
        <div className="relative bg-brand-600 text-white rounded-lg p-2.5 text-sm bubble-user mr-8">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 justify-end">
      <div className="max-w-2xl w-full flex flex-col items-end">
        <div className="flex items-center gap-2 mb-1 justify-end">
          <span className="text-xs text-ink-300">{time}</span>
          {userName && <span className="text-xs font-medium text-brand-600">{userName}</span>}
        </div>
        <div className="bg-brand-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm self-end">
          {children}
        </div>
      </div>
      <UserAvatar initial={initial} />
    </div>
  )
}

export function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] text-ink-400">{k}</div>
      <div className="font-medium text-ink-800">{v}</div>
    </div>
  )
}
