// Airport list for dropdowns
// IATA code → { nameFa, nameEn, city }
const AIRPORTS = [
  { code: "THR", nameFa: "تهران - مهرآباد", nameEn: "Tehran Mehrabad", city: "تهران" },
  { code: "IKIA", nameFa: "تهران - امام خمینی", nameEn: "Tehran Imam Khomeini", city: "تهران" },
  { code: "MHD", nameFa: "مشهد", nameEn: "Mashhad", city: "مشهد" },
  { code: "SYZ", nameFa: "شیراز", nameEn: "Shiraz", city: "شیراز" },
  { code: "IFN", nameFa: "اصفهان", nameEn: "Isfahan", city: "اصفهان" },
  { code: "TBZ", nameFa: "تبریز", nameEn: "Tabriz", city: "تبریز" },
  { code: "KIH", nameFa: "کیش", nameEn: "Kish", city: "کیش" },
  { code: "AWZ", nameFa: "اهواز", nameEn: "Ahvaz", city: "اهواز" },
  { code: "BND", nameFa: "بندرعباس", nameEn: "Bandar Abbas", city: "بندرعباس" },
  { code: "GSM", nameFa: "قشم", nameEn: "Qeshm", city: "قشم" },
  { code: "BUZ", nameFa: "بوشهر", nameEn: "Bushehr", city: "بوشهر" },
  { code: "ZAH", nameFa: "زاهدان", nameEn: "Zahedan", city: "زاهدان" },
  { code: "ADU", nameFa: "اردبیل", nameEn: "Ardabil", city: "اردبیل" },
  { code: "GBT", nameFa: "گرگان", nameEn: "Gorgan", city: "گرگان" },
  { code: "RAS", nameFa: "رشت", nameEn: "Rasht", city: "رشت" },
  { code: "KER", nameFa: "کرمان", nameEn: "Kerman", city: "کرمان" },
  { code: "KSH", nameFa: "کرمانشاه", nameEn: "Kermanshah", city: "کرمانشاه" },
  { code: "OMH", nameFa: "ارومیه", nameEn: "Urmia", city: "ارومیه" },
  { code: "AZD", nameFa: "یزد", nameEn: "Yazd", city: "یزد" },
  { code: "CFG", nameFa: "چابهار", nameEn: "Chabahar", city: "چابهار" },
  { code: "AEK", nameFa: "عسلویه", nameEn: "Asaluyeh", city: "عسلویه" },
  { code: "SRY", nameFa: "ساری", nameEn: "Sari", city: "ساری" },
  { code: "LFM", nameFa: "لار", nameEn: "Lar", city: "لار" },
  { code: "IIL", nameFa: "ایلام", nameEn: "Ilam", city: "ایلام" },
  { code: "DFU", nameFa: "دزفول", nameEn: "Dezful", city: "دزفول" },
  { code: "XBJ", nameFa: "بیرجند", nameEn: "Birjand", city: "بیرجند" },
  { code: "ABD", nameFa: "آبادان", nameEn: "Abadan", city: "آبادان" },
  { code: "NSH", nameFa: "نوشهر", nameEn: "Nowshahr", city: "نوشهر" },
  { code: "SBZ", nameFa: "سبزوار", nameEn: "Sabzevar", city: "سبزوار" },
  { code: "YES", nameFa: "یاسوج", nameEn: "Yasuj", city: "یاسوج" },
  { code: "GCH", nameFa: "گچساران", nameEn: "Gachsaran", city: "گچساران" },
  { code: "ZBL", nameFa: "زابل", nameEn: "Zabol", city: "زابل" },
  { code: "BJB", nameFa: "بجنورد", nameEn: "Bojnurd", city: "بجنورد" },
  { code: "KHD", nameFa: "خرم‌آباد", nameEn: "Khorramabad", city: "خرم‌آباد" },
  { code: "SDG", nameFa: "سنندج", nameEn: "Sanandaj", city: "سنندج" }
];

// Airline info lookup
const AIRLINES = {
  NV: { nameFa: "کارون", nameEn: "Karun", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/NV.png" },
  ZV: { nameFa: "زاگرس", nameEn: "Zagros", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/ZV.png" },
  JS: { nameFa: "جی‌اسکای", nameEn: "JSky", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/JS.png" },
  ISP: { nameFa: "جی‌اسکای", nameEn: "JSky", logo: "https://static.mrbilit.com/img/AirlineLogos/svg/ISP.svg" },
  I3: { nameFa: "آتا", nameEn: "ATA", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/I3.png" },
  EP: { nameFa: "آسمان", nameEn: "Aseman", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/EP.png" },
  FK: { nameFa: "فلای‌کیش", nameEn: "Fly Kish", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/FK.png" },
  TKN: { nameFa: "فلای‌کیش", nameEn: "Fly Kish", logo: "https://static.mrbilit.com/img/AirlineLogos/svg/TKN.svg" },
  W5: { nameFa: "ماهان", nameEn: "Mahan", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/W5.png" },
  IR: { nameFa: "ایران‌ایر", nameEn: "Iran Air", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/IR.png" },
  AXV: { nameFa: "آوا‌ایر", nameEn: "Ava Air", logo: "https://static.mrbilit.com/img/AirlineLogos/svg/AXV.svg" },
  SE: { nameFa: "ساها", nameEn: "Saha", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/SE.png" },
  HH: { nameFa: "هواپیمایی تهران", nameEn: "Qeshm Air", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/HH.png" },
  QB: { nameFa: "قشم‌ایر", nameEn: "Qeshm Air", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/QB.png" },
  Y9: { nameFa: "کاسپین", nameEn: "Caspian", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/Y9.png" },
  PA: { nameFa: "پارس‌ایر", nameEn: "Pars Air", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/PA.png" },
  RI: { nameFa: "آسمان", nameEn: "Aseman", logo: "https://cdn.alibaba.ir/static/img/airlines/Domestic/RI.png" }
};

if (typeof module !== 'undefined') {
  module.exports = { AIRPORTS, AIRLINES };
}
