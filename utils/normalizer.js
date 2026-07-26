// Unified flight schema and normalization helpers

/**
 * @typedef {Object} UnifiedFlight
 * @property {string} id
 * @property {string} source - "alibaba" | "flytoday" | "mrbilit"
 * @property {{ code: string, nameFa: string, nameEn: string, logo: string }} airline
 * @property {string} flightNumber
 * @property {string} departure - ISO datetime
 * @property {string} arrival - ISO datetime
 * @property {number} duration - minutes
 * @property {string} origin - IATA
 * @property {string} destination - IATA
 * @property {{ adult: number, child: number, infant: number }} prices
 * @property {number|null} seatsRemaining
 * @property {string} aircraft
 * @property {boolean} isCharter
 * @property {boolean|null} isRefundable
 * @property {string} cabinClass
 * @property {string|null} baggage
 * @property {Object|null} cancellationRules
 * @property {string} bookingUrl
 */

function formatPrice(price) {
  if (!price) return "—";
  return new Intl.NumberFormat("fa-IR").format(price);
}

function parseDuration(dep, arr) {
  const d = new Date(dep);
  const a = new Date(arr);
  return Math.round((a - d) / 60000);
}

function formatDuration(minutes) {
  if (!minutes || minutes < 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}ساعت ${m > 0 ? m + "دقیقه" : ""}`.trim();
}

function formatTime(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleDateString("fa-IR", { month: "long", day: "numeric", weekday: "short" });
}

if (typeof module !== 'undefined') {
  module.exports = { formatPrice, parseDuration, formatDuration, formatTime, formatDate };
}
