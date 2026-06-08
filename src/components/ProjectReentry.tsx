import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Download, RefreshCw, FileText 
} from 'lucide-react'

interface ProjectReentryProps {
  currentUser?: 'Linh' | 'Kanai' | 'AI'
  onProgressChange?: (progress: number) => void
  onAddLog?: (action: string) => void
}

const DEFAULT_TEXT = `# NHẬT KÝ KHẢO SÁT HIỆN TRƯỜNG & THAY ĐỔI THÔNG SỐ (SPECS DISCREPANCIES)
Mã dự án: WW2 Welding Cell
Ngày khảo sát: 06/06/2026
Người phụ trách: Linh (Software SE) & Kanai (Lead Engineer)

Hồ sơ này ghi nhận toàn bộ các thay đổi kỹ thuật phát sinh tại hiện trường sau khi nhận đơn hàng (Post-Sales). Dữ liệu này sẽ được AI phân tích ngầm để cập nhật bảng vật tư tại Bước 3 và thiết kế bản vẽ CAD/code PLC tại Bước 4.

======================================================================
1. THÀNH PHẦN HỆ THỐNG ĐIỀU KHIỂN & GIAO DIỆN (PLC / HMI)
======================================================================
- Thay đổi cấu hình PLC:
  + Cấu hình cũ (Pre-Sales): Sử dụng PLC Mitsubishi Melsec FX5U (dòng Compact).
  + Cấu hình mới (Sau khảo sát): Nâng cấp lên PLC Mitsubishi Melsec Q03UDE (dòng Modulized) kèm theo các Module I/O mở rộng.
  + Lý do: Số lượng điểm I/O thực tế tăng thêm 28% do bổ sung cảm biến an toàn và cơ cấu cơ khí phụ; đồng thời yêu cầu truyền thông Ethernet tốc độ cao kết nối Robot hàn.

- Thay đổi màn hình HMI:
  + Cấu hình cũ: Màn hình GOT2000 7-inch.
  + Cấu hình mới: Nâng cấp lên GOT2000 10-inch.
  + Lý do: Cần diện tích hiển thị lớn hơn để tích hợp trang chẩn đoán lỗi chi tiết và sơ đồ động học 3D của Robot.

======================================================================
2. HỆ THỐNG TRUYỀN ĐỘNG & CƠ CẤU CHẤP HÀNH (SERVO MOTOR)
======================================================================
- Tăng số lượng trục Servo điều khiển:
  + Cấu hình cũ: 3 Trục truyền động chính (A1, A2, A3).
  + Cấu hình mới: 4 Trục truyền động (A1, A2, A3, A4).
  + Chi tiết: Bổ sung thêm 1 trục Servo Motor MR-J5-40A (400W) cho băng tải nạp phôi phụ phía sau buồng hàn.

- Thay đổi chiều dài cáp điều khiển Servo:
  + Cấu hình cũ: Chiều dài cáp đồng bộ mặc định 5m.
  + Cấu hình mới: Chiều dài cáp tăng lên thành 15m đối với các trục A2 và A3.
  + Lý do: Bố trí tủ điện chính xa hơn khu vực buồng hàn 8m để tránh bụi và nhiệt.

======================================================================
3. TIÊU CHUẨN AN TOÀN & LIÊN KHÓA (SAFETY RELAY)
======================================================================
- Nâng cấp tiêu chuẩn an toàn:
  + Cấu hình cũ: ISO 13849 PLc.
  + Cấu hình mới: ISO 13849 PLd (Mức an toàn D).
  + Lý do: Bổ sung Rơ le an toàn chuyên dụng Omron G9SE để giám sát mạch E-Stop liên khóa tiếp điểm phụ NC của khởi động từ chính KA1.
  + Chi tiết: Bổ sung 2 hàng rào ánh sáng (Safety Light Curtain) tại cửa nạp và cửa xả phôi.

======================================================================
4. DANH SÁCH VẬT TƯ PHỤ & CẢM BIẾN HIỆN TRƯỜNG
======================================================================
- Cảm biến tiệm cận giới hạn hành trình (Proximity Sensors):
  + Tăng từ 8 cái lên thành 10 cái (bổ sung 2 cảm biến cho hành trình giới hạn của trục Servo A4 mới).
  
- Cảm biến quang điện phân loại phôi (Photoelectric Sensors):
  + Tăng từ 6 cái lên thành 8 cái (bổ sung 2 cảm biến quang phát hiện màu phôi tại phễu cấp phôi phụ).
  
- Nguồn cấp DC 24V tủ điện:
  + Giữ nguyên nguồn 24VDC 10A Omron, tuy nhiên bổ sung thêm 1 bộ nguồn phụ 24VDC 5A dự phòng cho hệ thống cảm biến ngoài hiện trường.
`

export default function ProjectReentry({ onProgressChange, onAddLog }: ProjectReentryProps) {
  const { id } = useParams<{ id: string }>()
  const STORAGE_KEY = `aiplf.project_reentry_text.${id || 'default'}`
  const SYNC_KEY = `aiplf.project_reentry_synced.${id || 'default'}`

  const [text, setText] = useState('')
  const [isSynced, setIsSynced] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const storedText = localStorage.getItem(STORAGE_KEY)
    if (storedText) {
      setText(storedText)
    } else {
      setText(DEFAULT_TEXT)
      localStorage.setItem(STORAGE_KEY, DEFAULT_TEXT)
    }

    const storedSync = localStorage.getItem(SYNC_KEY)
    if (storedSync === 'true') {
      setIsSynced(true)
      if (onProgressChange) onProgressChange(100)
    } else {
      setIsSynced(false)
      if (onProgressChange) onProgressChange(100) // Khảo sát xem như đã hoàn thành đọc file
    }
  }, [id, STORAGE_KEY, SYNC_KEY])

  // 2. Listen to storage changes from chat updates in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setText(stored)
      }
      const storedSync = localStorage.getItem(SYNC_KEY)
      setIsSynced(storedSync === 'true')
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [STORAGE_KEY, SYNC_KEY])

  // File Download Trigger
  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
      
      const element = document.createElement("a")
      const file = new Blob([text], {type: 'text/plain;charset=utf-8'})
      element.href = URL.createObjectURL(file)
      element.download = "khao_sat_thay_doi_specs.txt"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      if (onAddLog) {
        onAddLog('Đã tải xuống tệp nhật ký: khao_sat_thay_doi_specs.txt')
      }
    }, 1000)
  }

  // Calculate file metrics
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0
  const lineCount = text ? text.split('\n').length : 0
  const byteSize = text ? new Blob([text]).size : 0
  const formattedSize = (byteSize / 1024).toFixed(2) + ' KB'

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-panel flex flex-col min-h-[500px]">
      
      {/* File Header Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Nhật ký Khảo sát & Thay đổi Specs
              </h4>
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                khao_sat_thay_doi_specs.txt
              </span>
              {isSynced ? (
                <span className="text-[8px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Synced
                </span>
              ) : (
                <span className="text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Pending
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-450 mt-0.5">
              Pha 7: Bản ghi nhận toàn bộ thay đổi kỹ thuật thực tế sau đơn hàng
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 border border-slate-250 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Tải tệp nhật ký text về máy"
          >
            {isDownloading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isDownloading ? 'Đang tải...' : 'Tải File Text'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area (Read-Only) */}
      <div className="flex-1 p-5 overflow-y-auto max-h-[500px] bg-slate-50/25 select-text">
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 font-sans text-xs text-slate-755 leading-relaxed whitespace-pre-line">
          {text}
        </div>
      </div>

      {/* Bottom Editor Status Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
        <div className="flex gap-4">
          <span>Kích thước: <strong>{formattedSize}</strong></span>
          <span>Dòng: <strong>{lineCount}</strong></span>
          <span>Từ: <strong>{wordCount}</strong></span>
        </div>
        <div className="flex items-center gap-1 text-slate-450">
          <span>Định dạng: <strong>Plain Text / MD</strong></span>
          <span className="mx-1">•</span>
          <span>Mã hóa: <strong>UTF-8</strong></span>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 leading-relaxed font-sans">
        <strong>💡 Hướng dẫn chỉnh sửa:</strong> Để chỉnh sửa hoặc cập nhật Nhật ký khảo sát hiện trường, vui lòng trò chuyện và gửi yêu cầu cho AI ở khung chat bên phải (Ví dụ: <em>"Cập nhật nhật ký khảo sát: thay đổi PLC sang dòng Q03UDE và nâng cấp màn hình lên GOT2000 10-inch"</em>). AI sẽ tự động xử lý và cập nhật nội dung tệp tin phía bên trái.
      </div>

    </div>
  )
}
