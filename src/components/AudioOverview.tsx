import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Volume2, Sparkles, Download, Disc } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

export default function AudioOverview(_props: { locale?: string }) {
  const { locale } = useI18n()
  const L = (vi: string, ja: string, en: string) => locale === 'ja' ? ja : locale === 'en' ? en : vi
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(30) // percentage
  const [currentTime, setCurrentTime] = useState(98) // in seconds (01:38)
  const duration = 312 // 05:12

  // Simulate progress when playing
  useEffect(() => {
    let interval: any
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          const nextTime = prev + 1
          setProgress(Math.floor((nextTime / duration) * 100))
          return nextTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Generate bar heights for audio visualizer
  const bars = [
    12, 24, 18, 30, 45, 28, 15, 36, 42, 50, 32, 22, 18, 25, 40, 48, 35, 20, 14, 28, 38,
    46, 52, 30, 18, 24, 35, 44, 40, 25, 15, 28, 48, 55, 38, 22, 16, 32, 45, 30, 18, 10
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-panel text-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600">
            <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-850">
              {L('Audio Tóm tắt AI (Podcast)', 'AI 音声サマリー (ポッドキャスト)', 'AI Audio Overview (Podcast)')}
            </h4>
            <p className="text-[10px] text-slate-450">
              {L('2 MC ảo đối thoại phân tích thông số PLC', '2人のAI司会者がPLC仕様を解説', 'Two AI hosts discussing the PLC design')}
            </p>
          </div>
        </div>

        <button className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Waveform visualizer */}
      <div className="h-16 flex items-center justify-between gap-0.5 px-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {bars.map((height, i) => {
          // Add some dynamic jitter to the heights if playing
          const jitter = isPlaying ? Math.sin(currentTime * 2 + i) * 8 : 0
          const finalHeight = Math.max(4, Math.min(60, height + jitter))
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-300"
              style={{
                height: `${finalHeight}px`,
                backgroundColor: i / bars.length <= progress / 100 ? '#0abab5' : '#e2e8f0',
              }}
            />
          )
        })}
      </div>

      {/* Audio controls */}
      <div className="space-y-3">
        {/* Scrubber */}
        <div className="space-y-1">
          <div className="relative w-full h-1 bg-slate-200 rounded-full cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-450 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setCurrentTime(0)
              setProgress(0)
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-95 text-white flex items-center justify-center shadow-md transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current text-white" /> : <Play className="w-5 h-5 fill-current text-white ml-0.5" />}
          </button>

          <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition cursor-pointer">
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Generate status banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          {L('Dữ liệu âm thanh đồng bộ theo spec mới nhất', '音声データは最新のソースに基づいています', 'Generated from current workspace documents')}
        </span>
        <button className="text-[10px] font-mono font-bold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer">
          {L('Tái tạo', '再生成', 'Regenerate')}
        </button>
      </div>
    </div>
  )
}
