import type { Locale } from '@/i18n/types'

/**
 * Bản dịch HIỂN THỊ cho hội thoại AI mô phỏng (chip gợi ý + câu trả lời).
 * Logic chat vẫn khớp theo chuỗi tiếng Việt (key); chỉ dịch khi render.
 * JA/EN là bản dịch nháp — cần native review.
 */
const CHAT: Record<string, { ja: string; en: string }> = {
  // ── Chip chuyển bước ──
  'Chuyển sang Bước 1: Tiếp nhận & Khảo sát': { ja: 'ステップ1へ: 受領・調査', en: 'Go to Step 1: Intake & Survey' },
  'Chuyển sang Bước 2: Họp Kick-off': { ja: 'ステップ2へ: キックオフ会議', en: 'Go to Step 2: Kick-off meeting' },
  'Chuyển sang Bước 3: Điều chỉnh vật tư': { ja: 'ステップ3へ: 資材調整', en: 'Go to Step 3: Adjust materials' },
  'Chuyển sang Bước 4: Thiết kế & Code tự động': { ja: 'ステップ4へ: 設計・自動コード', en: 'Go to Step 4: Design & auto code' },
  'Chuyển sang Bước 5: Debug & Hiệu chỉnh Code': { ja: 'ステップ5へ: デバッグ・コード調整', en: 'Go to Step 5: Debug & tune code' },
  'Chuyển sang Bước 6: Nghiệm thu & HDSD': { ja: 'ステップ6へ: 検収・取説', en: 'Go to Step 6: Acceptance & manual' },
  // ── Chip gợi ý khác ──
  'Có thay đổi gì về số lượng động cơ hay PLC?': { ja: 'モーターや PLC の数量に変更はありますか？', en: 'Any change in motor or PLC quantity?' },
  'Xem chi tiết thông số chênh lệch Melsec Q?': { ja: 'Melsec Q の差分仕様を詳しく見る', en: 'View Melsec Q spec differences in detail' },
  'Soạn biên bản Kick-off bàn giao dự án': { ja: 'プロジェクト引き継ぎのキックオフ議事録を作成', en: 'Draft the project handover kick-off minutes' },
  'Xem danh sách ghi chú cuộc họp kick-off.': { ja: 'キックオフ会議のメモ一覧を見る', en: 'View the kick-off meeting notes' },
  'Thêm 2 cảm biến quang': { ja: '光電センサーを2個追加', en: 'Add 2 photoelectric sensors' },
  'Nâng cấp màn hình HMI': { ja: 'HMI 画面をアップグレード', en: 'Upgrade the HMI screen' },
  'Bổ sung 1 trục Servo Motor': { ja: 'サーボモーター軸を1つ追加', en: 'Add 1 servo motor axis' },
  'Xem sơ đồ bản vẽ CAD & mã Structured Text': { ja: 'CAD 図面と Structured Text を見る', en: 'View CAD drawing & Structured Text' },
  'Tải về mã nguồn & bản vẽ thiết kế': { ja: 'ソースコードと設計図面をダウンロード', en: 'Download source code & design drawings' },
  'Kiểm tra lỗi cú pháp mã PLC.': { ja: 'PLC コードの構文エラーをチェック', en: 'Check PLC code syntax errors' },
  'Tối ưu hóa mã PLC ST (Paraphrase).': { ja: 'PLC ST コードを最適化（言い換え）', en: 'Optimize PLC ST code (paraphrase)' },
  'Thêm còi báo động vào code.': { ja: 'コードに警報ブザーを追加', en: 'Add an alarm siren to the code' },
  'Soạn tài liệu nghiệm thu / hướng dẫn sử dụng': { ja: '検収書・取扱説明書を作成', en: 'Draft acceptance / user manual docs' },
  'Tải Biên bản nghiệm thu.docx': { ja: '検収記録.docx をダウンロード', en: 'Download Acceptance_record.docx' },
  'Tải Hướng dẫn vận hành HMI.pdf': { ja: 'HMI 操作説明書.pdf をダウンロード', en: 'Download HMI_operation_manual.pdf' },
  'Nhập lại chênh lệch thông số dự án sau khi nhận đơn hàng': { ja: '受注後の案件仕様の差分を再入力', en: 'Re-enter project spec differences after the order' },
  // ── Chip pre-sales (PRE_SUGG) ──
  'Tóm tắt dự án': { ja: '案件を要約', en: 'Summarize the project' },
  'Soạn nội dung tài liệu dự toán': { ja: '見積資料の内容を作成', en: 'Draft estimate document content' },
  'Mô tả cấu thành hệ thống (đơn giản)': { ja: 'システム構成を記述（簡易）', en: 'Describe system configuration (simple)' },
  'Lập dự toán khái quát': { ja: '概算見積を作成', en: 'Create a rough estimate' },
  'Lập lịch trình khái quát': { ja: '概略スケジュールを作成', en: 'Create a rough schedule' },
  'Soạn tài liệu nền đề xuất': { ja: '提案ベース資料を作成', en: 'Draft the proposal base document' },
  // ── Câu trả lời AI (explanationText) ──
  'Đã chuyển sang Bước 1: Tiếp nhận & Khảo sát. Giao diện nhật ký khao_sat_thay_doi_specs.txt đã được hiển thị ở bên trái.': { ja: 'ステップ1「受領・調査」に移動しました。ログ画面 khao_sat_thay_doi_specs.txt を左側に表示しています。', en: 'Moved to Step 1: Intake & Survey. The log view khao_sat_thay_doi_specs.txt is shown on the left.' },
  'Đã chuyển sang Bước 2: Họp Kick-off. Giao diện biên bản bien_ban_kickoff_ban_giao.txt đã được hiển thị ở bên trái.': { ja: 'ステップ2「キックオフ会議」に移動しました。議事録 bien_ban_kickoff_ban_giao.txt を左側に表示しています。', en: 'Moved to Step 2: Kick-off meeting. The minutes bien_ban_kickoff_ban_giao.txt are shown on the left.' },
  'Đã chuyển sang Bước 3: Điều chỉnh vật tư. Bảng vật tư thông minh đã hiển thị ở bên trái.': { ja: 'ステップ3「資材調整」に移動しました。スマート資材表を左側に表示しています。', en: 'Moved to Step 3: Adjust materials. The smart materials table is shown on the left.' },
  'Đã chuyển sang Bước 4: Thiết kế & Code tự động. AI đã sinh bản vẽ CAD và Structured Text.': { ja: 'ステップ4「設計・自動コード」に移動しました。AI が CAD 図面と Structured Text を生成しました。', en: 'Moved to Step 4: Design & auto code. The AI generated the CAD drawing and Structured Text.' },
  'Đã chuyển sang Bước 5: Debug & Hiệu chỉnh Code. Tại đây bạn có thể chỉnh sửa trực tiếp mã Structured Text (ST) của PLC, chạy kiểm tra lỗi biên dịch, và yêu cầu AI paraphrase/tối ưu hóa chương trình.': { ja: 'ステップ5「デバッグ・コード調整」に移動しました。ここで PLC の Structured Text (ST) を直接編集し、コンパイルエラーをチェックし、AI に言い換え/最適化を依頼できます。', en: 'Moved to Step 5: Debug & tune code. Here you can directly edit the PLC Structured Text (ST), run compile checks, and ask the AI to paraphrase/optimize the program.' },
  'Đã chuyển sang Bước 6: Nghiệm thu & HDSD. Bạn có thể tải các file tài liệu hướng dẫn và nghiệm thu.': { ja: 'ステップ6「検収・取説」に移動しました。取扱説明書や検収ドキュメントをダウンロードできます。', en: 'Moved to Step 6: Acceptance & manual. You can download the manual and acceptance documents.' },
  'Nhật ký khảo sát ghi nhận cấu hình cũ dùng PLC FX5U (Compact) và cấu hình mới nâng cấp lên PLC Q03UDE (Module) cùng màn hình GOT2000 10-inch. Bản vẽ CAD và Mã PLC ST ở Bước 4 đã tự động cập nhật theo cấu hình mới này.': { ja: '調査ログでは旧構成が PLC FX5U（コンパクト）、新構成が PLC Q03UDE（モジュール）と GOT2000 10インチ画面へのアップグレードと記録されています。ステップ4の CAD 図面と PLC ST コードはこの新構成に自動更新されました。', en: 'The survey log records the old config using PLC FX5U (Compact) and the new config upgraded to PLC Q03UDE (Module) with a GOT2000 10-inch screen. The CAD drawing and PLC ST code in Step 4 were auto-updated to this new config.' },
  'Đã chuyển sang Bước 2: Họp Kick-off. Tôi đã lập danh sách ghi chú bàn giao dự án và chuẩn bị sẵn biên bản cuộc họp.': { ja: 'ステップ2「キックオフ会議」に移動しました。引き継ぎメモの一覧を作成し、議事録を準備しました。', en: 'Moved to Step 2: Kick-off meeting. I prepared the handover notes list and the meeting minutes.' },
  'Dưới đây là các ghi chú kỹ thuật quan trọng trong Biên bản họp Kick-off (hiển thị ở khung bên trái):\n- Cần kiểm tra lại nguồn cấp AC200V 3 pha cho các Servo Drive tại nhà xưởng.\n- Bản vẽ CAD mạch lực cần tách biệt dây động lực và dây tín hiệu cảm biến để chống nhiễu.': { ja: 'キックオフ議事録の重要な技術メモ（左側に表示）:\n- 工場のサーボドライブ向け AC200V 三相電源を再確認すること。\n- 動力配線とセンサー信号線を分離しノイズ対策を行う CAD 図面が必要。', en: 'Key technical notes in the kick-off minutes (shown on the left):\n- Re-check the AC200V 3-phase supply for the Servo Drives at the factory.\n- The power-circuit CAD must separate power wiring from sensor signal wiring to prevent noise.' },
  'Đã chuyển sang Bước 3: Điều chỉnh vật tư. Đang tiến hành tăng số lượng Cảm biến quang điện (Photoelectric Sensor) thêm 2 cái.': { ja: 'ステップ3「資材調整」に移動しました。光電センサーの数量を2個追加しています。', en: 'Moved to Step 3: Adjust materials. Increasing the photoelectric sensor quantity by 2.' },
  'Đã chuyển sang Bước 3: Điều chỉnh vật tư. Đang thay đổi cấu hình màn hình HMI sang GOT2000 10-inch và áp dụng giá trị mặc định của Master Data.': { ja: 'ステップ3「資材調整」に移動しました。HMI 画面構成を GOT2000 10インチに変更し、マスターデータの既定値を適用しています。', en: 'Moved to Step 3: Adjust materials. Changing the HMI screen to GOT2000 10-inch and applying Master Data defaults.' },
  'Đã chuyển sang Bước 3: Điều chỉnh vật tư. Đang tiến hành bổ sung thêm 1 trục Servo Motor (MR-J5-40A) cho cơ cấu băng tải nạp phôi phụ.': { ja: 'ステップ3「資材調整」に移動しました。補助ワーク供給コンベヤ用にサーボモーター軸（MR-J5-40A）を1つ追加しています。', en: 'Moved to Step 3: Adjust materials. Adding 1 servo motor axis (MR-J5-40A) for the auxiliary feed conveyor.' },
  'Đã chuyển sang Bước 4: Thiết kế & Code tự động. AI đã xử lý ngầm và sinh bản vẽ CAD đấu dây cùng mã Structured Text (ST) tuân thủ quy tắc E-stop KA1 và khởi tạo Servo. Bạn có thể xem trực tiếp hoặc tải về.': { ja: 'ステップ4「設計・自動コード」に移動しました。AI がバックグラウンドで処理し、E-stop KA1 とサーボ初期化の規則に従った配線 CAD 図面と Structured Text (ST) を生成しました。表示またはダウンロードできます。', en: 'Moved to Step 4: Design & auto code. The AI processed in the background and generated the wiring CAD drawing and Structured Text (ST) following the E-stop KA1 and Servo init rules. You can view or download them.' },
  'Mã nguồn PLC và Bản vẽ điện CAD đã sẵn sàng. Vui lòng bấm vào các nút Tải Bản vẽ CAD (.dwg) hoặc Tải Mã PLC (.l5k) ở thanh công cụ canvas để tải về.': { ja: 'PLC ソースコードと電気 CAD 図面の準備ができました。キャンバスのツールバーにある「CAD 図面をダウンロード (.dwg)」または「PLC コードをダウンロード (.l5k)」を押してください。', en: 'The PLC source code and electrical CAD drawing are ready. Please click "Download CAD drawing (.dwg)" or "Download PLC code (.l5k)" on the canvas toolbar.' },
  'Đang tiến hành chạy trình biên dịch kiểm định cú pháp PLC... Phát hiện 0 lỗi cú pháp! Tất cả các khối lệnh (Emergency Stop KA1, Axis Move, AI Quality scans) đều tuân thủ định dạng IEC 61131-3.': { ja: 'PLC 構文チェックのコンパイラを実行中... 構文エラー0件！すべてのブロック（Emergency Stop KA1、Axis Move、AI Quality scans）が IEC 61131-3 形式に準拠しています。', en: 'Running the PLC syntax-check compiler... 0 syntax errors found! All blocks (Emergency Stop KA1, Axis Move, AI Quality scans) comply with IEC 61131-3.' },
  'Tôi đã tối ưu hóa mã PLC ST (Paraphrase) sang cấu trúc máy trạng thái `CASE..OF` gọn đẹp hơn, giúp cải thiện tốc độ xử lý vòng quét của CPU PLC Melsec. Màn hình biên soạn đã cập nhật chương trình mới.': { ja: 'PLC ST コードをより簡潔な `CASE..OF` ステートマシン構造に最適化（言い換え）しました。Melsec PLC CPU のスキャン処理速度が向上します。エディタに新しいプログラムを反映しました。', en: 'I optimized (paraphrased) the PLC ST code into a cleaner `CASE..OF` state-machine structure, improving the Melsec PLC CPU scan speed. The editor now shows the new program.' },
  'Đã thêm biến `ALARM_SIREN : BOOL` và gán `ALARM_SIREN := TRUE;` trong bước phát hiện sản phẩm lỗi NG (Bước 5b). Hệ thống còi báo sẽ tự động bật khi có phôi lỗi và tắt khi cổng đẩy mở xong.': { ja: '不良品 NG 検出ステップ（5b）に変数 `ALARM_SIREN : BOOL` を追加し、`ALARM_SIREN := TRUE;` を設定しました。不良ワーク発生時に警報ブザーが自動で鳴り、排出ゲートが開き切ると停止します。', en: 'Added the variable `ALARM_SIREN : BOOL` and set `ALARM_SIREN := TRUE;` in the NG-product detection step (Step 5b). The siren turns on automatically when a defective workpiece appears and stops when the eject gate finishes opening.' },
  'Đã chuyển sang Bước 6: Nghiệm thu & HDSD. Tôi đã tự động biên soạn các tài liệu kỹ thuật hoàn chỉnh: \n\n📄 [Biên bản nghiệm thu.docx]\n📄 [Hướng dẫn vận hành HMI.pdf]\n\nBạn có thể tải trực tiếp ở khung bên cạnh hoặc gõ yêu cầu cụ thể.': { ja: 'ステップ6「検収・取説」に移動しました。完成した技術ドキュメントを自動作成しました:\n\n📄 [検収記録.docx]\n📄 [HMI 操作説明書.pdf]\n\n隣の枠から直接ダウンロードするか、具体的な指示を入力してください。', en: 'Moved to Step 6: Acceptance & manual. I auto-drafted the complete technical documents:\n\n📄 [Acceptance_record.docx]\n📄 [HMI_operation_manual.pdf]\n\nYou can download them in the panel beside, or type a specific request.' },
  'Đang tải file Biên bản nghiệm thu.docx (45 KB) về máy của bạn...': { ja: '検収記録.docx (45 KB) をダウンロードしています...', en: 'Downloading Acceptance_record.docx (45 KB)...' },
  'Đang tải file Hướng dẫn vận hành HMI.pdf (1.1 MB) về máy của bạn...': { ja: 'HMI 操作説明書.pdf (1.1 MB) をダウンロードしています...', en: 'Downloading HMI_operation_manual.pdf (1.1 MB)...' },
  // ── Phản hồi inline (tĩnh) ──
  'Tôi đã cập nhật yêu cầu chỉnh sửa của bạn vào Nhật ký khảo sát khao_sat_thay_doi_specs.txt ở khung bên trái. \n\nĐồng thời, cấu hình vật tư liên quan đã được đồng bộ tự động sang Bước 3. Điều chỉnh vật tư. Bạn có thể kiểm tra tệp tin và tiếp tục trao đổi.': { ja: '修正のご要望を左側の調査ログ khao_sat_thay_doi_specs.txt に反映しました。\n\n併せて関連する資材構成がステップ3「資材調整」へ自動同期されました。ファイルを確認しつつ会話を続けられます。', en: 'I added your change request to the survey log khao_sat_thay_doi_specs.txt on the left.\n\nThe related materials config was also auto-synced to Step 3: Adjust materials. You can check the file and keep chatting.' },
  'Đã ghi nhận ý kiến đóng góp của bạn và cập nhật vào Biên bản cuộc họp bien_ban_kickoff_ban_giao.txt ở khung bên trái. Các thông tin phân công này đã được đồng bộ.': { ja: 'ご意見を反映し、左側の議事録 bien_ban_kickoff_ban_giao.txt を更新しました。担当割り当て情報は同期済みです。', en: 'Noted your input and updated the minutes bien_ban_kickoff_ban_giao.txt on the left. The assignment info has been synced.' },
}

export function tcText(text: string, locale: Locale): string {
  if (locale === 'vi') return text
  return CHAT[text]?.[locale] ?? text
}
