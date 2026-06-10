import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Download, RefreshCw, FileText, Search, ArrowLeft
} from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

interface ProjectReentryProps {
  currentUser?: 'Linh' | 'Kanai' | 'AI'
  onProgressChange?: (progress: number) => void
  onAddLog?: (action: string) => void
}

/**
 * ProjectReentry — Nhật ký khảo sát & phát sinh (Bước 7).
 * KHÔNG nhồi sẵn nội dung mock: file chỉ tồn tại SAU KHI user ghi nhận khảo sát qua chat
 * (AI đề xuất → user gõ "update"/"đồng ý" → mới ghi). Ba trạng thái: rỗng → card gọn → xem đầy đủ.
 */
export default function ProjectReentry({ onProgressChange, onAddLog }: ProjectReentryProps) {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const STORAGE_KEY = `aiplf.project_reentry_text.${id || 'default'}`

  const [text, setText] = useState('')
  const [opened, setOpened] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Nạp từ localStorage — KHÔNG ghi mock mặc định
  useEffect(() => {
    let stored = localStorage.getItem(STORAGE_KEY) || ''
    // Dọn dữ liệu mock/log cũ từ phiên bản trước (trước khi áp luồng xác nhận trước khi ghi)
    if (/SPECS DISCREPANCIES|\[CẬP NHẬT /.test(stored)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(`aiplf.project_reentry_synced.${id || 'default'}`)
      stored = ''
    }
    setText(stored)
    onProgressChange?.(stored ? 100 : 0)
  }, [id, STORAGE_KEY])

  // Đồng bộ realtime khi chat ghi vào localStorage
  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(STORAGE_KEY) || ''
      setText(stored)
      onProgressChange?.(stored ? 100 : 0)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [STORAGE_KEY])

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
      const element = document.createElement('a')
      const file = new Blob([text], { type: 'text/plain;charset=utf-8' })
      element.href = URL.createObjectURL(file)
      element.download = 'khao_sat_thay_doi_specs.txt'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      onAddLog?.('Đã tải xuống tệp nhật ký: khao_sat_thay_doi_specs.txt')
    }, 1000)
  }

  const hasContent = text.trim().length > 0
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0
  const lineCount = text ? text.split('\n').length : 0
  const byteSize = text ? new Blob([text]).size : 0
  const formattedSize = (byteSize / 1024).toFixed(2) + ' KB'

  // ── TRẠNG THÁI 1: chưa có dữ liệu khảo sát → mời chat ──
  if (!hasContent) {
    return (
      <div className="bg-white border border-dashed border-slate-250 rounded-2xl p-10 text-center shadow-xs flex flex-col items-center justify-center min-h-[360px] max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 mb-4">
          <Search className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Chưa có nhật ký khảo sát</h4>
        <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
          Sau khi khảo sát hiện trường, hãy chat với AI để ghi nhận chênh lệch so với specs gốc
          (PLC, HMI, servo, an toàn…). AI sẽ đề xuất và <strong>hỏi xác nhận trước khi ghi</strong> vào nhật ký.
        </p>
        <p className="text-[11px] text-slate-400 mt-3 font-mono">→ Nhập yêu cầu ở khung chat bên phải để bắt đầu</p>
      </div>
    )
  }

  // ── TRẠNG THÁI 2: đã có dữ liệu, chưa mở → card gọn + nút Mở ──
  if (!opened) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-panel max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-800">{t('post.reentry.title')}</h4>
            <p className="text-[11px] text-slate-450 font-mono mt-0.5">khao_sat_thay_doi_specs.txt · {formattedSize} · {lineCount} dòng</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          {t('post.reentry.subtitle')} — AI đã ghi nhận từ chat. Mở để xem chi tiết hoặc tải về.
        </p>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setOpened(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Mở nhật ký khảo sát
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 disabled:opacity-50 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {t('ws.kickoff.download')}
          </button>
        </div>
      </div>
    )
  }

  // ── TRẠNG THÁI 3: mở — xem đầy đủ file ──
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-panel flex flex-col min-h-[500px]">
      <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setOpened(false)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
            title="Thu gọn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{t('post.reentry.title')}</h4>
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">khao_sat_thay_doi_specs.txt</span>
            </div>
            <p className="text-[10px] text-slate-450 mt-0.5">{t('post.reentry.subtitle')}</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 border border-slate-250 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
          title={t('post.reentry.downloadTitle')}
        >
          {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span>{isDownloading ? t('ws.kickoff.downloading') : t('ws.kickoff.download')}</span>
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto max-h-[500px] bg-slate-50/25 select-text">
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-line">
          {text}
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
        <div className="flex gap-4">
          <span>{t('ws.kickoff.size')} <strong>{formattedSize}</strong></span>
          <span>{t('ws.kickoff.lines')} <strong>{lineCount}</strong></span>
          <span>{t('ws.kickoff.words')} <strong>{wordCount}</strong></span>
        </div>
        <div className="flex items-center gap-1 text-slate-450">
          <span>{t('ws.kickoff.format')} <strong>Plain Text / MD</strong></span>
          <span className="mx-1">•</span>
          <span>{t('ws.kickoff.encoding')} <strong>UTF-8</strong></span>
        </div>
      </div>
    </div>
  )
}
