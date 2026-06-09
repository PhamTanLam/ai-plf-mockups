import { useState, useEffect } from 'react'
import { Save, Cpu, Layers, FileCheck2, Plus, Minus, CheckCircle } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

export interface ComponentItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  note: string
  maker: string
  specs: string
  interface: string
}

interface SmartMaterialsTableProps {
  projectId: string
  currentUser?: 'Linh' | 'Kanai' | 'AI'
  materialsVersion?: number
  onAddLog?: (action: string, phaseNum: number) => void
  onMaterialsChange?: (totalIoPoints: number) => void
  onUpdateChat?: (userMsg: string, aiMsg: string) => void
  showSyncBadge?: boolean
}

const DEFAULT_COMPONENTS: ComponentItem[] = [
  { id: 'mat-1', name: 'PLC CPU Module Melsec Q03UDE', category: 'PLC & Modules', quantity: 1, unit: 'Bộ', note: 'Module chính xử lý logic', maker: 'Mitsubishi', specs: '32 DI, 16 DO, 1 Ethernet port, SSCNET', interface: 'RJ45 Ethernet / direct slot' },
  { id: 'mat-2', name: 'Servo Motor & Amplifier MR-J5-40A (400W)', category: 'Servo Systems', quantity: 3, unit: 'Bộ', note: 'Hệ thống truyền động trục A1, A2, A3', maker: 'Mitsubishi', specs: '400W, SSCNET III/H, 200VAC 3-phase', interface: 'SSCNET III/H cable' },
  { id: 'mat-3', name: 'Cảm biến tiệm cận Proximity Sensor (M12)', category: 'Sensors', quantity: 8, unit: 'Cái', note: 'Phát hiện vị trí giới hạn hành trình', maker: 'Omron', specs: 'PNP, NO output, range 12mm', interface: 'Direct DI Terminal (X00-X07)' },
  { id: 'mat-4', name: 'Cảm biến quang điện Photoelectric Sensor', category: 'Sensors', quantity: 6, unit: 'Cái', note: 'Xác nhận vật thể trên băng tải', maker: 'Keyence', specs: 'PNP, NO/NC adjustable, range 1m', interface: 'Direct DI Terminal (X08-X0D)' },
  { id: 'mat-5', name: 'Màn hình cảm ứng HMI GOT2000 10-inch', category: 'HMI Screen', quantity: 1, unit: 'Bộ', note: 'Màn hình giám sát và vận hành', maker: 'Mitsubishi', specs: '10.4-inch TFT LCD, 65k colors, Ethernet/Serial', interface: 'RJ45 Ethernet' },
  { id: 'mat-6', name: 'Bộ nguồn Power Supply 24VDC 10A', category: 'Power & Cabinet', quantity: 1, unit: 'Cái', note: 'Nguồn nuôi cảm biến và PLC', maker: 'Omron', specs: '24VDC 10A output, 100-240VAC input', interface: 'Direct cabinet rail' },
  { id: 'mat-7', name: 'Rơ le an toàn Safety Relay Unit G9SE', category: 'Safety Devices', quantity: 1, unit: 'Cái', note: 'Bảo vệ mạch liên khóa khẩn cấp E-Stop', maker: 'Omron', specs: 'G9SE, dual channel inputs, feedback loop check', interface: 'Hardwired safety input' }
]

export default function SmartMaterialsTable({
  projectId,
  currentUser = 'Linh',
  materialsVersion,
  onAddLog,
  onMaterialsChange,
  showSyncBadge = true
}: SmartMaterialsTableProps) {
  const { t, tf } = useI18n()
  const [components, setComponents] = useState<ComponentItem[]>([])
  const [activeTab, setActiveTab] = useState<'specs' | 'io_mapping' | 'software'>('specs')

  const STORAGE_KEY = `aiplf.materials.${projectId}`
  const VERSIONS_STORAGE_KEY = `aiplf.versions.${projectId}`

  // 1. Load initial components from storage or set defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setComponents(JSON.parse(stored))
      } else {
        setComponents(DEFAULT_COMPONENTS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPONENTS))
      }
    } catch {
      setComponents(DEFAULT_COMPONENTS)
    }
  }, [projectId, materialsVersion])

  // Count total IO Points dynamically
  const totalIoPoints = components.reduce((sum, item) => {
    if (item.category === 'PLC & Modules') return sum + 48
    if (item.category === 'Sensors') return sum + item.quantity
    if (item.category === 'Servo Systems') return sum + (item.quantity * 4) // Limit switches + alarm/enable signals
    return sum
  }, 0)

  // Report changes to parent
  useEffect(() => {
    if (onMaterialsChange && components.length > 0) {
      onMaterialsChange(totalIoPoints)
    }
  }, [components, totalIoPoints, onMaterialsChange])

  // Save current design proposal to localStorage as a version
  const handleSaveVersion = () => {
    try {
      const storedVersions = localStorage.getItem(VERSIONS_STORAGE_KEY)
      let versionsList: any[] = []
      if (storedVersions) {
        versionsList = JSON.parse(storedVersions)
      }

      const nextVerNum = versionsList.length + 1
      const newVersion = {
        version: `V${nextVerNum}`,
        total: `${totalIoPoints} IO points`,
        editedBy: currentUser,
        timestamp: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
        changeDescription: nextVerNum === 1 
          ? 'Bản đề xuất thiết kế điện & thông số PLC gốc' 
          : `Cập nhật cấu hình & I/O mapping qua AI Chat (Tổng I/O points: ${totalIoPoints})`,
        items: [...components]
      }

      versionsList.unshift(newVersion)
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(versionsList))

      if (onAddLog) {
        onAddLog(`Đã lưu phiên bản thiết kế mới ${newVersion.version} với ${totalIoPoints} ngõ I/O và kiến trúc tối ưu`, 9)
      }

      alert(tf('post.mat.savedAlert', { v: newVersion.version }))
    } catch (e) {
      console.error(e)
      alert(t('post.mat.saveError'))
    }
  }

  // Handle manual quantity adjustment for mock interaction
  const adjustQuantity = (id: string, increment: boolean) => {
    const updated = components.map(c => {
      if (c.id === id) {
        const nextQty = increment ? c.quantity + 1 : Math.max(0, c.quantity - 1)
        // Dynamically update address mapping description if sensors change
        let nextInterface = c.interface
        if (c.id === 'mat-3') {
          nextInterface = `Direct DI Terminal (X00-X0${nextQty - 1})`
        } else if (c.id === 'mat-4') {
          const prevSensorQty = components.find(item => item.id === 'mat-3')?.quantity || 8
          const offsetStart = prevSensorQty
          nextInterface = `Direct DI Terminal (X${offsetStart.toString(16).toUpperCase().padStart(2, '0')}-X${(offsetStart + nextQty - 1).toString(16).toUpperCase().padStart(2, '0')})`
        }
        return { ...c, quantity: nextQty, interface: nextInterface }
      }
      return c
    })
    setComponents(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  // Dynamic I/O mapping list based on configured quantities
  const getDynamicIoMapping = () => {
    const mapping: { address: string; type: string; signal: string; connectedTo: string }[] = [
      { address: 'X0.0', type: 'Digital Input', signal: 'E-STOP_PUSH_BUTTON', connectedTo: 'Nút nhấn dừng khẩn cấp cabinet' },
      { address: 'X0.1', type: 'Digital Input', signal: 'SAFETY_GATE_CLOSED', connectedTo: 'Cửa che chắn liên khóa an toàn KA1' }
    ]

    const proxQty = components.find(c => c.id === 'mat-3')?.quantity || 8
    const photoQty = components.find(c => c.id === 'mat-4')?.quantity || 6
    const servoQty = components.find(c => c.id === 'mat-2')?.quantity || 3

    // Add proximity sensors
    for (let i = 0; i < Math.min(proxQty, 8); i++) {
      mapping.push({
        address: `X1.${i}`,
        type: 'Digital Input',
        signal: `PROX_SENSOR_AXIS_${Math.floor(i / 2) + 1}_${i % 2 === 0 ? 'LIMIT_PLUS' : 'LIMIT_MINUS'}`,
        connectedTo: `Cảm biến tiệm cận giới hạn trục A${Math.floor(i / 2) + 1}`
      })
    }

    // Add photoelectric sensors
    for (let i = 0; i < Math.min(photoQty, 6); i++) {
      mapping.push({
        address: `X2.${i}`,
        type: 'Digital Input',
        signal: `PHOTO_SENSOR_CONVEYOR_${i + 1}`,
        connectedTo: `Cảm biến quang xác nhận phôi vị trí #${i + 1}`
      })
    }

    // Add Servo axis status
    for (let i = 0; i < Math.min(servoQty, 4); i++) {
      mapping.push({
        address: `X3.${i}`,
        type: 'Digital Input',
        signal: `SERVO_AMPLIFIER_ALARM_AXIS_${i + 1}`,
        connectedTo: `Tín hiệu lỗi Driver Servo Trục A${i + 1}`
      })
      mapping.push({
        address: `Y1.${i}`,
        type: 'Digital Output',
        signal: `SERVO_AMPLIFIER_ENABLE_AXIS_${i + 1}`,
        connectedTo: `Kích hoạt rơ le cấp nguồn động lực Trục A${i + 1}`
      })
    }

    // Output Tower light
    mapping.push(
      { address: 'Y0.0', type: 'Digital Output', signal: 'RED_LAMP_ALARM', connectedTo: 'Đèn tháp cảnh báo lỗi còi hú' },
      { address: 'Y0.1', type: 'Digital Output', signal: 'GREEN_LAMP_RUNNING', connectedTo: 'Đèn tháp trạng thái hệ thống chạy tự động' }
    )

    return mapping
  }

  const ioList = getDynamicIoMapping()
  const servoCount = components.find(c => c.id === 'mat-2')?.quantity || 3
  const hmiSpecs = components.find(c => c.id === 'mat-5')?.specs || '10.4-inch HMI GOT2000'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* LEFT COLUMN: Hardware components & configurations (7/12 width) */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-slate-700 shadow-panel h-[600px] flex flex-col min-h-0">
        
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('post.mat.title')}
              </h4>
              <p className="text-[10px] text-slate-450 mt-0.5">
                {t('post.mat.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveVersion}
            className="flex items-center gap-1.5 px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[10px] font-bold shadow-md shadow-brand-500/15 transition cursor-pointer"
          >
            <Save className="w-3 h-3" />
            <span>{t('post.mat.saveVersion')}</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200/60 p-0.5 bg-slate-50 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-white text-brand-700 shadow-xs border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Thông số Phần cứng
          </button>
          <button
            onClick={() => setActiveTab('io_mapping')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
              activeTab === 'io_mapping'
                ? 'bg-white text-brand-700 shadow-xs border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🧬 Bản đồ Địa chỉ I/O
          </button>
          <button
            onClick={() => setActiveTab('software')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
              activeTab === 'software'
                ? 'bg-white text-brand-700 shadow-xs border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            💻 Cấu trúc Phần mềm PLC/TP
          </button>
        </div>

        {/* Dynamic Tab Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'specs' && (
            <div className="space-y-2">
              <table className="w-full text-left border-collapse text-[10.5px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                    <th className="py-2 px-2">{t('post.mat.colName')}</th>
                    <th className="py-2 px-1">{t('post.mat.colMaker')}</th>
                    <th className="py-2 px-1 text-center w-[80px]">{t('post.mat.colQty')}</th>
                    <th className="py-2 px-2 text-right">{t('post.mat.colPrice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((item) => (
                    <tr 
                      key={item.id}
                      className="border-b border-slate-200/50 hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-slate-800 leading-tight">{item.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 leading-normal">{item.note}</div>
                      </td>
                      <td className="py-2.5 px-1">
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[9px] font-semibold">
                          {item.maker}
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => adjustQuantity(item.id, false)}
                            className="p-0.5 hover:bg-slate-200 rounded text-slate-500 cursor-pointer transition"
                            title="Giảm số lượng"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-5 font-bold text-slate-800 text-[10px] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => adjustQuantity(item.id, true)}
                            className="p-0.5 hover:bg-slate-200 rounded text-slate-500 cursor-pointer transition"
                            title="Tăng số lượng"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="font-bold text-slate-700 leading-normal">{item.specs}</div>
                        <div className="text-[8.5px] text-slate-400 font-mono mt-0.5">{item.interface}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'io_mapping' && (
            <div className="space-y-3 font-mono text-[9.5px]">
              <div className="flex items-center justify-between bg-slate-800 text-slate-300 p-2.5 rounded-lg text-[8.5px]">
                <span>ADDRESS INDEX (PLC Q-Series Memory)</span>
                <span className="text-emerald-400 font-bold">● ONLINE DIAGNOSTICS OK</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900 text-slate-400 text-[8px] font-extrabold uppercase">
                    <th className="py-1.5 px-2">PLC Address</th>
                    <th className="py-1.5 px-2">Signal Code</th>
                    <th className="py-1.5 px-2">Terminal Type</th>
                    <th className="py-1.5 px-2">Description / Component</th>
                  </tr>
                </thead>
                <tbody>
                  {ioList.map((io, idx) => (
                    <tr 
                      key={idx}
                      className="border-b border-slate-200/40 hover:bg-brand-50/10 transition-colors"
                    >
                      <td className="py-1.5 px-2 font-bold text-brand-700">{io.address}</td>
                      <td className="py-1.5 px-2 text-slate-800 font-semibold">{io.signal}</td>
                      <td className="py-1.5 px-2 text-slate-500 text-[8.5px]">{io.type}</td>
                      <td className="py-1.5 px-2 text-slate-600 leading-normal">{io.connectedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'software' && (
            <div className="space-y-4 p-2 text-xs">
              <div className="border border-brand-500/20 bg-brand-500/5 rounded-xl p-3">
                <h5 className="font-bold text-brand-800 text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Cấu trúc Khối chương trình PLC (IEC 61131-3)
                </h5>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Cấu trúc chương trình Structured Text (ST) tự động sinh lập và kiểm tra lỗi logic gồm 5 Task con chính:
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800">1. Program_Safety [SYS]</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Xử lý nút dừng khẩn, cửa chắn KA1 an toàn</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800">2. Servo_Ctrl_Axis1_3 [SSCNET]</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Khởi tạo và gán toạ độ điều khiển {servoCount} trục Servo</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800">3. Conveyor_Auto_Logic [AUTO]</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Điều khiển chạy trình tự băng tải bằng máy trạng thái</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800">4. Alarm_Handler [ALM]</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Quản lý còi hú cảnh báo, báo động lỗi và báo đèn tháp</div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3">
                <h5 className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                  🖥️ Thiết kế Giao diện Điều khiển HMI (TP Panel)
                </h5>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Thông số HMI: <span className="font-bold text-slate-700">{hmiSpecs}</span>. Danh sách 4 màn hình giao tiếp vận hành hiển thị:
                </p>
                <ul className="mt-2 space-y-1 text-[10px] list-disc list-inside text-slate-600 pl-1">
                  <li><span className="font-bold text-slate-800">Screen 01: Main Dashboard</span> - Giám sát tổng quát trạng thái hệ thống chạy/dừng.</li>
                  <li><span className="font-bold text-slate-800">Screen 02: Manual Control</span> - Kích hoạt tay, di chuyển trục/băng tải dạng JOG.</li>
                  <li><span className="font-bold text-slate-800">Screen 03: Parameter Configuration</span> - Điều chỉnh vận tốc, giới hạn tiệm cận phôi.</li>
                  <li><span className="font-bold text-slate-800">Screen 04: Alarm Diagnostics</span> - Hiển thị chi tiết nhật ký lỗi và cảnh báo an toàn.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sync Badge */}
        {showSyncBadge && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[8.5px] px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full font-bold whitespace-nowrap animate-pulse">
              {t('post.mat.syncBadge')}
            </span>
            <span className="text-[8.5px] text-slate-400 font-mono leading-normal">
              {t('post.mat.autoRecalc')}
            </span>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: AI Design Proposal Output (5/12 width) */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 shadow-xl h-[600px] flex flex-col min-h-0">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                📄 ĐỀ XUẤT THIẾT KẾ ĐIỆN
              </h4>
              <p className="text-[9px] text-emerald-400 font-mono tracking-wider uppercase mt-0.5">
                ● AI Generated Proposal
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded text-[8.5px] font-bold tracking-wider">
            BẢN THẢO V2.1
          </span>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto min-h-0 py-3.5 space-y-4 text-[10px] leading-relaxed pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Section 1: Scope */}
          <div>
            <h5 className="font-extrabold text-slate-200 text-[10px] border-l-2 border-emerald-400 pl-1.5 mb-1.5 uppercase font-mono tracking-wide">
              1. Mục tiêu & Hạng mục thiết kế
            </h5>
            <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 text-slate-300 font-medium whitespace-pre-line leading-normal">
              ※Tạm thời tập trung vào điện:
              ①Thiết kế phần cứng (Phân bổ khí cụ tủ điện)
              ②Thiết kế chương trình PLC và HMI (TP Panel)
            </div>
          </div>

          {/* Section 2: Inputs */}
          <div>
            <h5 className="font-extrabold text-slate-200 text-[10px] border-l-2 border-emerald-400 pl-1.5 mb-1.5 uppercase font-mono tracking-wide">
              2. Tài liệu đầu vào áp dụng
            </h5>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-400 leading-normal font-medium">
              <li>① Tài liệu thông số điện (Sơ đồ bố trí mặt bằng, nguồn AC200V 3 pha)</li>
              <li>② Tài liệu thông số phần mềm (Takt-time 30s, mô tả liên khóa an toàn)</li>
            </ul>
          </div>

          {/* Section 3: Architecture */}
          <div>
            <h5 className="font-extrabold text-slate-200 text-[10px] border-l-2 border-emerald-400 pl-1.5 mb-1.5 uppercase font-mono tracking-wide">
              3. Phương án cấu hình hệ thống
            </h5>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[9px] text-emerald-400 leading-normal space-y-1">
              <div>[Main PLC] --(Ethernet Modbus TCP)-- [HMI Touchscreen]</div>
              <div>[Main PLC] --(SSCNET III/H bus)---- [Servo Driver J5 * {servoCount}]</div>
              <div className="text-slate-500 mt-1.5 text-[8.5px]">
                * Băng thông Ethernet: 100Mbps ổn định.
                * Bus truyền động: 0.88ms đồng bộ thời gian thực {servoCount} trục động cơ.
              </div>
            </div>
          </div>

          {/* Section 4: Specifications */}
          <div>
            <h5 className="font-extrabold text-slate-200 text-[10px] border-l-2 border-emerald-400 pl-1.5 mb-1.5 uppercase font-mono tracking-wide">
              4. Kết quả Phân tích & Đề xuất I/O
            </h5>
            <p className="text-slate-400 mb-1.5 leading-normal">
              Tổng số ngõ I/O đã cấu hình: <span className="font-bold text-slate-200">{totalIoPoints} ngõ</span>. Hệ thống phân chia theo cụm:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800 text-center">
                <div className="text-slate-400 text-[8.5px] uppercase">Ngõ vào (DI)</div>
                <div className="font-bold text-slate-200 text-[11px] mt-0.5">{1 + 8 + 6 + servoCount} ngõ</div>
              </div>
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800 text-center">
                <div className="text-slate-400 text-[8.5px] uppercase">Ngõ ra (DO)</div>
                <div className="font-bold text-slate-200 text-[11px] mt-0.5">{2 + servoCount} ngõ</div>
              </div>
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800 text-center">
                <div className="text-slate-400 text-[8.5px] uppercase">Trục Servo</div>
                <div className="font-bold text-slate-200 text-[11px] mt-0.5">{servoCount} trục</div>
              </div>
            </div>
          </div>

          {/* Section 5: Safety Compliance */}
          <div>
            <h5 className="font-extrabold text-slate-200 text-[10px] border-l-2 border-emerald-400 pl-1.5 mb-1.5 uppercase font-mono tracking-wide">
              5. Liên khóa & Tiêu chuẩn bảo vệ
            </h5>
            <p className="text-slate-400 leading-normal">
              Hệ thống an toàn sử dụng rơ le G9SE liên khóa độc lập phần cứng với mạch lực cấp nguồn AC200V cho các Servo. Nếu cửa an toàn KA1 mở hoặc nhấn nút dừng khẩn cấp E-Stop, rơ le an toàn ngắt trực tiếp nguồn cuộn hút của Contactor chính, đảm bảo ngắt động cơ khẩn cấp (JIS C 8201).
            </p>
          </div>
        </div>

        {/* Footer info (I/O Points count instead of price) */}
        <div className="mt-auto pt-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-450 uppercase font-mono font-bold">
              {t('post.mat.totalLabel')}
            </span>
            <div className="text-right">
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {totalIoPoints}
              </span>
              <span className="text-[9px] text-slate-450 ml-1 font-semibold">I/O Points</span>
            </div>
          </div>
          
          <div className="mt-2.5 flex items-center justify-between text-[8px] text-slate-500 font-mono">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle className="w-2.5 h-2.5" />
              ĐÃ TỐI ƯU CÔNG SUẤT BỘ NGUỒN (24VDC 10A)
            </span>
            <span>Ver: V2.1</span>
          </div>
        </div>

      </div>

    </div>
  )
}
