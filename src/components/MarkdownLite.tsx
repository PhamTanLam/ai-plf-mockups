/**
 * MarkdownLite — render markdown rút gọn (heading/list/đậm/nghiêng/code + BẢNG GFM + <br> trong ô).
 * Port từ mdLite/fmtInline/esc của mockup standalone. Input là chuỗi do app tự sinh → an toàn.
 */

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmtInline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
}

function mdToHtml(text: string): string {
  const lines = esc(String(text)).split(/\r?\n/)
  const sepRe = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/
  const rowCells = (ln: string) => ln.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim())
  const cell = (s: string) => fmtInline(s.replace(/&lt;br\s*\/?&gt;/gi, '<br>'))
  let html = ''
  let list: 'ol' | 'ul' | null = null
  const close = () => { if (list) { html += '</' + list + '>'; list = null } }
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    // bảng GFM
    if (raw.indexOf('|') >= 0 && i + 1 < lines.length && sepRe.test(lines[i + 1])) {
      close()
      const headers = rowCells(raw)
      const aligns = rowCells(lines[i + 1]).map(s => { const l = s.startsWith(':'); const r = s.endsWith(':'); return (l && r) ? 'center' : (r ? 'right' : (l ? 'left' : '')) })
      let t = '<div class="ml-table"><table><thead><tr>'
      headers.forEach((h, ci) => { t += `<th${aligns[ci] ? ` style="text-align:${aligns[ci]}"` : ''}>${cell(h)}</th>` })
      t += '</tr></thead><tbody>'
      i += 2
      for (; i < lines.length && lines[i].indexOf('|') >= 0 && lines[i].trim() !== ''; i++) {
        const cs = rowCells(lines[i])
        t += '<tr>' + headers.map((_, ci) => `<td${aligns[ci] ? ` style="text-align:${aligns[ci]}"` : ''}>${cell(cs[ci] || '')}</td>`).join('') + '</tr>'
      }
      i--
      html += t + '</tbody></table></div>'
      continue
    }
    // heading
    const hm = raw.match(/^\s{0,3}(#{1,6})\s+(.*)$/)
    if (hm) {
      close()
      const lvl = Math.min(4, hm[1].length)
      html += `<h${lvl} class="ml-h">${cell(hm[2])}</h${lvl}>`
      continue
    }
    const ol = raw.match(/^\s*\d+[.)]\s+(.*)$/)
    const ul = raw.match(/^\s*[-*•]\s+(.*)$/)
    if (ol) { if (list !== 'ol') { close(); html += '<ol>'; list = 'ol' } html += '<li>' + cell(ol[1]) + '</li>'; continue }
    if (ul) { if (list !== 'ul') { close(); html += '<ul>'; list = 'ul' } html += '<li>' + cell(ul[1]) + '</li>'; continue }
    close()
    html += raw.trim() === '' ? '<br>' : cell(raw) + '<br>'
  }
  close()
  return html.replace(/(<br>\s*)+$/, '')
}

export default function MarkdownLite({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div
      className={`ml-body text-sm leading-relaxed text-slate-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: mdToHtml(text) }}
    />
  )
}
