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
      { id: 'd2-7', time: '18:40', title: '入住 ReLabo Medical & Spa', type: 'hotel', note: '房內有準備浴袍和外套。4F酒吧蘋果氣泡酒第一杯半價。' }
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
      { id: 'd3-ship', time: '18:00', title: '八甲田丸 Hakkoda-maru', type: 'activity', note: '參觀青函聯絡船。', location: 'A-Factory 旁' },
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
      { id: 'd4-4', time: '12:30', title: 'JR 新青森 至 JR 八戶', type: 'transport', note: 'Hayabusa20号 (12:39 → 13:06)。\n備用：13:16 Hayabusa22号。' },
      { id: 'd4-6', time: '15:00', title: '入住 星野奧入瀨溪流飯店', type: 'hotel', note: '入住溪流和室，享受岡本太郎暖爐藝術。' },
      { id: 'd4-act1', time: '16:35', title: '我的第一次雪鞋漫步', type: 'activity', note: '16:35-17:15\n預約 ID: 4226230 (娟娟)' },
      { id: 'd4-act2', time: '17:30', title: '冰瀑燈光秀', type: 'activity', note: '17:30-18:30\n預約 ID: 4226202 (芬芬)' },
      { 
        id: 'd4-7', 
        time: '19:20', 
        title: '青森蘋果廚房 晚餐', 
        type: 'food', 
        note: 'BUNACO和津輕琉璃加入設計的餐廳空間。入口有紅蘋果裝飾，內部有蘋果燈飾，舒適溫馨。\n\n可以享用到滿滿的蘋果料理，蘋果汁有「津輕」、「王林」與「富士」三種選擇。現烤蘋果派與霜淇淋是必吃亮點！',
        guideNote: '青森蘋果廚房以蘋果為主題，從裝潢到料理都充滿巧思。必喝三種品種的蘋果汁評比！' 
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
      { id: 'd5-1', time: '07:30', title: '飯店早餐', type: 'food', note: '慢磨現榨蘋果汁，健康滿點。' },
      { id: 'd5-2', time: '09:55', title: '飯店行程：奧入瀨溪流巴士觀光', type: 'activity', note: '09:55-10:40\n預約 ID: 4227031 (4個位置)' },
      { id: 'd5-3', time: '10:50', title: '飯店行程：十和田湖繞行巴士', type: 'activity', note: '10:50-12:30\n預約 ID: 4225136。' },
      { id: 'd5-bus', time: '12:45', title: '接駁巴士至滑雪場', type: 'transport', note: '12:45-12:50 (回程15:00)\n活動：搭纜車上山 + 雪上樂園' },
      { id: 'd5-lunch', time: '14:10', title: '滑雪場午餐', type: 'food', note: '滑雪場食事処：有拉麵、咖喱飯、豚丼等。' },
      { id: 'd5-5', time: '18:45', title: '冰瀑燈光秀', type: 'activity', note: '全員預約。1500 JPY/人。' },
      { 
        id: 'd5-6', 
        time: '19:20', 
        title: '青森蘋果廚房 晚餐', 
        type: 'food', 
        note: 'BUNACO和津輕琉璃加入設計的餐廳空間。入口有紅蘋果裝飾，內部有蘋果燈飾，舒適溫馨。\n\n可以享用到滿滿的蘋果料理，蘋果汁有「津輕」、「王林」與「富士」三種選擇。現烤蘋果派與霜淇淋是必吃亮點！',
        guideNote: '青森蘋果廚房以蘋果為主題，從裝潢到料理都充滿巧思。必喝三種品種的蘋果汁評比！'
      },
      { id: 'd5-rest', time: '21:00', title: '飯店休息', type: 'hotel', note: '最後一晚享受奧入瀨的寧靜。' }
    ]
  },
  {
    date: '1/29',
    dayLabel: 'D6',
    weekday: 'THU',
    weather: { temp: '2°C', condition: '晴時多雲', icon: <Snowflake className="w-5 h-5 text-yellow-500" /> },
    items: [
      { id: 'd6-bk', time: '07:30', title: '飯店早餐', type: 'food', note: '慢磨蘋果汁最後衝刺。' },
      { id: 'd6-2', time: '13:40', title: 'JR 八戶 至 JR 仙台', type: 'transport', note: 'Hayabusa22号 (13:40 → 14:56)。' },
      { id: 'd6-4', time: '16:30', title: '入住 天然溫泉 杜都の湯 御宿 野乃仙台', type: 'hotel', note: '全館塌塌米，14樓天然溫泉，免費宵夜拉麵。', linkUrl: 'https://www.gltjp.com/zh-hant/directory/item/16268/' },
      { id: 'd6-6', time: '19:00', title: '仙台仔虎 燒肉', type: 'food', note: '米澤牛燒肉。Res ID: IR0513789744。', tags: ['必吃'] },
      { id: 'd6-night1', time: '21:30', title: '夜鳴拉麵', type: 'food', note: '飯店免費宵夜拉麵。' },
      { id: 'd6-night2', time: '22:00', title: '推薦居酒屋', type: 'food', note: 'Chotsugai (ちょうつがひ)。' },
      { id: 'd6-night3', time: '23:00', title: '深夜食堂', type: 'food', note: '可跟櫃檯拿泡麵版拉麵。' }
    ]
  },
  {
    date: '1/30',
    dayLabel: 'D7',
    weekday: 'FRI',
    weather: { temp: '4°C', condition: '晴天', icon: <Snowflake className="w-5 h-5 text-yellow-400" /> },
    items: [
      { id: 'd7-1', time: '07:30', title: '飯店早餐', type: 'food', note: '主打牛舌、海鮮丼吃到飽，現炸天婦羅。', tags: ['必吃'] },
      { id: 'd7-2', time: '09:15', title: '飯店 Check Out', type: 'hotel', note: '寄放行李。' },
      { id: 'd7-4', time: '12:00', title: '仙台逛街', type: 'shopping', note: 'LoFt、Parco2、Yodobashi。' },
      { id: 'd7-6', time: '14:31', title: 'JR 仙台 至 JR 東京', type: 'transport', note: 'Hayabusa20号 (14:31 → 16:04)。' },
      { id: 'd7-7', time: '17:00', title: '入住 Villa Fontaine Grand Haneda', type: 'hotel', note: '需要溫泉券的請舉手！' },
      { id: 'd7-dinner', time: '19:00', title: '羽田機場晚餐', type: 'food', note: '五代目花山、今半壽喜燒或四代目菊川鰻魚飯。', tags: ['必吃'] }
    ]
  },
  {
    date: '1/31',
    dayLabel: 'D8',
    weekday: 'SAT',
    weather: { temp: '8°C', condition: '多雲', icon: <Snowflake className="w-5 h-5 text-gray-400" /> },
    items: [
      { id: 'd8-1', time: '08:30', title: '早餐', type: 'food', note: '星巴克或者便利商店。' },
      { id: 'd8-2', time: '10:00', title: '飯店 Check Out', type: 'hotel', note: '【重要提醒】記得把水果刀、食物剪都托運，行動電源必須放在隨身行李。' },
      { 
        id: 'd8-3', 
        time: '10:00', 
        title: '燒肉卷外帶上機', 
        type: 'food', 
        note: '燒肉冠軍 羽田機場第三航廈店 📍T3 四樓江戶小路 08-22\n\n機場名物「焼肉冠軍飯捲」。出自惠比壽A5級黑毛和牛名店，飯卷表面鋪滿芝麻，內餡是滿滿的燒肉搭配酸辣泡菜醬汁，口感層次豐富。',
        tags: ['必吃', '外帶']
      },
      { id: 'd8-4', time: '10:30', title: '機場安檢前用餐', type: 'food', note: 'らぁ麺 雞だし屋 或 仙台牛たん 荒。' },
      { id: 'd8-5', time: '10:40', title: '登機托運', type: 'transport', note: '【再次確認】檢查托運行李是否有刀具，隨身行李是否有行動電源。' },
      { id: 'd8-6', time: '11:00', title: '安檢後休息', type: 'other', note: 'Starbucks、Tully\'s。' },
      { 
        id: 'd8-7', 
        time: '11:30', 
        title: '最後採買伴手禮', 
        type: 'shopping', 
        note: '1. SNOWS 半熟感起司\n2. LeTao 紅茶巧克力伯爵餅乾\n3. 砂糖樹冬季限定口味',
        tags: ['必買']
      },
      { 
        id: 'd8-8', 
        time: '12:40', 
        title: 'NH853 飛往松山', 
        type: 'transport', 
        note: '12:40-15:50 HND-TSA\n機型波音787-8。想看富士山請坐右邊。',
        tags: ['NH853']
      }
    ]
  }
];

const HOTELS = [
  { name: 'Villa Fontaine Grand Haneda', date: '1/24 & 1/30', address: '羽田機場第3航廈', note: '直結機場，有溫泉' },
  { name: 'ReLabo Medical & Spa', date: '1/25 - 1/26', address: '青森市', note: '蘋果汁無限暢飲' },
  { name: '星野集團 奧入瀨溪流飯店', date: '1/27 - 1/28', address: '奧入瀨溪流', note: '冰瀑燈光秀，蘋果廚房' },
  { name: 'Onyado Nono Sendai', date: '1/29', address: '仙台市', note: '全館塌塌米，宵夜拉麵' }
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
                                <div className="flex items-center space-x-2 mb-3 border-b border-white/20 pb-2"><FileText className="w-5 h-5" /><span className="font-bold text-sm">FOR STAFF</span></div>
                                <pre className="whitespace-pre-wrap font-sans text-stone-300 text-sm">{item.staffNote}</pre>
                            </div>
                        )}
                        {item.note && (
                            <div className="space-y-3">
                                <h4 className="font-serif text-sm text-stone-400 tracking-widest uppercase">Details</h4>
                                <p className="text-stone-700 leading-8 text-lg whitespace-pre-wrap">{item.note}</p>
                            </div>
                        )}
                        {item.linkUrl && (
                             <a href={item.linkUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-white border border-stone-200 rounded-xl">
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
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#F9F8F4]/90 backdrop-blur-md border-b border-stone-200/50">
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
                <h3 className="font-serif text-lg font-medium text-stone-800 mb-4">住宿資訊</h3>
                <div className="space-y-4">
                   {HOTELS.map((h, i) => (
                       <div key={i} className="border-b border-stone-200 pb-4 last:border-0">
                           <h4 className="font-serif text-stone-800">{h.name}</h4>
                           <p className="text-xs text-stone-400 mt-1">{h.address}</p>
                           <p className="text-xs text-stone-500 mt-1">{h.note}</p>
                       </div>
                   ))}
                </div>
             </section>
          </div>
        )}
      </main>

      <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center">
        <div className="bg-[#1c1c1e] text-stone-400 rounded-full px-8 py-3 flex items-center shadow-2xl space-x-12">
          <button onClick={() => setActiveTab('itinerary')} className={`flex flex-col items-center ${activeTab === 'itinerary' ? 'text-white' : ''}`}>
            <CalendarDays className="w-5 h-5" /><span className="text-[9px] mt-1 font-medium">行程</span>
          </button>
          <button onClick={() => setActiveTab('toolbox')} className={`flex flex-col items-center ${activeTab === 'toolbox' ? 'text-white' : ''}`}>
            <Briefcase className="w-5 h-5" /><span className="text-[9px] mt-1 font-medium">資訊</span>
          </button>
        </div>
      </div>

      {modalItem && <DetailModal item={modalItem} onClose={() => setModalItem(null)} />}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;