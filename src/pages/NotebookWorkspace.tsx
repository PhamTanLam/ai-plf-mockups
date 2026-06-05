import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Plus,
  Send,
  Settings,
  X,
  Check,
  Calculator,
  GitMerge,
  Layers,
  Cpu
} from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

// Import components
import CadViewer from '@/components/CadViewer'
import FlowchartEditor from '@/components/FlowchartEditor'
import LadderAuditor from '@/components/LadderAuditor'
import SourceViewer from '@/components/SourceViewer'
import ProjectReentry from '@/components/ProjectReentry'
import DocumentGenerator from '@/components/DocumentGenerator'
import CaseInput from '@/components/CaseInput'
import ReviewStep from '@/components/ReviewStep'
import ProposalStep from '@/components/ProposalStep'
import AddSourceModal from '@/components/AddSourceModal'
import { usePresalesState } from '@/hooks/usePresalesState'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  citations?: { id: number; sourceId: string; phrase?: string; tab?: string }[]
  timestamp: string
}

interface SourceFile {
  id: string
  title: string
  type: string
  size: string
  selected: boolean
}

interface StickyNote {
  id: string
  content: string
  color: string
}

interface PhaseDetail {
  num: number
  title: string
  desc: string
  prompts: string[]
  tab: 'audio' | 'cad' | 'gen' | 'audit' | 'translate' | 'notes' | 'reentry' | 'doc' | 'caseinput' | 'review' | 'proposal'
  sourcesToSelect: string[]
  inputs: string[]
  outputs: string[]
  users: string
  note?: string
}

const phasesInfo: PhaseDetail[] = [
  // PRE-SALES = chu trình lặp 3 hoạt động (Nhập/Sửa → Kiểm tra → Dự toán), lặp theo "Vòng N"
  {
    num: 1,
    title: 'Nhập / Sửa thông tin',
    desc: 'Trích xuất + Q&A: AI ghi nhớ thông tin dự án để phục vụ dự toán.',
    prompts: ['Tóm tắt dự án giúp tôi.', 'Sinh dự toán khái quát.'],
    tab: 'caseinput',
    sourcesToSelect: [],
    inputs: ['Tài liệu kỹ thuật (PDF)', 'Biên bản hỏi đáp', 'Video & hình ảnh'],
    outputs: ['5 đầu ra pre-sales'],
    users: 'Nhân viên kinh doanh',
  },
  {
    num: 2,
    title: 'Kiểm tra',
    desc: 'Rà soát/chỉnh sửa thông tin đã nhập trước khi trình dự toán (có thể bỏ qua).',
    prompts: ['Còn mục nào cần rà soát?'],
    tab: 'review',
    sourcesToSelect: [],
    inputs: ['Câu hỏi'],
    outputs: ['Xác nhận nội dung chỉ ra'],
    users: 'Nhân viên kinh doanh hoặc SE',
    note: 'Có thể bỏ qua bước này.',
  },
  {
    num: 3,
    title: 'Trình dự toán',
    desc: 'Gom đầu ra thành hồ sơ trình khách. Có thể cập nhật (sửa → dự toán lại) đến khi chốt đơn.',
    prompts: ['Xuất hồ sơ đề xuất.'],
    tab: 'proposal',
    sourcesToSelect: [],
    inputs: ['Câu hỏi'],
    outputs: ['Tài liệu đề xuất'],
    users: 'Nhân viên kinh doanh',
  },
  {
    num: 7,
    title: 'Nhập lại thông tin dự án',
    desc: 'Nhập chênh lệch giữa trước và sau khi nhận đơn hàng.',
    prompts: [
      'Nhập lại chênh lệch thông số dự án sau khi nhận đơn hàng.',
      'Xác nhận nội dung dự án mới và chênh lệch.',
    ],
    tab: 'reentry',
    sourcesToSelect: ['spec'],
    inputs: ['Câu hỏi', 'Nhập thông tin chênh lệch'],
    outputs: ['Xác nhận nội dung dự án'],
    users: 'Nhân viên kinh doanh',
  },
  {
    num: 8,
    title: 'Kick-off',
    desc: 'Bàn giao thông tin cho bên tiếp nhận.',
    prompts: [
      'Soạn biên bản Kick-off bàn giao dự án.',
      'Xác nhận thông tin dự án cho phiên Kick-off.',
    ],
    tab: 'notes',
    sourcesToSelect: ['spec', 'flow'],
    inputs: ['Câu hỏi'],
    outputs: ['Xác nhận thông tin dự án'],
    users: 'Nhân viên kinh doanh, SE, Người phụ trách',
  },
  {
    num: 9,
    title: 'Thiết kế',
    desc: 'Thiết kế phần cứng, PLC và TP. Dịch thuật chú thích chương trình Nhật - Việt.',
    prompts: [
      'Dịch chú thích tiếng Nhật của chương trình PLC sang tiếng Việt.',
      'Giải nghĩa các dòng chú thích tiếng Nhật trong code PLC.',
    ],
    tab: 'translate',
    sourcesToSelect: ['spec', 'cad'],
    inputs: ['Chú thích tiếng Nhật'],
    outputs: ['Bản dịch tiếng Việt (văn bản)'],
    users: 'SE, Người phụ trách',
    note: 'Phân nhánh theo nội dung: Cơ khí, điện, phần mềm.',
  },
  {
    num: 10,
    title: 'Sản xuất',
    desc: 'Tạm thời tập trung vào điện: tạo bản vẽ điện, lập trình PLC/TP và thông số vận hành.',
    prompts: [
      'Tạo bản vẽ điện CAD và chương trình PLC.',
      'Sinh thông số vận hành và giải thích chương trình.',
    ],
    tab: 'gen',
    sourcesToSelect: ['spec', 'flow', 'cad'],
    inputs: ['Câu hỏi'],
    outputs: ['Bản vẽ điện (CAD)', 'Chương trình PLC', 'Thông số vận hành', 'Giải thích chương trình (văn bản)'],
    users: 'SE, Người phụ trách',
    note: 'Phân nhánh theo nội dung: Cơ khí, điện, phần mềm.',
  },
  {
    num: 11,
    title: 'Debug',
    desc: 'Tạm thời tập trung vào điện: kiểm tra chương trình PLC và TP.',
    prompts: [
      'Kiểm tra chương trình PLC và tìm lỗi.',
      'Đánh giá lỗi an toàn mạch điện.',
    ],
    tab: 'audit',
    sourcesToSelect: ['ladder', 'manual'],
    inputs: ['Câu hỏi'],
    outputs: ['Kiểm tra chương trình (văn bản)'],
    users: 'SE, Người phụ trách',
    note: 'Phân nhánh theo nội dung: Cơ khí, điện, phần mềm.',
  },
  {
    num: 12,
    title: 'Hiệu chỉnh tại hiện trường',
    desc: 'Tạm thời tập trung vào điện: đấu dây và debug PLC/TP tại hiện trường.',
    prompts: [
      'Cập nhật sơ đồ đấu dây hiện trường.',
      'Hiệu chỉnh PLC tại hiện trường.',
    ],
    tab: 'cad',
    sourcesToSelect: ['cad', 'ladder'],
    inputs: ['Nội dung sửa phần cứng'],
    outputs: ['Bản vẽ điện (CAD)'],
    users: 'SE, Người phụ trách',
    note: 'Phân nhánh theo nội dung: Cơ khí, điện, phần mềm.',
  },
  {
    num: 13,
    title: 'Giám sát / Nghiệm thu',
    desc: 'Tạm thời tập trung vào điện: tạo tài liệu hướng dẫn và biên bản kiểm tra.',
    prompts: [
      'Soạn tài liệu nghiệm thu và hướng dẫn sử dụng.',
      'Tổng hợp kết quả kiểm tra và nội dung màn hình TP.',
    ],
    tab: 'doc',
    sourcesToSelect: ['spec', 'cad', 'flow'],
    inputs: ['Câu hỏi', 'Thông tin màn hình TP', 'Kết quả kiểm tra'],
    outputs: ['Thông tin nền hướng dẫn sử dụng (văn bản)', 'Thông tin nền biên bản kiểm tra (văn bản)'],
    users: 'SE, Người phụ trách',
    note: 'Phân nhánh theo nội dung: Cơ khí, điện, phần mềm.',
  },
]

const stepperSteps = [
  { order: 1, label: 'Nhận thông tin', icon: FileText, phases: [7] },
  { order: 2, label: 'Dự toán', icon: Calculator, phases: [8] },
  { order: 3, label: 'Sơ đồ luồng', icon: GitMerge, phases: [9, 10] },
  { order: 4, label: 'Thiết kế CAD', icon: Layers, phases: [12] },
  { order: 5, label: 'Sinh code PLC', icon: Cpu, phases: [11, 13] },
]

// Pre-sales (trước nhận đơn) = CHU TRÌNH LẶP 3 hoạt động: Nhập/Sửa → Kiểm tra → Dự toán.
// Thực tế lặp lại nhiều vòng (sửa thông tin → dự toán lại) đến khi chốt đơn → mô hình "Vòng N".

// Các case demo (có sẵn tài liệu mẫu để minh hoạ luồng sau nhận đơn). Dự án MỚI bắt đầu KHÔNG có nguồn.
const DEMO_IDS = new Set(['CASE-2026-0245', 'CASE-2026-0312', 'CASE-2026-0345', 'CASE-2026-0288'])
// Trạng thái của case demo (fallback khi refresh/deep-link, không có router state)
const DEMO_STATUS: Record<string, string> = {
  'CASE-2026-0245': 'status.debug', 'CASE-2026-0312': 'status.design',
  'CASE-2026-0345': 'status.pre', 'CASE-2026-0288': 'status.onsite',
}
// Tiến độ tổng dự án (đồng bộ với card ở dashboard) — fallback khi refresh/deep-link
const DEMO_PROGRESS: Record<string, number> = {
  'CASE-2026-0245': 88, 'CASE-2026-0312': 38, 'CASE-2026-0345': 70, 'CASE-2026-0288': 50,
}
// Trạng thái dự án → bước mở mặc định khi vào workspace
function statusToPhase(status?: string): number {
  switch (status) {
    case 'status.preSales': case 'status.pre': return 1
    case 'status.kickoff': return 8
    case 'status.design': return 9
    case 'status.build': return 10
    case 'status.debug': return 11
    case 'status.onsite': return 12
    case 'status.done': return 13
    default: return 1
  }
}
const DEMO_SOURCES: SourceFile[] = [
  { id: 'spec', title: 'WW2_Technical_Specs.pdf', type: 'PDF Spec Sheet', size: '245 KB', selected: true },
  { id: 'cad', title: 'Electrical_CAD_Layout_v0.3.dxf', type: 'Electrical DWG', size: '1.2 MB', selected: true },
  { id: 'flow', title: 'Auto_Welding_Sequence.json', type: 'Flow Diagram', size: '12 KB', selected: true },
  { id: 'ladder', title: 'PLC_Ladder_Code.l5k', type: 'Ladder Logic', size: '89 KB', selected: false },
  { id: 'manual', title: 'Mitsubishi_MRJ5_Servo_Manual.pdf', type: 'Device Manual', size: '4.8 MB', selected: false },
]

export default function NotebookWorkspace() {
  const { id } = useParams<{ id: string }>()
  const { locale } = useI18n()
  const chatEndRef = useRef<HTMLDivElement>(null)


  // Bước mở mặc định = theo TRẠNG THÁI dự án (router state khi click từ dashboard; fallback map demo; mới → pre-sales bước 1)
  const location = useLocation()
  const navState = location.state as { status?: string; progress?: number } | null
  const caseStatus = navState?.status || DEMO_STATUS[id || ''] || 'status.preSales'
  const initialPhase = statusToPhase(caseStatus)
  const providedProgress = navState?.progress ?? DEMO_PROGRESS[id || '']
  const [activePhase, setActivePhase] = useState<number | null>(initialPhase)
  const [phases, setPhases] = useState<(PhaseDetail & { isVisible?: boolean })[]>(
    phasesInfo.map(p => ({ ...p, isVisible: true }))
  )
  const [activeUser, setActiveUser] = useState<'Linh' | 'Kanai' | 'AI'>('Linh')
  const [activatedPhases, setActivatedPhases] = useState<number[]>([initialPhase])
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isCopilotExpanded, setIsCopilotExpanded] = useState(true)

  // Progress data state
  const [progressData, setProgressData] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0,
    7: 60,
    8: 40,
    9: 50,
    10: 80,
    11: 30,
    12: 30,
    13: 20,
  })

  // Pre-sales NV1 state (mô phỏng, lưu localStorage theo case)
  const pre = usePresalesState(id || 'default')
  const [addSourceOpen, setAddSourceOpen] = useState(false)

  // Tiến độ TỔNG dự án (đồng bộ với card ngoài dashboard); dự án mới chưa có số → theo tiến độ nhập liệu
  const projectProgress = providedProgress != null ? providedProgress : pre.progressPct

  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([
    'Nhập thông tin dự án (pre-sales)',
    'Nhập lại chênh lệch thông tin dự án sau khi nhận đơn hàng',
    'Soạn biên bản Kick-off bàn giao dự án',
    'Dịch thuật chú thích chương trình sang tiếng Việt',
    'Tạo bản vẽ điện CAD và chương trình PLC',
    'Kiểm tra chương trình PLC và tìm lỗi',
    'Cập nhật sơ đồ đấu dây tại hiện trường',
    'Soạn tài liệu nghiệm thu / hướng dẫn sử dụng'
  ])

  const suggestionResponses: Record<string, {
    phaseNum: number
    explanationText: string
    suggestions: string[]
    citations?: { id: number; sourceId: string; phrase?: string; tab?: string }[]
  }> = {
    'Nhập lại chênh lệch thông tin dự án sau khi nhận đơn hàng': {
      phaseNum: 7,
      explanationText: 'Đã chuyển sang Pha 7: Nhập lại thông tin dự án. Hãy cung cấp chi tiết chênh lệch giữa đơn hàng gốc và thực tế để xác nhận nội dung dự án.',
      suggestions: [
        'Có thay đổi gì về số lượng động cơ hay PLC?',
        'Xác nhận thông số điện áp và loại thiết bị.',
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'reentry' }],
    },
    'Soạn biên bản Kick-off bàn giao dự án': {
      phaseNum: 8,
      explanationText: 'Đã mở Pha 8: Kick-off. Tôi sẽ giúp bạn soạn biên bản bàn giao và xác nhận thông tin dự án cho bên tiếp nhận.',
      suggestions: [
        'Xác nhận thông tin dự án trước Kick-off.',
        'Chuẩn bị danh sách thành viên SE và người phụ trách.',
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'notes' }],
    },
    'Dịch thuật chú thích chương trình sang tiếng Việt': {
      phaseNum: 9,
      explanationText: 'Đã mở Pha 9: Thiết kế. Tôi sẽ hỗ trợ bạn dịch các chú thích tiếng Nhật trong chương trình điều khiển sang tiếng Việt để phục vụ thiết kế phần cứng và PLC.',
      suggestions: [
        'Dịch chú thích tiếng Nhật PLC sang tiếng Việt.',
        'Giải thích ý nghĩa chú thích vận hành.',
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'translate' }],
    },
    'Tạo bản vẽ điện CAD và chương trình PLC': {
      phaseNum: 10,
      explanationText: 'Đã mở Pha 10: Sản xuất. Tôi sẽ tạo bản vẽ điện CAD, chương trình PLC cùng thông số vận hành và giải thích chương trình.',
      suggestions: [
        'Sinh thông số vận hành cho quy trình tự động.',
        'Giải thích chương trình PLC bằng văn bản.',
      ],
      citations: [{ id: 1, sourceId: 'flow', tab: 'gen' }],
    },
    'Kiểm tra chương trình PLC và tìm lỗi': {
      phaseNum: 11,
      explanationText: 'Đã mở Pha 11: Debug. Tôi sẽ kiểm tra chương trình PLC, phát hiện lỗi và đánh giá an toàn mạch.',
      suggestions: [
        'Đánh giá an toàn mạch điện và ladder.',
        'Xem báo cáo kiểm tra chương trình.',
      ],
      citations: [{ id: 1, sourceId: 'ladder', tab: 'audit' }],
    },
    'Cập nhật sơ đồ đấu dây tại hiện trường': {
      phaseNum: 12,
      explanationText: 'Đã mở Pha 12: Hiệu chỉnh tại hiện trường. Tôi sẽ giúp bạn cập nhật sơ đồ đấu dây và tạo bản vẽ điện CAD phản ánh thay đổi phần cứng.',
      suggestions: [
        'Hiệu chỉnh PLC và TP tại hiện trường.',
        'Tạo bản vẽ CAD cho thiết kế đấu nối mới.',
      ],
      citations: [{ id: 1, sourceId: 'cad', tab: 'cad' }],
    },
    'Soạn tài liệu nghiệm thu / hướng dẫn sử dụng': {
      phaseNum: 13,
      explanationText: 'Đã mở Pha 13: Giám sát / Nghiệm thu. Tôi sẽ soạn tài liệu hướng dẫn sử dụng và biên bản kiểm tra dựa trên kết quả kiểm tra và màn hình TP.',
      suggestions: [
        'Tổng hợp thông tin nền cho báo cáo nghiệm thu.',
        'Soạn biên bản kiểm tra chi tiết.',
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'doc' }],
    },
  }

  const activeRightTab = activePhase !== null ? phases.find((p) => p.num === activePhase)?.tab ?? 'reentry' : null
  const currentStepIndex = activePhase === 7
    ? 1
    : activePhase === 8
    ? 2
    : (activePhase === 9 || activePhase === 10)
    ? 3
    : activePhase === 12
    ? 4
    : (activePhase === 11 || activePhase === 13)
    ? 5
    : 0
  // Pre-sales = chu trình lặp 3 hoạt động (phase 1→3); post-order = stepper tuyến tính (7→13)
  const isPreSales = activePhase === null || activePhase <= 3
  const activeStepIndex = currentStepIndex
  const SOURCES_KEY = `aiplf.sources.${id || 'default'}`
  const [sources, setSources] = useState<SourceFile[]>(() => {
    try { const raw = localStorage.getItem(SOURCES_KEY); if (raw) return JSON.parse(raw) as SourceFile[] } catch { /* ignore */ }
    // Dự án demo có tài liệu mẫu; dự án MỚI bắt đầu rỗng (người dùng tự thêm nguồn)
    return id && DEMO_IDS.has(id) ? DEMO_SOURCES.map(s => ({ ...s })) : []
  })
  useEffect(() => {
    try { localStorage.setItem(SOURCES_KEY, JSON.stringify(sources)) } catch { /* ignore */ }
  }, [SOURCES_KEY, sources])

  const handlePhaseChange = (phaseNum: number) => {
    setActivePhase(phaseNum)
    setActivatedPhases((prev) => {
      if (prev.includes(phaseNum)) return prev
      return [...prev, phaseNum]
    })
    
    const phase = phases.find((p) => p.num === phaseNum)
    if (phase) {
      // Auto-select sources for this phase
      setSources((prev) =>
        prev.map((s) => ({
          ...s,
          selected: phase.sourcesToSelect.includes(s.id),
        }))
      )
    }
  }

  // Handle progress updates in a stable, memoized way to prevent infinite rendering loops
  const handleProgressChange = useCallback((phaseNum: number, progress: number) => {
    setProgressData((prev) => {
      if (prev[phaseNum] === progress) return prev
      return { ...prev, [phaseNum]: progress }
    })
  }, [])

  const handleProgress7 = useCallback((prog: number) => handleProgressChange(7, prog), [handleProgressChange])
  const handleProgress10 = useCallback((prog: number) => handleProgressChange(10, prog), [handleProgressChange])
  const handleProgress11 = useCallback((prog: number) => handleProgressChange(11, prog), [handleProgressChange])
  const handleProgress12 = useCallback((prog: number) => handleProgressChange(12, prog), [handleProgressChange])
  const handleProgress13 = useCallback((prog: number) => handleProgressChange(13, prog), [handleProgressChange])

  // Chat message thread
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI Kỹ thuật cho dự án này.\n\nLuồng nghiệp vụ gồm **giai đoạn TRƯỚC nhận đơn** — chu trình lặp 3 hoạt động *Nhập/Sửa → Kiểm tra → Trình dự toán* (cập nhật đến khi chốt đơn) — và **giai đoạn SAU nhận đơn (Pha 7–13)**. Hãy thêm nguồn hoặc kể về dự án để mình trích dữ liệu, hoặc chọn hoạt động trên thanh chu trình.',
      timestamp: '10:00 AM',
    },
  ])

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const [inputVal, setInputVal] = useState('')
  const [activeViewerSource, setActiveViewerSource] = useState<string | null>(null)
  const [highlightedPhrase, setHighlightedPhrase] = useState<string | undefined>(undefined)

  // Question History tracking
  const [askedQuestions, setAskedQuestions] = useState<string[]>([])

  // Edit History & Logs States
  const [leftActiveTab, setLeftActiveTab] = useState<'sources' | 'history'>('sources')
  const [historyLogs, setHistoryLogs] = useState<{ id: string; user: string; action: string; timestamp: string; phaseNum: number }[]>([
    { id: 'h1', user: 'Kanai', action: 'Đã thiết lập dự án và nạp tài liệu thiết kế gốc', timestamp: '09:30 AM', phaseNum: 7 },
    { id: 'h2', user: 'Linh', action: 'Xác nhận thông số Mạng truyền thông CC-Link IE', timestamp: '10:05 AM', phaseNum: 7 },
    { id: 'h3', user: 'Linh', action: 'Đồng bộ chênh lệch thông số sang biên bản kick-off', timestamp: '10:15 AM', phaseNum: 8 },
  ])

  const addLog = useCallback((actionText: string, phaseNum: number) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: activeUser,
      action: actionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      phaseNum,
    }
    setHistoryLogs(prev => [newLog, ...prev])
  }, [activeUser])

  // Sticky notes list
  const [notes, setNotes] = useState<StickyNote[]>([
    { id: 'n1', content: 'Cần kiểm tra lại điện áp đầu vào AC200V 3 pha cho các trục Servo A1, A2, A3 trước khi nghiệm thu.', color: 'bg-amber-50 border-amber-250 text-amber-800' },
    { id: 'n2', content: 'Gửi bản vẽ CAD đã cập nhật mạch liên khóa KA1 cho bộ phận lắp ráp tủ điện.', color: 'bg-emerald-50 border-emerald-250 text-emerald-800' },
  ])
  const [noteInput, setNoteInput] = useState('')

  useEffect(() => {
    // Dynamically update progress for notes (Phase 8)
    const progress = Math.min(100, notes.length * 25)
    setProgressData(prev => {
      if (prev[8] === progress) return prev
      return { ...prev, 8: progress }
    })
  }, [notes])

  // Tiến độ hoạt động "Nhập / Sửa" (phase 1, pre-sales) lấy từ hook NV1
  useEffect(() => {
    setProgressData(prev => {
      if (prev[1] === pre.progressPct) return prev
      return { ...prev, 1: pre.progressPct }
    })
  }, [pre.progressPct])

  // Cập nhật danh sách gợi ý câu hỏi tiếp theo tương ứng với pha hiện tại
  useEffect(() => {
    if (activePhase === 1 || activePhase === 2 || activePhase === 3 || activePhase === null) {
      setActiveSuggestions(PRE_SUGG)
    } else if (activePhase === 7) {
      setActiveSuggestions(['Có thay đổi gì về số lượng động cơ hay PLC?', 'Xem chi tiết thông số chênh lệch Melsec Q?'])
    } else if (activePhase === 8) {
      setActiveSuggestions(['Xác nhận thông tin dự án trước Kick-off.', 'Chuẩn bị danh sách thành viên SE và người phụ trách.'])
    } else if (activePhase === 9) {
      setActiveSuggestions(['Dịch thuật chú thích chương trình sang tiếng Việt.', 'Giải thích ý nghĩa chú thích vận hành.'])
    } else if (activePhase === 10) {
      setActiveSuggestions(['Tạo bản vẽ điện CAD và chương trình PLC.', 'Sinh thông số vận hành cho quy trình tự động.'])
    } else if (activePhase === 11) {
      setActiveSuggestions(['Kiểm tra chương trình PLC và tìm lỗi.', 'Đánh giá an toàn mạch điện và ladder.'])
    } else if (activePhase === 12) {
      setActiveSuggestions(['Cập nhật sơ đồ đấu dây hiện trường.', 'Hiệu chỉnh PLC và TP tại hiện trường.'])
    } else if (activePhase === 13) {
      setActiveSuggestions(['Soạn tài liệu hướng dẫn sử dụng TP.', 'Tạo biên bản nghiệm thu kiểm tra.'])
    }
  }, [activePhase])
  // Translation board states

  // Design Phase 9 States
  const [jpText, setJpText] = useState('自動運転シーケンス初期化完了。サーボアンプ電源投入を確認のこと。')
  const [viText, setViText] = useState('Khởi tạo chuỗi tự động vận hành hoàn tất. Hãy xác nhận nguồn điện động lực cho Servo Drive.')

  // đẩy 1 cặp tin nhắn (người dùng + AI) vào chat
  const pushChat = (userText: string, aiText: string, sugg?: string[]) => {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: userText, timestamp: ts },
      { id: `a-${Date.now() + 1}`, sender: 'ai', text: aiText, timestamp: ts },
    ])
    if (sugg) setActiveSuggestions(sugg)
    setInputVal('')
  }
  const PRE_SUGG = [
    'Tóm tắt dự án',
    'Soạn nội dung tài liệu dự toán',
    'Mô tả cấu thành hệ thống (đơn giản)',
    'Lập dự toán khái quát',
    'Lập lịch trình khái quát',
    'Soạn tài liệu nền đề xuất'
  ]

  // Chat trong các bước pre-sales (1→6): AI ghi nhớ thông tin + tóm tắt + sinh đầu ra. KHÔNG gọi API.
  const handlePresalesChat = (text: string) => {
    // "Nhãn: giá trị" → ghi nhớ một thông tin
    const mm = text.match(/^\s*(?:thêm|ghi chú)?\s*(.{2,40}?)\s*[:：]\s*(.+)$/)
    if (mm) { pre.addField(mm[1].trim(), mm[2].trim()); pushChat(text, `✓ Đã ghi nhớ **${mm[1].trim()}**: ${mm[2].trim()}`, PRE_SUGG); return }
    // ý định sinh đầu ra
    let genMsg = ''
    if (text === 'Soạn nội dung tài liệu dự toán') { pre.generate('doc'); genMsg = ' Đã sinh **Nội dung tài liệu dự toán** ✓.' }
    else if (text === 'Mô tả cấu thành hệ thống (đơn giản)') { pre.generate('config'); genMsg = ' Đã sinh **Cấu thành hệ thống (đơn giản)** ✓.' }
    else if (text === 'Lập dự toán khái quát') { pre.generate('estimate'); genMsg = ' Đã sinh **Dự toán khái quát** ✓.' }
    else if (text === 'Lập lịch trình khái quát') { pre.generate('schedule'); genMsg = ' Đã sinh **Lịch trình khái quát** ✓.' }
    else if (text === 'Soạn tài liệu nền đề xuất') { pre.generate('proposal'); genMsg = ' Đã sinh **Tài liệu nền đề xuất** ✓.' }
    else if (/dự toán|báo giá|estimate/i.test(text)) { pre.generate('estimate'); genMsg = ' Đã sinh **Dự toán khái quát** ✓ (xem ở "Đã tạo").' }
    else if (/lịch trình|timeline|schedule/i.test(text)) { pre.generate('schedule'); genMsg = ' Đã sinh **Lịch trình khái quát** ✓.' }
    else if (/cấu thành/i.test(text)) { pre.generate('config'); genMsg = ' Đã sinh **Cấu thành đơn giản** ✓.' }
    else if (/tài liệu nền|hồ sơ nền|proposal/i.test(text)) { pre.generate('proposal'); genMsg = ' Đã sinh **Tài liệu nền đề xuất** ✓.' }
    // trả lời
    let aiText: string
    if (/tóm tắt|xem dữ liệu|dữ liệu đã|đã ghi|nhớ gì|thông tin dự án/i.test(text)) {
      aiText = 'Dữ liệu dự án mình đang ghi nhớ:\n' + pre.summaryText()
    } else {
      const added = pre.rememberFromContent(text)
      aiText = added.length ? `Mình đã ghi nhớ thêm: **${added.join(', ')}**. Gõ "tóm tắt dự án" để xem toàn bộ.` : 'Đã hiểu. Bạn kể thêm chi tiết, hoặc gõ "tóm tắt dự án" để xem mình đang nhớ gì.'
    }
    pushChat(text, (aiText + genMsg).trim(), PRE_SUGG)
  }

  const sendMessagePrompt = (text: string) => {
    // Trong luồng pre-sales (bước 1→6): xử lý riêng (mô phỏng), không dùng router post-order
    if (activePhase !== null && activePhase <= 3) { handlePresalesChat(text); return }
    const query = text.toLowerCase()
    let matchedPhaseNum = activePhase
    let explanationText = ''
    let suggestions: string[] = []
    let phaseCitations: { id: number; sourceId: string; phrase?: string; tab?: string }[] = []
    let isMatched = false

    // Check query against keywords of each phase
    const phaseKeywords: Record<number, { keywords: string[], tab: string, title: string, desc: string }> = {
      1: {
        keywords: ['nhập thông tin', 'pre-sales', 'presales', 'trước nhận đơn', 'trích xuất', 'nhập liệu dự án', '12 nhóm'],
        tab: 'caseinput',
        title: 'Nhập thông tin dự án',
        desc: 'Đã mở **Bước 1: Nhập thông tin dự án** (pre-sales). Thêm nguồn ở cột trái hoặc kể về dự án để mình trích dữ liệu; gõ "bổ sung" để mình hỏi từng mục.'
      },
      7: {
        keywords: ['nhập lại', 'reentry', 're-entry', 'chênh lệch', 'đối chiếu', 'so sánh', 'đơn hàng', 'spec', 'specs'], 
        tab: 'reentry', 
        title: 'Nhập lại thông tin dự án',
        desc: 'Tôi đã di chuyển màn hình đến **Pha 7: Nhập lại thông tin dự án** để bạn thực hiện đối chiếu chênh lệch thông số thiết bị.' 
      },
      8: { 
        keywords: ['kick-off', 'kickoff', 'bàn giao', 'handover', 'ghi chú', 'biên bản cuộc họp', 'họp', 'notes', 'lưu ghi chú'], 
        tab: 'notes', 
        title: 'Kick-off',
        desc: 'Tôi đã di chuyển màn hình đến **Pha 8: Kick-off** để bạn theo dõi nội dung ghi chú và biên bản cuộc họp bàn giao.' 
      },
      9: { 
        keywords: ['thiết kế', 'design', 'dịch', 'translate', 'nhật', 'việt', 'chú thích', 'comment'], 
        tab: 'translate', 
        title: 'Thiết kế',
        desc: 'Tôi đã di chuyển màn hình đến **Pha 9: Thiết kế** để dịch thuật chú thích chương trình Nhật - Việt.' 
      },
      10: { 
        keywords: ['sản xuất', 'cad', 'plc', 'structured text', 'st', 'program', 'thông số vận hành', 'flowchart', 'tạo bản vẽ'], 
        tab: 'gen', 
        title: 'Sản xuất',
        desc: 'Tôi đã di chuyển màn hình đến **Pha 10: Sản xuất** để bạn chỉnh sửa sơ đồ tuần tự và sinh mã lệnh Structured Text (ST).' 
      },
      11: { 
        keywords: ['debug', 'quét lỗi', 'sửa lỗi', 'an toàn', 'ladder', 'audit', 'ka1', 'mạch liên khóa', 'lỗi', 'kiểm tra'], 
        tab: 'audit', 
        title: 'Debug',
        desc: 'Tôi đã di chuyển màn hình đến **Pha 11: Debug** để chạy quét lỗi liên khóa an toàn và kiểm tra ladder logic.' 
      },
      12: { 
        keywords: ['hiệu chỉnh', 'hiện trường', 'đấu nối', 'sơ đồ dây', 'sửa phần cứng', 'dxf', 'cập nhật sơ đồ'], 
        tab: 'cad', 
        title: 'Hiệu chỉnh tại hiện trường',
        desc: 'Tôi đã di chuyển màn hình đến **Pha 12: Hiệu chỉnh tại hiện trường** để hiển thị bản vẽ CAD đấu dây mạch lực.' 
      },
      13: { 
        keywords: ['nghiệm thu', 'giám sát', 'hdsd', 'hướng dẫn', 'test', 'chất lượng', 'tài liệu', 'doc', 'báo cáo'], 
        tab: 'doc', 
        title: 'Giám sát / Nghiệm thu',
        desc: 'Tôi đã di chuyển màn hình đến **Pha 13: Giám sát / Nghiệm thu** để hiển thị biểu mẫu nghiệm thu và kết xuất tài liệu vận hành HMI.' 
      }
    }

    const preset = suggestionResponses[text]
    if (preset) {
      matchedPhaseNum = preset.phaseNum
      explanationText = preset.explanationText
      suggestions = preset.suggestions
      phaseCitations = preset.citations ?? []
      isMatched = true
    } else {
      // Find matching phase based on keywords
      for (const [phaseNumStr, data] of Object.entries(phaseKeywords)) {
        const phaseNum = parseInt(phaseNumStr)
        const phase = phases.find(p => p.num === phaseNum)
        const phaseTitleLower = phase ? phase.title.toLowerCase() : data.title.toLowerCase()

        if (
          query.includes(phaseTitleLower) ||
          data.keywords.some(kw => query.includes(kw))
        ) {
          matchedPhaseNum = phaseNum
          explanationText = data.desc
          isMatched = true
          
          if (phaseNum === 1) {
            suggestions = PRE_SUGG
          } else if (phaseNum === 7) {
            suggestions = ['Có thay đổi gì về số lượng động cơ hay PLC?', 'Xem chi tiết thông số chênh lệch Melsec Q?']
          } else if (phaseNum === 8) {
            suggestions = ['Xác nhận thông tin dự án trước Kick-off.', 'Chuẩn bị danh sách thành viên SE và người phụ trách.']
          } else if (phaseNum === 9) {
            suggestions = ['Dịch thuật chú thích chương trình sang tiếng Việt.', 'Giải thích ý nghĩa chú thích vận hành.']
          } else if (phaseNum === 10) {
            suggestions = ['Tạo bản vẽ điện CAD và chương trình PLC.', 'Sinh thông số vận hành cho quy trình tự động.']
          } else if (phaseNum === 11) {
            suggestions = ['Kiểm tra chương trình PLC và tìm lỗi.', 'Đánh giá an toàn mạch điện và ladder.']
          } else if (phaseNum === 12) {
            suggestions = ['Cập nhật sơ đồ đấu dây hiện trường.', 'Hiệu chỉnh PLC và TP tại hiện trường.']
          } else if (phaseNum === 13) {
            suggestions = ['Soạn tài liệu hướng dẫn sử dụng TP.', 'Tạo biên bản nghiệm thu kiểm tra.']
          }
          
          phaseCitations = [{ id: 1, sourceId: 'spec', tab: data.tab }]
          break
        }
      }
    }

    if (!isMatched) {
      explanationText = `Dựa trên câu hỏi "${text}" của bạn và các tài liệu nguồn đã nạp, tôi chưa tìm thấy từ khóa trùng khớp với 7 pha nghiệp vụ sau đơn hàng. \n\nVui lòng thử hỏi về một trong các bước như: nhập lại thông số chênh lệch, họp kick-off, thiết kế phần cứng, lập trình sản xuất PLC, debug lỗi an toàn, hiệu chỉnh đấu dây hiện trường, hoặc nghiệm thu bàn giao.`
      suggestions = [
        'Nhập lại chênh lệch thông tin dự án sau khi nhận đơn hàng',
        'Soạn biên bản Kick-off bàn giao dự án',
        'Tạo bản vẽ điện CAD và chương trình PLC'
      ]
    }

    if (matchedPhaseNum === null) {
      matchedPhaseNum = 10
    }

    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      sender: 'ai',
      text: explanationText,
      citations: phaseCitations,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setAskedQuestions((prev) => [...prev, text])
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, aiMsg])
    setActiveSuggestions(suggestions)
    setInputVal('')

    if (matchedPhaseNum !== activePhase) {
      handlePhaseChange(matchedPhaseNum)
    }
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    sendMessagePrompt(inputVal.trim())
  }

  const handleSuggestionClick = (prompt: string) => {
    sendMessagePrompt(prompt)
  }

  // Handle citation clicks
  const handleCitationClick = (citation: { id: number; sourceId: string; phrase?: string; tab?: string }) => {
    if (citation.tab) {
      const phase = phasesInfo.find((p) => p.tab === citation.tab)
      if (phase) {
        handlePhaseChange(phase.num)
      }
    } else {
      setActiveViewerSource(citation.sourceId)
      setHighlightedPhrase(citation.phrase)
    }
  }

  const handleSourceSelect = (sourceId: string) => {
    setSources(
      sources.map((s) => (s.id === sourceId ? { ...s, selected: !s.selected } : s))
    )
  }

  const humanSize = (b: number) => b < 1024 ? b + ' B' : b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB'

  // Thêm nguồn từ modal (file: chỉ metadata; văn bản dán: trích từ nội dung)
  const handleAddFiles = (files: { name: string; size: number }[]) => {
    if (!files.length) return
    const first = sources.length === 0
    const news: SourceFile[] = files.map((f, i) => ({ id: `up-${Date.now()}-${i}`, title: f.name, type: 'Tải lên', size: humanSize(f.size), selected: true }))
    setSources(prev => [...prev, ...news])
    setAddSourceOpen(false)
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    let aiText: string
    if (first) { const names = pre.rememberFromContent(); aiText = names.length ? `Đã đọc ${files.length} tài liệu và ghi nhớ: **${names.join(', ')}**.` : `Đã thêm ${files.length} tài liệu.` }
    else { const d = pre.reExtract(files[0].name); aiText = d.length ? `Đã đọc lại & đối chiếu — cập nhật **${d[0].name}**.` : `Đã thêm ${files.length} tài liệu.` }
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, sender: 'ai', text: aiText, timestamp: ts }])
    if (activePhase === null) handlePhaseChange(1)
  }
  const handleAddText = (text: string) => {
    setSources(prev => [...prev, { id: `txt-${Date.now()}`, title: 'Văn bản dán', type: 'Văn bản', size: text.length + ' ký tự', selected: true }])
    setAddSourceOpen(false)
    const names = pre.rememberFromContent(text)   // AI tự ghi nhớ từ nội dung dán
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, sender: 'ai', text: names.length ? `Đã đọc văn bản và ghi nhớ: **${names.join(', ')}**. Gõ "tóm tắt dự án" để xem toàn bộ.` : 'Đã thêm văn bản làm nguồn.', timestamp: ts }])
    if (activePhase === null) handlePhaseChange(1)
  }
  const addSourceFromNote = (title: string) => {
    setSources(prev => [...prev, { id: `note-${Date.now()}`, title: title.slice(0, 40) + ' (ghi chú)', type: 'Ghi chú', size: '—', selected: true }])
  }

  const addNote = () => {
    if (!noteInput.trim()) return
    const newNote: StickyNote = {
      id: `note-${Date.now()}`,
      content: noteInput,
      color: 'bg-amber-50 border-amber-250 text-amber-800',
    }
    setNotes([...notes, newNote])
    addLog(`Đã thêm ghi chú mới: "${noteInput.slice(0, 30)}${noteInput.length > 30 ? '...' : ''}"`, 8)
    setNoteInput('')
  }

  const deleteNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId)
    setNotes(notes.filter((n) => n.id !== noteId))
    if (note) {
      addLog(`Đã xóa ghi chú: "${note.content.slice(0, 30)}${note.content.length > 30 ? '...' : ''}"`, 8)
    }
  }


  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-mesh overflow-hidden text-slate-800 font-sans page-enter-right">
      {/* Header bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-none z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              {id === 'CASE-2026-0245'
                ? 'WW2 溶接セル (WW2 Welding Cell)'
                : id === 'CASE-2026-0312'
                ? 'SH1 小型旋回フレーム (SH1 Small Swing Frame)'
                : 'PLC Automation Project'}
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-brand-500/10 text-brand-700 border border-brand-500/20">
                IDE ACTIVE
              </span>
            </h2>
            <p className="text-[10px] text-slate-450 font-mono">ID: {id || 'CASE-2026-0245'}</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3.5">
          {/* Active User Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider px-1.5 select-none">
              Kỹ sư:
            </span>
            {(['Linh', 'Kanai', 'AI'] as const).map((user) => (
              <button
                key={user}
                type="button"
                onClick={() => setActiveUser(user)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  activeUser === user
                    ? 'bg-brand-500 text-white font-extrabold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {user}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200" />
          
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>⚙ Cấu hình Quy trình</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* COLUMN 1: LEFT SIDEBAR - Source Documents & Output History (Width: 220px) */}
        <aside className="w-[220px] shrink-0 bg-slate-50/80 border-r border-slate-200 flex flex-col h-full z-10">
          
          {/* Sources List & History Panel (Top, flex-1) */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="border-b border-slate-200 bg-slate-100/50 shrink-0 p-1 flex gap-1">
              <button
                onClick={() => setLeftActiveTab('sources')}
                className={`flex-1 py-1 text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer text-center rounded-lg ${
                  leftActiveTab === 'sources'
                    ? 'bg-white text-brand-700 shadow-3xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tài liệu nguồn
              </button>
              <button
                onClick={() => setLeftActiveTab('history')}
                className={`flex-1 py-1 text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer text-center rounded-lg ${
                  leftActiveTab === 'history'
                    ? 'bg-white text-brand-700 shadow-3xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Lịch sử
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {leftActiveTab === 'sources' ? (
                <>
                  <button onClick={() => setAddSourceOpen(true)} className="w-full flex items-center justify-center gap-1.5 py-2 mb-1 text-[11px] font-bold border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Plus className="w-3 h-3" />Thêm nguồn
                  </button>
                  {sources.map((src) => (
                  <div
                    key={src.id}
                    onClick={() => {
                      setActiveViewerSource(src.id)
                      setHighlightedPhrase(undefined)
                    }}
                    className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-1 hover-lift ${
                      activeViewerSource === src.id
                        ? 'bg-brand-500/10 border-brand-500 shadow-xs text-brand-700 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <FileText className={`w-3 h-3 shrink-0 ${src.selected ? 'text-brand-500' : 'text-slate-400'}`} />
                        <span className={`text-[10px] font-bold truncate ${
                          activeViewerSource === src.id ? 'text-brand-700 font-extrabold' : 'text-slate-800'
                        }`} title={src.title}>
                          {src.title}
                        </span>
                      </div>

                      <input
                        type="checkbox"
                        checked={src.selected}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSourceSelect(src.id)
                        }}
                        className="w-2.5 h-2.5 rounded border-slate-300 bg-white text-brand-500 focus:ring-brand-500 focus:ring-offset-white cursor-pointer shrink-0"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-slate-500 font-semibold font-mono">
                      <span>{src.type}</span>
                      <span>{src.size}</span>
                    </div>
                  </div>
                  ))}
                </>
              ) : (
                historyLogs.length === 0 ? (
                  <div className="text-[10px] text-slate-400 text-center py-6 px-3">
                    Chưa có lịch sử chỉnh sửa nào.
                  </div>
                ) : (
                  historyLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col gap-1 shadow-3xs"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0 ${
                            log.user === 'Linh'
                              ? 'bg-emerald-500'
                              : log.user === 'Kanai'
                              ? 'bg-amber-500'
                              : 'bg-indigo-500'
                          }`}>
                            {log.user[0]}
                          </span>
                          <span className="truncate max-w-[60px]">{log.user}</span>
                        </span>
                        <span className="text-[8px] text-slate-400 font-mono font-bold shrink-0">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-700 leading-normal font-semibold break-words">
                        {log.action}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[7.5px] px-1.5 py-0.2 bg-brand-500/10 text-brand-700 border border-brand-500/20 rounded font-bold font-mono">
                          PHA {log.phaseNum}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>



          {/* Quy trình Nghiệp vụ (Bottom, border-t) */}
          <div className="h-[280px] flex flex-col min-h-0 bg-slate-50/50 border-t border-slate-200">
            <div className="p-3 border-b border-slate-200 bg-slate-100/50 shrink-0">
              <h3 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                Quy trình Nghiệp vụ
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {phases.filter(p => p.isVisible !== false && activatedPhases.includes(p.num)).length === 0 ? (
                <div className="text-[10px] text-slate-400 text-center py-6 px-3 leading-relaxed">
                  Chưa có quy trình nào được kích hoạt. Hãy đặt câu hỏi cho AI để bắt đầu.
                </div>
              ) : (
                phases.filter(p => p.isVisible !== false && activatedPhases.includes(p.num)).map((p) => {
                  const phaseNum = p.num
                  const isActive = activePhase === phaseNum
                  const progress = progressData[phaseNum] ?? 0

                  return (
                    <div
                      key={phaseNum}
                      onClick={() => handlePhaseChange(phaseNum)}
                      className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-2 select-none hover-lift ${
                        isActive
                          ? 'bg-brand-500/10 border-brand-500 shadow-xs text-brand-700 font-bold'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] border transition shrink-0 ${
                          isActive
                            ? 'gradient-primary border-brand-500 text-white shadow-xs'
                            : 'bg-brand-50 border-brand-200 text-brand-600'
                        }`}
                      >
                        {progress === 100 ? '✓' : phaseNum}
                      </div>

                      <div className="text-left min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-[10px] font-bold leading-tight truncate flex-1 ${
                            isActive ? 'text-brand-700 font-extrabold' : 'text-slate-800'
                          }`} title={p.title}>
                            {p.title}
                          </h4>
                          <span className={`font-mono text-[8px] font-bold leading-none shrink-0 ${
                            progress === 100 ? 'text-emerald-600' : 'text-slate-500'
                          }`}>
                            {progress}%
                          </span>
                        </div>
                        {/* Thin progress bar */}
                        <div className="mt-1 h-[2px] bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="bg-brand-500 h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </aside>

        {/* COLUMN 2: CENTER WORKSPACE CANVAS (Width: flex-1) */}
        <main className="flex-1 bg-slate-50/50 flex flex-col h-full min-w-0 relative">
          
          {/* Active Phase Canvas Title Header */}
          <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-5 py-3.5 flex flex-col gap-3.5 flex-none shadow-xs select-none z-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold text-brand-700 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full tracking-wider font-mono">
                      {activePhase !== null ? `${activePhase <= 3 ? 'TRƯỚC NHẬN ĐƠN' : `PHA ${activePhase} · SAU NHẬN ĐƠN`}` : 'DÂY CHUYỀN NGHIỆP VỤ'}
                    </span>
                    <h1 className="text-sm font-extrabold text-slate-900">
                      {activePhase !== null
                        ? phases.find(p => p.num === activePhase)?.title
                        : 'Khu vực chi tiết dự án'}
                    </h1>
                  </div>
                  {activePhase !== null ? (
                    <p className="mt-0.5 text-xs text-slate-500 leading-normal">
                      {phases.find(p => p.num === activePhase)?.desc}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-slate-500 leading-normal">
                      Hệ thống thiết kế tự động hóa từ khảo sát đến sinh mã lệnh PLC. Hãy chọn bước hoặc gửi câu hỏi để bắt đầu.
                    </p>
                  )}
                </div>
              </div>

              {activePhase !== null && (
                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono shrink-0">
                  <span className="font-semibold bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-3xs">
                    Tiến độ dự án: <strong className="font-bold text-brand-600">{projectProgress}%</strong>
                  </span>
                  <span className="text-[10px] text-slate-400">Bước/Pha {activePhase}: {progressData[activePhase] ?? 0}%</span>
                </div>
              )}
            </div>

            {/* Progress Stepper Timeline */}
            {isPreSales ? null : (
              /* ===== Stepper tuyến tính sau nhận đơn (7→13) ===== */
              <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between w-full max-w-5xl mx-auto px-4 select-none">
                {stepperSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isCompleted = step.order < activeStepIndex;
                  const isActive = step.order === activeStepIndex;
                  const isFuture = step.order > activeStepIndex || activeStepIndex === 0;

                  return (
                    <div key={step.order} className="flex items-center flex-1 last:flex-none">
                      {/* Step node */}
                      <div
                        onClick={() => {
                          const targetPhase = step.phases[0];
                          handlePhaseChange(targetPhase);
                        }}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group relative"
                      >
                        <div className="relative">
                          {isCompleted && (
                            <div className="w-8 h-8 rounded-full bg-brand-500 border border-brand-500 flex items-center justify-center text-white shadow-sm transition-all duration-300 group-hover:scale-110">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}

                          {isActive && (
                            <div className="relative flex items-center justify-center">
                              {/* Outer pulsating ring */}
                              <div className="absolute -inset-1 rounded-full bg-brand-500/25 animate-pulse" />
                              <div className="relative w-8 h-8 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-brand-600 shadow-md transition-all duration-300 group-hover:scale-105">
                                <StepIcon className="w-4 h-4 text-brand-500 animate-pulse" />
                              </div>
                            </div>
                          )}

                          {isFuture && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 transition-all duration-300 group-hover:border-slate-350 group-hover:bg-slate-50">
                              <StepIcon className="w-4 h-4 text-slate-400/80" />
                            </div>
                          )}
                        </div>

                        {/* Label text */}
                        <span
                          className={`text-[10.5px] font-bold transition-all duration-200 whitespace-nowrap ${
                            isActive
                              ? 'text-brand-600 font-extrabold text-shadow-sm'
                              : isCompleted
                              ? 'text-slate-800'
                              : 'text-slate-450 font-medium group-hover:text-slate-600'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>

                      {/* Connection line */}
                      {idx < stepperSteps.length - 1 && (
                        <div className="flex-1 mx-4 h-[2px] relative -top-3.5">
                          <div
                            className={`absolute inset-0 rounded-full transition-all duration-500 ${
                              step.order < activeStepIndex
                                ? 'bg-brand-500 shadow-sm'
                                : 'bg-slate-200'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Component Canvas Rendering */}
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <div key={activeRightTab ?? 'empty'} className="animate-fade-in-up">
              {activePhase === null ? (
                <div className="max-w-5xl mx-auto h-full flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-xs">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 font-mono">Chưa có output</h2>
                    <p className="mt-2 text-sm text-slate-600">Khu vực chi tiết dự án sẽ hiển thị nội dung khi bạn nhập câu hỏi phía bên phải.</p>
                    <p className="mt-4 text-xs text-slate-400 font-mono">Mở rộng AI chatbot nếu cần và gửi câu hỏi để bắt đầu.</p>
                  </div>
                </div>
              ) : activeRightTab === 'reentry' && (
                <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                  <ProjectReentry
                    currentUser={activeUser}
                    onProgressChange={handleProgress7}
                    onAddLog={(action) => addLog(action, 7)}
                  />
                </div>
              )}

              {activeRightTab === 'caseinput' && (
                <CaseInput
                  mode={pre.round > 1 ? 'reentry' : 'initial'}
                  pre={pre}
                  onConvertToSource={addSourceFromNote}
                  onToast={(m) => addLog(m, activePhase ?? 1)}
                  onAdvance={() => handlePhaseChange(2)}
                />
              )}

              {activeRightTab === 'review' && (
                <ReviewStep pre={pre} onAdvance={() => handlePhaseChange(3)} />
              )}

              {activeRightTab === 'proposal' && (
                <ProposalStep
                  pre={pre}
                  onToast={(m) => addLog(m, activePhase ?? 3)}
                  onAccept={() => { addLog('Đã nhận đơn hàng — chuyển sang giai đoạn sau nhận đơn', 7); handlePhaseChange(7) }}
                />
              )}

              {activeRightTab === 'doc' && (
                <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                  <DocumentGenerator 
                    onProgressChange={handleProgress13}
                  />
                </div>
              )}

              {activeRightTab === 'cad' && (
                <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-panel animate-in fade-in duration-300">
                  <CadViewer 
                    locale={locale} 
                    currentUser={activeUser}
                    onProgressChange={handleProgress12}
                  />
                </div>
              )}

              {activeRightTab === 'gen' && (
                <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-panel animate-in fade-in duration-300">
                  <FlowchartEditor 
                    locale={locale} 
                    onProgressChange={handleProgress10}
                  />
                </div>
              )}

              {activeRightTab === 'audit' && (
                <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-panel animate-in fade-in duration-300">
                  <LadderAuditor 
                    locale={locale} 
                    onProgressChange={handleProgress11}
                  />
                </div>
              )}

              {activeRightTab === 'notes' && (
                <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 shadow-panel animate-in fade-in duration-300 flex flex-col min-h-[450px] justify-between text-slate-800">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                          Biên bản cuộc họp & Ghi chú (Saved Notes)
                        </h4>
                        <p className="text-[10px] text-slate-500">Giao việc và đính kèm ghi chú bàn giao cho các bên</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">{notes.length} notes</span>
                    </div>

                    {/* Grid of cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className={`p-3.5 rounded-2xl border ${note.color} shadow-panel flex flex-col justify-between gap-4 relative group hover:-translate-y-0.5 duration-200 transition-all`}
                        >
                          <p className="text-xs text-slate-755 leading-relaxed font-sans select-text">
                            {note.content}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500">
                              <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-extrabold text-slate-650">
                                {note.color.includes('emerald') ? 'L' : 'K'}
                              </span>
                              <span>{note.color.includes('emerald') ? 'Linh' : 'Kanai'}</span>
                            </span>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="text-[10px] font-bold text-rose-600 opacity-0 group-hover:opacity-100 hover:text-rose-700 transition cursor-pointer"
                            >
                              Xóa ghi chú
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 mt-5 space-y-2">
                    <textarea
                      rows={2}
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Nhập nội dung biên bản ghi chú mới..."
                      className="w-full p-2.5 text-xs border border-slate-250 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 bg-white text-slate-800"
                    />
                    <button
                      onClick={addNote}
                      disabled={!noteInput.trim()}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lưu ghi chú</span>
                    </button>
                  </div>
                </div>
              )}

              {activeRightTab === 'translate' && (
                <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 shadow-panel space-y-4 animate-in fade-in duration-300 text-slate-800">
                  <div className="border-b border-slate-200 pb-3">
                    <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Dịch thuật chú thích chương trình sang tiếng Việt</h4>
                    <p className="text-[10px] text-slate-450">Pha 9: Thiết kế - dịch chú thích tiếng Nhật trong chương trình điều khiển</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">Chú thích tiếng Nhật gốc (Original Japanese Comment)</label>
                      <textarea
                        rows={6}
                        value={jpText}
                        onChange={(e) => setJpText(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-250 focus:border-brand-500 rounded-xl outline-none bg-white text-slate-800"
                        placeholder="Nhập chú thích tiếng Nhật cần dịch..."
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">Bản dịch Tiếng Việt (Vietnamese Translation Output)</label>
                      <textarea
                        rows={6}
                        value={viText}
                        onChange={(e) => setViText(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-250 focus:border-brand-500 rounded-xl outline-none bg-white text-slate-800"
                        placeholder="Bản dịch tiếng Việt..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => {
                        if (jpText.trim() === '自動運転シーケンス初期化完了。サーボアンプ電源投入を確認のこと。') {
                          setViText('Khởi tạo chuỗi tự động vận hành hoàn tất. Hãy xác nhận nguồn điện động lực cho Servo Drive.')
                        } else if (!viText.trim()) {
                          setViText('Bản dịch: ' + jpText)
                        }
                        setProgressData(prev => ({ ...prev, 9: 100 }))
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Dịch sang Tiếng Việt →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Split overlay: Renders document viewer if source selected */}
          {activeViewerSource && (
            <div className="absolute top-0 bottom-0 left-0 w-[450px] bg-white shadow-2xl border-r border-slate-250 flex flex-col z-20 animate-in slide-in-from-left duration-300">
              <div className="flex-none p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Đọc tài liệu nguồn (Source Viewer)
                </span>
                <button
                  onClick={() => {
                    setActiveViewerSource(null)
                    setHighlightedPhrase(undefined)
                  }}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-2 py-1 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Đóng
                </button>
              </div>
              <div className="flex-1 p-2 min-h-0">
                <SourceViewer
                  title={sources.find((s) => s.id === activeViewerSource)?.title || 'Tài liệu nguồn'}
                  contentId={activeViewerSource}
                  highlightedPhrase={highlightedPhrase}
                />
              </div>
            </div>
          )}
          {/* Terminal Console Panel is removed, placing logs into the chat instead */}
        </main>

        {/* COLUMN 3: RIGHT SIDEBAR - Collapsible AI Copilot Panel (Width: 420px) */}
        <aside 
          className={`shrink-0 bg-slate-50/90 backdrop-blur-md border-l border-slate-200 flex flex-col h-full z-10 transition-all duration-300 relative ${
            isCopilotExpanded ? 'w-[420px]' : 'w-10'
          }`}
        >
          {isCopilotExpanded ? (
            <>
              {/* Copilot Header */}
              <div className="p-3 border-b border-slate-200 bg-slate-100/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-550" />
                  <span className="text-xs font-mono font-extrabold text-slate-800 uppercase">
                    AI chatbot
                  </span>
                </div>
                <button 
                  onClick={() => setIsCopilotExpanded(false)}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                  title="Thu nhỏ trợ lý"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Context Banner */}
              <div className="px-3.5 py-2.5 bg-brand-500/10 border-b border-brand-500/20 text-[10px] text-brand-700 leading-relaxed select-none">
                {activePhase !== null ? (
                  <>💡 Hỗ trợ: <strong className="font-bold">Pha {activePhase} - {phases.find(p => p.num === activePhase)?.title}</strong>. Đã sẵn sàng xử lý dữ liệu và trả lời câu hỏi của kỹ sư.</>
                ) : (
                  <>💡 Hỗ trợ: Chưa có pha kích hoạt. Nhập câu hỏi để AI chọn giai đoạn phù hợp và hiển thị output.</>
                )}
              </div>

              {/* Chat thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 max-w-full ${
                      msg.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center font-bold text-[9px] shrink-0 shadow-md select-none transition hover:scale-105 duration-200 ${
                        msg.sender === 'ai'
                          ? 'gradient-primary text-white glow-brand font-black'
                          : activeUser === 'Linh'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border border-emerald-400'
                          : activeUser === 'Kanai'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border border-amber-400'
                          : 'bg-gradient-to-br from-indigo-500 to-sky-500 text-white border border-indigo-400'
                      }`}
                    >
                      {msg.sender === 'ai' ? 'AI' : activeUser}
                    </div>

                    <div className="space-y-0.5 max-w-[85%]">
                      {/* Bubble content */}
                      <div
                        className={`p-3 rounded-2xl border leading-relaxed text-xs whitespace-pre-line relative shadow-3xs bubble-ai ${
                          msg.sender === 'ai'
                            ? 'bg-white border-slate-200 text-slate-800'
                            : 'bg-brand-500 border-brand-600 text-white font-medium bubble-user'
                        }`}
                      >
                        {msg.sender === 'ai' ? (
                          <div>
                            {msg.text.split(/(\[\d+\])/g).map((part, index) => {
                              const match = part.match(/\[(\d+)\]/)
                              if (match && msg.citations) {
                                const citNum = parseInt(match[1])
                                const citObj = msg.citations.find((c) => c.id === citNum)
                                if (citObj) {
                                  return (
                                    <span
                                      key={index}
                                      onClick={() => handleCitationClick(citObj)}
                                      className="cite cursor-pointer font-bold mx-0.5 bg-brand-500/10 text-brand-700 border border-brand-500/25 hover:bg-brand-500 hover:text-white px-1 py-0.2 rounded font-mono"
                                    >
                                      {citNum}
                                    </span>
                                  )
                                }
                              }
                              // Render **đậm** (chat dùng text thuần) cho phần không phải trích dẫn
                              return (
                                <span key={index}>
                                  {part.split(/(\*\*[^*]+\*\*)/g).map((seg, j) => {
                                    const b = seg.match(/^\*\*([^*]+)\*\*$/)
                                    return b ? <strong key={j} className="font-semibold text-slate-900">{b[1]}</strong> : <span key={j}>{seg}</span>
                                  })}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span>{msg.text}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions */}


              {/* Suggestions */}
              <div className="p-2 bg-slate-100/60 border-t border-slate-200 flex-none space-y-1">
                <div className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none px-1">
                  <span>💡 Gợi ý câu hỏi tiếp theo</span>
                </div>
                <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {activeSuggestions
                    .filter((prompt) => !askedQuestions.includes(prompt))
                    .map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(prompt)}
                        className="w-full px-2.5 py-1 text-left text-[10px] font-medium text-slate-700 bg-white hover:bg-brand-500/5 hover:text-brand-700 border border-slate-200 hover:border-brand-500/15 rounded-lg transition duration-150 shadow-3xs flex items-center gap-1.5 cursor-pointer group"
                      >
                        <span className="text-[9px] select-none group-hover:scale-110 transition-transform">💬</span>
                        <span className="flex-1 truncate leading-normal">{prompt}</span>
                        <span className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all text-[9px] shrink-0">→</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Chat Composer */}
              <div className="p-3 border-t border-slate-200 bg-slate-50/80 flex-none">
                <form onSubmit={handleSend} className="flex items-center gap-1.5 bg-white border border-slate-250 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 rounded-xl p-1 transition">
                  <textarea
                    rows={1}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Đặt câu hỏi cho AI Copilot..."
                    className="flex-1 bg-transparent text-xs focus:outline-none resize-none py-1 px-1.5 text-slate-800"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(e)
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim()}
                    className="p-1.5 rounded-lg gradient-primary hover:opacity-90 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsCopilotExpanded(true)}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-start pt-6 gap-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition cursor-pointer select-none"
            >
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="writing-vertical font-extrabold text-[10px] uppercase tracking-wider mt-2 font-mono">
                Mở AI chatbot
              </span>
            </button>
          )}
        </aside>

      </div>

      <AddSourceModal open={addSourceOpen} onClose={() => setAddSourceOpen(false)} onAddFiles={handleAddFiles} onAddText={handleAddText} />



      {/* Dynamic Stepper configuration modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-[480px] space-y-4 shadow-pop animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-950 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>⚙ Cấu hình Quy trình Nghiệp vụ</span>
              </h3>
              <button onClick={() => setIsConfigOpen(false)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {phases.map((p) => (
                <div key={p.num} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={p.isVisible !== false}
                      onChange={() => {
                        setPhases(phases.map(item => item.num === p.num ? { ...item, isVisible: !item.isVisible } : item))
                      }}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-brand-500 focus:ring-brand-500 focus:ring-offset-white cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-mono font-bold text-slate-500 mr-1.5">Pha {p.num}</span>
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => {
                          setPhases(phases.map(item => item.num === p.num ? { ...item, title: e.target.value } : item))
                        }}
                        className="font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none focus:bg-slate-100 px-1 py-0.5 rounded"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-mono uppercase">{p.tab}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 text-xs">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                Hoàn tất cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
