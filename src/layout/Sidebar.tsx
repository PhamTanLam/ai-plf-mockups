import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES } from '@/routes'

interface NavItem {
  labelKey: string
  icon: ReactNode
  to?: string
  badge?: string
}

interface NavSection {
  titleKey?: string
  items: NavItem[]
}

function Icon({ d, strokeWidth = 2 }: { d: string; strokeWidth?: number }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d={d} />
    </svg>
  )
}

const SECTIONS: NavSection[] = [
  {
    items: [
      {
        labelKey: 'nav.dashboard',
        to: ROUTES.dashboard,
        icon: (
          <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        ),
      },
    ],
  },
  {
    titleKey: 'nav.section.caseMgmt',
    items: [
      {
        labelKey: 'nav.caseList',
        to: ROUTES.cases,
        badge: '8',
        icon: <Icon d="M4 6h16M4 12h16M4 18h7" />,
      },
    ],
  },
  {
    titleKey: 'nav.section.common',
    items: [
      {
        labelKey: 'nav.refData',
        to: ROUTES.reference,
        icon: <Icon d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />,
      },
      {
        labelKey: 'nav.schedule',
        icon: (
          <Icon
            strokeWidth={1.75}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        ),
      },
      {
        labelKey: 'nav.resource',
        icon: (
          <Icon
            strokeWidth={1.75}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        ),
      },
      {
        labelKey: 'nav.issues',
        icon: (
          <Icon
            strokeWidth={1.75}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        ),
      },
      {
        labelKey: 'nav.report',
        icon: (
          <Icon
            strokeWidth={1.75}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
          />
        ),
      },
      {
        labelKey: 'nav.files',
        icon: (
          <Icon
            strokeWidth={1.75}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        ),
      },
      {
        labelKey: 'nav.chat',
        icon: (
          <Icon
            strokeWidth={1.75}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        ),
      },
    ],
  },
  {
    titleKey: 'nav.section.admin',
    items: [
      {
        labelKey: 'nav.settings',
        icon: (
          <Icon
            strokeWidth={1.75}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
        ),
      },
      {
        labelKey: 'nav.logout',
        to: ROUTES.login,
        icon: (
          <Icon
            strokeWidth={1.75}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        ),
      },
    ],
  },
]

const BASE_ITEM = 'flex items-center gap-2 px-3 py-2 rounded'
const INACTIVE = 'text-ink-500 hover:bg-surface-muted'

function Item({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const { t } = useI18n()
  const inner = (
    <>
      {item.icon}
      <span>{t(item.labelKey)}</span>
      {item.badge && (
        <span className="ml-auto text-xs px-1.5 py-0.5 bg-surface-alt text-ink-500 rounded">
          {item.badge}
        </span>
      )}
    </>
  )

  if (!item.to) {
    // Not-yet-implemented screen — visible but inert.
    return (
      <span className={`${BASE_ITEM} ${INACTIVE} cursor-not-allowed opacity-90`}>{inner}</span>
    )
  }

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${BASE_ITEM} ${isActive ? 'sidebar-active font-medium' : INACTIVE}`
      }
    >
      {inner}
    </NavLink>
  )
}

export function Sidebar({
  mobileOpen,
  onNavigate,
}: {
  mobileOpen: boolean
  onNavigate?: () => void
}) {
  const { t } = useI18n()
  return (
    <aside
      className={[
        'bg-white border-r border-line w-60 shrink-0 flex-col overflow-y-auto',
        mobileOpen ? 'absolute z-40 h-full flex' : 'hidden',
        'lg:flex lg:static',
      ].join(' ')}
    >
      <nav className="p-2 text-sm flex-1">
        {SECTIONS.map((section, i) => (
          <div key={section.titleKey ?? `s-${i}`}>
            {section.titleKey && (
              <div className="mt-3 px-3 text-xs font-semibold text-ink-300 uppercase">
                {t(section.titleKey)}
              </div>
            )}
            {section.items.map((item) => (
              <Item key={item.labelKey} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
