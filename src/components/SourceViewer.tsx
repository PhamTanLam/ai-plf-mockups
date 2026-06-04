import { useEffect, useRef } from 'react'
import { FileText, Link2, ExternalLink } from 'lucide-react'

interface SourceViewerProps {
  title: string
  contentId: string
  highlightedPhrase?: string
}

export default function SourceViewer({ title, contentId, highlightedPhrase }: SourceViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Autoscroll to highlight if it changes
  useEffect(() => {
    if (highlightedPhrase && containerRef.current) {
      const el = containerRef.current.querySelector('.highlight-source')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [highlightedPhrase, contentId])

  // Custom text based on contentId
  const getDocumentContent = () => {
    switch (contentId) {
      case 'spec':
        return (
            <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed font-mono">
            <h4 className="text-sm font-semibold text-brand-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <span>#</span> 1. Tổng quan hệ thống (System Overview)
            </h4>
            <p className="text-slate-500 pl-4 border-l-2 border-slate-200">
              Hệ thống này điều khiển quy trình hàn và đo kiểm phôi tự động dùng cho dây chuyền WW2.
              Trọng tâm là điều khiển chính xác vị trí phôi thông qua hệ thống Servo Mitsubishi MR-J5.
            </p>

            <h4 className="text-sm font-semibold text-brand-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <span>#</span> 2. Cấu hình phần cứng (Hardware Specifications)
            </h4>
            <ul className="list-none pl-4 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <span>
                  <strong className="text-slate-850 font-semibold">Bộ điều khiển:</strong> PLC Mitsubishi Q03UDE CPU kết hợp module truyền thông mạng QJ71CC24N.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <span>
                  <strong className="text-slate-850 font-semibold">Hệ thống truyền động:</strong> 03 bộ Servo Drive MR-J5-40A tương ứng với các Trục X, Y, Z.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <div className={`${highlightedPhrase === 'KA1 NC' ? 'highlight-source bg-brand-500/5' : ''} flex-1`}>
                  <strong className="text-slate-850 font-semibold">Bộ rơ-le an toàn:</strong> Rơ-le Pilz PNoz X1P ký hiệu KA1 điều khiển ngắt mạch khẩn cấp.
                  Hệ thống yêu cầu các tín hiệu liên khóa (safety interlocks) phải đấu chéo NC.
                </div>
              </li>
            </ul>

            <h4 className="text-sm font-semibold text-brand-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <span>#</span> 3. Yêu cầu vận hành tự động (Automatic Operation Flow)
            </h4>
            <p className="text-slate-500 pl-4 border-l-2 border-slate-200">
              Quy trình hoạt động tuần tự bắt đầu khi nút nhấn khởi động tự động PB2 được nhấn. Trình tự bao gồm:
            </p>
            <ol className="list-none pl-4 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">1.</span>
                <span>Kẹp phôi (Grip workpiece): Kích hoạt Y40 cho đến khi giới hạn kẹp X40 báo ON.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">2.</span>
                <span>Di chuyển trục Servo đến tọa độ đo kiểm tra (Move to Inspect): Trục 1, 2, 3 di chuyển tới điểm đo.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">3.</span>
                <div className={`${highlightedPhrase === 'Laser Scan Y50' ? 'highlight-source bg-brand-500/5' : ''} flex-1`}>
                  Đo quét Laser 3D (Laser Scan): Phát xung kích hoạt Y50 cho cảm biến 3D đo quét kích thước.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">4.</span>
                <span>Phân loại chất lượng AI: AI phân tích và đưa ra quyết định OK/NG.</span>
              </li>
            </ol>
          </div>
        )
      case 'manual':
        return (
          <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed font-mono">
            <h4 className="text-sm font-semibold text-brand-700 border-b border-slate-200 pb-1">
              CẨM NANG HƯỚNG DẪN ĐẤU NỐI THIẾT BỊ MITSUBISHI MELSEC
            </h4>
            <p className="text-xs text-slate-450">Mã tài liệu: SH(NA)-081232ENG-C</p>

            <h5 className="font-bold text-slate-850 flex items-center gap-1.5">
              <span className="text-slate-400">&gt;&gt;</span> 4. Sơ đồ mạch điện tiêu chuẩn Servo MR-J5-A
            </h5>
            <p className="text-slate-500 pl-4 border-l border-slate-200">
              Để đấu nối cuộn hút hoặc relay nguồn cho Servo dòng MR-J5-A, cần tuần thủ sơ đồ mạch lực đấu nối 3 pha AC200V qua Aptomat bảo vệ (MCCB/QF).
            </p>

            <h5 className="font-bold text-slate-850 flex items-center gap-1.5">
              <span className="text-slate-400">&gt;&gt;</span> 5. Tiêu chuẩn đấu nối rơ-le an toàn (Safety Relay Wiring)
            </h5>
            <p className="text-slate-500 pl-4 border-l border-slate-200">
              Khi đấu nối rơ-le an toàn (KA1) với PLC đầu vào:
              Các tiếp điểm thường đóng (NC) của rơ-le phải được sử dụng làm vòng phản hồi giám sát liên khóa (Feedback Loop) để PLC kiểm tra trạng thái trước khi bật nguồn động lực.
            </p>

            <h5 className="font-bold text-slate-850 flex items-center gap-1.5">
              <span className="text-slate-400">&gt;&gt;</span> 6. Khắc phục nhiễu cổng truyền thông CC-Link
            </h5>
            <p className="text-slate-500 pl-4 border-l border-slate-200">
              Mạng CC-Link IE Field yêu cầu nối đất bọc cáp STP (Shielded Twisted Pair) ở cả hai đầu của module truyền thông QJ71 để triệt tiêu dòng nhiễu cao tần từ Servo.
            </p>
          </div>
        )
      default:
        return (
          <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed font-mono">
            <h4 className="text-sm font-bold text-slate-800">Tài liệu khác</h4>
            <p className="text-slate-400">Nội dung tài liệu đang được tải hoặc không có sẵn.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-panel overflow-hidden" ref={containerRef}>
      {/* Document header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-mono font-bold text-slate-850 truncate max-w-[200px] md:max-w-xs">{title}</h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1 text-slate-455 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer">
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 text-slate-455 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document content */}
      <div className="flex-1 overflow-y-auto p-5 select-text bg-slate-50/50">
        {getDocumentContent()}
      </div>
    </div>
  )
}
