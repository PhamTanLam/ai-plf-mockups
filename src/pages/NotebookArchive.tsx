import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, FolderOpen, FileText, Download, 
  Upload, GitCompare, History, Globe2, FileCode, Layers 
} from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

interface SavedVersion {
  version: string
  total: number
  editedBy: string
  timestamp: string
  changeDescription: string
  items: any[]
}

interface ProjectFile {
  id: string
  name: string
  category: 'input' | 'output'
  type: string
  size: string
  version: string
  createdAt: string
  author: string
}

export default function NotebookArchive() {
  const { id } = useParams<{ id: string }>()
  const { locale, setLocale } = useI18n()
  const [versions, setVersions] = useState<SavedVersion[]>([])
  const [selectedVerA, setSelectedVerA] = useState<string>('')
  const [selectedVerB, setSelectedVerB] = useState<string>('')
  
  // Simulated files list
  const [files, setFiles] = useState<ProjectFile[]>([
    { id: 'f-1', name: 'WW2_Technical_Specs.pdf', category: 'input', type: 'PDF Spec Sheet', size: '245 KB', version: 'V1', createdAt: '06/06/2026 09:30', author: 'Khách hàng' },
    { id: 'f-2', name: 'Electrical_CAD_Layout_v0.3.dxf', category: 'input', type: 'DXF AutoCAD Layout', size: '1.2 MB', version: 'V1', createdAt: '06/06/2026 09:32', author: 'Khách hàng' },
    { id: 'f-3', name: 'Auto_Welding_Sequence.json', category: 'input', type: 'JSON Flow Sequence', size: '12 KB', version: 'V1', createdAt: '06/06/2026 09:33', author: 'Linh' },
    { id: 'f-4', name: 'PLC_Ladder_Q03UDE.l5k', category: 'output', type: 'L5K Ladder Code', size: '89 KB', version: 'V2', createdAt: '06/06/2026 10:15', author: 'AI Assistant' },
    { id: 'f-5', name: 'Electrical_Layout_v2.0.dwg', category: 'output', type: 'DWG AutoCAD Layout', size: '1.4 MB', version: 'V2', createdAt: '06/06/2026 10:20', author: 'AI Assistant' },
    { id: 'f-6', name: 'Bien_Ban_Nghiem_Thu_Case_2026.docx', category: 'output', type: 'DOCX Report', size: '45 KB', version: 'V2', createdAt: '06/06/2026 10:30', author: 'AI Assistant' },
    { id: 'f-7', name: 'Huong_Dan_Van_Hanh_HMI.pdf', category: 'output', type: 'PDF User Manual', size: '1.1 MB', version: 'V2', createdAt: '06/06/2026 10:32', author: 'AI Assistant' }
  ])

  const [uploadName, setUploadName] = useState('')
  const [uploadType, setUploadType] = useState('input')
  const [isUploading, setIsUploading] = useState(false)
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)

  const VERSIONS_STORAGE_KEY = `aiplf.versions.${id || 'default'}`

  // Load versions
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VERSIONS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SavedVersion[]
        setVersions(parsed)
        if (parsed.length > 0) {
          setSelectedVerA(parsed[parsed.length - 1].version) // Oldest version
          setSelectedVerB(parsed[0].version) // Newest version
        }
      } else {
        // Create mock default versions if localStorage is empty
        const defaultVer1: SavedVersion = {
          version: 'V1',
          total: 10670,
          editedBy: 'Kanai',
          timestamp: '06/06/2026 09:35',
          changeDescription: 'Bản gốc ban đầu lập dự toán dự án',
          items: [
            { id: 'mat-1', name: 'PLC CPU Module Melsec Q03UDE', category: 'PLC & Modules', quantity: 1, unitPrice: 1200, unit: 'Bộ', maker: 'Mitsubishi' },
            { id: 'mat-2', name: 'Servo Motor & Amplifier MR-J5-40A (400W)', category: 'Servo Systems', quantity: 3, unitPrice: 1500, unit: 'Bộ', maker: 'Mitsubishi' },
            { id: 'mat-3', name: 'Cảm biến tiệm cận Proximity Sensor (M12)', category: 'Sensors', quantity: 8, unitPrice: 45, unit: 'Cái', maker: 'Omron' },
            { id: 'mat-4', name: 'Cảm biến quang điện Photoelectric Sensor', category: 'Sensors', quantity: 6, unitPrice: 85, unit: 'Cái', maker: 'Keyence' },
            { id: 'mat-5', name: 'Màn hình cảm ứng HMI GOT2000 10-inch', category: 'HMI Screen', quantity: 1, unitPrice: 850, unit: 'Bộ', maker: 'Mitsubishi' },
            { id: 'mat-6', name: 'Bộ nguồn Power Supply 24VDC 10A', category: 'Power & Cabinet', quantity: 1, unitPrice: 150, unit: 'Cái', maker: 'Omron' },
            { id: 'mat-7', name: 'Rơ le an toàn Safety Relay Unit G9SE', category: 'Safety Devices', quantity: 1, unitPrice: 250, unit: 'Cái', maker: 'Omron' },
            { id: 'mat-8', name: 'Cáp điều khiển & Vật tư tủ điện phụ', category: 'Accessories', quantity: 1, unitPrice: 300, unit: 'Lô', maker: 'Phượng Hoàng' }
          ]
        }
        const defaultVer2: SavedVersion = {
          version: 'V2',
          total: 12170,
          editedBy: 'Linh',
          timestamp: '06/06/2026 10:15',
          changeDescription: 'Bổ sung thêm 1 trục Servo A4 và 2 cảm biến quang điện phụ theo yêu cầu đối chiếu hiện trường',
          items: [
            { id: 'mat-1', name: 'PLC CPU Module Melsec Q03UDE', category: 'PLC & Modules', quantity: 1, unitPrice: 1200, unit: 'Bộ', maker: 'Mitsubishi' },
            { id: 'mat-2', name: 'Servo Motor & Amplifier MR-J5-40A (400W)', category: 'Servo Systems', quantity: 4, unitPrice: 1500, unit: 'Bộ', maker: 'Mitsubishi' },
            { id: 'mat-3', name: 'Cảm biến tiệm cận Proximity Sensor (M12)', category: 'Sensors', quantity: 8, unitPrice: 45, unit: 'Cái', maker: 'Omron' },
            { id: 'mat-4', name: 'Cảm biến quang điện Photoelectric Sensor', category: 'Sensors', quantity: 8, unitPrice: 85, unit: 'Cái', maker: 'Keyence' },
            { id: 'mat-5', name: 'Màn hình cảm ứng HMI GOT2000 10-inch', category: 'HMI Screen', quantity: 1, unitPrice: 850, unit: 'Bộ', maker: 'Mitsubishi' },
            { id: 'mat-6', name: 'Bộ nguồn Power Supply 24VDC 10A', category: 'Power & Cabinet', quantity: 1, unitPrice: 150, unit: 'Cái', maker: 'Omron' },
            { id: 'mat-7', name: 'Rơ le an toàn Safety Relay Unit G9SE', category: 'Safety Devices', quantity: 1, unitPrice: 250, unit: 'Cái', maker: 'Omron' },
            { id: 'mat-8', name: 'Cáp điều khiển & Vật tư tủ điện phụ', category: 'Accessories', quantity: 1, unitPrice: 300, unit: 'Lô', maker: 'Phượng Hoàng' }
          ]
        }
        const defaultsList = [defaultVer2, defaultVer1]
        setVersions(defaultsList)
        localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(defaultsList))
        setSelectedVerA('V1')
        setSelectedVerB('V2')
      }
    } catch {
      // ignore
    }
  }, [id])

  // Get active version objects
  const verAObj = versions.find(v => v.version === selectedVerA)
  const verBObj = versions.find(v => v.version === selectedVerB)

  // Compare function
  const getComparisonData = () => {
    if (!verAObj || !verBObj) return []
    const allNames = new Set([
      ...verAObj.items.map(i => i.name),
      ...verBObj.items.map(i => i.name)
    ])

    const compRows: any[] = []
    allNames.forEach(name => {
      const itemA = verAObj.items.find(i => i.name === name)
      const itemB = verBObj.items.find(i => i.name === name)

      const qtyA = itemA ? itemA.quantity : 0
      const qtyB = itemB ? itemB.quantity : 0
      const priceA = itemA ? itemA.unitPrice : (itemB ? itemB.unitPrice : 0)
      const priceB = itemB ? itemB.unitPrice : (itemA ? itemA.unitPrice : 0)

      const costA = qtyA * priceA
      const costB = qtyB * priceB
      const diff = costB - costA

      if (qtyA !== qtyB || priceA !== priceB || diff !== 0) {
        compRows.push({
          name,
          maker: itemB?.maker || itemA?.maker || 'N/A',
          qtyA,
          qtyB,
          priceA,
          priceB,
          costA,
          costB,
          diff,
          status: diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'changed_price'
        })
      } else {
        compRows.push({
          name,
          maker: itemB?.maker || itemA?.maker || 'N/A',
          qtyA,
          qtyB,
          priceA,
          priceB,
          costA,
          costB,
          diff: 0,
          status: 'unchanged'
        })
      }
    })

    return compRows.sort((a, b) => {
      if (a.status === 'unchanged' && b.status !== 'unchanged') return 1
      if (a.status !== 'unchanged' && b.status === 'unchanged') return -1
      return b.diff - a.diff
    })
  }

  const comparisonRows = getComparisonData()

  // Handle mock download
  const handleDownload = (file: ProjectFile) => {
    setDownloadingFileId(file.id)
    setTimeout(() => {
      setDownloadingFileId(null)
      // Trigger a raw browser download simulation
      alert(`[MOCK DOWNLOAD] Đã tải thành công file: ${file.name}\nPhiên bản: ${file.version}\nDung lượng: ${file.size}`)
    }, 1200)
  }

  // Handle mock file upload
  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadName.trim()) return

    setIsUploading(true)
    setTimeout(() => {
      const newFile: ProjectFile = {
        id: `f-${Date.now()}`,
        name: uploadName,
        category: uploadType as 'input' | 'output',
        type: uploadName.endsWith('.pdf') ? 'PDF Document' : uploadName.endsWith('.dwg') || uploadName.endsWith('.dxf') ? 'AutoCAD DWG Layout' : 'Technical Document',
        size: '412 KB',
        version: `V${versions.length > 0 ? versions[0].version.slice(1) : '1'}`,
        createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        author: 'User'
      }

      setFiles([...files, newFile])
      setUploadName('')
      setIsUploading(false)
      alert(`Đã nạp tài liệu nguồn thành công: ${newFile.name}`)
    }, 1000)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-mesh overflow-hidden text-slate-800 font-sans">
      
      {/* Upper Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-none z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to={`/workspace/${id}`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            title="Quay lại không gian làm việc"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              Thư viện & Lịch sử
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-brand-500/10 text-brand-700 border border-brand-500/20 uppercase">
                Thư viện · Library
              </span>
            </h2>
            <p className="text-[10px] text-slate-450 font-mono">Dự án: {id || 'CASE-2026-0245'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-brand-500/5 rounded-xl border border-slate-250 transition cursor-pointer"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{locale === 'vi' ? 'Tiếng Việt' : 'English'}</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-slate-100 text-brand-700 font-mono font-bold text-sm flex items-center justify-center border border-slate-200">
            A
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 p-6 gap-6 overflow-hidden">
        
        {/* Left Panel: Version Control & Comparison (60% Width) */}
        <section className="flex-[3] bg-white border border-slate-200 rounded-3xl p-5 flex flex-col min-h-0 shadow-panel">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-500" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Lịch sử lưu trữ & So sánh phiên bản
                </h3>
                <p className="text-[10px] text-slate-450">
                  Đối chiếu chênh lệch số lượng & đơn giá thiết bị giữa các lần thương lượng
                </p>
              </div>
            </div>
            
            <div className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500 font-mono">
              Tổng số bản lưu: {versions.length}
            </div>
          </div>

          {/* Quick Version Selection Dropdowns */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mt-4 shrink-0 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <GitCompare className="w-4 h-4 text-brand-500 shrink-0" />
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">So sánh bản gốc:</span>
                <select
                  value={selectedVerA}
                  onChange={(e) => setSelectedVerA(e.target.value)}
                  className="bg-white border border-slate-250 rounded-lg px-2 py-1 text-slate-700 font-bold focus:outline-none focus:border-brand-500"
                >
                  {versions.map(v => (
                    <option key={v.version} value={v.version}>{v.version} (${v.total.toLocaleString()}) - {v.editedBy}</option>
                  ))}
                </select>

                <span className="font-bold text-slate-400">với bản sửa:</span>
                
                <select
                  value={selectedVerB}
                  onChange={(e) => setSelectedVerB(e.target.value)}
                  className="bg-white border border-slate-250 rounded-lg px-2 py-1 text-slate-700 font-bold focus:outline-none focus:border-brand-500"
                >
                  {versions.map(v => (
                    <option key={v.version} value={v.version}>{v.version} (${v.total.toLocaleString()}) - {v.editedBy}</option>
                  ))}
                </select>
              </div>
            </div>

            {verAObj && verBObj && (
              <div className="text-right text-xs font-mono">
                <span className="text-slate-500 font-bold">Chênh lệch ngân sách: </span>
                <strong className={`font-black text-sm px-2 py-0.5 rounded ${
                  verBObj.total - verAObj.total > 0 
                    ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                    : verBObj.total - verAObj.total < 0 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {verBObj.total - verAObj.total > 0 ? '+' : ''}
                  ${(verBObj.total - verAObj.total).toLocaleString()} USD
                </strong>
              </div>
            )}
          </div>

          {/* Versions details info cards */}
          <div className="grid grid-cols-2 gap-4 mt-4 shrink-0">
            {verAObj && (
              <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs leading-relaxed">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 font-black rounded font-mono text-[10px]">
                    BẢN GỐC A ({verAObj.version})
                  </span>
                  <span className="text-[10px] text-slate-450 font-bold font-mono">{verAObj.timestamp}</span>
                </div>
                <div className="font-semibold text-slate-600">
                  Người sửa: <strong className="text-slate-800">{verAObj.editedBy}</strong>
                </div>
                <div className="text-slate-500 truncate mt-0.5" title={verAObj.changeDescription}>
                  Mô tả: {verAObj.changeDescription}
                </div>
              </div>
            )}
            
            {verBObj && (
              <div className="bg-brand-50/20 border border-brand-200/50 rounded-2xl p-3 text-xs leading-relaxed">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 bg-brand-500 text-white font-black rounded font-mono text-[10px] shadow-3xs">
                    BẢN SỬA B ({verBObj.version})
                  </span>
                  <span className="text-[10px] text-brand-600 font-bold font-mono">{verBObj.timestamp}</span>
                </div>
                <div className="font-semibold text-brand-700">
                  Người sửa: <strong className="text-brand-900">{verBObj.editedBy}</strong>
                </div>
                <div className="text-slate-600 truncate mt-0.5" title={verBObj.changeDescription}>
                  Mô tả: {verBObj.changeDescription}
                </div>
              </div>
            )}
          </div>

          {/* Comparison Table */}
          <div className="flex-1 overflow-y-auto mt-4 border border-slate-200 rounded-2xl min-h-0 bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[9px] text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                  <th className="py-2.5 px-3">Tên thiết bị</th>
                  <th className="py-2.5 px-3 text-center">{selectedVerA || 'Bản A'} (Qty)</th>
                  <th className="py-2.5 px-3 text-center">{selectedVerB || 'Bản B'} (Qty)</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền A</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền B</th>
                  <th className="py-2.5 px-3 text-right">Biến động</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => {
                  const hasDiff = row.diff !== 0 || row.qtyA !== row.qtyB
                  
                  return (
                    <tr 
                      key={index}
                      className={`border-b border-slate-200/50 hover:bg-slate-50/50 transition-colors ${
                        hasDiff ? 'font-semibold bg-brand-500/2' : 'text-slate-500'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className={`font-bold ${hasDiff ? 'text-slate-800' : 'text-slate-600'}`}>{row.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{row.maker}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">{row.qtyA}</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                        <span className={row.qtyA !== row.qtyB ? 'text-brand-700 font-bold' : ''}>
                          {row.qtyB}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">${row.priceA.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-450">${row.costA.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">${row.costB.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {row.diff > 0 ? (
                          <span className="text-rose-600 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded font-bold">
                            +${row.diff.toLocaleString()}
                          </span>
                        ) : row.diff < 0 ? (
                          <span className="text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-bold">
                            -${Math.abs(row.diff).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Panel: Project File Library (40% Width) */}
        <section className="flex-[2] bg-white border border-slate-200 rounded-3xl p-5 flex flex-col min-h-0 shadow-panel">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Thư viện file tài liệu dự án
                </h3>
                <p className="text-[10px] text-slate-450">
                  Lưu trữ tập trung tài liệu đầu vào (của KH) và file đầu ra sinh bởi AI
                </p>
              </div>
            </div>
          </div>

          {/* Quick upload file simulation */}
          <form onSubmit={handleUploadFile} className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl shrink-0 space-y-2 text-xs">
            <div className="font-bold text-slate-700 uppercase tracking-wide">Nạp tài liệu kỹ thuật mới (Simulate Input)</div>
            
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Ví dụ: Specs_Dong_Co_Trục_A5.pdf"
                value={uploadName}
                onChange={e => setUploadName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-brand-500"
              />
              <select
                value={uploadType}
                onChange={e => setUploadType(e.target.value)}
                className="bg-white border border-slate-250 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500 font-bold"
              >
                <option value="input">Tài liệu Khách hàng</option>
                <option value="output">File thiết kế (Output)</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading}
                className="flex items-center gap-1 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white rounded-lg font-bold shadow-sm transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Đang nạp...' : 'Tải lên thư viện'}</span>
              </button>
            </div>
          </form>

          {/* Files List Directory */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 min-h-0">
            
            {/* Category 1: INPUT FILES */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>📥 Tài liệu đầu vào từ Khách hàng</span>
              </div>

              <div className="space-y-2">
                {files.filter(f => f.category === 'input').map((file) => (
                  <div 
                    key={file.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-xl flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5 font-mono">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>Bản: {file.version}</span>
                          <span>•</span>
                          <span>Người nạp: {file.author}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(file)}
                      disabled={downloadingFileId !== null}
                      className="p-2 bg-white hover:bg-slate-200 border border-slate-250 text-slate-600 rounded-lg hover:text-slate-900 transition shrink-0 cursor-pointer"
                      title="Tải file"
                    >
                      {downloadingFileId === file.id ? (
                        <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 2: OUTPUT FILES GENERATED BY AI */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand-600 uppercase tracking-wider font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span>📤 File CAD & Code sinh bởi AI</span>
              </div>

              <div className="space-y-2">
                {files.filter(f => f.category === 'output').map((file) => {
                  const isCAD = file.name.endsWith('.dwg') || file.name.endsWith('.dxf')
                  const isCode = file.name.endsWith('.l5k') || file.name.endsWith('.st')
                  
                  return (
                    <div 
                      key={file.id}
                      className="p-3 bg-brand-500/2 hover:bg-brand-500/5 border border-brand-200/50 rounded-xl flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isCAD ? 'bg-indigo-50 text-indigo-600' : isCode ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'
                        }`}>
                          {isCAD ? (
                            <Layers className="w-4 h-4" />
                          ) : isCode ? (
                            <FileCode className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5 font-mono">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span className="text-brand-600 font-extrabold">Bản: {file.version}</span>
                            <span>•</span>
                            <span>Tạo: {file.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownload(file)}
                        disabled={downloadingFileId !== null}
                        className="p-2 bg-white hover:bg-slate-200 border border-slate-250 text-slate-600 rounded-lg hover:text-slate-900 transition shrink-0 cursor-pointer"
                        title="Tải file"
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
            </div>

          </div>

        </section>

      </div>

    </div>
  )
}
