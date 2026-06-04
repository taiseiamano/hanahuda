// Hanafuda Card Database - 48 cards divided into 12 months
// Extensible structure: to add custom cards, simply add elements to this array.

export const MONTH_DETAILS = {
  1: { nameEn: "Pine", nameJa: "松", color: "from-emerald-800 to-amber-900", emblem: "🌲" },
  2: { nameEn: "Plum", nameJa: "梅", color: "from-pink-800 to-rose-950", emblem: "🌸" },
  3: { nameEn: "Cherry", nameJa: "桜", color: "from-rose-550 to-pink-900", emblem: "🌸" },
  4: { nameEn: "Wisteria", nameJa: "藤", color: "from-purple-800 to-indigo-950", emblem: "🍇" },
  5: { nameEn: "Iris", nameJa: "菖蒲", color: "from-blue-800 to-indigo-950", emblem: "🌾" },
  6: { nameEn: "Peony", nameJa: "牡丹", color: "from-fuchsia-800 to-rose-950", emblem: "🌺" },
  7: { nameEn: "Bush Clover", nameJa: "萩", color: "from-red-800 to-amber-950", emblem: "🌿" },
  8: { nameEn: "Susuki Grass", nameJa: "芒", color: "from-amber-700 to-slate-900", emblem: "🌾" },
  9: { nameEn: "Chrysanthemum", nameJa: "菊", color: "from-amber-600 to-rose-900", emblem: "🌼" },
  10: { nameEn: "Maple", nameJa: "楓", color: "from-orange-850 to-red-950", emblem: "🍁" },
  11: { nameEn: "Willow", nameJa: "柳", color: "from-teal-850 to-slate-900", emblem: "🍃" },
  12: { nameEn: "Paulownia", nameJa: "桐", color: "from-purple-900 to-purple-950", emblem: "🛡️" }
};

export const CARD_TYPES = {
  HIKARI: { nameEn: "Bright", nameJa: "光", points: 20, badge: "🌟", color: "text-yellow-400" },
  TANE: { nameEn: "Animal", nameJa: "タネ", points: 10, badge: "🦌", color: "text-amber-400" },
  TANZAKU: { nameEn: "Ribbon", nameJa: "短冊", points: 5, badge: "🏷️", color: "text-red-400" },
  KASU: { nameEn: "Chaff", nameJa: "カス", points: 1, badge: "🍃", color: "text-emerald-400" }
};

const BASE_CARDS = [
  // --- Month 1: Pine (松 - Matsu) ---
  {
    id: "m1_1", month: 1, type: "hikari", points: 20,
    nameEn: "Pine with Crane", nameJa: "松に鶴",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m1_2", month: 1, type: "tanzaku", points: 5,
    nameEn: "Pine Red Poetry Ribbon", nameJa: "松に赤短",
    ribbonType: "akatan", isRain: false, isCup: false
  },
  {
    id: "m1_3", month: 1, type: "kasu", points: 1,
    nameEn: "Pine Chaff 1", nameJa: "松のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m1_4", month: 1, type: "kasu", points: 1,
    nameEn: "Pine Chaff 2", nameJa: "松のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 2: Plum (梅 - Ume) ---
  {
    id: "m2_1", month: 2, type: "tane", points: 10,
    nameEn: "Plum with Bush Warbler", nameJa: "梅に鶯",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m2_2", month: 2, type: "tanzaku", points: 5,
    nameEn: "Plum Red Poetry Ribbon", nameJa: "梅に赤短",
    ribbonType: "akatan", isRain: false, isCup: false
  },
  {
    id: "m2_3", month: 2, type: "kasu", points: 1,
    nameEn: "Plum Chaff 1", nameJa: "梅のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m2_4", month: 2, type: "kasu", points: 1,
    nameEn: "Plum Chaff 2", nameJa: "梅のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 3: Cherry Blossom (桜 - Sakura) ---
  {
    id: "m3_1", month: 3, type: "hikari", points: 20,
    nameEn: "Cherry with Camp Curtain", nameJa: "桜に幕",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m3_2", month: 3, type: "tanzaku", points: 5,
    nameEn: "Cherry Red Poetry Ribbon", nameJa: "桜に赤短",
    ribbonType: "akatan", isRain: false, isCup: false
  },
  {
    id: "m3_3", month: 3, type: "kasu", points: 1,
    nameEn: "Cherry Chaff 1", nameJa: "桜のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m3_4", month: 3, type: "kasu", points: 1,
    nameEn: "Cherry Chaff 2", nameJa: "桜のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 4: Wisteria (藤 - Fuji) ---
  {
    id: "m4_1", month: 4, type: "tane", points: 10,
    nameEn: "Wisteria with Cuckoo", nameJa: "藤にほととぎす",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m4_2", month: 4, type: "tanzaku", points: 5,
    nameEn: "Wisteria Red Ribbon", nameJa: "藤に赤短",
    ribbonType: "red", isRain: false, isCup: false
  },
  {
    id: "m4_3", month: 4, type: "kasu", points: 1,
    nameEn: "Wisteria Chaff 1", nameJa: "藤のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m4_4", month: 4, type: "kasu", points: 1,
    nameEn: "Wisteria Chaff 2", nameJa: "藤のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 5: Iris (菖蒲 - Ayame) ---
  {
    id: "m5_1", month: 5, type: "tane", points: 10,
    nameEn: "Iris with Eight-plank Bridge", nameJa: "菖蒲に八ツ橋",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m5_2", month: 5, type: "tanzaku", points: 5,
    nameEn: "Iris Red Ribbon", nameJa: "菖蒲に赤短",
    ribbonType: "red", isRain: false, isCup: false
  },
  {
    id: "m5_3", month: 5, type: "kasu", points: 1,
    nameEn: "Iris Chaff 1", nameJa: "菖蒲のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m5_4", month: 5, type: "kasu", points: 1,
    nameEn: "Iris Chaff 2", nameJa: "菖蒲のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 6: Peony (牡丹 - Botan) ---
  {
    id: "m6_1", month: 6, type: "tane", points: 10,
    nameEn: "Peony with Butterflies", nameJa: "牡丹に蝶",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m6_2", month: 6, type: "tanzaku", points: 5,
    nameEn: "Peony Blue Ribbon", nameJa: "牡丹に青短",
    ribbonType: "aotan", isRain: false, isCup: false
  },
  {
    id: "m6_3", month: 6, type: "kasu", points: 1,
    nameEn: "Peony Chaff 1", nameJa: "牡丹のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m6_4", month: 6, type: "kasu", points: 1,
    nameEn: "Peony Chaff 2", nameJa: "牡丹のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 7: Bush Clover (萩 - Hagi) ---
  {
    id: "m7_1", month: 7, type: "tane", points: 10,
    nameEn: "Bush Clover with Boar", nameJa: "萩に猪",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m7_2", month: 7, type: "tanzaku", points: 5,
    nameEn: "Bush Clover Red Ribbon", nameJa: "萩に赤短",
    ribbonType: "red", isRain: false, isCup: false
  },
  {
    id: "m7_3", month: 7, type: "kasu", points: 1,
    nameEn: "Bush Clover Chaff 1", nameJa: "萩のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m7_4", month: 7, type: "kasu", points: 1,
    nameEn: "Bush Clover Chaff 2", nameJa: "萩のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 8: Susuki Grass (芒 - Susuki) ---
  {
    id: "m8_1", month: 8, type: "hikari", points: 20,
    nameEn: "Susuki with Full Moon", nameJa: "芒に月",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m8_2", month: 8, type: "tane", points: 10,
    nameEn: "Susuki with Wild Geese", nameJa: "芒に雁",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m8_3", month: 8, type: "kasu", points: 1,
    nameEn: "Susuki Chaff 1", nameJa: "芒のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m8_4", month: 8, type: "kasu", points: 1,
    nameEn: "Susuki Chaff 2", nameJa: "芒のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 9: Chrysanthemum (菊 - Kiku) ---
  {
    id: "m9_1", month: 9, type: "tane", points: 10,
    nameEn: "Chrysanthemum with Sake Cup", nameJa: "菊に盃",
    ribbonType: null, isRain: false, isCup: true
  },
  {
    id: "m9_2", month: 9, type: "tanzaku", points: 5,
    nameEn: "Chrysanthemum Blue Ribbon", nameJa: "菊に青短",
    ribbonType: "aotan", isRain: false, isCup: false
  },
  {
    id: "m9_3", month: 9, type: "kasu", points: 1,
    nameEn: "Chrysanthemum Chaff 1", nameJa: "菊のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m9_4", month: 9, type: "kasu", points: 1,
    nameEn: "Chrysanthemum Chaff 2", nameJa: "菊のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 10: Maple (楓 - Kaede) ---
  {
    id: "m10_1", month: 10, type: "tane", points: 10,
    nameEn: "Maple with Deer", nameJa: "楓に鹿",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m10_2", month: 10, type: "tanzaku", points: 5,
    nameEn: "Maple Blue Ribbon", nameJa: "楓に青短",
    ribbonType: "aotan", isRain: false, isCup: false
  },
  {
    id: "m10_3", month: 10, type: "kasu", points: 1,
    nameEn: "Maple Chaff 1", nameJa: "楓のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m10_4", month: 10, type: "kasu", points: 1,
    nameEn: "Maple Chaff 2", nameJa: "楓のカス2",
    ribbonType: null, isRain: false, isCup: false
  },

  // --- Month 11: Willow (柳 - Yanagi) ---
  {
    id: "m11_1", month: 11, type: "hikari", points: 20,
    nameEn: "Willow with Ono no Michikaze (Rain)", nameJa: "柳に小野道風",
    ribbonType: null, isRain: true, isCup: false
  },
  {
    id: "m11_2", month: 11, type: "tane", points: 10,
    nameEn: "Willow with Swallow", nameJa: "柳に燕",
    ribbonType: null, isRain: true, isCup: false
  },
  {
    id: "m11_3", month: 11, type: "tanzaku", points: 5,
    nameEn: "Willow Red Ribbon", nameJa: "柳に赤短",
    ribbonType: "red", isRain: true, isCup: false
  },
  {
    id: "m11_4", month: 11, type: "kasu", points: 1,
    nameEn: "Willow Lightning (Chaff)", nameJa: "柳に雷",
    ribbonType: null, isRain: true, isCup: false
  },

  // --- Month 12: Paulownia (桐 - Kiri) ---
  {
    id: "m12_1", month: 12, type: "hikari", points: 20,
    nameEn: "Paulownia with Phoenix", nameJa: "桐に鳳凰",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m12_2", month: 12, type: "kasu", points: 1,
    nameEn: "Paulownia Chaff 1", nameJa: "桐のカス1",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m12_3", month: 12, type: "kasu", points: 1,
    nameEn: "Paulownia Chaff 2", nameJa: "桐のカス2",
    ribbonType: null, isRain: false, isCup: false
  },
  {
    id: "m12_4", month: 12, type: "kasu", points: 1,
    nameEn: "Paulownia Chaff 3", nameJa: "桐のカス3",
    ribbonType: null, isRain: false, isCup: false
  }
];

const EXTRA_DECK_CARDS = [
  {
    id: "extra_m1_tan", month: 1, type: "tanzaku", points: 5,
    nameEn: "Extra Pine Ribbon", nameJa: "松に短冊",
    ribbonType: "red", isRain: false, isCup: false,
    imagePath: "assets/additional_cards/add_m1_tan.jpg"
  },
  {
    id: "extra_m1_kasu", month: 1, type: "kasu", points: 1,
    nameEn: "Extra Pine Chaff", nameJa: "松のカス追加",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m1_3.jpg"
  },
  {
    id: "extra_m2_tan", month: 2, type: "tanzaku", points: 5,
    nameEn: "Extra Plum Ribbon", nameJa: "梅に短冊",
    ribbonType: "red", isRain: false, isCup: false,
    imagePath: "assets/additional_cards/add_m2_tan.jpg"
  },
  {
    id: "extra_m2_kasu", month: 2, type: "kasu", points: 1,
    nameEn: "Extra Plum Chaff", nameJa: "梅のカス追加",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m2_3.jpg"
  },
  {
    id: "extra_m3_tan", month: 3, type: "tanzaku", points: 5,
    nameEn: "Extra Cherry Ribbon", nameJa: "桜に短冊",
    ribbonType: "red", isRain: false, isCup: false,
    imagePath: "assets/additional_cards/add_m3_tan.jpg"
  },
  {
    id: "extra_m3_kasu", month: 3, type: "kasu", points: 1,
    nameEn: "Extra Cherry Chaff", nameJa: "桜のカス追加",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m3_3.jpg"
  },
  {
    id: "extra_m4_tan", month: 4, type: "tanzaku", points: 5,
    nameEn: "Extra Wisteria Ribbon", nameJa: "藤に短冊",
    ribbonType: "red", isRain: false, isCup: false,
    imagePath: "assets/cards/m4_2.jpg"
  },
  {
    id: "extra_m4_kasu", month: 4, type: "kasu", points: 1,
    nameEn: "Extra Wisteria Chaff", nameJa: "藤のカス追加",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m4_3.jpg"
  },
  {
    id: "extra_m5_tan", month: 5, type: "tanzaku", points: 5,
    nameEn: "Extra Iris Ribbon", nameJa: "菖蒲に短冊",
    ribbonType: "red", isRain: false, isCup: false,
    imagePath: "assets/cards/m5_2.jpg"
  },
  {
    id: "extra_m5_kasu", month: 5, type: "kasu", points: 1,
    nameEn: "Extra Iris Chaff", nameJa: "菖蒲のカス追加",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m5_3.jpg"
  },
  {
    id: "extra_m6_tan", month: 6, type: "tanzaku", points: 5,
    nameEn: "Extra Peony Ribbon", nameJa: "牡丹に短冊",
    ribbonType: "red", isRain: false, isCup: false,
    imagePath: "assets/additional_cards/add_m6_tan.jpg"
  },
  {
    id: "extra_m6_kasu", month: 6, type: "kasu", points: 1,
    nameEn: "Extra Peony Chaff", nameJa: "牡丹のカス追加",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m6_3.jpg"
  },
  {
    id: "extra_m7_tan", month: 7, type: "tanzaku", points: 5,
    nameEn: "Extra Bush Clover Ribbon", nameJa: "萩に短冊",
    ribbonType: "red", isRain: false, isCup: false,
    imagePath: "assets/cards/m7_2.jpg"
  },
  {
    id: "extra_m7_kasu", month: 7, type: "kasu", points: 1,
    nameEn: "Extra Bush Clover Chaff", nameJa: "萩のカス追加",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m7_3.jpg"
  },
  {
    id: "extra_m8_kasu_1", month: 8, type: "kasu", points: 1,
    nameEn: "Extra Susuki Chaff 1", nameJa: "芒のカス追加1",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m8_3.jpg"
  },
  {
    id: "extra_m8_kasu_2", month: 8, type: "kasu", points: 1,
    nameEn: "Extra Susuki Chaff 2", nameJa: "芒のカス追加2",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m8_4.jpg"
  },
  {
    id: "extra_m9_tan", month: 9, type: "tanzaku", points: 5,
    nameEn: "Extra Chrysanthemum Ribbon", nameJa: "菊に短冊",
    ribbonType: "red", isRain: false, isCup: false,
    imagePath: "assets/additional_cards/add_m9_tan.jpg"
  },
  {
    id: "extra_m9_kasu", month: 9, type: "kasu", points: 1,
    nameEn: "Extra Chrysanthemum Chaff", nameJa: "菊のカス追加",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m9_3.jpg"
  },
  {
    id: "extra_m10_tan", month: 10, type: "tanzaku", points: 5,
    nameEn: "Extra Maple Ribbon", nameJa: "楓に短冊",
    ribbonType: "red", isRain: false, isCup: false,
    imagePath: "assets/additional_cards/add_m10_tan.jpg"
  },
  {
    id: "extra_m10_kasu", month: 10, type: "kasu", points: 1,
    nameEn: "Extra Maple Chaff", nameJa: "楓のカス追加",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m10_3.jpg"
  },
  {
    id: "extra_m11_tan", month: 11, type: "tanzaku", points: 5,
    nameEn: "Extra Willow Ribbon", nameJa: "柳に短冊",
    ribbonType: "red", isRain: true, isCup: false,
    imagePath: "assets/cards/m11_3.jpg"
  },
  {
    id: "extra_m11_kasu", month: 11, type: "kasu", points: 1,
    nameEn: "Extra Willow Chaff", nameJa: "柳のカス追加",
    ribbonType: null, isRain: true, isCup: false,
    imagePath: "assets/cards/m11_4.jpg"
  },
  {
    id: "extra_m12_kasu_1", month: 12, type: "kasu", points: 1,
    nameEn: "Extra Paulownia Chaff 1", nameJa: "桐のカス追加1",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m12_2.jpg"
  },
  {
    id: "extra_m12_kasu_2", month: 12, type: "kasu", points: 1,
    nameEn: "Extra Paulownia Chaff 2", nameJa: "桐のカス追加2",
    ribbonType: null, isRain: false, isCup: false,
    imagePath: "assets/cards/m12_3.jpg"
  }
];

export const INITIAL_CARDS = [...BASE_CARDS, ...EXTRA_DECK_CARDS];

export const SPECIAL_CARDS = [
  {
    id: "special_03",
    number: 3,
    nameJa: "雨流れ",
    rarity: "一",
    effectText: "相手の花カードをランダムに2枚山札に戻す。",
    imagePath: "assets/special_cards/special_03.jpg"
  },
  {
    id: "special_04",
    number: 4,
    nameJa: "酒器と盃",
    rarity: "二",
    effectText: "自分の獲得カードのカス1枚を菊のたねにする。",
    imagePath: "assets/special_cards/special_04.jpg"
  },
  {
    id: "special_05",
    number: 5,
    nameJa: "大嵐",
    rarity: "四",
    effectText: "相手の獲得カード1枚を消滅させる。場に柳の光を1枚出し、自分の手札に柳のカスを1枚加える。",
    imagePath: "assets/special_cards/special_05.jpg"
  },
  {
    id: "special_06",
    number: 6,
    nameJa: "鳳凰の庭園",
    rarity: "四",
    effectText: "場に桐の光を1枚出す。自分の手札に桐の種を1枚加える。自分の獲得した桐のカス全てを桐の種にする。",
    imagePath: "assets/special_cards/special_06.jpg"
  },
  {
    id: "special_07",
    number: 7,
    nameJa: "藍染",
    rarity: "一",
    effectText: "場か自分の手札にある通常たん1枚を、同じ花の青たんにする。",
    imagePath: "assets/special_cards/special_07.jpg"
  },
  {
    id: "special_08",
    number: 8,
    nameJa: "詩人の筆",
    rarity: "一",
    effectText: "場か自分の手札にある通常たん1枚を、同じ花の赤たんにする。",
    imagePath: "assets/special_cards/special_08.jpg"
  },
  {
    id: "special_09",
    number: 9,
    nameJa: "場違い",
    rarity: "三",
    effectText: "場のカード1枚を獲得する。獲得したカードと同じ花のカスを1枚場に出し、ターンを終了する。",
    imagePath: "assets/special_cards/special_09.jpg"
  },
  {
    id: "special_10",
    number: 10,
    nameJa: "豊穣の季節",
    rarity: "二",
    effectText: "場か自分の手札にある特定のカス札1枚を、同じ花の種札にする。",
    imagePath: "assets/special_cards/special_10.jpg"
  },
  {
    id: "special_11",
    number: 11,
    nameJa: "瞬光",
    rarity: "三",
    effectText: "山札にある光札をランダムに1枚場に出す。山札に光札がない場合は、「月に叢雲花に風」を1枚手札に加える。",
    imagePath: "assets/special_cards/special_11.jpg"
  },
  {
    id: "special_12",
    number: 12,
    nameJa: "鶴の恩返し",
    rarity: "四",
    effectText: "場に松の光を1枚出す。自分の手札に松の赤たんを1枚加える。自分の獲得した通常たんをランダムに最大2枚、赤たんにする。",
    imagePath: "assets/special_cards/special_12.jpg"
  },
  {
    id: "special_13",
    number: 13,
    nameJa: "萌芽",
    rarity: "無",
    effectText: "山札から1枚引いて場に出す。",
    imagePath: "assets/special_cards/special_13.jpg"
  },
  {
    id: "special_14",
    number: 14,
    nameJa: "開花",
    rarity: "一",
    effectText: "自分の手札の花カード1枚を山札に戻す。山札から2枚引いて場に出す。山札から2枚引いて手札に加える。",
    imagePath: "assets/special_cards/special_14.jpg"
  },
  {
    id: "special_15",
    number: 15,
    nameJa: "季節の移ろい",
    rarity: "二",
    effectText: "場のカード全てを山札に戻す。山札から6枚引いて場に出す。",
    imagePath: "assets/special_cards/special_15.jpg"
  },
  {
    id: "special_16",
    number: 16,
    nameJa: "火縄銃",
    rarity: "二",
    effectText: "相手の獲得した動物が描かれている種札1枚を、同じ花のカス札にする。",
    imagePath: "assets/special_cards/special_16.jpg"
  },
  {
    id: "special_17",
    number: 17,
    nameJa: "月に叢雲花に風",
    rarity: "三",
    effectText: "お互いの手札にある光札全てを山札に戻す。お互いの手札に光札がない場合は、「瞬光」を1枚手札に加える。",
    imagePath: "assets/special_cards/special_17.jpg"
  },
  {
    id: "special_18",
    number: 18,
    nameJa: "月兎",
    rarity: "四",
    effectText: "場に芒の光を1枚出す。自分の手札に芒のカスと酒器と盃を1枚ずつ加える。",
    imagePath: "assets/special_cards/special_18.jpg"
  },
  {
    id: "special_19",
    number: 19,
    nameJa: "桜吹雪",
    rarity: "四",
    effectText: "場に桜の光を1枚出す。自分の手札に桜の光を1枚加える。",
    imagePath: "assets/special_cards/special_19.jpg"
  },
  {
    id: "special_20",
    number: 20,
    nameJa: "異常気象",
    rarity: "三",
    effectText: "お互いの手札と場の花カード全てを山札に戻す。お互いの特殊カードを全て消滅させ、場に5枚、各手札に4枚を山札から配り、お互い特殊カードを1枚引く。",
    imagePath: "assets/special_cards/special_20.jpg"
  }
];
