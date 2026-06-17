import MarkdownLite from '@/components/MarkdownLite'

// Phân tách slide trong nội dung đề án (deck). buildOutputMarkdown('deck') nối các slide bằng delimiter này.
export const SLIDE_DELIM = '%%SLIDE%%'

/** Render đề án dạng slide: mỗi slide là 1 thẻ khung 16:9, slide đầu (bìa) làm nổi bằng nền brand. */
export default function DeckView({ content }: { content: string }) {
  const slides = content.split(SLIDE_DELIM).map(s => s.trim()).filter(Boolean)
  if (!slides.length) return null
  return (
    <div className="space-y-3">
      {slides.map((s, i) => {
        const cover = i === 0
        return (
          <div
            key={i}
            className={`relative rounded-xl border shadow-3xs overflow-hidden ${
              cover ? 'border-brand-300 bg-gradient-to-br from-brand-500/8 to-white' : 'border-slate-200 bg-white'
            }`}
          >
            <span className="absolute top-2 right-3 z-10 text-[9px] font-mono font-bold text-slate-300">{i + 1} / {slides.length}</span>
            <div className={`aspect-[16/9] overflow-auto p-6 prose prose-sm prose-slate max-w-none ${cover ? 'flex flex-col justify-center' : ''}`}>
              <MarkdownLite text={s} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
