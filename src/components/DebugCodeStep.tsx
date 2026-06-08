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
  AlertCircle
} from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

interface DebugCodeStepProps {
  projectId: string
  onProgressChange?: (progress: number) => void
  onAddLog?: (action: string, phaseNum: number) => void
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

export default function DebugCodeStep({ projectId, onProgressChange, onAddLog }: DebugCodeStepProps) {
  const { t } = useI18n()
  const STORAGE_KEY = `aiplf.plc_st_code.${projectId}`
  const [code, setCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [syntaxStatus, setSyntaxStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeParaphrase, setActiveParaphrase] = useState<string>('default')
  const [revisions, setRevisions] = useState<{ id: string; time: string; desc: string; code: string }[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 1. Load initial code from localStorage or set defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setCode(stored)
      } else {
        setCode(DEFAULT_ST_CODE)
        localStorage.setItem(STORAGE_KEY, DEFAULT_ST_CODE)
      }

      // Initialize revisions
      const revKey = `aiplf.code_revisions.${projectId}`
      const storedRev = localStorage.getItem(revKey)
      if (storedRev) {
        setRevisions(JSON.parse(storedRev))
      } else {
        const initialRevs = [
          { id: 'rev-1', time: '16:05:12', desc: 'AI sinh mã gốc ban đầu', code: DEFAULT_ST_CODE }
        ]
        setRevisions(initialRevs)
        localStorage.setItem(revKey, JSON.stringify(initialRevs))
      }
    } catch {
      setCode(DEFAULT_ST_CODE)
    }
  }, [projectId])

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
          setErrorMessage(`Dòng ${i + 1}: Lỗi cú pháp. Gán giá trị sai ký hiệu '=' thay vì ':='.\nChi tiết: "${lines[i].trim()}"`)
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
          setErrorMessage(`Dòng ${i + 1}: Lỗi cú pháp. Thiếu dấu chấm phẩy ';' kết thúc câu lệnh.\nChi tiết: "${lines[i].trim()}"`)
          foundError = true
          break
        }
      }

      if (!foundError) {
        setSyntaxStatus('valid')
        if (onProgressChange) onProgressChange(100)
        if (onAddLog) onAddLog('Kiểm tra cú pháp PLC ST thành công - 0 lỗi', 12)
      } else {
        if (onAddLog) onAddLog('Phát hiện lỗi cú pháp trong mã PLC ST', 12)
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
        
        if (onAddLog) onAddLog('Sửa nhanh lỗi cú pháp bằng AI hoàn tất', 12)
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

  // 4. Paraphrase / Refactoring
  const applyParaphrase = (type: 'default' | 'compact' | 'clean_case') => {
    setActiveParaphrase(type)
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
    
    setCode(targetCode)
    localStorage.setItem(STORAGE_KEY, targetCode)
    window.dispatchEvent(new Event('storage'))
    saveRevision(`AI Paraphrase: ${actionDesc}`, targetCode)
    
    if (onAddLog) onAddLog(`Áp dụng Paraphrase: ${actionDesc}`, 12)
    if (onProgressChange) onProgressChange(100)
    
    alert(`Đã áp dụng thành công phong cách: ${actionDesc}`)
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
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-300">
      
      {/* Step Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Trình biên tập & Debug mã PLC ST
            </h4>
            <p className="text-[10px] text-slate-450 mt-0.5">
              Bước 5: Chỉnh sửa trực tiếp, kiểm tra cú pháp và tối ưu hóa Structured Text (ST) bằng AI
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-3xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t('post.debug.copied') : t('post.debug.copyAll')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: The Interactive ST Editor (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[500px]">
          
          {/* Editor Header Bar */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono select-none">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
              <span className="ml-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                WW2_Welding_Cell.st
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-750 text-[9px] font-bold uppercase text-brand-400">
                IEC 61131-3 Active
              </span>
            </div>
          </div>

          {/* Editor TextArea Body */}
          <div className="flex-1 flex overflow-hidden font-mono text-xs p-2.5">
            
            {/* Line numbers gutter */}
            <div className="w-10 select-none text-right pr-3.5 text-slate-600 font-semibold border-r border-slate-800 py-1.5 leading-6">
              {lineNumbers.map(n => (
                <div key={n} className="h-6 overflow-hidden">{n}</div>
              ))}
            </div>

            {/* Textarea Area */}
            <div className="flex-1 relative py-1.5 pl-3.5 bg-slate-900 leading-6 h-[460px]">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="absolute inset-0 w-full h-full bg-transparent text-slate-200 border-none outline-none resize-none font-mono text-xs pl-3.5 py-1.5 focus:ring-0 leading-6 whitespace-pre overflow-y-auto select-text selection:bg-brand-500/30"
                spellCheck={false}
                placeholder={t('post.debug.placeholder')}
              />
            </div>
          </div>

          {/* Editor Status Bar */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between select-none">
            <div className="flex gap-4">
              <span>Lines: <strong>{lineCount}</strong></span>
              <span>Chars: <strong>{code.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>{t('post.debug.editEnabled')}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Control Center & Validation (4 cols) */}
        <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
          
          {/* Syntax Diagnostics Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Terminal className="w-4 h-4 text-violet-650" />
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {t('post.debug.analysisCenter')}
              </h5>
            </div>

            <button
              onClick={runSyntaxCheck}
              disabled={syntaxStatus === 'checking'}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-violet-500/10 cursor-pointer"
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

            {/* Validation Feedback Widgets */}
            {syntaxStatus === 'idle' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center text-slate-500 text-xs flex flex-col items-center gap-1.5 py-5 select-none">
                <AlertCircle className="w-6 h-6 text-slate-400" />
                <div className="font-bold">{t('post.debug.notChecked')}</div>
                <p className="text-[10px] text-slate-400">{t('post.debug.notCheckedDesc')}</p>
              </div>
            )}

            {syntaxStatus === 'checking' && (
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-center text-amber-700 text-xs flex flex-col items-center gap-2 py-5 animate-pulse">
                <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                <div className="font-bold">{t('post.debug.compiling')}</div>
                <p className="text-[10px] text-amber-500/80">{t('post.debug.compilingDesc')}</p>
              </div>
            )}

            {syntaxStatus === 'valid' && (
              <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-3.5 text-emerald-800 text-xs space-y-2.5 animate-in zoom-in duration-200">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{t('post.debug.valid')}</span>
                </div>
                <p className="text-[10px] text-emerald-700 leading-relaxed">
                  {t('post.debug.validDesc')}
                </p>
                <div className="text-[9px] font-mono bg-emerald-100 border border-emerald-200/50 rounded px-2 py-1 flex items-center justify-between text-emerald-600 select-none">
                  <span>Errors: 0</span>
                  <span>Warnings: 0</span>
                  <span>Code Size: {code.split('\n').length} lines</span>
                </div>
              </div>
            )}

            {syntaxStatus === 'invalid' && (
              <div className="bg-rose-50 border border-rose-250 rounded-xl p-3.5 text-rose-800 text-xs space-y-2.5 animate-in shake duration-300">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{t('post.debug.errorFound')}</span>
                </div>
                <div className="text-[10.5px] font-mono bg-white border border-rose-150 rounded p-2 text-rose-700 whitespace-pre-wrap leading-relaxed">
                  {errorMessage}
                </div>
                
                <button
                  onClick={handleQuickFix}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{t('post.debug.quickFix')}</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Paraphrase / Rewrite Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Wand2 className="w-4 h-4 text-amber-500" />
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {t('post.debug.paraphraseTitle')}
              </h5>
            </div>

            <p className="text-[10px] text-slate-450 leading-relaxed">
              {t('post.debug.paraphraseDesc')}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => applyParaphrase('compact')}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                  activeParaphrase === 'compact'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-800 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold">{t('post.debug.optimize')}</div>
                  <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">{t('post.debug.optimizeDesc')}</div>
                </div>
              </button>

              <button
                onClick={() => applyParaphrase('clean_case')}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                  activeParaphrase === 'clean_case'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-800 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold">{t('post.debug.iecNotes')}</div>
                  <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">{t('post.debug.iecNotesDesc')}</div>
                </div>
              </button>

              <button
                onClick={() => applyParaphrase('default')}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                  activeParaphrase === 'default'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-800 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold">{t('post.debug.restore')}</div>
                  <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">{t('post.debug.restoreDesc')}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Revision Logs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="w-4 h-4 text-teal-600" />
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {t('post.debug.revisionTitle')}
              </h5>
            </div>

            <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
              {revisions.map((rev) => (
                <div key={rev.id} className="flex gap-2.5 items-start text-[10px] leading-normal border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="font-mono text-slate-400 font-semibold">{rev.time}</span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-750 block">{rev.desc}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setCode(rev.code)
                      localStorage.setItem(STORAGE_KEY, rev.code)
                      window.dispatchEvent(new Event('storage'))
                      setSyntaxStatus('idle')
                      alert(`Đã hoàn tác về phiên bản: ${rev.desc}`)
                    }}
                    className="text-brand-600 font-bold hover:underline cursor-pointer"
                  >
                    Hoàn tác
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
