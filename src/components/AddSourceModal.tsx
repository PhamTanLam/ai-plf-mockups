import { useRef, useState } from 'react'
import { Upload, Clipboard, ArrowLeft, X, Download as DownloadIcon } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

/** AddSourceModal — thêm nguồn kiểu NotebookLM: kéo-thả/tải tệp + dán văn bản. Không web/Drive. */
export default function AddSourceModal({ open, onClose, onAddFiles, onAddText }: {
  open: boolean
  onClose: () => void
  onAddFiles: (files: { name: string; size: number }[]) => void
  onAddText: (text: string) => void
}) {
  const { t } = useI18n()
  const [paste, setPaste] = useState(false)
  const [text, setText] = useState('')
  const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const pickFiles = () => fileRef.current?.click()
  const handleFiles = (list: FileList | null) => {
    const files = Array.from(list || []).map(f => ({ name: f.name, size: f.size }))
    if (files.length) { onAddFiles(files); reset() }
  }
  const reset = () => { setPaste(false); setText(''); setDrag(false) }
  const close = () => { reset(); onClose() }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={e => { if (e.target === e.currentTarget) close() }}>
      <input ref={fileRef} type="file" multiple className="hidden" onChange={e => { handleFiles(e.target.files); e.target.value = '' }} />
      <div className="bg-white rounded-2xl w-full max-w-[560px] shadow-pop overflow-hidden">
        {!paste ? (
          <>
            <div className="flex items-center px-5 py-3.5 border-b border-slate-200"><strong className="text-sm text-slate-800">{t('ws.panel.addSource')}</strong><button onClick={close} className="ml-auto text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button></div>
            <div className="p-5">
              <div
                onClick={pickFiles}
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
                className={`border-2 border-dashed rounded-2xl py-9 px-4 text-center cursor-pointer transition ${drag ? 'border-brand-500 bg-white' : 'border-slate-200 bg-slate-50 hover:border-brand-200'}`}>
                <DownloadIcon className="w-7 h-7 mx-auto text-brand-500" />
                <div className="text-[15px] font-semibold text-slate-700 mt-2.5">{t('ws.add.dropTitle')}</div>
                <div className="text-[11px] text-slate-400 mt-1">{t('ws.add.dropHint')}</div>
              </div>
              <div className="flex justify-center gap-2.5 mt-4">
                <button onClick={pickFiles} className="inline-flex items-center gap-2 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"><Upload className="w-4 h-4" />{t('ws.add.upload')}</button>
                <button onClick={() => { setPaste(true); setText('') }} className="inline-flex items-center gap-2 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"><Clipboard className="w-4 h-4" />{t('ws.add.pasteBtn')}</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200">
              <button onClick={() => setPaste(false)} className="text-slate-500 hover:text-slate-800 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
              <strong className="text-sm text-slate-800">{t('ws.add.pasteTitle')}</strong>
              <button onClick={close} className="ml-auto text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              <p className="text-xs text-slate-500 mb-3">{t('ws.add.pasteDesc')}</p>
              <textarea autoFocus value={text} onChange={e => setText(e.target.value)} placeholder={t('ws.add.pastePlaceholder')} className="w-full min-h-[210px] border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:border-brand-500 resize-y" />
              <div className="flex justify-end mt-3.5">
                <button disabled={!text.trim()} onClick={() => { onAddText(text.trim()); reset() }} className="px-5 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-full cursor-pointer">{t('ws.add.insert')}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
