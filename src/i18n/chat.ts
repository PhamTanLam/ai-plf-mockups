import type { Locale } from '@/i18n/types'

/**
 * Bản dịch HIỂN THỊ cho hội thoại AI mô phỏng (chip gợi ý + câu trả lời).
 * Logic chat vẫn khớp theo chuỗi tiếng Việt (key); chỉ dịch khi render.
 * JA/EN là bản dịch nháp — cần native review.
 */
const CHAT: Record<string, { ja: string; en: string }> = {
  // ── Chip chuyển bước ──
  'Chuyển sang Bước 1: Khảo sát & Phát sinh': { ja: 'ステップ1へ: 調査・追加費用', en: 'Go to Step 1: Survey & Change Orders' },
  'Chuyển sang Bước 2: Họp Kick-off': { ja: 'ステップ2へ: キックオフ会議', en: 'Go to Step 2: Kick-off meeting' },
  'Chuyển sang Bước 3: Điều chỉnh vật tư': { ja: 'ステップ3へ: 資材調整', en: 'Go to Step 3: Adjust materials' },
  'Chuyển sang Bước 4: Thiết kế & Code tự động': { ja: 'ステップ4へ: 設計・自動コード', en: 'Go to Step 4: Design & auto code' },
  'Chuyển sang Bước 5: Debug': { ja: 'ステップ5へ: デバッグ', en: 'Go to Step 5: Debug' },
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
  'Đã chuyển sang Bước 1: Khảo sát & Phát sinh. Giao diện nhật ký khao_sat_thay_doi_specs.txt đã được hiển thị ở bên trái.': { ja: 'ステップ1「調査・追加費用」に移動しました。ログ画面 khao_sat_thay_doi_specs.txt を左側に表示しています。', en: 'Moved to Step 1: Survey & Change Orders. The log view khao_sat_thay_doi_specs.txt is shown on the left.' },
  'Đã chuyển sang Bước 2: Họp Kick-off. Giao diện biên bản bien_ban_kickoff_ban_giao.txt đã được hiển thị ở bên trái.': { ja: 'ステップ2「キックオフ会議」に移動しました。議事録 bien_ban_kickoff_ban_giao.txt を左側に表示しています。', en: 'Moved to Step 2: Kick-off meeting. The minutes bien_ban_kickoff_ban_giao.txt are shown on the left.' },
  'Đã chuyển sang Bước 3: Điều chỉnh vật tư. Bảng vật tư thông minh đã hiển thị ở bên trái.': { ja: 'ステップ3「資材調整」に移動しました。スマート資材表を左側に表示しています。', en: 'Moved to Step 3: Adjust materials. The smart materials table is shown on the left.' },
  'Đã chuyển sang Bước 4: Thiết kế & Code tự động. AI đã sinh bản vẽ CAD và Structured Text.': { ja: 'ステップ4「設計・自動コード」に移動しました。AI が CAD 図面と Structured Text を生成しました。', en: 'Moved to Step 4: Design & auto code. The AI generated the CAD drawing and Structured Text.' },
  'Đã chuyển sang Bước 5: Debug. Tại đây bạn có thể chỉnh sửa trực tiếp mã Structured Text (ST) của PLC, chạy kiểm tra lỗi biên dịch, và yêu cầu AI paraphrase/tối ưu hóa chương trình.': { ja: 'ステップ5「デバッグ」に移動しました。ここで PLC の Structured Text (ST) を直接編集し、コンパイルエラーをチェックし、AI に言い換え/最適化を依頼できます。', en: 'Moved to Step 5: Debug. Here you can directly edit the PLC Structured Text (ST), run compile checks, and ask the AI to paraphrase/optimize the program.' },
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
  
  // ── Suggestions Phase 12 ──
  'Tối ưu gọn mã nguồn (CASE..OF)': { ja: 'コード最適化 (CASE..OF)', en: 'Optimize source code (CASE..OF)' },
  'Ghi chú chuẩn IEC & CASE cho mã nguồn': { ja: 'IEC準拠コメント＆CASE注釈', en: 'IEC-standard comments & CASE' },
  'Khôi phục mã nguồn về bản gốc': { ja: 'デフォルトコードに復元', en: 'Restore default code' },

  // ── AI Responses Phase 12 ──
  'Đã áp dụng phong cách tối ưu hóa gọn (State Machine / CASE..OF). Mã nguồn PLC ST đã được tái cấu trúc sang dạng máy trạng thái gọn đẹp hơn, giảm thiểu các khối IF lồng nhau phức tạp và cải thiện tốc độ vòng quét CPU.': {
    ja: 'ステートマシン（CASE..OF）による簡潔な最適化スタイルを適用しました。PLC ST ソースコードは、ネストした複雑な IF ブロックを最小限に抑え、CPU スキャンサイクル処理速度を向上させるステートマシン形式に再構成されました。',
    en: 'Applied a clean state machine (CASE..OF) optimization style. The PLC ST source code has been restructured into a cleaner state machine format, minimizing nested IF blocks and improving CPU scan cycle speed.'
  },
  'Đã áp dụng cấu trúc ghi chú chuẩn IEC & CASE. Mã nguồn đã được phân khúc sơ đồ khối rõ ràng với chú giải chi tiết từng biến số theo tiêu chuẩn IEC 61131-3.': {
    ja: 'IEC & CASE 準拠のコメント注釈を適用しました。ソースコードは IEC 61131-3 規格に従って、ブロック図が明確に区切られ、各変数に詳細な説明が追加されました。',
    en: 'Applied IEC & CASE standard commenting. The source code has been segmented with clear block boundaries and detailed annotations for each variable according to the IEC 61131-3 standard.'
  },
  'Đã khôi phục lại mã Structured Text nguyên bản do AI tự động sinh. Tất cả các thay đổi tối ưu hóa trước đó đã được hoàn tác về phiên bản gốc.': {
    ja: 'AI が自動生成した元の Structured Text コードに復元しました。これまでのすべての最適化変更は破棄され、初期バージョンに戻りました。',
    en: 'Restored the original auto-generated Structured Text code. All previous optimization edits have been reverted to the initial version.'
  },

  // ── Manual Chat Queries Phase 12 ──
  'Tôi đã tự động cập nhật mã nguồn PLC ST: Thêm còi báo động `ALARM_SIREN := TRUE;` vào bước phân loại sản phẩm lỗi NG (Bước 5b) ở khu soạn thảo bên trái. Bạn có thể chạy kiểm tra cú pháp để xác nhận.': {
    ja: 'PLC ST ソースコードを自動更新しました：左側のエディタ内の不良品 NG 検出ステップ（5b）に警報ブザー `ALARM_SIREN := TRUE;` を追加しました。構文チェックを実行して確認できます。',
    en: 'I auto-updated the PLC ST source code: added the alarm siren `ALARM_SIREN := TRUE;` to the NG product classification step (Step 5b) in the left editor. You can run a syntax check to confirm.'
  },
  'Đã thêm logic còi báo động `ALARM_SIREN := TRUE;` vào chương trình. Vui lòng xem ở khung bên trái.': {
    ja: 'プログラムに警報ブザーのロジック `ALARM_SIREN := TRUE;` を追加しました。左側のフレームを確認してください。',
    en: 'Added the alarm siren logic `ALARM_SIREN := TRUE;` to the program. Please check the left panel.'
  },
  'Mã nguồn hiện tại đã được tích hợp còi báo động lỗi `ALARM_SIREN := TRUE;` tại bước phân loại sản phẩm lỗi NG.': {
    ja: '現在のソースコードには、不良品 NG 検出ステップに警報ブザー `ALARM_SIREN := TRUE;` が既に組み込まれています。',
    en: 'The current source code already integrates the alarm siren `ALARM_SIREN := TRUE;` in the NG product classification step.'
  },
  'Tôi đã thực hiện tối ưu hóa (Paraphrase) mã nguồn PLC ST sang dạng State Machine sử dụng cấu trúc `CASE..OF` giúp chương trình gọn nhẹ hơn, giảm dung lượng bộ nhớ PLC và tăng chu kỳ quét vòng quét (scan time).': {
    ja: 'PLC ST ソースコードを `CASE..OF` 構造を使用したステートマシン形式に最適化（言い換え）しました。プログラムがより簡潔になり、PLC メモリ使用量が削減され、スキャンサイクルタイムが向上します。',
    en: 'I optimized (paraphrased) the PLC ST source code into a state machine format using `CASE..OF` structure to make the program cleaner, reduce PLC memory usage, and improve scan cycle time.'
  },
  'Tôi đã phân tích mã nguồn Structured Text hiện tại. Bạn có thể nhấn trực tiếp nút **Chạy kiểm tra cú pháp** ở cột bên phải để AI biên dịch thử thời gian thực.': {
    ja: '現在の Structured Text ソースコードを分析しました。右側の「構文チェックを実行」ボタンを直接クリックして、AI によるリアルタイムコンパイルを試すことができます。',
    en: 'I analyzed the current Structured Text source code. You can click "Run syntax check" on the right panel to test compile in real-time with AI.'
  },
  // ── Suggestions & Actions for Step 7 (Survey & Reentry) ──
  'đổi PLC sang Q03UDE': { ja: 'PLCをQ03UDEに変更', en: 'Change PLC to Q03UDE' },
  'Nâng HMI lên 10 inch': { ja: 'HMIを10インチにアップグレード', en: 'Upgrade HMI to 10-inch' },
  'Bổ sung 1 trục servo': { ja: 'サーボ軸を1つ追加', en: 'Add 1 servo axis' },
  'Tóm tắt chênh lệch': { ja: '差分の要約', en: 'Summarize differences' },
  'update': { ja: '更新 (update)', en: 'Update' },
  'Lập dự toán phát sinh': { ja: '追加見積の作成', en: 'Create change order estimate' },
  'Xem chênh lệch đã lưu': { ja: '保存された差分を表示', en: 'View saved differences' },
  'Xem dự toán phát sinh': { ja: '追加見積を表示', en: 'View change order estimate' },
  'Nhật ký khảo sát & Phát sinh': { ja: '調査・追加費用記録', en: 'Survey & Change Orders Log' },

  // ── Component Names & Deltas in Reentry ──
  'PLC điều khiển': { ja: '制御PLC', en: 'Control PLC' },
  'FX5U (Compact) → Q03UDE (Module)': { ja: 'FX5U (コンパクト) → Q03UDE (モジュール)', en: 'FX5U (Compact) → Q03UDE (Module)' },
  'Màn hình HMI': { ja: 'HMI表示器', en: 'HMI Screen' },
  'GOT2000 7" → 10"': { ja: 'GOT2000 7インチ → 10インチ', en: 'GOT2000 7" → 10"' },
  'Trục Servo': { ja: 'サーボ軸', en: 'Servo Axis' },
  '3 trục → 4 trục (bổ sung MR-J5-40A)': { ja: '3軸 → 4軸 (MR-J5-40A追加)', en: '3 axes → 4 axes (added MR-J5-40A)' },
  'Tiêu chuẩn an toàn': { ja: '安全規格', en: 'Safety Standard' },
  'ISO 13849 PLc → PLd (thêm Omron G9SE + 2 light curtain)': { ja: 'ISO 13849 PLc → PLd (Omron G9SE + ライトカーテン2個追加)', en: 'ISO 13849 PLc → PLd (added Omron G9SE + 2 light curtains)' },
  'Cảm biến quang': { ja: '光電センサー', en: 'Photoelectric Sensor' },
  '6 → 8 cái': { ja: '6個 → 8個', en: '6 → 8 units' },
  'Ghi chú khảo sát': { ja: '調査メモ', en: 'Survey Notes' },

  // ── Responses for Step 7 ──
  'Chưa có đề xuất nào để ghi. Bạn cứ nêu chênh lệch sau khảo sát (PLC, HMI, servo, an toàn…), tôi sẽ đề xuất và hỏi xác nhận trước khi ghi.': {
    ja: '記録する提案がありません。調査後の変更点（PLC、HMI、サーボ、安全規格など）を入力してください。提案を作成し、記録する前に確認します。',
    en: 'No pending proposal to record. Please state the survey differences (PLC, HMI, servo, safety, etc.) and I will propose and ask for confirmation before saving.'
  },
  'Chưa ghi nhận chênh lệch nào. Hãy cho tôi biết thay đổi sau khảo sát (PLC, HMI, servo, an toàn…).': {
    ja: '差分はまだ記録されていません。調査後の変更点（PLC、HMI、サーボ、安全規格など）を教えてください。',
    en: 'No differences recorded yet. Please let me know the survey changes (PLC, HMI, servo, safety, etc.).'
  },
  'Chưa có chênh lệch nào để lập dự toán. Hãy ghi nhận thay đổi sau khảo sát trước.': {
    ja: '見積を作成するための差分がありません。まず調査後の変更点を記録してください。',
    en: 'No differences to estimate. Please record the survey changes first.'
  },
  'Đã lập "Dự toán phát sinh" từ các chênh lệch đã ghi nhận ✓. Bấm để xem ngay:': {
    ja: '記録された差分から「追加見積」を作成しました ✓。クリックして表示します：',
    en: 'Created "Change Order Estimate" from the recorded differences ✓. Click to view:'
  },
  'Dự toán phát sinh (ước tính minh hoạ) từ các chênh lệch đã ghi: +¥1,590,000 so với hợp đồng gốc. Gõ "lập dự toán phát sinh" nếu muốn tôi xuất thành tài liệu.': {
    ja: '記録された差分に基づく追加見積（参考値）：元契約から +¥1,590,000。ドキュメントとして出力するには「追加見積の作成」と入力してください。',
    en: 'Change order estimate (indicative) from recorded differences: +¥1,590,000 compared to the original contract. Type "create change order estimate" if you want me to generate the document.'
  },
  'Chưa có chênh lệch nào nên chưa có phát sinh để tính.': {
    ja: '差分が記録されていないため、計算する追加費用はありません。',
    en: 'No differences recorded, so there are no change order costs to calculate.'
  },
}

export function tcText(text: string, locale: Locale): string {
  if (locale === 'vi') return text
  return CHAT[text]?.[locale] ?? text
}

const COMMENT_REPLACEMENTS: Record<string, { ja: string; en: string }> = {
  '// Thiết bị chấp hành & phản hồi': { ja: '// アクチュエータ＆フィードバック', en: '// Actuators & Feedback' },
  '// Đo quét & AI phân tích': { ja: '// 測定＆AI分析', en: '// Measurement & AI Analysis' },
  '// Phân loại đầu ra': { ja: '// 出力選別', en: '// Output sorting' },
  '// Còi báo động lỗi': { ja: '// エラー警告ブザー', en: '// Error Alarm Siren' },
  '// ▶ BẢO VỆ LIÊN KHÓA & KHỞI TẠO AN TOÀN (Rule Page 4)': { ja: '// ▶ 安全インターロック＆初期化 (ルールページ4)', en: '// ▶ SAFETY INTERLOCK & INITIALIZATION (Rule Page 4)' },
  '// Khởi động chế độ tự động': { ja: '// 自動運転起動', en: '// Start automatic mode' },
  '// ① WORKPIECE GRIP': { ja: '// ① ワーククランプ', en: '// ① WORKPIECE GRIP' },
  '// ② SERVO MOVE TO INSPECTION': { ja: '// ② サーボ検査位置移動', en: '// ② SERVO MOVE TO INSPECTION' },
  '// ③ 3D LASER MEASUREMENT SCAN': { ja: '// ③ 3Dレーザー測定スキャン', en: '// ③ 3D LASER MEASUREMENT SCAN' },
  '// ④ AI INFERENCE JUDGMENT': { ja: '// ④ AI判定', en: '// ④ AI INFERENCE JUDGMENT' },
  'STEP_NUMBER := 5; // Chuyển sang đẩy hàng OK': { ja: 'STEP_NUMBER := 5; // 良品排出へ移行', en: 'STEP_NUMBER := 5; // Go to OK discharge' },
  'STEP_NUMBER := 6; // Chuyển sang đẩy hàng lỗi NG': { ja: 'STEP_NUMBER := 6; // 不良品NG回収へ移行', en: 'STEP_NUMBER := 6; // Go to NG recycle' },
  '// ⑤A DISCHARGE OK PRODUCT': { ja: '// ⑤a 良品排出', en: '// ⑤a DISCHARGE OK PRODUCT' },
  'STEP_NUMBER := 0; // Hoàn thành chu kỳ': { ja: 'STEP_NUMBER := 0; // サイクル完了', en: 'STEP_NUMBER := 0; // Cycle completed' },
  '// ⑤B DISCHARGE NG PRODUCT & TRIGGER ALARM': { ja: '// ⑤b 不良排出＆アラーム起動', en: '// ⑤b DISCHARGE NG PRODUCT & TRIGGER ALARM' },
  'ALARM_SIREN := TRUE; // Kích hoạt còi cảnh báo lỗi': { ja: 'ALARM_SIREN := TRUE; // 警告ブザー起動', en: 'ALARM_SIREN := TRUE; // Activate alarm siren' },
  'STEP_NUMBER := 0; // Kết thúc lỗi': { ja: 'STEP_NUMBER := 0; // 異常終了', en: 'STEP_NUMBER := 0; // End cycle with error' },
  '// Liên khóa khẩn cấp': { ja: '// 非常停止インターロック', en: '// Emergency Stop Interlock' },
  '// Chu trình máy trạng thái (State Machine)': { ja: '// ステートマシンサイクル', en: '// State Machine Sequence' },
  '1: // Kẹp phôi': { ja: '1: // ワーククランプ', en: '1: // Workpiece grip' },
  '2: // Servo di chuyển': { ja: '2: // サーボ移動', en: '2: // Servo move' },
  '3: // Quét laser': { ja: '3: // レーザースキャン', en: '3: // Laser scan' },
  '4: // Phân tích AI': { ja: '4: // AI分析', en: '4: // AI inference' },
  '5: // Trả hàng OK': { ja: '5: // 良品排出', en: '5: // Discharge OK' },
  '6: // Trả hàng lỗi NG & Alarm': { ja: '6: // 不良品NG回収＆アラーム', en: '6: // Discharge NG & Alarm' },
  '// Thống nhất các biến ngõ vào & ngõ ra': { ja: '// 入出力変数の定義', en: '// I/O Variables Definition' },
  '// Cảm biến an toàn KA1': { ja: '// 安全リレー KA1 信号', en: '// Safety relay KA1 sensor' },
  '// Nút dừng khẩn cấp': { ja: '// 非常停止', en: '// Emergency Stop' },
  '// Chế độ tự động': { ja: '// 自動運転モード', en: '// Automatic mode' },
  '// Nút nhấn Start': { ja: '// 起動押しボタン', en: '// Start push button' },
  '// Bước điều khiển hiện tại': { ja: '// 現在のステップ番号', en: '// Current step number' },
  '// Cơ cấu cơ khí chấp hành': { ja: '// アクチュエータ機構', en: '// Mechanical Actuators' },
  '// Cảm biến & Module đo quét': { ja: '// センサー＆測定モジュール', en: '// Sensors & Measurement Module' },
  '// Cơ cấu phân loại đầu ra': { ja: '// 排出選別機構', en: '// Output Sorting Mechanism' },
  '// Còi báo hiệu khi phát hiện phôi NG': { ja: '// NG検出時アラームブザー', en: '// Alarm siren for NG workpiece' },
  '// 1. CHƯƠNG TRÌNH PHỤ TRỢ: BẢO VỆ & LIÊN KHÓA KA1': { ja: '// 1. サブプログラム：安全回路＆KA1インターロック', en: '// 1. SUBPROGRAM: SAFETY & KA1 INTERLOCK' },
  '// Kích hoạt chu kỳ tự động vận hành': { ja: '// 自動運転サイクルの起動', en: '// Activate automatic operation cycle' },
  '// 2. CHƯƠNG TRÌNH CHÍNH: CHU TRÌNH ĐIỀU KHIỂN ROBOT HÀN': { ja: '// 2. メインプログラム：溶接ロボット制御サイクル', en: '// 2. MAIN PROGRAM: WELDING ROBOT CONTROL CYCLE' },
  '// BƯỚC 1: Kẹp phôi hàn bằng xi lanh khí nén': { ja: '// ステップ1: エアシリンダによるワーククランプ', en: '// STEP 1: Grip workpiece with pneumatic cylinder' },
  '// BƯỚC 2: Di chuyển 3 trục Servo đến tọa độ kiểm tra': { ja: '// ステップ2: サーボ3軸の検査位置への移動', en: '// STEP 2: Move 3 Servo axes to inspection coordinates' },
  '// BƯỚC 3: Kích hoạt hệ thống cảm biến quét Laser 3D': { ja: '// ステップ3: 3Dレーザー測定センサーの起動', en: '// STEP 3: Trigger 3D Laser scanning sensor' },
  '// BƯỚC 4: Khởi chạy AI inference và lấy phán quyết': { ja: '// ステップ4: AI推論の実行と判定取得', en: '// STEP 4: Run AI inference and get judgment' },
  '// Phôi đạt -> Chuyển sang băng tải OK': { ja: '// 良品判定 -> 製品コンベアへ排出', en: '// OK Workpiece -> Move to product conveyor' },
  '// Phôi lỗi -> Chuyển sang khay phế phẩm': { ja: '// 不良品判定 -> 回収トレイへ排出', en: '// Defect Workpiece -> Move to recycle tray' },
  '// BƯỚC 5a: Đẩy phôi đạt chuẩn (Discharge OK)': { ja: '// ステップ5a: 良品排出ゲート作動 (Discharge OK)', en: '// STEP 5a: Discharge OK workpiece (Discharge OK)' },
  '// BƯỚC 5b: Đẩy phôi lỗi & Báo còi (Discharge NG)': { ja: '// ステップ5b: 不良品排出ゲート作動＆ブザー (Discharge NG)', en: '// STEP 5b: Discharge NG workpiece & siren (Discharge NG)' },
  '// Còi hú báo động sự cố sản phẩm lỗi': { ja: '// 不良品検出アラームブザー', en: '// Alarm siren for NG product' },
  '// Kết thúc chu kỳ lỗi': { ja: '// 異常サイクルの終了', en: '// End error cycle' },
  '// Tri thức Page 4: Khóa cứng tiếp điểm NC KA1': { ja: '// ページ4ナレッジ：KA1 NC接点のハードワイヤードインターロック', en: '// Page 4 Knowledge: Hardwired NC contact KA1 interlock' },
  '// Tri thức Page 4: Khối khởi tạo Servo trục A1, A2, A3': { ja: '// ページ4ナレッジ：サーボ軸 A1、A2、A3 の初期化ブロック', en: '// Page 4 Knowledge: Servo initialization block for axes A1, A2, A3' },
  '// Tối ưu thanh ghi D Mitsubishi': { ja: '// 三菱 Dレジスタの最適化', en: '// Mitsubishi D register optimization' }
}

export function localizeCodeComments(code: string, locale: Locale): string {
  if (locale === 'vi') return code
  let res = code
  for (const [key, valObj] of Object.entries(COMMENT_REPLACEMENTS)) {
    const val = valObj[locale] || valObj['en']
    res = res.replaceAll(key, val)
  }
  return res
}
