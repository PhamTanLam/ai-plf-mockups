import MarkdownLite from '@/components/MarkdownLite'
import logo from '@/assets/cowatech_logo.png'

// Phân tách slide trong nội dung đề án (deck). buildOutputMarkdown('deck') nối các slide bằng delimiter này.
export const SLIDE_DELIM = '%%SLIDE%%'

const CYAN = '#1AAEDF' // màu thanh tiêu đề chuẩn Cowatech

/** Tách dòng "# Title" làm tiêu đề + phần thân còn lại của một slide. */
function splitSlide(raw: string) {
  const lines = raw.split('\n')
  const ti = lines.findIndex(l => /^#\s+/.test(l))
  const title = ti >= 0 ? lines[ti].replace(/^#\s+/, '').trim() : ''
  const body = (ti >= 0 ? [...lines.slice(0, ti), ...lines.slice(ti + 1)] : lines).join('\n').trim()
  return { title, body }
}

/** Render đề án dạng slide theo style Cowatech: thanh tiêu đề cyan + logo, nền trắng. Slide đầu = bìa. */
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
            <div className="aspect-[16/9] bg-white flex flex-col overflow-hidden">
              {cover ? (
                <>
                  {/* Bìa: thanh cyan mảnh trên cùng + logo & tiêu đề căn giữa */}
                  <div className="h-[16%] shrink-0" style={{ backgroundColor: CYAN }} />
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
                    <img src={logo} alt="Cowatech" className="h-12 sm:h-14 object-contain mb-1" />
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">{title}</h2>
                    {body && (
                      <div className="prose prose-sm prose-slate max-w-none text-center [&_*]:text-center">
                        <MarkdownLite text={body} />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Nội dung: thanh tiêu đề cyan (chữ trắng, căn giữa) */}
                  <div className="shrink-0 px-6 py-3 flex items-center justify-center" style={{ backgroundColor: CYAN }}>
                    <h3 className="text-base sm:text-lg font-bold text-white text-center leading-snug">{title}</h3>
                  </div>
                  {/* Thân slide + logo nhỏ góc dưới phải */}
                  <div className="relative flex-1 overflow-auto px-8 py-5">
                    <div className="prose prose-sm prose-slate max-w-none text-slate-800">
                      <MarkdownLite text={body} />
                    </div>
                    <img src={logo} alt="Cowatech" className="absolute bottom-3 right-4 h-4 sm:h-5 object-contain opacity-90 pointer-events-none" />
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
