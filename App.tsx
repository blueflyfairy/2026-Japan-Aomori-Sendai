import React, { useState, useEffect, useRef } from 'react';
import { 
  Plane, 
  Train, 
  Utensils, 
  BedDouble, 
  MapPin, 
  Snowflake, 
  ShoppingBag, 
  Camera, 
  Wallet, 
  CalendarDays, 
  Briefcase, 
  X,
  ExternalLink,
  Navigation,
  Info,
  User,
  Plus,
  Trash2,
  ChevronRight,
  Phone,
  Clock,
  Map as MapIcon,
  ArrowRight,
  Crown,
  FileText,
  Coffee,
  Beer,
  Moon,
  AlertCircle
} from 'lucide-react';

// --- Types ---

interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  type: 'transport' | 'food' | 'activity' | 'hotel' | 'shopping' | 'other';
  note?: string;
  location?: string;
  mapsUrl?: string;
  linkUrl?: string;
  linkLabel?: string; // Custom label for the main link
  additionalLinks?: { label: string; url: string }[]; // Support for multiple links
  tags?: string[];
  tasks?: string;
  guideNote?: string; // For the auto-generated tips
  staffNote?: string; // Special note to show to staff (e.g. JR Reservation form)
}

interface DayData {
  date: string;
  dayLabel: string; // e.g., "D1", "D2"
  weekday: string;
  weather: { temp: string; condition: string; icon: React.ReactNode };
  items: ItineraryItem[];
}

interface Expense {
  id: string;
  item: string;
  amount: number;
  payer: string;
  date: string;
}

// --- Data ---

const ITINERARY_DATA: DayData[] = [
  {
    date: '1/24',
    dayLabel: 'D1',
    weekday: 'SAT',
    weather: { temp: '6°C', condition: '多雲', icon: <Snowflake className="w-5 h-5 text-gray-400" /> },
    items: [
      { id: 'd1-1', time: '15:20', title: '松山機場集合', type: 'other', note: '記得把水果刀、食物剪都托運，行動電源必須放在隨身行李。' },
      { id: 'd1-2', time: '16:50', title: 'NH854 飛往羽田', type: 'transport', note: '飛時2h50m (16:50-20:40)。機型波音787-8。想看富士山去程左邊回程右邊。', tags: ['NH854'] },
      { id: 'd1-3', time: '20:40', title: '下機 / VJW 通關', type: 'other', note: '填寫Visit Japan Web。請芬娟幫爸媽一起填。', linkUrl: 'https://www.letsgojp.com/archives/535150/', linkLabel: 'VJW 填寫教學' },
      { id: 'd1-4', time: '21:00', title: '入住 Villa Fontaine Grand Haneda', type: 'hotel', note: '護照放在純純這，隔天要買 JR Pass 用。需要溫泉券的人請舉手。', location: '羽田機場第3航廈' },
      { id: 'd1-5', time: '21:30', title: '羽田機場覓食', type: 'food', note: '領房卡後可以去吃東西。推薦：荒 (Ara) 牛舌 (T2 4F)、雞だし屋 (T3 4F)、銀座おのでら (T1 2F)' },
      { id: 'd1-6', time: '23:00', title: '處理入境旅平險', type: 'other', note: '隔日生效，請芬娟幫爸媽一起申請。', linkUrl: 'https://www.instagram.com/reels/DBxwhR_xEbo/', linkLabel: '旅平險申請教學' }
    ]
  },
  {
    date: '1/25',
    dayLabel: 'D2',
    weekday: 'SUN',
    weather: { temp: '-1°C', condition: '大雪', icon: <Snowflake className="w-5 h-5 text-blue-300" /> },
    items: [
      { 
        id: 'd2-1', 
        time: '08:30', 
        title: '購買 JR Pass', 
        type: 'transport', 
        note: 'JR東日本旅行服務中心（羽田 T3 2F）。順便預約大件行李空間。\n\n購買 JR東日本・南北海道鐵路周遊券\n大人 35,370日元；兒童（6～11歳）17,680日元（有效期間 6 天）', 
        linkUrl: 'https://www.jreast.co.jp/zh-CHT/multi/pass/easthokkaido.html',
        linkLabel: 'JR Pass 資訊',
        staffNote: `【羽田空港 JRサービスセンター用：購入及び予約依頼書】
1. パスの購入 (購買周遊券)
利用開始日：2026年 1月 25日

2. 指定席の予約 (預約指定席)
【1/25】 東京 → 新青森 はやぶさ 61号 (13:44 → 16:54)
【1/27】 新青森 → 八戸 はやぶさ 20号 (12:39 → 13:06)
【1/29】 八戸 → 仙台 はやぶさ 22号 (13:40 → 14:56)
【1/30】 仙台 → 東京 はやぶさ 20号 (14:31 → 16:04)`
      },
      { id: 'd2-3', time: '11:00', title: '羽田機場午餐', type: 'food', note: '10:30 一個人先去排五代目花山(6大2小)。如果不排隊可選鰻魚飯或燒肉冠軍。', tags: ['必吃'] },
      { id: 'd2-4', time: '12:30', title: 'JR 東京站 至 JR 新青森', type: 'transport', note: 'Hayabusa61号 (13:44 → 16:54)。' },
      { 
        id: 'd2-5', 
        time: '17:00', 
        title: 'Daifukumaru 海の食堂 大福丸', 
        type: 'food', 
        note: '予約番号：SD6535909\n非常推薦，現場氣氛熱烈，有青森舞蹈跟三味線表演。', 
        tags: ['必吃', '預約'] 
      },
      { id: 'd2-7', time: '18:40', title: '入住 ReLabo Medical & Spa', type: 'hotel', note: '房內有準備浴袍和外套。附有小籃子泡湯的時候可以提著裝毛巾或衣服。4F 酒吧，在6樓泡完湯之後，來4樓酒吧喝的第一杯蘋果氣泡酒可以半價喔。（穿著館內家居服OK）' }
    ]
  },
  {
    date: '1/26',
    dayLabel: 'D3',
    weekday: 'MON',
    weather: { temp: '-3°C', condition: '暴雪', icon: <Snowflake className="w-5 h-5 text-blue-400" /> },
    items: [
      { id: 'd3-3', time: '10:30', title: '八甲田纜車', type: 'activity', note: '欣賞樹冰 (Ice Monsters)。', guideNote: '八甲田山樹冰是日本東北冬季絕景之一，被稱為「雪怪」。' },
      { id: 'd3-6', time: '17:00', title: 'A Factory', type: 'shopping', note: '青森伴手禮一站購足。', tags: ['必買'] },
      { id: 'd3-ship', time: '18:00', title: '八甲田丸 Hakkoda-maru', type: 'activity', note: '參觀青函聯絡船「八甲田丸」。這艘鮮黃色的船隻停泊在港口，展示了當年運送火車跨海的歷史，還可以參觀駕駛艙和車輛甲板。', location: 'A-Factory 旁' },
      { id: 'd3-7', time: '19:00', title: '晚餐', type: 'food', note: 'Sushi Restaurant ASUKA 或 南大門燒肉。' }
    ]
  },
  {
    date: '1/27',
    dayLabel: 'D4',
    weekday: 'TUE',
    weather: { temp: '-2°C', condition: '小雪', icon: <Snowflake className="w-5 h-5 text-blue-200" /> },
    items: [
      { id: 'd4-1', time: '08:30', title: '青森魚菜中心 (古川市場)', type: 'food', note: '製作自己的「のっけ丼」。', tags: ['必吃'] },
      { id: 'd4-4', time: '12:30', title: 'JR 新青森 至 JR 八戶', type: 'transport', note: 'Hayabusa20号 (12:39 → 13:06)。\n備用車次：13:16 → 13:39 (23分鐘) Hayabusa22号。' },
      { 
        id: 'd4-6', 
        time: '15:00', 
        title: '入住 星野奧入瀨溪流飯店', 
        type: 'hotel', 
        note: '入住手續結束後，可在大廳享用迎賓飲品。有蘋果汁、蘋果酒（Cider）等飲品。\n\n奧入瀨溪流飯店是本次旅行亮點，請盡情享受。飯店內有岡本太郎設計的巨大暖爐作品「森之神話」與「河神」。晚上可參加「森林學校」講座。入住溪流和室，大面落地窗可欣賞美景。洗衣房位於東西館連通走廊（洗衣劑免費提供）。',
        guideNote: '入住星野奧入瀨溪流飯店！大廳「森之神話」是知名藝術家岡本太郎的作品，背景是整片溪流景緻。',
        staffNote: `【Check in 詢問】
想調整時間：1/28 冰瀑燈光秀 18:45 調整為 17:30（19:20 用餐）
想調整時間：1/27 當天晚上 21:15 冰瀑燈光秀（隔天調整成功則不需要）
想追加預約：1/28 早上奧入瀨溪流巴士觀光 09:55，再四個位置`
      },
      { id: 'd4-act1', time: '16:35', title: '飯店行程：我的第一次雪鞋漫步', type: 'activity', note: '16:35-17:15\n僅預約到 1 個位置 1,500 JPY (Reservation ID: 4226230) 娟娟' },
      { id: 'd4-act2', time: '17:30', title: '飯店行程：冰瀑燈光秀', type: 'activity', note: '17:30-18:30\n僅預約到 1 個位置 1,500 JPY (Reservation ID: 4226202) 芬芬' },
      { 
        id: 'd4-7', 
        time: '19:20', 
        title: '青森蘋果廚房 晚餐', 
        type: 'food', 
        note: 'BUNACO和津輕琉璃加入設計的餐廳空間「青森蘋果廚房」。入口處外的天花板上吊掛著，由津輕琉璃吹製的一顆顆的紅蘋果裝飾，而穿過候位走廊，進入用餐空間，便能見到由BUNACO製作的蘋果燈飾，搭配整體木作為主的裝潢設計，舒適溫馨之中帶有一些可愛童趣。\n\n這裡以酸甜的蘋果入菜，可以享用到堆積成山滿滿的蘋果所製成的各式料理，以蘋果汁為例，就有「津輕」、「王林」與「富士」三種品種的風味選擇，此外生菜沙拉、生魚片、海鮮丼、焗烤餐點、魚料理、現烤時蔬等料理豐富得目不暇給，還有三種酥脆的蘋果乾等甜點，而現烤蘋果派與霜淇淋則是必點甜點。',
        guideNote: '現烤蘋果派與霜淇淋是必吃亮點！隔日早餐則有慢速榨汁機現榨的蘋果汁。' 
      },
      { id: 'd4-rest', time: '20:50', title: '飯店休息', type: 'hotel', note: '冰瀑之湯 6:00 AM - 12:00 PM （11:30-14:30 清場）' }
    ]
  },
  {
    date: '1/28',
    dayLabel: 'D5',
    weekday: 'WED',
    weather: { temp: '-5°C', condition: '雪', icon: <Snowflake className="w-5 h-5 text-blue-300" /> },
    items: [
      { id: 'd5-1', time: '07:30', title: '飯店早餐', type: 'food', note: '享用慢速榨汁機現榨蘋果汁，感受自然的恩惠。' },
      { 
        id: 'd5-2', 
        time: '09:55', 
        title: '飯店行程：奧入瀨溪流巴士觀光', 
        type: 'activity', 
        note: '09:55-10:40\n僅預約到 4 個位置，免費 (Reservation ID: 4227031)' 
      },
      { 
        id: 'd5-3', 
        time: '10:50', 
        title: '飯店行程：十和田湖繞行巴士', 
        type: 'activity', 
        note: '10:50-12:30\n僅預約到 1 個位置 (Reservation ID: 4225136)。' 
      },
      { 
        id: 'd5-bus', 
        time: '12:45', 
        title: '飯店行程：奧入瀨溪流溫泉滑雪場接駁巴士', 
        type: 'transport', 
        note: '12:45-12:50（回程接駁15:00）\n活動：搭纜車上山＋雪上樂園\n全員預約，3,300/人 (Reservation ID: 4225136)',
        linkUrl: 'https://hoshino-area.jp/skipark/',
        linkLabel: '雪上公園玩耍連結'
      },
      { id: 'd5-lunch', time: '14:10', title: '奧入瀨溪流溫泉滑雪場食事処吃午餐', type: 'food', note: '有拉麵、咖喱飯、豚丼等。' },
      { id: 'd5-5', time: '18:45', title: '冰瀑燈光秀', type: 'activity', note: '全員預約。1500 JPY/人。' },
      { 
        id: 'd5-6', 
        time: '19:20', 
        title: '青森蘋果廚房 晚餐', 
        type: 'food', 
        note: '「青森蘋果廚房」餐廳空間設計溫馨溫潤。可以享用到堆積成山滿滿的蘋果所製成的各式料理。\n\n蘋果汁有「津輕」、「王林」與「富士」三種品種風味。現烤蘋果派與霜淇淋是必吃甜點，很適合搭配現磨咖啡作為一餐的完美句點。',
        guideNote: '再次加強印象！這間飯店餐廳以蘋果入菜，生魚片、海鮮丼等豐富料理目不暇給。'
      },
      { id: 'd5-rest', time: '21:00', title: '飯店休息', type: 'hotel', note: '把握在奧入瀨最後一晚的溫泉時光。' }
    ]
  },
  {
    date: '1/29',
    dayLabel: 'D6',
    weekday: 'THU',
    weather: { temp: '2°C', condition: '晴時多雲', icon: <Snowflake className="w-5 h-5 text-yellow-500" /> },
    items: [
      { id: 'd6-bk', time: '07:30', title: '飯店早餐', type: 'food', note: '享用星野豐盛的日西式早餐。' },
      { id: 'd6-2', time: '13:40', title: 'JR 八戶 至 JR 仙台', type: 'transport', note: 'Hayabusa22号 (13:40 → 14:56)。' },
      { 
        id: 'd6-4', 
        time: '16:30', 
        title: '入住 天然溫泉 杜都の湯 御宿 野乃仙台', 
        type: 'hotel', 
        note: '離仙台站 650 公尺，走路 7 分鐘，可走一段商店街。館內的天然溫泉大浴場位於14樓，設有以伊達政宗頭盔為靈感的裝飾。另提供宵夜「夜鳴拉麵」和泡湯後冰棒等。', 
        linkUrl: 'https://www.gltjp.com/zh-hant/directory/item/16268/',
        linkLabel: '飯店設施介紹'
      },
      { 
        id: 'd6-6', 
        time: '19:00', 
        title: '仙台仔虎 燒肉', 
        type: 'food', 
        note: '米澤牛燒肉。Res ID: IR0513789744。仙台駅前店。提供高品質米澤牛，肉質細嫩，油花分佈均勻。', 
        linkUrl: 'https://team-toranomon.com/',
        linkLabel: '仔虎官網',
        tags: ['必吃'] 
      },
      { id: 'd6-night1', time: '21:30', title: '夜鳴拉麵', type: 'food', note: '飯店免費宵夜，全家一起來一碗熱騰騰的拉麵。' },
      { id: 'd6-night2', time: '22:00', title: '推薦居酒屋：Chotsugai', type: 'food', note: '晩酌と晩御飯 ちょうつがひ。感受仙台在地居酒屋氛圍。' },
      { id: 'd6-night3', time: '23:00', title: '深夜食堂', type: 'food', note: '超過 23 點也可以跟櫃檯拿拉麵泡麵版XD' },
      { id: 'd6-rest', time: '23:30', title: '飯店休息', type: 'hotel', note: '14樓露天溫泉超讚，睡前可以再去泡一下。' }
    ]
  },
  {
    date: '1/30',
    dayLabel: 'D7',
    weekday: 'FRI',
    weather: { temp: '4°C', condition: '晴天', icon: <Snowflake className="w-5 h-5 text-yellow-400" /> },
    items: [
      { 
        id: 'd7-1', 
        time: '07:30', 
        title: '飯店早餐：仙台名物自助餐', 
        type: 'food', 
        note: '極為豐盛的「在地特色自助餐」，主打仙台名物牛舌、海鮮丼吃到飽 (可自製)、現炸天婦羅、毛豆麻糬等。菜色超過50種。', 
        linkUrl: 'https://www.instagram.com/reel/DI58QWJzAU4/?igsh=aDllc3p3cG42M2t6',
        linkLabel: '早餐特色介紹',
        tags: ['必吃'] 
      },
      { id: 'd7-2', time: '09:15', title: '飯店 Check Out', type: 'hotel', note: '9:20 退房寄放行李。' },
      { 
        id: 'd7-4', 
        time: '12:00', 
        title: '仙台逛街：重點攻略', 
        type: 'shopping', 
        note: '✨LoFt：2-4樓美妝、文具雜貨。2F有Lush，5F有Muji (有童裝)。\n✨Parco2：茅乃舍。\n✨Yodobashi：西口從二樓空橋穿過車站即達。UQ、GU、Daiso。',
        guideNote: 'Loft 的二樓 Lush 不能退稅；SPAL 一樓的 Muji 可以退稅。'
      },
      { id: 'd7-6', time: '14:31', title: 'JR 仙台 至 JR 東京', type: 'transport', note: 'Hayabusa20号 (14:31 → 16:04)。' },
      { id: 'd7-7', time: '17:00', title: '入住 Villa Fontaine Grand Haneda', type: 'hotel', note: '再次入住羽田機場飯店。需要溫泉券的舉手！' },
      { 
        id: 'd7-shop', 
        time: '17:10', 
        title: '羽田花園逛街', 
        type: 'shopping', 
        note: '「KOKUYO DOORS」直營店、Lawson、藥妝店松本清。' 
      },
      { 
        id: 'd7-dinner', 
        time: '19:00', 
        title: '羽田機場晚餐推薦', 
        type: 'food', 
        note: '✨五代目花山：招牌鬼ひも川烏龍麵。\n✨四代目菊川：90年老店現烤蒲燒鰻魚飯。\n✨今半壽喜燒、銀座天一。',
        tags: ['必吃'] 
      },
      { id: 'd7-dessert', time: '20:00', title: '羽田機場甜點：伊藤園/茶寮翠泉', type: 'food', note: '睡前最後的日式甜點享受。' },
      { id: 'd7-rest', time: '22:00', title: '飯店休息', type: 'hotel', note: '整理行李，準備隔天早班機。' }
    ]
  },
  {
    date: '1/31',
    dayLabel: 'D8',
    weekday: 'SAT',
    weather: { temp: '8°C', condition: '多雲', icon: <Snowflake className="w-5 h-5 text-gray-400" /> },
    items: [
      { id: 'd8-1', time: '08:30', title: '早餐', type: 'food', note: '星巴克或者便利商店。' },
      { id: 'd8-2', time: '10:00', title: '飯店 Check Out', type: 'hotel', note: '記得把水果刀、食物剪都托運，行動電源必須放在隨身行李。' },
      { 
        id: 'd8-3', 
        time: '10:00', 
        title: '燒肉卷外帶上機', 
        type: 'food', 
        note: '燒肉冠軍 羽田機場第三航廈店 📍位置：T3 四樓江戶小路 08-22\n\n機場名物「焼肉チャンピオンロール（燒肉冠軍飯捲）」。出自惠比壽知名燒肉店，嚴選A5級黑毛和牛。飯卷表面鋪滿芝麻，內餡是滿滿燒肉搭配酸辣泡菜醬汁，口感層次豐富。',
        tags: ['必吃', '外帶']
      },
      { id: 'd8-4', time: '10:30', title: '機場安檢前吃點東西', type: 'food', note: 'らぁ麺 雞だし屋 (10:00-20:30) 或 仙台牛たん 荒 (09:00-22:00)。' },
      { id: 'd8-5', time: '10:40', title: '登機托運', type: 'transport', note: '再次檢查：水果刀、食物剪都托運，行動電源隨身。' },
      { id: 'd8-6', time: '11:00', title: '安檢後休息', type: 'other', note: 'Starbucks、Tully\'s。' },
      { 
        id: 'd8-7', 
        time: '11:30', 
        title: '最後伴手禮推薦', 
        type: 'shopping', 
        note: '1. SNOWS 半熟感起司\n2. LeTao 紅茶巧克力伯爵餅乾\n3. 砂糖樹冬季限定口味',
        tags: ['必買']
      },
      { 
        id: 'd8-8', 
        time: '12:40', 
        title: 'NH853 飛往台北', 
        type: 'transport', 
        note: '12:40-15:50 HND- TSA\n飛時 4h10m。機型波音 787-8。想看富士山回程請坐右邊。',
        tags: ['NH853']
      }
    ]
  }
];

const HOTELS = [
  { name: 'Villa Fontaine Grand Haneda', date: '1/24 & 1/30', address: '羽田機場第3航廈', note: '直結機場，有溫泉' },
  { name: 'ReLabo Medical & Spa', date: '1/25 - 1/26', address: '青森市', note: '蘋果汁無限暢飲' },
  { name: '星野集團 奧入瀨溪流飯店', date: '1/27 - 1/28', address: '奧入瀨溪流', note: '冰瀑燈光秀，奧入瀨美景' },
  { name: '天然溫泉 杜都の湯 御宿 野乃仙台', date: '1/29', address: '仙台市', note: '全館塌塌米，14樓頂層溫泉' }
];

// --- Components ---

const Tag: React.FC<{ text: string }> = ({ text }) => {
  let color = "bg-stone-100 text-stone-600 border border-stone-200";
  if (text === "必吃") color = "bg-amber-50 text-amber-800 border border-amber-100";
  if (text === "必買") color = "bg-rose-50 text-rose-800 border border-rose-100";
  
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-sm ${color}`}>
      {text}
    </span>
  );
};

const ItineraryView: React.FC<{ 
  selectedDayIndex: number; 
  setSelectedDayIndex: (index: number) => void;
  setModalItem: (item: ItineraryItem | null) => void;
}> = ({ selectedDayIndex, setSelectedDayIndex, setModalItem }) => {
  const currentDay = ITINERARY_DATA[selectedDayIndex];
  const scrollRef = useRef<HTMLDivElement>(null);

  const getIcon = (type: ItineraryItem['type']) => {
    switch (type) {
      case 'transport': return <Train className="w-4 h-4" />;
      case 'food': return <Utensils className="w-4 h-4" />;
      case 'activity': return <Camera className="w-4 h-4" />;
      case 'hotel': return <BedDouble className="w-4 h-4" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="pb-32 pt-2 px-6 space-y-8">
      <div className="overflow-x-auto no-scrollbar -mx-6 px-6 pb-2" ref={scrollRef}>
        <div className="flex space-x-6 w-max">
          {ITINERARY_DATA.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center justify-center transition-all duration-300 ${
                idx === selectedDayIndex ? 'opacity-100 scale-110' : 'opacity-40'
              }`}
            >
              <span className="text-[10px] tracking-widest uppercase mb-1 font-medium">{day.weekday}</span>
              <span className={`text-2xl font-serif font-medium leading-none mb-2 ${idx === selectedDayIndex ? 'text-stone-900' : 'text-stone-500'}`}>
                {day.date.split('/')[1]}
              </span>
              <div className={`w-1 h-1 rounded-full ${idx === selectedDayIndex ? 'bg-stone-800' : 'bg-transparent'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="relative pt-2">
        <div className="absolute left-[5.5rem] top-4 bottom-0 w-px bg-stone-200"></div>
        <div className="space-y-10">
          {currentDay.items.map((item) => (
            <div key={item.id} className="relative flex items-start group" onClick={() => setModalItem(item)}>
              <div className="w-16 text-right pr-4 pt-1 shrink-0">
                 <span className="font-serif text-lg text-stone-900 font-medium">{item.time}</span>
              </div>
              <div className="relative flex flex-col items-center w-6 pt-2.5 z-10 shrink-0">
                 <div className="w-2 h-2 bg-stone-300 rounded-full ring-4 ring-[#F9F8F4] group-hover:bg-stone-500 transition-colors"></div>
              </div>
              <div className="flex-1 pl-4 cursor-pointer">
                <div className="pt-0.5 active:opacity-70 transition-opacity">
                   <h3 className="font-serif text-xl text-stone-800 mb-1 leading-tight">{item.title}</h3>
                   <div className="flex items-center space-x-2 mb-2">
                      <span className="flex items-center space-x-1 text-[10px] font-medium text-stone-400 tracking-widest uppercase">
                         {getIcon(item.type)}
                         <span>{item.type}</span>
                      </span>
                   </div>
                   {item.note && <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{item.note}</p>}
                   {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">{item.tags.map(t => <Tag key={t} text={t} />)}</div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DetailModal: React.FC<{ item: ItineraryItem; onClose: () => void }> = ({ item, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#F9F8F4] w-full sm:max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up overflow-hidden border border-white/50">
                <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full shadow-sm"><X className="w-4 h-4 text-stone-600" /></button>
                <div className="flex-1 overflow-y-auto">
                    <div className="pt-10 px-6 pb-2 text-center">
                        <p className="text-stone-500 font-mono-num mb-2 tracking-widest text-base">{item.time}</p>
                        <h2 className="text-3xl font-serif font-medium text-stone-900 leading-tight">{item.title}</h2>
                        {item.location && <p className="text-stone-500 mt-2 font-serif text-base">{item.location}</p>}
                    </div>
                    <div className="px-6 space-y-6 pb-10 mt-6">
                        {item.guideNote && (
                            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
                                <p className="text-stone-700 text-lg leading-8 font-serif">{item.guideNote}</p>
                            </div>
                        )}
                        {item.staffNote && (
                            <div className="bg-stone-800 text-white p-5 rounded-xl">
                                <div className="flex items-center space-x-2 mb-3 border-b border-white/20 pb-2"><FileText className="w-5 h-5" /><span className="font-bold text-sm uppercase">站務員專用資訊</span></div>
                                <pre className="whitespace-pre-wrap font-sans text-stone-300 text-sm leading-relaxed">{item.staffNote}</pre>
                            </div>
                        )}
                        {item.note && (
                            <div className="space-y-3">
                                <h4 className="font-serif text-sm text-stone-400 tracking-widest uppercase">Details</h4>
                                <p className="text-stone-700 leading-8 text-lg whitespace-pre-wrap">{item.note}</p>
                            </div>
                        )}
                        {item.linkUrl && (
                             <a href={item.linkUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition">
                                <span className="text-base font-medium text-stone-700">{item.linkLabel || '查看參考網頁'}</span>
                                <ExternalLink className="w-5 h-5 text-stone-400" />
                             </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'toolbox'>('itinerary');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [modalItem, setModalItem] = useState<ItineraryItem | null>(null);

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 font-sans selection:bg-stone-200">
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#F9F8F4]/90 backdrop-blur-md border-b border-stone-200/50 pt-safe">
         <div className="px-6 py-4 text-center">
             <p className="text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-1">Family Trip</p>
             <h1 className="text-xl font-serif font-medium text-stone-900 tracking-wide">青森溫泉之旅 <span className="text-xs bg-stone-200 rounded-full px-2 py-0.5 ml-1">2026</span></h1>
         </div>
      </div>

      <main className="pt-24 min-h-screen">
        {activeTab === 'itinerary' && (
          <ItineraryView selectedDayIndex={selectedDayIndex} setSelectedDayIndex={setSelectedDayIndex} setModalItem={setModalItem} />
        )}
        {activeTab === 'toolbox' && (
          <div className="p-6 space-y-10 pb-32">
             <section>
                <h3 className="font-serif text-lg font-medium text-stone-800 mb-4">住宿概覽</h3>
                <div className="space-y-4">
                   {HOTELS.map((h, i) => (
                       <div key={i} className="border-b border-stone-200 pb-4 last:border-0">
                           <h4 className="font-serif text-stone-800 font-medium">{h.name}</h4>
                           <p className="text-xs text-stone-400 mt-1 uppercase tracking-wide">{h.date}</p>
                           <p className="text-sm text-stone-500 mt-1">{h.address}</p>
                           <p className="text-sm text-stone-700 font-serif italic mt-2">“{h.note}”</p>
                       </div>
                   ))}
                </div>
             </section>
          </div>
        )}
      </main>

      <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center">
        <div className="bg-[#1c1c1e] text-stone-400 rounded-full px-8 py-3 flex items-center shadow-2xl space-x-12 ring-1 ring-white/10">
          <button onClick={() => setActiveTab('itinerary')} className={`flex flex-col items-center transition-colors ${activeTab === 'itinerary' ? 'text-white' : 'hover:text-stone-200'}`}>
            <CalendarDays className="w-5 h-5" /><span className="text-[9px] mt-1 font-medium tracking-wide">行程</span>
          </button>
          <button onClick={() => setActiveTab('toolbox')} className={`flex flex-col items-center transition-colors ${activeTab === 'toolbox' ? 'text-white' : 'hover:text-stone-200'}`}>
            <Briefcase className="w-5 h-5" /><span className="text-[9px] mt-1 font-medium tracking-wide">住宿資訊</span>
          </button>
        </div>
      </div>

      {modalItem && <DetailModal item={modalItem} onClose={() => setModalItem(null)} />}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .pt-safe { padding-top: env(safe-area-inset-top, 0px); }
      `}</style>
    </div>
  );
};

export default App;