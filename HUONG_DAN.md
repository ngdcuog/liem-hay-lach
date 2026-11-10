# Liêm hay Lách? – Hướng dẫn cài đặt và chơi

Quiz nhiều người chơi kiểu Kahoot. Máy chiếu hiện câu hỏi, bảng điểm và thanh "Niềm tin của lớp". Mỗi đội dùng 1 điện thoại để trả lời, bí mật đưa "phong bì" và tố giác đội khác.

## Các file

| File | Dùng để |
|---|---|
| `host.html` | Màn hình MC, mở trên laptop nối máy chiếu |
| `index.html` | Trang cho điện thoại các đội (vào bằng mã QR) |
| `config.js` | Cấu hình Firebase của nhóm (phải điền ở Bước 1) |
| `common.js`, `common.css` | Phần dùng chung, luật chơi nằm trong `CONFIG` |
| `thu_nghiem.html` | Diễn tập trên 1 máy: 1 màn MC + 4 điện thoại giả lập |

## Bước 1: Tạo Firebase (khoảng 10 phút, miễn phí)

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

   Luật này chỉ mở nhánh `rooms/` cho game. Game không lưu thông tin cá nhân (chỉ tên đội, đáp án, điểm). Xóa database sau buổi học.
4. Về **Project Overview**, bấm biểu tượng `</>` (Web) ở dòng "Select a platform" (hoặc **Settings → Project settings → Your apps → `</>`**), đặt tên app, bấm **Register app** (không cần bật Hosting). Copy đoạn `firebaseConfig = { ... }`.
5. Mở `config.js`, thay dòng `window.FIREBASE_CONFIG = null;` bằng:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "...",
     authDomain: "...",
     databaseURL: "https://...asia-southeast1.firebasedatabase.app",
     projectId: "...",
     appId: "..."
   };
   ```

   Bắt buộc phải có `databaseURL`. Nếu đoạn copy không có, lấy URL ở đầu trang Realtime Database.
   (Với ứng dụng web, `apiKey` của Firebase được phép công khai; phần bảo vệ nằm ở Rules.)

## Bước 2: Đưa game lên mạng (GitHub Pages, miễn phí)

1. Đăng nhập github.com, bấm **New repository**, đặt tên `liem-hay-lach`, chọn **Public**, bấm **Create repository**.
2. Trong repo: **Add file → Upload files**, kéo thả các file `host.html`, `index.html`, `config.js`, `common.js`, `common.css`, `thu_nghiem.html`, bấm **Commit changes**.
3. **Settings → Pages**, mục Source chọn **Deploy from a branch**, Branch chọn `main` và `/ (root)`, bấm **Save**. Chờ 1–2 phút.
4. Link cho MC: `https://<tên-github>.github.io/liem-hay-lach/host.html`. Điện thoại không cần nhớ link, chỉ cần quét QR trên màn hình MC.

## Bước 3: Thử thật trước ngày 14/11

1. Laptop mở `host.html`, chọn **Online**, bấm **Tạo phòng**.
2. 4–6 điện thoại quét QR và chọn tên đội. Nên thử cả Wi-Fi trường lẫn 4G.
3. Chơi 2–3 câu: thử đưa phong bì, thử tố giác, xem thanh tra.

## Trên lớp

- Laptop nối máy chiếu, mở `host.html`, bấm **Toàn màn hình** (phím F).
- Mỗi đội cử 1 người cầm điện thoại, cả đội cùng bàn: đủ điều kiện "100% sinh viên tham gia".
- Phím tắt: **Space/Enter** sang bước tiếp, **M** tắt tiếng, **F** toàn màn hình.
- Lỡ tải lại trang MC: màn hình đầu có nút **Tiếp tục ván dở**.
- Mất mạng: chọn chế độ **Thủ công** (các đội giơ tay, MC bấm đội đúng, phong bì do "người gác cổng" ghi lại), hoặc dùng game dự phòng `../Ho_so_Liem_chinh.html` (chạy offline).

## Kịch bản MC (khoảng 10 phút, 8 câu)

| Thời điểm | MC làm gì |
|---|---|
| 0:00–1:00 | Các đội quét QR trong lúc MC đọc ô "Luật chơi" trên màn hình |
| Mỗi câu (~50 giây) | Cửa sau 12 giây → câu hỏi 20 giây → đáp án và giải thích |
| Sau câu 3, 6, 8 | Thanh tra. Gợi ý: "Đội nào thấy điểm đội khác tăng bất thường?" để các đội tố giác |
| Sau câu 4 | Màn 2 "Siết kỷ luật". Hỏi lớp: "Giờ còn ai dám?" (nối với "không dám") |
| Cuối ván | 3 màn: Tổng kết niềm tin → Bảng xếp hạng → Sự thật được bật mí. Nối sang kết luận: tham nhũng hại cả người trong sạch, cần đủ bốn chữ KHÔNG |

## Luật chơi (chỉnh trong `common.js` → `CONFIG`, `PERKS`)

| Luật | Giá trị |
|---|---|
| Vốn mỗi đội | 300 điểm |
| Trả lời đúng | +100, nhanh thêm tới +50 |
| Phong bì "Lộ đề" | 50 điểm: câu tới chỉ còn 2 đáp án trên điện thoại của đội |
| Phong bì "Chạy điểm" | 80 điểm: câu tới nhân đôi điểm |
| Phong bì "Xóa án" | 70 điểm: câu sai gần nhất được tính đúng (+100) |
| Thanh tra phát hiện | Màn 1: 30%, Màn 2: 60%; mỗi phong bì đội đã đưa trước đó +10% (tối đa 90%) |
| Bị phát hiện | Thu hồi toàn bộ điểm có được nhờ phong bì và phạt gấp đôi số đã đưa |
| Tố giác (1 lần/đội) | Đúng +100 (Màn 2: +200), sai −50 |
| Niềm tin của lớp | Mỗi phong bì −7%, mỗi vụ bị xử lý +3%; cuối ván dưới 50% thì mọi đội −20% |
| Đội liêm chính | Không đưa phong bì nào: +100 |

## Câu hỏi

Câu hỏi nằm trong `host.html` (mảng `QUESTIONS`), mỗi câu có ghi căn cứ. Nhóm kiểm tra lại các căn cứ trước khi dùng (xem mục 8 trong tài liệu khung nội dung).

## Diễn tập trên 1 máy

Mở `thu_nghiem.html` qua link GitHub Pages: màn hình MC bên trái, 4 điện thoại giả lập bên phải, không cần Firebase. Mở thẳng bằng cách nhấp đúp file (`file://`) có thể không đồng bộ được giữa các khung.
