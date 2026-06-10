import type { Dictionary } from '@/i18n/types'

/**
 * chatdyn — template ĐỘNG cho hội thoại AI (có {placeholder}), dùng với tf(key, vars).
 * Message mang { tkey, tvars } → render bằng tf() → tự dịch lại khi đổi ngôn ngữ.
 * Thêm message dịch được sau này: chỉ cần pushChat(user, fallbackVN, sugg, 'chat.xxx', { ...vars }) + thêm key ở đây.
 */
export const chatdyn: Dictionary = {
  ja: {
    'chat.ps.recorded': '✓ {label} を記録しました: {value}',
    'chat.ps.generated': '資料を生成しました ✓（「作成済み」を参照）。',
    'chat.ps.summary': '把握している案件データ:\n{data}',
    'chat.ps.remembered': '追加で記憶しました: {names}。「案件を要約」と入力すると全体を表示します。',
    'chat.ps.understood': '了解しました。詳細を教えていただくか、「案件を要約」で把握内容を確認できます。',
    'chat.materials.inc': 'チャットからの資材調整を反映: {item} を {qty} 個増加。\n\n資材総額も更新されました。この新バージョンはライブラリに同期保存されました。',
    'chat.materials.dec': 'チャットからの資材調整を反映: {item} を {qty} 個減少。\n\n資材総額も更新されました。この新バージョンはライブラリに同期保存されました。',
    'chat.fallback': 'ご質問「{q}」と読み込んだソース資料からは、受注後の5つの設計ステップに一致するキーワードが見つかりませんでした。\n\n例えば次のいずれかについて聞いてみてください: 受領・調査、キックオフ引き継ぎ、資材調整、CAD図面/PLCコード設計、検収・取説。',
    'chat.reentry.proposal': '提案の登録をお勧めします — {name}: {value}。\n\n「update」（または「同意」）と入力して調査メモに記録するか、入力を続けて提案を調整してください。',
    'chat.reentry.recordedSync': '✓ 調査メモに「{name}: {value}」を記録しました。資材表（ステップ3）が同期されました。',
    'chat.reentry.recorded': '✓ 調査メモに「{name}: {value}」を記録しました。',
    'chat.reentry.summary': '調査後に記録された差分（営業段階の元仕様との比較）：\n{data}',
  },
  en: {
    'chat.ps.recorded': '✓ Recorded {label}: {value}',
    'chat.ps.generated': 'Document generated ✓ (see "Created").',
    'chat.ps.summary': "Project data I'm tracking:\n{data}",
    'chat.ps.remembered': 'I noted: {names}. Type "summarize project" to see everything.',
    'chat.ps.understood': 'Understood. Tell me more, or type "summarize project" to see what I have.',
    'chat.materials.inc': 'Recorded materials change from chat: {item} increased by {qty}.\n\nThe total materials value was updated. This new version was synced to the Library.',
    'chat.materials.dec': 'Recorded materials change from chat: {item} decreased by {qty}.\n\nThe total materials value was updated. This new version was synced to the Library.',
    'chat.fallback': 'Based on your question "{q}" and the loaded source documents, I could not find a keyword matching the 5 post-order design steps.\n\nTry asking about one of: intake & survey, kick-off handover, materials adjustment, CAD drawing / PLC code design, or acceptance & manual.',
    'chat.reentry.proposal': 'I suggest recording — {name}: {value}.\n\nType "update" (or "agree") to record to survey memory, or keep typing to refine the proposal.',
    'chat.reentry.recordedSync': '✓ Recorded "{name}: {value}" to survey memory. Materials list (Step 3) synced.',
    'chat.reentry.recorded': '✓ Recorded "{name}: {value}" to survey memory.',
    'chat.reentry.summary': 'Differences recorded after survey (compared to original pre-sales specs):\n{data}',
  },
  vi: {
    'chat.ps.recorded': '✓ Đã ghi nhớ {label}: {value}',
    'chat.ps.generated': 'Đã sinh tài liệu ✓ (xem ở mục "Đã tạo").',
    'chat.ps.summary': 'Dữ liệu dự án mình đang ghi nhớ:\n{data}',
    'chat.ps.remembered': 'Mình đã ghi nhớ thêm: {names}. Gõ "tóm tắt dự án" để xem toàn bộ.',
    'chat.ps.understood': 'Đã hiểu. Bạn kể thêm chi tiết, hoặc gõ "tóm tắt dự án" để xem mình đang nhớ gì.',
    'chat.materials.inc': 'Đã ghi nhận điều chỉnh vật tư từ chat: {item} được tăng thêm {qty} cái.\n\nTổng giá trị vật tư đã được cập nhật tương ứng. Phiên bản mới này đã được đồng bộ để lưu lại tại Thư viện.',
    'chat.materials.dec': 'Đã ghi nhận điều chỉnh vật tư từ chat: {item} được giảm bớt {qty} cái.\n\nTổng giá trị vật tư đã được cập nhật tương ứng. Phiên bản mới này đã được đồng bộ để lưu lại tại Thư viện.',
    'chat.fallback': 'Dựa trên câu hỏi "{q}" của bạn và các tài liệu nguồn đã nạp, tôi chưa tìm thấy từ khóa trùng khớp với 5 bước thiết kế sau đơn hàng.\n\nVui lòng thử hỏi về một trong các bước như: tiếp nhận khảo sát, họp kick-off bàn giao, điều chỉnh vật tư, thiết kế bản vẽ CAD / mã PLC, hoặc nghiệm thu HDSD.',
    'chat.reentry.proposal': 'Tôi đề xuất ghi nhận — {name}: {value}.\n\nGõ "update" (hoặc "đồng ý") để ghi vào bộ nhớ khảo sát, hoặc nhập tiếp để chỉnh lại đề xuất.',
    'chat.reentry.recordedSync': '✓ Đã ghi "{name}: {value}" vào bộ nhớ khảo sát. Bảng vật tư (Bước 3) đã đồng bộ.',
    'chat.reentry.recorded': '✓ Đã ghi "{name}: {value}" vào bộ nhớ khảo sát.',
    'chat.reentry.summary': 'Chênh lệch đã ghi nhận sau khảo sát (so với specs gốc pre-sales):\n{data}',
  },
}
