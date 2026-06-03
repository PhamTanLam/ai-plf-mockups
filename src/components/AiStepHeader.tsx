import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AiStepNavigation from './AiStepNavigation'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface AiStepHeaderProps {
  stepNumber: string
  title: string
  subtitle?: ReactNode
  addonBadge?: string
  breadcrumbs: BreadcrumbItem[]
  actions?: ReactNode
  isCollapsed: boolean
  collapsedTitle?: string
  children?: ReactNode
}

export default function AiStepHeader({
  stepNumber,
  title,
  subtitle,
  addonBadge,
  breadcrumbs,
  actions,
  isCollapsed,
  collapsedTitle,
  children,
}: AiStepHeaderProps) {
  return (
    <div className="bg-white border-b border-line px-5 lg:px-8 py-2.5 transition-all duration-300 select-none">
      <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 mb-0 pointer-events-none' : 'max-h-[500px] opacity-100 mb-2'}`}>
        {/* Breadcrumbs */}
        <div className="flex items-center text-xs text-ink-500 mb-2 flex-wrap">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="mx-1.5 text-ink-300">/</span>}
                {item.to && !isLast ? (
                  <Link to={item.to} className="hover:text-brand-600">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-ink-700 font-medium' : ''}>{item.label}</span>
                )}
              </span>
            )
          })}
        </div>
        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-4 flex-wrap pb-1">
          <div>
            <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <span className="ai-grad-text">{stepNumber}</span> <span>{title}</span>
              {addonBadge && (
                <span className="text-xs font-normal text-ai-700 px-2 py-0.5 bg-ai-50 rounded">
                  {addonBadge}
                </span>
              )}
            </h1>
            {subtitle && (
              <div className="text-sm text-ink-500 mt-0.5 flex items-center gap-2 flex-wrap">
                {subtitle}
              </div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        <AiStepNavigation />

        {/* Sub-header children */}
        {children}
      </div>

      {/* Collapsed Breadcrumb */}
      {isCollapsed && (
        <div className="flex items-center gap-2 text-xs py-0.5 text-ink-500 transition-all duration-300">
          <span className="font-semibold text-brand-600">Quy trình</span>
          <span>&gt;</span>
          <span className="text-ink-700 font-medium">{collapsedTitle || `Bước ${stepNumber}: ${title}`}</span>
          <span className="ml-auto text-[10px] text-ink-400 bg-surface-alt px-2 py-0.5 rounded">
            Cuộn lên để mở rộng
          </span>
        </div>
      )}
    </div>
  )
}

export function useCollapsibleHeader() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    if (scrollTop > 60) {
      setIsCollapsed(true)
    } else if (scrollTop === 0) {
      setIsCollapsed(false)
    }
  }

  return { isCollapsed, setIsCollapsed, handleScroll }
}
