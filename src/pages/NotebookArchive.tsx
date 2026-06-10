import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, FolderOpen, FileText, Download,
  FileCode, Layers, Search, X, ArrowUpDown, Filter,
  Brain, Boxes, MoreVertical, History, Share2,
  RotateCcw, Trash2, ExternalLink, Sparkles, GitCompare
} from 'lucide-react'
import MarkdownLite from '@/components/MarkdownLite'
import { DEMO_CASE_IDS } from '@/hooks/usePresalesState'
import { useI18n } from '@/i18n/I18nProvider'
import { tField, tFieldValue } from '@/i18n/chat'

interface ProjectFile {
  id: string
  name: string
  category: 'input' | 'output'
  type: string
  size: string
  version: string
  createdAt: string
  author: string
  approvalStatus: 'approved' | 'reviewing' | 'draft'
  tags: string[]
  summary: string
  previewContent?: string
}

export default function NotebookArchive() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, locale } = useI18n()
  const L = (vi: string, ja: string, en: string) => locale === 'ja' ? ja : locale === 'en' ? en : vi

  // Localize dữ liệu file tĩnh (type/summary/preview) theo ngôn ngữ — áp ở render để reactive khi đổi locale.
  type Tri = [string, string, string]
  const FILE_LOC: Record<string, { type?: Tri; summary?: Tri; preview?: Tri }> = {
    'in-1': {
      type: ['Markdown Specs (Bộ nhớ AI)', 'Markdown仕様書 (AI記憶)', 'Markdown specs (AI memory)'],
      summary: [
        'Hồ sơ đặc tả gốc do AI tổng hợp từ thông tin khách cung cấp ở giai đoạn pre-sales. Là nguồn sự thật để AI đối chiếu khi sinh dự toán, bản vẽ và code ở các bước sau.',
        'プリセールス段階で顧客から提供された情報をAIがまとめた原仕様書。後工程で見積・図面・コードを生成する際にAIが参照する信頼できる情報源です。',
        'The original spec AI compiled from customer-provided info during pre-sales. The single source of truth AI references when generating estimates, drawings and code in later steps.',
      ],
      preview: [
        `# ĐẶC TẢ DỰ ÁN (PROJECT SPECS) — V1
Mã dự án: WW2 Welding Cell
Nguồn: Tổng hợp từ chat pre-sales (Bước 1-3)

## 1. Yêu cầu khách hàng
- Dây chuyền hàn & đo kiểm phôi tự động cho line WW2.
- Điều khiển vị trí phôi chính xác bằng Servo Mitsubishi MR-J5.

## 2. Cấu hình dự kiến (lúc báo giá)
- PLC: Mitsubishi Melsec FX5U (dòng Compact).
- HMI: GOT2000 7-inch.
- Servo: 3 trục (A1, A2, A3).
- An toàn: ISO 13849 PLc.

## 3. Ràng buộc
- Ngân sách dự kiến + thời gian giao theo dự toán đính kèm.

→ AI dùng file này làm mốc để phát hiện CHÊNH LỆCH ở Bước 7 (Khảo sát & Phát sinh).`,
        `# プロジェクト仕様 (PROJECT SPECS) — V1
プロジェクトコード: WW2 Welding Cell
出典: プリセールスチャット（ステップ1-3）から集約

## 1. 顧客要件
- WW2ライン向けの自動溶接・検査ライン。
- 三菱サーボ MR-J5 によるワーク位置の高精度制御。

## 2. 想定構成（見積時点）
- PLC: 三菱 Melsec FX5U（コンパクト型）。
- HMI: GOT2000 7インチ。
- サーボ: 3軸（A1, A2, A3）。
- 安全: ISO 13849 PLc。

## 3. 制約
- 想定予算 + 添付見積に基づく納期。

→ AIはこのファイルを基準に、ステップ7（調査・追加費用）で差分を検出します。`,
        `# PROJECT SPECS — V1
Project code: WW2 Welding Cell
Source: Aggregated from pre-sales chat (Steps 1-3)

## 1. Customer requirements
- Automated welding & inspection line for the WW2 line.
- Precise workpiece positioning via Mitsubishi MR-J5 servo.

## 2. Planned configuration (at quotation)
- PLC: Mitsubishi Melsec FX5U (Compact).
- HMI: GOT2000 7-inch.
- Servo: 3 axes (A1, A2, A3).
- Safety: ISO 13849 PLc.

## 3. Constraints
- Estimated budget + delivery time per the attached estimate.

→ AI uses this file as a baseline to detect DIFFERENCES in Step 7 (Survey & Change Orders).`,
      ],
    },
    'in-2': {
      type: ['Nhật ký Khảo sát (Bộ nhớ AI)', '調査ログ (AI記憶)', 'Survey log (AI memory)'],
      summary: [
        'Bản ghi chênh lệch kỹ thuật thực tế sau khi nhận đơn, do AI cập nhật từ chat ở Bước 7. AI so file này với Specs_V1 để tính phát sinh và cập nhật bản vẽ/code.',
        '受注後の実地調査による技術差分の記録。ステップ7のチャットからAIが更新します。AIはこのファイルをSpecs_V1と比較して追加費用を算出し、図面・コードを更新します。',
        'A record of actual technical differences after order intake, updated by AI from the Step 7 chat. AI compares this with Specs_V1 to compute change orders and update drawings/code.',
      ],
      preview: [
        `# NHẬT KÝ KHẢO SÁT & THAY ĐỔI THÔNG SỐ — V2
Mã dự án: WW2 Welding Cell
Nguồn: Tổng hợp từ chat Bước 7 (Khảo sát & Phát sinh)

## Chênh lệch so với Specs_V1
- PLC: FX5U (Compact) → Q03UDE (Modulized) + module I/O mở rộng.
  Lý do: I/O thực tế tăng 28% + cần Ethernet tốc độ cao cho Robot hàn.
- HMI: GOT2000 7-inch → 10-inch.
- Servo: 3 trục → 4 trục (bổ sung MR-J5-40A cho băng tải phụ).
- An toàn: ISO 13849 PLc → PLd (thêm rơ-le Omron G9SE + 2 light curtain).

→ AI đã cập nhật bảng vật tư (Bước 3) và bản vẽ/code (Bước 4) theo delta này.`,
        `# 調査・仕様変更ログ — V2
プロジェクトコード: WW2 Welding Cell
出典: ステップ7チャット（調査・追加費用）から集約

## Specs_V1 との差分
- PLC: FX5U（コンパクト）→ Q03UDE（モジュール型）+ 拡張I/Oモジュール。
  理由: 実I/Oが28%増加 + 溶接ロボット用の高速Ethernetが必要。
- HMI: GOT2000 7インチ → 10インチ。
- サーボ: 3軸 → 4軸（補助コンベヤ用に MR-J5-40A を追加）。
- 安全: ISO 13849 PLc → PLd（Omron G9SE リレー + ライトカーテン2台を追加）。

→ AIはこの差分に基づき資材表（ステップ3）と図面・コード（ステップ4）を更新済み。`,
        `# SURVEY & SPEC CHANGE LOG — V2
Project code: WW2 Welding Cell
Source: Aggregated from Step 7 chat (Survey & Change Orders)

## Differences vs Specs_V1
- PLC: FX5U (Compact) → Q03UDE (Modular) + expansion I/O module.
  Reason: actual I/O up 28% + high-speed Ethernet needed for the welding robot.
- HMI: GOT2000 7-inch → 10-inch.
- Servo: 3 axes → 4 axes (added MR-J5-40A for the auxiliary conveyor).
- Safety: ISO 13849 PLc → PLd (added Omron G9SE relay + 2 light curtains).

→ AI has updated the materials list (Step 3) and drawings/code (Step 4) per this delta.`,
      ],
    },
    'f-4': {
      summary: [
        'Mã logic điều khiển tuần tự chu trình hàn tự động cho toàn bộ hệ thống đồ gá WW2.',
        'WW2治具システム全体の自動溶接サイクルを制御するシーケンスロジックコード。',
        'Sequential control logic code for the automated welding cycle of the entire WW2 fixture system.',
      ],
      preview: [
        `// PLC Ladder Logic Structure (L5K)
PROGRAM MainProgram
  TAGS:
    Start_Button : BOOL; // Nút nhấn khởi động
    Auto_Welding_Sequence : BOOL; // Chu trình tự động
    Welding_Robot_Active : BOOL; // Robot hàn kích hoạt
  END_TAGS

  // Rung 1: Khởi động chu trình tự động
  LD Start_Button AND NOT Emergency_Stop OUT Auto_Welding_Sequence;

  // Rung 2: Kích hoạt tín hiệu robot
  LD Auto_Welding_Sequence AND Cylinder_Extended OUT Welding_Robot_Active;
END_PROGRAM`,
        `// PLCラダーロジック構成 (L5K)
PROGRAM MainProgram
  TAGS:
    Start_Button : BOOL; // 起動ボタン
    Auto_Welding_Sequence : BOOL; // 自動サイクル
    Welding_Robot_Active : BOOL; // 溶接ロボット起動
  END_TAGS

  // Rung 1: 自動サイクルの起動
  LD Start_Button AND NOT Emergency_Stop OUT Auto_Welding_Sequence;

  // Rung 2: ロボット信号の起動
  LD Auto_Welding_Sequence AND Cylinder_Extended OUT Welding_Robot_Active;
END_PROGRAM`,
        `// PLC Ladder Logic Structure (L5K)
PROGRAM MainProgram
  TAGS:
    Start_Button : BOOL; // Start button
    Auto_Welding_Sequence : BOOL; // Automatic cycle
    Welding_Robot_Active : BOOL; // Welding robot active
  END_TAGS

  // Rung 1: Start the automatic cycle
  LD Start_Button AND NOT Emergency_Stop OUT Auto_Welding_Sequence;

  // Rung 2: Activate robot signal
  LD Auto_Welding_Sequence AND Cylinder_Extended OUT Welding_Robot_Active;
END_PROGRAM`,
      ],
    },
    'f-5': {
      summary: [
        'Bản vẽ sơ đồ mạch đấu nối dây động lực, nguồn 24VDC, rơ le an toàn và cổng IO mô đun Mitsubishi.',
        '動力配線、24VDC電源、安全リレー、三菱モジュールI/Oポートの回路接続図。',
        'Wiring schematic for power cabling, 24VDC supply, safety relays and Mitsubishi module I/O ports.',
      ],
    },
    'f-6': {
      summary: [
        'Biên bản nghiệm thu kỹ thuật bàn giao dự án đã được ký số bởi đại diện Cowatech và khách hàng.',
        'Cowatech担当者と顧客が電子署名した、プロジェクト引き渡しの技術検収調書。',
        'Technical acceptance & handover record, digitally signed by Cowatech and the customer.',
      ],
    },
    'f-7': {
      summary: [
        'Tài liệu hướng dẫn vận hành chi tiết các màn hình điều khiển HMI GOT2000 cho công nhân nhà máy.',
        '工場作業者向けの GOT2000 HMI 操作画面の詳細操作マニュアル。',
        'Detailed operation manual for the GOT2000 HMI control screens, for factory operators.',
      ],
    },
    'f-8': {
      summary: [
        'Mã Structured Text điều khiển liên khóa an toàn và bảo vệ cửa rào lưới mắt cáo robot.',
        'ロボットの安全インターロックとメッシュ柵扉の保護を制御するStructured Textコード。',
        'Structured Text code controlling the safety interlock and mesh-fence door protection for the robot.',
      ],
      preview: [
        `// Safety Interlock Check
IF NOT Safety_Gate_Closed OR Emergency_Stop_Active THEN
    Robot_Enable := FALSE;
    Alarm_Siren := TRUE;
    Current_Step := 0; // Reset sequence
ELSE
    Robot_Enable := TRUE;
    Alarm_Siren := FALSE;
END_IF;`,
        `// 安全インターロックチェック
IF NOT Safety_Gate_Closed OR Emergency_Stop_Active THEN
    Robot_Enable := FALSE;
    Alarm_Siren := TRUE;
    Current_Step := 0; // シーケンスをリセット
ELSE
    Robot_Enable := TRUE;
    Alarm_Siren := FALSE;
END_IF;`,
        `// Safety Interlock Check
IF NOT Safety_Gate_Closed OR Emergency_Stop_Active THEN
    Robot_Enable := FALSE;
    Alarm_Siren := TRUE;
    Current_Step := 0; // Reset sequence
ELSE
    Robot_Enable := TRUE;
    Alarm_Siren := FALSE;
END_IF;`,
      ],
    },
    'f-9': {
      summary: [
        'Bảng phân bổ địa chỉ đầu vào/đầu ra (Input/Output Mapping) cho tủ điện điều khiển trung tâm.',
        '中央制御盤向けの入出力アドレス割付表（I/Oマッピング）。',
        'Input/Output address mapping table for the central control cabinet.',
      ],
    },
    'f-10': {
      summary: [
        'Tài liệu cấu hình địa chỉ thanh ghi nhớ Modbus TCP để truyền thông với hệ thống SCADA tầng trên.',
        '上位SCADAシステムと通信するための Modbus TCP レジスタアドレス設定資料。',
        'Modbus TCP register address configuration for communicating with the upper SCADA system.',
      ],
    },
  }
  const locField = (id: string, f: 'type' | 'summary' | 'preview', fallback: string) => {
    const tri = FILE_LOC[id]?.[f]
    return tri ? L(tri[0], tri[1], tri[2]) : fallback
  }

  // State for search and filters
  const [libTab, setLibTab] = useState<'memory' | 'deliverables'>('deliverables')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'code' | 'cad' | 'doc'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)
  
  // State for premium preview
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<ProjectFile | null>(null)

  // State cho menu "..." mỗi dòng và modal lịch sử phiên bản
  const [menuFileId, setMenuFileId] = useState<string | null>(null)
  const [historyFile, setHistoryFile] = useState<ProjectFile | null>(null)
  const [versionMenu, setVersionMenu] = useState<string | null>(null)
  const [compare, setCompare] = useState<{ file: ProjectFile; oldV: number; newV: number } | null>(null)

  // Simulated files list — gồm cả file ĐẦU VÀO (bộ nhớ AI) và file ĐẦU RA (sản phẩm AI sinh)
  const [files, setFiles] = useState<ProjectFile[]>(() => { const all: ProjectFile[] = [
    // ── ĐẦU VÀO (INPUT): bộ nhớ dự án — AI sinh từ chat, dùng làm context xuyên suốt ──
    {
      id: 'in-1',
      name: 'Specs_Du_An.md',
      category: 'input',
      type: 'Markdown Specs (Bộ nhớ AI)',
      size: '12 KB',
      version: 'V1',
      createdAt: '02/06/2026 14:20',
      author: 'AI (từ chat Pre-Sales)',
      approvalStatus: 'approved',
      tags: ['#Specs', '#Memory', '#PreSales'],
      summary: 'Hồ sơ đặc tả gốc do AI tổng hợp từ thông tin khách cung cấp ở giai đoạn pre-sales. Là nguồn sự thật để AI đối chiếu khi sinh dự toán, bản vẽ và code ở các bước sau.',
      previewContent: `# ĐẶC TẢ DỰ ÁN (PROJECT SPECS) — V1
Mã dự án: WW2 Welding Cell
Nguồn: Tổng hợp từ chat pre-sales (Bước 1-3)

## 1. Yêu cầu khách hàng
- Dây chuyền hàn & đo kiểm phôi tự động cho line WW2.
- Điều khiển vị trí phôi chính xác bằng Servo Mitsubishi MR-J5.

## 2. Cấu hình dự kiến (lúc báo giá)
- PLC: Mitsubishi Melsec FX5U (dòng Compact).
- HMI: GOT2000 7-inch.
- Servo: 3 trục (A1, A2, A3).
- An toàn: ISO 13849 PLc.

## 3. Ràng buộc
- Ngân sách dự kiến + thời gian giao theo dự toán đính kèm.

→ AI dùng file này làm mốc để phát hiện CHÊNH LỆCH ở Bước 7 (Khảo sát & Phát sinh).`
    },
    {
      id: 'in-2',
      name: 'Khao_Sat_Phat_Sinh.txt',
      category: 'input',
      type: 'Nhật ký Khảo sát (Bộ nhớ AI)',
      size: '8 KB',
      version: 'V2',
      createdAt: '06/06/2026 09:30',
      author: 'AI (từ chat Bước 7)',
      approvalStatus: 'reviewing',
      tags: ['#KhaoSat', '#PhatSinh', '#Delta'],
      summary: 'Bản ghi chênh lệch kỹ thuật thực tế sau khi nhận đơn, do AI cập nhật từ chat ở Bước 7. AI so file này với Specs_V1 để tính phát sinh và cập nhật bản vẽ/code.',
      previewContent: `# NHẬT KÝ KHẢO SÁT & THAY ĐỔI THÔNG SỐ — V2
Mã dự án: WW2 Welding Cell
Nguồn: Tổng hợp từ chat Bước 7 (Khảo sát & Phát sinh)

## Chênh lệch so với Specs_V1
- PLC: FX5U (Compact) → Q03UDE (Modulized) + module I/O mở rộng.
  Lý do: I/O thực tế tăng 28% + cần Ethernet tốc độ cao cho Robot hàn.
- HMI: GOT2000 7-inch → 10-inch.
- Servo: 3 trục → 4 trục (bổ sung MR-J5-40A cho băng tải phụ).
- An toàn: ISO 13849 PLc → PLd (thêm rơ-le Omron G9SE + 2 light curtain).

→ AI đã cập nhật bảng vật tư (Bước 3) và bản vẽ/code (Bước 4) theo delta này.`
    },
    // ── ĐẦU RA (OUTPUT): sản phẩm AI sinh ra từ các file đầu vào trên ──
    {
      id: 'f-4',
      name: 'PLC_Ladder_Q03UDE.l5k',
      category: 'output', 
      type: 'L5K Ladder Code', 
      size: '89 KB', 
      version: 'V2', 
      createdAt: '06/06/2026 10:15', 
      author: 'AI Assistant',
      approvalStatus: 'approved',
      tags: ['#PLC', '#Ladder', '#Mitsubishi'],
      summary: 'Mã logic điều khiển tuần tự chu trình hàn tự động cho toàn bộ hệ thống đồ gá WW2.',
      previewContent: `// PLC Ladder Logic Structure (L5K)
PROGRAM MainProgram
  TAGS:
    Start_Button : BOOL; // Nút nhấn khởi động
    Auto_Welding_Sequence : BOOL; // Chu trình tự động
    Welding_Robot_Active : BOOL; // Robot hàn kích hoạt
  END_TAGS
  
  // Rung 1: Khởi động chu trình tự động
  LD Start_Button AND NOT Emergency_Stop OUT Auto_Welding_Sequence;
  
  // Rung 2: Kích hoạt tín hiệu robot
  LD Auto_Welding_Sequence AND Cylinder_Extended OUT Welding_Robot_Active;
END_PROGRAM`
    },
    { 
      id: 'f-5', 
      name: 'Electrical_Layout.dwg',
      category: 'output', 
      type: 'DWG AutoCAD Layout', 
      size: '1.4 MB', 
      version: 'V2', 
      createdAt: '06/06/2026 10:20', 
      author: 'AI Assistant',
      approvalStatus: 'approved',
      tags: ['#CAD', '#Electrical', '#Schematic'],
      summary: 'Bản vẽ sơ đồ mạch đấu nối dây động lực, nguồn 24VDC, rơ le an toàn và cổng IO mô đun Mitsubishi.',
      previewContent: 'cad'
    },
    { 
      id: 'f-6', 
      name: 'Bien_Ban_Nghiem_Thu_Case_2026.docx', 
      category: 'output', 
      type: 'DOCX Report', 
      size: '45 KB', 
      version: 'V2', 
      createdAt: '06/06/2026 10:30', 
      author: 'AI Assistant',
      approvalStatus: 'approved',
      tags: ['#NghiemThu', '#BaoCao', '#KySo'],
      summary: 'Biên bản nghiệm thu kỹ thuật bàn giao dự án đã được ký số bởi đại diện Cowatech và khách hàng.',
      previewContent: 'DOCX_REPORT'
    },
    { 
      id: 'f-7', 
      name: 'Huong_Dan_Van_Hanh_HMI.pdf', 
      category: 'output', 
      type: 'PDF User Manual', 
      size: '1.1 MB', 
      version: 'V2', 
      createdAt: '06/06/2026 10:32', 
      author: 'AI Assistant',
      approvalStatus: 'approved',
      tags: ['#HMI', '#GOT2000', '#HDSD'],
      summary: 'Tài liệu hướng dẫn vận hành chi tiết các màn hình điều khiển HMI GOT2000 cho công nhân nhà máy.',
      previewContent: 'PDF_MANUAL'
    },
    { 
      id: 'f-8', 
      name: 'Safety_Interlock_Logic.st', 
      category: 'output', 
      type: 'ST Structured Text', 
      size: '18 KB', 
      version: 'V2', 
      createdAt: '06/06/2026 10:40', 
      author: 'AI Assistant',
      approvalStatus: 'reviewing',
      tags: ['#Safety', '#Interlock', '#StructuredText'],
      summary: 'Mã Structured Text điều khiển liên khóa an toàn và bảo vệ cửa rào lưới mắt cáo robot.',
      previewContent: `// Safety Interlock Check
IF NOT Safety_Gate_Closed OR Emergency_Stop_Active THEN
    Robot_Enable := FALSE;
    Alarm_Siren := TRUE;
    Current_Step := 0; // Reset sequence
ELSE
    Robot_Enable := TRUE;
    Alarm_Siren := FALSE;
END_IF;`
    },
    { 
      id: 'f-9', 
      name: 'IO_Assignment_Table.xlsx', 
      category: 'output', 
      type: 'Excel Spreadsheet', 
      size: '32 KB', 
      version: 'V2', 
      createdAt: '06/06/2026 10:10', 
      author: 'AI Assistant',
      approvalStatus: 'draft',
      tags: ['#IO', '#Mapping', '#Excel'],
      summary: 'Bảng phân bổ địa chỉ đầu vào/đầu ra (Input/Output Mapping) cho tủ điện điều khiển trung tâm.',
      previewContent: 'EXCEL_TABLE'
    },
    { 
      id: 'f-10', 
      name: 'PLC_Memory_Mapping.pdf',
      category: 'output', 
      type: 'PDF Memory Mapping', 
      size: '420 KB', 
      version: 'V1', 
      createdAt: '06/06/2026 09:45', 
      author: 'AI Assistant',
      approvalStatus: 'approved',
      tags: ['#Memory', '#Modbus', '#Register'],
      summary: 'Tài liệu cấu hình địa chỉ thanh ghi nhớ Modbus TCP để truyền thông với hệ thống SCADA tầng trên.',
      previewContent: 'PDF_MEMORY'
    }
    ]
    // Dự án DEMO mẫu → seed đầy đủ. Dự án mới → trống: chỉ hiện file Bộ nhớ khi đã có bộ nhớ thật, KHÔNG seed sản phẩm tĩnh.
    if (DEMO_CASE_IDS.has(id || '')) return all
    const pid = id || 'default'
    const memHas = (k: string) => { try { return ((JSON.parse(localStorage.getItem(k) || 'null')?.fields?.length) || 0) > 0 } catch { return false } }
    return all.filter(f => {
      if (f.category === 'output') return false
      if (f.id === 'in-1') return memHas(`aiplf.presales.${pid}`)
      if (f.id === 'in-2') return memHas(`aiplf.presales.${pid}__reentry`)
      return false
    })
  })

  // Đầu ra do AI sinh ở pre-sales (hồ sơ trình khách, dự toán...) — đọc từ bộ nhớ pre-sales,
  // hiển thị trong "Sản phẩm bàn giao". refreshGen để buộc tính lại sau khi xóa.
  const [refreshGen, setRefreshGen] = useState(0)
  const genOutputs: ProjectFile[] = (() => {
    void refreshGen
    try {
      const raw = localStorage.getItem(`aiplf.presales.${id || 'default'}`)
      if (!raw) return []
      const st = JSON.parse(raw)
      const pad = (n: number) => String(n).padStart(2, '0')
      return ((st.savedOutputs || []) as { oid: string; kind: string; toolId?: string; title: string; ts: number; content: string; version?: number }[])
        .filter(o => o.kind === 'gen' && o.toolId === 'final')
        .map(o => {
          const d = new Date(o.ts)
          return {
            id: 'gen-' + o.oid,
            name: (o.title || L('Tài liệu', '資料', 'Document')).replace(/[\\/:*?"<>|]+/g, '_').slice(0, 48) + '.md',
            category: 'output' as const,
            type: L('Hồ sơ đề xuất (AI · Pre-Sales)', '提案資料 (AI · プリセールス)', 'Proposal (AI · Pre-Sales)'),
            size: Math.max(1, Math.round((o.content || '').length / 102.4) / 10) + ' KB',
            version: 'V' + (o.version || 1),
            createdAt: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
            author: 'AI (Pre-Sales)',
            approvalStatus: 'reviewing' as const,
            tags: locale === 'ja' ? ['#提案', '#顧客向け'] : locale === 'en' ? ['#Proposal', '#Customer'] : ['#ĐềXuất', '#TrìnhKhách'],
            summary: L('Hồ sơ AI tổng hợp ở giai đoạn pre-sales để trình khách.', 'プリセールス段階でAIがまとめた顧客提案資料。', 'A proposal AI compiled at the pre-sales stage for the customer.'),
            previewContent: o.content || '',
          }
        })
    } catch { return [] }
  })()

  // Categorize helper function
  const getFileCategory = (filename: string): 'code' | 'cad' | 'doc' => {
    const fn = filename.toLowerCase()
    if (fn.endsWith('.l5k') || fn.endsWith('.st') || fn.endsWith('.json')) return 'code'
    if (fn.endsWith('.dwg') || fn.endsWith('.dxf')) return 'cad'
    return 'doc'
  }

  // Parse size to KB for sorting
  const parseSizeToKb = (sizeStr: string): number => {
    const val = parseFloat(sizeStr)
    if (sizeStr.toUpperCase().includes('MB')) return val * 1024
    return val
  }
  const fmtSize = (kb: number) => kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB'

  // Mốc thời gian giả cho các phiên bản cũ (mockup — hệ thống thật sẽ lấy từ lịch sử thực)
  const MOCK_OLD_TIMES = ['04/06/2026 16:45', '01/06/2026 10:12', '28/05/2026 09:30']
  // Lịch sử phiên bản — sinh từ field `version` (vd 'V2' → 2.0, 1.0). Version là metadata, KHÔNG nằm trong tên file.
  const getVersionHistory = (file: ProjectFile) => {
    const cur = parseInt(file.version.replace(/\D/g, '')) || 1
    const baseKb = parseSizeToKb(file.size)
    return Array.from({ length: cur }, (_, idx) => {
      const v = cur - idx // idx 0 = phiên bản mới nhất
      return {
        version: `${v}.0`,
        modified: idx === 0 ? file.createdAt : (MOCK_OLD_TIMES[idx - 1] || file.createdAt),
        size: fmtSize(Math.max(1, baseKb * (1 - 0.08 * idx))),
        author: file.author,
        isCurrent: idx === 0,
      }
    })
  }

  // ── SO SÁNH PHIÊN BẢN ──
  // Preview dạng đặc biệt (cad/docx/pdf/excel) không so sánh được bằng văn bản.
  const SPECIAL_PREVIEW = new Set(['cad', 'DOCX_REPORT', 'PDF_MANUAL', 'PDF_MEMORY', 'EXCEL_TABLE'])
  // Nội dung bản CŨ (mock) cho các file có nhiều phiên bản — để diff làm nổi phần AI bổ sung về sau.
  const OLD_VERSION_TEXT: Record<string, string> = {
    'in-2': `# NHẬT KÝ KHẢO SÁT & THAY ĐỔI THÔNG SỐ — V2
Mã dự án: WW2 Welding Cell
Nguồn: Tổng hợp từ chat Bước 7 (Khảo sát & Phát sinh)

## Chênh lệch so với Specs_V1
- PLC: FX5U (Compact) → Q03UDE (Modulized) + module I/O mở rộng.
  Lý do: I/O thực tế tăng 28% + cần Ethernet tốc độ cao cho Robot hàn.
- HMI: GOT2000 7-inch → 10-inch.`,
  }
  // Văn bản của một phiên bản (để so sánh). Trả null nếu định dạng không hỗ trợ.
  const getComparableText = (file: ProjectFile, v: number): string | null => {
    const base = file.previewContent
    if (!base || SPECIAL_PREVIEW.has(base)) return null
    const cur = parseInt(file.version.replace(/\D/g, '')) || 1
    if (v >= cur) return base // bản hiện hành
    if (OLD_VERSION_TEXT[file.id]) return OLD_VERSION_TEXT[file.id]
    // Mock chung: bản cũ = bỏ 2 dòng cuối của bản hiện hành
    const lines = base.split('\n')
    return lines.slice(0, Math.max(1, lines.length - 2)).join('\n')
  }
  // Diff theo dòng (LCS) — trả về danh sách {type: same|add|del, text}
  const diffLines = (oldStr: string, newStr: string) => {
    const A = oldStr.split('\n'), B = newStr.split('\n')
    const m = A.length, n = B.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    for (let i = m - 1; i >= 0; i--)
      for (let j = n - 1; j >= 0; j--)
        dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    const out: { type: 'same' | 'add' | 'del'; text: string }[] = []
    let i = 0, j = 0
    while (i < m && j < n) {
      if (A[i] === B[j]) { out.push({ type: 'same', text: A[i] }); i++; j++ }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: 'del', text: A[i] }); i++ }
      else { out.push({ type: 'add', text: B[j] }); j++ }
    }
    while (i < m) out.push({ type: 'del', text: A[i++] })
    while (j < n) out.push({ type: 'add', text: B[j++] })
    return out
  }

  // Đếm cho chip lọc — chỉ tính SẢN PHẨM (bộ lọc loại không áp cho Bộ nhớ)
  const getCount = (catId: 'all' | 'code' | 'cad' | 'doc') => {
    const outs = [...files, ...genOutputs].filter(f => f.category === 'output')
    if (catId === 'all') return outs.length
    return outs.filter(f => getFileCategory(f.name) === catId).length
  }

  // Handle mock download
  const handleDownload = (file: ProjectFile) => {
    setDownloadingFileId(file.id)
    setTimeout(() => {
      setDownloadingFileId(null)
      // Trigger a raw browser download simulation
      alert(`[MOCK DOWNLOAD] Đã tải thành công file: ${file.name}\nPhiên bản: ${file.version}\nDung lượng: ${file.size}`)
    }, 1200)
  }

  // Xóa file khỏi thư viện (có xác nhận)
  const deleteFile = (file: ProjectFile) => {
    if (!window.confirm(`Xóa "${file.name}" khỏi thư viện?`)) return
    if (file.id.startsWith('gen-')) {
      // Output pre-sales — xóa khỏi bộ nhớ pre-sales
      const oid = file.id.slice(4)
      try {
        const key = `aiplf.presales.${id || 'default'}`
        const raw = localStorage.getItem(key)
        if (raw) {
          const st = JSON.parse(raw)
          st.savedOutputs = (st.savedOutputs || []).filter((o: { oid: string }) => o.oid !== oid)
          localStorage.setItem(key, JSON.stringify(st))
        }
      } catch { /* ignore */ }
      setRefreshGen(r => r + 1)
    } else {
      setFiles(prev => prev.filter(f => f.id !== file.id))
    }
    if (selectedPreviewFile?.id === file.id) setSelectedPreviewFile(null)
    if (historyFile?.id === file.id) setHistoryFile(null)
  }

  // Sắp xếp dùng chung
  const sortFiles = (arr: ProjectFile[]) => [...arr].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'size') return parseSizeToKb(b.size) - parseSizeToKb(a.size)
    return b.createdAt.localeCompare(a.createdAt) // mới nhất trước
  })
  const matchesSearch = (f: ProjectFile) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.type.toLowerCase().includes(searchQuery.toLowerCase())

  // Các khóa lưu trữ localStorage theo từng dự án
  const REENTRY_KEY = `aiplf.project_reentry_text.${id || 'default'}`
  const PLC_CODE_KEY = `aiplf.plc_st_code.${id || 'default'}`
  const MANUAL_KEY = `aiplf.generated_manual.${id || 'default'}`
  const PROTOCOL_KEY = `aiplf.generated_protocol.${id || 'default'}`

  const isFileLive = (file: ProjectFile): boolean => {
    if (file.id === 'in-2') return !!localStorage.getItem(REENTRY_KEY)
    if (file.id === 'f-8') return !!localStorage.getItem(PLC_CODE_KEY)
    if (file.id === 'f-7') return !!localStorage.getItem(MANUAL_KEY)
    if (file.id === 'f-6') return !!localStorage.getItem(PROTOCOL_KEY)
    return false
  }

  const dynamicFiles = files.map(file => {
    let size = file.size
    let version = file.version
    if (file.id === 'in-2') {
      const live = localStorage.getItem(REENTRY_KEY)
      if (live) {
        size = `${(live.length / 1024).toFixed(1)} KB`
        version = 'V2 (Live)'
      }
    } else if (file.id === 'f-8') {
      const live = localStorage.getItem(PLC_CODE_KEY)
      if (live) {
        size = `${(live.length / 1024).toFixed(1)} KB`
        version = 'V2 (Live)'
      }
    } else if (file.id === 'f-7') {
      const live = localStorage.getItem(MANUAL_KEY)
      if (live) {
        size = `${(live.length / 1024).toFixed(1)} KB`
        version = 'V2 (Live)'
      }
    } else if (file.id === 'f-6') {
      const live = localStorage.getItem(PROTOCOL_KEY)
      if (live) {
        size = `${(live.length / 1024).toFixed(1)} KB`
        version = 'V2 (Live)'
      }
    }
    const type = locField(file.id, 'type', file.type)
    const summary = locField(file.id, 'summary', file.summary)
    const pc = file.previewContent ?? ''
    const previewContent = SPECIAL_PREVIEW.has(pc)
      ? file.previewContent
      : locField(file.id, 'preview', pc)
    return { ...file, size, version, type, summary, previewContent }
  })

  // BỘ NHỚ (input): chỉ lọc theo tìm kiếm — bộ lọc loại file là khái niệm của Sản phẩm, không áp cho Bộ nhớ
  const inputFiles = sortFiles(dynamicFiles.filter(f => f.category === 'input' && matchesSearch(f)))
  // SẢN PHẨM (output): lọc theo tìm kiếm + loại file
  const outputFiles = sortFiles([...genOutputs, ...dynamicFiles].filter(f =>
    f.category === 'output' && matchesSearch(f) &&
    (categoryFilter === 'all' || getFileCategory(f.name) === categoryFilter)
  ))

  // Bước 7 (ProjectReentry) ghi nhật ký khảo sát vào localStorage theo dự án.
  // Hai file "Bộ nhớ" phản ánh bộ nhớ AI thật (usePresalesState): in-1 = pre-sales (baseline),
  // in-2 = reentry (delta Bước 7). Build nội dung từ các field đã ghi → "một nguồn sự thật".
  const buildMemText = (memKey: string, title: string): string | null => {
    try {
      const raw = localStorage.getItem(memKey)
      if (raw) {
        const st = JSON.parse(raw)
        const fields = (st.fields || []) as { name: string; value: string }[]
        if (fields.length) {
          const cn = L('Mã dự án', 'プロジェクトコード', 'Project code')
          const src = L('Nguồn: Bộ nhớ AI ghi nhận qua chat', '出典: チャットからAIが記録した記憶', 'Source: AI memory captured via chat')
          return `# ${title}\n${cn}: ${id || 'CASE-2026-0245'}\n${src}\n\n${fields.map(f => `- ${tField(f.name, locale)}: ${tFieldValue(f.value, locale)}`).join('\n')}`
        }
      }
    } catch { /* ignore */ }
    return null
  }

  const activeSelectedFile = selectedPreviewFile
    ? [...dynamicFiles, ...genOutputs].find(f => f.id === selectedPreviewFile.id) || selectedPreviewFile
    : null
  const getLivePreview = (file: ProjectFile): { text?: string; isLive: boolean } => {
    if (file.id === 'in-1') {
      const live = buildMemText(`aiplf.presales.${id || 'default'}`, L('ĐẶC TẢ DỰ ÁN (PRE-SALES)', 'プロジェクト仕様 (プリセールス)', 'PROJECT SPECS (PRE-SALES)'))
      if (live) return { text: live, isLive: true }
    }
    if (file.id === 'in-2') {
      const live = buildMemText(`aiplf.presales.${id || 'default'}__reentry`, L('NHẬT KÝ KHẢO SÁT & PHÁT SINH', '調査・追加費用ログ', 'SURVEY & CHANGE ORDER LOG'))
      if (live) return { text: live, isLive: true }
    }
    if (file.id === 'f-8') {
      const live = localStorage.getItem(PLC_CODE_KEY)
      if (live) return { text: live, isLive: true }
    }
    if (file.id === 'f-7') {
      const live = localStorage.getItem(MANUAL_KEY)
      if (live) return { text: live, isLive: true }
    }
    if (file.id === 'f-6') {
      const live = localStorage.getItem(PROTOCOL_KEY)
      if (live) return { text: live, isLive: true }
    }
    return { text: file.previewContent, isLive: false }
  }

  // Render 1 dòng file (dùng lại cho cả nhóm đầu vào & đầu ra)
  const renderFileRow = (file: ProjectFile) => {
    const isCAD = file.name.endsWith('.dwg') || file.name.endsWith('.dxf')
    const isCode = file.name.endsWith('.l5k') || file.name.endsWith('.st')
    return (
      <div
        key={file.id}
        onClick={() => setSelectedPreviewFile(file)}
        className="p-3.5 bg-white border border-slate-200/80 hover:border-brand-350 hover:bg-brand-500/2 hover:shadow-2xs rounded-xl flex items-center justify-between gap-3 transition duration-200 cursor-pointer group relative"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 ${
            isCAD ? 'bg-indigo-50 text-indigo-600' : isCode ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'
          }`}>
            {isCAD ? (
              <Layers className="w-4.5 h-4.5" />
            ) : isCode ? (
              <FileCode className="w-4.5 h-4.5" />
            ) : (
              <FileText className="w-4.5 h-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                {file.name}
              </span>
              {isFileLive(file) && (
                <span className="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200/50 rounded px-1.5 py-0.2 flex items-center gap-1 shrink-0 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Live
                </span>
              )}
            </div>

            {file.category === 'input' && (
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-snug">{file.summary}</p>
            )}

            <div className="flex flex-wrap gap-1 mt-1">
              {file.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[7.5px] px-1 py-0.2 bg-slate-100 border border-slate-200 text-slate-500 rounded font-medium">
                  {tag}
                </span>
              ))}
              <span className="text-[8px] text-slate-400 font-mono self-center ml-1">
                {file.size} • {t('post.arch.fileVersion')} {file.version} • {file.createdAt}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Menu "..." — chứa Tải xuống / Chia sẻ / Lịch sử phiên bản */}
          <button
            onClick={(e) => { e.stopPropagation(); setMenuFileId(menuFileId === file.id ? null : file.id) }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer z-10"
            title={L('Tùy chọn khác', 'その他の操作', 'More options')}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuFileId === file.id && (
            <>
              <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setMenuFileId(null) }} />
              <div className="absolute right-2 top-12 z-30 bg-white border border-slate-200 rounded-xl shadow-pop py-1 min-w-[180px] text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuFileId(null); handleDownload(file) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" /> {L('Tải xuống', 'ダウンロード', 'Download')}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuFileId(null); alert(`[MOCK] Đã tạo liên kết chia sẻ cho: ${file.name}`) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" /> {L('Chia sẻ', '共有', 'Share')}
                </button>
                <div className="border-t border-slate-100 my-1 mx-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuFileId(null); setHistoryFile(file) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-brand-50 cursor-pointer text-brand-700 font-semibold"
                >
                  <History className="w-3.5 h-3.5" /> {L('Lịch sử phiên bản', 'バージョン履歴', 'Version history')}
                </button>
                <div className="border-t border-slate-100 my-1 mx-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuFileId(null); deleteFile(file) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 cursor-pointer text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {L('Xóa', '削除', 'Delete')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Code preview kiểu editor: header chrome + số dòng + tô màu comment (light theme dễ đọc)
  const renderCodeBlock = (code: string, name: string) => {
    const lines = code.split('\n')
    const lang = /\.l5k$/i.test(name) ? 'L5K · Ladder' : /\.st$/i.test(name) ? 'Structured Text' : /\.json$/i.test(name) ? 'JSON' : 'Code'
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-3xs">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">{lang}</span>
        </div>
        <div className="overflow-auto max-h-[340px] bg-white">
          <table className="border-collapse font-mono text-[11.5px] leading-relaxed">
            <tbody>
              {lines.map((ln, i) => {
                const ci = ln.indexOf('//')
                const codePart = ci >= 0 ? ln.slice(0, ci) : ln
                const commentPart = ci >= 0 ? ln.slice(ci) : ''
                return (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="select-none text-right text-slate-300 pr-3 pl-3 align-top whitespace-nowrap border-r border-slate-100 bg-slate-50/50">{i + 1}</td>
                    <td className="pl-4 pr-5 whitespace-pre text-slate-800 align-top">
                      {codePart}
                      {commentPart && <span className="text-emerald-600/80 italic">{commentPart}</span>}
                      {!ln && ' '}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // CAD Custom SVG wiring preview rendering
  const renderCadPreview = () => {
    return (
      <div className="border border-slate-200 rounded-xl bg-slate-950 p-4 h-[220px] flex flex-col justify-between font-mono text-[9px] text-emerald-450 relative overflow-hidden select-none">
        {/* Grid lines pattern background */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-10 pointer-events-none">
          {Array.from({ length: 72 }).map((_, i) => (
            <div key={i} className="border-r border-b border-emerald-500 h-full w-full" />
          ))}
        </div>
        
        <div className="flex justify-between items-center border-b border-emerald-800/60 pb-1.5 shrink-0 z-10">
          <span>DWG_VIEWER // ELECTRICAL_LAYOUT_V2.0.DWG</span>
          <span className="animate-pulse text-emerald-400">● LIVE LAYOUT</span>
        </div>
        
        {/* Circuit Diagram drawing */}
        <div className="flex-1 flex items-center justify-center gap-6 z-10 py-2">
          {/* Node 1: Nguồn 24V */}
          <div className="flex flex-col items-center">
            <div className="px-2 py-1 border border-emerald-500 rounded bg-emerald-950/80 text-center text-emerald-450 font-bold shadow-sm">
              +24VDC
            </div>
            <span className="text-[7px] mt-1 text-emerald-600 font-bold">PWR_IN</span>
          </div>

          <div className="h-px w-8 bg-emerald-500 relative">
            <span className="absolute -top-2 left-1 text-[7px] text-emerald-450 font-bold">1.5mm²</span>
          </div>

          {/* Node 2: Safety Switch */}
          <div className="flex flex-col items-center">
            <div className="px-2 py-1 border border-amber-500/80 rounded bg-amber-950/50 text-center text-amber-400 font-bold shadow-sm">
              SW_SAFETY
            </div>
            <span className="text-[7px] mt-1 text-amber-500 font-bold">INTERLOCK</span>
          </div>

          <div className="h-px w-8 bg-emerald-500 relative">
            <span className="absolute -top-2 left-1 text-[7px] text-emerald-450 font-bold">0.75mm²</span>
          </div>

          {/* Node 3: PLC Inputs */}
          <div className="flex flex-col items-center">
            <div className="px-2 py-1 border border-emerald-500 rounded bg-emerald-950/80 text-center text-emerald-450 font-bold shadow-sm">
              Q03_X00
            </div>
            <span className="text-[7px] mt-1 text-emerald-600 font-bold">PLC_IN_1</span>
          </div>
        </div>

        <div className="border-t border-emerald-800/60 pt-1.5 flex justify-between text-[8px] text-emerald-650 shrink-0 z-10">
          <span>SCALE: 1:100</span>
          <span>SYSTEM GROUND: OK</span>
          <span>UNIT: mm</span>
        </div>
      </div>
    )
  }

  // Document formatting previews
  const renderDocPreview = (type: 'docx' | 'pdf_manual' | 'pdf_memory' | 'excel') => {
    return (
      <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 h-[220px] overflow-y-auto space-y-3 font-sans text-xs text-slate-700 leading-normal">
        {type === 'docx' && (() => {
          const live = localStorage.getItem(PROTOCOL_KEY)
          if (live) {
            return (
              <div className="space-y-1.5 font-sans whitespace-pre-wrap select-text">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 rounded-lg px-2 py-1 w-fit mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {L('Đồng bộ trực tiếp từ Bước 6 (Tạo tài liệu AI)', 'ステップ6（検収・取説）から直接同期', 'Synced directly from Step 6 (Acceptance & Manual)')}
                </div>
                {live}
              </div>
            )
          }
          return (
            <>
              <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase text-[11px]">
                {L('BIÊN BẢN NGHIỆM THU KỸ THUẬT VÀ BÀN GIAO THIẾT BỊ', '技術検収・設備引き渡し調書', 'TECHNICAL ACCEPTANCE & EQUIPMENT HANDOVER RECORD')}
              </div>
              <p className="font-semibold text-slate-800">{L('1. Thành phần nghiệm thu:', '1. 検収参加者:', '1. Acceptance participants:')}</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                <li>{L('Đại diện Khách hàng: Trưởng bộ phận Kỹ thuật sản xuất', '顧客代表: 製造技術部 部門長', 'Customer rep: Head of Production Engineering')}</li>
                <li>{L('Đại diện Đơn vị Thiết kế: Kỹ sư Linh (Cowatech)', '設計側代表: Linh エンジニア (Cowatech)', 'Design unit rep: Engineer Linh (Cowatech)')}</li>
              </ul>
              <p className="font-semibold text-slate-800">{L('2. Nội dung nghiệm thu:', '2. 検収内容:', '2. Acceptance scope:')}</p>
              <p className="text-[11px] text-slate-600">
                {L('Kiểm tra vận hành liên động an toàn, hệ thống Robot hàn hàn đúng chu trình, thời gian đáp ứng đạt chuẩn chất lượng IEC 61131.', '安全インターロックの動作確認、溶接ロボットが正しいサイクルで稼働、応答時間が IEC 61131 品質基準を満たすことを確認。', 'Verified safety interlock operation, the welding robot runs the correct cycle, and response time meets the IEC 61131 quality standard.')}
              </p>
            </>
          )
        })()}
        {type === 'pdf_manual' && (() => {
          const live = localStorage.getItem(MANUAL_KEY)
          if (live) {
            return (
              <div className="space-y-1.5 font-sans whitespace-pre-wrap select-text">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 rounded-lg px-2 py-1 w-fit mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {L('Đồng bộ trực tiếp từ Bước 6 (Tạo tài liệu AI)', 'ステップ6（検収・取説）から直接同期', 'Synced directly from Step 6 (Acceptance & Manual)')}
                </div>
                {live}
              </div>
            )
          }
          return (
            <>
              <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase text-[11px]">
                {L('TÀI LIỆU HƯỚNG DẪN VẬN HÀNH MÀN HÌNH HMI GOT2000', 'GOT2000 HMI 画面 操作マニュアル', 'GOT2000 HMI SCREEN OPERATION MANUAL')}
              </div>
              <p className="font-semibold text-slate-800">{L('1. Tổng quan giao diện:', '1. 画面概要:', '1. Interface overview:')}</p>
              <p className="text-[11px] text-slate-600">
                {L('Màn hình HMI bao gồm 3 trang chính: Trang chủ (Home), Trang thông số điều khiển (Settings), và Trang chẩn đoán lỗi (Diagnostics).', 'HMIは3つの主要画面で構成: ホーム(Home)、制御パラメータ画面(Settings)、故障診断画面(Diagnostics)。', 'The HMI has 3 main pages: Home, control parameters (Settings), and fault diagnostics (Diagnostics).')}
              </p>
              <p className="font-semibold text-slate-800">{L('2. Quy trình khởi động:', '2. 起動手順:', '2. Startup procedure:')}</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
                <li>{L('Kiểm tra nguồn điện 220VAC cấp cho HMI.', 'HMIへの220VAC電源供給を確認する。', 'Check the 220VAC power supply to the HMI.')}</li>
                <li>{L('Đợi màn hình hiển thị logo khởi động và tự động kết nối PLC.', '起動ロゴが表示され、PLCに自動接続されるのを待つ。', 'Wait for the startup logo and automatic PLC connection.')}</li>
                <li>{L('Nhấn nút "Reset Lỗi" trên màn hình trước khi nhấn "Start".', '「Start」を押す前に画面の「故障リセット」ボタンを押す。', 'Press the "Reset Fault" button on screen before pressing "Start".')}</li>
              </ol>
            </>
          )
        })()}
        {type === 'pdf_memory' && (
          <>
            <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase text-[11px]">
              {L('CẤU HÌNH PHÂN BỔ BỘ NHỚ MODBUS TCP REGISTER MAPPING', 'MODBUS TCP レジスタマッピング設定', 'MODBUS TCP REGISTER MAPPING CONFIGURATION')}
            </div>
            <table className="w-full border-collapse text-[10px] text-left text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 font-bold bg-slate-100">
                  <th className="p-1">{L('Địa chỉ (HEX)', 'アドレス (HEX)', 'Address (HEX)')}</th>
                  <th className="p-1">{L('Tên thanh ghi', 'レジスタ名', 'Register name')}</th>
                  <th className="p-1">{L('Định dạng', '形式', 'Format')}</th>
                  <th className="p-1">{L('Mô tả', '説明', 'Description')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono">0x40001</td>
                  <td className="p-1">SYSTEM_STATUS</td>
                  <td className="p-1">INT16</td>
                  <td className="p-1">{L('Trạng thái hệ thống (1: Run, 2: Idle, 9: Error)', 'システム状態 (1: Run, 2: Idle, 9: Error)', 'System status (1: Run, 2: Idle, 9: Error)')}</td>
                </tr>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono">0x40002</td>
                  <td className="p-1">WELDING_COUNT</td>
                  <td className="p-1">INT32</td>
                  <td className="p-1">{L('Tổng sản phẩm đã thực hiện hàn thành công', '溶接成功した製品の累計数', 'Total products welded successfully')}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
        {type === 'excel' && (
          <>
            <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase text-[11px]">
              {L('BẢNG PHÂN BỔ TÍN HIỆU ĐẦU VÀO/ĐẦU RA (I/O MAPPING TABLE)', '入出力信号割付表 (I/O MAPPING TABLE)', 'INPUT/OUTPUT SIGNAL MAPPING TABLE')}
            </div>
            <table className="w-full border-collapse text-[10px] text-left text-slate-600">
              <thead>
                <tr className="border-b border-slate-250 font-bold bg-slate-200/50">
                  <th className="p-1">{L('Địa chỉ PLC', 'PLCアドレス', 'PLC address')}</th>
                  <th className="p-1">{L('Tên tín hiệu', '信号名', 'Signal name')}</th>
                  <th className="p-1">{L('Phân loại', '分類', 'Type')}</th>
                  <th className="p-1">{L('Thiết bị ngoại vi', '周辺機器', 'Peripheral device')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono text-brand-600 font-bold">X00</td>
                  <td className="p-1">PB_START</td>
                  <td className="p-1 font-bold">INPUT</td>
                  <td className="p-1">{L('Nút nhấn Start tủ điện chính', 'メイン制御盤の起動押しボタン', 'Start push-button on main control cabinet')}</td>
                </tr>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono text-brand-600 font-bold">X01</td>
                  <td className="p-1">SEN_SAFETY_GATE</td>
                  <td className="p-1 font-bold">INPUT</td>
                  <td className="p-1">{L('Cảm biến an toàn cửa mở', '扉開放の安全センサー', 'Door-open safety sensor')}</td>
                </tr>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono text-rose-600 font-bold">Y00</td>
                  <td className="p-1">SOL_CYLINDER_CLAMP</td>
                  <td className="p-1 font-bold">OUTPUT</td>
                  <td className="p-1">{L('Van điện từ kẹp phôi đồ gá', '治具のワーククランプ用電磁弁', 'Solenoid valve for fixture workpiece clamp')}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-mesh overflow-hidden text-slate-800 font-sans">
      
      {/* Upper Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-none z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title={t('post.arch.backToWorkspace')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              {t('post.arch.pageTitle')}
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-brand-500/10 text-brand-700 border border-brand-500/20 uppercase">
                {t('post.arch.libraryBadge')}
              </span>
            </h2>
            <p className="text-[10px] text-slate-450 font-mono">{t('post.arch.projectLabel')} {id || 'CASE-2026-0245'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-brand-700 font-mono font-bold text-sm flex items-center justify-center border border-slate-200">
            A
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 p-6 overflow-hidden justify-center items-start">
        
        {/* Project File Library Panel */}
        <section className="max-w-5xl w-full h-full bg-white border border-slate-200 rounded-3xl p-6 flex flex-col min-h-0 shadow-panel">
          {/* Header: tiêu đề */}
          <div className="flex items-center gap-2 border-b border-slate-250 pb-3.5 shrink-0">
            <FolderOpen className="w-5 h-5 text-indigo-500 animate-pulse-slow" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {t('post.arch.fileLibTitle')}
              </h3>
              <p className="text-[10px] text-slate-450">
                {t('post.arch.fileLibSubtitle')}
              </p>
            </div>
          </div>

          {/* Tab chọn nhóm: Bộ nhớ AI | Sản phẩm bàn giao */}
          <div className="flex gap-2 mt-4 shrink-0">
            {([
              { key: 'deliverables', label: L('Sản phẩm bàn giao', '納品物', 'Deliverables'), icon: Boxes, n: outputFiles.length },
              { key: 'memory', label: L('Bộ nhớ AI', 'AI記憶', 'AI memory'), icon: Brain, n: inputFiles.length },
            ] as const).map(({ key, label, icon: Icon, n }) => {
              const active = libTab === key
              return (
                <button
                  key={key}
                  onClick={() => setLibTab(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    active ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{n}</span>
                </button>
              )
            })}
          </div>

          {/* Mô tả ngắn theo tab */}
          <p className="text-[10px] text-slate-450 mt-2 shrink-0">
            {libTab === 'memory'
              ? L('Đặc tả & nhật ký AI tự ghi nhận qua trao đổi — nền tảng để AI sinh ra sản phẩm.', '対話からAIが記録した仕様・ログ — 納品物生成の基盤。', 'Specs & logs AI noted from chat — the basis for generating deliverables.')
              : L('Bản vẽ, mã nguồn, tài liệu AI tạo ra từ bộ nhớ dự án.', 'AIがプロジェクト記憶から生成した図面・コード・資料。', 'Drawings, code, docs AI generated from project memory.')}
          </p>

          {/* Toolbar: tìm kiếm + sắp xếp + (lọc loại chỉ ở tab Sản phẩm) */}
          <div className="shrink-0 space-y-3 mt-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={L('Tìm kiếm tài liệu, định dạng...', '資料・形式を検索…', 'Search documents, formats…')}
                  className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold text-slate-800 transition duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-slate-200 rounded-full absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="relative min-w-[150px]">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-bold text-slate-700 cursor-pointer appearance-none"
                >
                  <option value="date">{L('Mới cập nhật', '最近更新', 'Recently updated')}</option>
                  <option value="name">{L('Tên tệp (A-Z)', 'ファイル名 (A-Z)', 'File name (A-Z)')}</option>
                  <option value="size">{L('Dung lượng lớn', 'サイズ大', 'Largest size')}</option>
                </select>
              </div>
            </div>

            {libTab === 'deliverables' && (
              <div className="flex flex-wrap items-center gap-1.5 select-none">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  {L('Lọc:', 'フィルター:', 'Filter:')}
                </span>
                {[
                  { id: 'all', label: L('Tất cả', 'すべて', 'All') },
                  { id: 'code', label: L('Mã nguồn PLC', 'PLCソース', 'PLC source') },
                  { id: 'cad', label: L('Sơ đồ mạch CAD', 'CAD回路図', 'CAD diagram') },
                  { id: 'doc', label: L('Tài liệu & Báo cáo', '資料・報告', 'Docs & reports') }
                ].map((cat) => {
                  const active = categoryFilter === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(cat.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-brand-500 text-white shadow-3xs font-black'
                          : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {getCount(cat.id as any)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Danh sách file theo tab */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 min-h-0">
            {(() => {
              const list = libTab === 'memory' ? inputFiles : outputFiles
              if (list.length === 0) {
                return (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10">
                    <FileText className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-400">{libTab === 'memory' ? L('Chưa có file bộ nhớ', 'AI記憶ファイルなし', 'No memory files yet') : L('Không có sản phẩm phù hợp', '該当する納品物なし', 'No matching deliverables')}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{searchQuery ? L('Thử từ khóa khác', '別のキーワードで検索', 'Try another keyword') : L('Trao đổi với AI để tạo nội dung', 'AIと対話して作成', 'Chat with AI to create content')}</p>
                  </div>
                )
              }
              return list.map(renderFileRow)
            })()}
          </div>
        </section>

      </div>

      {/* File Preview Modal */}
      {activeSelectedFile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-[560px] space-y-4 shadow-pop animate-in zoom-in-95 duration-200 text-slate-800 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3 shrink-0">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate" title={activeSelectedFile.name}>
                    {activeSelectedFile.name}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {L('Định dạng', '形式', 'Format')}: {activeSelectedFile.type} • {L('Dung lượng', 'サイズ', 'Size')}: {activeSelectedFile.size} • {L('Phiên bản', 'バージョン', 'Version')}: {activeSelectedFile.version}
                </p>
              </div>
              
              <button
                onClick={() => setSelectedPreviewFile(null)}
                className="text-slate-450 hover:text-slate-850 p-1.5 hover:bg-slate-100 rounded-full transition cursor-pointer shrink-0"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Summary Section */}
              <div className="space-y-1">
                <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">{L('Tóm tắt nội dung (AI Extract):', 'コンテンツ要約 (AI抽出):', 'Content summary (AI extract):')}</h5>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed bg-brand-500/2 border border-brand-200/20 rounded-xl p-3">
                  {activeSelectedFile.summary}
                </p>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap items-center gap-1.5">
                {activeSelectedFile.tags.map((tag, i) => (
                  <span key={i} className="text-[9px] font-bold text-slate-500 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Dynamic Preview Canvas Container */}
              <div className="space-y-1">
                <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1.5">{L('Bản xem trước tệp (File Preview):', 'ファイルプレビュー:', 'File preview:')}</h5>
                
                {/* Check file type for preview rendering */}
                {(() => {
                  const pc = activeSelectedFile.previewContent
                  if (pc === 'cad') {
                    return renderCadPreview()
                  } else if (pc === 'DOCX_REPORT') {
                    return renderDocPreview('docx')
                  } else if (pc === 'PDF_MANUAL') {
                    return renderDocPreview('pdf_manual')
                  } else if (pc === 'PDF_MEMORY') {
                    return renderDocPreview('pdf_memory')
                  } else if (pc === 'EXCEL_TABLE') {
                    return renderDocPreview('excel')
                  }
                  // File text (gồm bộ nhớ AI) — ưu tiên nội dung động từ Bước 7 nếu có
                  const { text, isLive } = getLivePreview(activeSelectedFile)
                  if (text) {
                    // Code (.l5k/.st/.json) → giao diện terminal tối; văn bản (.md/.txt, bộ nhớ) → tài liệu nền sáng dễ đọc
                    const isCodeFile = /\.(l5k|st|json)$/i.test(activeSelectedFile.name)
                    return (
                      <div className="space-y-1.5">
                        {isLive && (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 rounded-lg px-2 py-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            {locale === 'ja' ? (
                              activeSelectedFile.id === 'in-1'
                                ? '提案書（プリセールス）から直接同期'
                                : activeSelectedFile.id === 'in-2'
                                ? 'ステップ7（調査・追加費用）から直接同期'
                                : activeSelectedFile.id === 'f-8'
                                ? 'ステップ5（デバッグ）から直接同期'
                                : 'ステップ6（検収・取説）から直接同期'
                            ) : locale === 'en' ? (
                              activeSelectedFile.id === 'in-1'
                                ? 'Synced directly from proposal (Pre-Sales)'
                                : activeSelectedFile.id === 'in-2'
                                ? 'Synced directly from Step 7 (Survey & Change Orders)'
                                : activeSelectedFile.id === 'f-8'
                                ? 'Synced directly from Step 5 (Debug Code)'
                                : 'Synced directly from Step 6 (Acceptance & Manual)'
                            ) : (
                              activeSelectedFile.id === 'in-1'
                                ? 'Đồng bộ trực tiếp từ hồ sơ đề xuất (Pre-Sales)'
                                : activeSelectedFile.id === 'in-2'
                                ? 'Đồng bộ trực tiếp từ Bước 7 (Khảo sát & Phát sinh)'
                                : activeSelectedFile.id === 'f-8'
                                ? 'Đồng bộ trực tiếp từ Bước 5 (Debug Code)'
                                : 'Đồng bộ trực tiếp từ Bước 6 (Tạo tài liệu AI)'
                            )}
                          </div>
                        )}
                        {isCodeFile ? (
                          renderCodeBlock(text, activeSelectedFile.name)
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-xl p-5 overflow-auto max-h-[360px] shadow-3xs prose prose-sm prose-slate max-w-none text-slate-800 select-text">
                            <MarkdownLite text={text} />
                          </div>
                        )}
                      </div>
                    )
                  }
                  return (
                    <div className="border border-slate-200 rounded-xl bg-slate-50 p-6 text-center text-[11px] text-slate-400">
                      {L('Không hỗ trợ xem trước cho tệp định dạng này', 'この形式のファイルはプレビューに対応していません', 'Preview is not supported for this file format')}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleDownload(activeSelectedFile)
                  setSelectedPreviewFile(null)
                }}
                disabled={downloadingFileId !== null}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{L('Tải tệp xuống', 'ファイルをダウンロード', 'Download file')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Version History Modal */}
      {historyFile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200" onClick={() => { setHistoryFile(null); setVersionMenu(null) }}>
          <div className="bg-white rounded-3xl border border-slate-200 w-[600px] max-w-[92vw] shadow-pop animate-in zoom-in-95 duration-200 text-slate-800 flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-200 shrink-0">
              <div className="min-w-0 pr-4">
                <h4 className="text-base font-extrabold text-slate-900">{L('Lịch sử phiên bản', 'バージョン履歴', 'Version history')}</h4>
                <p className="text-[11px] text-slate-450 font-mono mt-0.5 truncate" title={historyFile.name}>{historyFile.name}</p>
              </div>
              <button
                onClick={() => { setHistoryFile(null); setVersionMenu(null) }}
                className="text-slate-450 hover:text-slate-850 p-1.5 hover:bg-slate-100 rounded-full transition cursor-pointer shrink-0"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Table — không dùng overflow để dropdown phiên bản không bị cắt */}
            <div className="px-6 py-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2 pr-3 font-bold">{L('Phiên bản', 'バージョン', 'Version')}</th>
                    <th className="py-2 pr-3 font-bold">{L('Sửa lúc', '更新日時', 'Modified')}</th>
                    <th className="py-2 pr-3 font-bold">{L('Dung lượng', 'サイズ', 'Size')}</th>
                    <th className="py-2 font-bold">{L('Cập nhật bởi', '更新者', 'Updated by')}</th>
                  </tr>
                </thead>
                <tbody>
                  {getVersionHistory(historyFile).map((v) => {
                    const isAI = v.author.trim().toUpperCase().startsWith('AI')
                    const initials = v.author.replace(/[()]/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                    return (
                      <tr key={v.version} className="border-t border-slate-100 hover:bg-slate-50/60 transition group">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2 relative">
                            <span className="text-sm font-bold text-slate-800">{v.version}</span>
                            {v.isCurrent && (
                              <span className="text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">{L('Hiện tại', '現在', 'Current')}</span>
                            )}
                            <button
                              onClick={() => setVersionMenu(versionMenu === v.version ? null : v.version)}
                              className={`p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer ${versionMenu === v.version ? 'bg-slate-200 text-slate-700' : 'opacity-0 group-hover:opacity-100'}`}
                              title={L('Thao tác với phiên bản này', 'このバージョンの操作', 'Actions for this version')}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {versionMenu === v.version && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setVersionMenu(null)} />
                                <div className="absolute left-12 top-7 z-50 bg-white border border-slate-200 rounded-xl shadow-pop py-1 min-w-[170px] text-xs animate-in fade-in zoom-in-95 duration-150">
                                  <button
                                    onClick={() => { setVersionMenu(null); alert(`[MOCK] Mở phiên bản ${v.version} của ${historyFile.name}`) }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> {L('Mở file', 'ファイルを開く', 'Open file')}
                                  </button>
                                  {!v.isCurrent && (
                                    <button
                                      onClick={() => {
                                        setVersionMenu(null)
                                        const cur = parseInt(historyFile.version.replace(/\D/g, '')) || 1
                                        setCompare({ file: historyFile, oldV: parseInt(v.version) || 1, newV: cur })
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-brand-50 cursor-pointer text-brand-700 font-semibold"
                                    >
                                      <GitCompare className="w-3.5 h-3.5" /> {L('So sánh với bản hiện tại', '現在のバージョンと比較', 'Compare with current')}
                                    </button>
                                  )}
                                  {!v.isCurrent && (
                                    <>
                                      <button
                                        onClick={() => { setVersionMenu(null); alert(`[MOCK] Đã khôi phục về phiên bản ${v.version}`) }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> {L('Khôi phục', '復元', 'Restore')}
                                      </button>
                                      <div className="border-t border-slate-100 my-1 mx-1" />
                                      <button
                                        onClick={() => { setVersionMenu(null); alert(`[MOCK] Đã xóa phiên bản ${v.version}`) }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 cursor-pointer text-rose-600"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> {L('Xóa phiên bản', 'バージョンを削除', 'Delete version')}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-xs text-slate-500 font-mono">{v.modified}</td>
                        <td className="py-3 pr-3 text-xs text-slate-500 font-mono">{v.size}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-2">
                            {isAI ? (
                              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-brand-500 text-white flex items-center justify-center shrink-0 shadow-3xs" title={L('Cập nhật tự động bởi AI', 'AIによる自動更新', 'Auto-updated by AI')}>
                                <Sparkles className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-700 text-[9px] font-bold flex items-center justify-center border border-brand-200/40 shrink-0">{initials}</span>
                            )}
                            <span className="text-xs text-slate-700 font-medium truncate">{v.author}</span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 text-[10px] text-slate-400 shrink-0">
              {L('Phiên bản do hệ thống tự đánh dấu mỗi lần file được cập nhật — không cần ghi version vào tên file.', 'バージョンはファイル更新ごとにシステムが自動付与します — ファイル名にバージョンを書く必要はありません。', 'Versions are auto-tagged by the system on each update — no need to put the version in the file name.')}
            </div>
          </div>
        </div>
      )}

      {/* Compare (diff) Modal */}
      {compare && (() => {
        const oldText = getComparableText(compare.file, compare.oldV)
        const newText = getComparableText(compare.file, compare.newV)
        const supported = oldText !== null && newText !== null
        const rows = supported ? diffLines(oldText as string, newText as string) : []
        const adds = rows.filter(r => r.type === 'add').length
        const dels = rows.filter(r => r.type === 'del').length
        return (
          <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center z-[60] animate-in fade-in duration-200" onClick={() => setCompare(null)}>
            <div className="bg-white rounded-3xl border border-slate-200 w-[680px] max-w-[94vw] shadow-pop animate-in zoom-in-95 duration-200 text-slate-800 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-200 shrink-0">
                <div className="min-w-0 pr-4">
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-brand-500" /> {L('So sánh phiên bản', 'バージョン比較', 'Compare versions')}
                  </h4>
                  <p className="text-[11px] text-slate-450 font-mono mt-0.5 truncate" title={compare.file.name}>{compare.file.name}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">{L('Bản', '版', 'V')} {compare.oldV}.0</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">{L('Bản', '版', 'V')} {compare.newV}.0 ({L('hiện tại', '現在', 'current')})</span>
                    {supported && (
                      <span className="ml-1 text-[10px] font-semibold text-slate-400">
                        <span className="text-emerald-600">+{adds} {L('thêm', '追加', 'added')}</span> · <span className="text-rose-500">−{dels} {L('bỏ', '削除', 'removed')}</span>
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setCompare(null)} className="text-slate-450 hover:text-slate-850 p-1.5 hover:bg-slate-100 rounded-full transition cursor-pointer shrink-0">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Diff body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                {!supported ? (
                  <div className="border border-dashed border-slate-200 rounded-xl bg-slate-50 p-8 text-center text-xs text-slate-400">
                    {L('Định dạng này (bản vẽ / tài liệu nhị phân) không so sánh trực tiếp bằng văn bản được.', 'この形式（図面・バイナリ資料）はテキストで直接比較できません。', 'This format (drawing / binary document) cannot be compared directly as text.')}<br />{L('Hãy tải 2 bản về để đối chiếu.', '2つのバージョンをダウンロードして照合してください。', 'Download both versions to compare.')}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 overflow-hidden font-mono text-[11px] leading-relaxed">
                    {rows.map((r, i) => (
                      <div
                        key={i}
                        className={`flex gap-2 px-3 py-0.5 whitespace-pre-wrap break-words ${
                          r.type === 'add' ? 'bg-emerald-50 text-emerald-800'
                            : r.type === 'del' ? 'bg-rose-50 text-rose-600'
                            : 'text-slate-500'
                        }`}
                      >
                        <span className={`select-none w-3 shrink-0 font-bold ${
                          r.type === 'add' ? 'text-emerald-500' : r.type === 'del' ? 'text-rose-400' : 'text-slate-300'
                        }`}>{r.type === 'add' ? '+' : r.type === 'del' ? '−' : ' '}</span>
                        <span className={r.type === 'del' ? 'line-through decoration-rose-300/60' : ''}>{r.text || ' '}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-3 border-t border-slate-100 text-[10px] text-slate-400 shrink-0 flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 inline-block" /> {L('Thêm ở bản mới', '新バージョンで追加', 'Added in new version')}</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-300 inline-block" /> {L('Bỏ so với bản cũ', '旧バージョンから削除', 'Removed vs old version')}</span>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
