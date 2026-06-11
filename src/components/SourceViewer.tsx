import { useEffect, useRef } from 'react'
import { FileText, Link2, ExternalLink } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

interface SourceViewerProps {
  title: string
  contentId: string
  highlightedPhrase?: string
}

export default function SourceViewer({ title, contentId, highlightedPhrase }: SourceViewerProps) {
  const { locale } = useI18n()
  const L = (vi: string, ja: string, en: string) => locale === 'ja' ? ja : locale === 'en' ? en : vi
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
              <span>#</span> {L('1. Tổng quan hệ thống (System Overview)', '1. システム概要 (System Overview)', '1. System Overview')}
            </h4>
            <p className="text-slate-500 pl-4 border-l-2 border-slate-200">
              {L(
                'Hệ thống này điều khiển quy trình hàn và đo kiểm phôi tự động dùng cho dây chuyền WW2. Trọng tâm là điều khiển chính xác vị trí phôi thông qua hệ thống Servo Mitsubishi MR-J5.',
                'このシステムはWW2ラインで使用されるワークの溶接・自動計測工程を制御します。Servo Mitsubishi MR-J5を通じてワーク位置を精密に制御することが主要な目的です。',
                'This system controls the welding and automatic workpiece inspection process for the WW2 line. The primary focus is precise workpiece positioning via the Servo Mitsubishi MR-J5 system.'
              )}
            </p>

            <h4 className="text-sm font-semibold text-brand-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <span>#</span> {L('2. Cấu hình phần cứng (Hardware Specifications)', '2. ハードウェア構成 (Hardware Specifications)', '2. Hardware Specifications')}
            </h4>
            <ul className="list-none pl-4 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <span>
                  <strong className="text-slate-850 font-semibold">{L('Bộ điều khiển:', 'コントローラー:', 'Controller:')}</strong> {L('PLC Mitsubishi Q03UDE CPU kết hợp module truyền thông mạng QJ71CC24N.', 'PLC Mitsubishi Q03UDE CPUと通信モジュールQJ71CC24Nの組み合わせ。', 'PLC Mitsubishi Q03UDE CPU combined with network communication module QJ71CC24N.')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <span>
                  <strong className="text-slate-850 font-semibold">{L('Hệ thống truyền động:', 'ドライブシステム:', 'Drive System:')}</strong> {L('03 bộ Servo Drive MR-J5-40A tương ứng với các Trục X, Y, Z.', 'Servo Drive MR-J5-40A × 3台（X軸・Y軸・Z軸に対応）。', '3 × Servo Drive MR-J5-40A for Axes X, Y, and Z respectively.')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <div className={`${highlightedPhrase === 'KA1 NC' ? 'highlight-source bg-brand-500/5' : ''} flex-1`}>
                  <strong className="text-slate-850 font-semibold">{L('Bộ rơ-le an toàn:', '安全リレーユニット:', 'Safety Relay Unit:')}</strong> {L(
                    'Rơ-le Pilz PNoz X1P ký hiệu KA1 điều khiển ngắt mạch khẩn cấp. Hệ thống yêu cầu các tín hiệu liên khóa (safety interlocks) phải đấu chéo NC.',
                    'Pilz PNoz X1P安全リレー（記号KA1）が緊急遮断回路を制御します。システムはセーフティインターロック信号をNC接点でクロス接続することを要求します。',
                    'Pilz PNoz X1P safety relay designated KA1 controls the emergency cut-off circuit. The system requires safety interlock signals to be cross-wired NC.'
                  )}
                </div>
              </li>
            </ul>

            <h4 className="text-sm font-semibold text-brand-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <span>#</span> {L('3. Yêu cầu vận hành tự động (Automatic Operation Flow)', '3. 自動運転要件 (Automatic Operation Flow)', '3. Automatic Operation Flow')}
            </h4>
            <p className="text-slate-500 pl-4 border-l-2 border-slate-200">
              {L(
                'Quy trình hoạt động tuần tự bắt đầu khi nút nhấn khởi động tự động PB2 được nhấn. Trình tự bao gồm:',
                '自動起動押しボタンPB2を押すことでシーケンス動作が開始されます。手順は以下の通りです：',
                'The sequential operation starts when the automatic start pushbutton PB2 is pressed. The sequence includes:'
              )}
            </p>
            <ol className="list-none pl-4 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">1.</span>
                <span>{L('Kẹp phôi (Grip workpiece): Kích hoạt Y40 cho đến khi giới hạn kẹp X40 báo ON.', 'ワーククランプ (Grip workpiece): X40クランプ限界がONになるまでY40を有効化。', 'Grip workpiece: Activate Y40 until clamp limit X40 turns ON.')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">2.</span>
                <span>{L('Di chuyển trục Servo đến tọa độ đo kiểm tra (Move to Inspect): Trục 1, 2, 3 di chuyển tới điểm đo.', '検査座標へのサーボ軸移動 (Move to Inspect): 軸1・2・3が測定ポイントへ移動。', 'Move Servo axes to inspection coordinates (Move to Inspect): Axes 1, 2, 3 move to the measurement point.')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">3.</span>
                <div className={`${highlightedPhrase === 'Laser Scan Y50' ? 'highlight-source bg-brand-500/5' : ''} flex-1`}>
                  {L(
                    'Đo quét Laser 3D (Laser Scan): Phát xung kích hoạt Y50 cho cảm biến 3D đo quét kích thước.',
                    '3Dレーザースキャン (Laser Scan): 3D寸法スキャンセンサーへのトリガーパルスY50を出力。',
                    '3D Laser Scan: Output trigger pulse Y50 to the 3D dimension scanning sensor.'
                  )}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">4.</span>
                <span>{L('Phân loại chất lượng AI: AI phân tích và đưa ra quyết định OK/NG.', 'AI品質判定: AIが分析しOK/NGの判断を出力。', 'AI Quality Classification: AI analyses and outputs an OK/NG decision.')}</span>
              </li>
            </ol>
          </div>
        )
      case 'manual':
        return (
          <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed font-mono">
            <h4 className="text-sm font-semibold text-brand-700 border-b border-slate-200 pb-1">
              {L(
                'CẨM NANG HƯỚNG DẪN ĐẤU NỐI THIẾT BỊ MITSUBISHI MELSEC',
                'MITSUBISHI MELSEC 機器配線ガイドブック',
                'MITSUBISHI MELSEC DEVICE WIRING GUIDE'
              )}
            </h4>
            <p className="text-xs text-slate-450">{L('Mã tài liệu:', '文書コード:', 'Document code:')} SH(NA)-081232ENG-C</p>

            <h5 className="font-bold text-slate-850 flex items-center gap-1.5">
              <span className="text-slate-400">&gt;&gt;</span> {L('4. Sơ đồ mạch điện tiêu chuẩn Servo MR-J5-A', '4. Servo MR-J5-A 標準電気回路図', '4. Standard Electrical Circuit Diagram for Servo MR-J5-A')}
            </h5>
            <p className="text-slate-500 pl-4 border-l border-slate-200">
              {L(
                'Để đấu nối cuộn hút hoặc relay nguồn cho Servo dòng MR-J5-A, cần tuần thủ sơ đồ mạch lực đấu nối 3 pha AC200V qua Aptomat bảo vệ (MCCB/QF).',
                'MR-J5-Aシリーズサーボの主回路コイルまたは電源リレーを配線する場合は、保護用遮断器(MCCB/QF)を介して三相AC200Vを接続する主回路図に従う必要があります。',
                'To wire the main circuit coil or power relay for MR-J5-A series Servo drives, the main circuit diagram for three-phase AC200V connection via protective circuit breaker (MCCB/QF) must be followed.'
              )}
            </p>

            <h5 className="font-bold text-slate-850 flex items-center gap-1.5">
              <span className="text-slate-400">&gt;&gt;</span> {L('5. Tiêu chuẩn đấu nối rơ-le an toàn (Safety Relay Wiring)', '5. 安全リレー配線基準 (Safety Relay Wiring)', '5. Safety Relay Wiring Standard')}
            </h5>
            <p className="text-slate-500 pl-4 border-l border-slate-200">
              {L(
                'Khi đấu nối rơ-le an toàn (KA1) với PLC đầu vào: Các tiếp điểm thường đóng (NC) của rơ-le phải được sử dụng làm vòng phản hồi giám sát liên khóa (Feedback Loop) để PLC kiểm tra trạng thái trước khi bật nguồn động lực.',
                '安全リレー(KA1)をPLC入力に接続する場合：リレーのNC（常時閉）接点をインターロック監視用フィードバックループとして使用し、PLCが主電源を投入する前に状態を確認できるようにする必要があります。',
                'When wiring the safety relay (KA1) to the PLC input: the NC (normally closed) contacts of the relay must be used as the interlock monitoring feedback loop so the PLC can verify status before energising the main power.'
              )}
            </p>

            <h5 className="font-bold text-slate-850 flex items-center gap-1.5">
              <span className="text-slate-400">&gt;&gt;</span> {L('6. Khắc phục nhiễu cổng truyền thông CC-Link', '6. CC-Link通信ポートのノイズ対策', '6. CC-Link Communication Port Noise Countermeasures')}
            </h5>
            <p className="text-slate-500 pl-4 border-l border-slate-200">
              {L(
                'Mạng CC-Link IE Field yêu cầu nối đất bọc cáp STP (Shielded Twisted Pair) ở cả hai đầu của module truyền thông QJ71 để triệt tiêu dòng nhiễu cao tần từ Servo.',
                'CC-Link IE Fieldネットワークでは、Servoからの高周波ノイズ電流を抑制するため、QJ71通信モジュールの両端でSTP（シールド付きツイストペア）ケーブルのシールドをアース接続する必要があります。',
                'The CC-Link IE Field network requires STP (Shielded Twisted Pair) cable shield grounding at both ends of the QJ71 communication module to suppress high-frequency noise currents from the Servo.'
              )}
            </p>
          </div>
        )
      default:
        return (
          <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed font-mono">
            <h4 className="text-sm font-bold text-slate-800">{L('Tài liệu khác', 'その他のドキュメント', 'Other Documents')}</h4>
            <p className="text-slate-400">{L('Nội dung tài liệu đang được tải hoặc không có sẵn.', 'ドキュメントの内容を読み込み中か、利用できません。', 'Document content is loading or unavailable.')}</p>
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
