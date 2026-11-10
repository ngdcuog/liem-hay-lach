# Liêm hay Lách? – Hướng dẫn cài đặt và chơi (bản chơi cá nhân)

Quiz nhiều người chơi kiểu Kahoot, **mỗi bạn chơi một mình** trên điện thoại của mình. Máy chiếu hiện câu hỏi, bảng điểm và thanh "Niềm tin của lớp". Mỗi bạn trả lời, bí mật đưa "phong bì" để lấy lợi thế, và có thể tố giác bạn khác.

## Luồng một phiên chơi

| Bước | Host (laptop, máy chiếu) | Người chơi (điện thoại) |
|---|---|---|
| 1. Mở phòng | Mở `host.html`, bấm **Mở phòng**: hiện mã phòng và mã QR | |
| 2. Vào phòng | Thấy danh sách tên hiện dần, bấm vào tên để xóa người vào nhầm | Quét QR, nhập tên, vào sảnh chờ |
| 3. Bắt đầu | Bấm **Bắt đầu** (Space) | |
| 4. Chơi | Cửa sau → câu hỏi → đáp án; thanh tra sau câu 3, 6, 8 | Chọn phong bì, trả lời, tố giác |
| 5. Kết thúc | Hết câu hỏi, hoặc bấm **Kết thúc ngay** ở thanh trên cùng | Thấy hạng và điểm của mình |
| 6. Bảng thành tích | 3 màn: Tổng kết niềm tin → Bảng thành tích (podium, top 10, nút hiện đủ) → Sự thật được bật mí | |
| 7. Kết thúc phiên | Bấm **Kết thúc phiên chơi**: dữ liệu phòng bị xóa | Thấy "Phiên chơi đã kết thúc" cùng kết quả của mình |

## Các file

| File | Dùng để |
|---|---|
| `host.html` | Màn hình MC, mở trên laptop nối máy chiếu |
| `index.html` | Trang cho điện thoại người chơi (vào bằng mã QR) |
| `config.js` | Cấu hình Firebase của nhóm (đã điền) |
| `common.js`, `common.css` | Phần dùng chung, luật chơi nằm trong `CONFIG` và `PERKS` |
| `thu_nghiem.html` | Diễn tập trên 1 máy: 1 màn MC + 4 điện thoại giả lập (thêm `?mode=firebase` để thử qua Firebase thật) |

## Bước 1: Tạo Firebase (khoảng 10 phút, miễn phí)

Nhóm đã tạo xong project và điền `config.js`. Nếu cần làm lại:

1. Vào https://console.firebase.google.com, bấm **Add project**, đặt tên (ví dụ `liem-hay-lach`), tắt Google Analytics, bấm **Create**.
2. Menu bên trái **Databases & Storage → Realtime Database** (giao diện cũ gọi mục này là "Build"; hoặc gõ "Realtime Database" vào ô **Search for products**). Bấm **Create Database**, chọn vị trí **Singapore (asia-southeast1)**, chọn **Start in locked mode**, bấm **Enable**.
3. Mở tab **Rules**, xóa hết rồi dán đoạn dưới, bấm **Publish**:

   ```json
   {
     "rules": {
       "rooms": {
         "$room": { ".read": true, ".write": true }
       }
     }
   }
   ```

   Luật này chỉ mở nhánh `rooms/` cho game. Game không lưu thông tin cá nhân nào ngoài tên người chơi (tự nhập), đáp án và điểm. Hạn chế đã biết: không có đăng nhập nên một bạn rành kỹ thuật có thể đọc dữ liệu thô của phòng (ví dụ xem ai đã đưa phong bì). Phù hợp cho buổi học, không dùng cho thi cử.
4. Về **Project Overview**, bấm biểu tượng `</>` (Web) ở dòng "Select a platform" (hoặc **Settings → Project settings → Your apps → `</>`**), đặt tên app, bấm **Register app** (không cần bật Hosting). Copy đoạn `firebaseConfig = { ... }` và dán vào `config.js`. Bắt buộc phải có `databaseURL`.

Giới hạn gói miễn phí (Spark): tối đa **100 kết nối cùng lúc**. Lớp khoảng 35 người cộng host là dư; chỉ cần nhắc các bạn không mở nhiều tab.

## Bước 2: Đưa game lên mạng (GitHub Pages, miễn phí)

1. Đăng nhập github.com, bấm **New repository**, đặt tên `liem-hay-lach`, chọn **Public**, bấm **Create repository**.
2. Trong repo: **Add file → Upload files**, kéo thả các file `host.html`, `index.html`, `config.js`, `common.js`, `common.css`, `thu_nghiem.html`, bấm **Commit changes**.
3. **Settings → Pages**, mục Source chọn **Deploy from a branch**, Branch chọn `main` và `/ (root)`, bấm **Save**. Chờ 1–2 phút.
4. Link cho MC: `https://<tên-github>.github.io/liem-hay-lach/host.html`. Người chơi không cần nhớ link, chỉ cần quét QR trên màn hình MC.

## Bước 3: Thử thật trước ngày 14/11

1. Laptop mở `host.html`, chọn **Online**, bấm **Mở phòng**.
2. 4–6 bạn quét QR bằng điện thoại và nhập tên. Nên thử cả Wi-Fi trường lẫn 4G.
3. Chơi 2–3 câu: thử đưa phong bì, thử tố giác, xem thanh tra, rồi **Kết thúc ngay** và **Kết thúc phiên chơi** để xem trọn luồng.

## Trên lớp

- Laptop nối máy chiếu, mở `host.html`, bấm **Toàn màn hình** (phím F). Cho cả lớp quét QR ngay từ đầu buổi.
- Mỗi người một điện thoại: đủ điều kiện "100% sinh viên tham gia". Bạn nào không có điện thoại thì chơi chung với bạn bên cạnh.
- Phím tắt: **Space/Enter** sang bước tiếp, **M** tắt tiếng, **F** toàn màn hình.
- Lỡ tải lại trang MC: màn hình đầu có nút **Tiếp tục ván dở**.
- Tên trùng nhau được tự đánh số, ví dụ "An (2)".
- Mất mạng hẳn: dùng game dự phòng `../Ho_so_Liem_chinh.html` (chạy offline, chơi theo nhóm bằng ngón tay).

## Kịch bản MC (khoảng 10 phút, 8 câu)

| Thời điểm | MC làm gì |
|---|---|
| 0:00–1:00 | Mọi người quét QR trong lúc MC đọc ô "Luật chơi" trên màn hình |
| Mỗi câu (~50 giây) | Cửa sau 12 giây → câu hỏi 20 giây → đáp án và giải thích |
| Sau câu 3, 6, 8 | Thanh tra. Gợi ý: "Ai thấy điểm bạn khác tăng bất thường?" để mọi người tố giác |
| Sau câu 4 | Màn 2 "Siết kỷ luật". Hỏi lớp: "Giờ còn ai dám?" (nối với "không dám") |
| Cuối ván | Tổng kết niềm tin → Bảng thành tích → Sự thật được bật mí. Nối sang kết luận: tham nhũng hại cả người trong sạch, cần đủ bốn chữ KHÔNG. Cuối cùng bấm **Kết thúc phiên chơi** |

Lưu ý khi MC chiếu "Sự thật được bật mí": màn này chỉ nêu **số lượng** phong bì lọt lưới, không nêu tên ai. Tên chỉ xuất hiện với những bạn đã bị thanh tra hoặc bị tố giác phát hiện, ngay trong lúc chơi.

## Luật chơi (chỉnh trong `common.js` → `CONFIG`, `PERKS`)

| Luật | Giá trị |
|---|---|
| Vốn mỗi người | 300 điểm |
| Trả lời đúng | +100, nhanh thêm tới +50 |
| Phong bì "Lộ đề" | 50 điểm: câu tới chỉ còn 2 đáp án trên điện thoại của bạn |
| Phong bì "Chạy điểm" | 80 điểm: câu tới nhân đôi điểm |
| Phong bì "Xóa án" | 70 điểm: câu sai gần nhất được tính đúng (+100) |
| Thanh tra phát hiện | Màn 1: 30%, Màn 2: 60%; mỗi phong bì bạn đã đưa trước đó +10% (tối đa 90%) |
| Bị phát hiện | Thu hồi toàn bộ điểm có được nhờ phong bì và phạt gấp đôi số đã đưa |
| Tố giác | Mỗi đợt thanh tra 1 lần. Đúng +100 (Màn 2: +200, chỉ 3 người tố đầu tiên cùng một đối tượng được thưởng), sai −50 |
| Niềm tin của lớp | Mỗi phong bì làm giảm 25% ÷ số người chơi (tối thiểu chia 4); mỗi vụ bị xử lý hồi 10% ÷ số người. Hết ván dưới 50% thì **mọi người −20% điểm** |
| Liêm chính | Không đưa phong bì nào: +100 |

Với lớp 35 người, mỗi phong bì làm niềm tin giảm khoảng 0,7%. Nếu một nửa lớp đưa phong bì ở mọi lượt thì niềm tin sụp xuống dưới 50% và cả lớp bị trừ điểm: đúng thông điệp "tham nhũng hại cả người trong sạch".

## Câu hỏi

Câu hỏi nằm trong `host.html` (mảng `QUESTIONS`), mỗi câu có ghi căn cứ. Nhóm kiểm tra lại các căn cứ trước khi dùng (xem mục 8 trong tài liệu khung nội dung).

## Sau buổi học

Bấm **Kết thúc phiên chơi** là dữ liệu phòng đã bị xóa (chỉ còn một nút `state` nhỏ). Nếu muốn dọn hẳn: Firebase Console → Realtime Database → nút `rooms` → dấu `×` để xóa.
