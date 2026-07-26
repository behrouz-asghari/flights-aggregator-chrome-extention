// Jalali (Persian/Shamsi) date utilities
// Well-tested algorithms for Gregorian ↔ Jalali conversion

const JalaliDate = {
  monthNames: [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ],
  dayNames: ["ش", "ی", "د", "س", "چ", "پ", "ج"],

  /**
   * Gregorian → Jalali
   * @returns {{ jy, jm, jd }}
   */
  gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = -1595 + 33 * Math.floor((gy + 3) / 100);
    jy += 8 * Math.floor((gy + 399) / 400);
    let jd = 1;
    if (gm > 2) jd += 1;
    let days = 355666 + 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) +
               Math.floor((gy + 399) / 400) + gd + g_d_m[gm - 1];
    jy = -1595 + 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let jm, jd2;
    if (days < 186) {
      jm = 1 + Math.floor(days / 31);
      jd2 = 1 + (days % 31);
    } else {
      jm = 7 + Math.floor((days - 186) / 30);
      jd2 = 1 + ((days - 186) % 30);
    }
    return { jy, jm, jd: jd2 };
  },

  /**
   * Jalali → Gregorian
   * @returns {{ gy, gm, gd }}
   */
  jalaliToGregorian(jy, jm, jd) {
    let jy2 = jy - 979;
    let jm2 = jm - 1;
    let jd2 = jd - 1;
    let j_day_no = jd2 + (jm2 <= 6 ? jm2 * 31 : jm2 * 30 + 6) +
                   Math.floor(jy2 / 33) * 12053 + (jy2 % 33) * 365 + Math.floor((jy2 % 33 + 3) / 4);
    let g_day_no = j_day_no + 79;
    let gy = 1600 + 400 * Math.floor(g_day_no / 146097);
    g_day_no %= 146097;
    if (g_day_no >= 36525) {
      g_day_no--;
      gy += 100 * Math.floor(g_day_no / 36524);
      g_day_no %= 36524;
      if (g_day_no >= 365) g_day_no++;
    }
    gy += 4 * Math.floor(g_day_no / 1461);
    g_day_no %= 1461;
    if (g_day_no >= 366) {
      g_day_no--;
      gy += Math.floor(g_day_no / 365);
      g_day_no %= 365;
    }
    let gd = g_day_no + 1;
    let gm;
    let leap = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
    const day_of_year = g_day_no + 1;
    const g_dm = [0, 31, (leap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let acc = 0;
    for (gm = 1; gm <= 12; gm++) {
      acc += g_dm[gm];
      if (day_of_year <= acc) break;
    }
    gd = day_of_year - (acc - g_dm[gm]);
    return { gy, gm, gd };
  },

  daysInJalaliMonth(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return this.isJalaliLeapYear(jy) ? 30 : 29;
  },

  isJalaliLeapYear(jy) {
    const rem = ((jy - 474) % 2820 + 2820) % 2820;
    return ((rem + 474 + 38) * 682 % 2816) < 682;
  },

  formatJalaliDate(jy, jm, jd) {
    return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
  },

  todayJalali() {
    const now = new Date();
    return this.gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  },

  fromISO(isoDate) {
    const [y, m, d] = isoDate.split("-").map(Number);
    return this.gregorianToJalali(y, m, d);
  },

  toISO(jy, jm, jd) {
    const { gy, gm, gd } = this.jalaliToGregorian(jy, jm, jd);
    return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
  }
};

if (typeof module !== "undefined") {
  module.exports = JalaliDate;
}
