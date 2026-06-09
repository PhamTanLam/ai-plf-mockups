import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, FolderOpen, FileText, Download, 
  FileCode, Layers, Search, X, ArrowUpDown, Filter
} from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

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
  const { t } = useI18n()
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'code' | 'cad' | 'doc'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)
  
  // State for premium preview and bulk download
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<ProjectFile | null>(null)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)

  // Simulated files list (AI output files only, expanded for search and category utility)
  const [files] = useState<ProjectFile[]>([
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
      name: 'Electrical_Layout_v2.0.dwg', 
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
      name: 'PLC_Memory_Mapping_V1.pdf', 
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
  ])

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

  // Dynamic counter for filter buttons
  const getCount = (catId: 'all' | 'code' | 'cad' | 'doc') => {
    if (catId === 'all') return files.length
    return files.filter(f => getFileCategory(f.name) === catId).length
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

  // Bulk ZIP download simulation
  const handleDownloadAll = () => {
    setIsDownloadingAll(true)
    setTimeout(() => {
      setIsDownloadingAll(false)
      alert(`[MOCK EXPORT] Đã nén và tải xuống thành công file: Project_Library_Exports.zip (${filteredFiles.length} tệp)`)
    }, 1800)
  }

  // Filtering and Sorting Process
  const filteredFiles = files
    .filter(file => {
      // 1. Search Query
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            file.type.toLowerCase().includes(searchQuery.toLowerCase())
      
      // 2. Category Filter
      const cat = getFileCategory(file.name)
      const matchesCategory = categoryFilter === 'all' || cat === categoryFilter
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // 3. Sorting
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else if (sortBy === 'size') {
        return parseSizeToKb(b.size) - parseSizeToKb(a.size)
      } else {
        // Date sorting (newest first, based on createdAt format 'dd/mm/yyyy hh:mm')
        return b.createdAt.localeCompare(a.createdAt)
      }
    })

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
        {type === 'docx' && (
          <>
            <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase text-[11px]">
              BIÊN BẢN NGHIỆM THU KỸ THUẬT VÀ BÀN GIAO THIẾT BỊ
            </div>
            <p className="font-semibold text-slate-800">1. Thành phần nghiệm thu:</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
              <li>Đại diện Khách hàng: Trưởng bộ phận Kỹ thuật sản xuất</li>
              <li>Đại diện Đơn vị Thiết kế: Kỹ sư Linh (Cowatech)</li>
            </ul>
            <p className="font-semibold text-slate-800">2. Nội dung nghiệm thu:</p>
            <p className="text-[11px] text-slate-600">
              Kiểm tra vận hành liên động an toàn, hệ thống Robot hàn hàn đúng chu trình, thời gian đáp ứng đạt chuẩn chất lượng IEC 61131.
            </p>
          </>
        )}
        {type === 'pdf_manual' && (
          <>
            <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase text-[11px]">
              TÀI LIỆU HƯỚNG DẪN VẬN HÀNH MÀN HÌNH HMI GOT2000
            </div>
            <p className="font-semibold text-slate-800">1. Tổng quan giao diện:</p>
            <p className="text-[11px] text-slate-600">
              Màn hình HMI bao gồm 3 trang chính: Trang chủ (Home), Trang thông số điều khiển (Settings), và Trang chẩn đoán lỗi (Diagnostics).
            </p>
            <p className="font-semibold text-slate-800">2. Quy trình khởi động:</p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
              <li>Kiểm tra nguồn điện 220VAC cấp cho HMI.</li>
              <li>Đợi màn hình hiển thị logo khởi động và tự động kết nối PLC.</li>
              <li>Nhấn nút "Reset Lỗi" trên màn hình trước khi nhấn "Start".</li>
            </ol>
          </>
        )}
        {type === 'pdf_memory' && (
          <>
            <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase text-[11px]">
              CẤU HÌNH PHÂN BỔ BỘ NHỚ MODBUS TCP REGISTER MAPPING
            </div>
            <table className="w-full border-collapse text-[10px] text-left text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 font-bold bg-slate-100">
                  <th className="p-1">Địa chỉ (HEX)</th>
                  <th className="p-1">Tên thanh ghi</th>
                  <th className="p-1">Định dạng</th>
                  <th className="p-1">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono">0x40001</td>
                  <td className="p-1">SYSTEM_STATUS</td>
                  <td className="p-1">INT16</td>
                  <td className="p-1">Trạng thái hệ thống (1: Run, 2: Idle, 9: Error)</td>
                </tr>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono">0x40002</td>
                  <td className="p-1">WELDING_COUNT</td>
                  <td className="p-1">INT32</td>
                  <td className="p-1">Tổng sản phẩm đã thực hiện hàn thành công</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
        {type === 'excel' && (
          <>
            <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase text-[11px]">
              BẢNG PHÂN BỔ TÍN HIỆU ĐẦU VÀO/ĐẦU RA (I/O MAPPING TABLE)
            </div>
            <table className="w-full border-collapse text-[10px] text-left text-slate-600">
              <thead>
                <tr className="border-b border-slate-250 font-bold bg-slate-200/50">
                  <th className="p-1">Địa chỉ PLC</th>
                  <th className="p-1">Tên tín hiệu</th>
                  <th className="p-1">Phân loại</th>
                  <th className="p-1">Thiết bị ngoại vi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono text-brand-600 font-bold">X00</td>
                  <td className="p-1">PB_START</td>
                  <td className="p-1 font-bold">INPUT</td>
                  <td className="p-1">Nút nhấn Start tủ điện chính</td>
                </tr>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono text-brand-600 font-bold">X01</td>
                  <td className="p-1">SEN_SAFETY_GATE</td>
                  <td className="p-1 font-bold">INPUT</td>
                  <td className="p-1">Cảm biến an toàn cửa mở</td>
                </tr>
                <tr className="border-b border-slate-150">
                  <td className="p-1 font-mono text-rose-600 font-bold">Y00</td>
                  <td className="p-1">SOL_CYLINDER_CLAMP</td>
                  <td className="p-1 font-bold">OUTPUT</td>
                  <td className="p-1">Van điện từ kẹp phôi đồ gá</td>
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
        <section className="max-w-3xl w-full h-full bg-white border border-slate-200 rounded-3xl p-6 flex flex-col min-h-0 shadow-panel">
          <div className="flex items-center justify-between border-b border-slate-250 pb-3.5 shrink-0">
            <div className="flex items-center gap-2">
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

            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll || filteredFiles.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {isDownloadingAll ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang nén ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải toàn bộ ({filteredFiles.length})</span>
                </>
              )}
            </button>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài liệu, định dạng..."
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

            {/* Sort Dropdown */}
            <div className="relative min-w-[160px]">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-bold text-slate-700 cursor-pointer appearance-none"
              >
                <option value="date">Mới cập nhật</option>
                <option value="name">Tên tệp (A-Z)</option>
                <option value="size">Dung lượng lớn</option>
              </select>
            </div>
          </div>

          {/* Category Filter Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3.5 shrink-0 select-none pb-3 border-b border-slate-100">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Lọc theo:
            </span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'code', label: 'Mã nguồn PLC' },
              { id: 'cad', label: 'Sơ đồ mạch CAD' },
              { id: 'doc', label: 'Tài liệu & Báo cáo' }
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

          {/* Files List Directory */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1 min-h-0">
            {filteredFiles.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <FileText className="w-10 h-10 text-slate-300 mb-2 animate-bounce-slow" />
                <p className="text-xs font-bold text-slate-400">Không tìm thấy tài liệu phù hợp</p>
                <p className="text-[10px] text-slate-400 mt-1">Hãy thử tìm với từ khóa hoặc bộ lọc khác</p>
              </div>
            ) : (
              <div className="space-y-2 pb-2">
                {filteredFiles.map((file) => {
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
                            <span className={`text-[7.5px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                              file.approvalStatus === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                                : file.approvalStatus === 'reviewing'
                                ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-600 border border-slate-250'
                            }`}>
                              {file.approvalStatus === 'approved' ? 'Đã ký số' : file.approvalStatus === 'reviewing' ? 'Chờ duyệt' : 'Bản thảo'}
                            </span>
                          </div>
                          
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation() // Prevent opening the preview modal
                          handleDownload(file)
                        }}
                        disabled={downloadingFileId !== null}
                        className="p-2 bg-white hover:bg-slate-200 border border-slate-250 text-slate-600 rounded-lg hover:text-slate-900 transition shrink-0 cursor-pointer z-10"
                        title={t('post.arch.downloadFile')}
                      >
                        {downloadingFileId === file.id ? (
                          <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin block" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* File Preview Modal */}
      {selectedPreviewFile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-[560px] space-y-4 shadow-pop animate-in zoom-in-95 duration-200 text-slate-800 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3 shrink-0">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate" title={selectedPreviewFile.name}>
                    {selectedPreviewFile.name}
                  </h4>
                  <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                    selectedPreviewFile.approvalStatus === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                      : selectedPreviewFile.approvalStatus === 'reviewing'
                      ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-600 border border-slate-250'
                  }`}>
                    {selectedPreviewFile.approvalStatus === 'approved'
                      ? 'Đã Phê Duyệt'
                      : selectedPreviewFile.approvalStatus === 'reviewing'
                      ? 'Chờ Duyệt'
                      : 'Bản Thảo'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Định dạng: {selectedPreviewFile.type} • Dung lượng: {selectedPreviewFile.size} • Phiên bản: {selectedPreviewFile.version}
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
                <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Tóm tắt nội dung (AI Extract):</h5>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed bg-brand-500/2 border border-brand-200/20 rounded-xl p-3">
                  {selectedPreviewFile.summary}
                </p>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedPreviewFile.tags.map((tag, i) => (
                  <span key={i} className="text-[9px] font-bold text-slate-500 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Dynamic Preview Canvas Container */}
              <div className="space-y-1">
                <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Bản xem trước tệp (File Preview):</h5>
                
                {/* Check file type for preview rendering */}
                {(() => {
                  if (selectedPreviewFile.previewContent === 'cad') {
                    return renderCadPreview()
                  } else if (selectedPreviewFile.previewContent === 'DOCX_REPORT') {
                    return renderDocPreview('docx')
                  } else if (selectedPreviewFile.previewContent === 'PDF_MANUAL') {
                    return renderDocPreview('pdf_manual')
                  } else if (selectedPreviewFile.previewContent === 'PDF_MEMORY') {
                    return renderDocPreview('pdf_memory')
                  } else if (selectedPreviewFile.previewContent === 'EXCEL_TABLE') {
                    return renderDocPreview('excel')
                  } else if (selectedPreviewFile.previewContent) {
                    // Monospace preview block for code
                    return (
                      <pre className="bg-slate-950 text-emerald-450 p-4 border border-slate-800 rounded-xl text-[10.5px] font-mono overflow-auto max-h-[220px] leading-relaxed select-all">
                        {selectedPreviewFile.previewContent}
                      </pre>
                    )
                  } else {
                    return (
                      <div className="border border-slate-200 rounded-xl bg-slate-50 p-6 text-center text-[11px] text-slate-400">
                        Không hỗ trợ xem trước cho tệp định dạng này
                      </div>
                    )
                  }
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleDownload(selectedPreviewFile)
                  setSelectedPreviewFile(null)
                }}
                disabled={downloadingFileId !== null}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp xuống</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
