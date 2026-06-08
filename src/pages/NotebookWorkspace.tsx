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
  Cpu,
  FolderOpen,
  Download,
  RefreshCw,
  Globe2
} from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'
import { LOCALES, LANG_META } from '@/i18n/types'

// Import components
import CadViewer from '@/components/CadViewer'
import FlowchartEditor from '@/components/FlowchartEditor'
import SourceViewer from '@/components/SourceViewer'
import ProjectReentry from '@/components/ProjectReentry'
import DocumentGenerator from '@/components/DocumentGenerator'
import CaseInput from '@/components/CaseInput'
import ReviewStep from '@/components/ReviewStep'
import ProposalStep from '@/components/ProposalStep'
import AddSourceModal from '@/components/AddSourceModal'
import SmartMaterialsTable from '@/components/SmartMaterialsTable'
import DebugCodeStep, { DEFAULT_ST_CODE, COMPACT_ST_CODE } from '@/components/DebugCodeStep'
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

interface PhaseDetail {
  num: number
  title: string
  desc: string
  prompts: string[]
  tab: 'audio' | 'cad' | 'gen' | 'audit' | 'translate' | 'notes' | 'reentry' | 'doc' | 'caseinput' | 'review' | 'proposal' | 'materials' | 'design_code' | 'debug_code'
  sourcesToSelect: string[]
  inputs: string[]
  outputs: string[]
  users: string
  note?: string
}

const phasesInfo: PhaseDetail[] = [
  // PRE-SALES = chu trình lặp 3 hoạt động (Nhập/Sửa → Kiểm tra → Dự toán)
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
  // POST-SALES = 5 bước tuyến tính (Phases 7, 8, 9, 10, 11)
  {
    num: 7,
    title: 'Tiếp nhận & Khảo sát',
    desc: 'Nhập thông số thiết bị thực tế sau đơn hàng và đối chiếu chênh lệch specs.',
    prompts: [
      'Nhập lại chênh lệch thông số dự án sau khi nhận đơn hàng.',
      'Xác nhận nội dung dự án mới và chênh lệch.',
    ],
    tab: 'reentry',
    sourcesToSelect: ['spec'],
    inputs: ['Câu hỏi', 'Nhập thông tin chênh lệch'],
    outputs: ['Đối chiếu specs chênh lệch'],
    users: 'Kỹ sư dự án',
  },
  {
    num: 8,
    title: 'Họp Kick-off',
    desc: 'Bàn giao thông tin dự án, ghi chú kỹ thuật và biên bản họp cho các bên.',
    prompts: [
      'Soạn biên bản Kick-off bàn giao dự án.',
      'Xem danh sách ghi chú cuộc họp kick-off.',
    ],
    tab: 'notes',
    sourcesToSelect: ['spec', 'flow'],
    inputs: ['Ý kiến đóng góp'],
    outputs: ['Ghi chú bàn giao'],
    users: 'Kỹ sư & Người phụ trách',
  },
  {
    num: 9,
    title: 'Điều chỉnh vật tư',
    desc: 'Điều chỉnh thiết bị, số lượng và đơn giá thông minh qua lại giữa Chat và Bảng vật tư. Lịch sử lưu tại Thư viện.',
    prompts: [
      'Thêm 2 cảm biến quang',
      'Nâng cấp lên HMI GOT2000 10-inch',
      'Bổ sung 1 trục Servo Motor'
    ],
    tab: 'materials',
    sourcesToSelect: ['spec'],
    inputs: ['Yêu cầu điều chỉnh'],
    outputs: ['Bảng vật tư thông minh V2'],
    users: 'Kỹ sư thiết kế / Sales',
  },
  {
    num: 10,
    title: 'Thiết kế & Code tự động',
    desc: 'Tự động tạo bản vẽ sơ đồ mạch CAD và sinh mã Structured Text (ST) dựa trên tri thức quy chuẩn.',
    prompts: [
      'Xem bản vẽ sơ đồ đấu nối CAD.',
      'Xem mã lệnh PLC Structured Text (ST).',
      'Tải về mã nguồn & bản vẽ thiết kế.'
    ],
    tab: 'design_code',
    sourcesToSelect: ['spec', 'flow', 'cad'],
    inputs: ['Quy chuẩn thiết kế'],
    outputs: ['Bản vẽ CAD (.dwg)', 'Mã Structured Text PLC (.l5k)'],
    users: 'AI Assistant / Kỹ sư',
  },
  {
    num: 12,
    title: 'Debug & Hiệu chỉnh Code',
    desc: 'Chỉnh sửa trực tiếp mã PLC ST, kiểm tra lỗi cú pháp và tối ưu hóa code bằng AI.',
    prompts: [
      'Kiểm tra lỗi cú pháp mã PLC.',
      'Tối ưu hóa mã PLC ST (Paraphrase).',
      'Thêm còi báo động vào code.'
    ],
    tab: 'debug_code',
    sourcesToSelect: ['spec', 'flow', 'cad'],
    inputs: ['PLC ST Code', 'Yêu cầu hiệu chỉnh'],
    outputs: ['Mã PLC ST đã hiệu chỉnh'],
    users: 'Kỹ sư / AI Assistant',
  },
  {
    num: 11,
    title: 'Nghiệm thu & HDSD',
    desc: 'Tạo tài liệu hướng dẫn vận hành thiết bị HMI và biên bản kiểm tra nghiệm thu hoàn chỉnh.',
    prompts: [
      'Soạn tài liệu nghiệm thu / hướng dẫn sử dụng',
      'Tải Biên bản nghiệm thu.docx',
      'Tải Hướng dẫn vận hành HMI.pdf'
    ],
    tab: 'doc',
    sourcesToSelect: ['spec', 'cad'],
    inputs: ['Kết quả kiểm tra', 'Thông tin vận hành'],
    outputs: ['Biên bản nghiệm thu', 'Tài liệu hướng dẫn sử dụng HMI'],
    users: 'Khách hàng / SE',
  }
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
    case 'status.debug': return 12
    case 'status.onsite': case 'status.done': return 11
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
  const { t, tf, locale, setLocale } = useI18n()
  const phaseTitle = (num: number | null | undefined) => (num != null ? t(`ws.phase.${num}.title`) : '')
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
  const [activatedPhases, setActivatedPhases] = useState<number[]>(() => {
    if (initialPhase <= 3) return [initialPhase]
    const postSalesOrder = [7, 8, 9, 10, 12, 11]
    const idx = postSalesOrder.indexOf(initialPhase)
    if (idx === -1) return [initialPhase]
    return postSalesOrder.slice(0, idx + 1)
  })
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isCopilotExpanded, setIsCopilotExpanded] = useState(true)

  // Progress data state
  const [progressData, setProgressData] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0,
    7: 60,
    8: 40,
    9: 50,
    10: 80,
    12: 50,
    11: 30,
  })

  const [materialsVersion, setMaterialsVersion] = useState(0)
  const [kickoffText, setKickoffText] = useState('')
  const [designSubTab, setDesignSubTab] = useState<'cad' | 'code'>('cad')
  const KICKOFF_STORAGE_KEY = `aiplf.kickoff_notes_text.${id || 'default'}`

  useEffect(() => {
    const handleStorageChange = () => {
      setMaterialsVersion(prev => prev + 1)
      const storedKickoff = localStorage.getItem(KICKOFF_STORAGE_KEY)
      if (storedKickoff) setKickoffText(storedKickoff)
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [KICKOFF_STORAGE_KEY])

  // Pre-sales NV1 state (mô phỏng, lưu localStorage theo case)
  const pre = usePresalesState(id || 'default')
  const [addSourceOpen, setAddSourceOpen] = useState(false)

  // Tiến độ TỔNG dự án (đồng bộ với card ngoài dashboard); dự án mới chưa có số → theo tiến độ nhập liệu
  const projectProgress = providedProgress != null ? providedProgress : pre.progressPct

  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([
    'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
    'Chuyển sang Bước 2: Họp Kick-off',
    'Chuyển sang Bước 3: Điều chỉnh vật tư',
    'Chuyển sang Bước 4: Thiết kế & Code tự động',
    'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
    'Chuyển sang Bước 6: Nghiệm thu & HDSD'
  ])

  const suggestionResponses: Record<string, {
    phaseNum: number
    explanationText: string
    suggestions: string[]
    citations?: { id: number; sourceId: string; phrase?: string; tab?: string }[]
  }> = {
    'Chuyển sang Bước 1: Tiếp nhận & Khảo sát': {
      phaseNum: 7,
      explanationText: 'Đã chuyển sang Bước 1: Tiếp nhận & Khảo sát. Giao diện nhật ký khao_sat_thay_doi_specs.txt đã được hiển thị ở bên trái.',
      suggestions: [
        'Có thay đổi gì về số lượng động cơ hay PLC?',
        'Xem chi tiết thông số chênh lệch Melsec Q?',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'reentry' }],
    },
    'Chuyển sang Bước 2: Họp Kick-off': {
      phaseNum: 8,
      explanationText: 'Đã chuyển sang Bước 2: Họp Kick-off. Giao diện biên bản bien_ban_kickoff_ban_giao.txt đã được hiển thị ở bên trái.',
      suggestions: [
        'Soạn biên bản Kick-off bàn giao dự án',
        'Xem danh sách ghi chú cuộc họp kick-off.',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'notes' }],
    },
    'Chuyển sang Bước 3: Điều chỉnh vật tư': {
      phaseNum: 9,
      explanationText: 'Đã chuyển sang Bước 3: Điều chỉnh vật tư. Bảng vật tư thông minh đã hiển thị ở bên trái.',
      suggestions: [
        'Thêm 2 cảm biến quang',
        'Nâng cấp màn hình HMI',
        'Bổ sung 1 trục Servo Motor',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'materials' }],
    },
    'Chuyển sang Bước 4: Thiết kế & Code tự động': {
      phaseNum: 10,
      explanationText: 'Đã chuyển sang Bước 4: Thiết kế & Code tự động. AI đã sinh bản vẽ CAD và Structured Text.',
      suggestions: [
        'Xem sơ đồ bản vẽ CAD & mã Structured Text',
        'Tải về mã nguồn & bản vẽ thiết kế',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'cad', tab: 'design_code' }],
    },
    'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code': {
      phaseNum: 12,
      explanationText: 'Đã chuyển sang Bước 5: Debug & Hiệu chỉnh Code. Tại đây bạn có thể chỉnh sửa trực tiếp mã Structured Text (ST) của PLC, chạy kiểm tra lỗi biên dịch, và yêu cầu AI paraphrase/tối ưu hóa chương trình.',
      suggestions: [
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Tối ưu hóa mã PLC ST (Paraphrase).',
        'Thêm còi báo động vào code.',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'debug_code' }],
    },
    'Chuyển sang Bước 6: Nghiệm thu & HDSD': {
      phaseNum: 11,
      explanationText: 'Đã chuyển sang Bước 6: Nghiệm thu & HDSD. Bạn có thể tải các file tài liệu hướng dẫn và nghiệm thu.',
      suggestions: [
        'Soạn tài liệu nghiệm thu / hướng dẫn sử dụng',
        'Tải Biên bản nghiệm thu.docx',
        'Tải Hướng dẫn vận hành HMI.pdf',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'doc' }],
    },
    'Nhập lại chênh lệch thông số dự án sau khi nhận đơn hàng': {
      phaseNum: 7,
      explanationText: 'Đã chuyển sang Bước 1: Tiếp nhận & Khảo sát. Giao diện nhật ký khao_sat_thay_doi_specs.txt đã được hiển thị ở bên trái.',
      suggestions: [
        'Có thay đổi gì về số lượng động cơ hay PLC?',
        'Xem chi tiết thông số chênh lệch Melsec Q?',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'reentry' }],
    },
    'Xem chi tiết thông số chênh lệch Melsec Q?': {
      phaseNum: 7,
      explanationText: 'Nhật ký khảo sát ghi nhận cấu hình cũ dùng PLC FX5U (Compact) và cấu hình mới nâng cấp lên PLC Q03UDE (Module) cùng màn hình GOT2000 10-inch. Bản vẽ CAD và Mã PLC ST ở Bước 4 đã tự động cập nhật theo cấu hình mới này.',
      suggestions: [
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'reentry' }],
    },
    'Soạn biên bản Kick-off bàn giao dự án': {
      phaseNum: 8,
      explanationText: 'Đã chuyển sang Bước 2: Họp Kick-off. Tôi đã lập danh sách ghi chú bàn giao dự án và chuẩn bị sẵn biên bản cuộc họp.',
      suggestions: [
        'Xem danh sách ghi chú cuộc họp kick-off.',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'notes' }],
    },
    'Xem danh sách ghi chú cuộc họp kick-off.': {
      phaseNum: 8,
      explanationText: 'Dưới đây là các ghi chú kỹ thuật quan trọng trong Biên bản họp Kick-off (hiển thị ở khung bên trái):\n- Cần kiểm tra lại nguồn cấp AC200V 3 pha cho các Servo Drive tại nhà xưởng.\n- Bản vẽ CAD mạch lực cần tách biệt dây động lực và dây tín hiệu cảm biến để chống nhiễu.',
      suggestions: [
        'Soạn biên bản Kick-off bàn giao dự án',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'notes' }],
    },
    'Thêm 2 cảm biến quang': {
      phaseNum: 9,
      explanationText: 'Đã chuyển sang Bước 3: Điều chỉnh vật tư. Đang tiến hành tăng số lượng Cảm biến quang điện (Photoelectric Sensor) thêm 2 cái.',
      suggestions: [
        'Nâng cấp màn hình HMI',
        'Bổ sung 1 trục Servo Motor',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'materials' }],
    },
    'Nâng cấp màn hình HMI': {
      phaseNum: 9,
      explanationText: 'Đã chuyển sang Bước 3: Điều chỉnh vật tư. Đang thay đổi cấu hình màn hình HMI sang GOT2000 10-inch và áp dụng giá trị mặc định của Master Data.',
      suggestions: [
        'Thêm 2 cảm biến quang',
        'Bổ sung 1 trục Servo Motor',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'materials' }],
    },
    'Bổ sung 1 trục Servo Motor': {
      phaseNum: 9,
      explanationText: 'Đã chuyển sang Bước 3: Điều chỉnh vật tư. Đang tiến hành bổ sung thêm 1 trục Servo Motor (MR-J5-40A) cho cơ cấu băng tải nạp phôi phụ.',
      suggestions: [
        'Thêm 2 cảm biến quang',
        'Nâng cấp màn hình HMI',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'materials' }],
    },
    'Xem sơ đồ bản vẽ CAD & mã Structured Text': {
      phaseNum: 10,
      explanationText: 'Đã chuyển sang Bước 4: Thiết kế & Code tự động. AI đã xử lý ngầm và sinh bản vẽ CAD đấu dây cùng mã Structured Text (ST) tuân thủ quy tắc E-stop KA1 và khởi tạo Servo. Bạn có thể xem trực tiếp hoặc tải về.',
      suggestions: [
        'Tải về mã nguồn & bản vẽ thiết kế',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'cad', tab: 'design_code' }],
    },
    'Tải về mã nguồn & bản vẽ thiết kế': {
      phaseNum: 10,
      explanationText: 'Mã nguồn PLC và Bản vẽ điện CAD đã sẵn sàng. Vui lòng bấm vào các nút Tải Bản vẽ CAD (.dwg) hoặc Tải Mã PLC (.l5k) ở thanh công cụ canvas để tải về.',
      suggestions: [
        'Xem sơ đồ bản vẽ CAD & mã Structured Text',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'cad', tab: 'design_code' }],
    },
    'Kiểm tra lỗi cú pháp mã PLC.': {
      phaseNum: 12,
      explanationText: 'Đang tiến hành chạy trình biên dịch kiểm định cú pháp PLC... Phát hiện 0 lỗi cú pháp! Tất cả các khối lệnh (Emergency Stop KA1, Axis Move, AI Quality scans) đều tuân thủ định dạng IEC 61131-3.',
      suggestions: [
        'Tối ưu hóa mã PLC ST (Paraphrase).',
        'Thêm còi báo động vào code.',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'debug_code' }],
    },
    'Tối ưu hóa mã PLC ST (Paraphrase).': {
      phaseNum: 12,
      explanationText: 'Tôi đã tối ưu hóa mã PLC ST (Paraphrase) sang cấu trúc máy trạng thái `CASE..OF` gọn đẹp hơn, giúp cải thiện tốc độ xử lý vòng quét của CPU PLC Melsec. Màn hình biên soạn đã cập nhật chương trình mới.',
      suggestions: [
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Thêm còi báo động vào code.',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'debug_code' }],
    },
    'Thêm còi báo động vào code.': {
      phaseNum: 12,
      explanationText: 'Đã thêm biến `ALARM_SIREN : BOOL` và gán `ALARM_SIREN := TRUE;` trong bước phát hiện sản phẩm lỗi NG (Bước 5b). Hệ thống còi báo sẽ tự động bật khi có phôi lỗi và tắt khi cổng đẩy mở xong.',
      suggestions: [
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Tối ưu hóa mã PLC ST (Paraphrase).',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'debug_code' }],
    },
    'Soạn tài liệu nghiệm thu / hướng dẫn sử dụng': {
      phaseNum: 11,
      explanationText: 'Đã chuyển sang Bước 6: Nghiệm thu & HDSD. Tôi đã tự động biên soạn các tài liệu kỹ thuật hoàn chỉnh: \n\n📄 [Biên bản nghiệm thu.docx]\n📄 [Hướng dẫn vận hành HMI.pdf]\n\nBạn có thể tải trực tiếp ở khung bên cạnh hoặc gõ yêu cầu cụ thể.',
      suggestions: [
        'Tải Biên bản nghiệm thu.docx',
        'Tải Hướng dẫn vận hành HMI.pdf',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'doc' }],
    },
    'Tải Biên bản nghiệm thu.docx': {
      phaseNum: 11,
      explanationText: 'Đang tải file Biên bản nghiệm thu.docx (45 KB) về máy của bạn...',
      suggestions: [
        'Tải Hướng dẫn vận hành HMI.pdf',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'doc' }],
    },
    'Tải Hướng dẫn vận hành HMI.pdf': {
      phaseNum: 11,
      explanationText: 'Đang tải file Hướng dẫn vận hành HMI.pdf (1.1 MB) về máy của bạn...',
      suggestions: [
        'Tải Biên bản nghiệm thu.docx',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'doc' }],
    }
  }

  const activeRightTab = activePhase !== null ? phases.find((p) => p.num === activePhase)?.tab ?? 'reentry' : null

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
  const handleProgress9 = useCallback((prog: number) => handleProgressChange(9, prog), [handleProgressChange])
  const handleProgress10 = useCallback((prog: number) => handleProgressChange(10, prog), [handleProgressChange])
  const handleProgress12 = useCallback((prog: number) => handleProgressChange(12, prog), [handleProgressChange])
  const handleProgress11 = useCallback((prog: number) => handleProgressChange(11, prog), [handleProgressChange])

  // Chat message thread
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: t('ws.greeting'),
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

  // Initial Load for Kickoff Text
  useEffect(() => {
    const stored = localStorage.getItem(KICKOFF_STORAGE_KEY)
    if (stored) {
      setKickoffText(stored)
    } else {
      const defaultText = `# BIÊN BẢN HỌP KICK-OFF & BÀN GIAO DỰ ÁN (CASE-2026-0245)
Thời gian: 06/06/2026 09:30 - 10:30
Địa điểm: Phòng họp kỹ thuật / MS Teams
Thành phần tham dự:
- Kanai (Lead SE)
- Linh (Software Engineer)
- AI Assistant (Hỗ trợ Kỹ thuật)

---

## I. THỐNG NHẤT THAY ĐỔI THÔNG SỐ KỸ THUẬT (SPECS)
1. Xác nhận nâng cấp cấu hình PLC điều khiển lên dòng Q03UDE của Mitsubishi (thay thế dòng compact FX5U) để đáp ứng xử lý robot hàn.
2. Thêm 1 trục Servo MR-J5-40A (Trục tay gắp phụ A4) nâng tổng số trục lên 4 trục.
3. Nâng cấp chuẩn an toàn hệ thống lên ISO 13849 PLd, lắp thêm rơ le an toàn Omron G9SE liên khóa tiếp điểm KA1.
4. Nâng cấp màn hình điều khiển HMI GOT2000 từ 7-inch lên 10-inch.

## II. PHÂN CÔNG CÔNG VIỆC & TIẾN ĐỘ BÀN GIAO
1. Linh (Phụ trách Phần mềm):
   - Viết chương trình PLC Structured Text (ST) khởi tạo Servo MR-J5 và tích hợp các liên khóa an toàn.
   - Hạn hoàn thành: 08/06/2026.
   
2. Kanai (Phụ trách Thiết kế Điện):
   - Thiết kế bản vẽ sơ đồ đấu nối CAD mạch lực và mạch điều khiển tủ điện chính.
   - Hạn hoàn thành: 09/06/2026.
   
3. AI Assistant (Trợ lý tự động hóa):
   - Hỗ trợ biên dịch và rà soát lỗi cú pháp mã PLC ST.
   - Tự động sinh tài liệu hướng dẫn vận hành HMI và biên bản nghiệm thu specs.

---
## III. GHI CHÚ KỸ THUẬT QUAN TRỌNG (SAVED NOTES)
- Cần kiểm tra lại nguồn cấp AC200V 3 pha cho các Servo Drive tại nhà xưởng.
- Bản vẽ CAD mạch lực cần tách biệt dây động lực và dây tín hiệu cảm biến để chống nhiễu.`
      setKickoffText(defaultText)
      localStorage.setItem(KICKOFF_STORAGE_KEY, defaultText)
    }
    handleProgressChange(8, 100)
  }, [id, KICKOFF_STORAGE_KEY])

  const [isDownloadingKickoff, setIsDownloadingKickoff] = useState(false)
  const downloadKickoffText = () => {
    setIsDownloadingKickoff(true)
    setTimeout(() => {
      setIsDownloadingKickoff(false)
      const element = document.createElement("a")
      const file = new Blob([kickoffText], {type: 'text/plain;charset=utf-8'})
      element.href = URL.createObjectURL(file)
      element.download = "bien_ban_kickoff_ban_giao.txt"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      addLog('Đã tải xuống Biên bản Kick-off: bien_ban_kickoff_ban_giao.txt', 8)
    }, 1000)
  }

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
      setActiveSuggestions([
        'Có thay đổi gì về số lượng động cơ hay PLC?',
        'Xem chi tiết thông số chênh lệch Melsec Q?',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ])
    } else if (activePhase === 8) {
      setActiveSuggestions([
        'Soạn biên bản Kick-off bàn giao dự án',
        'Xem danh sách ghi chú cuộc họp kick-off.',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ])
    } else if (activePhase === 9) {
      setActiveSuggestions([
        'Thêm 2 cảm biến quang',
        'Nâng cấp màn hình HMI',
        'Bổ sung 1 trục Servo Motor',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ])
    } else if (activePhase === 10) {
      setActiveSuggestions([
        'Xem sơ đồ bản vẽ CAD & mã Structured Text',
        'Tải về mã nguồn & bản vẽ thiết kế',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ])
    } else if (activePhase === 12) {
      setActiveSuggestions([
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Tối ưu hóa mã PLC ST (Paraphrase).',
        'Thêm còi báo động vào code.',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ])
    } else if (activePhase === 11) {
      setActiveSuggestions([
        'Soạn tài liệu nghiệm thu / hướng dẫn sử dụng',
        'Tải Biên bản nghiệm thu.docx',
        'Tải Hướng dẫn vận hành HMI.pdf',
        'Chuyển sang Bước 1: Tiếp nhận & Khảo sát',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Điều chỉnh vật tư',
        'Chuyển sang Bước 4: Thiết kế & Code tự động',
        'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code'
      ])
    }
  }, [activePhase])
  // Translation board states

  // Design Phase 9 States

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
    if (mm) { pre.addField(mm[1].trim(), mm[2].trim()); pushChat(text, `✓ Đã ghi nhớ ${mm[1].trim()}: ${mm[2].trim()}`, PRE_SUGG); return }
    // ý định sinh đầu ra
    let genMsg = ''
    if (text === 'Soạn nội dung tài liệu dự toán') { pre.generate('doc'); genMsg = ' Đã sinh Nội dung tài liệu dự toán ✓.' }
    else if (text === 'Mô tả cấu thành hệ thống (đơn giản)') { pre.generate('config'); genMsg = ' Đã sinh Cấu thành hệ thống (đơn giản) ✓.' }
    else if (text === 'Lập dự toán khái quát') { pre.generate('estimate'); genMsg = ' Đã sinh Dự toán khái quát ✓.' }
    else if (text === 'Lập lịch trình khái quát') { pre.generate('schedule'); genMsg = ' Đã sinh Lịch trình khái quát ✓.' }
    else if (text === 'Soạn tài liệu nền đề xuất') { pre.generate('proposal'); genMsg = ' Đã sinh Tài liệu nền đề xuất ✓.' }
    else if (/dự toán|báo giá|estimate/i.test(text)) { pre.generate('estimate'); genMsg = ' Đã sinh Dự toán khái quát ✓ (xem ở "Đã tạo").' }
    else if (/lịch trình|timeline|schedule/i.test(text)) { pre.generate('schedule'); genMsg = ' Đã sinh Lịch trình khái quát ✓.' }
    else if (/cấu thành/i.test(text)) { pre.generate('config'); genMsg = ' Đã sinh Cấu thành đơn giản ✓.' }
    else if (/tài liệu nền|hồ sơ nền|proposal/i.test(text)) { pre.generate('proposal'); genMsg = ' Đã sinh Tài liệu nền đề xuất ✓.' }
    // trả lời
    let aiText: string
    if (/tóm tắt|xem dữ liệu|dữ liệu đã|đã ghi|nhớ gì|thông tin dự án/i.test(text)) {
      aiText = 'Dữ liệu dự án mình đang ghi nhớ:\n' + pre.summaryText()
    } else {
      const added = pre.rememberFromContent(text)
      aiText = added.length ? `Mình đã ghi nhớ thêm: ${added.join(', ')}. Gõ "tóm tắt dự án" để xem toàn bộ.` : 'Đã hiểu. Bạn kể thêm chi tiết, hoặc gõ "tóm tắt dự án" để xem mình đang nhớ gì.'
    }
    pushChat(text, (aiText + genMsg).trim(), PRE_SUGG)
  }

  const parseChatForMaterials = (chatText: string) => {
    const text = chatText.toLowerCase();
    let matchedKeyword = '';
    let quantityChange = 0;
    
    if (text.includes('cảm biến quang') || text.includes('quang điện') || text.includes('photoelectric')) {
      matchedKeyword = 'photoelectric';
    } else if (text.includes('tiệm cận') || text.includes('proximity')) {
      matchedKeyword = 'proximity';
    } else if (text.includes('servo') || text.includes('động cơ')) {
      matchedKeyword = 'mr-j5';
    } else if (text.includes('plc') || text.includes('cpu')) {
      matchedKeyword = 'q03ude';
    } else if (text.includes('hmi') || text.includes('màn hình')) {
      matchedKeyword = 'got2000';
    } else if (text.includes('nguồn') || text.includes('power')) {
      matchedKeyword = 'power';
    } else if (text.includes('rơ le') || text.includes('safety')) {
      matchedKeyword = 'safety';
    } else if (text.includes('cáp') || text.includes('phụ kiện') || text.includes('accessories')) {
      matchedKeyword = 'cable';
    }
    
    const qtyMatch = text.match(/(?:thêm|bớt|tăng|giảm|nâng|hạ)?\s*(\d+)\s*(?:cái|bộ|lô|chiếc)?/);
    if (qtyMatch) {
      quantityChange = parseInt(qtyMatch[1]);
      if (text.includes('bớt') || text.includes('giảm') || text.includes('hạ')) {
        quantityChange = -quantityChange;
      }
    } else if (text.includes('thêm') || text.includes('tăng')) {
      quantityChange = 1;
    } else if (text.includes('bớt') || text.includes('giảm')) {
      quantityChange = -1;
    }
    
    return { matchedKeyword, quantityChange };
  }

  const sendMessagePrompt = (text: string) => {
    // Trong luồng pre-sales (bước 1→6): xử lý riêng (mô phỏng), không dùng router post-order
    if (activePhase !== null && activePhase <= 3) { handlePresalesChat(text); return }

    const preset = suggestionResponses[text]
    if (preset) {
      const isMaterialChange = text === 'Thêm 2 cảm biến quang' || text === 'Nâng cấp màn hình HMI' || text === 'Bổ sung 1 trục Servo Motor'
      if (!isMaterialChange) {
        let matchedPhaseNum = preset.phaseNum
        let explanationText = preset.explanationText
        let suggestions = preset.suggestions
        let phaseCitations = preset.citations ?? []

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

        // Cập nhật code trong localStorage nếu chọn gợi ý liên quan
        const codeKey = `aiplf.plc_st_code.${id || 'default'}`
        if (text === 'Tối ưu hóa mã PLC ST (Paraphrase).') {
          localStorage.setItem(codeKey, COMPACT_ST_CODE)
          window.dispatchEvent(new Event('storage'))
        } else if (text === 'Thêm còi báo động vào code.') {
          const currentCode = localStorage.getItem(codeKey) || DEFAULT_ST_CODE
          if (!currentCode.includes('ALARM_SIREN := TRUE')) {
            const searchStr = 'DISCHARGE_NG_GATE := TRUE;'
            if (currentCode.includes(searchStr)) {
              const updated = currentCode.replace(searchStr, 'DISCHARGE_NG_GATE := TRUE;\n  ALARM_SIREN := TRUE; // Còi hú báo động sự cố sản phẩm lỗi')
              localStorage.setItem(codeKey, updated)
              window.dispatchEvent(new Event('storage'))
            }
          }
        }

        if (matchedPhaseNum !== activePhase) {
          handlePhaseChange(matchedPhaseNum)
        }
        return
      }
    }
    
    // AI Chat interceptor for Step 1 (Phase 7 - Tiếp nhận & Khảo sát text document updates)
    if (activePhase === 7) {
      const queryLower = text.toLowerCase()
      let updatedNote = ''
      let shouldUpdate = false
      
      if (queryLower.includes('plc') || queryLower.includes('melsec')) {
        updatedNote = `\n- * [Cập nhật từ AI Chat]: Đã chuyển đổi dòng bộ điều khiển sang dòng cao cấp Melsec Q03UDE phục vụ robot hàn.`
        shouldUpdate = true
      } else if (queryLower.includes('servo') || queryLower.includes('trục')) {
        updatedNote = `\n- * [Cập nhật từ AI Chat]: Bổ sung thêm 1 trục Servo Motor A4 (MR-J5-40A) cho băng tải nạp phôi phụ.`
        shouldUpdate = true
      } else if (queryLower.includes('cảm biến quang') || queryLower.includes('quang')) {
        updatedNote = `\n- * [Cập nhật từ AI Chat]: Tăng số lượng cảm biến quang điện phân loại phôi lên 8 cái.`
        shouldUpdate = true
      } else if (queryLower.includes('rơ le') || queryLower.includes('an toàn') || queryLower.includes('safety')) {
        updatedNote = `\n- * [Cập nhật từ AI Chat]: Nâng cấp tiêu chuẩn an toàn lên ISO 13849 PLd, lắp thêm rơ le an toàn Omron G9SE.`
        shouldUpdate = true
      } else if (queryLower.includes('hmi') || queryLower.includes('màn hình')) {
        updatedNote = `\n- * [Cập nhật từ AI Chat]: Đổi kích thước màn hình GOT2000 từ 7-inch lên 10-inch.`
        shouldUpdate = true
      }

      if (shouldUpdate) {
        try {
          const storedText = localStorage.getItem(`aiplf.project_reentry_text.${id}`)
          const baseText = storedText || `# NHẬT KÝ KHẢO SÁT HIỆN TRƯỜNG & THAY ĐỔI SPECS (CASE-2026-0245)`
          const newText = baseText + `\n\n[HẠNG MỤC CẬP NHẬT TỪ CHAT ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]:` + updatedNote
          localStorage.setItem(`aiplf.project_reentry_text.${id}`, newText)
          localStorage.setItem(`aiplf.project_reentry_synced.${id}`, 'true')
          
          // Also update the materials directly in localStorage
          const materialsKey = `aiplf.materials.${id}`
          const storedMaterials = localStorage.getItem(materialsKey)
          if (storedMaterials) {
            const materialsList = JSON.parse(storedMaterials)
            const updatedMat = materialsList.map((item: any) => {
              if (queryLower.includes('plc') && item.name.includes('PLC')) return { ...item, quantity: 1, unitPrice: 1200 }
              if (queryLower.includes('servo') && item.name.includes('Servo')) return { ...item, quantity: 4 }
              if (queryLower.includes('quang') && item.name.includes('Photoelectric')) return { ...item, quantity: 8 }
              if (queryLower.includes('hmi') && item.name.includes('HMI')) return { ...item, quantity: 1, unitPrice: 850 }
              return item
            })
            localStorage.setItem(materialsKey, JSON.stringify(updatedMat))
          }
          
          window.dispatchEvent(new Event('storage')) // triggers re-render in ProjectReentry & SmartMaterialsTable
          setMaterialsVersion(prev => prev + 1)
          
          const aiResponse = `Tôi đã cập nhật yêu cầu chỉnh sửa của bạn vào Nhật ký khảo sát khao_sat_thay_doi_specs.txt ở khung bên trái. \n\nĐồng thời, cấu hình vật tư liên quan đã được đồng bộ tự động sang Bước 3. Điều chỉnh vật tư. Bạn có thể kiểm tra tệp tin và tiếp tục trao đổi.`
          pushChat(text, aiResponse)
          return
        } catch (e) {
          console.error(e)
        }
      }
    }

    // AI Chat interceptor for Step 2 (Phase 8 - Họp Kick-off meeting minutes updates)
    if (activePhase === 8) {
      try {
        const storedText = localStorage.getItem(KICKOFF_STORAGE_KEY)
        const baseText = storedText || `# BIÊN BẢN HỌP KICK-OFF & BÀN GIAO DỰ ÁN (CASE-2026-0245)`
        const newText = baseText + `\n- [Cập nhật từ AI Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]: ${text}`
        localStorage.setItem(KICKOFF_STORAGE_KEY, newText)
        setKickoffText(newText)
        
        window.dispatchEvent(new Event('storage'))
        
        const aiResponse = `Đã ghi nhận ý kiến đóng góp của bạn và cập nhật vào Biên bản cuộc họp bien_ban_kickoff_ban_giao.txt ở khung bên trái. Các thông tin phân công này đã được đồng bộ.`
        pushChat(text, aiResponse)
        return
      } catch (e) {
        console.error(e)
      }
    }

    // Bidirectional Chat-Table sync for Step 3 (Phase 9)
    if (activePhase === 9) {
      const { matchedKeyword, quantityChange } = parseChatForMaterials(text)
      if (matchedKeyword && quantityChange !== 0) {
        try {
          const stored = localStorage.getItem(`aiplf.materials.${id}`)
          if (stored) {
            const currentList = JSON.parse(stored)
            const updated = currentList.map((item: any) => {
              const matchesName = item.name.toLowerCase().includes(matchedKeyword)
              const matchesCat = item.category.toLowerCase().includes(matchedKeyword)
              if (matchesName || matchesCat) {
                return { ...item, quantity: Math.max(0, item.quantity + quantityChange) }
              }
              return item
            })
            localStorage.setItem(`aiplf.materials.${id}`, JSON.stringify(updated))
            setMaterialsVersion(prev => prev + 1)
            
            const matchedItem = currentList.find((item: any) => 
              item.name.toLowerCase().includes(matchedKeyword) || 
              item.category.toLowerCase().includes(matchedKeyword)
            )
            const itemName = matchedItem ? matchedItem.name : matchedKeyword
            const aiText = `Đã ghi nhận điều chỉnh vật tư từ chat: ${itemName} được ${quantityChange > 0 ? 'tăng thêm' : 'giảm bớt'} ${Math.abs(quantityChange)} cái. \n\nTổng giá trị vật tư đã được cập nhật tương ứng. Phiên bản mới này đã được đồng bộ để lưu lại tại Thư viện.`
            pushChat(text, aiText)
            return
          }
        } catch (e) {
          console.error(e)
        }
      }
    }

    // AI Chat interceptor for Step 5 (Phase 12 - Debug & Hiệu chỉnh Code)
    if (activePhase === 12) {
      const queryLower = text.toLowerCase()
      let explanation = ''
      let shouldUpdate = false
      let updatedCode = ''
      
      const codeKey = `aiplf.plc_st_code.${id || 'default'}`
      const currentCode = localStorage.getItem(codeKey) || DEFAULT_ST_CODE

      if (queryLower.includes('cảnh báo') || queryLower.includes('còi') || queryLower.includes('alarm') || queryLower.includes('siren')) {
        if (!currentCode.includes('ALARM_SIREN := TRUE')) {
          const searchStr = 'DISCHARGE_NG_GATE := TRUE;'
          if (currentCode.includes(searchStr)) {
            updatedCode = currentCode.replace(searchStr, 'DISCHARGE_NG_GATE := TRUE;\n  ALARM_SIREN := TRUE; // Còi hú báo động sự cố sản phẩm lỗi')
            shouldUpdate = true
            explanation = 'Tôi đã tự động cập nhật mã nguồn PLC ST: Thêm còi báo động `ALARM_SIREN := TRUE;` vào bước phân loại sản phẩm lỗi NG (Bước 5b) ở khu soạn thảo bên trái. Bạn có thể chạy kiểm tra cú pháp để xác nhận.'
          } else {
            updatedCode = currentCode + '\n// Cập nhật từ Chat: Còi cảnh báo lỗi\nALARM_SIREN := TRUE;'
            shouldUpdate = true
            explanation = 'Đã thêm logic còi báo động `ALARM_SIREN := TRUE;` vào chương trình. Vui lòng xem ở khung bên trái.'
          }
        } else {
          explanation = 'Mã nguồn hiện tại đã được tích hợp còi báo động lỗi `ALARM_SIREN := TRUE;` tại bước phân loại sản phẩm lỗi NG.'
        }
      } else if (queryLower.includes('tối ưu') || queryLower.includes('paraphrase') || queryLower.includes('state machine') || queryLower.includes('case')) {
        updatedCode = COMPACT_ST_CODE
        shouldUpdate = true
        explanation = 'Tôi đã thực hiện tối ưu hóa (Paraphrase) mã nguồn PLC ST sang dạng State Machine sử dụng cấu trúc `CASE..OF` giúp chương trình gọn nhẹ hơn, giảm dung lượng bộ nhớ PLC và tăng chu kỳ quét vòng quét (scan time).'
      } else if (queryLower.includes('cú pháp') || queryLower.includes('lỗi') || queryLower.includes('debug')) {
        explanation = 'Tôi đã phân tích mã nguồn Structured Text hiện tại. Bạn có thể nhấn trực tiếp nút **Chạy kiểm tra cú pháp** ở cột bên phải để AI biên dịch thử thời gian thực.'
      } else if (queryLower.includes('tạo lỗi') || queryLower.includes('thử lỗi')) {
        if (currentCode.includes('EMERGENCY_STOP := TRUE;')) {
          updatedCode = currentCode.replace('EMERGENCY_STOP := TRUE;', 'EMERGENCY_STOP = TRUE; // Lỗi cú pháp cố ý gán bằng dấu =')
          shouldUpdate = true
          explanation = 'Tôi đã cố ý tạo ra một lỗi cú pháp tại dòng gán biến `EMERGENCY_STOP = TRUE;` (thiếu dấu hai chấm `:` trước dấu `=`). Hãy click nút **Chạy kiểm tra cú pháp** ở bên phải để xem AI phát hiện và đề xuất sửa lỗi nhanh thế nào.'
        }
      }

      if (shouldUpdate) {
        localStorage.setItem(codeKey, updatedCode)
        window.dispatchEvent(new Event('storage'))
        
        const revKey = `aiplf.code_revisions.${id || 'default'}`
        const storedRev = localStorage.getItem(revKey)
        let revList = []
        if (storedRev) revList = JSON.parse(storedRev)
        const newRev = {
          id: `rev-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          desc: text.length > 30 ? text.substring(0, 30) + '...' : text,
          code: updatedCode
        }
        revList.unshift(newRev)
        localStorage.setItem(revKey, JSON.stringify(revList.slice(0, 5)))
        
        pushChat(text, explanation)
        return
      } else if (explanation) {
        pushChat(text, explanation)
        return
      }
    }

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
        desc: 'Đã mở Bước 1: Nhập thông tin dự án (pre-sales). Thêm nguồn ở cột trái hoặc kể về dự án để mình trích dữ liệu; gõ "bổ sung" để mình hỏi từng mục.'
      },
      7: {
        keywords: ['tiếp nhận', 'khảo sát', 'nhập lại', 'reentry', 're-entry', 'chênh lệch', 'đối chiếu', 'so sánh', 'đơn hàng', 'spec', 'specs'], 
        tab: 'reentry', 
        title: 'Tiếp nhận & Khảo sát',
        desc: 'Tôi đã di chuyển màn hình đến Bước 1: Tiếp nhận & Khảo sát để bạn thực hiện đối chiếu chênh lệch thông số thiết bị.' 
      },
      8: { 
        keywords: ['kick-off', 'kickoff', 'bàn giao', 'handover', 'ghi chú', 'biên bản cuộc họp', 'họp', 'notes', 'lưu ghi chú'], 
        tab: 'notes', 
        title: 'Họp Kick-off',
        desc: 'Tôi đã di chuyển màn hình đến Bước 2: Họp Kick-off để bạn theo dõi nội dung ghi chú và biên bản cuộc họp bàn giao.' 
      },
      9: { 
        keywords: ['vật tư', 'vật liệu', 'materials', 'số lượng', 'đơn giá', 'bảng giá', 'điều chỉnh vật tư', 'tăng cảm biến', 'thêm cảm biến', 'nâng cấp hmi'], 
        tab: 'materials', 
        title: 'Điều chỉnh vật tư',
        desc: 'Tôi đã di chuyển màn hình đến Bước 3: Điều chỉnh vật tư. Bạn có thể thay đổi trực tiếp trên bảng vật tư hoặc gõ điều chỉnh vào chat.' 
      },
      10: { 
        keywords: ['thiết kế', 'code', 'structured text', 'st', 'bản vẽ', 'cad', 'dwg', 'sinh code', 'tạo bản vẽ', 'tải về', 'mã plc'], 
        tab: 'design_code', 
        title: 'Thiết kế & Code tự động',
        desc: 'Tôi đã di chuyển màn hình đến Bước 4: Thiết kế & Code tự động để hiển thị bản vẽ CAD cùng mã lệnh PLC Structured Text.' 
      },
      12: {
        keywords: ['debug', 'sửa lỗi', 'hiệu chỉnh', 'chỉnh code', 'paraphrase', 'tối ưu hóa st', 'tối ưu st', 'tối ưu code', 'cú pháp', 'compiler'],
        tab: 'debug_code',
        title: 'Debug & Hiệu chỉnh Code',
        desc: 'Tôi đã di chuyển màn hình đến Bước 5: Debug & Hiệu chỉnh Code. Tại đây bạn có thể soạn thảo, biên dịch thử và tối ưu code bằng AI.'
      },
      11: { 
        keywords: ['nghiệm thu', 'hdsd', 'tài liệu', 'hướng dẫn', 'test', 'doc', 'biên bản', 'báo cáo', 'tải biên bản'], 
        tab: 'doc', 
        title: 'Nghiệm thu & HDSD',
        desc: 'Tôi đã di chuyển màn hình đến Bước 6: Nghiệm thu & HDSD để bạn nhận các file tài liệu hướng dẫn và biên bản nghiệm thu thiết bị.' 
      }
    }

    const presetVal = suggestionResponses[text]
    if (presetVal) {
      matchedPhaseNum = presetVal.phaseNum
      explanationText = presetVal.explanationText
      suggestions = presetVal.suggestions
      phaseCitations = presetVal.citations ?? []
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
            suggestions = ['Xem danh sách ghi chú cuộc họp kick-off.', 'Thêm ghi chú kỹ thuật mới.']
          } else if (phaseNum === 9) {
            suggestions = ['Thêm 2 cảm biến quang', 'Nâng cấp màn hình HMI', 'Bổ sung 1 trục Servo Motor']
          } else if (phaseNum === 10) {
            suggestions = ['Tải về mã nguồn & bản vẽ thiết kế', 'Xem mã lệnh PLC Structured Text (ST)']
          } else if (phaseNum === 12) {
            suggestions = ['Kiểm tra lỗi cú pháp mã PLC.', 'Tối ưu hóa mã PLC ST (Paraphrase).', 'Thêm còi báo động vào code.']
          } else if (phaseNum === 11) {
            suggestions = ['Tải Biên bản nghiệm thu.docx', 'Tải Hướng dẫn vận hành HMI.pdf']
          }
          
          phaseCitations = [{ id: 1, sourceId: 'spec', tab: data.tab }]
          break
        }
      }
    }

    if (!isMatched) {
      explanationText = `Dựa trên câu hỏi "${text}" của bạn và các tài liệu nguồn đã nạp, tôi chưa tìm thấy từ khóa trùng khớp với 5 bước thiết kế sau đơn hàng. \n\nVui lòng thử hỏi về một trong các bước như: tiếp nhận khảo sát, họp kick-off bàn giao, điều chỉnh vật tư, thiết kế bản vẽ CAD / mã PLC, hoặc nghiệm thu HDSD.`
      suggestions = [
        'Nhập lại chênh lệch thông số dự án sau khi nhận đơn hàng',
        'Soạn biên bản Kick-off bàn giao dự án',
        'Xem sơ đồ bản vẽ CAD & mã Structured Text'
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
    if (first) { const names = pre.rememberFromContent(); aiText = names.length ? `Đã đọc ${files.length} tài liệu và ghi nhớ: ${names.join(', ')}.` : `Đã thêm ${files.length} tài liệu.` }
    else { const d = pre.reExtract(files[0].name); aiText = d.length ? `Đã đọc lại & đối chiếu — cập nhật ${d[0].name}.` : `Đã thêm ${files.length} tài liệu.` }
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, sender: 'ai', text: aiText, timestamp: ts }])
    if (activePhase === null) handlePhaseChange(1)
  }
  const handleAddText = (text: string) => {
    setSources(prev => [...prev, { id: `txt-${Date.now()}`, title: 'Văn bản dán', type: 'Văn bản', size: text.length + ' ký tự', selected: true }])
    setAddSourceOpen(false)
    const names = pre.rememberFromContent(text)   // AI tự ghi nhớ từ nội dung dán
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, sender: 'ai', text: names.length ? `Đã đọc văn bản và ghi nhớ: ${names.join(', ')}. Gõ "tóm tắt dự án" để xem toàn bộ.` : 'Đã thêm văn bản làm nguồn.', timestamp: ts }])
    if (activePhase === null) handlePhaseChange(1)
  }
  const addSourceFromNote = (title: string) => {
    setSources(prev => [...prev, { id: `note-${Date.now()}`, title: title.slice(0, 40) + ' (ghi chú)', type: 'Ghi chú', size: '—', selected: true }])
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
          <Link 
            to={`/workspace/${id}/library`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-500/15 transition cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>{t('ws.header.library')}</span>
          </Link>

          <div className="h-5 w-px bg-slate-250" />

          {/* Active User Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider px-1.5 select-none">
              {t('ws.header.engineer')}
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
            onClick={() => { const i = LOCALES.indexOf(locale); setLocale(LOCALES[(i + 1) % LOCALES.length]) }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-brand-500/5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition cursor-pointer"
            title="Đổi ngôn ngữ / Change language"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{LANG_META[locale].label}</span>
          </button>

          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t('ws.header.config')}</span>
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
                {t('ws.panel.sources')}
              </button>
              <button
                onClick={() => setLeftActiveTab('history')}
                className={`flex-1 py-1 text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer text-center rounded-lg ${
                  leftActiveTab === 'history'
                    ? 'bg-white text-brand-700 shadow-3xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('ws.panel.history')}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {leftActiveTab === 'sources' ? (
                <>
                  <button onClick={() => setAddSourceOpen(true)} className="w-full flex items-center justify-center gap-1.5 py-2 mb-1 text-[11px] font-bold border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Plus className="w-3 h-3" />{t('ws.panel.addSource')}
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
                    {t('ws.panel.noHistory')}
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
                          {t('ws.phaseShort')} {log.phaseNum}
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
                {t('ws.panel.process')}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {phases.filter(p => p.isVisible !== false && activatedPhases.includes(p.num)).length === 0 ? (
                <div className="text-[10px] text-slate-400 text-center py-6 px-3 leading-relaxed">
                  {t('ws.panel.noPhase')}
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
                          }`} title={phaseTitle(p.num)}>
                            {phaseTitle(p.num)}
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
                      {activePhase !== null ? (activePhase <= 3 ? t('ws.badge.preOrder') : tf('ws.badge.postOrder', { n: activePhase })) : t('ws.badge.pipeline')}
                    </span>
                    <h1 className="text-sm font-extrabold text-slate-900">
                      {activePhase !== null ? phaseTitle(activePhase) : t('ws.canvas.detailArea')}
                    </h1>
                  </div>
                  {activePhase !== null ? (
                    <p className="mt-0.5 text-xs text-slate-500 leading-normal">
                      {t(`ws.phase.${activePhase}.desc`)}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-slate-500 leading-normal">
                      {t('ws.canvas.intro')}
                    </p>
                  )}
                </div>
              </div>

              {activePhase !== null && (
                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono shrink-0">
                  <span className="font-semibold bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-3xs">
                    {t('ws.canvas.projectProgress')} <strong className="font-bold text-brand-600">{projectProgress}%</strong>
                  </span>
                  <span className="text-[10px] text-slate-400">{tf('ws.canvas.stepPhase', { n: activePhase ?? 0 })} {progressData[activePhase] ?? 0}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Component Canvas Rendering */}
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <div key={activeRightTab ?? 'empty'} className="animate-fade-in-up">
              {activePhase === null ? (
                <div className="max-w-5xl mx-auto h-full flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-xs">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 font-mono">{t('ws.canvas.noOutput')}</h2>
                    <p className="mt-2 text-sm text-slate-600">{t('ws.canvas.noOutputDesc')}</p>
                    <p className="mt-4 text-xs text-slate-400 font-mono">{t('ws.canvas.noOutputHint')}</p>
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

              {activeRightTab === 'materials' && (
                <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
                  <SmartMaterialsTable
                    projectId={id || 'default'}
                    currentUser={activeUser}
                    materialsVersion={materialsVersion}
                    onAddLog={(action) => addLog(action, 9)}
                    onMaterialsChange={(_totalPrice) => {
                      handleProgress9(100)
                    }}
                    onUpdateChat={(systemMsg, aiMsg) => {
                      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      setMessages(prev => [
                        ...prev,
                        { id: `u-${Date.now()}`, sender: 'user', text: systemMsg, timestamp: ts },
                        { id: `a-${Date.now() + 1}`, sender: 'ai', text: aiMsg, timestamp: ts }
                      ])
                      setMaterialsVersion(prev => prev + 1)
                    }}
                  />
                </div>
              )}

              {activeRightTab === 'design_code' && (
                <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-300">
                  {/* Premium Segmented Tab Switcher */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-3xs select-none">
                      <button
                        onClick={() => setDesignSubTab('cad')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          designSubTab === 'cad'
                            ? 'bg-brand-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        📐 Bản vẽ sơ đồ mạch CAD
                      </button>
                      <button
                        onClick={() => setDesignSubTab('code')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          designSubTab === 'code'
                            ? 'bg-brand-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        💻 Mã ST & Sơ đồ khối PLC
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono italic">
                      Giao diện phân tab rộng rãi
                    </div>
                  </div>

                  {/* File Downloads Bar */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                        Tệp kết quả thiết kế tự động
                      </h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">
                        Sinh bởi AI dựa trên quy chuẩn kỹ thuật (Liên khóa an toàn KA1, Khởi tạo Servo)
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {designSubTab === 'cad' ? (
                        <button
                          onClick={() => {
                            alert('[MOCK DOWNLOAD] Đang tải bản vẽ CAD: Electrical_Layout_v2.0.dwg (1.4 MB)');
                            handleProgress10(100)
                            addLog('Đã tải xuống bản vẽ CAD: Electrical_Layout_v2.0.dwg', 10)
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-3xs"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Tải Bản vẽ CAD (.dwg)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            alert('[MOCK DOWNLOAD] Đang tải mã lệnh: PLC_Ladder_Q03UDE.l5k (89 KB)');
                            handleProgress10(100)
                            addLog('Đã tải xuống mã lệnh PLC: PLC_Ladder_Q03UDE.l5k', 10)
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-3xs"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Tải Mã PLC (.l5k)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CAD and ST Code full width tabs */}
                  <div className="w-full">
                    {designSubTab === 'cad' ? (
                      /* CAD Viewer (Full-Width) */
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-panel flex flex-col w-full animate-in fade-in duration-300">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Bản vẽ sơ đồ đấu dây lực</span>
                          <span className="text-[9px] bg-slate-200 text-slate-650 px-2 py-0.5 rounded font-bold font-mono">AutoCAD DWG Viewer</span>
                        </div>
                        <div className="p-4 flex-1 min-h-[460px]">
                          <CadViewer 
                            locale={locale} 
                            currentUser={activeUser}
                            onProgressChange={(prog) => handleProgress10(Math.max(50, prog))}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Flowchart & ST Code Editor (Full-Width) */
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-panel flex flex-col w-full animate-in fade-in duration-300">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mã Structured Text (PLC ST) & Sơ đồ khối</span>
                          <span className="text-[9px] bg-brand-500/10 text-brand-700 border border-brand-500/20 px-2 py-0.5 rounded font-bold font-mono">AI Grounding active</span>
                        </div>
                        <div className="p-4 flex-1 min-h-[460px]">
                          <FlowchartEditor 
                            locale={locale} 
                            onProgressChange={(prog) => handleProgress10(Math.max(50, prog))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeRightTab === 'debug_code' && (
                <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
                  <DebugCodeStep
                    projectId={id || 'default'}
                    onProgressChange={handleProgress12}
                    onAddLog={(action) => addLog(action, 12)}
                  />
                </div>
              )}

              {activeRightTab === 'doc' && (
                <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                  <DocumentGenerator 
                    onProgressChange={handleProgress11}
                  />
                </div>
              )}

              {activeRightTab === 'notes' && (
                <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-panel flex flex-col min-h-[500px] animate-in fade-in duration-300">
                  {/* File Header Bar */}
                  <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                            Biên bản cuộc họp & Ghi chú bàn giao
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            bien_ban_kickoff_ban_giao.txt
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          Pha 8: Ghi lại thông tin thống nhất giữa Sales, Kỹ sư và Khách hàng
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={downloadKickoffText}
                      disabled={isDownloadingKickoff}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 border border-slate-250 rounded-xl text-xs font-bold transition cursor-pointer"
                      title="Tải biên bản cuộc họp về máy"
                    >
                      {isDownloadingKickoff ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{isDownloadingKickoff ? 'Đang tải...' : 'Tải File Text'}</span>
                    </button>
                  </div>

                  {/* Editor Content Area (Read-Only) */}
                  <div className="flex-1 p-5 overflow-y-auto max-h-[500px] bg-slate-50/25 select-text">
                    <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 font-sans text-xs text-slate-755 leading-relaxed whitespace-pre-line font-mono select-all">
                      {kickoffText}
                    </div>
                  </div>

                  {/* Bottom Editor Status Bar */}
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
                    <div className="flex gap-4">
                      <span>Kích thước: <strong>{(new Blob([kickoffText]).size / 1024).toFixed(2)} KB</strong></span>
                      <span>Dòng: <strong>{kickoffText ? kickoffText.split('\n').length : 0}</strong></span>
                      <span>Từ: <strong>{kickoffText ? kickoffText.split(/\s+/).filter(Boolean).length : 0}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-450">
                      <span>Định dạng: <strong>Plain Text / MD</strong></span>
                      <span className="mx-1">•</span>
                      <span>Mã hóa: <strong>UTF-8</strong></span>
                    </div>
                  </div>

                  {/* Guide Banner */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 leading-relaxed font-sans">
                    <strong>💡 Hướng dẫn chỉnh sửa:</strong> Biên bản cuộc họp này ở chế độ Chỉ đọc. Để cập nhật nhiệm vụ, tiến độ hoặc bổ sung ghi chú bàn giao mới, vui lòng gửi yêu cầu cho AI ở khung chat bên phải (Ví dụ: <em>"Cập nhật biên bản kick-off: thêm ghi chú kiểm tra lại chống nhiễu cảm biến"</em>). AI sẽ tự động xử lý và cập nhật nội dung tệp tin phía bên trái.
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
                  {t('ws.sourceViewer')}
                </span>
                <button
                  onClick={() => {
                    setActiveViewerSource(null)
                    setHighlightedPhrase(undefined)
                  }}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-2 py-1 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> {t('ws.close')}
                </button>
              </div>
              <div className="flex-1 p-2 min-h-0">
                <SourceViewer
                  title={sources.find((s) => s.id === activeViewerSource)?.title || t('ws.panel.sources')}
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
                    {t('ws.copilot.title')}
                  </span>
                </div>
                <button
                  onClick={() => setIsCopilotExpanded(false)}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                  title={t('ws.copilot.collapse')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Context Banner */}
              <div className="px-3.5 py-2.5 bg-brand-500/10 border-b border-brand-500/20 text-[10px] text-brand-700 leading-relaxed select-none">
                {activePhase !== null ? (
                  <>{tf('ws.copilot.ctxPhase', { n: activePhase, title: phaseTitle(activePhase) })}</>
                ) : (
                  <>{t('ws.copilot.ctxNone')}</>
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
                  <span>{t('ws.copilot.suggest')}</span>
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
                    placeholder={t('ws.copilot.placeholder')}
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
                {t('ws.copilot.open')}
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
                <span>{t('ws.config.title')}</span>
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
                      <span className="font-mono font-bold text-slate-500 mr-1.5">{t('ws.phaseShort')} {p.num}</span>
                      <span className="font-bold text-slate-800">{phaseTitle(p.num)}</span>
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
                {t('ws.config.done')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
