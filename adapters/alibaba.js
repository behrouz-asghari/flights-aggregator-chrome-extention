// Alibaba.ir API adapter
// Handles: search initiation → polling → result normalization

const ALIBABA_SEARCH_URL = "https://ws.alibaba.ir/api/v1/flights/domestic/available";
const ALIBABA_CHEAPEST_URL = "https://ws.alibaba.ir/api/v2/flights/domestic/available/cheapest";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 45; // 90 seconds max

function generateHeaders() {
  const timestamp = Date.now().toString();
  const chromeVersion = "136.0.0.0";
  return {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "origin": "https://www.alibaba.ir",
    "referer": "https://www.alibaba.ir/",
    "ab-channel": `WEB-NEW,PRODUCTION,CSR,www.alibaba.ir,desktop,Chrome,${chromeVersion},N,N,Windows,10,3.266.2`,
    "tracing-sessionid": timestamp,
    "tracing-device": `N,Chrome,${chromeVersion},N,N,Windows`,
    "cache-control": "no-cache",
    "pragma": "no-cache"
  };
}

/**
 * Search flights on Alibaba.ir
 * @param {Object} params - { origin, destination, departureDate, adult, child, infant, returnDate? }
 * @param {Function} onProgress - callback(progress: { loaded, total })
 * @returns {Promise<UnifiedFlight[]>}
 */
async function searchAlibaba(params, onProgress) {
  const headers = generateHeaders();

  // Step 1: Initiate search
  const searchBody = {
    origin: params.origin,
    destination: params.destination,
    departureDate: params.departureDate,
    adult: params.adult,
    child: params.child,
    infant: params.infant
  };

  const searchRes = await fetch(ALIBABA_SEARCH_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(searchBody)
  });

  if (!searchRes.ok) throw new Error(`Alibaba search failed: ${searchRes.status}`);
  const searchData = await searchRes.json();

  if (!searchData.success || !searchData.result?.requestId) {
    throw new Error("Alibaba search initiation failed");
  }

  const requestId = searchData.result.requestId;

  // Step 2: Poll for results
  let attempts = 0;
  while (attempts < MAX_POLL_ATTEMPTS) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    attempts++;

    const pollRes = await fetch(`${ALIBABA_SEARCH_URL}/${requestId}`, {
      method: "GET",
      headers
    });

    if (!pollRes.ok) throw new Error(`Alibaba poll failed: ${pollRes.status}`);
    const pollData = await pollRes.json();

    if (!pollData.success) throw new Error("Alibaba poll returned error");

    const result = pollData.result;
    if (onProgress) {
      onProgress({ loaded: result.departing?.length || 0, total: result.departing?.length || 0 });
    }

    if (result.isCompleted) {
      // Normalize departing flights
      const flights = (result.departing || []).map(f => normalizeAlibabaFlight(f, params));
      return flights;
    }
  }

  throw new Error("Alibaba polling timeout");
}

/**
 * Normalize a single Alibaba flight to UnifiedFlight schema
 */
function normalizeAlibabaFlight(flight, params) {
  const duration = parseDuration(flight.leaveDateTime, flight.arrivalDateTime);

  return {
    id: `alibaba_${flight.uniqueKey || flight.proposalId}`,
    source: "alibaba",
    airline: {
      code: flight.airlineCode,
      nameFa: flight.airlineName || getAirlineName(flight.airlineCode),
      nameEn: flight.airlineCode,
      logo: flight.airlineLogo || ""
    },
    flightNumber: `${flight.airlineCode}${flight.flightNumber}`,
    departure: flight.leaveDateTime,
    arrival: flight.arrivalDateTime,
    duration,
    origin: flight.origin,
    destination: flight.destination,
    prices: {
      adult: flight.priceAdult || 0,
      child: flight.priceChild || 0,
      infant: flight.priceInfant || 0
    },
    seatsRemaining: flight.seat || null,
    aircraft: flight.aircraft || "",
    isCharter: flight.isCharter || false,
    isRefundable: flight.isRefundable ?? true,
    cabinClass: flight.classTypeName || "اکونومی",
    baggage: flight.maxAllowedBaggage ? `${flight.maxAllowedBaggage} کیلوگرم` : null,
    cancellationRules: flight.crcn || null,
    bookingUrl: `https://www.alibaba.ir/flights/${params.origin}-${params.destination}?adult=${params.adult}&child=${params.child}&infant=${params.infant}&departing=${params.departureDate}`
  };
}

function getAirlineName(code) {
  const map = {
    NV: "کارون", ZV: "زاگرس", JS: "جی‌اسکای", I3: "آتا", EP: "آسمان",
    FK: "فلای‌کیش", W5: "ماهان", IR: "ایران‌ایر", SE: "ساها"
  };
  return map[code] || code;
}

if (typeof module !== 'undefined') {
  module.exports = { searchAlibaba, normalizeAlibabaFlight };
}
