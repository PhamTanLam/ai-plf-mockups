import { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Check, 
  Copy, 
  RefreshCw, 
  AlertTriangle, 
  Cpu, 
  Wand2, 
  CheckCircle2, 
  History, 
  Terminal, 
  AlertCircle,
  ChevronDown
} from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'
import { localizeCodeComments } from '@/i18n/chat'

interface DebugCodeStepProps {
  projectId: string
  onProgressChange?: (progress: number) => void
  onAddLog?: (action: string, phaseNum: number) => void
  isZenMode?: boolean
  toggleZenMode?: () => void
  onParaphrase?: (type: 'compact' | 'clean_case' | 'default') => void
  paraphraseCommand?: { type: 'compact' | 'clean_case' | 'default'; trigger: number } | null
}

const translateRevDesc = (desc: string, t: (key: string) => string): string => {
  if (!desc) return ''
  const descLower = desc.toLowerCase()
  if (descLower.includes('ai sinh mã gốc') || descLower.includes('rev-1') || descLower.includes('original') || descLower.includes('initial')) {
    return t('post.debug.revInitial')
  }
  if (descLower.includes('tự sửa lỗi cú pháp') || descLower.includes('quick-fix') || descLower.includes('quick fix') || descLower.includes('quickfix')) {
    return t('post.debug.revQuickFix')
  }
  if (descLower.includes('tối ưu hóa gọn mã nguồn') || descLower.includes('compact') || descLower.includes('state machine') || descLower.includes('case')) {
    return t('post.debug.revCompact')
  }
  if (descLower.includes('thêm cấu trúc ghi chú') || descLower.includes('clean_case') || descLower.includes('iec')) {
    return t('post.debug.revCleanCase')
  }
  if (descLower.includes('khôi phục') || descLower.includes('restore') || descLower.includes('mã cấu hình gốc')) {
    return t('post.debug.revRestore')
  }
  
  if (desc.startsWith('AI Paraphrase: ')) {
    const actionPart = desc.substring('AI Paraphrase: '.length)
    return `AI Paraphrase: ${translateRevDesc(actionPart, t)}`
  }
  return desc
}

export const DEFAULT_ST_CODE = `PROGRAM WW2_Welding_Cell
VAR
  SAFETY_RELAY_KA1_OK : BOOL := TRUE;
  EMERGENCY_STOP : BOOL := FALSE;
  AUTO_MODE : BOOL := FALSE;
  START_PB : BOOL := FALSE;
  STEP_NUMBER : INT := 0;
  
  // Thiết bị chấp hành & phản hồi
  GRIP_CYLINDER_OUT : BOOL := FALSE;
  GRIP_LIMIT_SWITCH : BOOL := FALSE;
  SERVO_TARGET_X : REAL := 0.0;
  SERVO_TARGET_Y : REAL := 0.0;
  SERVO_TARGET_Z : REAL := 0.0;
  SERVO_START : BOOL := FALSE;
  SERVO_IN_POSITION : BOOL := FALSE;
  
  // Đo quét & AI phân tích
  LASER_SCAN_TRIGGER : BOOL := FALSE;
  SCAN_COMPLETE : BOOL := FALSE;
  AI_RUN_INFERENCE : BOOL := FALSE;
  AI_RESULT_READY : BOOL := FALSE;
  AI_RESULT_OK : BOOL := FALSE;
  
  // Phân loại đầu ra
  DISCHARGE_OK_GATE : BOOL := FALSE;
  GATE_OPEN_LIMIT : BOOL := FALSE;
  DISCHARGE_NG_GATE : BOOL := FALSE;
  NG_GATE_LIMIT : BOOL := FALSE;
  REJECT_COUNT : INT := 0;
  
  // Còi báo động lỗi
  ALARM_SIREN : BOOL := FALSE;
END_VAR

// ----------------------------------------------------
// ▶ BẢO VỆ LIÊN KHÓA & KHỞI TẠO AN TOÀN (Rule Page 4)
// ----------------------------------------------------
IF NOT SAFETY_RELAY_KA1_OK THEN
  EMERGENCY_STOP := TRUE;
  AUTO_MODE := FALSE;
  GRIP_CYLINDER_OUT := FALSE;
  SERVO_START := FALSE;
END_IF;

// Khởi động chế độ tự động
IF START_PB AND NOT EMERGENCY_STOP THEN
  AUTO_MODE := TRUE;
  STEP_NUMBER := 1;
END_IF;

// ----------------------------------------------------
// ① WORKPIECE GRIP
// ----------------------------------------------------
IF AUTO_MODE AND STEP_NUMBER = 1 THEN
  GRIP_CYLINDER_OUT := TRUE;
  IF GRIP_LIMIT_SWITCH THEN
    STEP_NUMBER := 2;
  END_IF;
END_IF;

// ----------------------------------------------------
// ② SERVO MOVE TO INSPECTION
// ----------------------------------------------------
IF AUTO_MODE AND STEP_NUMBER = 2 THEN
  SERVO_TARGET_X := 150.0;
  SERVO_TARGET_Y := 280.0;
  SERVO_TARGET_Z := 50.0;
  SERVO_START := TRUE;
  
  IF SERVO_IN_POSITION THEN
    STEP_NUMBER := 3;
  END_IF;
END_IF;

// ----------------------------------------------------
// ③ 3D LASER MEASUREMENT SCAN
// ----------------------------------------------------
IF AUTO_MODE AND STEP_NUMBER = 3 THEN
  LASER_SCAN_TRIGGER := TRUE;
  IF SCAN_COMPLETE THEN
    STEP_NUMBER := 4;
  END_IF;
END_IF;

// ----------------------------------------------------
// ④ AI INFERENCE JUDGMENT
// ----------------------------------------------------
IF AUTO_MODE AND STEP_NUMBER = 4 THEN
  AI_RUN_INFERENCE := TRUE;
  IF AI_RESULT_READY THEN
    IF AI_RESULT_OK THEN
      STEP_NUMBER := 5; // Chuyển sang đẩy hàng OK
    ELSE
      STEP_NUMBER := 6; // Chuyển sang đẩy hàng lỗi NG
    END_IF;
  END_IF;
END_IF;

// ----------------------------------------------------
// ⑤A DISCHARGE OK PRODUCT
// ----------------------------------------------------
IF AUTO_MODE AND STEP_NUMBER = 5 THEN
  DISCHARGE_OK_GATE := TRUE;
  IF GATE_OPEN_LIMIT THEN
    DISCHARGE_OK_GATE := FALSE;
    AUTO_MODE := FALSE;
    STEP_NUMBER := 0; // Hoàn thành chu kỳ
  END_IF;
END_IF;

// ----------------------------------------------------
// ⑤B DISCHARGE NG PRODUCT & TRIGGER ALARM
// ----------------------------------------------------
IF AUTO_MODE AND STEP_NUMBER = 6 THEN
  DISCHARGE_NG_GATE := TRUE;
  ALARM_SIREN := TRUE; // Kích hoạt còi cảnh báo lỗi
  REJECT_COUNT := REJECT_COUNT + 1;
  
  IF NG_GATE_LIMIT THEN
    DISCHARGE_NG_GATE := FALSE;
    ALARM_SIREN := FALSE;
    AUTO_MODE := FALSE;
    STEP_NUMBER := 0; // Kết thúc lỗi
  END_IF;
END_IF;

END_PROGRAM`;

export const COMPACT_ST_CODE = `PROGRAM WW2_Welding_Cell
VAR
  SAFETY_RELAY_KA1_OK, EMERGENCY_STOP, AUTO_MODE, START_PB : BOOL;
  STEP_NUMBER : INT;
  GRIP_CYLINDER_OUT, GRIP_LIMIT_SWITCH : BOOL;
  SERVO_TARGET_X, SERVO_TARGET_Y, SERVO_TARGET_Z : REAL;
  SERVO_START, SERVO_IN_POSITION : BOOL;
  LASER_SCAN_TRIGGER, SCAN_COMPLETE, AI_RUN_INFERENCE, AI_RESULT_READY, AI_RESULT_OK : BOOL;
  DISCHARGE_OK_GATE, GATE_OPEN_LIMIT, DISCHARGE_NG_GATE, NG_GATE_LIMIT : BOOL;
  REJECT_COUNT : INT;
  ALARM_SIREN : BOOL;
END_VAR

// Liên khóa khẩn cấp
IF NOT SAFETY_RELAY_KA1_OK THEN
  EMERGENCY_STOP := TRUE; AUTO_MODE := FALSE; GRIP_CYLINDER_OUT := FALSE; SERVO_START := FALSE;
ELSIF START_PB THEN
  AUTO_MODE := TRUE; STEP_NUMBER := 1;
END_IF;

// Chu trình máy trạng thái (State Machine)
IF AUTO_MODE THEN
  CASE STEP_NUMBER OF
    1: // Kẹp phôi
       GRIP_CYLINDER_OUT := TRUE;
       IF GRIP_LIMIT_SWITCH THEN STEP_NUMBER := 2; END_IF;
    2: // Servo di chuyển
       SERVO_TARGET_X := 150.0; SERVO_TARGET_Y := 280.0; SERVO_TARGET_Z := 50.0; SERVO_START := TRUE;
       IF SERVO_IN_POSITION THEN STEP_NUMBER := 3; END_IF;
    3: // Quét laser
       LASER_SCAN_TRIGGER := TRUE;
       IF SCAN_COMPLETE THEN STEP_NUMBER := 4; END_IF;
    4: // Phân tích AI
       AI_RUN_INFERENCE := TRUE;
       IF AI_RESULT_READY THEN
         IF AI_RESULT_OK THEN STEP_NUMBER := 5; ELSE STEP_NUMBER := 6; END_IF;
       END_IF;
    5: // Trả hàng OK
       DISCHARGE_OK_GATE := TRUE;
       IF GATE_OPEN_LIMIT THEN DISCHARGE_OK_GATE := FALSE; AUTO_MODE := FALSE; STEP_NUMBER := 0; END_IF;
    6: // Trả hàng lỗi NG & Alarm
       DISCHARGE_NG_GATE := TRUE; ALARM_SIREN := TRUE; REJECT_COUNT := REJECT_COUNT + 1;
       IF NG_GATE_LIMIT THEN DISCHARGE_NG_GATE := FALSE; ALARM_SIREN := FALSE; AUTO_MODE := FALSE; STEP_NUMBER := 0; END_IF;
  END_CASE;
END_IF;
END_PROGRAM`;

const CLEAN_ST_CODE = `PROGRAM WW2_Welding_Cell
VAR
  // Thống nhất các biến ngõ vào & ngõ ra
  SAFETY_RELAY_KA1_OK : BOOL := TRUE; // Cảm biến an toàn KA1
  EMERGENCY_STOP : BOOL := FALSE;      // Nút dừng khẩn cấp
  AUTO_MODE : BOOL := FALSE;           // Chế độ tự động
  START_PB : BOOL := FALSE;            // Nút nhấn Start
  STEP_NUMBER : INT := 0;              // Bước điều khiển hiện tại
  
  // Cơ cấu cơ khí chấp hành
  GRIP_CYLINDER_OUT : BOOL := FALSE;
  GRIP_LIMIT_SWITCH : BOOL := FALSE;
  SERVO_TARGET_X : REAL := 0.0;
  SERVO_TARGET_Y : REAL := 0.0;
  SERVO_TARGET_Z : REAL := 0.0;
  SERVO_START : BOOL := FALSE;
  SERVO_IN_POSITION : BOOL := FALSE;
  
  // Cảm biến & Module đo quét
  LASER_SCAN_TRIGGER : BOOL := FALSE;
  SCAN_COMPLETE : BOOL := FALSE;
  AI_RUN_INFERENCE : BOOL := FALSE;
  AI_RESULT_READY : BOOL := FALSE;
  AI_RESULT_OK : BOOL := FALSE;
  
  // Cơ cấu phân loại đầu ra
  DISCHARGE_OK_GATE : BOOL := FALSE;
  GATE_OPEN_LIMIT : BOOL := FALSE;
  DISCHARGE_NG_GATE : BOOL := FALSE;
  NG_GATE_LIMIT : BOOL := FALSE;
  REJECT_COUNT : INT := 0;
  ALARM_SIREN : BOOL := FALSE;         // Còi báo hiệu khi phát hiện phôi NG
END_VAR

// ====================================================
// 1. CHƯƠNG TRÌNH PHỤ TRỢ: BẢO VỆ & LIÊN KHÓA KA1
// ====================================================
IF NOT SAFETY_RELAY_KA1_OK THEN
  EMERGENCY_STOP := TRUE;
  AUTO_MODE := FALSE;
  GRIP_CYLINDER_OUT := FALSE;
  SERVO_START := FALSE;
END_IF;

// Kích hoạt chu kỳ tự động vận hành
IF START_PB AND NOT EMERGENCY_STOP THEN
  AUTO_MODE := TRUE;
  STEP_NUMBER := 1;
END_IF;

// ====================================================
// 2. CHƯƠNG TRÌNH CHÍNH: CHU TRÌNH ĐIỀU KHIỂN ROBOT HÀN
// ====================================================
IF AUTO_MODE THEN
  CASE STEP_NUMBER OF
    1: // BƯỚC 1: Kẹp phôi hàn bằng xi lanh khí nén
       GRIP_CYLINDER_OUT := TRUE;
       IF GRIP_LIMIT_SWITCH THEN
         STEP_NUMBER := 2;
       END_IF;

    2: // BƯỚC 2: Di chuyển 3 trục Servo đến tọa độ kiểm tra
       SERVO_TARGET_X := 150.0;
       SERVO_TARGET_Y := 280.0;
       SERVO_TARGET_Z := 50.0;
       SERVO_START := TRUE;
       
       IF SERVO_IN_POSITION THEN
         STEP_NUMBER := 3;
       END_IF;

    3: // BƯỚC 3: Kích hoạt hệ thống cảm biến quét Laser 3D
       LASER_SCAN_TRIGGER := TRUE;
       IF SCAN_COMPLETE THEN
         STEP_NUMBER := 4;
       END_IF;

    4: // BƯỚC 4: Khởi chạy AI inference và lấy phán quyết
       AI_RUN_INFERENCE := TRUE;
       IF AI_RESULT_READY THEN
         IF AI_RESULT_OK THEN
           STEP_NUMBER := 5; // Phôi đạt -> Chuyển sang băng tải OK
         ELSE
           STEP_NUMBER := 6; // Phôi lỗi -> Chuyển sang khay phế phẩm
         END_IF;
       END_IF;

    5: // BƯỚC 5a: Đẩy phôi đạt chuẩn (Discharge OK)
       DISCHARGE_OK_GATE := TRUE;
       IF GATE_OPEN_LIMIT THEN
         DISCHARGE_OK_GATE := FALSE;
         AUTO_MODE := FALSE;
         STEP_NUMBER := 0; // Hoàn thành chu kỳ
       END_IF;

    6: // BƯỚC 5b: Đẩy phôi lỗi & Báo còi (Discharge NG)
       DISCHARGE_NG_GATE := TRUE;
       ALARM_SIREN := TRUE; // Còi hú báo động sự cố sản phẩm lỗi
       REJECT_COUNT := REJECT_COUNT + 1;
       
       IF NG_GATE_LIMIT THEN
         DISCHARGE_NG_GATE := FALSE;
         ALARM_SIREN := FALSE;
         AUTO_MODE := FALSE;
         STEP_NUMBER := 0; // Kết thúc chu kỳ lỗi
       END_IF;
  END_CASE;
END_IF;
END_PROGRAM`;

export default function DebugCodeStep({
  projectId,
  onProgressChange,
  onAddLog,
  isZenMode = false,
  toggleZenMode: _toggleZenMode,
  onParaphrase: _onParaphrase,
  paraphraseCommand,
}: DebugCodeStepProps) {
  const { t, tf, locale } = useI18n()
  const L = (vi: string, ja: string, en: string) => locale === 'ja' ? ja : locale === 'en' ? en : vi
  const STORAGE_KEY = `aiplf.plc_st_code.${projectId}`
  const [code, setCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [syntaxStatus, setSyntaxStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [revisions, setRevisions] = useState<{ id: string; time: string; desc: string; code: string }[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'revisions'>('diagnostics')
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState<boolean>(true)
  const editorHeight = isRightSidebarExpanded ? '350px' : '520px'
  const lineGutterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isZenMode) {
      setIsRightSidebarExpanded(false)
    }
  }, [isZenMode])

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineGutterRef.current) {
      lineGutterRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  // 1. Load initial code from localStorage or set defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setCode(stored)
      } else {
        const localizedDefault = localizeCodeComments(DEFAULT_ST_CODE, locale)
        setCode(localizedDefault)
        localStorage.setItem(STORAGE_KEY, localizedDefault)
      }

      // Initialize revisions
      const revKey = `aiplf.code_revisions.${projectId}`
      const storedRev = localStorage.getItem(revKey)
      if (storedRev) {
        setRevisions(JSON.parse(storedRev))
      } else {
        const initialRevs = [
          { id: 'rev-1', time: '16:05:12', desc: 'AI sinh mã gốc ban đầu', code: localizeCodeComments(DEFAULT_ST_CODE, locale) }
        ]
        setRevisions(initialRevs)
        localStorage.setItem(revKey, JSON.stringify(initialRevs))
      }
    } catch {
      setCode(localizeCodeComments(DEFAULT_ST_CODE, locale))
    }
  }, [projectId, locale])

  // Sync to outer components on code change
  const handleCodeChange = (newVal: string) => {
    setCode(newVal)
    localStorage.setItem(STORAGE_KEY, newVal)
    window.dispatchEvent(new Event('storage')) // Notify parent & chat
    
    // Automatically flag that code has been changed manually
    if (onProgressChange) {
      onProgressChange(85)
    }
  }

  // 2. Syntax validation
  const runSyntaxCheck = () => {
    setActiveTab('diagnostics')
    setSyntaxStatus('checking')
    setErrorMessage(null)
    
    setTimeout(() => {
      // Basic syntax check simulator
      // We look for classic ST syntax mistakes like assignment with "=" instead of ":="
      // or missing semicolons at line ends.
      const lines = code.split('\n')
      let foundError = false
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        // Skip comments and program blocks
        if (line.startsWith('//') || line.startsWith('PROGRAM') || line.startsWith('VAR') || line.endsWith('VAR') || line.startsWith('END_PROGRAM') || line === '') {
          continue
        }

        // Check if assignment uses '=' instead of ':='
        // Specifically look for assignment statements, e.g. EMERGENCY_STOP = TRUE;
        if (line.includes('=') && !line.includes(':=') && !line.includes('IF') && !line.includes('CASE') && !line.includes('OF') && !line.includes('<') && !line.includes('>')) {
          setSyntaxStatus('invalid')
          setErrorMessage(tf('post.debug.errEqualSign', { line: i + 1, detail: lines[i].trim() }))
          foundError = true
          break
        }
        
        // Check for missing semicolons (skip structures like IF, CASE, END_IF, END_CASE, FOR, etc.)
        if (
          !line.endsWith(';') && 
          !line.startsWith('IF') && 
          !line.startsWith('ELSIF') && 
          !line.startsWith('ELSE') && 
          !line.startsWith('END_IF') && 
          !line.startsWith('CASE') && 
          !line.startsWith('OF') && 
          !line.startsWith('END_CASE') && 
          !line.startsWith('PROGRAM') && 
          !line.startsWith('END_PROGRAM') && 
          !line.startsWith('VAR') &&
          !line.includes('//') &&
          !line.startsWith('1:') &&
          !line.startsWith('2:') &&
          !line.startsWith('3:') &&
          !line.startsWith('4:') &&
          !line.startsWith('5:') &&
          !line.startsWith('6:')
        ) {
          setSyntaxStatus('invalid')
          setErrorMessage(tf('post.debug.errSemicolon', { line: i + 1, detail: lines[i].trim() }))
          foundError = true
          break
        }
      }

      if (!foundError) {
        setSyntaxStatus('valid')
        if (onProgressChange) onProgressChange(100)
        if (onAddLog) onAddLog(L('Kiểm tra cú pháp PLC ST thành công - 0 lỗi', 'PLC ST 構文チェック完了 - エラー 0 件', 'PLC ST syntax check passed - 0 errors'), 12)
      } else {
        if (onAddLog) onAddLog(L('Phát hiện lỗi cú pháp trong mã PLC ST', 'PLC ST コードに構文エラーを検出', 'Syntax error detected in PLC ST code'), 12)
      }
    }, 1500)
  }

  // 3. Fix syntax automatically (AI quick-fix)
  const handleQuickFix = () => {
    if (errorMessage && errorMessage.includes('Dòng')) {
      const match = errorMessage.match(/Dòng (\d+)/)
      if (match) {
        const lineNum = parseInt(match[1]) - 1
        const lines = code.split('\n')
        const faultyLine = lines[lineNum]
        
        // Replace first '=' with ':='
        if (faultyLine.includes('=') && !faultyLine.includes(':=')) {
          lines[lineNum] = faultyLine.replace('=', ':=')
        } else if (!faultyLine.endsWith(';')) {
          lines[lineNum] = faultyLine + ';'
        }
        
        const fixedCode = lines.join('\n')
        setCode(fixedCode)
        localStorage.setItem(STORAGE_KEY, fixedCode)
        window.dispatchEvent(new Event('storage'))
        
        setSyntaxStatus('valid')
        setErrorMessage(null)
        
        // Save to revisions
        saveRevision('AI Tự sửa lỗi cú pháp nhanh', fixedCode)
        
        if (onAddLog) onAddLog(L('Sửa nhanh lỗi cú pháp bằng AI hoàn tất', 'AI によるクイック構文修正が完了しました', 'AI quick-fix of syntax error completed'), 12)
      }
    }
  }

  // Helper to save revisions
  const saveRevision = (desc: string, codeVal: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const newRev = {
      id: `rev-${Date.now()}`,
      time,
      desc,
      code: codeVal
    }
    const updated = [newRev, ...revisions].slice(0, 5) // Cap at last 5 edits
    setRevisions(updated)
    localStorage.setItem(`aiplf.code_revisions.${projectId}`, JSON.stringify(updated))
  }

  // 4a. React to external paraphrase command (from chat suggestions in NotebookWorkspace)
  useEffect(() => {
    if (paraphraseCommand) {
      applyParaphrase(paraphraseCommand.type)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paraphraseCommand])

  // 4. Paraphrase / Refactoring
  const applyParaphrase = (type: 'default' | 'compact' | 'clean_case') => {
    setSyntaxStatus('idle')
    setErrorMessage(null)
    
    let targetCode = DEFAULT_ST_CODE
    let actionDesc = 'Khôi phục lại mã cấu hình gốc'
    
    if (type === 'compact') {
      targetCode = COMPACT_ST_CODE
      actionDesc = 'Tối ưu hóa gọn mã nguồn (State Machine / CASE)'
    } else if (type === 'clean_case') {
      targetCode = CLEAN_ST_CODE
      actionDesc = 'Thêm cấu trúc ghi chú & CASE chuẩn IEC'
    }
    
    const localizedTarget = localizeCodeComments(targetCode, locale)
    setCode(localizedTarget)
    localStorage.setItem(STORAGE_KEY, localizedTarget)
    window.dispatchEvent(new Event('storage'))
    saveRevision(`AI Paraphrase: ${actionDesc}`, localizedTarget)
    
    if (onAddLog) onAddLog(`${L('Áp dụng Paraphrase', 'パラフレーズ適用', 'Paraphrase applied')}: ${actionDesc}`, 12)
    if (onProgressChange) onProgressChange(100)
    
    alert(`${t('post.debug.alertApplySuccess')}: ${translateRevDesc(actionDesc, t)}`)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  // 5. Watch storage events to sync when user updates code via AI Chatbot
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setCode(e.newValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [STORAGE_KEY])

  // Count lines for editor numbers
  const lineCount = code.split('\n').length
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

  return (
    <div className={`${isZenMode ? 'max-w-none w-full' : 'max-w-6xl mx-auto'} space-y-5 animate-in fade-in duration-300`}>
      
      {/* Step Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {t('post.debug.headerTitle')}
            </h4>
            <p className="text-[10px] text-slate-455 mt-0.5">
              {t('post.debug.headerSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsRightSidebarExpanded(!isRightSidebarExpanded)}
            className="flex items-center justify-center p-2.5 bg-violet-55 hover:bg-violet-100/80 text-violet-700 border border-violet-200 rounded-xl transition cursor-pointer shadow-3xs"
            title={isRightSidebarExpanded ? L('Ẩn công cụ AI', 'AI ツールを非表示', 'Hide AI tools') : L('Hiện công cụ AI', 'AI ツールを表示', 'Show AI tools')}
          >
            {isRightSidebarExpanded ? (
              <ChevronDown className="w-4 h-4 text-violet-600" />
            ) : (
              <Wand2 className="w-4 h-4 text-violet-600 animate-pulse" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition cursor-pointer shadow-3xs"
            title={copied ? t('post.debug.copied') : t('post.debug.copyAll')}
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* The Interactive ST Editor (Takes full width, with optional bottom panel) */}
        <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 lg:col-span-12 w-full">
          
          {/* Editor Header Bar (Light Theme) */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-650 font-mono select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-450" />
              <span className="w-3 h-3 rounded-full bg-yellow-450" />
              <span className="w-3 h-3 rounded-full bg-green-450" />
              <span className="ml-2 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                WW2_Welding_Cell.st
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-[9px] font-bold uppercase text-brand-700">
                IEC 61131-3 Active
              </span>
            </div>
          </div>

          {/* Editor TextArea Body */}
          <div className="flex-1 flex overflow-hidden font-mono text-xs p-2.5 bg-[#fafbfc]">
            
            {/* Line numbers gutter */}
            <div 
              ref={lineGutterRef} 
              className="w-12 select-none text-right pr-4 text-slate-400/80 bg-slate-50/50 border-r border-slate-200/80 py-1.5 leading-6 overflow-hidden font-semibold font-mono text-[11px]"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', height: editorHeight }}
            >
              {lineNumbers.map(n => (
                <div key={n} className="h-6 overflow-hidden">{n}</div>
              ))}
            </div>

            {/* Textarea Area */}
            <div className="flex-1 relative py-1.5 pl-3.5 bg-white leading-6" style={{ height: editorHeight }}>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full bg-transparent text-slate-850 border-none outline-none resize-none font-mono text-xs pl-3.5 py-1.5 focus:ring-0 leading-6 whitespace-pre overflow-y-auto select-text selection:bg-brand-500/15 caret-brand-600"
                spellCheck={false}
                placeholder={t('post.debug.placeholder')}
              />
            </div>
          </div>

          {/* Editor Status Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-505 font-mono flex items-center justify-between select-none">
            <div className="flex gap-4">
              <span>Lines: <strong>{lineCount}</strong></span>
              <span>Chars: <strong>{code.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>{t('post.debug.editEnabled')}</span>
            </div>
          </div>

          {/* Bottom Panel (Console/Terminal Style) */}
          {isRightSidebarExpanded && (
            <div className="border-t border-slate-200 bg-slate-50 flex flex-col h-[220px] shrink-0 animate-in slide-in-from-bottom duration-300">
              {/* Tabs Header */}
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-100 border-b border-slate-200 shrink-0">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('diagnostics')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'diagnostics'
                        ? 'bg-white text-slate-800 shadow-3xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-850 hover:bg-slate-200/50'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{t('post.debug.tabDiagnostics')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('revisions')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'revisions'
                        ? 'bg-white text-slate-800 shadow-3xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-850 hover:bg-slate-200/50'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{t('post.debug.tabRevisions')}</span>
                  </button>
                </div>
                {/* Console actions or indicators */}
                <div className="text-[10px] font-mono text-slate-455 uppercase tracking-wider font-bold">
                  {activeTab === 'diagnostics' ? 'AI Diagnostic Console' : 'Revision Registry'}
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                {activeTab === 'diagnostics' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full items-stretch animate-in fade-in duration-200">
                    {/* Column 1 & 2: Status Details */}
                    <div className="md:col-span-2 flex flex-col justify-center">
                      {syntaxStatus === 'idle' && (
                        <div className="bg-slate-100 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 animate-fade-in-up">
                          <AlertCircle className="w-5 h-5 text-slate-505 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{t('post.debug.notChecked')}</div>
                            <p className="text-[10px] text-slate-500 leading-normal">{t('post.debug.notCheckedDesc')}</p>
                          </div>
                        </div>
                      )}

                      {syntaxStatus === 'checking' && (
                        <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                          <RefreshCw className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-amber-700">{t('post.debug.compiling')}</div>
                            <p className="text-[10px] text-amber-550/85 leading-normal">{t('post.debug.compilingDesc')}</p>
                          </div>
                        </div>
                      )}

                      {syntaxStatus === 'valid' && (
                        <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-3 flex items-center gap-3 animate-in zoom-in duration-200">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="flex-1">
                            <div className="text-xs font-bold text-emerald-800">{t('post.debug.valid')}</div>
                            <p className="text-[10px] text-emerald-700 leading-normal mb-1.5">{t('post.debug.validDesc')}</p>
                            <div className="inline-flex gap-4 text-[9px] font-mono bg-emerald-100/60 border border-emerald-200/50 rounded-md px-2 py-0.5 text-emerald-600 select-none">
                              <span>Errors: 0</span>
                              <span>Warnings: 0</span>
                              <span>Size: {code.split('\n').length} lines</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {syntaxStatus === 'invalid' && (
                        <div className="bg-rose-50 border border-rose-250 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center gap-3 animate-in shake duration-300">
                          <div className="flex items-center gap-2 md:w-1/3 shrink-0">
                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span className="text-xs font-bold text-rose-800">{t('post.debug.errorFound')}</span>
                          </div>
                          <div className="flex-1 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            <div className="flex-1 text-[10px] font-mono bg-white border border-rose-150 rounded p-2 text-rose-700 whitespace-pre-wrap leading-relaxed">
                              {errorMessage}
                            </div>
                            <button
                              type="button"
                              onClick={handleQuickFix}
                              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold transition cursor-pointer shrink-0 shadow-sm shadow-rose-600/10"
                            >
                              <Wand2 className="w-3.5 h-3.5" />
                              <span>{t('post.debug.quickFix')}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Column 3: Run compiler action */}
                    <div className="flex items-center justify-center md:border-l md:border-slate-200 md:pl-4">
                      <button
                        type="button"
                        onClick={runSyntaxCheck}
                        disabled={syntaxStatus === 'checking'}
                        className="w-full max-w-[200px] flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-violet-500/10 cursor-pointer"
                      >
                        {syntaxStatus === 'checking' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('post.debug.checking')}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>{t('post.debug.runCheck')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'revisions' && (
                  <div className="space-y-3 animate-in fade-in duration-200 h-full flex flex-col min-h-0">
                    {/* Horizontal scrollable cards for revisions */}
                    <div className="flex gap-3 overflow-x-auto pb-2 flex-1 min-h-0 scrollbar-thin scrollbar-thumb-slate-200">
                      {revisions.map((rev) => (
                        <div key={rev.id} className="min-w-[240px] max-w-[280px] flex-shrink-0 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition shadow-2xs">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono font-semibold">
                              <span>Revision ID</span>
                              <span>{rev.time}</span>
                            </div>
                            <span className="font-bold text-slate-700 text-[10.5px] leading-snug block line-clamp-2">{translateRevDesc(rev.desc, t)}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button 
                              type="button"
                              onClick={() => {
                                setCode(rev.code)
                                localStorage.setItem(STORAGE_KEY, rev.code)
                                window.dispatchEvent(new Event('storage'))
                                setSyntaxStatus('idle')
                                alert(`${t('post.debug.alertUndoSuccess')}: ${translateRevDesc(rev.desc, t)}`)
                              }}
                              className="text-brand-600 hover:text-brand-700 font-extrabold hover:underline cursor-pointer transition shrink-0 ml-2"
                            >
                              {t('post.debug.undo')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
