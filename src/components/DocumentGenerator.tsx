import { useState, useEffect } from 'react'
import { FileText, FileSpreadsheet, Sparkles, Printer, Download, CheckCircle } from 'lucide-react'

interface DocumentGeneratorProps {
  onProgressChange?: (progress: number) => void
}

export default function DocumentGenerator({ onProgressChange }: DocumentGeneratorProps) {
  const [docType, setDocType] = useState<'manual' | 'protocol'>('manual')
  const [tpScreenInfo, setTpScreenInfo] = useState('Màn hình chính HMI hiển thị: Nút nhấn Chạy tự động (Auto), Dừng khẩn cấp (EMS), Điều chỉnh thông số tốc độ Servo (0 - 3000 rpm), và đồ thị giám sát lực kẹp xi-lanh.')
  const [testResult, setTestResult] = useState('Đã kiểm tra 50 phôi. Kết quả: 48 phôi OK chuyển qua băng tải thành phẩm, 02 phôi NG kích hoạt xi lanh đẩy lỗi và còi báo động. Thời gian đo quét 3D trung bình 1.2 giây/phôi. Đạt chuẩn chất lượng.')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDoc, setGeneratedDoc] = useState<string>('')

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(generatedDoc ? 100 : 20)
    }
  }, [generatedDoc, onProgressChange])

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      if (docType === 'manual') {
        setGeneratedDoc(
          `# HƯỚNG DẪN SỬ DỤNG MÀN HÌNH HMI - HỆ THỐNG WW2 WELDING CELL
Ký hiệu thiết bị: HMI-GOT2000-10
Ngày biên soạn: 04/06/2026

## 1. GIAO DIỆN MÀN HÌNH CHÍNH (MAIN SCREEN)
Màn hình chính cho phép giám sát trực quan trạng thái hoạt động thực tế của toàn bộ dây chuyền:
*   **Trạng thái hệ thống:** Hiển thị Đèn báo AUTO (Xanh lá - hệ thống chạy tự động) và Đèn MANUAL (Vàng - hệ thống chạy bằng tay).
*   **Giám sát lực kẹp:** Cung cấp thông số đo lực từ cảm biến kẹp phôi dạng đồ thị thời gian thực.
*   **Điều khiển Servo:** Cài đặt tốc độ hoạt động cho 04 trục Servo từ 0 - 3000 vòng/phút.

## 2. QUY TRÌNH VẬN HÀNH TỰ ĐỘNG (AUTOMATIC SEQUENCE)
1.  Bật nguồn điện động lực tủ điện điều khiển chính.
2.  Xác nhận đèn báo **EMERGENCY STOP** ở trạng thái không nhấp nháy.
3.  Nhấn nút **Auto Start (PB2)** trên màn hình HMI để kích hoạt trình tự gắp phôi và quét laser.
4.  Để dừng quy trình tự động, nhấn nút **Auto Stop** hoặc nút cơ khẩn cấp (EMS).

## 3. THÔNG TIN MÀN HÌNH ĐÃ GHI NHẬN
> *Mô tả nguồn:* ${tpScreenInfo}`
        )
      } else {
        setGeneratedDoc(
          `# BIÊN BẢN NGHIỆM THU VÀ KIỂM TRA CHẤT LƯỢNG SẢN PHẨM (WW2)
Mã biên bản: BB-TEST-WW2-2026
Đơn vị nghiệm thu: Bộ phận Quản lý chất lượng & Kỹ thuật

## 1. KẾT QUẢ KIỂM TRA ĐO QUÉT 3D VÀ PHÂN LOẠI
Dựa trên báo cáo kiểm thử thực tế trên 50 sản phẩm mẫu được đưa vào robot hàn:
*   **Số lượng phôi đã quét:** 50 phôi mẫu.
*   **Kết quả phân loại thành công (OK):** 48 sản phẩm được vận chuyển ra băng tải chính.
*   **Kết quả phôi lỗi (NG):** 02 sản phẩm bị từ chối và đẩy vào khay phế phẩm tự động.
*   **Hiệu năng đo kiểm:** Tốc độ đo quét cảm biến 3D đạt 1.2 giây/sản phẩm (Đạt yêu cầu specs đề ra < 1.5 giây).

## 2. XÁC NHẬN AN TOÀN LIÊN KHÓA
*   **Kiểm tra nút nhấn Khẩn cấp (EMS):** [ĐẠT] Van an toàn KA1 ngắt nguồn động lực ngay lập tức.
*   **Vòng phản khóa liên kết đầu vào X20:** [ĐẠT] Đã kiểm chứng tiếp điểm phụ NC của KA1 liên kết đúng quy định an toàn ISO 13849.

## 3. THÔNG TIN THỰC NGHIỆM GHI NHẬN
> *Mô tả nguồn:* ${testResult}`
        )
      }
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 text-slate-700 shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-850 uppercase tracking-wider">Tạo tài liệu nghiệm thu & HDSD</h4>
          <p className="text-[10px] text-slate-450">Tự động kết xuất tài liệu vận hành và kiểm tra (STT 13)</p>
        </div>
      </div>

      {/* Select document type */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setDocType('manual')
            setGeneratedDoc('')
          }}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition ${
            docType === 'manual'
              ? 'bg-brand-500/10 border-brand-500 text-brand-700 font-bold font-mono shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-xs">Hướng dẫn sử dụng (HMI)</span>
        </button>

        <button
          onClick={() => {
            setDocType('protocol')
            setGeneratedDoc('')
          }}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition ${
            docType === 'protocol'
              ? 'bg-brand-500/10 border-brand-500 text-brand-700 font-bold font-mono shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-xs">Biên bản nghiệm thu</span>
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        {docType === 'manual' ? (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Thông tin màn hình TP / HMI</label>
            <textarea
              rows={2}
              value={tpScreenInfo}
              onChange={(e) => setTpScreenInfo(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-250 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-800"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Kết quả kiểm tra nghiệm thu</label>
            <textarea
              rows={2}
              value={testResult}
              onChange={(e) => setTestResult(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-250 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-800"
            />
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Đang tạo tài liệu bằng AI...' : 'Tự động tạo tài liệu'}</span>
        </button>
      </div>

      {/* Generated output document */}
      {generatedDoc && (
        <div className="p-3 bg-slate-50 text-slate-800 rounded-xl space-y-3 font-mono text-[11px] select-text max-h-[220px] overflow-y-auto border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-250 pb-2 text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              AI Output Generated
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="hover:text-slate-800 transition p-1 hover:bg-slate-200 rounded cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button className="hover:text-slate-800 transition p-1 hover:bg-slate-200 rounded cursor-pointer">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{generatedDoc}</div>
        </div>
      )}
    </div>
  )
}
