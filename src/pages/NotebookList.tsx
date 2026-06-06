import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, FileText, Search, Globe2, X } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'
import type { Locale } from '@/i18n/types'

interface CaseItem {
  id: string
  title: string
  code: string
  status: string
  pillClass: string
  progress: number
  sourcesCount: number
  updatedAt: string
  owner: string
  ownerInitials: string
}

// 4 case demo cố định (luôn hiển thị). Dự án người dùng tạo được lưu riêng ở localStorage.
const DEMO_CASES: CaseItem[] = [
  { id: 'CASE-2026-0245', title: 'WW2 溶接セル (WW2 Welding Cell)', code: 'CASE-2026-0245', status: 'status.debug', pillClass: 'pill-debug', progress: 88, sourcesCount: 5, updatedAt: '10 min ago', owner: 'LINH', ownerInitials: 'L' },
  { id: 'CASE-2026-0312', title: 'SH1 小型旋回フレーム (SH1 Small Swing Frame)', code: 'CASE-2026-0312', status: 'status.design', pillClass: 'pill-design', progress: 38, sourcesCount: 6, updatedAt: '2 hours ago', owner: 'KANADA', ownerInitials: '金' },
  { id: 'CASE-2026-0345', title: 'RR4 検査セル 改造 (RR4 Inspection Cell Remodel)', code: 'CASE-2026-0345', status: 'status.pre', pillClass: 'pill-pre', progress: 70, sourcesCount: 4, updatedAt: 'Yesterday', owner: 'ARIMURA', ownerInitials: '有' },
  { id: 'CASE-2026-0288', title: 'PP4 パレタイザ (PP4 Palletizer)', code: 'CASE-2026-0288', status: 'status.onsite', pillClass: 'pill-onsite', progress: 50, sourcesCount: 3, updatedAt: '3 days ago', owner: 'NISHI', ownerInitials: '西' },
]

const USER_CASES_KEY = 'aiplf.userCases'
function loadUserCases(): CaseItem[] {
  try { const raw = localStorage.getItem(USER_CASES_KEY); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) return a as CaseItem[] } } catch { /* ignore */ }
  return []
}
function saveUserCases(list: CaseItem[]) {
  try { localStorage.setItem(USER_CASES_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

export default function NotebookList() {
  const { t, locale, setLocale } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCode, setNewCode] = useState('CASE-2026-')

  // Dự án người dùng tạo (lưu localStorage) + 4 case demo cố định
  const [cases, setCases] = useState<CaseItem[]>(() => [...loadUserCases(), ...DEMO_CASES])

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newCase: CaseItem = {
      id: newCode.trim() || `CASE-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      code: newCode.trim() || `CASE-${Date.now().toString().slice(-4)}`,
      status: 'status.preSales',
      pillClass: 'pill-pre',
      progress: 0,
      sourcesCount: 0, // Dự án mới chưa có nguồn nào
      updatedAt: 'Just now',
      owner: 'User',
      ownerInitials: 'U',
    }

    saveUserCases([newCase, ...loadUserCases()])   // lưu lại để không mất khi reload
    setCases([newCase, ...cases])
    setNewTitle('')
    setNewCode('CASE-2026-')
    setShowNewModal(false)
  }

  const handleLangToggle = () => {
    const langs: Locale[] = ['ja', 'en', 'vi']
    const nextIdx = (langs.indexOf(locale) + 1) % langs.length
    setLocale(langs[nextIdx])
  }

  // Số nguồn thực: ưu tiên đọc từ localStorage (đồng bộ với workspace), fallback số mặc định của card
  const sourceCount = (c: CaseItem) => {
    try { const raw = localStorage.getItem('aiplf.sources.' + c.id); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) return a.length } } catch { /* ignore */ }
    return c.sourcesCount
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-mesh flex flex-col text-slate-850 page-enter-fade">
      {/* Premium Header */}
      <header className="shrink-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <BookOpen className="w-5.5 h-5.5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
              PLC Design AI Platform V2
              <span className="text-[10px] font-semibold text-brand-700 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
                IDE Edition
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-mono"> Grounded industrial PLC engineering & design </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative hidden md:block w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={locale === 'ja' ? 'プロジェクトを検索...' : locale === 'vi' ? 'Tìm kiếm dự án...' : 'Search notebooks...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl outline-none text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Language Toggle Button */}
          <button
            onClick={handleLangToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-brand-500/5 rounded-xl border border-slate-250 transition cursor-pointer"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{locale === 'ja' ? '日本語' : locale === 'vi' ? 'Tiếng Việt' : 'English'}</span>
          </button>

          {/* User profile */}
          <div className="w-9 h-9 rounded-full bg-slate-100 text-brand-700 font-mono font-bold text-sm flex items-center justify-center border border-slate-200">
            A
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 pt-8 flex flex-col gap-6 overflow-hidden">
        {/* Banner with Greeting */}
        <section className="shrink-0 glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-700 via-brand-500 to-indigo-600 bg-clip-text text-transparent">
              {locale === 'ja' ? 'ようこそ、PLCエンジニアリングAIへ' : locale === 'vi' ? 'Hệ thống Thiết kế & Kiểm định PLC (AI Platform)' : 'Welcome to PLC Engineering AI'}
            </h2>
            <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
              {locale === 'ja'
                ? '仕様書、電気図面、ラダー回路をアップロードし、NotebookLMインターフェースを通じて直接質問やコードの自動生成が行えます。'
                : locale === 'vi'
                ? 'Nạp bảng thông số specs, bản vẽ điện CAD và mã nguồn PLC để chạy mô phỏng, audit lỗi và dịch thuật tự động qua AI Chatbot.'
                : 'Upload specifications, electrical drawings, and PLC code to interact with AI chatbot and design automation scripts.'}
            </p>
          </div>
        </section>

        {/* Notebooks Grid */}
        <section className="flex-1 min-h-0 flex flex-col gap-4">
          <div className="shrink-0 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase font-mono">
              {locale === 'ja' ? '最近のノートブック' : locale === 'vi' ? 'Danh sách dự án hoạt động' : 'Recent Notebooks'}
            </h3>
            <span className="text-xs text-slate-450 font-mono">
              {filteredCases.length} {filteredCases.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pb-8 -mr-2 pr-2">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* New Notebook card */}
            <div
              onClick={() => setShowNewModal(true)}
              className="bg-slate-50/40 border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer group hover:bg-brand-500/5 transition-all duration-300 min-h-[190px] shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-brand-500/10 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition">
                <Plus className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700 group-hover:text-brand-500 transition">
                  {locale === 'ja' ? '新しいケースを追加' : locale === 'vi' ? 'Thêm dự án mới' : 'Add new case'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {locale === 'ja' ? '仕様書やコードを読み込みます' : locale === 'vi' ? 'Nạp specs & source code để chạy' : 'Ground the AI with engineering sources'}
                </p>
              </div>
            </div>

            {/* Cases items */}
            {filteredCases.map((c) => (
              <Link
                key={c.id}
                to={`/workspace/${c.id}`}
                state={{ status: c.status }}
                className="bg-white border border-slate-200/85 hover:border-brand-500/50 rounded-2xl p-6 flex flex-col justify-between gap-4 cursor-pointer hover-lift min-h-[190px] shadow-xs relative overflow-hidden group"
              >
                {/* Visual side marker */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-brand-500 transition-colors" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{c.code}</span>
                    <span className={`pill ${c.pillClass}`}>{t(c.status)}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug tracking-tight group-hover:text-brand-500 transition-colors">
                    {c.title}
                  </h4>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-500">
                      <span>{locale === 'ja' ? '進捗' : locale === 'vi' ? 'Tiến độ đồng bộ' : 'Sync Progress'}</span>
                      <span className="tabular-nums font-semibold text-brand-600">{c.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>

                  {/* Foot metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-450 font-mono">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sourceCount(c)} files</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{c.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </div>
        </section>
      </main>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-mono">
                {locale === 'ja' ? '新規ケースの作成' : locale === 'vi' ? 'Khởi tạo dự án PLC mới' : 'Create New PLC Case'}
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase font-mono">
                    {locale === 'ja' ? 'ケース管理番号' : locale === 'vi' ? 'Mã dự án (Case Code)' : 'Case Code / ID'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase font-mono">
                    {locale === 'ja' ? 'ケースの名称 (設備名)' : locale === 'vi' ? 'Tên thiết bị (Title)' : 'Case Title / Equipment Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={locale === 'ja' ? '例: WW3 搬送ロボット' : locale === 'vi' ? 'VD: WW3 Robot chuyển hàng' : 'e.g. WW3 Material Handling Robot'}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 transition font-mono"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-550 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  {locale === 'ja' ? 'キャンセル' : locale === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold gradient-primary hover:opacity-90 text-white rounded-xl shadow-md transition cursor-pointer font-mono"
                >
                  {locale === 'ja' ? '作成' : locale === 'vi' ? 'Khởi tạo' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
