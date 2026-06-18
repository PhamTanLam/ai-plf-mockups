import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, ShieldCheck, Sparkles, Star, Zap, AlertTriangle, X } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

export default function Membership() {
  const navigate = useNavigate()
  const { locale } = useI18n()
  const L = (vi: string, ja: string, en: string) => locale === 'ja' ? ja : locale === 'en' ? en : vi

  const [membership, setMembership] = useState<'free' | 'premium'>(() => {
    return (localStorage.getItem('aiplf.membership') as 'free' | 'premium') || 'free'
  })
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleUpgradeClick = () => {
    setShowCheckoutModal(true)
  }

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate processing payment
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
      
      // Update local storage
      localStorage.setItem('aiplf.membership', 'premium')
      setMembership('premium')
      window.dispatchEvent(new Event('storage')) // Notify other pages
      
      // Close modal after success animation
      setTimeout(() => {
        setShowCheckoutModal(false)
        setPaymentSuccess(false)
        setCardNumber('')
        setCardExpiry('')
        setCardCvc('')
        setCardName('')
      }, 2000)
    }, 2000)
  }

  const handleDowngrade = () => {
    if (window.confirm(L('Bạn có chắc chắn muốn hạ cấp xuống tài khoản Free?', '無料プランへダウングレードしますか？', 'Are you sure you want to downgrade to Free?'))) {
      localStorage.setItem('aiplf.membership', 'free')
      setMembership('free')
      window.dispatchEvent(new Event('storage'))
      alert(L('Đã hạ cấp xuống gói Free.', '無料プランにダウングレードしました。', 'Downgraded to Free.'))
    }
  }

  // Active theme sync
  useEffect(() => {
    const applyConfig = () => {
      const themeColor = localStorage.getItem('aiplf.settings.themeColor') || 'teal';
      const root = document.documentElement;
      const themes: Record<string, Record<string, string>> = {
        teal: { '500': '#0abab5' },
        blue: { '500': '#3b82f6' },
        indigo: { '500': '#6366f1' },
        emerald: { '500': '#10b981' },
        orange: { '500': '#f97316' }
      };
      const colorSet = themes[themeColor] || themes.teal;
      Object.entries(colorSet).forEach(([shade, hex]) => {
        root.style.setProperty(`--color-brand-${shade}`, hex);
      });
    }
    applyConfig()
  }, [])

  return (
    <div className="h-screen bg-slate-50 flex flex-col text-slate-800 page-enter-fade select-none overflow-y-auto relative">
      {/* Decorative Blur Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse-slow" style={{ animationDelay: '3s' }} />
      
      {/* Premium Header */}
      <header className="shrink-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 hover:bg-brand-500/5 rounded-xl border border-slate-250 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{L('Quay lại', '戻る', 'Back')}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 font-mono">Trạng thái:</span>
          {membership === 'premium' ? (
            <span className="text-[10px] font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full shadow-sm shadow-amber-500/10 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-white" />
              PREMIUM MEMBER
            </span>
          ) : (
            <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50/60 border border-brand-200/80 px-3 py-1 rounded-full flex items-center gap-1 shadow-3xs shadow-brand-500/5">
              <Zap className="w-3.5 h-3.5 text-brand-500 fill-brand-500/20" />
              FREE MEMBER
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col items-center justify-start gap-8">
        <div className="text-center space-y-3 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 via-brand-500 to-indigo-600 bg-clip-text text-transparent">
            {L('Nâng Tầm Tự Động Hóa Với AI-PLF', 'AI-PLF で自動化を次のステージへ', 'Scale Automation with AI-PLF')}
          </h2>
          <p className="text-xs md:text-sm text-slate-555 leading-relaxed">
            {L(
              'Chọn gói thành viên phù hợp để mở khóa toàn bộ sức mạnh thiết kế CAD, gỡ lỗi mã PLC ST tự động và lập biên bản nghiệm thu thông minh.',
              '要件に合わせたプランを選び、CAD自動設計、PLCデバッグ、検収資料自動作成機能を使用できます。',
              'Choose the perfect plan to unlock CAD design, automated PLC debugging, and smart acceptance report compilation.'
            )}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl items-stretch">
          
          {/* FREE PLAN */}
          <div className="bg-white/70 backdrop-blur-lg border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-panel hover:shadow-[0_20px_40px_rgba(10,186,181,0.06)] hover:border-brand-500/30 transition-all duration-300 relative group">
            {/* Background overflow-hidden wrapper for decoration */}
            <div className="absolute inset-0 rounded-[22px] overflow-hidden pointer-events-none -z-10">
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-brand-500/5 to-emerald-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
            </div>

            {membership === 'free' && (
              <span className="absolute -top-3 left-6 text-[9px] font-extrabold bg-gradient-to-r from-brand-500 to-emerald-500 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-md shadow-brand-500/10">
                {L('Gói hiện tại', '現在のプラン', 'Current Plan')}
              </span>
            )}
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-extrabold text-brand-600 uppercase tracking-widest font-mono">Free Plan</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black bg-gradient-to-br from-brand-600 to-teal-500 bg-clip-text text-transparent">0đ</span>
                  <span className="text-xs text-slate-400">/ {L('vĩnh viễn', '永久', 'forever')}</span>
                </div>
                <p className="text-[11px] text-slate-450 mt-2 font-medium">
                  {L('Dành cho nhu cầu trải nghiệm specs và debug thủ công.', '仕様書分析や手 động デバッグを体験したい方向け。', 'For specs analysis and manual debugging testing.')}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  {L('Tính năng bao gồm:', '含まれる機能:', 'Features included:')}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-655 font-medium">
                  <li className="flex items-start gap-2 transition-transform duration-200 group-hover:translate-x-1">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{L('Quy trình Pre-sales (Bước 1-6) trích specs và lập dự toán khái quát.', 'プリセールス（ステップ1-6）の仕様書分析と概算見積もり', 'Pre-sales (Steps 1-6) specs extraction & basic estimate')}</span>
                  </li>
                  <li className="flex items-start gap-2 transition-transform duration-200 group-hover:translate-x-1">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{L('Nhật ký khảo sát hiện trường & đối chiếu delta (Bước 7).', '現地調査と仕様変更ログ（ステップ7）', 'Field survey delta log (Step 7)')}</span>
                  </li>
                  <li className="flex items-start gap-2 transition-transform duration-200 group-hover:translate-x-1">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{L('Biên bản Kick-off & Bảng vật tư thiết bị (Bước 8-9).', 'キックオフ議事録と資材表（ステップ8-9）', 'Kick-off minutes and Materials table (Steps 8-9)')}</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-emerald-505/5 border border-emerald-500/10 p-3 rounded-2xl transition-all duration-200 group-hover:bg-brand-500/10 group-hover:border-brand-500/20">
                    <Zap className="w-4 h-4 text-brand-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="font-bold text-brand-700">{L('Đặc quyền Free: Trình Debug & Soạn thảo Code (Bước 12)', '無料特典: デバッグとコード編集（ステップ12）', 'Free Benefit: Debug & Code Editor (Step 12)')}</span>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        {L('Tự do chỉnh sửa, gỡ lỗi và kiểm tra cú pháp mã PLC ST.', 'PLC Structured Text（ST）の編集と構文チェックが可能。', 'Edit, compile check, and debug PLC ST code.')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-slate-450 line-through decoration-slate-355 opacity-60">
                    <span className="text-red-500 shrink-0 font-bold mt-0.5 text-sm">×</span>
                    <span>{L('Tự động tạo bản vẽ CAD & mã nguồn PLC (.dwg / .l5k) ở Bước 10.', 'ステップ10のCAD図面・PLCコード自動生成', 'Auto CAD & PLC code generation at Step 10')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-450 line-through decoration-slate-355 opacity-60">
                    <span className="text-red-500 shrink-0 font-bold mt-0.5 text-sm">×</span>
                    <span>{L('Tự động tạo tài liệu Nghiệm thu & HDSD HMI ở Bước 11.', 'ステップ11の検収書・GOT2000取扱説明書自動生成', 'Auto Acceptance & GOT2000 manual generation at Step 11')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4">
              {membership === 'free' ? (
                <div className="w-full text-center py-2.5 bg-brand-500/10 text-brand-700 border border-brand-500/20 rounded-xl text-xs font-extrabold font-mono flex items-center justify-center gap-1.5 shadow-3xs shadow-brand-500/5">
                  <Zap className="w-3.5 h-3.5 text-brand-500 fill-brand-500/20 animate-pulse" />
                  {L('Đang sử dụng', '使用中', 'Current Package')}
                </div>
              ) : (
                <button
                  onClick={handleDowngrade}
                  className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1"
                >
                  {L('Hạ cấp gói', '無料プランへ戻す', 'Downgrade to Free')}
                </button>
              )}
            </div>
          </div>

          {/* PREMIUM PLAN */}
          <div className="bg-gradient-to-b from-white/95 to-brand-500/5 backdrop-blur-lg border-2 border-brand-500/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-pop hover:shadow-[0_20px_50px_rgba(10,186,181,0.18)] hover:border-brand-500 hover:scale-[1.01] transition-all duration-300 relative group">
            {/* Background overflow-hidden wrapper for decoration */}
            <div className="absolute inset-0 rounded-[22px] overflow-hidden pointer-events-none -z-10">
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-brand-500/10 to-indigo-500/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
            </div>
            
            {membership === 'premium' ? (
              <span className="absolute -top-3 left-6 text-[9px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                {L('Gói hiện tại', '現在のプラン', 'Current Plan')}
              </span>
            ) : (
              <span className="absolute -top-3 right-6 text-[8px] font-extrabold bg-gradient-to-r from-brand-500 to-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md shadow-brand-500/10 animate-pulse">
                <Sparkles className="w-3 h-3 fill-white" />
                RECOMMENDED
              </span>
            )}
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-extrabold text-brand-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-brand-500 fill-brand-500 animate-spin-slow" />
                  <span>Enterprise Premium</span>
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-slate-850 bg-gradient-to-br from-brand-700 via-brand-500 to-indigo-600 bg-clip-text text-transparent">1.200.000đ</span>
                  <span className="text-xs text-slate-400">/ {L('tháng', '月', 'month')}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  {L('Mở khóa 100% tính năng chuyên sâu và tự động hóa toàn quy trình.', 'AIの力で図面・コード・資料生成を完全自動化したい方向け。', 'Unlock 100% features and fully automate your engineering workflow.')}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  {L('Bao gồm mọi tính năng của gói Free và:', '無料版の全機能に加え:', 'Everything in Free plus:')}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-650 font-medium">
                  <li className="flex items-start gap-2.5 bg-brand-500/5 border border-brand-200/20 p-3 rounded-2xl transition-all duration-200 group-hover:bg-brand-500/10 group-hover:border-brand-500/30">
                    <Check className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-800 text-xs">{L('Mở khóa Bước 10: Thiết kế & Code tự động', 'ステップ10: CAD図面 & Code自動生成の開放', 'Unlock Step 10: Auto CAD & Code')}</span>
                      <p className="text-[10px] text-slate-555 leading-relaxed mt-0.5">
                        {L('AI tự động tạo bản vẽ đấu nối thiết bị (.dwg) và xuất mã nguồn PLC Rockwell (.l5k) tương thích.', '三菱・Rockwell向けPLCコードとCAD図面をAIが自動生成。', 'AI automatically generates CAD drawings and Rockwell .l5k files.')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 bg-brand-500/5 border border-brand-200/20 p-3 rounded-2xl transition-all duration-200 group-hover:bg-brand-500/10 group-hover:border-brand-500/30">
                    <Check className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-800 text-xs">{L('Mở khóa Bước 11: Nghiệm thu & HDSD', 'ステップ11: 検収書 & GOT2000取扱説明書作成', 'Unlock Step 11: Acceptance & HMI Manual')}</span>
                      <p className="text-[10px] text-slate-555 leading-relaxed mt-0.5">
                        {L('AI tự động tạo hướng dẫn vận hành GOT2000 HMI dạng PDF và lập biên bản nghiệm thu dạng Word (.docx) để in ký.', '検収検査報告書とGOT2000画面説明マニュアルを即時出力。', 'AI immediately outputs custom HMI user manuals and word docs.')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 transition-transform duration-200 group-hover:translate-x-1">
                    <Check className="w-4 h-4 text-brand-500 shrink-0 mt-0.5 animate-pulse" />
                    <span>{L('Đồng bộ tải tệp thật (.st, .docx, .pdf) trực tiếp từ Thư viện.', 'ライブラリから実ファイル（ST/Word/PDF）を直接DL', 'Download actual files (.st, .docx, .pdf) from Library')}</span>
                  </li>
                  <li className="flex items-start gap-2 transition-transform duration-200 group-hover:translate-x-1">
                    <Check className="w-4 h-4 text-brand-500 shrink-0 mt-0.5 animate-pulse" />
                    <span>{L('Tốc độ xử lý AI Copilot ưu tiên băng thông cao nhất.', 'AIチャット優先帯域による高速レスポンス', 'Priority AI processing for lightning response')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4">
              {membership === 'premium' ? (
                <div className="w-full text-center py-2.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold font-mono">
                  {L('Đang hoạt động', 'アクティブ', 'Active')}
                </div>
              ) : (
                <button
                  onClick={handleUpgradeClick}
                  className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 text-white rounded-xl text-xs font-extrabold transition-all duration-200 shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{L('Nâng cấp lên Premium', 'プレミアムプランに登録', 'Upgrade to Premium')}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Checkout Payment Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-[400px] space-y-5 shadow-pop animate-in zoom-in-95 duration-200 text-slate-800 flex flex-col relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-500" />
                <span>{L('Thanh toán nâng cấp', '決済画面', 'Checkout Upgrade')}</span>
              </h4>
              <button
                onClick={() => { if (!isProcessing) setShowCheckoutModal(false) }}
                className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
                disabled={isProcessing}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            {paymentSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 animate-pulse">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">{L('Thanh toán thành công!', '決済に成功しました！', 'Payment Successful!')}</h5>
                  <p className="text-[10px] text-slate-455 leading-relaxed mt-1">
                    {L('Tài khoản của bạn đã được nâng cấp lên gói Enterprise Premium.', 'アカウントがプレミアムプランにアップグレードされました。', 'Your account has been upgraded to Enterprise Premium.')}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                {/* Total amount notice */}
                <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500">{L('Tổng chi phí nâng cấp:', 'お支払い合計:', 'Total Amount:')}</span>
                  <span className="font-extrabold text-slate-850 text-xs font-mono">1.200.000đ</span>
                </div>

                <div className="space-y-3 text-[10px] font-mono text-slate-505 font-bold uppercase">
                  {/* Card name */}
                  <div className="space-y-1">
                    <label>{L('Tên chủ thẻ', 'カード名義', 'Card Holder Name')}</label>
                    <input
                      required
                      type="text"
                      placeholder="NGUYEN VAN A"
                      value={cardName}
                      onChange={e => setCardName(e.target.value.toUpperCase())}
                      disabled={isProcessing}
                      className="w-full p-2.5 text-xs font-sans border border-slate-250 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-800"
                    />
                  </div>

                  {/* Card number */}
                  <div className="space-y-1">
                    <label>{L('Số thẻ tín dụng', 'カード番号', 'Card Number')}</label>
                    <input
                      required
                      type="text"
                      maxLength={19}
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={e => {
                        // Formatting input into digits with spaces
                        const digits = e.target.value.replace(/\D/g, '')
                        const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits
                        setCardNumber(formatted)
                      }}
                      disabled={isProcessing}
                      className="w-full p-2.5 text-xs font-sans border border-slate-250 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-800"
                    />
                  </div>

                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label>{L('Hạn thẻ (MM/YY)', '有効期限', 'Expiry Date')}</label>
                      <input
                        required
                        type="text"
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '')
                          const formatted = digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2,4)}` : digits
                          setCardExpiry(formatted)
                        }}
                        disabled={isProcessing}
                        className="w-full p-2.5 text-xs font-sans border border-slate-250 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label>CVC / CVV</label>
                      <input
                        required
                        type="password"
                        maxLength={3}
                        placeholder="***"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        disabled={isProcessing}
                        className="w-full p-2.5 text-xs font-sans border border-slate-250 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 leading-normal flex items-start gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{L('Đây là bản demo thanh toán mô phỏng. Không có thẻ tín dụng thực tế nào bị trừ tiền.', 'こちらはデモ画面です。実際のカード決済は発生しません。', 'This is a simulation checkout. No actual money will be charged.')}</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-500/10"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin text-white" />
                      <span>{L('Đang xử lý...', '処理中...', 'Processing...')}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{L('Xác nhận & Nâng cấp', '支払う & アップグレード', 'Confirm & Upgrade')}</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
