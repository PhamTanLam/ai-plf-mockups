import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES, caseDetailPath, DEMO_CASE_ID } from '@/routes'

type View = 'split' | 'flow' | 'ladder'

const SECTIONS = [
  { label: '初期化', badge: '8 rungs', done: true },
  { label: '共通', badge: '12', done: true },
  { label: '異常', badge: '15', done: true },
  { label: '手動', badge: '22', done: true },
]

export default function ProgramGeneration() {
  const { t } = useI18n()
  const [view, setView] = useState<View>('split')
  const [node, setNode] = useState('step4')

  const showFlow = view === 'split' || view === 'flow'
  const showLadder = view === 'split' || view === 'ladder'
  const nodeCls = (id: string, base = 'flow-node') => `${base} ${node === id ? 'selected' : ''}`

  const viewBtn = (v: View) =>
    `px-3 py-1 text-xs border-l border-line ${view === v ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-surface-alt'}`

  return (
    <div className="flex flex-col min-w-0 h-full overflow-hidden">
      {/* header */}
      <div className="bg-white border-b border-line px-4 lg:px-6 py-3">
        <div className="flex items-center text-xs text-ink-500 mb-2">
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">{t('nav.dashboard')}</Link>
          <span className="mx-1">/</span>
          <Link to={ROUTES.cases} className="hover:text-brand-600">{t('nav.caseList')}</Link>
          <span className="mx-1">/</span>
          <Link to={caseDetailPath(DEMO_CASE_ID)} className="hover:text-brand-600">CASE-2026-0312</Link>
          <span className="mx-1">/</span>
          <span className="text-ink-900">{t('page.gen')}</span>
        </div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <span className="ai-grad-text">⑥</span> <span>{t('page.genTitle')}</span>
              <span className="text-xs font-normal text-amber-700 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded">{t('page.addonBadge')}</span>
            </h1>
            <div className="text-sm text-ink-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{t('page.genSubtitle')}</span>
              <span className="text-ink-300">|</span>
              <span className="text-xs flex items-center gap-1">📐 <Link to={ROUTES.ai.drawing} className="text-brand-600 hover:underline">電気図面参照</Link></span>
              <span className="text-ink-300">|</span>
              <span className="text-xs flex items-center gap-1">⭐ <Link to={ROUTES.reference} className="text-brand-600 hover:underline">基準データ 8件参照</Link></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded hover:bg-surface-muted">{t('action.history')}</button>
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded hover:bg-surface-muted">{t('action.exportProg')}</button>
            <Link to={ROUTES.ai.programCheck} className="px-3 py-1.5 text-sm btn-floating rounded flex items-center gap-1.5">{t('action.applyToCheck')}</Link>
          </div>
        </div>
      </div>

      {/* section progress */}
      <div className="bg-white border-b border-line px-4 lg:px-6 py-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-ink-500 shrink-0 mr-2">{t('section.title')}</span>
          {SECTIONS.map((s) => (
            <button key={s.label} type="button" className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-line bg-green-50 text-green-700 text-xs">
              <span className="text-green-600">✓</span> {s.label}
              <span className="text-[10px] text-green-600">{s.badge}</span>
            </button>
          ))}
          <button type="button" className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 border-brand-500 bg-brand-50 text-brand-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-pulse" /> 自動運転
            <span className="text-[10px] text-brand-600">作業中</span>
          </button>
          <button type="button" className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-line text-ink-500 text-xs"><span className="w-1.5 h-1.5 bg-ink-300 rounded-full" /> サーボ</button>
          <button type="button" className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-line text-ink-500 text-xs"><span className="w-1.5 h-1.5 bg-ink-300 rounded-full" /> 出力</button>
          <div className="ml-auto shrink-0 flex items-center gap-2 text-xs">
            <span className="text-ink-500"><span>{t('section.progress')}</span>:</span>
            <div className="w-32 h-1.5 bg-surface-muted rounded-full overflow-hidden"><div className="ai-grad h-full" style={{ width: '57%' }} /></div>
            <span className="text-ink-700 font-medium">4/7</span>
          </div>
        </div>
      </div>

      {/* 2-col area */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT: chat */}
        <section className="flex flex-col w-[400px] shrink-0 border-r border-line bg-white">
          <div className="px-4 py-2.5 border-b border-line flex items-center gap-2">
            <div className="w-6 h-6 ai-grad rounded flex items-center justify-center text-white text-[10px] font-bold">AI</div>
            <div className="font-semibold text-sm">{t('chat.moduleGen')}</div>
            <span className="ml-auto text-xs px-1.5 py-0.5 bg-brand-50 text-brand-700 rounded font-medium">{t('chat.currentSection')}</span>
          </div>
          <div className="px-3 py-2 border-b border-line bg-surface-alt/60">
            <div className="text-[10px] uppercase font-semibold text-ink-300 mb-1.5">{t('chat.qaTitle')}</div>
            <div className="flex flex-wrap gap-1.5">
              {['chat.qa1', 'chat.qa2', 'chat.qa3', 'chat.qa4', 'chat.qa5'].map((k) => (
                <button key={k} type="button" className="px-2 py-1 text-xs bg-white border border-line rounded hover:border-brand-300">{t(k)}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            <ChatAI time="15:02"><span dangerouslySetInnerHTML={{ __html: t('gen.greeting') }} /></ChatAI>
            <ChatUser time="15:03">{t('gen.userReq1')}</ChatUser>
            <ChatAI time="15:03" badge="flow chart">
              <div>{t('gen.flowGenerated')}</div>
              <ul className="mt-2 space-y-0.5 text-xs">
                <li>① <span>{t('gen.step1')}</span> <span className="font-mono text-ink-300">→ M71</span></li>
                <li>② <span>{t('gen.step2')}</span> <span className="font-mono text-ink-300">→ M72</span></li>
                <li>③ <span>{t('gen.step3')}</span> <span className="font-mono text-ink-300">→ M73</span></li>
                <li>④ <span>{t('gen.step4')}</span> <span className="font-mono text-ink-300">→ M74 ⇒ 分岐</span></li>
                <li>⑤a <span>{t('gen.step5a')}</span> <span className="font-mono text-ink-300">→ M75</span></li>
                <li>⑤b <span>{t('gen.step5b')}</span> <span className="font-mono text-ink-300">→ M76</span></li>
                <li>⑥ <span>{t('gen.step6')}</span> <span className="font-mono text-ink-300">→ M77</span></li>
              </ul>
              <div className="text-xs text-ink-500 mt-2">{t('gen.reviewHint')}</div>
            </ChatAI>
            <ChatUser time="15:05">{t('gen.userReq2')}</ChatUser>
            <ChatAI time="15:05"><span dangerouslySetInnerHTML={{ __html: t('gen.insertOk') }} /></ChatAI>
            <ChatAI time="15:07" badge="ladder" badgeCls="bg-purple-100 text-purple-700">
              <div>{t('gen.ladderDone')}</div>
              <ul className="mt-2 space-y-0.5 text-xs">
                <li>✓ <span>{t('gen.l1')}</span></li>
                <li>✓ <span>{t('gen.l2')}</span></li>
                <li>✓ <span>{t('gen.l3')}</span> <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px]">⭐</span></li>
                <li>✓ <span>{t('gen.l4')}</span></li>
              </ul>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" className="px-2 py-0.5 text-xs bg-brand-600 text-white rounded">{t('gen.copyLadder')}</button>
                <span className="text-xs text-ink-500">{t('gen.pasteHint')}</span>
              </div>
            </ChatAI>
          </div>
          <div className="border-t border-line p-2.5 bg-white">
            <div className="flex items-end gap-1.5 bg-surface-alt border border-line focus-within:border-brand-500 focus-within:bg-white rounded-lg p-1.5">
              <textarea rows={1} placeholder={t('composer.placeholderGen')} className="flex-1 bg-transparent text-sm focus:outline-none resize-none py-1 px-1" />
              <button type="button" className="px-2 py-1 bg-brand-600 text-white rounded text-xs hover:bg-brand-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
            <div className="text-[10px] text-ink-300 mt-1 px-1">{t('composer.genTip')}</div>
          </div>
        </section>

        {/* RIGHT: split flow + ladder */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="bg-white border-b border-line px-3 py-1.5 flex items-center gap-2 flex-wrap">
            <div className="flex items-center border border-line rounded">
              <button type="button" onClick={() => setView('split')} className={`px-3 py-1 text-xs ${view === 'split' ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-surface-alt'}`}>{t('view.split')}</button>
              <button type="button" onClick={() => setView('flow')} className={viewBtn('flow')}>{t('view.flowOnly')}</button>
              <button type="button" onClick={() => setView('ladder')} className={viewBtn('ladder')}>{t('view.ladderOnly')}</button>
            </div>
            <span className="text-xs text-ink-500 ml-2 hidden md:inline">{t('view.syncHint')}</span>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <span className="text-ink-500">{t('view.style')}</span>
              <select className="text-xs border border-line rounded px-2 py-1 bg-white">
                <option>{t('view.styleSH')}</option>
                <option>{t('view.styleStep')}</option>
              </select>
              <button type="button" className="px-2 py-1 text-xs border border-line rounded hover:bg-surface-muted ai-grad-text font-medium">{t('view.regen')}</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {/* flow */}
            {showFlow && (
              <div className="flex-1 flex flex-col min-h-0 border-b border-line">
                <div className="px-3 py-1.5 bg-surface-alt border-b border-line flex items-center gap-2 text-xs">
                  <span className="font-semibold text-ink-700 whitespace-nowrap">📊&nbsp;<span>{t('flow.title')}</span></span>
                  <span className="text-ink-300">|</span>
                  <span className="text-ink-500"><span>{t('flow.nodes')}</span>: 7 ・ <span>{t('flow.branches')}</span>: 1</span>
                </div>
                <div className="flex-1 flow-canvas overflow-auto">
                  <svg viewBox="0 0 720 460" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ minHeight: 460 }}>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#5F6B7A" /></marker>
                      <marker id="arrow-yes" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#2E7D32" /></marker>
                      <marker id="arrow-no" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#C62828" /></marker>
                    </defs>
                    <g className={nodeCls('start')} onClick={() => setNode('start')}>
                      <rect x="290" y="10" width="140" height="32" rx="16" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="1.5" />
                      <text x="360" y="30" textAnchor="middle" className="flow-text" fontWeight="600" fill="#1B5E20">▶ 自動運転 開始</text>
                    </g>
                    <line x1="360" y1="42" x2="360" y2="60" className="flow-arrow" markerEnd="url(#arrow)" />
                    <g className={nodeCls('step1')} onClick={() => setNode('step1')}>
                      <rect x="280" y="60" width="160" height="40" rx="3" fill="white" stroke="#5F6B7A" strokeWidth="1.5" />
                      <text x="360" y="78" textAnchor="middle" className="flow-text" fontWeight="600">① ワーク把持</text>
                      <text x="360" y="92" textAnchor="middle" className="flow-addr">M71 ・ Y40 → 把持シリンダ</text>
                    </g>
                    <line x1="360" y1="100" x2="360" y2="115" className="flow-arrow" markerEnd="url(#arrow)" />
                    <g className={nodeCls('step2')} onClick={() => setNode('step2')}>
                      <rect x="280" y="115" width="160" height="40" rx="3" fill="white" stroke="#5F6B7A" strokeWidth="1.5" />
                      <text x="360" y="133" textAnchor="middle" className="flow-text" fontWeight="600">② 検査位置へ移動</text>
                      <text x="360" y="147" textAnchor="middle" className="flow-addr">M72 ・ MR-J5 軸1+2+3</text>
                    </g>
                    <line x1="360" y1="155" x2="360" y2="170" className="flow-arrow" markerEnd="url(#arrow)" />
                    <g className={nodeCls('step3')} onClick={() => setNode('step3')}>
                      <rect x="280" y="170" width="160" height="40" rx="3" fill="white" stroke="#5F6B7A" strokeWidth="1.5" />
                      <text x="360" y="188" textAnchor="middle" className="flow-text" fontWeight="600">③ 3D 寸法測定</text>
                      <text x="360" y="202" textAnchor="middle" className="flow-addr">M73 ・ Y50 (Trigger)</text>
                    </g>
                    <line x1="360" y1="210" x2="360" y2="225" className="flow-arrow" markerEnd="url(#arrow)" />
                    <g className="flow-node ai-suggesting" onClick={() => setNode('step35')}>
                      <rect x="280" y="225" width="160" height="40" rx="3" fill="#E6F7F7" stroke="#099E9A" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="360" y="243" textAnchor="middle" className="flow-text" fontWeight="600" fill="#099E9A">✨ 安全確認</text>
                      <text x="360" y="257" textAnchor="middle" className="flow-addr" fill="#099E9A">X20 OFF + KA1 ON</text>
                      <circle cx="450" cy="245" r="9" fill="#0ABAB5" />
                      <text x="450" y="248" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">NEW</text>
                    </g>
                    <line x1="360" y1="265" x2="360" y2="280" className="flow-arrow" markerEnd="url(#arrow)" />
                    <g className={nodeCls('step4')} onClick={() => setNode('step4')}>
                      <polygon points="360,280 470,330 360,380 250,330" fill="#E6F7F7" stroke="#099E9A" strokeWidth="2.5" />
                      <text x="360" y="324" textAnchor="middle" className="flow-text" fontWeight="600">④ AI 判定</text>
                      <text x="360" y="338" textAnchor="middle" className="flow-addr">M74 ・ OK/NG?</text>
                    </g>
                    <path d="M 470 330 L 530 330 L 530 410" className="flow-arrow flow-arrow-yes" markerEnd="url(#arrow-yes)" />
                    <text x="490" y="324" className="flow-text-sm" fontWeight="600" fill="#2E7D32">OK</text>
                    <path d="M 250 330 L 190 330 L 190 410" className="flow-arrow flow-arrow-no" markerEnd="url(#arrow-no)" />
                    <text x="200" y="324" className="flow-text-sm" fontWeight="600" fill="#C62828">NG</text>
                    <g className={nodeCls('step5a')} onClick={() => setNode('step5a')}>
                      <rect x="455" y="410" width="150" height="40" rx="3" fill="white" stroke="#5F6B7A" strokeWidth="1.5" />
                      <text x="530" y="428" textAnchor="middle" className="flow-text" fontWeight="600">⑤a ワーク排出 OK</text>
                      <text x="530" y="442" textAnchor="middle" className="flow-addr">M75 ・ Y60</text>
                    </g>
                    <g className={nodeCls('step5b')} onClick={() => setNode('step5b')}>
                      <rect x="115" y="410" width="150" height="40" rx="3" fill="white" stroke="#5F6B7A" strokeWidth="1.5" />
                      <text x="190" y="428" textAnchor="middle" className="flow-text" fontWeight="600">⑤b NG リトライ</text>
                      <text x="190" y="442" textAnchor="middle" className="flow-addr">M76 ・ Y61 (mark)</text>
                    </g>
                    <g>
                      <rect x="280" y="430" width="160" height="22" rx="11" fill="white" stroke="#9AA4B2" strokeDasharray="3 2" />
                      <text x="360" y="445" textAnchor="middle" className="flow-text-sm">+ ステップ追加 (完了 / 待機)</text>
                    </g>
                  </svg>
                </div>
              </div>
            )}

            {/* ladder */}
            {showLadder && (
              <div className={`flex flex-col ${view === 'ladder' ? 'flex-1' : 'h-[40%] min-h-[260px]'}`}>
                <div className="px-3 py-1.5 bg-surface-alt border-b border-line flex items-center gap-2 text-xs flex-wrap">
                  <span className="font-semibold text-ink-700 whitespace-nowrap">💻&nbsp;<span>{t('ladder.title')}</span></span>
                  <span className="text-ink-300">|</span>
                  <span className="text-ink-500">7 rungs ・ <span>{t('ladder.style')}</span></span>
                  <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-medium">{t('ladder.synced')}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button type="button" className="px-2 py-0.5 text-xs border border-line rounded hover:bg-surface-muted">{t('ladder.copy')}</button>
                    <button type="button" className="px-2 py-0.5 text-xs border border-line rounded hover:bg-surface-muted">{t('ladder.viewFull')}</button>
                    <Link to={ROUTES.ai.programCheck} className="px-2 py-0.5 text-xs ai-grad text-white rounded">{t('ladder.toCheck')}</Link>
                  </div>
                </div>
                <div className="flex-1 overflow-auto ladder-bg">
                  <svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ minHeight: 380 }}>
                    <line x1="60" y1="20" x2="60" y2="370" className="rail" />
                    <line x1="660" y1="20" x2="660" y2="370" className="rail" />
                    <rect x="60" y="10" width="600" height="18" fill="#EDF1F5" />
                    <text x="70" y="22" fontFamily="Inter" fontSize="10" fontWeight="600" fill="#5F6B7A">■ 自動運転 (Auto Operation) — AI 生成 ✨</text>
                    {/* Rung 1 */}
                    <text x="50" y="58" textAnchor="end" className="ladder-ln">78</text>
                    <line x1="60" y1="55" x2="100" y2="55" className="wire" />
                    <line x1="100" y1="47" x2="100" y2="63" className="wire" /><line x1="115" y1="47" x2="115" y2="63" className="wire" />
                    <text x="107" y="42" textAnchor="middle" className="ladder-addr">PB2</text>
                    <line x1="115" y1="55" x2="180" y2="55" className="wire" />
                    <line x1="180" y1="47" x2="180" y2="63" className="wire" /><line x1="195" y1="47" x2="195" y2="63" className="wire" />
                    <text x="187" y="42" textAnchor="middle" className="ladder-addr">M61</text>
                    <line x1="195" y1="55" x2="280" y2="55" className="wire" />
                    <line x1="280" y1="47" x2="280" y2="63" className="wire" /><line x1="295" y1="47" x2="295" y2="63" className="wire" /><line x1="280" y1="45" x2="295" y2="65" className="wire" />
                    <text x="287" y="42" textAnchor="middle" className="ladder-addr">M72</text>
                    <line x1="295" y1="55" x2="555" y2="55" className="wire" />
                    <path d="M555,47 Q547,55 555,63" className="wire" /><path d="M575,47 Q583,55 575,63" className="wire" />
                    <text x="565" y="42" textAnchor="middle" className="ladder-addr">M71</text>
                    <line x1="575" y1="55" x2="660" y2="55" className="wire" />
                    <line x1="155" y1="55" x2="155" y2="80" className="wire" /><line x1="155" y1="80" x2="295" y2="80" className="wire" /><line x1="295" y1="80" x2="295" y2="55" className="wire" />
                    <line x1="220" y1="72" x2="220" y2="88" className="wire" /><line x1="235" y1="72" x2="235" y2="88" className="wire" />
                    <text x="227" y="98" textAnchor="middle" className="ladder-addr">M71</text>
                    <text x="555" y="113" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#5F6B7A">ステップ① ワーク把持 起動</text>
                    {/* Rung 2 */}
                    <text x="50" y="138" textAnchor="end" className="ladder-ln">79</text>
                    <line x1="60" y1="135" x2="100" y2="135" className="wire" />
                    <line x1="100" y1="127" x2="100" y2="143" className="wire" /><line x1="115" y1="127" x2="115" y2="143" className="wire" />
                    <text x="107" y="122" textAnchor="middle" className="ladder-addr">M71</text>
                    <line x1="115" y1="135" x2="220" y2="135" className="wire" />
                    <line x1="220" y1="127" x2="220" y2="143" className="wire" /><line x1="235" y1="127" x2="235" y2="143" className="wire" />
                    <text x="227" y="122" textAnchor="middle" className="ladder-addr">X40</text>
                    <line x1="235" y1="135" x2="555" y2="135" className="wire" />
                    <path d="M555,127 Q547,135 555,143" className="wire" /><path d="M575,127 Q583,135 575,143" className="wire" />
                    <text x="565" y="122" textAnchor="middle" className="ladder-addr">M72</text>
                    <line x1="575" y1="135" x2="660" y2="135" className="wire" />
                    <text x="555" y="158" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#5F6B7A">把持完了 (X40) → ステップ② 起動</text>
                    {/* Rung 3 */}
                    <text x="50" y="198" textAnchor="end" className="ladder-ln">80</text>
                    <line x1="60" y1="195" x2="100" y2="195" className="wire" />
                    <line x1="100" y1="187" x2="100" y2="203" className="wire" /><line x1="115" y1="187" x2="115" y2="203" className="wire" />
                    <text x="107" y="182" textAnchor="middle" className="ladder-addr">M72</text>
                    <line x1="115" y1="195" x2="220" y2="195" className="wire" />
                    <line x1="220" y1="187" x2="220" y2="203" className="wire" /><line x1="235" y1="187" x2="235" y2="203" className="wire" />
                    <text x="227" y="182" textAnchor="middle" className="ladder-addr">X41</text>
                    <line x1="235" y1="195" x2="555" y2="195" className="wire" />
                    <path d="M555,187 Q547,195 555,203" className="wire" /><path d="M575,187 Q583,195 575,203" className="wire" />
                    <text x="565" y="182" textAnchor="middle" className="ladder-addr">M73</text>
                    <line x1="575" y1="195" x2="660" y2="195" className="wire" />
                    <text x="555" y="218" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#5F6B7A">位置決め完了 (X41) → ステップ③ 3D 測定</text>
                    {/* Rung 3.5 NEW */}
                    <rect x="60" y="225" width="600" height="50" fill="#E6F7F7" stroke="#0ABAB5" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="50" y="258" textAnchor="end" className="ladder-ln" fill="#099E9A" fontWeight="600">81</text>
                    <line x1="60" y1="255" x2="100" y2="255" className="wire" />
                    <line x1="100" y1="247" x2="100" y2="263" className="wire" /><line x1="115" y1="247" x2="115" y2="263" className="wire" />
                    <text x="107" y="242" textAnchor="middle" className="ladder-addr">M73</text>
                    <line x1="115" y1="255" x2="220" y2="255" className="wire" />
                    <line x1="220" y1="247" x2="220" y2="263" className="wire" /><line x1="235" y1="247" x2="235" y2="263" className="wire" /><line x1="220" y1="245" x2="235" y2="265" className="wire" />
                    <text x="227" y="242" textAnchor="middle" className="ladder-addr">X20</text>
                    <line x1="235" y1="255" x2="340" y2="255" className="wire" />
                    <line x1="340" y1="247" x2="340" y2="263" className="wire" /><line x1="355" y1="247" x2="355" y2="263" className="wire" />
                    <text x="347" y="242" textAnchor="middle" className="ladder-addr">KA1</text>
                    <line x1="355" y1="255" x2="555" y2="255" className="wire" />
                    <path d="M555,247 Q547,255 555,263" className="wire" /><path d="M575,247 Q583,255 575,263" className="wire" />
                    <text x="565" y="242" textAnchor="middle" className="ladder-addr" fill="#099E9A" fontWeight="700">M735</text>
                    <line x1="575" y1="255" x2="660" y2="255" className="wire" />
                    <circle cx="640" cy="240" r="8" fill="#0ABAB5" /><text x="640" y="243" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">✨</text>
                    <text x="555" y="278" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#099E9A" fontWeight="600">✨ 安全確認 (X20 OFF + KA1 ON) — AI 追加</text>
                    {/* Rung 4 */}
                    <text x="50" y="308" textAnchor="end" className="ladder-ln">82</text>
                    <line x1="60" y1="305" x2="100" y2="305" className="wire" />
                    <line x1="100" y1="297" x2="100" y2="313" className="wire" /><line x1="115" y1="297" x2="115" y2="313" className="wire" />
                    <text x="107" y="292" textAnchor="middle" className="ladder-addr">M735</text>
                    <line x1="115" y1="305" x2="220" y2="305" className="wire" />
                    <line x1="220" y1="297" x2="220" y2="313" className="wire" /><line x1="235" y1="297" x2="235" y2="313" className="wire" />
                    <text x="227" y="292" textAnchor="middle" className="ladder-addr">X42</text>
                    <line x1="235" y1="305" x2="555" y2="305" className="wire" />
                    <path d="M555,297 Q547,305 555,313" className="wire" /><path d="M575,297 Q583,305 575,313" className="wire" />
                    <text x="565" y="292" textAnchor="middle" className="ladder-addr">M74</text>
                    <line x1="575" y1="305" x2="660" y2="305" className="wire" />
                    <text x="555" y="328" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#5F6B7A">測定完了 (X42) → ステップ④ AI 判定 (分岐へ)</text>
                    <text x="360" y="365" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#9AA4B2">— continued at rung 83 (M75 OK / M76 NG branches) —</text>
                  </svg>
                </div>
                <div className="border-t border-line bg-surface-alt px-3 py-1.5 flex items-center gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-1"><span className="text-ink-700"><strong>7</strong></span> <span className="text-ink-500">{t('gen.ladderRungs')}</span></div>
                  <div className="flex items-center gap-1"><span className="text-ink-700"><strong>22</strong></span> <span className="text-ink-500">{t('ladder.ioUsed')}</span></div>
                  <div className="flex items-center gap-1"><span className="text-purple-600">⭐</span> <span className="text-ink-500">{t('ladder.refUsed')}</span></div>
                  <div className="ml-auto text-ink-500">{t('ladder.aiInfo')}</div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function ChatAI({ time, badge, badgeCls, children }: { time: string; badge?: string; badgeCls?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 ai-grad rounded flex items-center justify-center text-white text-[10px] font-bold">AI</div>
        <span className="text-xs text-ink-300">{time}</span>
        {badge && <span className={`text-xs px-1.5 py-0.5 rounded ${badgeCls ?? 'bg-ai-50 text-ai-700'}`}>{badge}</span>}
      </div>
      <div className="relative bg-[#F5F8FF] border border-brand-100 rounded-lg p-2.5 text-sm bubble-ai ml-8">{children}</div>
    </div>
  )
}

function ChatUser({ time, children }: { time: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 justify-end">
        <span className="text-xs text-ink-300">{time}</span>
        <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center text-white text-[10px] font-bold">金</div>
      </div>
      <div className="relative bg-brand-600 text-white rounded-lg p-2.5 text-sm bubble-user mr-8">{children}</div>
    </div>
  )
}
