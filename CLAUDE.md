# CLAUDE.md - Game "Hoa 20/10"

Game trình duyệt pixel art, top-down shooter kiểu Archero, làm nhân dịp 20/10.
Chi tiết luật chơi và asset: xem **GAME_SPEC.md** (đọc lại mỗi khi bắt đầu 1 checkpoint).

## Người dùng
- Người mới học code, giao tiếp bằng tiếng Việt, gọi là "bạn".
- Giải thích ngắn gọn, thuật ngữ kỹ thuật thì giải thích luôn trong câu.
- Tên biến, tên hàm trong code: 100% tiếng Anh.

## Quy tắc luôn áp dụng
1. **Không dùng dấu gạch dài (em dash)** trong code, comment, chữ hiển thị trong game. Chỉ dùng "-" hoặc bỏ.
2. **Xử lý điều kiện tiên quyết trước**: chức năng nào cần bước chuẩn bị (cài thư viện, tạo database, có asset...) thì kiểm tra và làm bước đó trước, không nhảy thẳng vào chức năng chính.
3. **Báo lỗi thì chẩn đoán trước**: tìm nguyên nhân gốc, giải thích cho người dùng, chờ duyệt rồi mới sửa code.
4. **Gặp thứ không làm được** (thiếu asset, bị chặn mạng, thiếu quyền): báo ngay, dừng lại hỏi, không tự lách.
5. **Lựa chọn ảnh hưởng mạnh tới hình ảnh** (chọn bộ asset, bảng màu...): trình 2-3 phương án cho người dùng chọn, không tự dùng đại.
6. **Thư viện ngoài**: kiểm tra phiên bản còn hoạt động trước khi cài.

## Chống over-engineering
- Ưu tiên giải pháp đơn giản nhất chạy được.
- Không thêm abstraction, tính năng, cấu hình ngoài yêu cầu trong GAME_SPEC.md.
- Muốn làm phức tạp thêm (thêm framework, thêm hệ thống...) thì hỏi trước.
- Các con số cân bằng game (tốc độ, máu, số NPC...) gom vào 1 file `src/config.js` để dễ chỉnh, không cần hơn thế.

## Tech stack
- **Game**: Phaser 3 (engine game 2D chạy trên trình duyệt), JavaScript thuần, Vite (công cụ chạy thử và đóng gói web).
- **Server**: Node.js + Express (chương trình nhỏ nhận và trả điểm).
- **Database**: PostgreSQL trên Supabase (kho lưu bảng xếp hạng). Server kết nối bằng `DATABASE_URL` (dùng chuỗi Session pooler của Supabase).
- **Deploy**: Render, 1 Web Service phục vụ cả game lẫn API.

## Cấu trúc thư mục dự kiến
```
/assets        sprite PNG (player, npc, zombie, flower, tiles)
/src           code game (main.js, config.js, scenes/...)
/server        server Express (index.js, db.js)
GAME_SPEC.md   luật chơi + chuẩn asset
```

## Danh sách checkpoint
Làm lần lượt. Xong mỗi checkpoint: dừng lại, hướng dẫn người dùng chạy thử, chờ xác nhận ok mới làm tiếp.

- [ ] **CP0 - Chuẩn bị**: tạo dự án Vite + Phaser, kiểm tra chạy được trang trắng. Bật chế độ pixel sắc nét (`pixelArt: true`). Khung game dọc 9:16, co giãn vừa màn hình.
- [ ] **CP1 - Bản đồ + di chuyển**: bản đồ lớn (vài lần màn hình), camera đi theo player. Điều khiển WASD/mũi tên và cần gạt ảo khi chạm. Dùng hình khối tạm nếu chưa có asset.
- [ ] **CP2 - Hoa + NPC**: 10 NPC, mỗi người 1 loại hoa. Hoa mọc rải rác, chạm vào là nhặt. Tới gần NPC đúng loại là tặng. Icon trên đầu NPC đúng luật trong spec. Đồng hồ đếm giờ.
- [ ] **CP3 - Zombie + tự bắn**: zombie sinh ra và đuổi theo player. Đứng yên thì tự bắn zombie gần nhất trong tầm, di chuyển thì không bắn. 3 mạng, bất tử ngắn sau khi trúng đòn.
- [ ] **CP4 - Hiệu ứng kiểu Archero**: bóng đổ, nháy trắng khi trúng, đẩy lùi, khói khi chết, rung màn hình, số sát thương bay lên.
- [ ] **CP5 - Thắng/thua**: màn hình kết quả, thắng thì nhập biệt danh, chơi lại.
- [ ] **CP6 - Server + bảng xếp hạng**: Express + Postgres (Supabase), API lưu và lấy top thời gian nhanh nhất. Test ở máy local trước.
- [ ] **CP7 - Ghép asset thật**: thay hình khối tạm bằng sprite trong /assets.
- [ ] **CP8 - Deploy Render**: hướng dẫn từng bước trên dashboard Render (tạo Web Service, đặt biến `DATABASE_URL` là chuỗi Supabase). Không cần tạo Postgres trên Render.
