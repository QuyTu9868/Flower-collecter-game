// Cac con so can bang game. Chinh o day.
export const CONFIG = {
  GAME_WIDTH: 360,
  GAME_HEIGHT: 640,
  RENDER_SCALE: 2, // game ve o do phan giai gap doi (720x1280) de chu va hinh net, toa do trong code van tinh theo 360x640

  // Ban do (khoang 3 lan man hinh)
  MAP_WIDTH: 2160,
  MAP_HEIGHT: 3840,
  TILE_SIZE: 48,

  CHARACTER_SCALE: 2, // phong to moi nhan vat (player, NPC)
  PLAYER_SPEED: 200,
  CAMERA_LERP: 0.1,
  CAMERA_ZOOM: 0.65, // nho hon 1 = thay rong hon. 0.65 thay ~554 chieu ngang (vong tron cac chi rong 600 bi cat nhe o 2 mep)

  // Can gat ao
  JOY_RADIUS: 50,
  JOY_DEADZONE: 8,

  // Mang va ban
  PLAYER_LIVES: 3,
  INVINCIBLE_MS: 1000,
  BLINK_MS: 160, // toc do nhap nhay khi bat tu (lon hon = cham hon)
  KNOCKBACK_SPEED: 320, // zombie bi ban trung bi day lui
  SHAKE_MS: 150,
  SHAKE_INTENSITY: 0.01,
  FIRE_RANGE: 300,
  FIRE_INTERVAL: 500, // ms giua 2 phat ban luc dau
  FIRE_SPEED_PER_NPC: 0.1, // moi chi nhan du hoa: toc do ban tang them 10% so voi goc
  BULLET_SPEED: 600,
  BULLET_DAMAGE: 1,

  // Zombie
  ZOMBIE_SPEED: 70,
  ZOMBIE_HP: 3,
  ZOMBIE_FIRST_SPAWN: 3000, // ms tinh tu luc bat dau van
  ZOMBIE_SPAWN_INTERVAL: 2500,
  ZOMBIE_MAX: 12,
  ZOMBIE_DENSITY_PER_NPC: 0.05, // moi chi nhan du hoa: zombie dong them 5% so voi goc (sinh nhanh hon, toi da nhieu hon)
  ZOMBIE_DROP_CHANCE: 0.15, // ti le zombie chet roi 1 bong hoa ma cac chi dang can
  ZOMBIE_HARD_FROM: 8, // tu khi co bao nhieu chi nhan du hoa thi bat dau co zombie nhanh va trau
  // Cac loai zombie: speed/hp/scale la he so so voi zombie thuong, chance la ti le moi lan sinh (khi da qua moc tren), tint la mau nhuom
  ZOMBIE_TYPES: {
    normal: { speed: 1, hp: 1, scale: 1, tint: null },
    fast: { speed: 1.6, hp: 0.67, scale: 0.9, tint: 0xff7070, chance: 0.25 },
    tank: { speed: 0.7, hp: 3, scale: 1.35, tint: 0x9a8cff, chance: 0.15 },
  },
  GUIDE_RADIUS: 110, // mui ten chi duong quay quanh player o ban kinh nay
  GUIDE_HIDE_DIST: 140, // da o gan bong hoa hon muc nay thi an mui ten
  PLAYER_LABEL: 'Player', // chu tren dau nhan vat nguoi choi
  ZOMBIE_SPAWN_MIN_DIST: 650, // sinh ra ngoai man hinh
  ZOMBIE_SPAWN_MAX_DIST: 800,
  ZOMBIE_CONTACT: 40, // cham player trong ban kinh nay thi mat 1 mang
  ZOMBIE_BULLET_RADIUS: 30,
  ZOMBIE_RADIUS: 22, // ban kinh than zombie: 2 con khong the lai gan nhau hon (2 x ban kinh), de khong chong len nhau
  ZOMBIE_ZONE_PAD: 30, // zombie khong vao vong tron cac chi (cach vien them chut)

  // NPC: moi nguoi 1 loai hoa. Nguoi cuoi cung (dac biet) chi xuat hien sau khi cac chi con lai nhan du.
  NPC_COUNT: 18,
  FLOWERS_NEEDED: 2,
  FLOWER_SPARE: 2, // so hoa moc ra = so hoa can * he so nay (du dung thua)
  NPC_GIVE_RADIUS: 44,
  NPC_GIVE_DELAY: 5000, // moi chi chi nhan 1 bong moi 5 giay (anim nhan hoa keo dai 3 giay, xem NPC_ANIMS o BootScene)
  FLOWER_SCALE: 2, // phong to bong hoa tren ban do (bong goc khoang 16px)
  FLOWER_ICON_SCALE: 1.5, // icon hoa tren dau cac chi
  FLOWER_HUD_SCALE: 1.5, // icon hoa dang cam o day man hinh
  DECOR_SPACING: 90, // khoang cach toi thieu giua cay, bui va hoa
  TREE_COUNT: 70,
  BUSH_COUNT: 50,
  MUSHROOM_COUNT: 25,
  ROCK_COUNT: 25,
  FLOWER_PICK_RADIUS: 28,
  MAX_CARRY: 3, // toi da 3 bong cung luc, tinh chung moi loai
  MAP_MARGIN: 90,
  NPC_MIN_SPACING: 100,
  NPC_ZONE_RADIUS: 350, // cac chi nam trong vong tron o trung tam ban do

  MINIMAP_WIDTH: 90, // chieu cao tu tinh theo ti le ban do
};

// Cac loai hoa. frame = vi tri bong hoa trong assets/flowers.png (48x48 moi o), color dung cho ban do nho va than chi tam thoi. Nhieu chi co the cung can 1 loai hoa.
// Loai CUOI CUNG (hong) chi danh rieng cho chi dac biet. Cac loai con lai chia deu cho cac chi con lai.
export const FLOWER_TYPES = [
  { name: 'Hoa do', color: 0xe53935, frame: 0 },
  { name: 'Hoa vang', color: 0xfdd835, frame: 1 },
  { name: 'Hoa xanh', color: 0x1e88e5, frame: 2 },
  { name: 'Hoa trang', color: 0xffffff, frame: 3 },
  { name: 'Hoa hong', color: 0xff69b4, frame: 4 },
];

// Ten cac chi theo so thu tu file sprite (npc01 den npc18), hien duoi icon hoa tren dau moi chi. Chi thu 18 (Linhgia) la chi dac biet.
export const NPC_NAMES = [
  'Hailu', 'Vantran', 'PuPu', 'Erina', 'Moby', 'Phuongeo82', 'Dezzy', 'Cipher', 'Papii',
  'Rie', 'BiGi', 'Senju', 'Zesty', 'Poo', 'Yuyuu', 'Susu', 'selena', 'Linhgia',
];

// 5 nhan vat player de chon o man hinh chinh. id trung ten file assets/player_<id>_*.png
export const PLAYERS = [
  { id: 'le33m', name: 'Le33M' },
  { id: 'quang', name: 'Quang' },
  { id: 'tim', name: 'Tim' },
  { id: 'conal', name: 'Conal' },
  { id: 'quytu', name: 'QuyTu' },
];
