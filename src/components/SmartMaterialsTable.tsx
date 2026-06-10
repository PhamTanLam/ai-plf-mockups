import { useState, useEffect } from 'react'
import { Save, Cpu, Layers, CheckCircle, HardDrive, Terminal } from 'lucide-react'
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
  { id: 'mat-7', name: 'Rơ le an toàn Safety Relay Unit G9SE', category: 'Safety Devices', quantity: 1, unit: 'Cái', note: 'Bảo vệ mạch liên khóa khân cấp E-Stop', maker: 'Omron', specs: 'G9SE, dual channel inputs, feedback loop check', interface: 'Hardwired safety input' }
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

  // Dynamic I/O mapping list based on configured quantities
  const getDynamicIoMapping = () => {
    const mapping: { address: string; type: string; signal: string; connectedTo: string }[] = [
      { address: 'X0.0', type: 'Input', signal: 'E-STOP_PUSH_BUTTON', connectedTo: 'Nút nhấn dừng khẩn cấp cabinet' },
      { address: 'X0.1', type: 'Input', signal: 'SAFETY_GATE_CLOSED', connectedTo: 'Cửa che chắn liên khóa an toàn KA1' }
    ]

    const proxQty = components.find(c => c.id === 'mat-3')?.quantity || 8
    const photoQty = components.find(c => c.id === 'mat-4')?.quantity || 6
    const servoQty = components.find(c => c.id === 'mat-2')?.quantity || 3

    // Add proximity sensors
    for (let i = 0; i < Math.min(proxQty, 6); i++) {
      mapping.push({
        address: `X1.${i}`,
        type: 'Input',
        signal: `PROX_SENSOR_AXIS_${Math.floor(i / 2) + 1}_${i % 2 === 0 ? 'LIMIT_PLUS' : 'LIMIT_MINUS'}`,
        connectedTo: `Cảm biến giới hạn hành trình trục A${Math.floor(i / 2) + 1}`
      })
    }

    // Add photoelectric sensors
    for (let i = 0; i < Math.min(photoQty, 4); i++) {
      mapping.push({
        address: `X2.${i}`,
        type: 'Input',
        signal: `PHOTO_SENSOR_CONVEYOR_${i + 1}`,
        connectedTo: `Cảm biến quang phát hiện phôi #${i + 1}`
      })
    }

    // Add Servo axis status
    for (let i = 0; i < Math.min(servoQty, 3); i++) {
      mapping.push({
        address: `X3.${i}`,
        type: 'Input',
        signal: `SERVO_ALARM_AXIS_${i + 1}`,
        connectedTo: `Tín hiệu lỗi Driver Servo Trục A${i + 1}`
      })
      mapping.push({
        address: `Y1.${i}`,
        type: 'Output',
        signal: `SERVO_ENABLE_AXIS_${i + 1}`,
        connectedTo: `Kích hoạt nguồn động lực Trục A${i + 1}`
      })
    }

    mapping.push(
      { address: 'Y0.0', type: 'Output', signal: 'RED_LAMP_ALARM', connectedTo: 'Đèn tháp cảnh báo lỗi còi hú' },
      { address: 'Y0.1', type: 'Output', signal: 'GREEN_LAMP_RUNNING', connectedTo: 'Đèn tháp trạng thái hệ thống chạy tự động' }
    )

    return mapping
  }

  const ioList = getDynamicIoMapping()
  const servoCount = components.find(c => c.id === 'mat-2')?.quantity || 3
  const proxCount = components.find(c => c.id === 'mat-3')?.quantity || 8
  const photoCount = components.find(c => c.id === 'mat-4')?.quantity || 6
  const hmiSpecs = components.find(c => c.id === 'mat-5')?.specs || '10.4-inch HMI GOT2000'

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-8 text-slate-700 shadow-panel relative">
      
      {/* File Document Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 shadow-sm">
            <Cpu className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              {t('post.mat.title')}
            </h3>
            <p className="text-[10px] text-slate-450 mt-1 italic font-semibold tracking-wide">
              * {t('post.mat.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={handleSaveVersion}
            className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden border border-white/10"
          >
            {/* Glossy light sweep effect on hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            <Save className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
            <span className="tracking-wide">{t('post.mat.saveVersion')}</span>
          </button>
        </div>
      </div>

      {/* METADATA SUMMARY BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl text-[10.5px]">
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Người thiết kế</span>
          <span className="font-extrabold text-slate-800 mt-1 block">AI Assistant & Kỹ sư {currentUser}</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Mức Tiêu thụ I/O</span>
          <span className="font-extrabold text-brand-600 mt-1 block font-mono">{totalIoPoints} I/O Points (Estimated)</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Mạng liên kết</span>
          <span className="font-extrabold text-slate-800 mt-1 block font-mono">Modbus TCP & SSCNET</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Quy chuẩn áp dụng</span>
          <span className="font-extrabold text-slate-800 mt-1 block">IEC 61131-3 & JIS C 8201</span>
        </div>
      </div>

      {/* SECTION 1: HARDWARE COMPONENTS SPECIFICATIONS */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-1.5 gap-2">
          <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            1. Cấu hình thiết bị & Thông số phần cứng
          </h4>
        </div>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                <th className="py-2.5 px-3">{t('post.mat.colName')}</th>
                <th className="py-2.5 px-2">{t('post.mat.colMaker')}</th>
                <th className="py-2.5 px-2 text-center w-[85px]">{t('post.mat.colQty')}</th>
                <th className="py-2.5 px-3 text-right">{t('post.mat.colPrice')}</th>
              </tr>
            </thead>
            <tbody>
              {components.map((item) => (
                <tr 
                  key={item.id}
                  className="border-b border-slate-200/50 hover:bg-slate-50/40 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-800 leading-tight">{item.name}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 leading-normal">{item.note}</div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[9px] font-semibold">
                      {item.maker}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="font-extrabold text-slate-800 text-[10.5px] font-mono bg-slate-50 border border-slate-200 rounded-md px-2.5 py-0.5">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="font-bold text-slate-700 leading-normal">{item.specs}</div>
                    <div className="text-[8.5px] text-slate-400 font-mono mt-0.5">{item.interface}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: SYSTEM DESIGN PROPOSAL (TEXT-BASED METHOD) */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          2. Phương án đề xuất thiết kế hệ thống (AI Design Proposal)
        </h4>
        
        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-4 text-[10.5px] leading-relaxed">
          <div>
            <span className="font-extrabold text-slate-800 text-[11.5px] block border-l-2 border-brand-500 pl-2">
              A. Phương án thiết kế phần cứng điện (Hardware electrical solution)
            </span>
            <p className="text-slate-500 mt-2 pl-2.5 font-semibold leading-relaxed">
              Hệ thống điều khiển trung tâm đề xuất sử dụng bộ PLC dòng Melsec Q-Series (CPU Q03UDE) của hãng Mitsubishi. CPU tích hợp sẵn cổng Ethernet RJ45 cho phép kết nối ổn định đến màn hình HMI và mạng nội bộ. Đối với cụm cơ cấu truyền động, đề xuất sử dụng {servoCount} hệ Servo Motor dòng MR-J5-40A (công suất 400W) giao tiếp thông qua mạng cáp quang tốc độ cao SSCNET III/H từ module chuyên dụng, giúp đồng bộ hóa vị trí các trục với thời gian quét bus dưới 1ms và triệt tiêu hoàn toàn nhiễu sóng động lực.
              Hệ thống cảm biến bao gồm {proxCount} cảm biến tiệm cận Omron phát hiện vị trí giới hạn hành trình các trục và {photoCount} cảm biến quang Keyence định vị phôi trên băng chuyền được đấu nối trực tiếp vào các phiến cầu đấu (terminal blocks) ngõ vào của mô-đun PLC.
            </p>
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-[11.5px] block border-l-2 border-brand-500 pl-2">
              B. Phương án thiết kế logic điều khiển & Giao diện HMI (Control logic & Visualization)
            </span>
            <p className="text-slate-500 mt-2 pl-2.5 font-semibold leading-relaxed">
              Chương trình PLC được cấu trúc hóa theo tiêu chuẩn IEC 61131-3, viết chủ yếu bằng ngôn ngữ Structured Text (ST) để tối ưu hóa hiệu năng quét lệnh. Logic hệ thống phân rã thành các khối độc lập: Khối xử lý liên khóa an toàn (ngắt động lực Contactor khi mở cửa KA1/nhấn E-Stop), Khối điều khiển chuyển động Servo (Auto/Jog), Khối chạy tự động băng tải bằng máy trạng thái, và Khối cảnh báo âm thanh/đèn tháp.
              Màn hình giao tiếp {hmiSpecs} sẽ kết nối qua giao thức Modbus TCP, thiết kế 4 trang màn hình chuẩn bao gồm: Màn hình giám sát tổng quát Dashboard (theo dõi trạng thái cảm biến và xylanh), Màn hình vận hành bằng tay Manual JOG, Màn hình hiệu chỉnh tham số hành trình, và Màn hình chẩn đoán cảnh báo lỗi hệ thống.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: DETAILED I/O ADDRESS MAP */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          3. Bản đồ phân bổ địa chỉ I/O dự kiến
        </h4>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[260px]">
          <table className="w-full text-left border-collapse text-[10.5px] font-mono">
            <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 text-slate-400 text-[8.5px] uppercase font-bold">
              <tr>
                <th className="py-2 px-3">PLC Address</th>
                <th className="py-2 px-2">Signal Code</th>
                <th className="py-2 px-2">Terminal Type</th>
                <th className="py-2 px-3 font-sans">Mô tả / Thành phần kết nối</th>
              </tr>
            </thead>
            <tbody>
              {ioList.map((io, idx) => (
                <tr 
                  key={idx}
                  className="border-b border-slate-200/50 hover:bg-slate-50/40 transition-colors"
                >
                  <td className="py-2 px-3 font-bold text-brand-700">{io.address}</td>
                  <td className="py-2 px-2 text-slate-800 font-semibold">{io.signal}</td>
                  <td className="py-2 px-2 text-slate-500 text-[8.5px]">{io.type}</td>
                  <td className="py-2 px-3 text-slate-600 font-sans leading-normal">{io.connectedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: SAFETY COMPLIANCE */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <h5 className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          4. Cam kết liên khóa an toàn & Bảo vệ mạch lực (JIS C 8201)
        </h5>
        <p className="text-[10px] text-slate-500 leading-relaxed pl-5 font-semibold">
          Hệ thống an toàn sử dụng rơ le an toàn G9SE liên khóa độc lập phần cứng với mạch lực cấp nguồn AC200V cho các Servo. Nếu cửa an toàn KA1 mở hoặc nhấn nút dừng khẩn cấp E-Stop, rơ le an toàn ngắt trực tiếp nguồn cuộn hút của Contactor chính, đảm bảo ngắt động cơ khẩn cấp (JIS C 8201).
        </p>
      </div>

      {/* FOOTER SYNC STATUS */}
      {showSyncBadge && (
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[8.5px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full font-bold whitespace-nowrap animate-pulse">
            {t('post.mat.syncBadge')}
          </span>
          <span>
            {t('post.mat.autoRecalc')}
          </span>
        </div>
      )}

    </div>
  )
}
