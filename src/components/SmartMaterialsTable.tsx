import { useState, useEffect } from 'react'
import { Save, ShoppingCart } from 'lucide-react'

export interface MaterialItem {
  id: string
  name: string
  category: string
  quantity: number
  unitPrice: number
  unit: string
  note: string
  maker: string
}

interface SmartMaterialsTableProps {
  projectId: string
  currentUser?: 'Linh' | 'Kanai' | 'AI'
  materialsVersion?: number
  onAddLog?: (action: string, phaseNum: number) => void
  onMaterialsChange?: (totalPrice: number) => void
  onUpdateChat?: (userMsg: string, aiMsg: string) => void
}

const DEFAULT_MATERIALS: MaterialItem[] = [
  { id: 'mat-1', name: 'PLC CPU Module Melsec Q03UDE', category: 'PLC & Modules', quantity: 1, unitPrice: 1200, unit: 'Bộ', note: 'Module chính xử lý logic', maker: 'Mitsubishi' },
  { id: 'mat-2', name: 'Servo Motor & Amplifier MR-J5-40A (400W)', category: 'Servo Systems', quantity: 3, unitPrice: 1500, unit: 'Bộ', note: 'Hệ thống truyền động trục A1, A2, A3', maker: 'Mitsubishi' },
  { id: 'mat-3', name: 'Cảm biến tiệm cận Proximity Sensor (M12)', category: 'Sensors', quantity: 8, unitPrice: 45, unit: 'Cái', note: 'Phát hiện vị trí giới hạn hành trình', maker: 'Omron' },
  { id: 'mat-4', name: 'Cảm biến quang điện Photoelectric Sensor', category: 'Sensors', quantity: 6, unitPrice: 85, unit: 'Cái', note: 'Xác nhận vật thể trên băng tải', maker: 'Keyence' },
  { id: 'mat-5', name: 'Màn hình cảm ứng HMI GOT2000 10-inch', category: 'HMI Screen', quantity: 1, unitPrice: 850, unit: 'Bộ', note: 'Màn hình giám sát và vận hành', maker: 'Mitsubishi' },
  { id: 'mat-6', name: 'Bộ nguồn Power Supply 24VDC 10A', category: 'Power & Cabinet', quantity: 1, unitPrice: 150, unit: 'Cái', note: 'Nguồn nuôi cảm biến và PLC', maker: 'Omron' },
  { id: 'mat-7', name: 'Rơ le an toàn Safety Relay Unit G9SE', category: 'Safety Devices', quantity: 1, unitPrice: 250, unit: 'Cái', note: 'Bảo vệ mạch liên khóa khẩn cấp E-Stop', maker: 'Omron' },
  { id: 'mat-8', name: 'Cáp điều khiển & Vật tư tủ điện phụ', category: 'Accessories', quantity: 1, unitPrice: 300, unit: 'Lô', note: 'Đầu cốt, máng cáp và phụ kiện đấu nối', maker: 'Phượng Hoàng' }
]

export default function SmartMaterialsTable({
  projectId,
  currentUser = 'Linh',
  materialsVersion,
  onAddLog,
  onMaterialsChange
}: SmartMaterialsTableProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>([])

  const MATERIALS_STORAGE_KEY = `aiplf.materials.${projectId}`
  const VERSIONS_STORAGE_KEY = `aiplf.versions.${projectId}`

  // 1. Load initial materials from storage or set defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MATERIALS_STORAGE_KEY)
      if (stored) {
        setMaterials(JSON.parse(stored))
      } else {
        // Read unit prices from Master Data if available
        const localPrices = getMasterPrices()
        const initialized = DEFAULT_MATERIALS.map(item => {
          const matchedPrice = localPrices.find(p => item.name.toLowerCase().includes(p.keyword.toLowerCase()))
          if (matchedPrice) {
            return { ...item, unitPrice: matchedPrice.price }
          }
          return item
        })
        setMaterials(initialized)
        localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(initialized))
      }
    } catch {
      setMaterials(DEFAULT_MATERIALS)
    }
  }, [projectId, materialsVersion])

  // Get master prices from localStorage if configured
  const getMasterPrices = (): { keyword: string; price: number }[] => {
    try {
      const stored = localStorage.getItem('aiplf.master_prices')
      if (stored) return JSON.parse(stored)
    } catch {}
    return []
  }

  // Calculate total price
  const totalPrice = materials.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  // Report changes to parent
  useEffect(() => {
    if (onMaterialsChange && materials.length > 0) {
      onMaterialsChange(totalPrice)
    }
  }, [materials, totalPrice, onMaterialsChange])

  // Freeze current materials list and save as a version to localStorage
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
        total: totalPrice,
        editedBy: currentUser,
        timestamp: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
        changeDescription: nextVerNum === 1 
          ? 'Bản dự toán gốc ban đầu sau đơn hàng' 
          : `Điều chỉnh số lượng vật tư thiết bị qua AI Chat (Tổng giá mới: $${totalPrice.toLocaleString()})`,
        items: [...materials]
      }

      versionsList.unshift(newVersion) // Prepend so newest is first
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(versionsList))

      if (onAddLog) {
        onAddLog(`Đã lưu phiên bản dự toán mới ${newVersion.version} với tổng tiền $${totalPrice.toLocaleString()}`, 9)
      }

      alert(`Đã lưu thành công phiên bản ${newVersion.version} vào Thư viện & Lịch sử phiên bản (Trang 3)!`)
    } catch (e) {
      console.error(e)
      alert('Đã xảy ra lỗi khi lưu phiên bản.')
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 text-slate-700 shadow-panel">
      
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600">
            <ShoppingCart className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bảng vật tư & Đơn giá thông minh
            </h4>
            <p className="text-[10px] text-slate-450 mt-0.5">
              Pha 9: Xem kết quả danh mục vật tư sau khi điều chỉnh
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveVersion}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/15 transition cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Lưu phiên bản vào Thư viện</span>
        </button>
      </div>

      {/* Materials Table Layout */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3">Tên thiết bị / Mô tả</th>
              <th className="py-2.5 px-3">Hãng</th>
              <th className="py-2.5 px-3 text-center">Số lượng</th>
              <th className="py-2.5 px-3">Đơn vị</th>
              <th className="py-2.5 px-3">Đơn giá ($)</th>
              <th className="py-2.5 px-3 text-right">Thành tiền ($)</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((item) => (
              <tr 
                key={item.id}
                className="border-b border-slate-200/50 hover:bg-slate-50/40 transition-colors"
              >
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-800">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.note}</div>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-semibold">
                    {item.maker}
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-bold text-slate-800 tabular-nums">
                  {item.quantity}
                </td>
                <td className="py-3 px-3 text-slate-500 font-medium">{item.unit}</td>
                <td className="py-3 px-3 font-semibold text-slate-700 font-mono">
                  ${item.unitPrice.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-800 font-mono text-xs tabular-nums">
                  ${(item.quantity * item.unitPrice).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cost Widget */}
      <div className="gradient-primary text-white rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md shadow-brand-500/15">
        <div className="space-y-1">
          <div className="text-[10px] text-brand-100 font-extrabold uppercase tracking-wider font-mono">
            Tổng chi phí ngân sách vật tư (Báo giá ước tính)
          </div>
          <div className="text-2xl font-black tracking-tight font-mono">
            ${totalPrice.toLocaleString()} USD
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-[10px] bg-white/20 border border-white/20 px-2.5 py-1 rounded-full font-bold">
            Đồng bộ thời gian thực sang Trang 3 (Thư viện)
          </span>
          <p className="text-[9px] text-brand-200 mt-1 font-mono">
            Tự động tính lại chi phí khi nhận yêu cầu thay đổi từ chat
          </p>
        </div>
      </div>

    </div>
  )
}
