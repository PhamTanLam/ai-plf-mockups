import { useState, useEffect } from 'react'
import { Code, Copy, RefreshCw, Layers, Check } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

interface NodeItem {
  id: string
  label: string
  address: string
  description: string
  stCode: string
}

interface FlowchartEditorProps {
  locale: string
  onProgressChange?: (progress: number) => void
}

export default function FlowchartEditor({ locale, onProgressChange }: FlowchartEditorProps) {
  void locale
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'flow' | 'st'>('flow')
  const [selectedNode, setSelectedNode] = useState<string>('step4')
  const [copied, setCopied] = useState(false)

  // Page 4 Tri thức rules state
  const [ruleInterlock, setRuleInterlock] = useState(true)
  const [ruleServoInit, setRuleServoInit] = useState(true)
  const [ruleRegisterOpt, setRuleRegisterOpt] = useState(false)

  useEffect(() => {
    try {
      const ri = localStorage.getItem('aiplf.rule_interlock')
      if (ri !== null) setRuleInterlock(JSON.parse(ri))
      const rsi = localStorage.getItem('aiplf.rule_servo_init')
      if (rsi !== null) setRuleServoInit(JSON.parse(rsi))
      const rro = localStorage.getItem('aiplf.rule_register_opt')
      if (rro !== null) setRuleRegisterOpt(JSON.parse(rro))
    } catch {}
  }, [])

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(activeTab === 'st' ? 100 : 80)
    }
  }, [activeTab, onProgressChange])

  const getDynamicNodes = (): Record<string, NodeItem> => {
    const startCode = [
      ruleInterlock ? '// Tri thức Page 4: Khóa cứng tiếp điểm NC KA1\nIF NOT SAFETY_RELAY_KA1_OK THEN\n  EMERGENCY_STOP := TRUE;\n  AUTO_MODE := FALSE;\nEND_IF;' : '',
      ruleServoInit ? '// Tri thức Page 4: Khối khởi tạo Servo trục A1, A2, A3\nCALL SERVO_AXIS_1_INIT();\nCALL SERVO_AXIS_2_INIT();\nCALL SERVO_AXIS_3_INIT();' : '',
      'IF START_PB AND NOT EMERGENCY_STOP THEN\n  AUTO_MODE := TRUE;\n  STEP_NUMBER := 1;\nEND_IF;'
    ].filter(Boolean).join('\n')

    const step2Code = [
      ruleRegisterOpt ? '// Tối ưu thanh ghi D Mitsubishi\nSERVO_TARGET_X := D1000;\nSERVO_TARGET_Y := D1002;\nSERVO_TARGET_Z := D1004;' : 'SERVO_TARGET_X := 150.0;\nSERVO_TARGET_Y := 280.0;\nSERVO_TARGET_Z := 50.0;',
      'IF AUTO_MODE AND STEP_NUMBER = 2 THEN\n  SERVO_START := TRUE;\n  IF SERVO_IN_POSITION THEN\n    STEP_NUMBER := 3;\n  END_IF;\nEND_IF;'
    ].join('\n')

    return {
      start: {
        id: 'start',
        label: '▶ Auto Start',
        address: 'M70',
        description: 'Khởi động chế độ tự động vận hành (Automatic mode trigger).',
        stCode: startCode,
      },
      step1: {
        id: 'step1',
        label: '① Work Grip',
        address: 'M71 / Y40',
        description: 'Kích hoạt xi-lanh kẹp phôi vật liệu (Workpiece gripping cylinder).',
        stCode: 'IF AUTO_MODE AND STEP_NUMBER = 1 THEN\n  GRIP_CYLINDER_OUT := TRUE;\n  IF GRIP_LIMIT_SWITCH THEN\n    STEP_NUMBER := 2;\n  END_IF;\nEND_IF;',
      },
      step2: {
        id: 'step2',
        label: '② Move to Inspect',
        address: 'M72 / Axis 1-3',
        description: 'Điều khiển 3 trục Servo di chuyển phôi vào tâm đo quét (Move to inspection position).',
        stCode: step2Code,
      },
      step3: {
        id: 'step3',
        label: '③ 3D Dimension Scan',
        address: 'M73 / Y50',
        description: 'Kích hoạt cảm biến laser đo quét 3D kích thước (Trigger 3D scan).',
        stCode: 'IF AUTO_MODE AND STEP_NUMBER = 3 THEN\n  LASER_SCAN_TRIGGER := TRUE;\n  IF SCAN_COMPLETE THEN\n    STEP_NUMBER := 4;\n  END_IF;\nEND_IF;',
      },
      step4: {
        id: 'step4',
        label: '④ AI Judgment',
        address: 'M74 / Branch',
        description: 'Phân tích dữ liệu đo quét bằng thuật toán kiểm định chất lượng (AI classification analysis).',
        stCode: 'IF AUTO_MODE AND STEP_NUMBER = 4 THEN\n  AI_RUN_INFERENCE := TRUE;\n  IF AI_RESULT_READY THEN\n    IF AI_RESULT_OK THEN\n      STEP_NUMBER := 5; // Go to OK discharge\n    ELSE\n      STEP_NUMBER := 6; // Go to NG recycle\n    END_IF;\n  END_IF;\nEND_IF;',
      },
      step5a: {
        id: 'step5a',
        label: '⑤a Discharge OK',
        address: 'M75 / Y60',
        description: 'Đẩy phôi đạt chuẩn ra băng tải thành phẩm (Discharge OK product).',
        stCode: 'IF AUTO_MODE AND STEP_NUMBER = 5 THEN\n  DISCHARGE_OK_GATE := TRUE;\n  IF GATE_OPEN_LIMIT THEN\n    STEP_NUMBER := 7; // Done\n  END_IF;\nEND_IF;',
      },
      step6: {
        id: 'step6',
        label: '⑤b NG Retry/Recycle',
        address: 'M76 / Y61',
        description: 'Đẩy phôi lỗi vào khay xử lý lại (Recycle and tag defect).',
        stCode: 'IF AUTO_MODE AND STEP_NUMBER = 6 THEN\n  DISCHARGE_NG_GATE := TRUE;\n  REJECT_COUNT := REJECT_COUNT + 1;\n  IF NG_GATE_LIMIT THEN\n    STEP_NUMBER := 7; // Done\n  END_IF;\nEND_IF;',
      },
    }
  }

  const nodes = getDynamicNodes()

  const handleCopy = () => {
    navigator.clipboard.writeText(nodes[selectedNode].stCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nodeCls = (id: string) =>
    `flow-node transition-all duration-300 cursor-pointer ${
      selectedNode === id
        ? 'fill-brand-500/10 stroke-brand-500 stroke-2.5 font-bold shadow-md shadow-brand-500/20'
        : 'fill-white stroke-slate-350 stroke-1 hover:stroke-brand-500'
    }`

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 border border-slate-200 rounded-2xl overflow-hidden shadow-card">
      {/* Editor Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 p-3 bg-slate-50 font-mono">
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'flow' ? 'bg-brand-500 text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('post.flow.tabFlow')}</span>
          </button>
          <button
            onClick={() => setActiveTab('st')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'st' ? 'bg-brand-500 text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Structured Text (ST)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'st' ? (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-xl text-slate-600 transition cursor-pointer shadow-3xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600 animate-pulse" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          ) : (
            <button className="flex items-center gap-1.5 text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-xl text-slate-600 transition cursor-pointer shadow-3xs">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Auto Layout</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'flow' ? (
          <div className="flex-1 overflow-auto p-4 bg-slate-50/30 flow-canvas min-h-[300px] border-b border-slate-200">
            <svg viewBox="0 0 720 460" className="w-full h-auto min-w-[640px]">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-450" />
                </marker>
                <marker
                  id="arrow-yes"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" className="fill-green-600" />
                </marker>
                <marker
                  id="arrow-no"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" className="fill-red-500" />
                </marker>
              </defs>

              <g className={nodeCls('start')} onClick={() => setSelectedNode('start')}>
                <rect x="290" y="10" width="140" height="32" rx="16" />
                <text x="360" y="30" textAnchor="middle" className="text-xs font-semibold fill-slate-600 font-mono">
                  ▶ Auto Start
                </text>
              </g>
              <line x1="360" y1="42" x2="360" y2="60" className="stroke-slate-400 stroke-1.5" markerEnd="url(#arrow)" />

              {/* Step 1 */}
              <g className={nodeCls('step1')} onClick={() => setSelectedNode('step1')}>
                <rect x="280" y="60" width="160" height="42" rx="4" />
                <text x="360" y="78" textAnchor="middle" className="text-xs font-bold fill-slate-800">
                  ① Workpiece Grip
                </text>
                <text x="360" y="93" textAnchor="middle" className="text-[9px] font-mono fill-brand-600 font-bold">
                  M71 / Y40 (Output)
                </text>
              </g>
              <line x1="360" y1="102" x2="360" y2="120" className="stroke-slate-400 stroke-1.5" markerEnd="url(#arrow)" />

              {/* Step 2 */}
              <g className={nodeCls('step2')} onClick={() => setSelectedNode('step2')}>
                <rect x="280" y="120" width="160" height="42" rx="4" />
                <text x="360" y="138" textAnchor="middle" className="text-xs font-bold fill-slate-800">
                  ② Move to Inspection
                </text>
                <text x="360" y="153" textAnchor="middle" className="text-[9px] font-mono fill-brand-600 font-bold">
                  M72 / Axis 1+2+3
                </text>
              </g>
              <line x1="360" y1="162" x2="360" y2="180" className="stroke-slate-400 stroke-1.5" markerEnd="url(#arrow)" />

              {/* Step 3 */}
              <g className={nodeCls('step3')} onClick={() => setSelectedNode('step3')}>
                <rect x="280" y="180" width="160" height="42" rx="4" />
                <text x="360" y="198" textAnchor="middle" className="text-xs font-bold fill-slate-800">
                  ③ 3D Laser Scan
                </text>
                <text x="360" y="213" textAnchor="middle" className="text-[9px] font-mono fill-brand-600 font-bold">
                  M73 / Trigger Y50
                </text>
              </g>
              <line x1="360" y1="222" x2="360" y2="240" className="stroke-slate-400 stroke-1.5" markerEnd="url(#arrow)" />

              {/* Step 4 Decision */}
              <g className={nodeCls('step4')} onClick={() => setSelectedNode('step4')}>
                <polygon points="360,240 470,290 360,340 250,290" />
                <text x="360" y="285" textAnchor="middle" className="text-xs font-bold fill-slate-800">
                  ④ AI Classify
                </text>
                <text x="360" y="299" textAnchor="middle" className="text-[9px] font-mono fill-brand-600 font-bold">
                  M74 / inference
                </text>
              </g>

              {/* Decision Branches */}
              <path d="M 470 290 L 530 290 L 530 360" className="stroke-green-600 stroke-1.5 fill-none animate-pulse" markerEnd="url(#arrow-yes)" />
              <text x="495" y="283" className="text-[10px] font-bold fill-green-600 font-mono">
                OK
              </text>

              <path d="M 250 290 L 190 290 L 190 360" className="stroke-red-500 stroke-1.5 fill-none" markerEnd="url(#arrow-no)" />
              <text x="220" y="283" className="text-[10px] font-bold fill-red-500 font-mono">
                NG
              </text>

              {/* Step 5a Discharge */}
              <g className={nodeCls('step5a')} onClick={() => setSelectedNode('step5a')}>
                <rect x="455" y="360" width="150" height="42" rx="4" />
                <text x="530" y="378" textAnchor="middle" className="text-xs font-bold fill-slate-800">
                  ⑤a Discharge OK Product
                </text>
                <text x="530" y="393" textAnchor="middle" className="text-[9px] font-mono fill-brand-600 font-bold">
                  M75 / Valve Y60
                </text>
              </g>

              {/* Step 6 Discharge NG */}
              <g className={nodeCls('step6')} onClick={() => setSelectedNode('step6')}>
                <rect x="115" y="360" width="150" height="42" rx="4" />
                <text x="190" y="378" textAnchor="middle" className="text-xs font-bold fill-slate-800">
                  ⑤b Recycle & Tag
                </text>
                <text x="190" y="393" textAnchor="middle" className="text-[9px] font-mono fill-brand-600 font-bold">
                  M76 / Alarm Y61
                </text>
              </g>
            </svg>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50 border-b border-slate-200">
            {/* Grounding banner */}
            <div className="bg-indigo-50 border-b border-indigo-200 px-3 py-2 text-[11px] text-indigo-800 flex items-center justify-between font-sans shrink-0 select-none">
              <div className="flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>
                  {t('post.flow.applyKnowledge')}
                  {ruleInterlock && <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 border border-indigo-200 rounded text-[9.5px]">{t('post.flow.presetSafety')}</span>}
                  {ruleServoInit && <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 border border-indigo-200 rounded text-[9.5px]">{t('post.flow.presetServo')}</span>}
                  {ruleRegisterOpt && <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 border border-indigo-200 rounded text-[9.5px]">{t('post.flow.presetReg')}</span>}
                  {!ruleInterlock && !ruleServoInit && !ruleRegisterOpt && <span className="ml-1 text-slate-500">{t('post.flow.presetDefault')}</span>}
                </span>
              </div>
              <span className="text-[8.5px] bg-indigo-500/10 border border-indigo-300/50 px-2 py-0.5 rounded font-mono font-bold text-indigo-700">
                Core Rules Compiled
              </span>
            </div>

            <div className="flex-1 overflow-auto p-4 flex flex-col font-mono text-sm leading-relaxed max-h-[300px]">
              <div className="flex-1 text-slate-700 overflow-y-auto whitespace-pre p-2 rounded-lg bg-white border border-slate-200">
                {nodes[selectedNode].stCode.split('\n').map((line, idx) => (
                  <div key={idx} className="flex hover:bg-slate-50 px-2 py-0.5 rounded">
                    <span className="w-8 shrink-0 text-slate-400 text-xs text-right pr-3 select-none">{idx + 1}</span>
                    <span className="text-teal-600 font-semibold">
                      {line.includes('IF') || line.includes('THEN') || line.includes('END_IF') || line.includes('ELSE')
                        ? line.split(' ').map((w, wi) => (
                            <span key={wi}>
                              {w === 'IF' || w === 'THEN' || w === 'END_IF' || w === 'ELSE' || w === 'AND' || w === 'OR' || w === 'NOT' ? (
                                <span className="text-brand-600">{w} </span>
                              ) : (
                                <span>{w} </span>
                              )}
                            </span>
                          ))
                        : line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Node Details Panel */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex-none space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              {nodes[selectedNode].label}
            </h5>
            <span className="text-[10px] font-mono bg-brand-500/10 text-brand-700 border border-brand-500/20 px-2 py-0.5 rounded font-semibold ml-auto">
              Address: {nodes[selectedNode].address}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{nodes[selectedNode].description}</p>
        </div>
      </div>
    </div>
  )
}
