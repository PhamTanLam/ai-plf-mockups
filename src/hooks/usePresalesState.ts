import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * usePresalesState — "bộ nhớ AI" cho nghiệp vụ NV1 (Input + Q&A). MÔ PHỎNG, dữ liệu GIẢ ĐỊNH.
 * KHÔNG hiển thị bảng dữ liệu trên UI: dữ liệu là bộ nhớ ngầm; thêm nguồn/chat → AI tự ghi nhận;
 * cần thì hỏi AI "tóm tắt/xem dữ liệu". Dùng để sinh các đầu ra. Lưu localStorage theo case.
 */

export interface ProjectField { id: string; name: string; value: string }
export interface SavedOutput { oid: string; toolId?: string; kind: 'gen' | 'note'; title: string; ts: number; content: string }
export interface OutputDef { id: string; icon: string; name: string }
export interface RoundLog { n: number; ts: number; fields: number; outputs: number }  // 1 vòng pre-sales đã hoàn thành

// "Pool kiến thức" để AI (mô phỏng) tự ghi nhận thông tin theo nội dung nguồn/chat.
const FIELD_CATALOG: { name: string; kw: RegExp; sample: string }[] = [
  { name: 'Bối cảnh dự án', kw: /khách hàng|end-?user|người dùng cuối|thời hạn|bàn giao|deadline/i, sample: 'Khách hàng A · 2026/09' },
  { name: 'Tóm tắt hoạt động thiết bị', kw: /dây chuyền|lắp ráp|kiểm tra|hàn|cấp phôi|hoạt động|quy trình/i, sample: 'Dây chuyền lắp ráp & kiểm tra' },
  { name: 'Thiết bị điều khiển', kw: /servo|\bplc\b|mitsubishi|\biai\b|mr-?j5|iq-?r|điều khiển/i, sample: 'Servo ×6 · CC-LINK' },
  { name: 'Cấu hình mạng', kw: /cc-?link|ethernet|io-?link|ethercat|profinet|mạng/i, sample: 'CC-LINK IE Field' },
  { name: 'Số chủng loại sản phẩm', kw: /chủng loại|biến thể|model|variant/i, sample: '3 chủng loại' },
  { name: 'Phạm vi phụ trách', kw: /phạm vi|cơ khí|phần mềm|hạng mục phụ trách/i, sample: 'Điện + phần mềm' },
  { name: 'Thiết bị liên động ngoài', kw: /liên động|băng tải|robot|conveyor|interlock/i, sample: '2 băng tải' },
  { name: 'Thông số an toàn', kw: /an toàn|iso\s?\d+|pl\s?[a-e]\b|safety|pilz|e-?stop/i, sample: 'ISO 10218-1' },
  { name: 'Yêu cầu đặc biệt của khách', kw: /yêu cầu đặc biệt|yêu cầu riêng|đặc thù/i, sample: 'Có' },
  { name: 'Địa điểm debug / chạy thử', kw: /debug|chạy thử|hiện trường|nghiệm thu|nhà máy|xưởng/i, sample: 'Nhà máy A' },
  { name: 'Người phụ trách (cơ/điện/PM)', kw: /người phụ trách|phụ trách|\bpm\b|kỹ sư|owner/i, sample: 'Anh B (điện)' },
  { name: 'Nhịp sản xuất (takt)', kw: /takt|nhịp sản xuất|giây\/|sp\/giờ|cycle/i, sample: '35 giây/cái' },
  { name: 'Màu sơn tủ điện', kw: /màu sơn|ral\s?\d+|\bsơn\b/i, sample: 'RAL 7035' },
  { name: 'Điện áp nguồn cấp', kw: /điện áp|\b\d{3}\s?v\b|3 pha|380v|220v|50\s?hz/i, sample: '3 pha 380V/50Hz' },
  { name: 'Yêu cầu bảo hành', kw: /bảo hành|warranty|\b\d+\s?tháng/i, sample: '18 tháng' },
  { name: 'Chứng nhận / tiêu chuẩn', kw: /\bce\b|chứng nhận|\bul\b|iso\s?9001|tiêu chuẩn/i, sample: 'CE' },
  { name: 'Cấp độ phòng sạch', kw: /phòng sạch|clean\s?room|iso\s?class|class\s?\d/i, sample: 'ISO Class 7' },
]

export const OUTPUTS: OutputDef[] = [
  { id: 'doc', icon: '📄', name: 'Nội dung tài liệu dự toán' },
  { id: 'config', icon: '🧩', name: 'Cấu thành đơn giản' },
  { id: 'estimate', icon: '💴', name: 'Dự toán khái quát' },
  { id: 'schedule', icon: '🗓️', name: 'Lịch trình khái quát' },
  { id: 'proposal', icon: '📝', name: 'Tài liệu nền đề xuất' },
]

// Case demo: seed sẵn "bộ nhớ" giả (dự án đang làm dở) để sinh đầu ra có dữ liệu; dự án mới bắt đầu trống.
const DEMO_CASE_IDS = new Set(['CASE-2026-0245', 'CASE-2026-0312', 'CASE-2026-0345', 'CASE-2026-0288'])
const DEMO_FIELDS: { name: string; value: string }[] = [
  { name: 'Bối cảnh dự án', value: 'Khách hàng A · end-user X · 2026/09' },
  { name: 'Tóm tắt hoạt động thiết bị', value: 'Dây chuyền lắp ráp & kiểm tra' },
  { name: 'Thiết bị điều khiển', value: 'Servo ×6 · CC-LINK' },
  { name: 'Cấu hình mạng', value: 'CC-LINK IE Field' },
  { name: 'Số chủng loại sản phẩm', value: '3 chủng loại' },
  { name: 'Phạm vi phụ trách', value: 'Điện + phần mềm' },
  { name: 'Thông số an toàn', value: 'ISO 10218-1' },
  { name: 'Nhịp sản xuất (takt)', value: '35 giây/cái' },
]

function buildOutputMarkdown(id: string, fields: ProjectField[]): string {
  const get = (kw: RegExp) => fields.find(f => kw.test(f.name))?.value || '(chưa có)'
  const list = fields.length ? fields.map(f => `- ${f.name}: ${f.value}`).join('\n') : '- (chưa có dữ liệu)'
  const head = `# ${OUTPUTS.find(o => o.id === id)?.name}\n\n> Bản nháp sinh tự động từ thông tin đã ghi nhận — cần kỹ sư rà soát.\n`
  switch (id) {
    case 'doc': return head + `\n## Tóm tắt kỹ thuật\n${list}\n`
    case 'config': return head + `\n## Cấu thành hệ thống (đơn giản)\n- Điều khiển: ${get(/điều khiển/i)}\n- Mạng: ${get(/mạng/i)}\n- Liên động: ${get(/liên động/i)}\n- Chủng loại: ${get(/chủng loại/i)}\n`
    case 'estimate': return head + `\n## Dự toán khái quát (ước tính)\n\n| Hạng mục | Ước tính |\n| :--- | ---: |\n| Thiết kế điện & phần mềm | ¥3.2M |\n| Vật tư điều khiển | ¥4.1M |\n| Lắp đặt & debug | ¥2.0M |\n| Tổng | ¥9.3M |\n\n- Thời gian ~16 tuần · Độ tin cậy 75%.\n`
    case 'schedule': return head + `\n## Lịch trình khái quát\n\n| Pha | Nội dung | Thời lượng |\n| :--- | :--- | :---: |\n| 1. Thiết kế | Bản vẽ điện, kiến trúc PM | 8 tuần |\n| 2. Chế tạo | Tủ điện, lập trình PLC/HMI | 6 tuần |\n| 3. Lắp đặt & Debug | takt ${get(/takt/i)} | 4 tuần |\n| 4. Bàn giao | Nghiệm thu | 2 tuần |\n`
    case 'proposal': return head + `\n## Tài liệu nền đề xuất\nBối cảnh: ${get(/bối cảnh/i)}.\n\nMục tiêu: tự động hoá ${get(/hoạt động/i)}, takt ${get(/takt/i)}.\n\nPhạm vi: ${get(/phạm vi/i)}.\n\nAn toàn: ${get(/an toàn/i)}.\n`
    default: return head + '\n' + list
  }
}

interface PersistShape { fields: ProjectField[]; savedOutputs: SavedOutput[]; round: number; rounds: RoundLog[] }
const genId = () => 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const oid = () => 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

function loadCase(key: string, caseId: string): PersistShape {
  try {
    const raw = localStorage.getItem(key)
    if (raw) { const st = JSON.parse(raw) as PersistShape; return { fields: st.fields || [], savedOutputs: st.savedOutputs || [], round: st.round || 1, rounds: st.rounds || [] } }
  } catch { /* ignore */ }
  const demo = DEMO_CASE_IDS.has(caseId)
  return { fields: demo ? DEMO_FIELDS.map(f => ({ id: genId(), ...f })) : [], savedOutputs: [], round: demo ? 2 : 1, rounds: demo ? [{ n: 1, ts: Date.now() - 86400000, fields: 6, outputs: 1 }] : [] }
}

export interface PresalesApi {
  fields: ProjectField[]
  total: number
  progressPct: number
  outputs: OutputDef[]
  savedOutputs: SavedOutput[]
  round: number
  rounds: RoundLog[]
  newRound: () => void
  addField: (name: string, value: string) => void
  rememberFromContent: (text?: string) => string[]  // AI tự ghi nhận; trả về tên các trường vừa thêm
  summaryText: () => string                          // tóm tắt bộ nhớ (cho chat hiển thị)
  clearAll: () => void
  reExtract: (label: string) => { name: string; from: string; to: string }[]
  generate: (id: string) => SavedOutput | null
  saveAnswerNote: (title: string, content: string) => void
  renameOutput: (oid: string, title: string) => void
  deleteOutput: (oid: string) => void
  downloadOutput: (oid: string) => void
}

export function usePresalesState(caseId: string): PresalesApi {
  const KEY = `aiplf.presales.${caseId || 'default'}`
  const init = loadCase(KEY, caseId)
  const [fields, setFields] = useState<ProjectField[]>(init.fields)
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>(init.savedOutputs)
  const [round, setRound] = useState<number>(init.round)
  const [rounds, setRounds] = useState<RoundLog[]>(init.rounds)
  const curKey = useRef(KEY)

  useEffect(() => {
    if (curKey.current === KEY) return
    curKey.current = KEY
    const st = loadCase(KEY, caseId)
    setFields(st.fields); setSavedOutputs(st.savedOutputs); setRound(st.round); setRounds(st.rounds)
  }, [KEY, caseId])

  useEffect(() => {
    if (curKey.current !== KEY) return
    try { localStorage.setItem(KEY, JSON.stringify({ fields, savedOutputs, round, rounds } as PersistShape)) } catch { /* ignore */ }
  }, [KEY, fields, savedOutputs, round, rounds])

  const total = fields.length
  const progressPct = total ? Math.min(100, Math.round((total / 8) * 100)) : 0

  const addField = useCallback((name: string, value: string) => {
    const nm = name.trim(); if (!nm) return
    setFields(prev => {
      const i = prev.findIndex(f => f.name.toLowerCase() === nm.toLowerCase())
      const v = value.trim().slice(0, 120)
      if (i >= 0) { const c = prev.slice(); c[i] = { ...c[i], value: v }; return c }
      return [...prev, { id: genId(), name: nm.slice(0, 50), value: v }]
    })
  }, [])

  // AI (mô phỏng) tự ghi nhận trường theo nội dung; nếu không khớp & không có text thì lấy vài trường phổ biến.
  const rememberFromContent = useCallback((text?: string) => {
    const usedNames = new Set(fields.map(f => f.name))
    const avail = FIELD_CATALOG.filter(c => !usedNames.has(c.name))
    let picked = text ? avail.filter(c => c.kw.test(text)) : []
    if (!picked.length && !text) picked = avail.slice(0, 6)
    picked = picked.slice(0, 12)
    if (picked.length) setFields(prev => [...prev, ...picked.map(c => ({ id: genId(), name: c.name, value: c.sample }))])
    return picked.map(c => c.name)
  }, [fields])

  const summaryText = useCallback(() => {
    // Chat hiển thị dạng text thuần (không phải markdown) → dùng bullet gọn, không dùng ** hay -
    return fields.length ? fields.map(f => `• ${f.name}: ${f.value}`).join('\n') : '(chưa ghi nhận dữ liệu nào)'
  }, [fields])

  const clearAll = useCallback(() => setFields([]), [])

  // Bắt đầu vòng mới: chốt vòng hiện tại vào lịch sử rồi tăng số vòng (Nhập→Kiểm tra→Dự toán lặp lại)
  const newRound = useCallback(() => {
    setRounds(prev => [{ n: round, ts: Date.now(), fields: fields.length, outputs: savedOutputs.filter(o => o.kind === 'gen').length }, ...prev].slice(0, 50))
    setRound(r => r + 1)
  }, [round, fields, savedOutputs])

  const reExtract = useCallback((label: string) => {
    const first = fields.find(f => f.value)
    const diffs: { name: string; from: string; to: string }[] = []
    if (first) {
      const nv = first.value + ' (cập nhật theo ' + label + ')'
      diffs.push({ name: first.name, from: first.value, to: nv })
      setFields(prev => prev.map(f => f.id === first.id ? { ...f, value: nv } : f))
    }
    return diffs
  }, [fields])

  const generate = useCallback((id: string): SavedOutput | null => {
    const o = OUTPUTS.find(x => x.id === id); if (!o) return null
    const out: SavedOutput = { oid: oid(), toolId: id, kind: 'gen', title: o.name, ts: Date.now(), content: buildOutputMarkdown(id, fields) }
    setSavedOutputs(prev => [out, ...prev]); return out
  }, [fields])
  const saveAnswerNote = useCallback((title: string, content: string) => {
    setSavedOutputs(prev => [{ oid: oid(), kind: 'note', title: title.slice(0, 46) || 'Ghi chú từ chat', ts: Date.now(), content }, ...prev])
  }, [])
  const renameOutput = useCallback((id: string, title: string) => { const v = title.trim(); if (!v) return; setSavedOutputs(prev => prev.map(e => e.oid === id ? { ...e, title: v } : e)) }, [])
  const deleteOutput = useCallback((id: string) => setSavedOutputs(prev => prev.filter(e => e.oid !== id)), [])
  const downloadOutput = useCallback((id: string) => {
    const e = savedOutputs.find(x => x.oid === id); if (!e) return
    const blob = new Blob(['# ' + e.title + '\n\n' + (e.content || '')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = (e.title || 'output').replace(/[\\/:*?"<>|]+/g, '_').trim().slice(0, 60) + '.md'
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [savedOutputs])

  return {
    fields, total, progressPct, outputs: OUTPUTS, savedOutputs, round, rounds, newRound,
    addField, rememberFromContent, summaryText, clearAll, reExtract,
    generate, saveAnswerNote, renameOutput, deleteOutput, downloadOutput,
  }
}
