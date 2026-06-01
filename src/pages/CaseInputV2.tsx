import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES, caseDetailPath, DEMO_CASE_ID } from '@/routes'

/**
 * S1 Case Input — REDESIGN v2.
 * Chat is the protagonist; right "extracted data" panel is collapsible;
 * input-completion % is prominent; pre-sales "generate estimate" surfaced.
 */
export default function CaseInputV2() {
  const { t } = useI18n()
  const [panelOpen, setPanelOpen] = useState(true)
  const check = <span className="text-green-600 text-xs">✓</span>

  return (
    <div className="flex flex-col min-w-0 h-full overflow-hidden bg-surface-alt">
      {/* sub-header */}
      <div className="bg-surface border-b border-line px-5 lg:px-8 py-3">
        <div className="flex items-center text-xs text-ink-400 mb-2">
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">{t('nav.dashboard')}</Link>
          <span className="mx-1.5">/</span>
          <Link to={caseDetailPath(DEMO_CASE_ID)} className="hover:text-brand-600">CASE-2026-0312</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-700">{t('page.input')}</span>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <span className="ai-grad-text">①</span> <span>{t('page.caseInput')}</span>
              <span className="text-xs font-normal text-ai-600 px-2 py-0.5 bg-ai-50 rounded">{t('page.aiBadge')}</span>
            </h1>
            <div className="text-sm text-ink-500 mt-0.5">{t('case.title')} · {t('case.customerLabel')}: AAA重機</div>
          </div>
          <div className="flex items-center gap-3">
            {/* completion */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[10px] text-ink-400 leading-none">{t('s1.completion')}</div>
                <div className="text-base font-semibold text-ai-600 leading-tight">62%</div>
              </div>
              <div className="w-12 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                <div className="ai-grad h-full" style={{ width: '62%' }} />
              </div>
            </div>
            <div className="h-6 w-px bg-line" />
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-surface-alt">{t('page.saveDraft')}</button>
            <button type="button" className="px-3 py-1.5 text-sm btn-floating rounded-lg">{t('s1.genEstimate')}</button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* CHAT — protagonist */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* input docs (light) */}
          <div className="px-5 lg:px-8 pt-4 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-ink-400">{t('upload.title')}:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface border border-line rounded-lg">📄 仕様書_SH1_v2.pdf <span className="text-ink-300">2.4MB</span></span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface border border-line rounded-lg">📊 議事録_1109.docx <span className="text-ink-300">86KB</span></span>
            <button type="button" className="px-2 py-1 border border-dashed border-line rounded-lg text-ink-400 hover:bg-surface">+ {t('upload.addFile')}</button>
          </div>

          {/* thread */}
          <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-5 space-y-5">
            <AiBubble time="10:14" who={t('chat.moduleA')}>
              <span dangerouslySetInnerHTML={{ __html: t('chat.greeting') }} />
            </AiBubble>

            {/* extract proposal — the anchor */}
            <div className="flex gap-3">
              <Avatar />
              <div className="max-w-2xl w-full">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-medium text-ai-600">{t('chat.extractProposal')}</span>
                  <span className="text-xs text-ink-300">10:14</span>
                  <span className="ml-auto text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">confidence 0.92</span>
                </div>
                <div className="bg-surface border border-ai-500/40 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 bg-ai-50/40 flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink-700">📋 {t('group.basic')}</span>
                    <span className="text-xs text-ink-400 ml-auto">{t('chat.extractedFrom')}</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-x-5 gap-y-2.5 text-sm">
                    <Kv k={t('field.customer')} v="AAA重機株式会社" />
                    <Kv k={t('field.endUser')} v="XYZ製鋼 千葉工場" />
                    <Kv k={t('field.deadline')} v="2026/09/15" />
                    <Kv k={t('s1.variants')} v={`3 ${t('unit.variant')}`} />
                    <div className="col-span-2"><Kv k={t('field.opSummary')} v={t('case.opSummary')} /></div>
                  </div>
                  <div className="px-4 py-3 border-t border-line flex items-center gap-2">
                    <button type="button" className="px-3 py-1.5 text-sm btn-floating rounded-lg flex items-center gap-1">✓ {t('action.acceptAll')}</button>
                    <button type="button" className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-surface-alt">{t('action.reviewEach')}</button>
                    <button type="button" className="px-2.5 py-1.5 text-sm text-ink-400 hover:text-red-600">{t('action.reject')}</button>
                  </div>
                </div>
              </div>
            </div>

            <AiBubble time="10:15" who={t('chat.followUp')}>
              <span dangerouslySetInnerHTML={{ __html: t('chat.aiQuestion') }} />
            </AiBubble>

            {/* user */}
            <div className="flex gap-3 justify-end">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <span className="text-xs text-ink-300">10:17</span>
                  <span className="text-xs font-medium text-brand-600">{t('chat.userName')}</span>
                </div>
                <div className="bg-brand-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm" dangerouslySetInnerHTML={{ __html: t('chat.userReply') }} />
              </div>
              <div className="w-8 h-8 bg-brand-600 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold">金</div>
            </div>

            <div className="flex gap-3">
              <Avatar />
              <div className="bg-surface border border-line rounded-2xl rounded-tl-sm px-3.5 py-3 w-64 space-y-2">
                <div className="h-2 rounded shimmer" /><div className="h-2 rounded shimmer w-4/5" />
              </div>
            </div>
          </div>

          {/* composer */}
          <div className="bg-surface border-t border-line px-5 lg:px-8 py-3">
            <div>
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto">
                {['composer.q1', 'composer.q2', 'composer.q3', 'composer.q4'].map((k) => (
                  <button key={k} type="button" className="shrink-0 px-2.5 py-1 text-xs bg-surface-alt rounded-full hover:bg-surface-muted">{t(k)}</button>
                ))}
              </div>
              <div className="flex items-end gap-2 bg-surface-alt border border-line focus-within:border-brand-500 focus-within:bg-surface rounded-xl p-2">
                <textarea rows={1} placeholder={t('composer.placeholder')} className="flex-1 bg-transparent text-sm focus:outline-none resize-none py-1.5 px-1" />
                <button type="button" className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">{t('action.send')}</button>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-ink-400">
                <span>{t('composer.privacy')}</span>
                <span>{t('composer.scope')}: <button type="button" className="text-brand-600">{t('composer.scopeValue')}</button></span>
              </div>
            </div>
          </div>
        </section>

        {/* collapsible panel */}
        {panelOpen ? (
          <aside className="hidden xl:flex flex-col w-[360px] shrink-0 border-l border-line bg-surface">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between">
              <div className="font-semibold text-sm">{t('panel.title')}</div>
              <button type="button" onClick={() => setPanelOpen(false)} className="text-ink-400 hover:text-ink-700 text-sm" title="Collapse">⟩</button>
            </div>
            <div className="px-4 py-3 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden"><div className="ai-grad h-full" style={{ width: '62%' }} /></div>
                <span className="text-xs font-medium text-ai-600">62%</span>
              </div>
              <div className="text-[11px] text-ink-400 mt-1">13 / 21 {t('panel.fieldsFilled')}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              <Group icon="📋" title={t('group.basic')} status={<span className="text-green-600 text-xs">{t('status.complete')} 5/5</span>}>
                <Row k={t('field.customer')} v="AAA重機株式会社" t={check} />
                <Row k={t('field.endUser')} v="XYZ製鋼 千葉工場" t={check} />
                <Row k={t('field.deadline')} v="2026/09/15" t={check} />
                <Row k={t('field.scope')} v={t('case.scopeValue')} t={check} />
              </Group>
              <Group icon="🔌" title={t('group.control')} highlight status={<span className="text-xs px-1.5 py-0.5 bg-ai-100 text-ai-700 rounded">{t('status.aiChecking')}</span>}>
                <Row k={t('field.servo')} v={<span className="text-ai-700">MR-J5 ×6{t('unit.axis')}</span>} t={<span className="text-[11px] text-ai-600">{t('status.processing')}</span>} />
                <Row k="PLC" v={<span className="text-ai-700">Q03UDE</span>} t={<span className="text-[11px] text-ai-600">{t('status.processing')}</span>} />
                <Row k={t('field.network')} v={<span className="text-ai-700">CC-LINK IE Field</span>} t={<span className="text-[11px] text-ai-600">{t('status.processing')}</span>} />
              </Group>
              <Group icon="🛡️" title={t('group.safety')} status={<span className="text-amber-600 text-xs">{t('status.partial')} 1/2</span>}>
                <Row k={t('field.standard')} v="ISO 10218-1, TS 15066" t={check} />
              </Group>

              {/* inheritance — differentiator, calm */}
              <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 mb-1">⭐ {t('inherit.title')}</div>
                <div className="text-[11px] text-ink-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('inherit.body') }} />
                <button type="button" className="mt-2 px-2.5 py-1 text-xs bg-surface border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50">{t('inherit.apply')}</button>
              </div>
            </div>
            <div className="border-t border-line p-3">
              <button type="button" disabled className="w-full px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">{t('action.next')}</button>
              <div className="text-[11px] text-ink-300 text-center mt-1.5">{t('panel.remaining')} 8 {t('unit.items')} {t('panel.toComplete')}</div>
            </div>
          </aside>
        ) : (
          <button type="button" onClick={() => setPanelOpen(true)} className="hidden xl:flex flex-col items-center gap-2 border-l border-line bg-surface px-2 py-4 text-ink-400 hover:text-brand-600 hover:bg-surface-alt">
            <span className="text-sm">⟨</span>
            <span className="text-[11px] [writing-mode:vertical-rl]">{t('s1.panel')} · 62%</span>
          </button>
        )}
      </div>
    </div>
  )
}

function Avatar() {
  return <div className="w-8 h-8 ai-grad rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold">AI</div>
}
function AiBubble({ time, who, children }: { time: string; who: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-ai-600">{who}</span>
          <span className="text-xs text-ink-300">{time}</span>
        </div>
        <div className="bg-surface border border-line rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
function Kv({ k, v }: { k: string; v: string }) {
  return <div><div className="text-[11px] text-ink-400">{k}</div><div className="font-medium text-ink-800">{v}</div></div>
}
function Group({ icon, title, status, highlight, children }: { icon: string; title: string; status: ReactNode; highlight?: boolean; children: ReactNode }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? 'border-ai-100 bg-ai-50/30' : 'border-line'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{icon} {title}</span>
        <span className="ml-auto">{status}</span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}
function Row({ k, v, t }: { k: string; v: ReactNode; t?: ReactNode }) {
  return (
    <div className="flex gap-2 text-sm items-baseline">
      <div className="w-20 text-[11px] text-ink-400 shrink-0">{k}</div>
      <div className="flex-1 text-ink-800">{v}</div>
      {t}
    </div>
  )
}
