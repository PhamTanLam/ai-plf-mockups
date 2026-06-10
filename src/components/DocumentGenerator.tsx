import { useState, useEffect } from 'react'
import { FileText, FileSpreadsheet, Sparkles, Printer, Download, CheckCircle } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

interface DocumentGeneratorProps {
  projectId: string
  onProgressChange?: (progress: number) => void
}

export default function DocumentGenerator({ projectId, onProgressChange }: DocumentGeneratorProps) {
  const { t, locale } = useI18n()
  const [docType, setDocType] = useState<'manual' | 'protocol'>('manual')
  const [tpScreenInfo, setTpScreenInfo] = useState('')
  const [testResult, setTestResult] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDoc, setGeneratedDoc] = useState<string>('')

  // Sync inputs with locale default values and load saved document if any
  useEffect(() => {
    setTpScreenInfo(t('post.doc.defaultTp'))
    setTestResult(t('post.doc.defaultResult'))
    
    const key = docType === 'manual'
      ? `aiplf.generated_manual.${projectId}`
      : `aiplf.generated_protocol.${projectId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      setGeneratedDoc(stored)
    } else {
      setGeneratedDoc('')
    }
  }, [locale, t, docType, projectId])

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(generatedDoc ? 100 : 20)
    }
  }, [generatedDoc, onProgressChange])

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      let finalDoc = ''
      if (docType === 'manual') {
        const title = t('post.doc.templateManualTitle')
        const body = t('post.doc.templateManualBody')
        const sourceDesc = t('post.doc.templateManualSourceDesc')
        finalDoc = `${title}\n\n${body}\n\n${sourceDesc} ${tpScreenInfo}`
        localStorage.setItem(`aiplf.generated_manual.${projectId}`, finalDoc)
      } else {
        const title = t('post.doc.templateProtocolTitle')
        const body = t('post.doc.templateProtocolBody')
        const sourceDesc = t('post.doc.templateProtocolSourceDesc')
        finalDoc = `${title}\n\n${body}\n\n${sourceDesc} ${testResult}`
        localStorage.setItem(`aiplf.generated_protocol.${projectId}`, finalDoc)
      }
      setGeneratedDoc(finalDoc)
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 text-slate-700 shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-850 uppercase tracking-wider">{t('post.doc.title')}</h4>
          <p className="text-[10px] text-slate-450">{t('post.doc.subtitle')}</p>
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
          <span className="text-xs">{t('post.doc.tabManual')}</span>
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
          <span className="text-xs">{t('post.doc.tabProtocol')}</span>
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        {docType === 'manual' ? (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">{t('post.doc.labelTp')}</label>
            <textarea
              rows={2}
              value={tpScreenInfo}
              onChange={(e) => setTpScreenInfo(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-250 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-800"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">{t('post.doc.labelResult')}</label>
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
          <span>{isGenerating ? t('post.doc.generating') : t('post.doc.generate')}</span>
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
