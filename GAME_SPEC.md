# GAME_SPEC - Hoa 20/10

## Ý tưởng
Người chơi chạy quanh 1 khu vườn lớn, nhặt hoa và mang tới tặng các chị (NPC). Zombie xuất hiện cản đường, người chơi bắn hạ bằng súng. Tặng đủ hoa cho tất cả là thắng. Xếp hạng theo thời gian hoàn thành nhanh nhất.

- Chơi 1 người, trên trình duyệt (điện thoại và máy tính).
- Phong cách: pixel art, top-down shooter, camera và cảm giác chơi giống game **Archero** trên mobile.
- Không có phần thưởng.

## Màn hình và camera
- Khung game **dọc** như điện thoại. Trên máy tính hiện 1 khung dọc ở giữa màn hình.
- Góc nhìn chếch từ trên xuống (thấy mặt nhân vật).
- **1 bản đồ lớn**, camera đi theo player.
- Nhân vật **không xoay 360 độ**. Chia 8 hướng (mỗi hướng 45 độ): phải, chéo xuống, xuống, chéo lên, lên (vẽ sẵn), 3 hướng bên trái là bản lật của bên phải. Khi bắn, súng chĩa vào zombie theo 8 hướng đó.

## Điều khiển
- Máy tính: WASD hoặc phím mũi tên.
- Điện thoại: chạm bất kỳ đâu rồi kéo để chạy (cần gạt ảo), buông tay là dừng.
- Không có nút bắn.

## Bắn
- **Đứng yên** thì tự động quay về và bắn **zombie gần nhất trong tầm bắn**.
- **Đang di chuyển thì không bắn**.
- Đạn vô hạn. Viên đạn nhỏ, bay thấy rõ, có vệt sáng.
- Hiện 1 vòng tròn mờ quanh player thể hiện tầm bắn.

## NPC (các chị)
- **18 người** (để số lượng trong config, dễ đổi).
- Mỗi người cần **1 loại (màu) hoa**, tối đa **2 bông**.
- Đứng yên ở các vị trí rải rác trên bản đồ.
- Icon trên đầu:
  - Chưa nhận bông nào: chỉ hiện **icon hoa** người đó cần.
  - Đã nhận: icon hoa kèm số **x1**, **x2**.
  - Đủ 2 bông: **icon biến mất**.
- Tặng hoa: player cầm đúng loại hoa đi tới gần NPC là tự tặng. Khi một chị nhận đủ hoa, tên chị bay lên trên đầu chị và hiện thông báo tốc độ bắn, zombie tăng bao nhiêu %. Mỗi chị nhận 1 bông mỗi 5 giây, anim nhận hoa kéo dài 3 giây. Mỗi chị nhận đủ hoa: tốc độ bắn tăng thêm 10% so với gốc, zombie đông thêm 5% so với gốc.
- **NPC đặc biệt (chị thứ 18, tên Linhgia, màu hoa hồng, đã có sprite `npc18_*`)**: ẩn lúc đầu, chỉ xuất hiện (không có chữ thông báo) sau khi 17 chị còn lại đã nhận đủ hoa. Lúc đó hoa hồng mọc ra trên map, hoa thường còn lại vẫn nằm đó nhưng không nhặt được nữa, hoa đang cầm bị bỏ để không chiếm chỗ hoa hồng. Tặng đủ hoa cho chị này mới thắng. Mỗi chị cần 2 bông.

## Hoa
- 5 loại hoa (4 màu thường + hồng). Nhiều chị có thể cùng cần 1 màu, hoa hồng chỉ dành cho chị đặc biệt. Số hoa mọc ra gấp đôi số hoa cần.
- Mọc rải rác trên bản đồ, đủ số lượng cho mọi NPC (mỗi loại ít nhất 2 bông). Chỉ nhặt được loại hoa mà vẫn còn chị cần (tính cả hoa đang cầm); hoa không còn ai cần thì mờ đi và không nhặt được.
- Chạm vào là nhặt. Player cầm được nhiều hoa cùng lúc.

## Zombie
- Sinh ra theo thời gian ở các vị trí xa player, đi về phía player.
- Bị bắn trúng: nháy trắng, bị đẩy lùi nhẹ, hiện số sát thương bay lên.
- Chết: nổ khói bụi nhỏ rồi biến mất, có 15% rơi 1 bông hoa mà các chị đang cần (sau khi Linhgia xuất hiện thì rơi hoa hồng).
- Từ khi 8 chị nhận đủ hoa: có thêm zombie **nhanh** (chạy nhanh hơn, ít máu, nhuộm đỏ) và zombie **trâu** (to hơn, 3 lần máu, chậm, nhuộm tím).

## Mạng, thắng, thua
- Player có **3 mạng**. Bị zombie chạm thì mất 1 mạng, nháy đỏ, rung màn hình nhẹ, **bất tử khoảng 1 giây**.
- Hết mạng: **thua**, hiện màn hình thua, nút chơi lại.
- Tặng đủ hoa cho tất cả NPC: **thắng**, dừng đồng hồ, nhập biệt danh để lưu thành tích.
- **Không giới hạn thời gian**. Đồng hồ đếm lên từ lúc bắt đầu.

## Bảng xếp hạng
- Xếp theo **thời gian hoàn thành nhanh nhất** (ít giây nhất đứng đầu).
- Lưu: biệt danh, thời gian, ngày chơi.
- Hiện top 10 ở màn hình chính và màn hình thắng.
- Chỉ ván thắng mới được lưu.
- Server kiểm tra cơ bản: biệt danh không rỗng, tối đa 16 ký tự; thời gian là số hợp lệ trong khoảng hợp lý.

## Hiệu ứng (game tự làm bằng code, không cần vẽ)
- Bóng đổ hình bầu dục dưới chân mọi nhân vật.
- Nhân vật nhún nhấp nhô khi chạy.
- Nháy trắng/đỏ, đẩy lùi, rung màn hình, khói khi chết, số sát thương.

## Chuẩn asset
- Pixel art, **khung 48x48 px** (đã vẽ thử cả 32 và 48, bản 48 rõ chi tiết hơn). Mọi asset nhân vật dùng chung 1 cỡ khung.
- PNG nền trong suốt. Sprite sheet: các khung xếp **ngang 1 hàng**, khung nào cũng cùng cỡ.
- Hiển thị phóng to bằng nearest-neighbor (Phaser `pixelArt: true`), không làm mờ.
- Nhân vật vẽ **quay mặt sang phải**, game tự lật khi quay trái.

### Player (đã có bản nháp trong /assets)
| File | Số khung | Ghi chú |
|---|---|---|
| player_idle.png | 10 | đứng thở cầm súng, 2 khung x 5 góc nhìn (ngang, thẳng mặt, quay lưng, chéo xuống, chéo lên) |
| player_run.png | 20 | chạy không súng, 4 khung x 5 góc nhìn |
| player_shoot.png | 10 | giương súng, giật + lửa đầu nòng, 2 khung x 5 hướng (E, SE, NE, S, N) |

### NPC (người dùng tự vẽ, thả file vào /assets là game tự nhận)
| Animation | Số khung | Cách chạy |
|---|---|---|
| idle | 2-4 | đung đưa nhẹ, lặp liên tục |
| receive | 3-4 | khi nhận 1 bông, chạy 1 lần (kéo dài 3 giây) rồi về idle |
| complete | vài khung | khi đủ 2 bông, chạy 1 lần rồi **giữ khung cuối** tới hết ván |

Tên file: `npc01_idle.png`, `npc01_receive.png`, `npc01_complete.png` ... đến `npc18_*` (01 đến 17 là các chị thường, 18 là chị đặc biệt đã có). Khung 48x48, xếp ngang 1 hàng, chân chạm đáy khoảng hàng pixel thứ 40, quay mặt thẳng. Chị nào chưa có file thì game dùng hình khối tạm. Thiếu receive hoặc complete thì bỏ qua anim đó (chỉ cần idle). Màu hoa mỗi chị cần: 01, 05, 09, 13, 17 = đỏ; 02, 06, 10, 14 = vàng; 03, 07, 11, 15 = xanh; 04, 08, 12, 16 = trắng; 18 = hồng.

### Còn lại (dùng asset có sẵn)
Zombie (đi 4 khung), 5 loại hoa (icon), đạn, nền vườn và cây cối.
- Chỉ dùng asset giấy phép **CC0** (dùng tự do, ví dụ Kenney, OpenGameArt).
- Phải là pixel art nhìn từ trên xuống, cỡ hợp với khung 48x48.
- **Trình 2-3 bộ asset cho người dùng chọn trước khi dùng.**

## Âm thanh
- Tạo bằng code (không có file âm thanh): tiếng bắn, trúng zombie, zombie chết, mất mạng, nhặt hoa, tặng hoa, chị nhận đủ hoa, chị cuối xuất hiện, thắng, thua, bấm nút.
- Có nhạc nền lặp nhẹ trong ván chơi.
- Nút "Âm: BẬT/TẮT" ở góc dưới bên phải màn hình, nhớ lựa chọn lần sau.

## Mũi tên chỉ đường
- Có mũi tên quay quanh player, chỉ tới bông hoa cần gần nhất, màu mũi tên trùng màu hoa. Ẩn khi đã đứng gần hoa.
- Chỉ bật 2 lần: khi chỉ còn đúng 1 loại hoa thường cuối cùng, và khi hoa hồng đã mở khóa (chỉ tới hoa hồng).

## Nhân vật player và màn hình chính
- 5 nhân vật để chọn ở màn hình chính (lưu lựa chọn lần sau): Le33M, Quang, Tim, Conal, QuyTu. Mỗi người đủ 8 hướng đi, đứng, bắn như nhau, file `assets/player_<id>_idle|run|shoot.png` (id: le33m, quang, tim, conal, quytu), tạo bằng `tools/make-players.mjs`. Mascot robot cũ (`player_idle.png`...) không còn trong danh sách chọn.
- Màn hình chính: tên game có hoa, chọn nhân vật, bảng xếp hạng top 10, nút Bắt đầu, nút Cách chơi, nút bật tắt âm thanh. Nền cỏ có hoa cây và cánh hoa rơi.
- Nút "Cách chơi" mở bảng hướng dẫn ngắn.
- Tạm dừng: nút "II Dừng" ở góc dưới trái hoặc phím P / Esc. Bảng tạm dừng có Tiếp tục và Về màn chính.
- Thắng: hiện bảng có ảnh nhân vật, thời gian, ô nhập biệt danh (điền sẵn tên lần trước, hoặc tên nhân vật), nút Lưu, sau đó là hạng và top 10.
