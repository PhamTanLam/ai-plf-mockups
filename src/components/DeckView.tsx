import MarkdownLite from '@/components/MarkdownLite'

// Phân tách slide trong nội dung đề án (deck). buildOutputMarkdown('deck') nối các slide bằng delimiter này.
export const SLIDE_DELIM = '%%SLIDE%%'

/** Tách dòng "# Title" làm tiêu đề + phần thân còn lại của một slide. */
function splitSlide(raw: string) {
  const lines = raw.split('\n')
  const ti = lines.findIndex(l => /^#\s+/.test(l))
  const title = ti >= 0 ? lines[ti].replace(/^#\s+/, '').trim() : ''
  const body = (ti >= 0 ? [...lines.slice(0, ti), ...lines.slice(ti + 1)] : lines).join('\n').trim()
  return { title, body }
}

/** Render đề án dạng slide — style cơ bản, trung tính (đề án là sản phẩm của khách, không gắn brand). */
export default function DeckView({ content }: { content: string }) {
  const slides = content.split(SLIDE_DELIM).map(s => s.trim()).filter(Boolean)
  if (!slides.length) return null
  return (
    <div className="space-y-4">
      {slides.map((raw, i) => {
        const { title, body } = splitSlide(raw)
        const cover = i === 0
        return (
          <div key={i} className="rounded-lg border border-slate-300 bg-slate-100 p-1.5 shadow-sm">
            <div className="deck-slide aspect-[16/9] bg-white flex flex-col overflow-hidden">
              {cover ? (
                // Bìa: tiêu đề + phụ đề căn giữa, tối giản
                <div className="flex-1 flex flex-col items-center justify-center gap-3 px-10 text-center">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{title}</h2>
                  <div className="w-12 h-0.5 bg-slate-300 rounded-full" />
                  {body && (
                    <div className="prose prose-sm prose-slate max-w-none text-center [&_*]:text-center">
                      <MarkdownLite text={body} />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Nội dung: tiêu đề trên cùng, gạch chân nhạt */}
                  <div className="shrink-0 px-8 pt-5 pb-3 border-b border-slate-200">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{title}</h3>
                  </div>
                  <div className="deck-scroll flex-1 overflow-auto px-8 py-5">
                    <div className="prose prose-sm prose-slate max-w-none text-slate-800">
                      <MarkdownLite text={body} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
