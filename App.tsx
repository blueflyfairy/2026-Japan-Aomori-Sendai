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
  Moon
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

// --- Data (Extracted from PDF) ---

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
        additionalLinks: [
          { label: 'JR東日本旅行服務中心位置', url: 'https://www.jreast.co.jp/zh-CHT/multi/customer_support/service_center_haneda.html' }
        ],
        staffNote: `【羽田空港 JRサービスセンター用：購入及び予約依頼書】
1. パスの購入 (購買周遊券)

商品名： JR東日本・南北海道鉄道周遊券 (6日間連続)

人数：
大人 (12歳以上)：6名
子供 (6歳〜11歳)：2名 (座席が必要な幼児用)

利用開始日：2026年 1月 25日

2. 指定席の予約 (預約指定席)

条件： すべて「特大荷物スペース付座席」を希望
座席数：合計 8 席
備考： 8席のため、車両が分かれても構いません。できるだけ近い車両（または前後）をお願いします。

【1/25】
区間： 東京 → 新青森
列車： はやぶさ 61号 (13:44 → 16:54)

【1/27】
区間： 新青森 → 八戸
列車： はやぶさ 20号 (12:39 → 13:06)

【1/29】
区間： 八戸 → 仙台
列車： はやぶさ 22号 (13:40 → 14:56)

【1/30】
区間： 仙台 → 東京
列車： はやぶさ 20号 (14:31 → 16:04)`
      },
      { 
        id: 'd2-2', 
        time: '09:00', 
        title: 'T3 觀景台 & 逛街', 
        type: 'activity', 
        note: 'T3 5F 展望台看飛機起降\nT3 5F TOKYO POP TOWN，紀念品區逛逛\nTIAT Sky Road 從4樓羽田日本橋走到5樓後，再往左走就能走進「TIAT Sky Road」。這裡是一個相對較小的區塊，展示了各家航空的飛機模型等。走到盡頭還能體驗飛行模擬器。\n也有兒童遊戲室，詳細位置請參考連結。', 
        linkUrl: 'https://tokyo-haneda.com/zh-CHT/service/facilities/kids_space.html',
        linkLabel: '兒童遊戲室位置參考'
      },
      { id: 'd2-3', time: '11:00', title: '羽田機場午餐', type: 'food', note: '10:30 一個人先去排五代目花山(6大2小)。如果不排隊可選鰻魚飯或燒肉冠軍。', tags: ['必吃'] },
      { id: 'd2-4', time: '12:30', title: 'JR 東京站 至 JR 新青森', type: 'transport', note: 'Hayabusa61号 (13:44 → 16:54)。移動至東京車站搭車。\n\n【備用參考車次】\n13:20 → 16:43 (3小时 23分鐘)\nHayabusa23号 (到 新函館北斗)\n月台: 22番月台\n\n12:20 → 15:29 (3小时 09分鐘)\nHayabusa21号 (到 新函館北斗)\n月台: 22番月台' },
      { 
        id: 'd2-5', 
        time: '17:00', 
        title: 'Daifukumaru 海の食堂 大福丸', 
        type: 'food', 
        note: '予約番号：SD6535909\n手機號碼：05060309021\n\n非常推薦，現場氣氛熱烈，有青森舞蹈跟三味線表演。', 
        guideNote: '大福丸是體驗青森祭典文化的絕佳餐廳！不僅能品嚐新鮮扇貝味噌燒，每晚還有熱血沸騰的睡魔祭伴奏與三味線現場演出，氣氛極嗨！', 
        tags: ['必吃', '預約'] 
      },
      { 
        id: 'd2-lo', 
        time: '18:00', 
        title: 'LOVINA 逛街', 
        type: 'shopping', 
        note: '青森車站共構的購物中心，雖然不大但好逛。有 CanDo 百葉元店、松本清藥妝、各式雜貨與服飾。適合晚餐後稍微逛逛消化。', 
        location: '青森車站'
      },
      { id: 'd2-6', time: '18:30', title: 'acure 販賣機', type: 'shopping', note: '青森車站附近。各種不同品種蘋果汁的販賣機，推薦王林。', linkUrl: 'https://www.instagram.com/reels/DBxwhR_xEbo/', linkLabel: '販賣機介紹影片' },
      { 
        id: 'd2-7', 
        time: '18:40', 
        title: '入住 ReLabo Medical & Spa', 
        type: 'hotel', 
        note: `【6F Lounge BlueZone】(06:00～24:00)
由名師松葉啓操刀，能品嚐多品種青森蘋果、飲品，並設有露天木質平台俯瞰津輕海峽。
★15:00～24:00：2款青森蘋果汁、1款鮮果水無限暢飲。15:00 鮮切蘋果(限量)。
★17:00～19:00：加碼糖質ZERO的啤酒。
★06:00～10:00：提供營養師監修的新鮮蔬果昔(共7種口味)。

【貼心服務】
房內有準備了浴袍和外套。附有小籃子泡湯的時候可以提著裝毛巾或衣服。
4F 酒吧，在6樓泡完湯之後，來4樓酒吧喝的第一杯蘋果氣泡酒可以半價喔。（穿著館內家居服OK）

【飯店設施】
C.I: 15:00 / C.O: 11:00
★月光舒緩瑜珈（限6名）：20:00～20:30，¥3,500
★晨間喚能瑜珈（限10名）：08:00～08:30，¥1,000
★6F 温泉 (絲滑浴池、桑拿)：男湯「藍」、女湯「蓮」。
★6F 健身房：06:00～24:00 (飲水機有熱水)。

*註：飯店可能沒有洗衣機。`, 
        linkUrl: 'https://www.jrtimes.tw/article.aspx?article_id=628', 
        linkLabel: '飯店開箱文章',
        additionalLinks: [
           { label: '溫泉設施介紹', url: 'https://relabo.com/hotspring/bath.php' },
           { label: '健身房介紹', url: 'https://relabo.com/wellness/fitness.php' }
        ]
      },
      { id: 'd2-rest', time: '19:00', title: '返回飯店休息', type: 'hotel', note: '享受飯店設施，喝蘋果汁、泡溫泉。', guideNote: '第一天大移動比較辛苦，建議早點休息，明天要去八甲田山看樹冰！' }
    ]
  },
  {
    date: '1/26',
    dayLabel: 'D3',
    weekday: 'MON',
    weather: { temp: '-3°C', condition: '暴雪', icon: <Snowflake className="w-5 h-5 text-blue-400" /> },
    items: [
      { id: 'd3-1', time: '07:30', title: '早餐', type: 'food', note: '房間吃前一天買的或星巴克，也可以去 6F Lounge 喝果昔。' },
      { id: 'd3-2', time: '09:00', title: '包車前往八甲田山', type: 'transport', note: 'Lovina 前集合。9:20 包車出發，車程約50分鐘。雪備：青森縣立美術館 或 廣田神社。', linkUrl: 'https://hakkoda-ropeway.jp/', linkLabel: '八甲田纜車官網' },
      { id: 'd3-3', time: '10:30', title: '八甲田纜車', type: 'activity', note: '搭乘時間約10分鐘。欣賞樹冰 (Ice Monsters)。山頂公園站有步道。', guideNote: '八甲田山樹冰是日本東北冬季絕景之一，被稱為「雪怪」。搭乘纜車空中漫步，俯瞰整片被冰雪覆蓋的針葉林，場面壯觀震撼。', mapsUrl: 'https://goo.gl/maps/example' },
      { id: 'd3-4', time: '13:30', title: '返回市區 / 廣田神社', type: 'activity', note: '廣田神社是日本唯一以「病厄除守護」為主題的神社。有蘋果水手舍、睡魔燈籠。', tags: ['蘋果御守'] },
      { id: 'd3-5', time: '16:00', title: '睡魔之家 WARASSE', type: 'activity', note: '欣賞4座實際遊行過的大型睡魔燈籠。體驗祭典舞蹈「跳人」。' },
      { id: 'd3-6', time: '17:00', title: 'A Factory', type: 'shopping', note: '青森伴手禮一站購足，有蘋果氣泡酒、蘋果派。', tags: ['必買'] },
      { 
        id: 'd3-ship', 
        time: '18:00', 
        title: '八甲田丸 Hakkoda-maru', 
        type: 'activity', 
        note: '參觀青函聯絡船「八甲田丸」。這艘鮮黃色的船隻停泊在港口，展示了當年運送火車跨海的歷史，還可以參觀駕駛艙和車輛甲板。', 
        location: 'A-Factory 旁' 
      },
      { id: 'd3-7', time: '19:00', title: '晚餐', type: 'food', location: '青森車站附近', note: '推薦：Sushi Restaurant ASUKA (炸玉米激推)、南大門燒肉、Osanai食堂。' },
      { id: 'd3-rest', time: '20:30', title: '返回飯店休息', type: 'hotel', note: '結束充實的一天，回飯店泡湯放鬆。' }
    ]
  },
  {
    date: '1/27',
    dayLabel: 'D4',
    weekday: 'TUE',
    weather: { temp: '-2°C', condition: '小雪', icon: <Snowflake className="w-5 h-5 text-blue-200" /> },
    items: [
      { id: 'd4-1', time: '08:30', title: '青森魚菜中心 (古川市場)', type: 'food', note: '製作自己的「のっけ丼」(Nokke-don)。先去3號北都商店拿熱飯。', guideNote: '古川市場必玩「自助海鮮丼」！先買餐券換白飯，再拿著碗穿梭各攤位，挑選喜歡的生魚片、干貝、甜蝦，組合成獨一無二的豪華早餐。', linkUrl: 'https://vocus.cc/article/69231cdbfd89780001589eb2', linkLabel: '海鮮丼點餐攻略', tags: ['必吃'] },
      { id: 'd4-2', time: '09:30', title: '青森縣觀光物產館 ASPAM', type: 'shopping', note: '走路約 700 公尺。買 pampam 蘋果派。' },
      { id: 'd4-3', time: '12:00', title: 'JR 青森 至 JR 新青森', type: 'transport', note: '12:14 → 12:19。準備轉搭新幹線。' },
      { 
        id: 'd4-4', 
        time: '12:30', 
        title: 'JR 新青森 至 JR 八戶', 
        type: 'transport', 
        note: 'Hayabusa20号 (12:39 → 13:06)。到達後記得採買食物、泡麵。\n\n【備用車次】\n13:16 → 13:39 ( 23分鐘 )\nHayabusa22号\n月台: 14番月台' 
      },
      { id: 'd4-5', time: '13:50', title: '搭乘飯店接駁巴士', type: 'transport', note: '八戶站西口巴士站上車。Res ID: 4090543。' },
      { 
        id: 'd4-6', 
        time: '15:00', 
        title: '入住 星野奧入瀨溪流飯店', 
        type: 'hotel', 
        note: '入住手續結束後，可在大廳享用迎賓飲品（蘋果汁、Cider）。\n入住溪流和室，榻榻米空間、大面落地窗，可直接欣賞奧入瀨溪流與森林美景。\n\n*洗衣房位於東西館之間的連通走廊，洗衣劑需自行投入（飯店免費提供）。',
        guideNote: '【奧入瀨溪流飯店】\n\n飯店擁有大面積透明玻璃窗，將溪流美景鑲嵌如畫。\n\n★東館大廳「森之神話」：巨大暖爐是岡本太郎的作品，背景是整片溪流景緻。\n★西館 Lounge「河神」：晚間舉辦「森林學校」講座。\n\n在充滿藝術氣息的空間中，享受與自然合一的住宿體驗。',
        linkUrl: 'https://www.jrtimes.tw/article.aspx?article_id=214',
        linkLabel: '飯店詳細介紹',
        staffNote: `【Check in 詢問 (Request for Changes)】

1. 想調整時間：
   1/28 冰瀑燈光秀 18:45 → 調整為 17:30 (為了 19:20 用餐)

2. 想調整時間：
   1/27 當天晚上 21:15 冰瀑燈光秀 (若隔天調整成功則不需要)

3. 想追加預約：
   1/28 早上奧入瀨溪流巴士觀光 09:55，再追加 4 個位置

*備註：18:00 前可以取消隔日行程
冰瀑燈光秀時段：①17:30 ②18:45 ③20:00 ④21:15`
      },
      {
        id: 'd4-act1',
        time: '16:35',
        title: '我的第一次雪鞋漫步',
        type: 'activity',
        note: '16:35-17:15\n僅預約到 1 個位置 1,500 JPY (Reservation ID: 4226230) 娟娟'
      },
      {
        id: 'd4-act2',
        time: '17:30',
        title: '冰瀑燈光秀',
        type: 'activity',
        note: '17:30-18:30\n僅預約到 1 個位置 1,500 JPY (Reservation ID: 4226202) 芬芬'
      },
      { 
        id: 'd4-7', 
        time: '19:20', 
        title: '青森蘋果廚房 晚餐', 
        type: 'food', 
        note: 'Res ID: 4087045。必吃現烤蘋果派與霜淇淋。\n\nBUNACO和津輕琉璃加入設計的餐廳空間「青森蘋果廚房」。入口處外的天花板上吊掛著，由津輕琉璃吹製的一顆顆的紅蘋果裝飾，而穿過候位走廊，進入用餐空間，便能見到由BUNACO製作的蘋果燈飾，搭配整體木作為主的裝潢設計，舒適溫馨之中帶有一些可愛童趣。\n\n這裡以酸甜的蘋果入菜，可以享用到堆積成山滿滿的蘋果所製成的各式料理，以蘋果汁為例，就有「津輕」、「王林」與「富士」三種品種的風味選擇，此外生菜沙拉、生魚片、海鮮丼、焗烤餐點、魚料理、現烤時蔬等料理豐富得目不暇給，還有三種酥脆的蘋果乾等甜點，而現烤蘋果派與霜淇淋則是必點甜點，很適合搭配現磨咖啡作為一餐的完美句點。',
        guideNote: '青森蘋果廚房以蘋果為主題，從裝潢到料理都充滿巧思。必喝三種品種的蘋果汁評比，還有現烤蘋果派是絕對不能錯過的美味！' 
      },
      { id: 'd4-rest', time: '20:50', title: '飯店休息', type: 'hotel', note: '冰瀑之湯 06:00 - 12:00 (11:30-14:30 清場)' }
    ]
  },
  {
    date: '1/28',
    dayLabel: 'D5',
    weekday: 'WED',
    weather: { temp: '-5°C', condition: '雪', icon: <Snowflake className="w-5 h-5 text-blue-300" /> },
    items: [
      { id: 'd5-1', time: '07:30', title: '飯店早餐', type: 'food', note: 'Res ID: 4090489。供應蘋果汁慢磨機。' },
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
        note: '10:50-12:30\nRes ID: 4225136。3300/人。' 
      },
      { 
        id: 'd5-bus', 
        time: '12:45', 
        title: '飯店行程：奧入瀨溪流溫泉滑雪場接駁巴士', 
        type: 'transport', 
        note: '12:45-12:50（回程接駁15:00）\n全員預約，3,300/人 (Reservation ID: 4225136)\n\n活動：搭纜車上山 + 雪上樂園',
        linkUrl: 'https://hoshino-area.jp/skipark/', // Assuming a general link or generic
        linkLabel: '雪上公園資訊'
      },
      { 
        id: 'd5-lunch', 
        time: '14:10', 
        title: '滑雪場午餐', 
        type: 'food', 
        note: '奧入瀨溪流溫泉滑雪場食事処吃午餐。\n有拉麵、咖喱飯、豚丼等。' 
      },
      { id: 'd5-5', time: '18:45', title: '冰瀑燈光秀', type: 'activity', note: 'Res ID: 4225899。全員預約。1500 JPY/人。' },
      { 
        id: 'd5-6', 
        time: '19:20', 
        title: '青森蘋果廚房 晚餐', 
        type: 'food', 
        note: 'Res ID: 4090493。必吃現烤蘋果派與霜淇淋。\n\nBUNACO和津輕琉璃加入設計的餐廳空間「青森蘋果廚房」。入口處外的天花板上吊掛著，由津輕琉璃吹製的一顆顆的紅蘋果裝飾，而穿過候位走廊，進入用餐空間，便能見到由BUNACO製作的蘋果燈飾，搭配整體木作為主的裝潢設計，舒適溫馨之中帶有一些可愛童趣。\n\n這裡以酸甜的蘋果入菜，可以享用到堆積成山滿滿的蘋果所製成的各式料理，以蘋果汁為例，就有「津輕」、「王林」與「富士」三種品種的風味選擇，此外生菜沙拉、生魚片、海鮮丼、焗烤餐點、魚料理、現烤時蔬等料理豐富得目不暇給，還有三種酥脆的蘋果乾等甜點，而現烤蘋果派與霜淇淋則是必點甜點，很適合搭配現磨咖啡作為一餐的完美句點。',
        guideNote: '青森蘋果廚房以蘋果為主題，從裝潢到料理都充滿巧思。必喝三種品種的蘋果汁評比，還有現烤蘋果派是絕對不能錯過的美味！'
      },
      { id: 'd5-rest', time: '21:00', title: '飯店休息', type: 'hotel', note: '最後一晚享受奧入瀨的寧靜與溫泉。' }
    ]
  },
  {
    date: '1/29',
    dayLabel: 'D6',
    weekday: 'THU',
    weather: { temp: '2°C', condition: '晴時多雲', icon: <Snowflake className="w-5 h-5 text-yellow-500" /> },
    items: [
      { id: 'd6-bk', time: '07:30', title: '飯店早餐', type: 'food', note: '享受飯店早餐與慢磨蘋果汁。' },
      { id: 'd6-1', time: '12:15', title: '飯店包車至八戶', type: 'transport', note: '享受退房前的時光，12:00 Check Out。' },
      { 
        id: 'd6-2', 
        time: '13:40', 
        title: 'JR 八戶 至 JR 仙台', 
        type: 'transport', 
        note: 'Hayabusa22号 (13:40 → 14:56)。' 
      },
      { id: 'd6-3', time: '15:15', title: '仙台牛舌午餐', type: 'food', note: '仙台車站 3F 牛舌通 (善治郎/伊達)。不吃牛可吃壽司/豬排。', linkUrl: 'https://tw.wamazing.com/media/article/a-803/', linkLabel: '仙台牛舌名店推薦' },
      { 
        id: 'd6-4', 
        time: '16:30', 
        title: '入住 天然溫泉 杜都の湯 御宿 野乃仙台', 
        type: 'hotel', 
        note: `離仙台站 650 公尺，走路 7 分鐘，可走一段商店街。
仙台市地下鐵南北線「廣瀨通站 Hirose-dori」東2出口步行1分鐘。

館內的天然溫泉大浴場位於最上層14樓，設有以伊達政宗的頭盔為靈感設計的醒目裝飾，充滿現代感的室內湯，以及別具風情的石造露天溫泉。溫泉水源來自仙台當地系列飯店所擁有的自家溫泉，讓旅客在市中心也能盡享正宗的天然溫泉療癒體驗。此外，還有高溫乾式三溫暖和冷水浴等完善設施。

另提供多種免費服務，有宵夜的「夜鳴拉麵」和泡湯後冰棒等。`, 
        linkUrl: 'https://www.gltjp.com/zh-hant/directory/item/16268/', 
        linkLabel: '飯店設施介紹' 
      },
      { id: 'd6-5', time: '18:00', title: '鯛吉 鯛魚燒 & 阿部蒲鉾店', type: 'food', note: '名掛丁本店。必吃炸葫蘆魚板。', tags: ['必吃'] },
      { 
        id: 'd6-6', 
        time: '19:00', 
        title: '仙台仔虎 燒肉', 
        type: 'food', 
        note: '米澤牛燒肉。Res ID: IR0513789744。仙台駅前店。\n\n提供高品質的米澤牛，肉質細嫩，油花分佈均勻。',
        linkUrl: 'https://team-toranomon.com/',
        linkLabel: '仔虎官網'
      },
      { id: 'd6-night1', time: '21:30', title: '夜鳴拉麵', type: 'food', note: '飯店免費提供的宵夜拉麵，別錯過了！' },
      { id: 'd6-night2', time: '22:00', title: '推薦居酒屋', type: 'food', note: 'Chotsugai (晩酌と晩御飯 ちょうつがひ)。氣氛很好的居酒屋。' },
      { id: 'd6-night3', time: '23:00', title: '深夜食堂', type: 'food', note: '超過23點也可以跟櫃檯拿拉麵泡麵版XD' }
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
        title: '飯店早餐', 
        type: 'food', 
        note: '極為豐盛的「在地特色自助餐」，主打仙台名物牛舌、海鮮丼吃到飽 (可自製)、現炸天婦羅 (蝦子與蔬菜)、以及宮城特色美食如白石溫麵、毛豆麻糬等，並有獨特的全自動鬆餅機，菜色超過50種。', 
        linkUrl: 'https://www.instagram.com/reel/DI58QWJzAU4/?igsh=aDllc3p3cG42M2t6',
        linkLabel: '早餐介紹影片'
      },
      { id: 'd7-2', time: '09:15', title: '飯店 Check Out', type: 'hotel', note: '9:20 退房寄放行李。' },
      { id: 'd7-3', time: '09:30', title: '仙台朝市', type: 'food', note: '齋藤惣菜店可樂餅、牡蠣拉麵。', guideNote: '仙台朝市被稱為「仙台的廚房」。必吃齋藤惣菜店的炸可樂餅，外酥內軟且價格親民。冬季還有新鮮肥美的烤牡蠣和海鮮丼，充滿在地人情味。', tags: ['必吃'] },
      { 
        id: 'd7-4', 
        time: '12:00', 
        title: '逛街 (Loft/Parco/SPAL)', 
        type: 'shopping', 
        note: `✨LoFt：2-4樓美妝、文具、日用品雜貨。這棟就可以逛好久。
   - 2F: Lush (不能退稅)
   - 5F: Muji (不能退稅，SPAL一樓的無印當店退稅，但這間有小孩衣服)
   - 6F: 宜得利

✨Parco2：茅乃舍

✨Yodobashi：在車站東口 (西口從二樓空橋穿過車站也可到，走二樓空橋超近)。
   - UQ, GU, ABC mart
   - 6F: 很多餐廳
   - 二館 1F: 戶外運動用品 (石井科托瓦藝術運動) 超大超好逛
   - 二館 2F: Daiso, Threepy` 
      },
      { id: 'd7-5', time: '13:00', title: '午餐', type: 'food', note: '烤牛舌專門店 司 (西口名掛丁店)。' },
      { 
        id: 'd7-6', 
        time: '14:31', 
        title: 'JR 仙台 至 JR 東京', 
        type: 'transport', 
        note: 'Hayabusa20号 (14:31 → 16:04)。' 
      },
      { id: 'd7-7', time: '17:00', title: '入住 Villa Fontaine Grand Haneda', type: 'hotel', note: '再次入住，準備隔天早班機。\n\n*需要溫泉券的請舉手！' },
      { 
        id: 'd7-shop', 
        time: '17:10', 
        title: '羽田花園逛街', 
        type: 'shopping', 
        note: 'KOKUYO DOORS (日本文具品牌 KOKUYO 直營店)\nLawson\n藥妝店松本清' 
      },
      { 
        id: 'd7-dinner', 
        time: '19:00', 
        title: '羽田機場用餐', 
        type: 'food', 
        note: `✨五代目花山うどん
📍羽田機場第3航廈4樓 Edo Market 11-22 (19:00 後比較不用排隊)
擁有130年歷史，招牌「鬼ひも川」烏龍麵寬達5厘米，彈牙口感搭配鮮美湯頭，令人回味。（冷的比較Q）

✨人形町今半（壽喜燒）
✨銀座天一（天婦羅）

✨鰻魚飯 うなぎ四代目菊川
📍羽田機場第3航廈4樓 Edo Market 11-22
90年老店，現烤蒲燒鰻魚外皮酥脆、肉質鮮嫩，秘製醬汁讓風味獨特。` 
      },
      { 
        id: 'd7-dessert', 
        time: '20:00', 
        title: '羽田機場甜點推薦', 
        type: 'food', 
        note: '茶寮 伊藤園\n京都 茶寮翠泉' 
      }
    ]
  },
  {
    date: '1/31',
    dayLabel: 'D8',
    weekday: 'SAT',
    weather: { temp: '8°C', condition: '多雲', icon: <Snowflake className="w-5 h-5 text-gray-400" /> },
    items: [
      { id: 'd8-1', time: '08:30', title: '早餐', type: 'food', note: '星巴克或者便利商店' },
      { id: 'd8-2', time: '10:00', title: '飯店 Check Out', type: 'hotel', note: '記得把水果刀、食物剪都托運，行動電源必須放在隨身行李' },
      { 
        id: 'd8-3', 
        time: '10:00', 
        title: '燒肉卷外帶上機', 
        type: 'food', 
        note: '燒肉冠軍 羽田機場第三航廈店 焼肉チャンピオン 羽田空港第３ターミナル店 📍位置：T3 四樓江戶小路 08-22\n\n機場名物「焼肉チャンピオンロール（燒肉冠軍飯捲）」。它出自於東京惠比壽的知名燒肉店「焼肉チャンピオン（燒肉冠軍）」，這家店以其嚴選的A5級黑毛和牛聞名，並以獨門醬汁提升肉品風味。\n而其飯卷表面鋪滿芝麻，內餡是滿滿的燒肉，搭配酸辣泡菜醬汁，口味濃郁且口感層次豐富。',
        tags: ['必吃', '外帶']
      },
      { id: 'd8-4', time: '10:30', title: '機場安檢前吃點東西', type: 'food', note: 'らぁ麺　鶏だし屋 10:00-20:30\n仙台牛たん 荒 09:00-22:00' },
      { id: 'd8-5', time: '10:40', title: '登機托運', type: 'transport', note: '記得把水果刀、食物剪都托運，行動電源必須放在隨身行李' },
      { id: 'd8-6', time: '11:00', title: '安檢後', type: 'other', note: 'Starbucks、Tully\'s' },
      { 
        id: 'd8-7', 
        time: '11:30', 
        title: '伴手禮推薦', 
        type: 'shopping', 
        note: 'SNOWS 半熟感起司\nLeTao 紅茶巧克力伯爵餅乾\n砂糖樹冬季限定口味',
        tags: ['必買']
      },
      { 
        id: 'd8-8', 
        time: '12:40', 
        title: 'NH853 飛往松山', 
        type: 'transport', 
        note: '12:40-15:50 HND- TSA\n機型波音787-8\n想看富士山去程左邊回程右邊。',
        tags: ['NH853']
      }
    ]
  }
];

const FLIGHTS = [
  { code: 'NH854', route: 'TSA ➝ HND', time: '16:50 - 20:40', date: '1/24', detail: '波音 787-8' },
  { code: 'NH853', route: 'HND ➝ TSA', time: '12:40 - 15:50', date: '1/31', detail: '波音 787-8' }
];

const HOTELS = [
  { name: 'Villa Fontaine Grand Haneda', date: '1/24 & 1/30', address: '羽田機場第3航廈', note: '直結機場，有溫泉' },
  { name: 'ReLabo Medical & Spa', date: '1/25 - 1/26', address: '青森市', note: '蘋果汁無限暢飲' },
  { name: '星野集團 奧入瀨溪流飯店', date: '1/27 - 1/28', address: '奧入瀨溪流', note: '冰瀑燈光秀，蘋果廚房' },
  { name: 'Onyado Nono Sendai', date: '1/29', address: '仙台市', note: '全館塌塌米，宵夜拉麵' }
];

const EMERGENCY_CONTACTS = [
  { name: '旅外國人急難救助', phone: '+81-3-3280-7917' },
  { name: '日本緊急電話 (警察)', phone: '110' },
  { name: '日本緊急電話 (救護)', phone: '119' },
  { name: '純純 (領隊)', phone: 'Line Call' },
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

// --- Views ---

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
      {/* Elegant Date Scroller */}
      <div className="overflow-x-auto no-scrollbar -mx-6 px-6 pb-2" ref={scrollRef}>
        <div className="flex space-x-6 w-max">
          {ITINERARY_DATA.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center justify-center transition-all duration-300 group ${
                idx === selectedDayIndex ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <span className="text-[10px] tracking-widest uppercase mb-1 font-medium">{day.weekday}</span>
              <span className={`text-2xl font-serif font-medium leading-none mb-2 ${idx === selectedDayIndex ? 'text-stone-900' : 'text-stone-500'}`}>
                {day.date.split('/')[1]}
              </span>
              {/* Active Dot */}
              <div className={`w-1 h-1 rounded-full ${idx === selectedDayIndex ? 'bg-stone-800' : 'bg-transparent'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Weather Info */}
      <div className="flex items-center justify-between text-stone-500 border-b border-stone-200 pb-2">
         <div className="flex items-center space-x-2">
            {currentDay.weather.icon}
            <span className="text-sm font-serif tracking-wide">{currentDay.weather.condition}</span>
         </div>
         <span className="text-xl font-light font-mono-num">{currentDay.weather.temp}</span>
      </div>

      {/* Timeline Layout */}
      <div className="relative pt-2">
        {/* Continuous Vertical Line */}
        <div className="absolute left-[5.5rem] top-4 bottom-0 w-px bg-stone-200"></div>

        <div className="space-y-10">
          {currentDay.items.map((item, idx) => {
            const isSpecial = !!item.guideNote; // Use guideNote as flag for Special Card
            
            return (
              <div key={item.id} className="relative flex items-start group" onClick={() => setModalItem(item)}>
                
                {/* Time Column */}
                <div className="w-16 text-right pr-4 pt-1">
                   <span className="font-serif text-lg text-stone-900 font-medium">{item.time}</span>
                </div>

                {/* Marker Column */}
                <div className="relative flex flex-col items-center w-6 pt-2.5 z-10">
                   {isSpecial ? (
                      <div className="w-3 h-3 bg-[#c5a666] rotate-45 shadow-sm ring-4 ring-[#F9F8F4]"></div>
                   ) : (
                      <div className="w-2 h-2 bg-stone-300 rounded-full ring-4 ring-[#F9F8F4] group-hover:bg-stone-500 transition-colors"></div>
                   )}
                </div>

                {/* Content Column */}
                <div className="flex-1 pl-4 cursor-pointer">
                    {/* Special "Highlight" Card */}
                    {isSpecial ? (
                        <div className="bg-[#fffbf0] border border-[#e5d5b0] rounded-xl p-5 shadow-sm relative overflow-hidden active:scale-[0.98] transition-transform">
                             <div className="flex items-center space-x-2 mb-2">
                                 <Crown className="w-3 h-3 text-[#9f8045]" />
                                 <span className="text-[10px] font-bold text-[#9f8045] tracking-[0.15em] uppercase">Special Experience</span>
                             </div>
                             <h3 className="font-serif text-xl font-medium text-stone-900 mb-2 leading-tight">{item.title}</h3>
                             <p className="text-stone-600 text-sm leading-relaxed line-clamp-2">{item.guideNote}</p>
                             {/* Decorative shimmer */}
                             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-white/0 to-[#e5d5b0]/20 rounded-full blur-xl pointer-events-none"></div>
                        </div>
                    ) : (
                        /* Standard Item */
                        <div className="pt-0.5 active:opacity-70 transition-opacity">
                             <h3 className="font-serif text-xl text-stone-800 mb-1 leading-tight">{item.title}</h3>
                             <div className="flex items-center space-x-2 mb-2">
                                <span className="flex items-center space-x-1 text-[10px] font-medium text-stone-400 tracking-widest uppercase">
                                   {getIcon(item.type)}
                                   <span>{item.type}</span>
                                </span>
                             </div>
                             {item.note && (
                                <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{item.note}</p>
                             )}
                             {item.tags && item.tags.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                    {item.tags.map(t => <Tag key={t} text={t} />)}
                                </div>
                             )}
                        </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ToolboxView: React.FC = () => {
  return (
    <div className="pb-32 pt-6 px-6 space-y-10">
      
      {/* VJW - Dark Card Style */}
      <section>
         <div className="w-full bg-[#1c1c1e] rounded-2xl p-6 text-white shadow-xl flex items-center justify-between relative overflow-hidden group cursor-pointer" onClick={() => window.open('https://www.vjw.digital.go.jp/', '_blank')}>
            <div className="relative z-10">
                <span className="inline-block bg-rose-700/80 text-[10px] px-2 py-0.5 rounded-sm tracking-widest mb-2">MUST HAVE</span>
                <h3 className="font-serif text-2xl font-medium mb-1">Visit Japan Web</h3>
                <p className="text-stone-400 text-xs tracking-wide">入境審查 & 海關申報</p>
            </div>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center relative z-10 group-active:scale-90 transition">
                <ExternalLink className="w-5 h-5 text-white" />
            </div>
            {/* Background Glow */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-rose-900/20 blur-3xl rounded-full pointer-events-none" />
         </div>
      </section>

      {/* Emergency */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
            <Info className="w-4 h-4 text-stone-400" />
            <h3 className="font-serif text-lg font-medium text-stone-800">緊急聯絡 & 支援</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5 text-center flex flex-col justify-center">
                <span className="text-xs text-stone-400 mb-2 tracking-widest uppercase">Police</span>
                <span className="text-4xl font-serif text-rose-800 font-medium">110</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-5 text-center flex flex-col justify-center">
                <span className="text-xs text-stone-400 mb-2 tracking-widest uppercase">Fire / Ambulance</span>
                <span className="text-4xl font-serif text-rose-800 font-medium">119</span>
            </div>
        </div>

        <div className="mt-4 bg-white border border-stone-200 rounded-xl p-6 flex justify-between items-center">
            <div>
                 <h4 className="font-serif text-lg text-stone-800 font-medium">訪日外國人熱線</h4>
                 <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Japan Visitor Hotline</p>
                 <p className="text-2xl font-mono-num text-stone-700 mt-2 font-medium">050-3816-2787</p>
            </div>
            <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center text-white shrink-0">
                <Phone className="w-5 h-5" />
            </div>
        </div>
      </section>

      {/* Flights & Hotels Minimal List */}
      <section>
         <h3 className="font-serif text-lg font-medium text-stone-800 mb-4">住宿資訊</h3>
         <div className="space-y-4">
            {HOTELS.map((h, i) => (
                <div key={i} className="flex justify-between items-start border-b border-stone-200 pb-4 last:border-0">
                    <div>
                        <h4 className="font-serif text-stone-800">{h.name}</h4>
                        <p className="text-xs text-stone-400 mt-1">{h.address}</p>
                    </div>
                    <span className="text-xs font-mono-num bg-stone-100 px-2 py-1 rounded text-stone-500 whitespace-nowrap">{h.date}</span>
                </div>
            ))}
         </div>
      </section>
    </div>
  );
};

const AccountingView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ item: '', amount: '', payer: '純純' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item || !form.amount) return;
    const newExpense: Expense = {
        id: Date.now().toString(),
        item: form.item,
        amount: parseFloat(form.amount),
        payer: form.payer,
        date: new Date().toLocaleDateString('zh-TW', {month: 'numeric', day: 'numeric'})
    };
    setExpenses([newExpense, ...expenses]);
    setForm({ item: '', amount: '', payer: '純純' });
  };

  const total = expenses.reduce((sum, curr) => sum + curr.amount, 0);

  return (
    <div className="pb-32 pt-10 px-6 flex flex-col h-full">
        {/* Total Display - Large Typography */}
        <div className="text-center mb-10">
            <p className="text-xs tracking-widest text-stone-400 uppercase mb-2">Total Expenses</p>
            <div className="font-serif text-5xl text-stone-900 font-medium">
                <span className="text-2xl mr-2">¥</span>
                {total.toLocaleString()}
            </div>
        </div>

        {/* Input Form - Clean & Minimal */}
        <form onSubmit={handleAdd} className="bg-white rounded-2xl p-1 mb-8 shadow-sm border border-stone-100 flex items-center">
            <div className="flex-1 px-4">
                 <input 
                    type="text" 
                    placeholder="項目..." 
                    className="w-full py-2 bg-transparent outline-none text-stone-700 placeholder-stone-300 font-serif"
                    value={form.item}
                    onChange={e => setForm({...form, item: e.target.value})}
                />
            </div>
            <div className="w-px h-6 bg-stone-100 mx-2"></div>
            <div className="w-24">
                 <input 
                    type="number" 
                    placeholder="¥0" 
                    className="w-full py-2 bg-transparent outline-none text-stone-700 placeholder-stone-300 font-mono-num text-right"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                />
            </div>
            <button type="submit" className="ml-2 w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white active:scale-95 transition">
                <Plus className="w-5 h-5" />
            </button>
        </form>

        {/* List */}
        <div className="flex-1 space-y-4">
            {expenses.length === 0 ? (
                <div className="text-center mt-10 opacity-30">
                    <Wallet className="w-12 h-12 mx-auto mb-2 text-stone-400" />
                    <p className="font-serif text-stone-400">尚無紀錄</p>
                </div>
            ) : (
                expenses.map(ex => (
                    <div key={ex.id} className="flex justify-between items-center py-3 border-b border-stone-100 last:border-0 group">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-serif text-stone-600">
                                {ex.payer[0]}
                            </div>
                            <div>
                                <div className="font-serif text-stone-800">{ex.item}</div>
                                <div className="text-[10px] text-stone-400 tracking-wider">{ex.date}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="font-mono-num font-medium text-stone-800">¥{ex.amount.toLocaleString()}</span>
                            <button 
                                onClick={() => setExpenses(expenses.filter(e => e.id !== ex.id))}
                                className="text-stone-300 hover:text-rose-400 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

// --- Main Modal Component ---

const DetailModal: React.FC<{ item: ItineraryItem; onClose: () => void; nextItem?: ItineraryItem }> = ({ item, onClose, nextItem }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
            <div 
                className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            
            <div className="relative bg-[#F9F8F4] w-full sm:max-w-md h-[95vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up overflow-hidden border border-white/50">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full hover:bg-white transition shadow-sm"
                >
                    <X className="w-4 h-4 text-stone-600" />
                </button>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Header Section */}
                    <div className="pt-10 px-6 pb-2 text-center">
                        <p className="text-stone-500 font-mono-num mb-2 tracking-widest text-base">{item.time}</p>
                        <h2 className="text-3xl font-serif font-medium text-stone-900 leading-tight">{item.title}</h2>
                        {item.location && (
                            <p className="text-stone-500 mt-2 font-serif text-base">{item.location}</p>
                        )}
                        {item.tags && (
                             <div className="flex justify-center gap-2 mt-4">
                                {item.tags.map(t => <Tag key={t} text={t} />)}
                             </div>
                        )}
                    </div>

                    {/* Map Card Section (Only if mapsUrl exists) */}
                    {item.mapsUrl ? (
                         <div className="px-6 py-6">
                            <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-lg group bg-[#e5e3df]">
                                {/* Simulated Map Background */}
                                <div 
                                    className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-multiply"
                                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600')` }}
                                ></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20"></div>

                                {/* Floating Pin & Card */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                         {/* Ripple Effect */}
                                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-500/20 rounded-full animate-ping"></div>
                                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md z-10"></div>
                                         
                                         {/* Tooltip Card */}
                                         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-xl whitespace-nowrap z-20 flex items-center space-x-2 animate-bounce-slight">
                                             <span className="font-mono-num font-bold text-sm">{item.time}</span>
                                             <span className="w-px h-3 bg-stone-200"></span>
                                             <span className="font-serif text-base font-medium text-stone-800">{item.title.substring(0, 8)}{item.title.length > 8 ? '...' : ''}</span>
                                         </div>
                                    </div>
                                </div>

                                {/* Navigation Button */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <a 
                                        href={item.mapsUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center justify-center w-full bg-blue-600 text-white py-4 rounded-xl font-medium shadow-lg shadow-blue-900/20 active:scale-[0.98] transition hover:bg-blue-700 space-x-2 text-base"
                                    >
                                        <Navigation className="w-5 h-5" />
                                        <span>開啟 Google Maps 導航</span>
                                    </a>
                                </div>
                            </div>
                         </div>
                    ) : (
                        /* Simple decorative divider if no map */
                        <div className="w-full h-px bg-stone-200 my-4" />
                    )}

                    {/* Details Body */}
                    <div className="px-6 space-y-6 pb-10">
                         {/* Highlight / Guide Section */}
                        {item.guideNote && (
                            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm relative">
                                <div className="flex items-start space-x-3">
                                    <div className="mt-1.5">
                                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-serif text-sm text-stone-400 tracking-widest uppercase mb-3">Travel Guide</h4>
                                        <p className="text-stone-700 text-lg leading-8 font-serif text-justify">{item.guideNote}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Special Staff Note (e.g. JR Reservation) */}
                        {item.staffNote && (
                            <div className="mx-0 mt-2 mb-2">
                                <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-xl p-5 relative shadow-sm">
                                    <div className="flex items-center space-x-2 mb-3 text-amber-800 border-b border-amber-200 pb-2">
                                        <FileText className="w-5 h-5" />
                                        <span className="font-bold text-sm tracking-wide uppercase">Show to Staff / 站務員專用</span>
                                    </div>
                                    <pre className="whitespace-pre-wrap font-sans text-stone-800 text-base leading-relaxed font-medium">
                                        {item.staffNote}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Regular Note */}
                        {item.note && (
                            <div className="space-y-3">
                                <h4 className="font-serif text-sm text-stone-400 tracking-widest uppercase">Details</h4>
                                <p className="text-stone-700 leading-8 text-lg whitespace-pre-wrap">{item.note}</p>
                            </div>
                        )}

                        {/* External Reference Link (Main) */}
                        {item.linkUrl && (
                             <a 
                                href={item.linkUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-5 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition active:scale-[0.99]"
                             >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                                        <ExternalLink className="w-5 h-5 text-stone-500" />
                                    </div>
                                    <span className="text-base font-medium text-stone-700">{item.linkLabel || '查看參考網頁'}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-stone-300" />
                             </a>
                        )}

                        {/* Additional Links */}
                        {item.additionalLinks && item.additionalLinks.map((link, idx) => (
                             <a 
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-5 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition active:scale-[0.99]"
                             >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center">
                                        <ExternalLink className="w-5 h-5 text-stone-400" />
                                    </div>
                                    <span className="text-base font-medium text-stone-700">{link.label}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-stone-300" />
                             </a>
                        ))}
                    </div>
                </div>

                {/* Footer: Next Item Preview */}
                {nextItem && (
                    <div className="bg-white border-t border-stone-100 p-4 pb-8 sm:pb-4">
                        <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase tracking-widest mb-2 px-2">
                            <span>Next Stop</span>
                            <span className="font-mono-num">{nextItem.time}</span>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="font-serif text-stone-800 font-medium truncate pr-4 text-lg">{nextItem.title}</span>
                            <ArrowRight className="w-5 h-5 text-stone-300" />
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes bounce-slight {
                    0%, 100% { transform: translate(-50%, 0); }
                    50% { transform: translate(-50%, -5px); }
                }
                .animate-bounce-slight {
                    animation: bounce-slight 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'toolbox' | 'accounting'>('itinerary');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [modalItem, setModalItem] = useState<ItineraryItem | null>(null);

  // Helper to find next item
  const getNextItem = (currentItem: ItineraryItem): ItineraryItem | undefined => {
      const currentDayItems = ITINERARY_DATA[selectedDayIndex].items;
      const currentIndex = currentDayItems.findIndex(i => i.id === currentItem.id);
      if (currentIndex >= 0 && currentIndex < currentDayItems.length - 1) {
          return currentDayItems[currentIndex + 1];
      }
      return undefined;
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 font-sans selection:bg-stone-200">
      
      {/* Header - Minimal & Elegant */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#F9F8F4]/90 backdrop-blur-md pt-safe-top border-b border-stone-200/50">
         <div className="px-6 py-4 text-center relative">
             <p className="text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-1">Family Trip</p>
             <h1 className="text-xl font-serif font-medium text-stone-900 tracking-wide">青森溫泉之旅 <span className="text-xs bg-stone-200 rounded-full px-2 py-0.5 ml-1 align-middle">2026</span></h1>
             
             {/* Simple Avatar/User Icon absolute positioned */}
             <div className="absolute right-6 top-1/2 -translate-y-1/2 mt-1">
                 <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                    <User className="w-4 h-4" />
                 </div>
             </div>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="pt-24 min-h-screen">
        {activeTab === 'itinerary' && (
          <ItineraryView 
             selectedDayIndex={selectedDayIndex} 
             setSelectedDayIndex={setSelectedDayIndex}
             setModalItem={setModalItem}
          />
        )}
        {activeTab === 'toolbox' && <ToolboxView />}
        {activeTab === 'accounting' && <AccountingView />}
      </main>

      {/* Floating Bottom Navigation Pill */}
      <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="bg-[#1c1c1e] text-stone-400 rounded-full px-6 py-3 flex items-center shadow-2xl shadow-stone-900/20 space-x-8 pointer-events-auto">
          <button 
            onClick={() => setActiveTab('itinerary')}
            className={`flex flex-col items-center transition-all duration-300 ${activeTab === 'itinerary' ? 'text-white scale-110' : 'hover:text-stone-200'}`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium tracking-wide">行程</span>
          </button>
          
          <div className="w-px h-8 bg-white/10" />
          
          <button 
            onClick={() => setActiveTab('toolbox')}
            className={`flex flex-col items-center transition-all duration-300 ${activeTab === 'toolbox' ? 'text-white scale-110' : 'hover:text-stone-200'}`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium tracking-wide">重要資訊</span>
          </button>

          <div className="w-px h-8 bg-white/10" />

          <button 
            onClick={() => setActiveTab('accounting')}
            className={`flex flex-col items-center transition-all duration-300 ${activeTab === 'accounting' ? 'text-white scale-110' : 'hover:text-stone-200'}`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium tracking-wide">記帳</span>
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {modalItem && (
          <DetailModal 
            item={modalItem} 
            onClose={() => setModalItem(null)} 
            nextItem={getNextItem(modalItem)}
          />
      )}

      <style>{`
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pt-safe-top {
            padding-top: env(safe-area-inset-top, 20px);
        }
      `}</style>
    </div>
  );
};

export default App;