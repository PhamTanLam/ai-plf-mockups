import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
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
  ClipboardList,
  ArrowRight,
  MessageSquare,
  ChevronDown,
  Trash2,
  PanelRightClose,
  Pencil,
  Search,
  MoreVertical,
  Star,
  Zap,
  CreditCard,
  Globe
} from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'
import { tcText, tField, tFieldValue, tFieldList, tSourceMeta, tSummary } from '@/i18n/chat'

// Import components
import CadViewer from '@/components/CadViewer'
import FlowchartEditor from '@/components/FlowchartEditor'
import SourceViewer from '@/components/SourceViewer'
import DocumentGenerator from '@/components/DocumentGenerator'
import CaseInput from '@/components/CaseInput'
import AddSourceModal from '@/components/AddSourceModal'
import SmartMaterialsTable from '@/components/SmartMaterialsTable'
import DebugCodeStep, { DEFAULT_ST_CODE, COMPACT_ST_CODE } from '@/components/DebugCodeStep'
import { usePresalesState } from '@/hooks/usePresalesState'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  /** Nếu có: render bằng tf(tkey, tvars) — dịch lại theo ngôn ngữ hiện tại (cho message động). */
  tkey?: string
  tvars?: Record<string, string | number>
  citations?: { id: number; sourceId: string; phrase?: string; tab?: string }[]
  /** Nút hành động nhanh dưới câu trả lời AI. `to` = điều hướng route; `openOid` = mở output có sẵn; `openDoc` = mở tài liệu tổng hợp ngay trong canvas. */
  action?: { label: string; to?: string; openOid?: string; openDoc?: { title: string; content: string }; phase?: number; version?: number }
  timestamp: string
}

// ── Multi-conversation: nhiều cuộc trò chuyện / lịch sử (mô phỏng, lưu localStorage theo dự án) ──
interface ConvMeta { id: string; title: string; createdBy: 'Linh' | 'Kanai' | 'AI'; createdAt: number }
const chatMetaKey = (pid?: string) => `aiplf.chat.${pid || 'default'}.meta`
const chatMsgsKey = (pid: string | undefined, cid: string) => `aiplf.chat.${pid || 'default'}.msgs.${cid}`
const newConvId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

function loadChatState(pid: string | undefined, greetingText: string): { convs: ConvMeta[]; activeId: string; messages: Message[] } {
  const greet = (): Message[] => [{ id: 'm1', sender: 'ai', text: greetingText, timestamp: '10:00 AM' }]
  try {
    const metaRaw = localStorage.getItem(chatMetaKey(pid))
    if (metaRaw) {
      const meta = JSON.parse(metaRaw) as { convs: ConvMeta[]; activeId: string }
      if (meta.convs?.length) {
        const activeId = meta.convs.some(c => c.id === meta.activeId) ? meta.activeId : meta.convs[0].id
        let msgs: Message[] = []
        try { msgs = JSON.parse(localStorage.getItem(chatMsgsKey(pid, activeId)) || 'null') || [] } catch { /* ignore */ }
        return { convs: meta.convs, activeId, messages: msgs.length ? msgs : greet() }
      }
    }
  } catch { /* ignore */ }
  // Chưa có: migrate thread cũ (nếu có) thành cuộc của tôi + seed vài cuộc demo của member khác
  let oldMsgs: Message[] | null = null
  try { oldMsgs = JSON.parse(localStorage.getItem(`aiplf.workspace.${pid || 'default'}.messages`) || 'null') } catch { /* ignore */ }
  const now = Date.now()
  const cid = newConvId()
  const seed = (title: string, by: ConvMeta['createdBy'], hoursAgo: number, userMsg: string): ConvMeta => {
    const sid = newConvId()
    try {
      localStorage.setItem(chatMsgsKey(pid, sid), JSON.stringify([
        { id: sid + 'a', sender: 'ai', text: greetingText, timestamp: '09:00 AM' },
        { id: sid + 'u', sender: 'user', text: userMsg, timestamp: '09:01 AM' },
        { id: sid + 'b', sender: 'ai', text: 'Đã ghi nhận và xử lý yêu cầu. Bạn có thể xem chi tiết ở các bước tương ứng.', timestamp: '09:01 AM' },
      ]))
    } catch { /* ignore */ }
    return { id: sid, title, createdBy: by, createdAt: now - hoursAgo * 3600000 }
  }
  return {
    convs: [
      { id: cid, title: 'Cuộc trò chuyện 1', createdBy: 'Linh', createdAt: now },
      seed('Review tài liệu hướng dẫn vận hành', 'Kanai', 19, 'Soạn tài liệu hướng dẫn vận hành HMI'),
      seed('Kiểm tra mã nguồn & yêu cầu UI', 'AI', 23, 'Kiểm tra lỗi cú pháp mã PLC'),
      seed('Đánh giá tổng quan thiết kế dự án', 'Kanai', 96, 'Tóm tắt dự án'),
    ],
    activeId: cid,
    messages: (oldMsgs && oldMsgs.length) ? oldMsgs : greet(),
  }
}

const getDefaultKickoffText = (locale: string) => {
  if (locale === 'ja') {
    return `# 引き継ぎキックオフ会議議事録 (CASE-2026-0245)
日時：2026/06/06 09:30 - 10:30
場所：技術会議室 / MS Teams
出席者：
- 金井 (Lead SE)
- リン (Software Engineer)
- AIアシスタント (技術サポート)

---

## I. 仕様変更合意事項 (SPECS)
1. 溶接ロボット処理に対応するため、制御用PLCを三菱電機製 Q03UDE シリーズ（従来のコンパクト FX5U から）にアップグレードすることを確認。
2. サーボ MR-J5-40A（補助グリッパ軸 A4）を1軸追加し、合計4軸に拡張。
3. 安全基準を ISO 13849 PLd に引き上げ、オムロン製セーフティリレー G9SE（KA1接点インターロック）を追加。
4. HMI GOT2000 操作画面を7インチから10インチへアップグレード。

## II. 役割分担と引き渡しスケジュール
1. リン (ソフトウェア担当):
   - サーボ MR-J5 の初期化および安全インターロックを統合する PLC Structured Text (ST) プログラムの作成。
   - 期限: 2026/06/08
   
2. 金井 (電気設計担当):
   - メイン制御盤の主回路および制御回路の CAD 配線図面の設計。
   - 期限: 2026/06/09
   
3. AIアシスタント (自動化アシスタント):
   - PLC ST コードのコンパイル支援および構文エラーのチェック。
   - HMI 操作説明書および仕様検収ドキュメントの自動生成。

---
## III. 重要技術メモ (SAVED NOTES)
- 工場のサーボドライブ向け AC200V 三相電源を再確認すること。
- 動力配線とセンサー信号線を分離しノイズ対策を行う CAD 図面が必要。`
  }
  if (locale === 'en') {
    return `# KICK-OFF & PROJECT HANDOVER MEETING MINUTES (CASE-2026-0245)
Time: 06/06/2026 09:30 - 10:30
Location: Engineering Meeting Room / MS Teams
Attendees:
- Kanai (Lead SE)
- Linh (Software Engineer)
- AI Assistant (Technical Support)

---

## I. AGREED SPECIFICATION CHANGES (SPECS)
1. Confirmed upgrade of control PLC to Mitsubishi Q03UDE series (replacing compact FX5U series) to support welding robot processing.
2. Added 1 axis Servo MR-J5-40A (Auxiliary Gripper Axis A4), increasing total axis count to 4.
3. Upgraded safety standard to ISO 13849 PLd, adding Omron G9SE safety relay interlocking KA1 contacts.
4. Upgraded HMI control screen from GOT2000 7-inch to 10-inch.

## II. WORK ASSIGNMENT & HANDOVER SCHEDULE
1. Linh (Software Owner):
   - Write PLC Structured Text (ST) program to initialize Servo MR-J5 and integrate safety interlocks.
   - Deadline: 08/06/2026.
   
2. Kanai (Electrical Design Owner):
   - Design CAD wiring diagram drawings for main power and control circuits of the main panel.
   - Deadline: 09/06/2026.
   
3. AI Assistant (Automation Assistant):
   - Assist in compiling and checking PLC ST code syntax.
   - Automatically generate HMI operation manual and specs acceptance record documents.

---
## III. IMPORTANT TECHNICAL NOTES (SAVED NOTES)
- Need to re-check the AC200V 3-phase power supply for the Servo Drives at the factory.
- The power-circuit CAD diagram must separate power wiring from sensor signal wiring to prevent noise.`
  }
  // Default is Vietnamese ('vi')
  return `# BIÊN BẢN HỌP KICK-OFF & BÀN GIAO DỰ ÁN (CASE-2026-0245)
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

const POST_SALES_STEPS = [7, 8, 9, 10, 12, 11]

const getDisplayStep = (phaseNum: number | null | undefined): string => {
  if (phaseNum === null || phaseNum === undefined) return ''
  if (phaseNum === 1) return '1'
  if (phaseNum === 2) return '2'
  if (phaseNum === 2.5) return '2.5'
  if (phaseNum === 3) return '3'
  if (phaseNum === 7) return '4'
  if (phaseNum === 8) return '5'
  if (phaseNum === 9) return '6'
  if (phaseNum === 10) return '7'
  if (phaseNum === 12) return '8'
  if (phaseNum === 11) return '9'
  return String(phaseNum)
}

const getDisplayStepPercent = (phaseNum: number | null | undefined): number => {
  if (phaseNum === null || phaseNum === undefined) return 0
  const stepVal = phaseNum === 2.5 ? 2.5 : parseFloat(getDisplayStep(phaseNum))
  return isNaN(stepVal) ? 0 : (stepVal / 9) * 100
}

const translateConvTitle = (title: string, locale: string): string => {
  const defaultMatch = title.match(/^(Cuộc trò chuyện|会話|Chat)\s+(\d+)$/)
  if (defaultMatch) {
    const num = defaultMatch[2]
    if (locale === 'ja') return `会話 ${num}`
    if (locale === 'en') return `Chat ${num}`
    return `Cuộc trò chuyện ${num}`
  }

  // Seed demo titles translation
  if (title === 'Review tài liệu hướng dẫn vận hành' || title === '操作説明書レビュー' || title === 'Review operation manual') {
    if (locale === 'ja') return '操作説明書レビュー'
    if (locale === 'en') return 'Review operation manual'
    return 'Review tài liệu hướng dẫn vận hành'
  }
  if (title === 'Kiểm tra mã nguồn & yêu cầu UI' || title === 'ソースコード＆UI要件確認' || title === 'Check source code & UI requirements') {
    if (locale === 'ja') return 'ソースコード＆UI要件確認'
    if (locale === 'en') return 'Check source code & UI requirements'
    return 'Kiểm tra mã nguồn & yêu cầu UI'
  }
  if (title === 'Đánh giá tổng quan thiết kế dự án' || title === 'プロジェクト設計の全体評価' || title === 'Project design review') {
    if (locale === 'ja') return 'プロジェクト設計の全体評価'
    if (locale === 'en') return 'Project design review'
    return 'Đánh giá tổng quan thiết kế dự án'
  }

  return title
}

const translateUser = (user: string, locale: string): string => {
  if (user === 'Linh' || user === 'リン') {
    if (locale === 'ja') return 'リン'
    return 'Linh'
  }
  if (user === 'Kanai' || user === '金井') {
    if (locale === 'ja') return '金井'
    return 'Kanai'
  }
  if (user === 'AI') {
    return 'AI'
  }
  return user
}

const translateUsersRole = (users: string, locale: string): string => {
  if (locale === 'ja') {
    if (users === 'Nhân viên kinh doanh') return '営業担当者'
    if (users === 'Nhân viên kinh doanh hoặc SE') return '営業担当者またはSE'
    if (users === 'Kỹ sư dự án') return 'プロジェクトエンジニア'
    if (users === 'Kỹ sư & Người phụ trách') return 'エンジニア＆担当者'
    if (users === 'Kỹ sư thiết kế / Sales') return '設計エンジニア/営業'
    if (users === 'AI Assistant / Kỹ sư') return 'AIアシスタント/エンジニア'
    if (users === 'Kỹ sư / AI Assistant') return 'エンジニア/AIアシスタント'
    if (users === 'Khách hàng / SE') return '顧客/SE'
  }
  if (locale === 'en') {
    if (users === 'Nhân viên kinh doanh') return 'Sales Representative'
    if (users === 'Nhân viên kinh doanh hoặc SE') return 'Sales Rep or SE'
    if (users === 'Kỹ sư dự án') return 'Project Engineer'
    if (users === 'Kỹ sư & Người phụ trách') return 'Engineer & Owner'
    if (users === 'Kỹ sư thiết kế / Sales') return 'Design Engineer / Sales'
    if (users === 'AI Assistant / Kỹ sư') return 'AI Assistant / Engineer'
    if (users === 'Kỹ sư / AI Assistant') return 'Engineer / AI Assistant'
    if (users === 'Khách hàng / SE') return 'Customer / SE'
  }
  return users
}



const phasesInfo: PhaseDetail[] = [
  // PRE-SALES = 3 mốc tiến độ trong sidebar, tất cả dùng chung 1 màn CaseInput
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
    desc: 'Rà soát thông tin đã nhập, hỏi AI tóm tắt hoặc xem lại đầu ra trước khi trình khách.',
    prompts: ['Tóm tắt dự án giúp tôi.'],
    tab: 'caseinput',
    sourcesToSelect: [],
    inputs: ['Câu hỏi'],
    outputs: ['Xác nhận nội dung'],
    users: 'Nhân viên kinh doanh hoặc SE',
  },
  {
    num: 2.5,
    title: 'Tạo đề án',
    desc: 'AI sinh đề án trình khách (dạng slide) từ thông tin đã ghi nhận — xem trước rồi lưu vào Thư viện.',
    prompts: ['Tạo đề án trình khách.'],
    tab: 'caseinput',
    sourcesToSelect: [],
    inputs: ['Câu hỏi'],
    outputs: ['Đề án trình khách (slide)'],
    users: 'Nhân viên kinh doanh',
  },
  {
    num: 3,
    title: 'Trình dự toán',
    desc: 'Xuất hồ sơ dự toán cuối để trình khách. Cập nhật và dự toán lại đến khi chốt đơn.',
    prompts: ['Xuất hồ sơ đề xuất.'],
    tab: 'caseinput',
    sourcesToSelect: [],
    inputs: ['Câu hỏi'],
    outputs: ['Tài liệu đề xuất'],
    users: 'Nhân viên kinh doanh',
  },
  // POST-SALES = 5 bước tuyến tính (Phases 7, 8, 9, 10, 11)
  {
    num: 7,
    title: 'Khảo sát & Phát sinh',
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
    title: 'Thiết kế',
    desc: '※Tạm thời tập trung vào điện\n①Thiết kế phần cứng\n②Thiết kế PLC, TP',
    prompts: [
      'Thêm 2 cảm biến quang',
      'Nâng cấp lên HMI GOT2000 10-inch',
      'Bổ sung 1 trục Servo Motor'
    ],
    tab: 'materials',
    sourcesToSelect: ['spec'],
    inputs: ['①Tài liệu thông số điện', '②Tài liệu thông số phần mềm'],
    outputs: ['①Tổng hợp thông số (văn bản)'],
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
    title: 'Debug',
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

// Dropdown tuỳ biến (thay native <select> để style được cả phần danh sách mở ra).
function FancySelect({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; badge?: string }[]
}) {
  const [open, setOpen] = useState(false)
  const cur = options.find(o => o.value === value)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold cursor-pointer hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 outline-none transition text-left"
      >
        {cur?.badge && <span className="text-[9px] font-bold text-slate-500 bg-white border border-slate-200 rounded px-1 py-0.5 shrink-0">{cur.badge}</span>}
        <span className="truncate flex-1">{cur?.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 bg-white border border-slate-200 rounded-xl shadow-pop p-1 animate-in fade-in zoom-in-95 duration-150">
            {options.map(o => {
              const active = o.value === value
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false) }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-left transition ${
                    active ? 'bg-brand-500/10 text-brand-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {o.badge && <span className={`text-[9px] font-bold rounded px-1 py-0.5 shrink-0 border ${active ? 'bg-brand-500 text-white border-brand-500' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{o.badge}</span>}
                  <span className="truncate flex-1">{o.label}</span>
                  {active && <span className="text-brand-600 text-xs font-bold shrink-0">✓</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function NotebookWorkspace() {
  const { id } = useParams<{ id: string }>()
  const { t, tf, locale, setLocale } = useI18n()
  const phaseTitle = (num: number | null | undefined) => (num != null ? t(`ws.phase.${num}.title`) : '')
  // dịch hiển thị cho hội thoại AI mô phỏng (logic vẫn khớp theo chuỗi VN)
  const tc = (s: string) => tcText(s, locale)
  const L = (vi: string, ja: string, en: string) => locale === 'ja' ? ja : locale === 'en' ? en : vi
  const chatEndRef = useRef<HTMLDivElement>(null)
  // Đề xuất ghi nhận Bước 7 đang chờ user xác nhận (gõ "update"/"đồng ý" mới ghi vào bộ nhớ)
  const pendingReentryRef = useRef<{ name: string; value: string; mat: string } | null>(null)

  const [membership, setMembership] = useState<'free' | 'premium'>(() => {
    return (localStorage.getItem('aiplf.membership') as 'free' | 'premium') || 'free'
  })


  // Bước mở mặc định = theo TRẠNG THÁI dự án (router state khi click từ dashboard; fallback map demo; mới → pre-sales bước 1)
  const location = useLocation()
  const navState = location.state as { status?: string; progress?: number } | null
  const caseStatus = navState?.status || DEMO_STATUS[id || ''] || 'status.preSales'
  const initialPhase = statusToPhase(caseStatus)
  const [activePhase, setActivePhase] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(`aiplf.workspace.${id}.activePhase`)
      if (stored !== null) return JSON.parse(stored)
    } catch { /* ignore */ }
    return initialPhase
  })
  const [phases] = useState<(PhaseDetail & { isVisible?: boolean })[]>(
    phasesInfo.map(p => ({ ...p, isVisible: true }))
  )
  const [activeUser, setActiveUser] = useState<'Linh' | 'Kanai' | 'AI'>('Linh')
  const [activatedPhases, setActivatedPhases] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(`aiplf.workspace.${id}.activatedPhases`)
      if (stored !== null) return JSON.parse(stored)
    } catch { /* ignore */ }
    if (initialPhase <= 3) return [initialPhase]
    const postSalesOrder = [7, 8, 9, 10, 12, 11]
    const idx = postSalesOrder.indexOf(initialPhase)
    if (idx === -1) return [initialPhase]
    return postSalesOrder.slice(0, idx + 1)
  })
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isCopilotExpanded, setIsCopilotExpanded] = useState(true)
  const [isZenMode, setIsZenMode] = useState(false)
  const [prevLeftSidebar, setPrevLeftSidebar] = useState(true)
  const [prevCopilot, setPrevCopilot] = useState(true)
  const [paraphraseCommand, setParaphraseCommand] = useState<{ type: 'compact' | 'clean_case' | 'default'; trigger: number } | null>(null)

  const toggleZenMode = () => {
    if (!isZenMode) {
      setPrevLeftSidebar(isLeftSidebarExpanded)
      setPrevCopilot(isCopilotExpanded)
      setIsLeftSidebarExpanded(false)
      setIsCopilotExpanded(false)
      setIsZenMode(true)
    } else {
      setIsLeftSidebarExpanded(prevLeftSidebar)
      setIsCopilotExpanded(prevCopilot)
      setIsZenMode(false)
    }
  }

  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(`aiplf.workspace.${id}.leftSidebarExpanded`)
      if (stored !== null) return JSON.parse(stored)
    } catch { /* ignore */ }
    return true
  })
  const [hasUsedPreSales, setHasUsedPreSales] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(`aiplf.workspace.${id}.hasUsedPreSales`)
      if (stored !== null) return JSON.parse(stored)
    } catch { /* ignore */ }
    return initialPhase <= 3
  })
  const [progressBarActivated, setProgressBarActivated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(`aiplf.workspace.${id}.progressBarActivated`)
      if (stored !== null) return JSON.parse(stored)
    } catch { /* ignore */ }
    return false
  })
  const [maxPostSalesIndex, setMaxPostSalesIndex] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`aiplf.workspace.${id}.maxPostSalesIndex`)
      if (stored !== null) return JSON.parse(stored)
    } catch { /* ignore */ }
    return -1
  })

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

  // Dummy effect to satisfy compiler for progressData
  useEffect(() => {
    if (progressData) {
      // Read progressData without declaring any local unused variables
    }
  }, [progressData])

  const [materialsVersion, setMaterialsVersion] = useState(0)
  const [kickoffText, setKickoffText] = useState('')
  const [designSubTab, setDesignSubTab] = useState<'cad' | 'code'>('cad')

  // Basic Web Application Settings
  const [siteTitle, setSiteTitle] = useState(() => localStorage.getItem('aiplf.settings.siteTitle') || 'Cowatech AI Platform')
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('aiplf.settings.themeColor') || 'teal')
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('aiplf.settings.fontSize') || 'medium')
  const [showLibraryBtn, setShowLibraryBtn] = useState(() => localStorage.getItem('aiplf.settings.showLibraryBtn') !== 'false')
  const [showChatbot, setShowChatbot] = useState(() => localStorage.getItem('aiplf.settings.showChatbot') !== 'false')
  const [showSyncBadge, setShowSyncBadge] = useState(() => localStorage.getItem('aiplf.settings.showSyncBadge') !== 'false')
  const [showCadTab, setShowCadTab] = useState(() => localStorage.getItem('aiplf.settings.showCadTab') !== 'false')
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('aiplf.settings.isDarkMode') === 'true')
  const [settingsActiveTab, setSettingsActiveTab] = useState<'general' | 'appearance' | 'features'>('general')
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false)
  const navigate = useNavigate()

  // Xóa vĩnh viễn dự án hiện tại: gỡ khỏi danh sách user, ẩn nếu là demo, dọn mọi key localStorage của dự án rồi quay về danh sách.
  const handleDeleteProject = () => {
    if (!id) return
    try {
      // 1) Gỡ khỏi danh sách dự án người dùng tạo
      const raw = localStorage.getItem('aiplf.userCases')
      if (raw) {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) {
          localStorage.setItem('aiplf.userCases', JSON.stringify(list.filter((c: { id?: string }) => c.id !== id)))
        }
      }
      // 2) Đánh dấu đã xóa (để ẩn cả case demo cố định)
      const delRaw = localStorage.getItem('aiplf.deletedCases')
      const deleted: string[] = delRaw ? (JSON.parse(delRaw) as string[]) : []
      if (!deleted.includes(id)) deleted.push(id)
      localStorage.setItem('aiplf.deletedCases', JSON.stringify(deleted))
      // 3) Dọn mọi dữ liệu localStorage gắn với dự án này
      const toRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('aiplf.') && k.includes(id)) toRemove.push(k)
      }
      toRemove.forEach((k) => localStorage.removeItem(k))
    } catch { /* ignore */ }
    setConfirmDeleteProject(false)
    setIsConfigOpen(false)
    navigate('/')
  }
  const [tempLocale, setTempLocale] = useState(locale)
  const [tempSiteTitle, setTempSiteTitle] = useState(siteTitle)
  const [tempThemeColor, setTempThemeColor] = useState(themeColor)
  const [tempFontSize, setTempFontSize] = useState(fontSize)
  const [tempShowLibraryBtn, setTempShowLibraryBtn] = useState(showLibraryBtn)
  const [tempShowChatbot, setTempShowChatbot] = useState(showChatbot)
  const [tempShowSyncBadge, setTempShowSyncBadge] = useState(showSyncBadge)
  const [tempShowCadTab, setTempShowCadTab] = useState(showCadTab)
  const [tempIsDarkMode, setTempIsDarkMode] = useState(isDarkMode)
  const [tempActiveUser, setTempActiveUser] = useState(activeUser)

  // Apply theme color changes dynamically
  useEffect(() => {
    const root = document.documentElement;
    const themes: Record<string, Record<string, string>> = {
      teal: {
        '50': '#f0fdfa', '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4',
        '400': '#2dd4bf', '500': '#0abab5', '600': '#099e9a', '700': '#0f766e',
        '800': '#115e59', '900': '#134e4a'
      },
      blue: {
        '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd',
        '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8',
        '800': '#1e40af', '900': '#1e3a8a'
      },
      indigo: {
        '50': '#eef2ff', '100': '#e0e7ff', '200': '#c7d2fe', '300': '#a5b4fc',
        '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca',
        '800': '#3730a3', '900': '#312e81'
      },
      emerald: {
        '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7',
        '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857',
        '800': '#065f46', '900': '#064e3b'
      },
      orange: {
        '50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdbb2d',
        '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c',
        '800': '#9a3412', '900': '#7c2d12'
      }
    };
    const colorSet = themes[themeColor] || themes.teal;
    Object.entries(colorSet).forEach(([shade, hex]) => {
      root.style.setProperty(`--color-brand-${shade}`, hex);
    });
    localStorage.setItem('aiplf.settings.themeColor', themeColor);
  }, [themeColor]);

  // Apply font size changes dynamically
  useEffect(() => {
    const root = document.documentElement;
    const sizes: Record<string, string> = {
      small: '14px',
      medium: '15px',
      large: '16px'
    };
    root.style.fontSize = sizes[fontSize] || '15px';
    localStorage.setItem('aiplf.settings.fontSize', fontSize);
  }, [fontSize]);

  // Apply dark mode styling dynamically on document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--color-surface', '#1e293b');
      root.style.setProperty('--color-surface-alt', '#0f172a');
      root.style.setProperty('--color-surface-muted', '#334155');
      root.style.setProperty('--color-background-app', '#020617');
      root.style.setProperty('--color-line', '#334155');
      root.classList.add('dark');
    } else {
      root.style.removeProperty('--color-surface');
      root.style.removeProperty('--color-surface-alt');
      root.style.removeProperty('--color-surface-muted');
      root.style.removeProperty('--color-background-app');
      root.style.removeProperty('--color-line');
      root.classList.remove('dark');
    }
    localStorage.setItem('aiplf.settings.isDarkMode', String(isDarkMode));
  }, [isDarkMode]);

  // Sync state options to localStorage
  useEffect(() => {
    localStorage.setItem('aiplf.settings.siteTitle', siteTitle);
  }, [siteTitle]);

  useEffect(() => {
    localStorage.setItem('aiplf.settings.showLibraryBtn', String(showLibraryBtn));
  }, [showLibraryBtn]);

  useEffect(() => {
    localStorage.setItem('aiplf.settings.showChatbot', String(showChatbot));
  }, [showChatbot]);

  useEffect(() => {
    localStorage.setItem('aiplf.settings.showSyncBadge', String(showSyncBadge));
    setMaterialsVersion(prev => prev + 1); // trigger materials table update
  }, [showSyncBadge]);

  useEffect(() => {
    localStorage.setItem('aiplf.settings.showCadTab', String(showCadTab));
  }, [showCadTab]);

  useEffect(() => {
    if (!showCadTab && designSubTab === 'cad') {
      setDesignSubTab('code');
    }
  }, [showCadTab, designSubTab]);

  const KICKOFF_STORAGE_KEY = `aiplf.kickoff_notes_text.${id || 'default'}`

  useEffect(() => {
    const handleStorageChange = () => {
      setMembership((localStorage.getItem('aiplf.membership') as 'free' | 'premium') || 'free')
      setMaterialsVersion(prev => prev + 1)
      const storedKickoff = localStorage.getItem(KICKOFF_STORAGE_KEY)
      if (storedKickoff) setKickoffText(storedKickoff)
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [KICKOFF_STORAGE_KEY])

  // Pre-sales NV1 state (mô phỏng, lưu localStorage theo case)
  const pre = usePresalesState(id || 'default')
  // Bộ nhớ RIÊNG cho Bước 7 (post-sales delta) — tách khỏi pre-sales (baseline), tham chiếu pre làm gốc
  const reentry = usePresalesState((id || 'default') + '__reentry')
  // Tín hiệu mở chi tiết ngay trong canvas Bước 7 (từ nút trong chat): output có sẵn (oid) hoặc doc tổng hợp
  const [caseOpen, setCaseOpen] = useState<{ oid?: string; version?: number; doc?: { title: string; content: string }; n: number } | null>(null)
  const [addSourceOpen, setAddSourceOpen] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)


  const DEFAULT_SUGGESTIONS = [
    'Chuyển sang Bước 1: Khảo sát & Phát sinh',
    'Chuyển sang Bước 2: Họp Kick-off',
    'Chuyển sang Bước 3: Thiết kế',
    'Chuyển sang Bước 4: Sản xuất',
    'Chuyển sang Bước 5: Debug',
    'Chuyển sang Bước 6: Nghiệm thu & HDSD',
    'Tóm tắt tài liệu specs.txt của dự án',
    'Hướng dẫn lập trình mã PLC Structured Text',
    'Xem bảng giá nâng cấp thành viên Premium'
  ]

  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS)

  const suggestionResponses: Record<string, {
    phaseNum: number
    explanationText: string
    suggestions: string[]
    citations?: { id: number; sourceId: string; phrase?: string; tab?: string }[]
  }> = {
    'Tóm tắt tài liệu specs.txt của dự án': {
      phaseNum: 7,
      explanationText: 'Tài liệu khao_sat_thay_doi_specs.txt ghi nhận các thông số kỹ thuật cốt lõi:\n- Hệ thống: Trạm hàn Robot WW2 Welding Cell.\n- Thiết bị cũ: CPU Mitsubishi FX5U compact, HMI 7-inch.\n- Yêu cầu nâng cấp: CPU Mitsubishi Q03UDE Module, bổ sung 2 cảm biến quang Omron, nâng cấp HMI lên GOT2000 10-inch, bổ sung 1 trục Servo Motor MR-J4 cho gá quay.',
      suggestions: [
        'Có thay đổi gì về số lượng động cơ hay PLC?',
        'Xem chi tiết thông số chênh lệch Melsec Q?',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'reentry' }],
    },
    'Hướng dẫn lập trình mã PLC Structured Text': {
      phaseNum: 12,
      explanationText: 'Mã PLC Structured Text (ST) trong dự án tuân thủ tiêu chuẩn IEC 61131-3. Cấu trúc chương trình sử dụng khối hàm điều khiển trình tự (CASE..OF) để điều khiển bước cho gá quay, các ngõ ra kích hoạt van khí nén và Robot hàn. Để tối ưu hóa hoặc kiểm tra lỗi cú pháp, bạn có thể chuyển sang Bước 5: Debug để chạy trình biên dịch mô phỏng.',
      suggestions: [
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Tối ưu hóa mã PLC ST (Paraphrase).',
        'Chuyển sang Bước 5: Debug'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'debug_code' }],
    },
    'Xem bảng giá nâng cấp thành viên Premium': {
      phaseNum: 10,
      explanationText: 'Hệ thống hỗ trợ 3 gói dịch vụ:\n1. Gói Free: Hỗ trợ Q&A cơ bản, đọc tài liệu.\n2. Gói Pro ($29/tháng): Hỗ trợ lập trình PLC ST nâng cao, mở khóa 8 bước.\n3. Gói Enterprise Premium ($99/tháng): Mở khóa toàn bộ 13 bước, tự động sinh bản vẽ CAD và code PLC từ specs, hỗ trợ xuất tài liệu nghiệm thu & HDSD vận hành.',
      suggestions: [
        'Xem bảng giá dịch vụ',
        'Nâng cấp lên Premium',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh'
      ]
    },
    'Chuyển sang Bước 1: Khảo sát & Phát sinh': {
      phaseNum: 7,
      explanationText: 'Đã chuyển sang Bước 1: Khảo sát & Phát sinh. Giao diện nhật ký khao_sat_thay_doi_specs.txt đã được hiển thị ở bên trái.',
      suggestions: [
        'Có thay đổi gì về số lượng động cơ hay PLC?',
        'Xem chi tiết thông số chênh lệch Melsec Q?',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
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
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'notes' }],
    },
    'Chuyển sang Bước 3: Thiết kế': {
      phaseNum: 9,
      explanationText: 'Đã chuyển sang Bước 3: Thiết kế. Bảng đặc tả specs đã hiển thị ở bên trái.',
      suggestions: [
        'Thêm 2 cảm biến quang',
        'Nâng cấp màn hình HMI',
        'Bổ sung 1 trục Servo Motor',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'materials' }],
    },
    'Chuyển sang Bước 4: Sản xuất': {
      phaseNum: 10,
      explanationText: 'Đã chuyển sang Bước 4: Sản xuất. AI đã sinh bản vẽ CAD và Structured Text.',
      suggestions: [
        'Xem sơ đồ bản vẽ CAD & mã Structured Text',
        'Tải về mã nguồn & bản vẽ thiết kế',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'cad', tab: 'design_code' }],
    },
    'Chuyển sang Bước 5: Debug': {
      phaseNum: 12,
      explanationText: 'Đã chuyển sang Bước 5: Debug. Tại đây bạn có thể chỉnh sửa trực tiếp mã Structured Text (ST) của PLC, chạy kiểm tra lỗi biên dịch, và yêu cầu AI paraphrase/tối ưu hóa chương trình.',
      suggestions: [
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Tối ưu hóa mã PLC ST (Paraphrase).',
        'Thêm còi báo động vào code.',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
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
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'doc' }],
    },
    'Nhập lại chênh lệch thông số dự án sau khi nhận đơn hàng': {
      phaseNum: 7,
      explanationText: 'Đã chuyển sang Bước 1: Khảo sát & Phát sinh. Giao diện nhật ký khao_sat_thay_doi_specs.txt đã được hiển thị ở bên trái.',
      suggestions: [
        'Có thay đổi gì về số lượng động cơ hay PLC?',
        'Xem chi tiết thông số chênh lệch Melsec Q?',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'reentry' }],
    },
    'Xem chi tiết thông số chênh lệch Melsec Q?': {
      phaseNum: 7,
      explanationText: 'Nhật ký khảo sát ghi nhận cấu hình cũ dùng PLC FX5U (Compact) và cấu hình mới nâng cấp lên PLC Q03UDE (Module) cùng màn hình GOT2000 10-inch. Bản vẽ CAD và Mã PLC ST ở Bước 4 đã tự động cập nhật theo cấu hình mới này.',
      suggestions: [
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'reentry' }],
    },
    'Soạn biên bản Kick-off bàn giao dự án': {
      phaseNum: 8,
      explanationText: 'Đã chuyển sang Bước 2: Họp Kick-off. Tôi đã lập danh sách ghi chú bàn giao dự án và chuẩn bị sẵn biên bản cuộc họp.',
      suggestions: [
        'Xem danh sách ghi chú cuộc họp kick-off.',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'notes' }],
    },
    'Xem danh sách ghi chú cuộc họp kick-off.': {
      phaseNum: 8,
      explanationText: 'Dưới đây là các ghi chú kỹ thuật quan trọng trong Biên bản họp Kick-off (hiển thị ở khung bên trái):\n- Cần kiểm tra lại nguồn cấp AC200V 3 pha cho các Servo Drive tại nhà xưởng.\n- Bản vẽ CAD mạch lực cần tách biệt dây động lực và dây tín hiệu cảm biến để chống nhiễu.',
      suggestions: [
        'Soạn biên bản Kick-off bàn giao dự án',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'notes' }],
    },
    'Thêm 2 cảm biến quang': {
      phaseNum: 9,
      explanationText: 'Đã chuyển sang Bước 3: Thiết kế. Đang tiến hành tăng số lượng Cảm biến quang điện (Photoelectric Sensor) thêm 2 cái.',
      suggestions: [
        'Nâng cấp màn hình HMI',
        'Bổ sung 1 trục Servo Motor',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'materials' }],
    },
    'Nâng cấp màn hình HMI': {
      phaseNum: 9,
      explanationText: 'Đã chuyển sang Bước 3: Thiết kế. Đang thay đổi cấu hình màn hình HMI sang GOT2000 10-inch và áp dụng giá trị mặc định của Master Data.',
      suggestions: [
        'Thêm 2 cảm biến quang',
        'Bổ sung 1 trục Servo Motor',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'materials' }],
    },
    'Bổ sung 1 trục Servo Motor': {
      phaseNum: 9,
      explanationText: 'Đã chuyển sang Bước 3: Thiết kế. Đang tiến hành bổ sung thêm 1 trục Servo Motor (MR-J5-40A) cho cơ cấu băng tải nạp phôi phụ.',
      suggestions: [
        'Thêm 2 cảm biến quang',
        'Nâng cấp màn hình HMI',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'materials' }],
    },
    'Xem sơ đồ bản vẽ CAD & mã Structured Text': {
      phaseNum: 10,
      explanationText: 'Đã chuyển sang Bước 4: Sản xuất. AI đã xử lý ngầm và sinh bản vẽ CAD đấu dây cùng mã Structured Text (ST) tuân thủ quy tắc E-stop KA1 và khởi tạo Servo. Bạn có thể xem trực tiếp hoặc tải về.',
      suggestions: [
        'Tải về mã nguồn & bản vẽ thiết kế',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'cad', tab: 'design_code' }],
    },
    'Tải về mã nguồn & bản vẽ thiết kế': {
      phaseNum: 10,
      explanationText: 'Mã nguồn PLC và Bản vẽ điện CAD đã sẵn sàng. Vui lòng bấm vào các nút Tải Bản vẽ CAD (.dwg) hoặc Tải Mã PLC (.l5k) ở thanh công cụ canvas để tải về.',
      suggestions: [
        'Xem sơ đồ bản vẽ CAD & mã Structured Text',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 5: Debug',
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
    'Tối ưu gọn mã nguồn (CASE..OF)': {
      phaseNum: 12,
      explanationText: 'Đã áp dụng phong cách tối ưu hóa gọn (State Machine / CASE..OF). Mã nguồn PLC ST đã được tái cấu trúc sang dạng máy trạng thái gọn đẹp hơn, giảm thiểu các khối IF lồng nhau phức tạp và cải thiện tốc độ vòng quét CPU.',
      suggestions: [
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Ghi chú chuẩn IEC & CASE cho mã nguồn',
        'Khôi phục mã nguồn về bản gốc',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'debug_code' }],
    },
    'Ghi chú chuẩn IEC & CASE cho mã nguồn': {
      phaseNum: 12,
      explanationText: 'Đã áp dụng cấu trúc ghi chú chuẩn IEC & CASE. Mã nguồn đã được phân khúc sơ đồ khối rõ ràng với chú giải chi tiết từng biến số theo tiêu chuẩn IEC 61131-3.',
      suggestions: [
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Tối ưu gọn mã nguồn (CASE..OF)',
        'Khôi phục mã nguồn về bản gốc',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'debug_code' }],
    },
    'Khôi phục mã nguồn về bản gốc': {
      phaseNum: 12,
      explanationText: 'Đã khôi phục lại mã Structured Text nguyên bản do AI tự động sinh. Tất cả các thay đổi tối ưu hóa trước đó đã được hoàn tác về phiên bản gốc.',
      suggestions: [
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Tối ưu gọn mã nguồn (CASE..OF)',
        'Ghi chú chuẩn IEC & CASE cho mã nguồn',
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
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'doc' }],
    },
    'Tải Biên bản nghiệm thu.docx': {
      phaseNum: 11,
      explanationText: 'Đang tải file Biên bản nghiệm thu.docx (45 KB) về máy của bạn...',
      suggestions: [
        'Tải Hướng dẫn vận hành HMI.pdf',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug'
      ],
      citations: [{ id: 1, sourceId: 'spec', tab: 'doc' }],
    },
    'Tải Hướng dẫn vận hành HMI.pdf': {
      phaseNum: 11,
      explanationText: 'Đang tải file Hướng dẫn vận hành HMI.pdf (1.1 MB) về máy của bạn...',
      suggestions: [
        'Tải Biên bản nghiệm thu.docx',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug'
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
      const postSalesOrder = [7, 8, 9, 10, 12, 11]
      let toAdd = [phaseNum]
      if (postSalesOrder.includes(phaseNum)) {
        const idx = postSalesOrder.indexOf(phaseNum)
        toAdd = postSalesOrder.slice(0, idx + 1)
      }
      
      const newActivated = [...prev]
      toAdd.forEach(num => {
        if (!newActivated.includes(num)) {
          newActivated.push(num)
        }
      })
      return newActivated
    })

    let updatedHasUsedPreSales = hasUsedPreSales
    if (phaseNum <= 3) {
      setHasUsedPreSales(true)
      updatedHasUsedPreSales = true
    }

    const postSalesSteps = POST_SALES_STEPS
    if (postSalesSteps.includes(phaseNum)) {
      if (updatedHasUsedPreSales) {
        setProgressBarActivated(true)
      }
      const idx = postSalesSteps.indexOf(phaseNum)
      setMaxPostSalesIndex((prev) => Math.max(prev, idx))
    }
    
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

  const handleProgress9 = useCallback((prog: number) => handleProgressChange(9, prog), [handleProgressChange])
  const handleProgress10 = useCallback((prog: number) => handleProgressChange(10, prog), [handleProgressChange])
  const handleProgress12 = useCallback((prog: number) => handleProgressChange(12, prog), [handleProgressChange])
  const handleProgress11 = useCallback((prog: number) => handleProgressChange(11, prog), [handleProgressChange])

  // Chat message thread
  // Khởi tạo trạng thái đa-cuộc một lần (đọc localStorage / migrate thread cũ)
  const chatInitRef = useRef<{ convs: ConvMeta[]; activeId: string; messages: Message[] }>(undefined)
  if (!chatInitRef.current) chatInitRef.current = loadChatState(id, t('ws.greeting'))
  const [conversations, setConversations] = useState<ConvMeta[]>(chatInitRef.current.convs)
  const [activeConvId, setActiveConvId] = useState<string>(chatInitRef.current.activeId)
  const [messages, setMessages] = useState<Message[]>(chatInitRef.current.messages)
  const [convSearch, setConvSearch] = useState('')
  const [renameConvId, setRenameConvId] = useState<string | null>(null)
  const [renameConvVal, setRenameConvVal] = useState('')
  // Cuộc mới chưa chat = "draft": chưa thêm vào danh sách, chỉ commit khi có tin nhắn đầu tiên
  const draftConvRef = useRef<{ id: string; createdBy: 'Linh' | 'Kanai' | 'AI'; createdAt: number } | null>(null)

  // Lưu tin nhắn + commit cuộc "draft" khi có tin nhắn đầu tiên + tự đặt tiêu đề
  useEffect(() => {
    const firstUser = messages.find(m => m.sender === 'user')
    // Cuộc rỗng (chưa chat) → KHÔNG lưu để khỏi rác lịch sử
    if (!firstUser) return
    try { localStorage.setItem(chatMsgsKey(id, activeConvId), JSON.stringify(messages)) } catch { /* ignore */ }
    const title = firstUser.text.slice(0, 40)
    setConversations(prev => {
      const exists = prev.some(c => c.id === activeConvId)
      if (!exists) {
        // commit draft → thêm vào danh sách với tiêu đề từ câu hỏi đầu
        const d = draftConvRef.current
        return [{ id: activeConvId, title, createdBy: d?.createdBy || activeUser, createdAt: d?.createdAt || Date.now() }, ...prev]
      }
      let changed = false
      const next = prev.map(c => {
        if (c.id !== activeConvId || !/^(Cuộc trò chuyện|会話|Chat) \d+$/.test(c.title)) return c
        changed = true
        return { ...c, title }
      })
      return changed ? next : prev
    })
  }, [messages, activeConvId, id])

  // Lưu danh sách cuộc + cuộc đang mở
  useEffect(() => {
    try { localStorage.setItem(chatMetaKey(id), JSON.stringify({ convs: conversations, activeId: activeConvId })) } catch { /* ignore */ }
  }, [conversations, activeConvId, id])

  const makeGreeting = (): Message => ({ id: `m-${Date.now()}`, sender: 'ai', text: t('ws.greeting'), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })

  const newConversation = () => {
    const cid = newConvId()
    // Chưa thêm vào danh sách — chỉ là draft cho tới khi có tin nhắn đầu tiên (commit ở effect)
    draftConvRef.current = { id: cid, createdBy: activeUser, createdAt: Date.now() }
    setActiveConvId(cid)
    setMessages([makeGreeting()])
    setAskedQuestions([])
    setInputVal('')
    setIsCopilotExpanded(true)
    setActiveSuggestions(DEFAULT_SUGGESTIONS)
  }

  const renameConversation = (cid: string, title: string) => {
    const v = title.trim()
    setRenameConvId(null)
    if (!v) return
    setConversations(prev => prev.map(c => c.id === cid ? { ...c, title: v } : c))
  }

  const switchConversation = (cid: string) => {
    if (cid === activeConvId) return
    let msgs: Message[] = []
    try { msgs = JSON.parse(localStorage.getItem(chatMsgsKey(id, cid)) || 'null') || [] } catch { /* ignore */ }
    setActiveConvId(cid)
    setMessages(msgs.length ? msgs : [makeGreeting()])
  }

  const deleteConversation = (cid: string) => {
    try { localStorage.removeItem(chatMsgsKey(id, cid)) } catch { /* ignore */ }
    const next = conversations.filter(c => c.id !== cid)
    if (!next.length) {
      const nid = newConvId()
      setConversations([{ id: nid, title: L('Cuộc trò chuyện 1', '会話 1', 'Chat 1'), createdBy: activeUser, createdAt: Date.now() }])
      setActiveConvId(nid)
      setMessages([makeGreeting()])
      return
    }
    setConversations(next)
    if (cid === activeConvId) {
      const target = next[0]
      let msgs: Message[] = []
      try { msgs = JSON.parse(localStorage.getItem(chatMsgsKey(id, target.id)) || 'null') || [] } catch { /* ignore */ }
      setActiveConvId(target.id)
      setMessages(msgs.length ? msgs : [makeGreeting()])
    }
  }

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const [inputVal, setInputVal] = useState('')
  const [activeViewerSource, setActiveViewerSource] = useState<string | null>(null)
  const [srcMenuOpen, setSrcMenuOpen] = useState<string | null>(null)
  const [renamingSrcId, setRenamingSrcId] = useState<string | null>(null)
  const [renameSrcText, setRenameSrcText] = useState('')
  const [highlightedPhrase, setHighlightedPhrase] = useState<string | undefined>(undefined)

  // Question History tracking
  const [askedQuestions, setAskedQuestions] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`aiplf.workspace.${id}.askedQuestions`)
      if (stored !== null) return JSON.parse(stored)
    } catch { /* ignore */ }
    return []
  })

  // Edit History & Logs States
  const [leftActiveTab, setLeftActiveTab] = useState<'sources' | 'conversations' | 'process'>(() => {
    try {
      const stored = localStorage.getItem(`aiplf.workspace.${id}.leftActiveTab`)
      if (stored !== null && (stored === '"sources"' || stored === '"conversations"' || stored === '"process"')) {
        return JSON.parse(stored) as 'sources' | 'conversations' | 'process'
      }
    } catch { /* ignore */ }
    return 'sources'
  })
  const [historyLogs, setHistoryLogs] = useState<{ id: string; user: string; action: string; timestamp: string; phaseNum: number }[]>(() => {
    try {
      const stored = localStorage.getItem(`aiplf.workspace.${id}.historyLogs`)
      if (stored !== null) return JSON.parse(stored)
    } catch { /* ignore */ }
    return [
      { id: 'h1', user: 'Kanai', action: 'Đã thiết lập dự án và nạp tài liệu thiết kế gốc', timestamp: '09:30 AM', phaseNum: 7 },
      { id: 'h2', user: 'Linh', action: 'Xác nhận thông số Mạng truyền thông CC-Link IE', timestamp: '10:05 AM', phaseNum: 7 },
      { id: 'h3', user: 'Linh', action: 'Đồng bộ chênh lệch thông số sang biên bản kick-off', timestamp: '10:15 AM', phaseNum: 8 },
    ]
  })

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

  // Save workspace states to localStorage to preserve page state when returning
  useEffect(() => {
    try {
      if (activePhase !== null) {
        localStorage.setItem(`aiplf.workspace.${id}.activePhase`, JSON.stringify(activePhase))
      }
      localStorage.setItem(`aiplf.workspace.${id}.activatedPhases`, JSON.stringify(activatedPhases))
      localStorage.setItem(`aiplf.workspace.${id}.hasUsedPreSales`, JSON.stringify(hasUsedPreSales))
      localStorage.setItem(`aiplf.workspace.${id}.progressBarActivated`, JSON.stringify(progressBarActivated))
      localStorage.setItem(`aiplf.workspace.${id}.maxPostSalesIndex`, JSON.stringify(maxPostSalesIndex))
      localStorage.setItem(`aiplf.workspace.${id}.messages`, JSON.stringify(messages))
      localStorage.setItem(`aiplf.workspace.${id}.askedQuestions`, JSON.stringify(askedQuestions))
      localStorage.setItem(`aiplf.workspace.${id}.leftActiveTab`, JSON.stringify(leftActiveTab))
      localStorage.setItem(`aiplf.workspace.${id}.historyLogs`, JSON.stringify(historyLogs))
      localStorage.setItem(`aiplf.workspace.${id}.leftSidebarExpanded`, JSON.stringify(isLeftSidebarExpanded))
    } catch { /* ignore */ }
  }, [id, activePhase, activatedPhases, hasUsedPreSales, progressBarActivated, maxPostSalesIndex, messages, askedQuestions, leftActiveTab, historyLogs, isLeftSidebarExpanded])

  // Initial Load for Kickoff Text
  useEffect(() => {
    const stored = localStorage.getItem(KICKOFF_STORAGE_KEY)
    
    // Hàm kiểm tra xem văn bản có phải là bản mặc định chưa chỉnh sửa của bất kỳ ngôn ngữ nào không
    const isUneditedDefault = (text: string | null) => {
      if (!text) return true
      if (text.includes('[Cập nhật từ AI Chat') || text.includes('[AIチャットからの更新') || text.includes('[Update from AI Chat')) {
        return false
      }
      return true
    }

    if (stored && !isUneditedDefault(stored)) {
      setKickoffText(stored)
    } else {
      const defaultText = getDefaultKickoffText(locale)
      setKickoffText(defaultText)
      localStorage.setItem(KICKOFF_STORAGE_KEY, defaultText)
    }
    handleProgressChange(8, 100)
  }, [id, KICKOFF_STORAGE_KEY, locale])

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
      addLog(tc('Đã tải xuống Biên bản Kick-off: bien_ban_kickoff_ban_giao.txt'), 8)
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
      setActiveSuggestions(REENTRY_SUGG_BASE)
    } else if (activePhase === 8) {
      setActiveSuggestions([
        'Soạn biên bản Kick-off bàn giao dự án',
        'Xem danh sách ghi chú cuộc họp kick-off.',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ])
    } else if (activePhase === 9) {
      setActiveSuggestions([
        'Thêm 2 cảm biến quang',
        'Nâng cấp màn hình HMI',
        'Bổ sung 1 trục Servo Motor',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ])
    } else if (activePhase === 10) {
      setActiveSuggestions([
        'Xem sơ đồ bản vẽ CAD & mã Structured Text',
        'Tải về mã nguồn & bản vẽ thiết kế',
        'Giải thích sơ đồ đấu dây điện',
        'Giải thích logic điều khiển PLC',
        'Thông số kỹ thuật màn hình HMI',
        'Danh sách I/O điểm vào/ra',
        'Cập nhật tiến độ chế tạo tủ điện',
        'Kiểm tra linh kiện đầu vào',
        'Lập trình PLC tại xưởng',
        'Chuyển sang Bước 5: Debug'
      ])
    } else if (activePhase === 12) {
      setActiveSuggestions([
        'Kiểm tra lỗi cú pháp mã PLC.',
        'Tối ưu gọn mã nguồn (CASE..OF)',
        'Ghi chú chuẩn IEC & CASE cho mã nguồn',
        'Khôi phục mã nguồn về bản gốc',
        'Thêm còi báo động vào code.',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 6: Nghiệm thu & HDSD'
      ])
    } else if (activePhase === 11) {
      setActiveSuggestions([
        'Soạn tài liệu nghiệm thu / hướng dẫn sử dụng',
        'Tải Biên bản nghiệm thu.docx',
        'Tải Hướng dẫn vận hành HMI.pdf',
        'Chuyển sang Bước 1: Khảo sát & Phát sinh',
        'Chuyển sang Bước 2: Họp Kick-off',
        'Chuyển sang Bước 3: Thiết kế',
        'Chuyển sang Bước 4: Sản xuất',
        'Chuyển sang Bước 5: Debug'
      ])
    }
  }, [activePhase])
  // Translation board states

  // Design Phase 9 States

  // đẩy 1 cặp tin nhắn (người dùng + AI) vào chat.
  // tkey/tvars (tuỳ chọn): message AI động — render bằng tf() để dịch lại theo ngôn ngữ.
  const pushChat = (userText: string, aiText: string, sugg?: string[], tkey?: string, tvars?: Record<string, string | number>, action?: { label: string; to?: string; openOid?: string; openDoc?: { title: string; content: string }; phase?: number; version?: number }) => {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: userText, timestamp: ts },
      { id: `a-${Date.now() + 1}`, sender: 'ai', text: aiText, tkey, tvars, action, timestamp: ts },
    ])
    if (sugg) setActiveSuggestions(sugg)
    setInputVal('')
  }
  const PRE_SUGG = [
    'Tóm tắt dự án',
    'Lập dự toán khái quát',
    'Mô tả cấu thành hệ thống (đơn giản)',
    'Lập lịch trình khái quát',
    'Tạo đề án trình khách',
    'Tạo hồ sơ trình khách chi tiết'
  ]

  // Chip gợi ý cho Bước 7 theo NGỮ CẢNH (đổi sau mỗi lượt chat)
  const REENTRY_SUGG_BASE = ['đổi PLC sang Q03UDE', 'Nâng HMI lên 10 inch', 'Bổ sung 1 trục servo', 'Tóm tắt chênh lệch', 'Chuyển sang Bước 2: Họp Kick-off']
  const REENTRY_SUGG_PENDING = ['update', 'Tóm tắt chênh lệch', 'Lập dự toán phát sinh']
  const REENTRY_SUGG_AFTER = ['Lập dự toán phát sinh', 'Nâng HMI lên 10 inch', 'Tóm tắt chênh lệch', 'Chuyển sang Bước 2: Họp Kick-off']

  // Chat trong các bước pre-sales (1→6): AI ghi nhớ thông tin + tóm tắt + sinh đầu ra. KHÔNG gọi API.
  const handlePresalesChat = (text: string) => {
    // "Nhãn: giá trị" → ghi nhớ một thông tin → Step 1
    const mm = text.match(/^\s*(?:thêm|ghi chú)?\s*(.{2,40}?)\s*[:：]\s*(.+)$/)
    if (mm) {
      const label = mm[1].trim(), value = mm[2].trim()
      pre.addField(label, value)
      handlePhaseChange(1)
      pushChat(text, `✓ Đã ghi nhớ ${label}: ${value}`, PRE_SUGG, 'chat.ps.recorded', { label, value })
      return
    }
    // ý định sinh đầu ra → Step 3
    let gen = ''
    // Đề án trình khách (bước 2.5 — dạng slide): nhận diện TRƯỚC final
    if (/tạo đề án|đề án|đề xuất dạng slide|slide đề xuất|提案書|顧客提案|提案資料|提案を作成|proposal deck|proposal slide|create proposal|customer proposal/i.test(text)) gen = 'deck'
    // Hồ sơ trình khách (bước 6 — chi tiết/final): ưu tiên nhận diện trước
    else if (/hồ sơ trình khách|trình khách|tài liệu final|bản final|file final|tổng hợp.*trình|hồ sơ.*khách|đề xuất cuối|chốt đơn|dự toán chi tiết|tài liệu chi tiết|hồ sơ chi tiết|最終資料|詳細見積|final proposal|detailed proposal|detailed estimate/i.test(text)) gen = 'final'
    else if (text === 'Soạn nội dung tài liệu dự toán') gen = 'doc'
    else if (text === 'Mô tả cấu thành hệ thống (đơn giản)') gen = 'config'
    else if (text === 'Lập dự toán khái quát') gen = 'estimate'
    else if (text === 'Lập lịch trình khái quát') gen = 'schedule'
    else if (text === 'Soạn tài liệu nền đề xuất') gen = 'proposal'
    else if (/dự toán|báo giá|estimate/i.test(text)) gen = 'estimate'
    else if (/lịch trình|timeline|schedule/i.test(text)) gen = 'schedule'
    else if (/cấu thành/i.test(text)) gen = 'config'
    else if (/tài liệu nền|hồ sơ nền|proposal/i.test(text)) gen = 'proposal'
    if (gen) {
      const out = pre.generate(gen, locale)
      if (gen === 'deck') {
        handlePhaseChange(2.5)
        pushChat(
          text,
          'Đã tạo "Đề án trình khách" dạng slide từ thông tin đã ghi nhận ✓.\n\nFile đã lưu vào "Sản phẩm bàn giao" trong Thư viện. Bấm để xem ngay:',
          PRE_SUGG,
          'chat.ps.deckCreated',
          {},
          out ? { label: 'Xem đề án', openOid: out.oid, version: out.version, phase: 2.5 } : undefined,
        )
      } else if (gen === 'final') {
        handlePhaseChange(3)
        pushChat(
          text,
          'Đã tạo "Hồ sơ trình khách (chi tiết)" — bản tổng hợp thông tin + dự toán + lịch trình để trình khách ✓.\n\nFile đã lưu vào "Sản phẩm bàn giao" trong Thư viện. Bấm để xem ngay:',
          PRE_SUGG,
          'chat.ps.finalCreated',
          {},
          out ? { label: 'Xem hồ sơ trình khách', openOid: out.oid, version: out.version, phase: 3 } : undefined,
        )
      } else {
        // Bản nháp khái quát (dự toán/cấu thành/lịch trình/nền) → vẫn ở bước Kiểm tra, KHÔNG nhảy sang Trình dự toán
        handlePhaseChange(2)
        pushChat(text, 'Đã sinh tài liệu ✓ (xem ở mục "Đã tạo").', PRE_SUGG, 'chat.ps.generated')
      }
      return
    }
    // tóm tắt / xem lại → Step 2
    if (/tóm tắt|xem dữ liệu|dữ liệu đã|đã ghi|nhớ gì|thông tin dự án/i.test(text)) {
      const data = tSummary(pre.fields, locale)
      handlePhaseChange(2)
      pushChat(text, 'Dữ liệu dự án mình đang ghi nhớ:\n' + data, PRE_SUGG, 'chat.ps.summary', { data })
      return
    }
    // chat chung → ghi nhớ thêm từ nội dung → Step 1
    const added = pre.rememberFromContent(text)
    handlePhaseChange(1)
    if (added.length) pushChat(text, `Mình đã ghi nhớ thêm: ${added.join(', ')}.`, PRE_SUGG, 'chat.ps.remembered', { names: tFieldList(added, locale) })
    else pushChat(text, 'Đã hiểu.', PRE_SUGG, 'chat.ps.understood')
  }

  // Chat Bước 7 — ghi nhận vào BỘ NHỚ RIÊNG (reentry), KHÔNG điều hướng. Tham chiếu pre-sales làm baseline.
  const REENTRY_DELTAS: { kw: RegExp; name: string; delta: string; mat: string }[] = [
    { kw: /plc|melsec/, name: 'PLC điều khiển', delta: 'FX5U (Compact) → Q03UDE (Module)', mat: 'plc' },
    { kw: /hmi|màn hình/, name: 'Màn hình HMI', delta: 'GOT2000 7" → 10"', mat: 'hmi' },
    { kw: /servo|trục/, name: 'Trục Servo', delta: '3 trục → 4 trục (bổ sung MR-J5-40A)', mat: 'servo' },
    { kw: /an toàn|rơ le|safety/, name: 'Tiêu chuẩn an toàn', delta: 'ISO 13849 PLc → PLd (thêm Omron G9SE + 2 light curtain)', mat: '' },
    { kw: /cảm biến quang|quang/, name: 'Cảm biến quang', delta: '6 → 8 cái', mat: 'quang' },
  ]

  const syncReentryMaterials = (mat: string) => {
    if (!mat) return
    try {
      const materialsKey = `aiplf.materials.${id}`
      const stored = localStorage.getItem(materialsKey)
      if (!stored) return
      const list = JSON.parse(stored)
      const updated = list.map((item: any) => {
        if (mat === 'plc' && item.name.includes('PLC')) return { ...item, quantity: 1, unitPrice: 1200 }
        if (mat === 'servo' && item.name.includes('Servo')) return { ...item, quantity: 4 }
        if (mat === 'quang' && item.name.includes('Photoelectric')) return { ...item, quantity: 8 }
        if (mat === 'hmi' && item.name.includes('HMI')) return { ...item, quantity: 1, unitPrice: 850 }
        return item
      })
      localStorage.setItem(materialsKey, JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
      setMaterialsVersion(prev => prev + 1)
    } catch (e) { console.error(e) }
  }

  const handleReentryChat = (text: string) => {
    const low = text.toLowerCase()

    // 1) XÁC NHẬN — chỉ khi gõ đúng từ xác nhận & đang có đề xuất chờ → mới GHI vào bộ nhớ
    const isConfirm = /^\s*(update|cập nhật|đồng ý|đồng ?ý|ok|oke|okie|đồng|xác nhận|ghi|lưu|yes|y)\s*$/.test(low)
    if (isConfirm) {
      const pend = pendingReentryRef.current
      if (!pend) {
        pushChat(text, 'Chưa có đề xuất nào để ghi. Bạn cứ nêu chênh lệch sau khảo sát (PLC, HMI, servo, an toàn…), tôi sẽ đề xuất và hỏi xác nhận trước khi ghi.', REENTRY_SUGG_BASE)
        return
      }
      reentry.addField(pend.name, pend.value)
      syncReentryMaterials(pend.mat)
      pendingReentryRef.current = null
      // Dựng bản ghi chênh lệch hiện tại (các delta đã lưu + delta vừa thêm) để xem ngay trong canvas
      const base = reentry.fields.map(f => ({ name: f.name, value: f.value }))
      const i = base.findIndex(f => f.name.toLowerCase() === pend.name.toLowerCase())
      if (i >= 0) base[i] = { name: pend.name, value: pend.value }; else base.push({ name: pend.name, value: pend.value })
      const dTitle = locale === 'ja' ? '調査・追加費用ログ' : locale === 'en' ? 'SURVEY & CHANGE ORDER LOG' : 'NHẬT KÝ KHẢO SÁT & PHÁT SINH'
      const dCode = locale === 'ja' ? 'プロジェクトコード' : locale === 'en' ? 'Project code' : 'Mã dự án'
      const dSrc = locale === 'ja' ? '出典: ステップ7のチャットから記録' : locale === 'en' ? 'Source: Captured from Step 7 chat' : 'Nguồn: Ghi nhận từ chat Bước 7'
      const dHead = locale === 'ja' ? '## 元仕様（プリセールス）との差分' : locale === 'en' ? '## Differences vs original specs (pre-sales)' : '## Chênh lệch so với specs gốc (pre-sales)'
      const docContent = `# ${dTitle}\n${dCode}: ${id || 'CASE-2026-0245'}\n${dSrc}\n\n${dHead}\n` + base.map(f => `- ${tField(f.name, locale)}: ${tFieldValue(f.value, locale)}`).join('\n')
      pushChat(text, `✓ Đã ghi "${pend.name}: ${pend.value}" vào bộ nhớ khảo sát.${pend.mat ? ' Bảng vật tư (Bước 3) đã đồng bộ.' : ''}`, REENTRY_SUGG_AFTER, pend.mat ? 'chat.reentry.recordedSync' : 'chat.reentry.recorded', { name: tField(pend.name, locale), value: tFieldValue(pend.value, locale) }, { label: 'Xem chênh lệch đã lưu', openDoc: { title: locale === 'ja' ? '調査・追加費用ログ' : locale === 'en' ? 'Survey & Change Order Log' : 'Nhật ký khảo sát & Phát sinh', content: docContent } })
      return
    }

    // 2) TRA CỨU — tóm tắt / xem / đối chiếu → chỉ trả lời, KHÔNG ghi
    if (/tóm tắt|tóm lược|tổng hợp|tổng quan|xem lại|xem dữ liệu|xem chi tiết|liệt kê|thống kê|hiện trạng|so sánh|đối chiếu|chênh lệch|có gì|những gì/.test(low)) {
      const data = tSummary(reentry.fields, locale)
      if (reentry.total)
        pushChat(text, `Chênh lệch đã ghi nhận sau khảo sát (so với specs gốc pre-sales):\n${data}`, REENTRY_SUGG_BASE, 'chat.reentry.summary', { data })
      else
        pushChat(text, 'Chưa ghi nhận chênh lệch nào. Hãy cho tôi biết thay đổi sau khảo sát (PLC, HMI, servo, an toàn…).', REENTRY_SUGG_BASE)
      return
    }

    // 3) LẬP đầu ra (lệnh rõ ràng: "lập/tạo/xuất dự toán…") → sinh card từ bộ nhớ hiện có
    if (/(lập|tạo|xuất|soạn).*(dự toán|báo giá|phát sinh|change order)|(dự toán|báo giá|phát sinh).*(lập|tạo|xuất|soạn)/.test(low)) {
      if (!reentry.total) { pushChat(text, 'Chưa có chênh lệch nào để lập dự toán. Hãy ghi nhận thay đổi sau khảo sát trước.', REENTRY_SUGG_BASE); return }
      const out = reentry.generate('estimate', locale)
      pushChat(text, 'Đã lập "Dự toán phát sinh" từ các chênh lệch đã ghi nhận ✓. Bấm để xem ngay:', REENTRY_SUGG_AFTER, undefined, undefined, out ? { label: 'Xem dự toán phát sinh', openOid: out.oid } : undefined)
      return
    }

    // 4) HỎI chi phí/phát sinh (câu hỏi, chưa phải lệnh tạo) → chỉ trả lời, KHÔNG ghi
    if (/dự toán|báo giá|chi phí|phát sinh|estimate|bao nhiêu/.test(low)) {
      pushChat(text, reentry.total
        ? 'Dự toán phát sinh (ước tính minh hoạ) từ các chênh lệch đã ghi: +¥1,590,000 so với hợp đồng gốc. Gõ "lập dự toán phát sinh" nếu muốn tôi xuất thành tài liệu.'
        : 'Chưa có chênh lệch nào nên chưa có phát sinh để tính.', REENTRY_SUGG_BASE)
      return
    }

    // 5) CUNG CẤP THÔNG TIN → AI ĐỀ XUẤT (chưa ghi), chờ user gõ "update"/"đồng ý"
    let name = ''
    let value = ''
    let mat = ''
    const mm = text.match(/^\s*(?:thêm|ghi chú)?\s*(.{2,40}?)\s*[:：]\s*(.+)$/)
    const hit = REENTRY_DELTAS.find(d => d.kw.test(low))
    if (mm) {
      name = mm[1].trim(); value = mm[2].trim()
    } else if (hit) {
      name = hit.name; value = hit.delta; mat = hit.mat
    } else {
      name = 'Ghi chú khảo sát'; value = text
    }

    pendingReentryRef.current = { name, value, mat }
    pushChat(text, `Tôi đề xuất ghi nhận — ${name}: ${value}.\n\nGõ "update" (hoặc "đồng ý") để ghi vào bộ nhớ khảo sát, hoặc nhập tiếp để chỉnh lại đề xuất.`, REENTRY_SUGG_PENDING, 'chat.reentry.proposal', { name: tField(name, locale), value: tFieldValue(value, locale) })
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
    if (text === 'Nâng cấp lên Premium' || text === 'Xem bảng giá dịch vụ') {
      navigate('/membership')
      return
    }

    // Chip điều hướng "Chuyển sang Bước…" luôn đi nhánh navigation (kể cả khi đang ở pre-sales),
    // tránh bị regex "nhãn: giá trị" của pre-sales ghi nhầm thành field.
    const isStepNav = /^Chuyển sang Bước\s/.test(text) && !!suggestionResponses[text]

    // Trong luồng pre-sales (bước 1→6): xử lý riêng (mô phỏng), không dùng router post-order
    if (activePhase !== null && activePhase <= 3 && !isStepNav) { handlePresalesChat(text); return }

    const queryLower = text.toLowerCase()
    
    // AI Copilot restrictions for Free Tier
    if (membership === 'free') {
      const isCodeOrCadGeneration = 
        (queryLower.includes('sinh code') || queryLower.includes('tạo code') || queryLower.includes('tạo bản vẽ') || queryLower.includes('sinh bản vẽ') || queryLower.includes('cad') || queryLower.includes('dwg') || queryLower.includes('xuất code') || queryLower.includes('lập code')) &&
        !queryLower.includes('debug') && !queryLower.includes('lỗi') && !queryLower.includes('cú pháp');
        
      const isDocOrAcceptanceGeneration =
        queryLower.includes('nghiệm thu') || queryLower.includes('hướng dẫn vận hành') || queryLower.includes('hdsd') || queryLower.includes('tài liệu') || queryLower.includes('biên bản') || queryLower.includes('báo cáo');

      if (isCodeOrCadGeneration || isDocOrAcceptanceGeneration) {
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const declineMsg = L(
          `Rất tiếc, tính năng tự động sinh mã nguồn PLC/bản vẽ CAD và lập tài liệu nghiệm thu/HDSD chi tiết bằng AI chỉ hỗ trợ trên gói Enterprise Premium. Vui lòng nâng cấp gói thành viên của bạn để mở khóa toàn bộ quy trình thiết kế và tài liệu.`,
          `申し訳ありませんが、AIによるPLCコード・CAD図面の自動生成および検収書・GOT2000取扱説明書の自動作成機能は、Enterprise Premiumプランでのみご利用いただけます。プランをアップグレードして、設計プロセス全体をアンロックしてください。`,
          `We apologize, but automated PLC/CAD code generation and smart acceptance/GOT2000 document compilation are exclusive to the Enterprise Premium tier. Please upgrade your plan to unlock the entire engineering pipeline.`
        )
        
        setAskedQuestions((prev) => [...prev, text])
        setMessages((prev) => [
          ...prev, 
          { id: `u-${Date.now()}`, sender: 'user', text, timestamp: ts },
          { id: `a-${Date.now() + 1}`, sender: 'ai', text: declineMsg, timestamp: ts }
        ])
        setActiveSuggestions([
          'Nâng cấp lên Premium',
          'Xem bảng giá dịch vụ',
          'Quay lại hướng dẫn debug free'
        ])
        setInputVal('')
        return
      }
    }

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
        if (text === 'Tối ưu gọn mã nguồn (CASE..OF)') {
          setParaphraseCommand({ type: 'compact', trigger: Date.now() })
        } else if (text === 'Ghi chú chuẩn IEC & CASE cho mã nguồn') {
          setParaphraseCommand({ type: 'clean_case', trigger: Date.now() })
        } else if (text === 'Khôi phục mã nguồn về bản gốc') {
          setParaphraseCommand({ type: 'default', trigger: Date.now() })
        } else if (text === 'Tối ưu hóa mã PLC ST (Paraphrase).') {
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
    
    // Phase 7 (Khảo sát & Phát sinh) — ghi nhận vào bộ nhớ riêng (reentry), ở lại Bước 7
    if (activePhase === 7) {
      handleReentryChat(text)
      return
    }

    // AI Chat interceptor for Step 2 (Phase 8 - Họp Kick-off meeting minutes updates)
    if (activePhase === 8) {
      try {
        const storedText = localStorage.getItem(KICKOFF_STORAGE_KEY)
        const defaultText = getDefaultKickoffText(locale)
        const baseText = storedText || defaultText.split('\n')[0]
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const updatePrefix = locale === 'ja'
          ? `[AIチャットからの更新 ${timeStr}]`
          : locale === 'en'
            ? `[Update from AI Chat ${timeStr}]`
            : `[Cập nhật từ AI Chat ${timeStr}]`
        const newText = baseText + `\n- ${updatePrefix}: ${text}`
        localStorage.setItem(KICKOFF_STORAGE_KEY, newText)
        setKickoffText(newText)
        
        window.dispatchEvent(new Event('storage'))
        
        const aiResponse = `Đã ghi nhận ý kiến đóng góp của bạn và cập nhật vào Biên bản cuộc họp bien_ban_kickoff_ban_giao.txt ở khung bên trái. Các thông tin phân công này đã được đồng bộ.`
        pushChat(text, tc(aiResponse))
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
            const dir = quantityChange > 0 ? 'tăng thêm' : 'giảm bớt'
            const qty = Math.abs(quantityChange)
            const aiText = `Đã ghi nhận điều chỉnh vật tư từ chat: ${itemName} được ${dir} ${qty} cái. \n\nTổng giá trị vật tư đã được cập nhật tương ứng. Phiên bản mới này đã được đồng bộ để lưu lại tại Thư viện.`
            pushChat(text, aiText, undefined, quantityChange > 0 ? 'chat.materials.inc' : 'chat.materials.dec', { item: itemName, qty })
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
        keywords: ['nhập thông tin', 'pre-sales', 'presales', 'trước nhận đơn', 'trích xuất', 'nhập liệu dự án', '12 nhóm', 'dự toán', 'kiểm tra', 'trình dự toán'],
        tab: 'caseinput',
        title: 'Dự toán Pre-Sales',
        desc: 'Đang ở giai đoạn dự toán pre-sales. Thêm nguồn tài liệu hoặc kể về dự án để AI ghi nhớ; gõ "tóm tắt dự án" để xem lại, "lập dự toán" để sinh đầu ra.'
      },
      7: {
        keywords: ['tiếp nhận', 'khảo sát', 'nhập lại', 'reentry', 're-entry', 'chênh lệch', 'đối chiếu', 'so sánh', 'đơn hàng', 'spec', 'specs'], 
        tab: 'reentry', 
        title: 'Khảo sát & Phát sinh',
        desc: 'Tôi đã di chuyển màn hình đến Bước 1: Khảo sát & Phát sinh để bạn thực hiện đối chiếu chênh lệch thông số thiết bị.' 
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
        title: 'Debug',
        desc: 'Tôi đã di chuyển màn hình đến Bước 5: Debug. Tại đây bạn có thể soạn thảo, biên dịch thử và tối ưu code bằng AI.'
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

    let fallbackVars: Record<string, string | number> | undefined
    if (!isMatched) {
      explanationText = `Dựa trên câu hỏi "${text}" của bạn và các tài liệu nguồn đã nạp, tôi chưa tìm thấy từ khóa trùng khớp với 5 bước thiết kế sau đơn hàng. \n\nVui lòng thử hỏi về một trong các bước như: tiếp nhận khảo sát, họp kick-off bàn giao, điều chỉnh vật tư, thiết kế bản vẽ CAD / mã PLC, hoặc nghiệm thu HDSD.`
      fallbackVars = { q: text }
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
      tkey: fallbackVars ? 'chat.fallback' : undefined,
      tvars: fallbackVars,
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

  // Xóa nguồn khỏi danh sách (từ menu "..."). Nếu đang xem nguồn đó thì bỏ chọn viewer.
  const handleSourceDelete = (sourceId: string) => {
    setSources(prev => prev.filter(s => s.id !== sourceId))
    setActiveViewerSource(prev => (prev === sourceId ? null : prev))
    setSrcMenuOpen(null)
  }

  // Bắt đầu đổi tên nguồn (inline) / lưu tên mới.
  const startRenameSource = (sourceId: string, current: string) => {
    setRenamingSrcId(sourceId)
    setRenameSrcText(current)
    setSrcMenuOpen(null)
  }
  const commitRenameSource = () => {
    const name = renameSrcText.trim()
    if (renamingSrcId && name) {
      setSources(prev => prev.map(s => (s.id === renamingSrcId ? { ...s, title: name } : s)))
    }
    setRenamingSrcId(null)
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
    let tkey: string | undefined
    let tvars: Record<string, string | number> | undefined
    if (first) {
      const names = pre.rememberFromContent()
      if (names.length) { aiText = `Đã đọc ${files.length} tài liệu và ghi nhớ: ${names.join(', ')}.`; tkey = 'chat.add.filesRemembered'; tvars = { n: files.length, names: tFieldList(names, locale) } }
      else { aiText = `Đã thêm ${files.length} tài liệu.`; tkey = 'chat.add.filesAdded'; tvars = { n: files.length } }
    } else {
      const d = pre.reExtract(files[0].name)
      if (d.length) { aiText = `Đã đọc lại & đối chiếu — cập nhật ${d[0].name}.`; tkey = 'chat.add.reExtract'; tvars = { name: tField(d[0].name, locale) } }
      else { aiText = `Đã thêm ${files.length} tài liệu.`; tkey = 'chat.add.filesAdded'; tvars = { n: files.length } }
    }
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, sender: 'ai', text: aiText, tkey, tvars, timestamp: ts }])
    if (activePhase === null) handlePhaseChange(1)
  }
  const handleAddText = (text: string) => {
    setSources(prev => [...prev, { id: `txt-${Date.now()}`, title: 'Văn bản dán', type: 'Văn bản', size: text.length + ' ký tự', selected: true }])
    setAddSourceOpen(false)
    const names = pre.rememberFromContent(text)   // AI tự ghi nhớ từ nội dung dán
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, {
      id: `a-${Date.now()}`, sender: 'ai',
      text: names.length ? `Đã đọc văn bản và ghi nhớ: ${names.join(', ')}. Gõ "tóm tắt dự án" để xem toàn bộ.` : 'Đã thêm văn bản làm nguồn.',
      tkey: names.length ? 'chat.add.textRemembered' : 'chat.add.textAdded',
      tvars: names.length ? { names: tFieldList(names, locale) } : undefined,
      timestamp: ts,
    }])
    if (activePhase === null) handlePhaseChange(1)
  }
  const addSourceFromNote = (title: string) => {
    setSources(prev => [...prev, { id: `note-${Date.now()}`, title: title.slice(0, 40) + ' (ghi chú)', type: 'Ghi chú', size: '—', selected: true }])
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-mesh overflow-hidden text-slate-800 font-sans page-enter-right">
      {/* Header bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-none z-30 shadow-xs">
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
              {/* Status chip — chỉ hiện khi đang ở pre-sales */}
              {!progressBarActivated && (
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(v => !v)}
                    className="flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {t('ws.status.estimating')}
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                  {showStatusMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                      <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 space-y-0.5 animate-in fade-in duration-150">
                        <div className="px-2.5 py-1.5 text-[10px] text-amber-700 font-semibold flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          {t('ws.status.estimatingCurrent')}
                        </div>
                        <div className="border-t border-slate-100 mx-1 my-1" />
                        <button
                          onClick={() => {
                            setShowStatusMenu(false)
                            addLog(tc('Đã nhận đơn hàng — chuyển sang giai đoạn sau nhận đơn'), 7)
                            handlePhaseChange(7)
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-brand-700 hover:bg-brand-50 rounded-lg flex items-center gap-2 transition cursor-pointer"
                        >
                          <ArrowRight className="w-3 h-3 shrink-0" />
                          {t('ws.status.acceptOrder')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </h2>
            <p className="text-[10px] text-slate-450 font-mono">ID: {id || 'CASE-2026-0245'}</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3.5">
          {showLibraryBtn && (
            <Link 
              to={`/workspace/${id}/library`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-500/15 transition cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>{t('ws.header.library')}</span>
            </Link>
          )}

          {showLibraryBtn && <div className="h-5 w-px bg-slate-250" />}

          {/* Active User Display */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold select-none">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
              {t('ws.header.engineer')}
            </span>
            <span className="font-extrabold text-slate-800">{activeUser}</span>
          </div>


          {/* Membership Badge */}
          {membership === 'premium' ? (
            <Link
              to="/membership"
              className="text-[10px] font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-3 py-1.5 rounded-xl shadow-sm shadow-amber-500/10 flex items-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
            >
              <Star className="w-3.5 h-3.5 fill-white animate-pulse" />
              <span className="hidden lg:inline">PREMIUM MEMBER</span>
            </Link>
          ) : (
            <Link
              to="/membership"
              className="text-[10px] font-extrabold text-brand-700 hover:text-brand-800 bg-brand-50/60 hover:bg-brand-100/70 border border-brand-200/85 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 shadow-3xs shadow-brand-500/5"
            >
              <Zap className="w-3.5 h-3.5 text-brand-500 fill-brand-500/20 animate-pulse" />
              <span className="hidden lg:inline">FREE MEMBER</span>
            </Link>
          )}

          <button
            onClick={() => {
              setIsConfigOpen(true);
              setTempLocale(locale);
              setTempSiteTitle(siteTitle);
              setTempThemeColor(themeColor);
              setTempFontSize(fontSize);
              setTempShowLibraryBtn(showLibraryBtn);
              setTempShowChatbot(showChatbot);
              setTempShowSyncBadge(showSyncBadge);
              setTempShowCadTab(showCadTab);
              setTempIsDarkMode(isDarkMode);
              setTempActiveUser(activeUser);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{L('Cài đặt', '設定', 'Settings')}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* LEFT COLUMN SYSTEM WRAPPER - Expands on hover, collapses on mouse leave */}
        <div
          onMouseLeave={() => setIsLeftSidebarExpanded(false)}
          className="flex h-full shrink-0 relative z-15"
        >
          {/* COLUMN 1: LEFT SIDEBAR - Minimal vertical activity dock */}
          <aside className="shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-3 gap-2.5 w-14 select-none h-full z-15">
            {/* New conversation button */}
            <button
              onClick={() => {
                newConversation()
                setLeftActiveTab('conversations')
                setIsLeftSidebarExpanded(true)
              }}
              onMouseEnter={() => {
                setLeftActiveTab('conversations')
                setIsLeftSidebarExpanded(true)
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
              title={L('Tạo mới trò chuyện', '新しい会話を作成', 'Create new conversation')}
            >
              <Plus className="w-5 h-5" />
            </button>

            <div className="w-6 h-px bg-slate-200 my-1" />

            {/* Sources button */}
            <button
              onClick={() => {
                if (isLeftSidebarExpanded && leftActiveTab === 'sources') {
                  setIsLeftSidebarExpanded(false)
                } else {
                  setLeftActiveTab('sources')
                  setIsLeftSidebarExpanded(true)
                }
              }}
              onMouseEnter={() => {
                setLeftActiveTab('sources')
                setIsLeftSidebarExpanded(true)
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isLeftSidebarExpanded && leftActiveTab === 'sources'
                  ? 'bg-brand-500/10 text-brand-700 font-extrabold border border-brand-500/20'
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-800'
              }`}
              title={t('ws.panel.sources')}
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Process (Quy trình) button */}
            {progressBarActivated && (
              <button
                onClick={() => {
                  if (isLeftSidebarExpanded && leftActiveTab === 'process') {
                    setIsLeftSidebarExpanded(false)
                  } else {
                    setLeftActiveTab('process')
                    setIsLeftSidebarExpanded(true)
                  }
                }}
                onMouseEnter={() => {
                  setLeftActiveTab('process')
                  setIsLeftSidebarExpanded(true)
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isLeftSidebarExpanded && leftActiveTab === 'process'
                    ? 'bg-brand-500/10 text-brand-700 font-extrabold border border-brand-500/20'
                    : 'text-slate-555 hover:bg-slate-200/50 hover:text-slate-805'
                }`}
                title={L('Quy trình thực hiện', '業務フロー', 'Process')}
              >
                <ClipboardList className="w-4 h-4" />
              </button>
            )}

            {/* Conversations History button */}
            <button
              onClick={() => {
                if (isLeftSidebarExpanded && leftActiveTab === 'conversations') {
                  setIsLeftSidebarExpanded(false)
                } else {
                  setLeftActiveTab('conversations')
                  setIsLeftSidebarExpanded(true)
                }
              }}
              onMouseEnter={() => {
                setLeftActiveTab('conversations')
                setIsLeftSidebarExpanded(true)
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isLeftSidebarExpanded && leftActiveTab === 'conversations'
                  ? 'bg-brand-500/10 text-brand-700 font-extrabold border border-brand-500/20'
                  : 'text-slate-555 hover:bg-slate-200/50 hover:text-slate-805'
              }`}
              title={L('Lịch sử cuộc trò chuyện', '会話履歴', 'Conversation history')}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </aside>

          {/* COLUMN 1.5: SIDEBAR DRAWER PANEL */}
          {isLeftSidebarExpanded && (
            <aside className="absolute left-14 top-0 bottom-0 w-60 bg-white border-r border-slate-200 flex flex-col h-full z-20 shadow-md animate-fade-in-right animate-duration-150">
            {/* Header with Title and close button */}
            <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0 select-none">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-550">
                {leftActiveTab === 'sources'
                  ? t('ws.panel.sources')
                  : leftActiveTab === 'conversations'
                  ? L('Lịch sử trò chuyện', '会話履歴', 'Chat History')
                  : L('Quy trình', '業務フロー', 'Process')}
              </span>
              <button
                onClick={() => setIsLeftSidebarExpanded(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                title={L('Đóng', '閉じる', 'Close')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-2 min-h-0">
              {leftActiveTab === 'sources' && (
                <div className="space-y-1.5 h-full overflow-y-auto pr-0.5 scrollbar-thin">
                  <button onClick={() => setAddSourceOpen(true)} className="w-full flex items-center justify-center gap-1.5 py-2 mb-1.5 text-[11px] font-bold border border-slate-200 bg-slate-50/50 rounded-xl text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition duration-150 cursor-pointer">
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
                          {renamingSrcId === src.id ? (
                            <input
                              autoFocus
                              value={renameSrcText}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setRenameSrcText(e.target.value)}
                              onBlur={commitRenameSource}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRenameSource()
                                else if (e.key === 'Escape') setRenamingSrcId(null)
                              }}
                              className="text-[10px] font-bold w-full min-w-0 px-1 py-0.5 border border-brand-400 rounded bg-white text-slate-800 outline-none"
                            />
                          ) : (
                            <span className={`text-[10px] font-bold truncate ${
                              activeViewerSource === src.id ? 'text-brand-700 font-extrabold' : 'text-slate-800'
                            }`} title={src.title}>
                              {src.title}
                            </span>
                          )}
                        </div>

                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSrcMenuOpen(srcMenuOpen === src.id ? null : src.id)
                            }}
                            className="p-0.5 -mr-0.5 text-slate-400 hover:text-slate-750 hover:bg-slate-100 rounded transition cursor-pointer"
                            title={L('Tùy chọn', 'オプション', 'Options')}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                          {srcMenuOpen === src.id && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setSrcMenuOpen(null) }} />
                              <div className="absolute right-0 top-5 z-30 bg-white border border-slate-200 rounded-lg shadow-pop py-1 min-w-[120px] text-[10px] animate-in fade-in zoom-in-95 duration-150">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); startRenameSource(src.id, src.title) }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 cursor-pointer text-slate-700 font-semibold"
                                >
                                  <Pencil className="w-3 h-3 text-slate-500" /> {L('Đổi tên', '名前を変更', 'Rename')}
                                </button>
                                <div className="border-t border-slate-100 my-1 mx-1" />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleSourceDelete(src.id) }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-rose-50 cursor-pointer text-rose-600 font-semibold"
                                >
                                  <Trash2 className="w-3 h-3" /> {L('Xóa nguồn', 'ソースを削除', 'Delete source')}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[8px] text-slate-500 font-semibold font-mono">
                        <span>{tSourceMeta(src.type, locale)}</span>
                        <span>{tSourceMeta(src.size, locale)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {leftActiveTab === 'conversations' && (
                <div className="space-y-1.5 h-full flex flex-col min-h-0">
                  {/* Search input */}
                  <div className="relative mb-1.5 shrink-0">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      value={convSearch}
                      onChange={e => setConvSearch(e.target.value)}
                      placeholder={L('Tìm cuộc trò chuyện…', '会話を検索…', 'Search…')}
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-brand-500 text-[11px] text-slate-700"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
                    {conversations
                      .filter(c => translateConvTitle(c.title, locale).toLowerCase().includes(convSearch.toLowerCase()))
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map(c => {
                        const active = c.id === activeConvId
                        const editing = renameConvId === c.id
                        const isAI = c.createdBy === 'AI'
                        const displayName = translateUser(c.createdBy, locale)
                        return (
                          <div
                            key={c.id}
                            onClick={() => { if (!editing) switchConversation(c.id) }}
                            className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl transition duration-150 border ${editing ? '' : 'cursor-pointer'} ${active ? 'bg-brand-500/10 border-brand-500/15 shadow-3xs animate-pulse-subtle' : 'hover:bg-slate-50 border-transparent'}`}
                          >
                            <span className={`w-6 h-6 rounded-full text-[8.5px] font-extrabold flex items-center justify-center shrink-0 ${
                              isAI ? 'bg-brand-500/15 text-brand-700 border border-brand-500/20' : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20'
                            }`}>
                              {isAI ? 'AI' : displayName[0]}
                            </span>
                            {editing ? (
                              <input
                                autoFocus
                                value={renameConvVal}
                                onClick={e => e.stopPropagation()}
                                onChange={e => setRenameConvVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') renameConversation(c.id, renameConvVal); if (e.key === 'Escape') setRenameConvId(null) }}
                                onBlur={() => renameConversation(c.id, renameConvVal)}
                                className="flex-1 min-w-0 text-[11px] border border-brand-500 rounded-md px-1.5 py-0.5 outline-none bg-white text-slate-805"
                              />
                            ) : (
                              <div className="min-w-0 flex-1 leading-tight">
                                <div className={`text-[11px] truncate ${active ? 'font-bold text-brand-700' : 'font-semibold text-slate-750'}`}>
                                  {translateConvTitle(c.title, locale)}
                                </div>
                                <div className="text-[9px] text-slate-400 font-medium">
                                  {L('Tác giả', '作成者', 'Author')}: {displayName}
                                </div>
                              </div>
                            )}
                            {!editing && (
                              <div className="hidden group-hover:flex items-center shrink-0 gap-0.5 ml-auto">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setRenameConvId(c.id); setRenameConvVal(c.title) }}
                                  className="p-1 text-slate-400 hover:text-brand-600 hover:bg-white rounded transition cursor-pointer"
                                  title={L('Đổi tên', '名前を変更', 'Rename')}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id) }}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition cursor-pointer"
                                  title={L('Xóa cuộc trò chuyện', '会話を削除', 'Delete conversation')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {leftActiveTab === 'process' && (
                <div className="space-y-1.5 h-full overflow-y-auto pr-0.5 scrollbar-thin">
                  {phases.filter(p => p.isVisible !== false).map((p) => {
                    const phaseNum = p.num
                    const isActive = activePhase === phaseNum
                    const isPreSales = phaseNum <= 3
                    const isUnlocked = activatedPhases.includes(phaseNum)
                    return (
                      <button
                        key={phaseNum}
                        onClick={isPreSales || !isUnlocked ? undefined : () => handlePhaseChange(phaseNum)}
                        disabled={!isUnlocked}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left border transition duration-155 relative ${
                          isActive
                            ? 'bg-brand-500/10 border-brand-500/20 text-brand-700 font-extrabold shadow-3xs'
                            : !isUnlocked
                            ? 'opacity-40 cursor-not-allowed border-transparent'
                            : 'hover:bg-slate-50 border-transparent hover:border-slate-100 cursor-pointer'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 text-[10px] ${
                          isActive
                            ? 'gradient-primary border-brand-500 text-white shadow-3xs shadow-brand-500/15'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          {getDisplayStep(phaseNum)}
                        </div>
                        <div className="min-w-0 flex-1 leading-tight py-0.5">
                          <div className={`text-[10px] font-extrabold truncate ${isActive ? 'text-brand-700' : 'text-slate-700'}`}>
                            {phaseTitle(p.num)}
                          </div>
                          <div className="text-[8px] text-slate-400 font-medium font-mono truncate">{translateUsersRole(p.users, locale)}</div>
                        </div>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 absolute top-2 right-2 animate-pulse" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>
        )}
        </div>

        {/* COLUMN 2: CENTER WORKSPACE CANVAS (Width: flex-1) */}
        <main className="flex-1 bg-slate-50/50 flex flex-col h-full min-w-0 relative">
          
          {/* Active Phase Canvas Title Header */}
          {(!isZenMode || activeRightTab !== 'debug_code') && (
            <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-5 py-3.5 flex flex-col gap-3 flex-none shadow-xs select-none z-10 animate-fade-in-up">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-extrabold text-brand-700 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full tracking-wider font-mono">
                        {activePhase !== null ? (activePhase <= 3 ? t('ws.badge.preOrder') : t('ws.badge.postOrder')) : t('ws.badge.pipeline')}
                      </span>
                      <h1 className="text-sm font-extrabold text-slate-900">
                        {activePhase !== null ? phaseTitle(activePhase) : t('ws.canvas.detailArea')}
                      </h1>
                      
                      {/* Horizontal Process Progress Bar */}
                      {activePhase !== null && (
                        <div className="flex items-center gap-2 select-none ml-2 border-l border-slate-200 pl-2.5">
                          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40 relative">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${getDisplayStepPercent(activePhase)}%`
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-450 font-mono font-bold">
                            {getDisplayStep(activePhase)}/9
                          </span>
                        </div>
                      )}
                    </div>
                    {activePhase === null && (
                      <p className="mt-0.5 text-xs text-slate-500 leading-normal">
                        {t('ws.canvas.intro')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Component Canvas Rendering */}
          <div className={`flex-1 overflow-y-auto min-h-0 ${isZenMode && activeRightTab === 'debug_code' ? 'p-2 lg:p-4' : 'p-5'}`}>
            <div key={activeRightTab ?? 'empty'} className="animate-fade-in-up">
              {membership === 'free' && (activeRightTab === 'design_code' || activeRightTab === 'doc') ? (
                <div className="max-w-xl mx-auto my-12 bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-panel text-center flex flex-col items-center justify-center gap-5 animate-in zoom-in-95 duration-300 relative overflow-hidden select-none">
                  {/* Subtle decorative glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -z-10" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -z-10" />
                  
                  {/* Lock icon container */}
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 animate-bounce shadow-sm shadow-amber-500/5">
                    <Zap className="w-8 h-8 text-amber-500 fill-amber-500/20" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-800 uppercase font-mono flex items-center justify-center gap-1.5">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span>{L('Tính năng Premium', 'プレミアム機能', 'Premium Feature')}</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                      {activeRightTab === 'design_code'
                        ? L(
                            'Bước 10: Tự động sinh bản vẽ CAD và xuất mã nguồn PLC Structured Text (.l5k) tương thích hoàn toàn chỉ có ở gói Enterprise Premium.',
                            'ステップ10: CAD図面自動生成およびRockwell互換PLCコード(.l5k)出力機能は、Enterprise Premiumプランでのみご利用いただけます。',
                            'Step 10: Auto CAD drawing generation and full PLC Structured Text (.l5k) source export are exclusive to Enterprise Premium.'
                          )
                        : L(
                            'Bước 11: Tự động lập biên bản nghiệm thu (.docx) và hướng dẫn vận hành GOT2000 HMI (.pdf) chỉ có ở gói Enterprise Premium.',
                            'ステップ11: 検収書(.docx)およびGOT2000 HMI取扱説明マニュアル(.pdf)自動作成機能は、Enterprise Premiumプランでのみご利用いただけます。',
                            'Step 11: Auto Acceptance report (.docx) and GOT2000 HMI manual (.pdf) generation are exclusive to Enterprise Premium.'
                          )}
                    </p>
                  </div>
                  
                  <div className="pt-2 flex flex-col items-center gap-3 w-full">
                    <Link
                      to="/membership"
                      className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/15 cursor-pointer flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{L('Nâng cấp ngay', '今すぐアップグレード', 'Upgrade Now')}</span>
                    </Link>
                    
                    <p className="text-[10px] text-slate-400 font-mono italic">
                      {L('* Sử dụng miễn phí các bước pre-sales, khảo sát, và soạn thảo debug code thủ công.', '* プリセールス、現地調査、手動デバッグ機能は無料でご利用いただけます。', '* Free tiers cover pre-sales, field survey, and manual debug editors.')}
                    </p>
                  </div>
                </div>
              ) : activePhase === null ? (
                <div className="max-w-5xl mx-auto h-full flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-xs">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 font-mono">{t('ws.canvas.noOutput')}</h2>
                    <p className="mt-2 text-sm text-slate-600">{t('ws.canvas.noOutputDesc')}</p>
                    <p className="mt-4 text-xs text-slate-400 font-mono">{t('ws.canvas.noOutputHint')}</p>
                  </div>
                </div>
              ) : activeRightTab === 'reentry' && (
                <CaseInput
                  mode="reentry"
                  pre={reentry}
                  onConvertToSource={addSourceFromNote}
                  onToast={(m) => addLog(m, 7)}
                  openSignal={caseOpen ?? undefined}
                />
              )}

              {activeRightTab === 'caseinput' && (
                <CaseInput
                  mode={pre.round > 1 ? 'reentry' : 'initial'}
                  pre={pre}
                  onConvertToSource={addSourceFromNote}
                  onToast={(m) => addLog(m, activePhase ?? 1)}
                  openSignal={caseOpen ?? undefined}
                />
              )}

              {activeRightTab === 'materials' && (
                <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
                  <SmartMaterialsTable
                    projectId={id || 'default'}
                    currentUser={activeUser}
                    materialsVersion={materialsVersion}
                    showSyncBadge={showSyncBadge}
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

              {activeRightTab === 'design_code' && membership === 'premium' && (
                <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-300">
                  {/* Premium Segmented Tab Switcher */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-3xs select-none">
                      {showCadTab && (
                        <button
                          onClick={() => setDesignSubTab('cad')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            designSubTab === 'cad'
                              ? 'bg-brand-500 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {t('ws.design.tabCad')}
                        </button>
                      )}
                      <button
                        onClick={() => setDesignSubTab('code')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          designSubTab === 'code'
                            ? 'bg-brand-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {t('ws.design.tabCode')}
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono italic">
                      {t('ws.design.wideHint')}
                    </div>
                  </div>

                  {/* File Downloads Bar */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                        {t('ws.design.filesTitle')}
                      </h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">
                        {t('ws.design.filesSubtitle')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {designSubTab === 'cad' ? (
                        <button
                          onClick={() => {
                            alert('[MOCK DOWNLOAD] Đang tải bản vẽ CAD: Electrical_Layout_v2.0.dwg (1.4 MB)');
                            handleProgress10(100)
                            addLog(tc('Đã tải xuống bản vẽ CAD: Electrical_Layout_v2.0.dwg'), 10)
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-3xs"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{t('ws.design.dlCad')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            alert('[MOCK DOWNLOAD] Đang tải mã lệnh: PLC_Ladder_Q03UDE.l5k (89 KB)');
                            handleProgress10(100)
                            addLog(tc('Đã tải xuống mã lệnh PLC: PLC_Ladder_Q03UDE.l5k'), 10)
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-3xs"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>{t('ws.design.dlPlc')}</span>
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
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('ws.design.cadHeader')}</span>
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
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('ws.design.codeHeader')}</span>
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
                <div className={`${isZenMode ? 'max-w-none w-full px-0' : 'max-w-6xl mx-auto'} animate-in fade-in duration-300`}>
                  <DebugCodeStep
                    projectId={id || 'default'}
                    onProgressChange={handleProgress12}
                    onAddLog={(action) => addLog(action, 12)}
                    isZenMode={isZenMode}
                    toggleZenMode={toggleZenMode}
                    paraphraseCommand={paraphraseCommand}
                  />
                </div>
              )}

              {activeRightTab === 'doc' && membership === 'premium' && (
                <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                  <DocumentGenerator 
                    projectId={id || 'default'}
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
                            {t('ws.kickoff.title')}
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            bien_ban_kickoff_ban_giao.txt
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          {t('ws.kickoff.subtitle')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={downloadKickoffText}
                      disabled={isDownloadingKickoff}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 border border-slate-250 rounded-xl text-xs font-bold transition cursor-pointer"
                      title={t('ws.kickoff.downloadTitle')}
                    >
                      {isDownloadingKickoff ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{isDownloadingKickoff ? t('ws.kickoff.downloading') : t('ws.kickoff.download')}</span>
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
                      <span>{t('ws.kickoff.size')} <strong>{(new Blob([kickoffText]).size / 1024).toFixed(2)} KB</strong></span>
                      <span>{t('ws.kickoff.lines')} <strong>{kickoffText ? kickoffText.split('\n').length : 0}</strong></span>
                      <span>{t('ws.kickoff.words')} <strong>{kickoffText ? kickoffText.split(/\s+/).filter(Boolean).length : 0}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-450">
                      <span>{t('ws.kickoff.format')} <strong>Plain Text / MD</strong></span>
                      <span className="mx-1">•</span>
                      <span>{t('ws.kickoff.encoding')} <strong>UTF-8</strong></span>
                    </div>
                  </div>

                  {/* Guide Banner */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 leading-relaxed font-sans">
                    <strong>{t('ws.kickoff.guideLabel')}</strong> {t('ws.kickoff.guide')}
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
        {showChatbot && (
          <aside 
            className={`shrink-0 bg-slate-50/90 backdrop-blur-md border-l border-slate-200 flex flex-col h-full z-10 transition-all duration-300 relative ${
              isCopilotExpanded ? 'w-[420px]' : 'w-10'
            }`}
          >
            {isCopilotExpanded ? (
              <>
                {/* Copilot Header */}
                <div className="p-3 border-b border-slate-200 bg-slate-100/50 flex items-center justify-between shrink-0 relative">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="w-4 h-4 text-brand-550 shrink-0" />
                    <span className="text-xs font-mono font-extrabold text-slate-800 uppercase truncate">
                      {t('ws.copilot.title')}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => setIsCopilotExpanded(false)}
                      className="p-1 text-slate-550 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      title={t('ws.copilot.collapse')}
                    >
                      <PanelRightClose className="w-4 h-4" />
                    </button>
                  </div>
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
                      {/* 3D Glossy Avatar Sphere */}
                      {msg.sender === 'ai' ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-brand-500 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.3)] relative overflow-hidden border border-white/20 shrink-0 select-none group">
                          {/* Glossy top reflection overlay */}
                          <div className="absolute top-0.5 left-0.5 right-0.5 h-[45%] bg-white/25 rounded-full blur-[0.5px]" />
                          <Sparkles className="w-3.5 h-3.5 text-white drop-shadow-sm relative z-10" />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full text-white font-sans font-extrabold text-[10px] flex items-center justify-center shadow-md relative overflow-hidden border border-white/20 shrink-0 select-none ${
                          activeUser === 'Linh'
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20'
                            : activeUser === 'Kanai'
                            ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-amber-500/20'
                            : 'bg-gradient-to-tr from-indigo-500 to-sky-600 shadow-indigo-500/20'
                        }`}>
                          {/* Glossy top reflection overlay */}
                          <div className="absolute top-0.5 left-0.5 right-0.5 h-[45%] bg-white/20 rounded-full blur-[0.5px]" />
                          <span className="relative z-10">{activeUser[0]}</span>
                        </div>
                      )}

                      <div className="space-y-1.5 max-w-[85%]">
                        {/* Sender info & Time */}
                        <div className={`flex items-center gap-1.5 px-1 text-[10px] select-none ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <span className={`font-extrabold text-[10px] ${msg.sender === 'ai' ? 'text-brand-700' : 'text-slate-700'}`}>
                            {msg.sender === 'ai' ? 'AI' : activeUser}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-350" />
                          <span className="text-[9px] font-mono text-slate-400">{msg.timestamp}</span>
                        </div>
                        {/* 3D Glassmorphic Bubble content */}
                        <div
                          className={`leading-relaxed text-xs whitespace-pre-line relative ${
                            msg.sender === 'ai'
                              ? 'p-4 rounded-[22px] rounded-tl-none border border-slate-200/70 shadow-[0_12px_30px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.01)] bg-white text-slate-800'
                              : 'p-3.5 px-4 rounded-[22px] rounded-tr-none border border-emerald-600/10 shadow-[0_10px_25px_rgba(16,185,129,0.18)] bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 text-white font-medium'
                          }`}
                        >
                          {msg.sender === 'ai' ? (
                            <div>
                              {(msg.tkey ? tf(msg.tkey, msg.tvars ?? {}) : tc(msg.text)).split(/(\[\d+\])/g).map((part, index) => {
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
                            <span>{tc(msg.text)}</span>
                          )}
                        </div>

                        {/* Actions rendered as premium 3D file attachment cards */}
                        {(msg.action?.openOid || msg.action?.openDoc) && (
                          <div
                            onClick={() => { handlePhaseChange(msg.action!.phase ?? 7); setCaseOpen({ oid: msg.action!.openOid, version: msg.action!.version, doc: msg.action!.openDoc, n: Date.now() }) }}
                            className="mt-2 bg-white border border-slate-200/80 hover:border-brand-500/40 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-3xs cursor-pointer group hover:bg-brand-500/5 transition duration-200"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-650 shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-slate-800 group-hover:text-brand-700 transition-colors truncate">
                                  {tc(msg.action.label)}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">Grounding Document • Workspace Source</div>
                              </div>
                            </div>
                            <span className="text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all text-[11px] shrink-0 mr-1">→</span>
                          </div>
                        )}
                        {msg.action?.to && !msg.action.openOid && !msg.action.openDoc && (
                          <Link
                            to={msg.action.to}
                            className="mt-2 bg-white border border-slate-200/80 hover:border-brand-500/40 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-3xs cursor-pointer group hover:bg-brand-500/5 transition duration-205 no-underline"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-650 shrink-0">
                                <FolderOpen className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-slate-800 group-hover:text-brand-700 transition-colors truncate">
                                  {tc(msg.action.label)}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">Navigate Route • Workspace Section</div>
                              </div>
                            </div>
                            <span className="text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all text-[11px] shrink-0 mr-1">→</span>
                          </Link>
                        )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions (Wrapping capsule flow - showing multiple questions at once) */}
              <div className="p-3 bg-transparent flex-none space-y-2">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none px-1">
                  <span>{t('ws.copilot.suggest')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-0.5 scrollbar-thin">
                  {activeSuggestions
                    .filter((prompt) => !askedQuestions.includes(prompt))
                    .map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(prompt)}
                        className="px-3 py-1.5 text-[10px] font-bold rounded-full transition-all duration-150 flex items-center cursor-pointer shadow-3xs hover:shadow-2xs active:scale-95 whitespace-nowrap bg-white text-slate-600 hover:text-brand-650 border border-slate-200 hover:border-brand-500/20 hover:bg-brand-50/20"
                      >
                        <span>{tc(prompt)}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Chat Composer */}
              <div className="p-3.5 bg-transparent flex-none">
                <form 
                  onSubmit={handleSend} 
                  className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.06)] p-2.5 transition focus-within:border-brand-500/50 focus-within:shadow-[0_12px_36px_rgba(10,186,181,0.08)] flex flex-col gap-2"
                >
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
                    <textarea
                      rows={2}
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder={t('ws.copilot.placeholder')}
                      className="flex-1 bg-transparent text-xs focus:outline-none resize-none py-1.5 px-1 text-slate-800 placeholder-slate-400 min-h-[40px] leading-relaxed"
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
                      className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-950 active:scale-90 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.18)] relative overflow-hidden transition-all duration-200 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {/* Glossy sphere top overlay */}
                      <div className="absolute top-0.5 left-0.5 right-0.5 h-[45%] bg-white/20 rounded-full blur-[0.5px]" />
                      <Send className="w-3.5 h-3.5 text-white drop-shadow-sm relative z-10" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsCopilotExpanded(true)}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-start pt-6 gap-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition cursor-pointer select-none"
            >
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="[writing-mode:vertical-rl] whitespace-nowrap font-extrabold text-[10px] uppercase tracking-wider mt-2 font-mono">
                {t('ws.copilot.open')}
              </span>
            </button>
          )}
          </aside>
        )}

      </div>

      <AddSourceModal open={addSourceOpen} onClose={() => setAddSourceOpen(false)} onAddFiles={handleAddFiles} onAddText={handleAddText} />



      {/* Basic Web configuration modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-[480px] space-y-4 shadow-pop animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-950 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-brand-500" />
                <span>{L('Cấu hình Hệ thống (Setting)', 'システム設定 (Setting)', 'System Settings')}</span>
              </h3>
              <button
                onClick={() => {
                  setIsConfigOpen(false);
                }}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex gap-4 border-b border-slate-100 pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSettingsActiveTab('general')}
                className={`pb-1 px-1 border-b-2 cursor-pointer transition ${
                  settingsActiveTab === 'general'
                    ? 'border-brand-500 text-brand-600 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {L('Cấu hình chung', '一般設定', 'General')}
              </button>
              <button
                type="button"
                onClick={() => setSettingsActiveTab('appearance')}
                className={`pb-1 px-1 border-b-2 cursor-pointer transition ${
                  settingsActiveTab === 'appearance'
                    ? 'border-brand-500 text-brand-600 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {L('Giao diện & Chủ đề', '外観・テーマ', 'Appearance & Theme')}
              </button>
              <button
                type="button"
                onClick={() => setSettingsActiveTab('features')}
                className={`pb-1 px-1 border-b-2 cursor-pointer transition ${
                  settingsActiveTab === 'features'
                    ? 'border-brand-500 text-brand-600 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {L('Quản lý tính năng', '機能管理', 'Feature management')}
              </button>
            </div>
            
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 text-xs">
              {settingsActiveTab === 'general' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">{L('Tên project (Project Title)', 'プロジェクト名 (Project Title)', 'Project Title')}</label>
                    <input
                      type="text"
                      value={tempSiteTitle}
                      onChange={(e) => setTempSiteTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-slate-800 font-medium"
                      placeholder={L('Nhập tên dự án...', 'プロジェクト名を入力…', 'Enter project name…')}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">{L('Ngôn ngữ Hệ thống (System Language)', 'システム言語 (System Language)', 'System Language')}</label>
                    <FancySelect
                      value={tempLocale}
                      onChange={(v) => setTempLocale(v as any)}
                      options={[
                        { value: 'vi', label: 'Tiếng Việt (Vietnamese)', badge: 'VN' },
                        { value: 'en', label: 'English (US)', badge: 'US' },
                        { value: 'ja', label: '日本語 (Japanese)', badge: 'JP' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">{L('Vai trò Đăng nhập (Active Role)', 'ログイン役割 (Active Role)', 'Active Role')}</label>
                    <FancySelect
                      value={tempActiveUser}
                      onChange={(v) => setTempActiveUser(v as any)}
                      options={[
                        { value: 'Linh', label: L('Linh (Kỹ sư Việt Nam)', 'Linh（ベトナム人エンジニア）', 'Linh (Vietnamese engineer)'), badge: 'VN' },
                        { value: 'Kanai', label: L('Kanai (Chuyên gia Nhật Bản)', 'Kanai（日本人スペシャリスト）', 'Kanai (Japanese specialist)'), badge: 'JP' },
                        { value: 'AI', label: L('AI Agent (Trợ lý tự động)', 'AIエージェント（自動アシスタント）', 'AI Agent (automated assistant)'), badge: 'AI' },
                      ]}
                    />
                  </div>

                  {/* Danger zone — Xóa dự án */}
                  <div className="pt-3 mt-3 border-t border-rose-100">
                    <p className="font-bold text-rose-600 mb-1.5 uppercase tracking-wider text-[11px]">{L('Vùng nguy hiểm (Danger Zone)', '危険ゾーン (Danger Zone)', 'Danger Zone')}</p>
                    <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-rose-200 bg-rose-50/60">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-700">{L('Xóa dự án này', 'このプロジェクトを削除', 'Delete this project')}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {L('Xóa vĩnh viễn dự án', 'プロジェクトを完全に削除', 'Permanently delete project')} <span className="font-mono font-bold text-slate-700">{id}</span> {L('cùng toàn bộ nguồn, hội thoại và dữ liệu liên quan. Không thể hoàn tác.', 'とすべてのソース・会話・関連データを削除します。元に戻せません。', 'and all sources, conversations and related data. This cannot be undone.')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteProject(true)}
                        className="shrink-0 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{L('Xóa dự án', 'プロジェクト削除', 'Delete project')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'appearance' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 block mb-1">{L('Tông màu chủ đạo (Brand Theme Color)', 'メインテーマカラー (Brand Theme Color)', 'Brand Theme Color')}</label>
                    <div className="grid grid-cols-5 gap-2.5">
                      {[
                        { name: 'teal', label: 'Teal', color: '#0abab5' },
                        { name: 'blue', label: 'Blue', color: '#3b82f6' },
                        { name: 'indigo', label: 'Indigo', color: '#6366f1' },
                        { name: 'emerald', label: 'Green', color: '#10b981' },
                        { name: 'orange', label: 'Orange', color: '#f97316' }
                      ].map((theme) => (
                        <button
                          key={theme.name}
                          type="button"
                          onClick={() => setTempThemeColor(theme.name)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition cursor-pointer ${
                            tempThemeColor === theme.name
                              ? 'border-brand-500 bg-brand-500/5 font-bold text-brand-650'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-full shadow-sm flex items-center justify-center text-white text-[10px]"
                            style={{ backgroundColor: theme.color }}
                          >
                            {tempThemeColor === theme.name && "✓"}
                          </span>
                          <span className="text-[10px] text-slate-600">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 block">{L('Kích thước chữ (App Font Size)', '文字サイズ (App Font Size)', 'App Font Size')}</label>
                    <div className="flex gap-2">
                      {(['small', 'medium', 'large'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setTempFontSize(sz)}
                          className={`flex-1 py-2 border rounded-xl font-bold transition cursor-pointer ${
                            tempFontSize === sz
                              ? 'border-brand-500 bg-brand-500/5 text-brand-600 font-extrabold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-655'
                          }`}
                        >
                          {sz === 'small' ? L('Nhỏ (14px)', '小 (14px)', 'Small (14px)') : sz === 'medium' ? L('Vừa (15px)', '中 (15px)', 'Medium (15px)') : L('Lớn (16px)', '大 (16px)', 'Large (16px)')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 bg-slate-50/50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-700">{L('Chế độ tối (Dark IDE Theme)', 'ダークモード (Dark IDE Theme)', 'Dark IDE Theme')}</p>
                      <p className="text-[10px] text-slate-450">{L('Thay đổi hình nền tối chuẩn Lập trình viên', '開発者向けのダーク背景に切り替えます', 'Switch to a developer-style dark background')}</p>
                    </div>
                    <div
                      onClick={() => setTempIsDarkMode(!tempIsDarkMode)}
                      className={`switch ${tempIsDarkMode ? 'on' : ''}`}
                    />
                  </div>
                </div>
              )}

              {settingsActiveTab === 'features' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 bg-slate-50/50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-700">{L('Thư viện dự án (Project Library)', 'プロジェクトライブラリ (Project Library)', 'Project Library')}</p>
                      <p className="text-[10px] text-slate-450">{L('Hiển thị nút lưu trữ/comparative library ở header', 'ヘッダーにライブラリボタンを表示', 'Show the library button in the header')}</p>
                    </div>
                    <div
                      onClick={() => setTempShowLibraryBtn(!tempShowLibraryBtn)}
                      className={`switch ${tempShowLibraryBtn ? 'on' : ''}`}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 bg-slate-50/50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-700">{L('Trợ lý AI Copilot (AI Chatbot Pane)', 'AIコパイロット (AI Chatbot Pane)', 'AI Copilot (AI Chatbot Pane)')}</p>
                      <p className="text-[10px] text-slate-450">{L('Hiển thị khung chat trợ lý bên tay phải', '右側にアシスタントチャットを表示', 'Show the assistant chat pane on the right')}</p>
                    </div>
                    <div
                      onClick={() => setTempShowChatbot(!tempShowChatbot)}
                      className={`switch ${tempShowChatbot ? 'on' : ''}`}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 bg-slate-50/50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-700">{L('Đồng bộ Thời gian thực (Realtime Sync)', 'リアルタイム同期 (Realtime Sync)', 'Realtime Sync')}</p>
                      <p className="text-[10px] text-slate-450">{L('Hiện badge đồng bộ trực tiếp ở bảng vật tư', '資材表にライブ同期バッジを表示', 'Show the live-sync badge on the materials table')}</p>
                    </div>
                    <div
                      onClick={() => setTempShowSyncBadge(!tempShowSyncBadge)}
                      className={`switch ${tempShowSyncBadge ? 'on' : ''}`}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 bg-slate-50/50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-700">{L('Tab Sơ đồ Mạch CAD (CAD Viewer)', 'CAD回路図タブ (CAD Viewer)', 'CAD Diagram Tab (CAD Viewer)')}</p>
                      <p className="text-[10px] text-slate-450">{L('Mở khóa tab xem bản vẽ DWG tại Bước 4', 'ステップ4でDWG図面表示タブを有効化', 'Unlock the DWG drawing tab at Step 4')}</p>
                    </div>
                    <div
                      onClick={() => setTempShowCadTab(!tempShowCadTab)}
                      className={`switch ${tempShowCadTab ? 'on' : ''}`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLocale(tempLocale);
                  setSiteTitle(tempSiteTitle);
                  setThemeColor(tempThemeColor);
                  setFontSize(tempFontSize);
                  setShowLibraryBtn(tempShowLibraryBtn);
                  setShowChatbot(tempShowChatbot);
                  setShowSyncBadge(tempShowSyncBadge);
                  setShowCadTab(tempShowCadTab);
                  setIsDarkMode(tempIsDarkMode);
                  setActiveUser(tempActiveUser);
                  setIsConfigOpen(false);
                }}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition cursor-pointer shadow-sm animate-pulse-slow"
              >
                {L('Lưu cài đặt', '設定を保存', 'Save Settings')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hộp xác nhận xóa dự án */}
      {confirmDeleteProject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-[400px] space-y-4 shadow-pop animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">{L('Xóa dự án này?', 'このプロジェクトを削除しますか？', 'Delete this project?')}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {L('Bạn sắp xóa vĩnh viễn dự án', 'プロジェクトを完全に削除しようとしています', 'You are about to permanently delete project')} <span className="font-mono font-bold text-slate-800">{id}</span>.
              {' '}{L('Toàn bộ nguồn, hội thoại và dữ liệu của dự án sẽ bị xóa và', 'すべてのソース・会話・データが削除され、', 'All sources, conversations and data will be deleted and')} <span className="font-bold">{L('không thể khôi phục', '復元できません', 'cannot be recovered')}</span>.
            </p>
            <div className="flex justify-end gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setConfirmDeleteProject(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition cursor-pointer"
              >
                {L('Hủy', 'キャンセル', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{L('Xóa vĩnh viễn', '完全に削除', 'Delete permanently')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
