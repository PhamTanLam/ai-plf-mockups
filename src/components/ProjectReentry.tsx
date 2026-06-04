import { useState, useEffect } from 'react'
import { Check, Edit2, AlertCircle, RefreshCw, Plus, X } from 'lucide-react'

interface DiscrepancyItem {
  key: string
  name: string
  preValue: string
  postValue: string
  status: 'changed' | 'unchanged'
  note: string
  isConfirmed: boolean
  confirmedBy: 'Linh' | 'Kanai' | 'AI'
}

interface ProjectReentryProps {
  currentUser?: 'Linh' | 'Kanai' | 'AI'
  onProgressChange?: (progress: number) => void
  onAddLog?: (action: string) => void
}

export default function ProjectReentry({ currentUser = 'Linh', onProgressChange, onAddLog }: ProjectReentryProps) {
  const [items, setItems] = useState<DiscrepancyItem[]>([
    { key: 'plc', name: 'Dòng bộ điều khiển (PLC Model)', preValue: 'Melsec FX5U', postValue: 'Melsec Q03UDE', status: 'changed', note: 'Nâng cấp cấu hình theo yêu cầu của khách hàng.', isConfirmed: true, confirmedBy: 'Kanai' },
    { key: 'servos', name: 'Số lượng trục Servo (Servo Axes)', preValue: '3 Trục (A1, A2, A3)', postValue: '4 Trục (A1, A2, A3, A4)', status: 'changed', note: 'Bổ sung thêm 1 trục A4 cho tay gắp robot phụ.', isConfirmed: true, confirmedBy: 'Linh' },
    { key: 'safety', name: 'Tiêu chuẩn an toàn (Safety Standard)', preValue: 'ISO 13849 PLc', postValue: 'ISO 13849 PLd', status: 'changed', note: 'Yêu cầu đấu dây liên khóa tiếp điểm phụ NC của KA1.', isConfirmed: false, confirmedBy: 'AI' },
    { key: 'hmi', name: 'Màn hình cảm ứng (HMI Size)', preValue: 'GOT2000 7-inch', postValue: 'GOT2000 10-inch', status: 'changed', note: 'Tăng kích thước để hiển thị tốt hơn.', isConfirmed: false, confirmedBy: 'AI' },
    { key: 'maker', name: 'Hãng sản xuất (Maker Brand)', preValue: 'Mitsubishi', postValue: 'Mitsubishi', status: 'unchanged', note: 'Giữ nguyên thương hiệu tiêu chuẩn.', isConfirmed: true, confirmedBy: 'Kanai' },
  ])

  const [editKey, setEditKey] = useState<string | null>(null)
  const [newValue, setNewValue] = useState('')
  const [newNote, setNewNote] = useState('')

  // Form states for adding custom item
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPre, setCustomPre] = useState('')
  const [customPost, setCustomPost] = useState('')
  const [customNote, setCustomNote] = useState('')

  // Report progress changes back to parent
  useEffect(() => {
    if (onProgressChange) {
      const confirmedCount = items.filter(i => i.isConfirmed).length
      const progress = Math.round((confirmedCount / items.length) * 100)
      onProgressChange(progress)
    }
  }, [items, onProgressChange])

  const handleSave = (key: string) => {
    setItems(items.map(item => {
      if (item.key === key) {
        if (onAddLog) {
          onAddLog(`Đã cập nhật thông số '${item.name}' thành '${newValue}'`)
        }
        return {
          ...item,
          postValue: newValue,
          note: newNote || item.note,
          status: item.preValue !== newValue ? 'changed' : 'unchanged',
          isConfirmed: true,
          confirmedBy: currentUser
        }
      }
      return item
    }))
    setEditKey(null)
  }

  const startEdit = (key: string, currentVal: string, currentNote: string) => {
    setEditKey(key)
    setNewValue(currentVal)
    setNewNote(currentNote)
  }

  const toggleConfirm = (key: string) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const nextConfirmed = !item.isConfirmed
        if (onAddLog) {
          onAddLog(`${nextConfirmed ? 'Xác nhận' : 'Hủy xác nhận'} thông số '${item.name}'`)
        }
        return {
          ...item,
          isConfirmed: nextConfirmed,
          confirmedBy: nextConfirmed ? currentUser : item.confirmedBy
        }
      }
      return item
    }))
  }

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim()) return

    const newItem: DiscrepancyItem = {
      key: 'custom_' + Date.now(),
      name: customName,
      preValue: customPre || '-',
      postValue: customPost || '-',
      status: customPre !== customPost ? 'changed' : 'unchanged',
      note: customNote || 'Thêm hạng mục tùy chỉnh bởi người dùng.',
      isConfirmed: true,
      confirmedBy: currentUser
    }

    setItems([...items, newItem])
    if (onAddLog) {
      onAddLog(`Thêm hạng mục thiết bị tùy chỉnh mới: '${customName}'`)
    }
    setCustomName('')
    setCustomPre('')
    setCustomPost('')
    setCustomNote('')
    setIsAddingCustom(false)
  }

  const deleteItem = (key: string) => {
    const item = items.find(i => i.key === key)
    setItems(items.filter(item => item.key !== key))
    if (item && onAddLog) {
      onAddLog(`Xóa hạng mục thiết bị: '${item.name}'`)
    }
  }

  const changedCount = items.filter(i => i.status === 'changed').length
  const confirmedCount = items.filter(i => i.isConfirmed).length

  // Helper to render user attribution badge
  const renderUserBadge = (user: 'Linh' | 'Kanai' | 'AI') => {
    const styleMap = {
      Linh: 'bg-sky-50 text-sky-600 border-sky-200/60',
      Kanai: 'bg-amber-50 text-amber-600 border-amber-200/60',
      AI: 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
    }
    const avatarMap = { Linh: 'L', Kanai: 'K', AI: 'AI' }
    const nameMap = { Linh: 'Linh (Software)', Kanai: 'Kanai (Lead)', AI: 'AI Assistant' }

    return (
      <span 
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${styleMap[user]}`}
        title={`Xác nhận bởi ${nameMap[user]}`}
      >
        <span className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] text-slate-500 shadow-xs shrink-0">
          {avatarMap[user]}
        </span>
        <span>{user}</span>
      </span>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 text-slate-700 shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">So sánh thông số chênh lệch</h4>
          <p className="text-[10px] text-slate-450">Pha 7: Nhập chênh lệch trước và sau khi nhận đơn hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
            Xác nhận {confirmedCount}/{items.length} hạng mục
          </span>
          <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200/60 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{changedCount} Thay đổi</span>
          </span>
        </div>
      </div>

      {/* Discrepancies Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-2 w-6 text-center">Xác nhận</th>
              <th className="py-2.5 px-3">Hạng mục</th>
              <th className="py-2.5 px-3">Trước khi nhận đơn</th>
              <th className="py-2.5 px-3">Sau khi nhận đơn</th>
              <th className="py-2.5 px-3">Người nhập</th>
              <th className="py-2.5 px-3">Ghi chú / Lý do</th>
              <th className="py-2.5 px-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr 
                key={item.key} 
                className={`border-b border-slate-200/50 hover:bg-slate-50/50 transition-colors ${
                  item.status === 'changed' ? 'bg-amber-50/30' : ''
                } ${item.isConfirmed ? 'bg-slate-50/60' : ''}`}
              >
                {/* Confirm checkbox */}
                <td className="py-3 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.isConfirmed}
                    onChange={() => toggleConfirm(item.key)}
                    className="w-3.5 h-3.5 rounded border-slate-300 bg-white text-brand-500 focus:ring-brand-500 focus:ring-offset-white cursor-pointer"
                  />
                </td>

                <td className="py-3 px-3 font-semibold text-slate-800">{item.name}</td>
                <td className="py-3 px-3">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
                    item.status === 'changed' 
                      ? 'bg-rose-50 text-rose-600 border-rose-200/60 line-through' 
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {item.preValue}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {editKey === item.key ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="px-2 py-1 border border-brand-500 focus:outline-none rounded-lg text-xs w-28 bg-white text-slate-800 font-mono"
                      />
                    </div>
                  ) : (
                    <span className={`font-mono text-xs px-2 py-0.5 rounded border font-bold ${
                      item.status === 'changed' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' 
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {item.postValue}
                    </span>
                  )}
                </td>

                {/* Confirmed By Column */}
                <td className="py-3 px-3">
                  {renderUserBadge(item.confirmedBy)}
                </td>

                {/* Note column */}
                <td className="py-3 px-3 text-slate-600 text-[11px] leading-relaxed max-w-[150px] truncate" title={item.note}>
                  {editKey === item.key ? (
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="px-2 py-1 border border-slate-250 focus:outline-none rounded-lg text-xs w-full bg-white text-slate-800"
                      placeholder="Nhập ghi chú mới..."
                    />
                  ) : (
                    item.note
                  )}
                </td>

                {/* Edit Actions */}
                <td className="py-3 px-3 text-center">
                  {editKey === item.key ? (
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleSave(item.key)}
                        className="p-1 bg-brand-500 text-white rounded hover:bg-brand-600 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setEditKey(null)}
                        className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => startEdit(item.key, item.postValue, item.note)}
                        className="p-1 text-slate-500 hover:text-brand-500 hover:bg-slate-100 rounded transition cursor-pointer"
                        title="Chỉnh sửa dòng"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {item.key.startsWith('custom_') && (
                        <button
                          onClick={() => deleteItem(item.key)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition cursor-pointer"
                          title="Xóa dòng"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic Item Form */}
      {isAddingCustom ? (
        <form onSubmit={handleAddCustom} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fadeIn">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Thêm thiết bị / Hạng mục mới</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tên Hạng mục</label>
              <input
                type="text"
                placeholder="Ví dụ: Động cơ quạt làm mát trục A5"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Trước khi nhận đơn</label>
              <input
                type="text"
                placeholder="Ví dụ: Không lắp"
                value={customPre}
                onChange={e => setCustomPre(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Sau khi nhận đơn</label>
              <input
                type="text"
                placeholder="Ví dụ: 1 Cái (0.75kW)"
                value={customPost}
                onChange={e => setCustomPost(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 text-slate-800"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Lý do thay đổi / Ghi chú</label>
              <input
                type="text"
                placeholder="Ví dụ: Nhiệt độ môi trường cao cần tản nhiệt tốt hơn."
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 text-slate-800"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition cursor-pointer shadow-sm"
            >
              Thêm mới
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingCustom(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-slate-200 hover:border-brand-500 text-slate-500 hover:text-brand-600 bg-white hover:bg-brand-500/5 rounded-xl transition text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4 text-brand-500" />
          <span>+ Thêm hạng mục đối chiếu thiết bị tùy chỉnh</span>
        </button>
      )}

      {/* Confirm & Sync */}
      <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-brand-550" />
          <span className="text-slate-600">
            Xác nhận nội dung dự án và đồng bộ thông số sang Biên bản Kick-off.
          </span>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg shadow-sm cursor-pointer transition">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Đồng bộ đầu ra</span>
        </button>
      </div>
    </div>
  )
}
