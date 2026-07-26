// MrBilit.com (flight.atighgasht.com) API adapter

const MRBILIT_SEARCH_URL = "https://flight.atighgasht.com/api/Flights";

// Known working JWT for MrBilit API (public, changes periodically)
// This is a client identification token, not a user session token
const MRBILIT_FALLBACK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJidXMiOiI0ZiIsInRybiI6IjE3Iiwic3JjIjoiMiJ9.vvpr9fgASvk7B7I4KQKCz-SaCmoErab_p3csIvULG1w";

function generateMrbilitHeaders() {
  const playerId = crypto.randomUUID();
  const sessionId = `session_${crypto.randomUUID()}`;

  return {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json-patch+json",
    "authorization": `Bearer ${MRBILIT_FALLBACK_TOKEN}`,
    "sessionid": sessionId,
    "x-playerid": playerId,
    "origin": "https://mrbilit.com",
    "referer": "https://mrbilit.com/",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
  };
}

/**
 * Search flights on MrBilit.com
 * @param {Object} params - { origin, destination, departureDate, adult, child, infant, returnDate? }
 * @returns {Promise<UnifiedFlight[]>}
 */
async function searchMrbilit(params) {
  const headers = generateMrbilitHeaders();

  const routes = [
    {
      OriginCode: params.origin,
      DestinationCode: params.destination,
      DepartureDate: params.departureDate
    }
  ];

  // Add return route if round-trip
  if (params.returnDate) {
    routes.push({
      OriginCode: params.destination,
      DestinationCode: params.origin,
      DepartureDate: params.returnDate
    });
  }

  const body = {
    AdultCount: params.adult,
    ChildCount: params.child,
    InfantCount: params.infant,
    CabinClass: "All",
    Routes: routes,
    Baggage: true,
    IncludeFlightsWithHigherCapacity: false
  };

  const res = await fetch(MRBILIT_SEARCH_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    // Try to get a fresh token if 401
    if (res.status === 401) {
      throw new Error("MrBilit: authentication expired — token needs refresh");
    }
    throw new Error(`MrBilit search failed: ${res.status}`);
  }

  const data = await res.json();

  if (!data.Flights) {
    throw new Error("MrBilit: no flights data returned");
  }

  return data.Flights.map(f => normalizeMrbilitFlight(f, params)).filter(Boolean);
}

/**
 * Normalize a single MrBilit flight to UnifiedFlight schema
 */
function normalizeMrbilitFlight(flight, params) {
  if (!flight.Segments || !flight.Segments[0] || !flight.Segments[0].Legs || !flight.Segments[0].Legs[0]) {
    return null;
  }

  const leg = flight.Segments[0].Legs[0];
  const price = flight.Prices?.[0];

  if (!price) return null; // Skip flights with no pricing

  const dep = leg.DepartureTime || "";
  const arr = leg.ArrivalTime || "";
  const duration = parseDuration(dep, arr);

  const adultFare = price.PassengerFares?.find(p => p.PaxType === "ADL")?.TotalFare || 0;
  const childFare = price.PassengerFares?.find(p => p.PaxType === "CHD")?.TotalFare || 0;
  const infantFare = price.PassengerFares?.find(p => p.PaxType === "INF")?.TotalFare || 0;

  const airlineCode = leg.AirlineCode || leg.Airline?.IataCode || "";

  return {
    id: `mrbilit_${flight.Id}_${price.UniqueId}`,
    source: "mrbilit",
    airline: {
      code: airlineCode,
      nameFa: leg.Airline?.PersianTitle || getAirlineNameFa(airlineCode),
      nameEn: leg.Airline?.EnglishTitle || airlineCode,
      logo: leg.Airline?.Logo || getAirlineLogo(airlineCode)
    },
    flightNumber: `${airlineCode}${leg.FlightNumber}`,
    departure: dep,
    arrival: arr,
    duration,
    origin: params.origin,
    destination: params.destination,
    prices: {
      adult: adultFare,
      child: childFare,
      infant: infantFare
    },
    seatsRemaining: price.Capacity || null,
    aircraft: leg.AirCraft?.EnglishTitle || leg.AirplaneCode || "",
    isCharter: price.IsCharter || false,
    isRefundable: price.FareRulesUrl !== null,
    cabinClass: price.CabinClassDisplayName || "اکونومی",
    baggage: price.Baggage ? `${price.Baggage} ${price.BaggageType || "KG"}` : null,
    cancellationRules: price.CancellationTernEntities?.length ? price.CancellationTernEntities : null,
    bookingUrl: `https://mrbilit.com/flight/${params.origin}-${params.destination}/${params.departureDate}`
  };
}

function getAirlineNameFa(code) {
  const map = {
    NV: "کارون", ZV: "زاگرس", ISP: "جی‌اسکای", I3: "آتا", EP: "آسمان",
    TKN: "فلای‌کیش", W5: "ماهان", IR: "ایران‌ایر", SE: "ساها",
    AXV: "آوا‌ایر"
  };
  return map[code] || code;
}

function getAirlineLogo(code) {
  const map = {
    TKN: "https://static.mrbilit.com/img/AirlineLogos/svg/TKN.svg",
    ISP: "https://static.mrbilit.com/img/AirlineLogos/svg/ISP.svg",
    NV: "https://static.mrbilit.com/img/AirlineLogos/svg/NV.svg",
    ZV: "https://static.mrbilit.com/img/AirlineLogos/svg/ZV.svg",
    I3: "https://static.mrbilit.com/img/AirlineLogos/svg/I3.svg",
    EP: "https://static.mrbilit.com/img/AirlineLogos/svg/EP.svg",
    AXV: "https://static.mrbilit.com/img/AirlineLogos/svg/AXV.svg"
  };
  return map[code] || "";
}

if (typeof module !== 'undefined') {
  module.exports = { searchMrbilit, normalizeMrbilitFlight };
}
