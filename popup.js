// popup.js — UI logic for the flight aggregator extension

// ─── State ───
let passengers = { adult: 1, child: 0, infant: 0 };
let currentFlights = [];
let currentResults = null;
let departureDatePicker = null;
let returnDatePicker = null;

document.addEventListener("DOMContentLoaded", () => {
  initAirports();
  initTripType();
  initPassengers();
  initSwapButton();
  initSearchButton();
  initSortSelect();
  initRetryButton();
  initBackButton();
  initDatePickers();
  initSavePng();
  loadSavedResults();
});

// ═══════════════════════════════════════════
// STATE PERSISTENCE
// ═══════════════════════════════════════════

function saveResults(data) {
  chrome.storage.local.set({
    lastResults: data,
    lastFlights: currentFlights,
    savedAt: Date.now()
  });
}

function loadSavedResults() {
  chrome.storage.local.get(["lastResults", "lastFlights", "savedAt"], (stored) => {
    if (stored.lastResults && stored.lastResults.flights && stored.lastResults.flights.length > 0) {
      currentFlights = stored.lastFlights || stored.lastResults.flights;
      currentResults = stored.lastResults;
      showResults(stored.lastResults);
    }
  });
}

function clearSavedResults() {
  chrome.storage.local.remove(["lastResults", "lastFlights", "savedAt"]);
}

// ═══════════════════════════════════════════
// SAVE AS PNG
// ═══════════════════════════════════════════

function initSavePng() {
  document.getElementById("savePngBtn").addEventListener("click", saveAsPng);
}

function saveAsPng() {
  if (!currentResults || !currentResults.flights.length) return;

  const flights = currentResults.flights;
  const sourceStatus = currentResults.sourceStatus;

  // Canvas dimensions
  const W = 600;
  const PAD = 24;
  const CARD_H = 100;
  const HEADER_H = 80;
  const CARD_GAP = 10;
  const maxCards = Math.min(flights.length, 12);
  const H = HEADER_H + PAD + maxCards * (CARD_H + CARD_GAP) + PAD + 40;

  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, 0, W, H);

  // Header bar
  ctx.fillStyle = "#4f46e5";
  ctx.fillRect(0, 0, W, HEADER_H);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px Vazirmatn, Tahoma, Arial";
  ctx.textAlign = "right";
  ctx.fillText("پروازیار — مقایسه قیمت پرواز", W - PAD, 36);

  ctx.font = "12px Vazirmatn, Tahoma, Arial";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  const totalText = flights.length + " پرواز از " + Object.keys(sourceStatus).length + " منبع";
  ctx.fillText(totalText, W - PAD, 58);

  // Source counts
  ctx.textAlign = "left";
  let xOff = PAD;
  for (const [src, info] of Object.entries(sourceStatus)) {
    const label = src === "alibaba" ? "علی‌بابا" : src === "flytoday" ? "فلای‌تودی" : "مستربلیت";
    const color = src === "alibaba" ? "#e65100" : src === "flytoday" ? "#1565c0" : "#2e7d32";
    ctx.fillStyle = color;
    ctx.font = "bold 11px Vazirmatn, Tahoma, Arial";
    ctx.fillText(label + ": " + info.count, xOff, 58);
    xOff += 90;
  }

  // Flight cards
  let y = HEADER_H + PAD;
  ctx.textAlign = "right";

  for (let i = 0; i < maxCards; i++) {
    const f = flights[i];

    // Card background
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, PAD, y, W - PAD * 2, CARD_H, 10);
    ctx.fill();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    roundRect(ctx, PAD, y, W - PAD * 2, CARD_H, 10);
    ctx.stroke();

    // Airline name
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 13px Vazirmatn, Tahoma, Arial";
    ctx.fillText(f.airline.nameFa, W - PAD - 8, y + 24);

    // Flight number
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px Vazirmatn, Tahoma, Arial";
    ctx.fillText(f.flightNumber, W - PAD - 8, y + 42);

    // Source badge
    const srcLabel = f.source === "alibaba" ? "علی‌بابا" : f.source === "flytoday" ? "فلای‌تودی" : "مستربلیت";
    const srcColor = f.source === "alibaba" ? "#e65100" : f.source === "flytoday" ? "#1565c0" : "#2e7d32";
    ctx.fillStyle = srcColor;
    ctx.font = "bold 10px Vazirmatn, Tahoma, Arial";
    ctx.textAlign = "left";
    ctx.fillText(srcLabel, PAD + 8, y + 24);
    ctx.textAlign = "right";

    // Times
    const depTime = formatTime(f.departure);
    const arrTime = formatTime(f.arrival);

    ctx.fillStyle = "#111827";
    ctx.font = "bold 20px Vazirmatn, Tahoma, Arial";
    ctx.fillText(depTime, W / 2 - 20, y + 35);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px Vazirmatn, Tahoma, Arial";
    ctx.fillText("→", W / 2, y + 35);

    ctx.fillStyle = "#111827";
    ctx.font = "bold 20px Vazirmatn, Tahoma, Arial";
    ctx.fillText(arrTime, W / 2 + 40, y + 35);

    // Duration
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px Vazirmatn, Tahoma, Arial";
    ctx.fillText(formatDuration(f.duration), W / 2, y + 55);

    // Price
    const price = formatPrice(f.prices.adult);
    ctx.fillStyle = "#4f46e5";
    ctx.font = "bold 16px Vazirmatn, Tahoma, Arial";
    ctx.textAlign = "left";
    ctx.fillText(price + " تومان", PAD + 8, y + 85);
    ctx.textAlign = "right";

    // Seats tag
    if (f.seatsRemaining != null) {
      const seatColor = f.seatsRemaining <= 2 ? "#f59e0b" : "#10b981";
      ctx.fillStyle = seatColor;
      ctx.font = "bold 10px Vazirmatn, Tahoma, Arial";
      ctx.textAlign = "left";
      ctx.fillText(f.seatsRemaining + " صندلی", PAD + 8, y + 55);
      ctx.textAlign = "right";
    }

    // Charter tag
    if (f.isCharter) {
      ctx.fillStyle = "#c62828";
      ctx.font = "bold 10px Vazirmatn, Tahoma, Arial";
      ctx.textAlign = "left";
      ctx.fillText("چارتر", PAD + 70, y + 55);
      ctx.textAlign = "right";
    }

    y += CARD_H + CARD_GAP;
  }

  // Footer
  if (flights.length > maxCards) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px Vazirmatn, Tahoma, Arial";
    ctx.textAlign = "center";
    ctx.fillText("+ " + (flights.length - maxCards) + " پرواز دیگر", W / 2, y + 10);
  }

  // Timestamp
  ctx.fillStyle = "#d1d5db";
  ctx.font = "10px Vazirmatn, Tahoma, Arial";
  ctx.textAlign = "center";
  const now = new Date();
  const ts = now.toLocaleDateString("fa-IR") + " " + now.toLocaleTimeString("fa-IR");
  ctx.fillText("پروازیار v1.0 — " + ts, W / 2, H - 10);

  // Download
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "parvazyar-" + new Date().toISOString().slice(0, 10) + ".png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════

function initDatePickers() {
  const today = JalaliDate.todayJalali();
  departureDatePicker = new JalaliDatePicker("departureDatePicker", {
    minDate: today,
    onChange: (isoDate) => {
      if (returnDatePicker) returnDatePicker.setMinDate(isoDate);
    }
  });
  returnDatePicker = new JalaliDatePicker("returnDatePicker", { minDate: today });
}

function initAirports() {
  const origin = document.getElementById("origin");
  const destination = document.getElementById("destination");
  AIRPORTS.forEach(airport => {
    origin.add(new Option(airport.nameFa + " (" + airport.code + ")", airport.code));
    destination.add(new Option(airport.nameFa + " (" + airport.code + ")", airport.code));
  });
  origin.value = "THR";
  destination.value = "AWZ";
}

function initTripType() {
  document.querySelectorAll('input[name="tripType"]').forEach(radio => {
    radio.addEventListener("change", () => {
      document.getElementById("returnDateGroup").style.display =
        radio.value === "roundtrip" ? "flex" : "none";
    });
  });
}

function initPassengers() {
  document.querySelectorAll(".counter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.target;
      const a = btn.dataset.action;
      if (a === "plus") {
        if (t === "adult" && passengers.adult < 9) passengers.adult++;
        else if (t === "child" && passengers.child < 8) passengers.child++;
        else if (t === "infant" && passengers.infant < passengers.adult) passengers.infant++;
      } else if (a === "minus") {
        if (t === "adult" && passengers.adult > 1) {
          passengers.adult--;
          if (passengers.infant > passengers.adult) passengers.infant = passengers.adult;
        }
        else if (t === "child" && passengers.child > 0) passengers.child--;
        else if (t === "infant" && passengers.infant > 0) passengers.infant--;
      }
      updatePassengerDisplay();
    });
  });
}

function updatePassengerDisplay() {
  document.getElementById("adultCount").textContent = passengers.adult;
  document.getElementById("childCount").textContent = passengers.child;
  document.getElementById("infantCount").textContent = passengers.infant;
}

function initSwapButton() {
  document.getElementById("swapBtn").addEventListener("click", () => {
    const o = document.getElementById("origin");
    const d = document.getElementById("destination");
    const tmp = o.value;
    o.value = d.value;
    d.value = tmp;
  });
}

function initSearchButton() {
  document.getElementById("searchBtn").addEventListener("click", startSearch);
}

// ═══════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════

function startSearch() {
  const origin = document.getElementById("origin").value;
  const destination = document.getElementById("destination").value;
  const tripType = document.querySelector('input[name="tripType"]:checked').value;
  const departureDate = departureDatePicker ? departureDatePicker.getValue() : null;
  const returnDateValue = tripType === "roundtrip" && returnDatePicker ? returnDatePicker.getValue() : null;

  if (!origin || !destination) { showError("لطفاً مبدأ و مقصد را انتخاب کنید"); return; }
  if (origin === destination) { showError("مبدأ و مقصد نمی‌توانند یکسان باشند"); return; }
  if (!departureDate) { showError("لطفاً تاریخ پرواز را انتخاب کنید"); return; }
  if (tripType === "roundtrip" && !returnDateValue) { showError("لطفاً تاریخ برگشت را انتخاب کنید"); return; }

  const params = {
    origin, destination, departureDate,
    adult: passengers.adult, child: passengers.child, infant: passengers.infant,
    returnDate: returnDateValue || null
  };

  showLoading();

  chrome.runtime.sendMessage({ type: "SEARCH_FLIGHTS", params }, (response) => {
    if (chrome.runtime.lastError) { showError("خطا در ارتباط با سرویس جستجو"); return; }
    if (response && response.success) {
      currentFlights = response.results.flights;
      currentResults = response.results;
      saveResults(response.results);
      showResults(response.results);
    } else {
      showError(response?.error || "خطای ناشناخته در جستجو");
    }
  });
}

// ═══════════════════════════════════════════
// DISPLAY
// ═══════════════════════════════════════════

function showLoading() {
  hideAll();
  document.getElementById("loadingSection").style.display = "block";
  ["Alibaba", "Flytoday", "Mrbilit"].forEach(name => {
    document.getElementById("progress" + name).className = "source-item active";
    document.getElementById("status" + name).textContent = "در حال جستجو...";
  });
}

function showResults(data) {
  hideAll();
  if (data.flights.length === 0) {
    showSearchForm();
    document.getElementById("emptySection").style.display = "block";
    return;
  }
  document.getElementById("resultsSection").style.display = "block";
  document.getElementById("resultsTitle").textContent = data.total + " پرواز یافت شد";

  const badgesEl = document.getElementById("sourceBadges");
  badgesEl.innerHTML = "";
  for (const [src, info] of Object.entries(data.sourceStatus)) {
    const label = src === "alibaba" ? "علی‌بابا" : src === "flytoday" ? "فلای‌تودی" : "مستربلیت";
    badgesEl.appendChild(createBadge(src, label, info.count, info.error));
  }
  renderFlights(data.flights);
}

function createBadge(source, name, count, error) {
  const badge = document.createElement("div");
  badge.className = "source-badge " + source;
  if (error) {
    const s = document.createElement("span");
    s.textContent = name;
    badge.appendChild(s);
    const e = document.createElement("span");
    e.textContent = " (خطا)";
    e.style.color = "var(--danger)";
    badge.appendChild(e);
  } else {
    const s = document.createElement("span");
    s.textContent = name;
    badge.appendChild(s);
    const c = document.createElement("span");
    c.className = "source-badge-count";
    c.textContent = count;
    badge.appendChild(document.createTextNode(" "));
    badge.appendChild(c);
  }
  return badge;
}

function renderFlights(flights) {
  const list = document.getElementById("resultsList");
  list.innerHTML = "";
  flights.forEach(f => list.appendChild(createFlightCard(f)));
}

function createFlightCard(flight) {
  const card = document.createElement("div");
  card.className = "flight-card";
  card.addEventListener("click", () => {
    if (flight.bookingUrl) chrome.tabs.create({ url: flight.bookingUrl });
  });

  // Top
  const cardTop = document.createElement("div");
  cardTop.className = "card-top";

  const airlineInfo = document.createElement("div");
  airlineInfo.className = "airline-info";

  const logo = document.createElement("img");
  logo.className = "airline-logo";
  logo.alt = flight.airline.nameFa;
  logo.addEventListener("error", () => { logo.style.display = "none"; });
  if (flight.airline.logo) logo.src = flight.airline.logo;
  else logo.style.display = "none";

  const details = document.createElement("div");
  details.className = "airline-details";
  const nameEl = document.createElement("span");
  nameEl.className = "airline-name";
  nameEl.textContent = flight.airline.nameFa;
  const numEl = document.createElement("span");
  numEl.className = "flight-number";
  numEl.textContent = flight.flightNumber;
  details.appendChild(nameEl);
  details.appendChild(numEl);
  airlineInfo.appendChild(logo);
  airlineInfo.appendChild(details);

  const srcBadge = document.createElement("span");
  srcBadge.className = "card-source " + flight.source;
  srcBadge.textContent = flight.source === "alibaba" ? "علی‌بابا" : flight.source === "flytoday" ? "فلای‌تودی" : "مستربلیت";

  cardTop.appendChild(airlineInfo);
  cardTop.appendChild(srcBadge);

  // Times
  const cardTimes = document.createElement("div");
  cardTimes.className = "card-times";
  cardTimes.appendChild(createTimeBlock(formatTime(flight.departure), flight.origin));
  cardTimes.appendChild(createDurationLine(formatDuration(flight.duration)));
  cardTimes.appendChild(createTimeBlock(formatTime(flight.arrival), flight.destination));

  // Bottom
  const cardBottom = document.createElement("div");
  cardBottom.className = "card-bottom";

  const priceBlock = document.createElement("div");
  priceBlock.className = "price-block";
  const pl = document.createElement("span");
  pl.className = "price-label";
  pl.textContent = "قیمت هر نفر";
  const pv = document.createElement("span");
  pv.className = "price-value";
  pv.textContent = formatPrice(flight.prices.adult) + " ";
  const pu = document.createElement("span");
  pu.className = "price-unit";
  pu.textContent = "تومان";
  pv.appendChild(pu);
  priceBlock.appendChild(pl);
  priceBlock.appendChild(pv);

  const tags = document.createElement("div");
  tags.className = "card-tags";
  if (flight.seatsRemaining != null) {
    const st = document.createElement("span");
    st.className = "tag tag-seats" + (flight.seatsRemaining <= 2 ? " low" : "");
    st.textContent = flight.seatsRemaining + " صندلی";
    tags.appendChild(st);
  }
  if (flight.isCharter) {
    const ct = document.createElement("span");
    ct.className = "tag tag-charter";
    ct.textContent = "چارتر";
    tags.appendChild(ct);
  }
  if (flight.isRefundable) {
    const rt = document.createElement("span");
    rt.className = "tag tag-refundable";
    rt.textContent = "قابل استرداد";
    tags.appendChild(rt);
  }

  cardBottom.appendChild(priceBlock);
  cardBottom.appendChild(tags);

  card.appendChild(cardTop);
  card.appendChild(cardTimes);
  card.appendChild(cardBottom);
  return card;
}

function createTimeBlock(time, label) {
  const b = document.createElement("div");
  b.className = "time-block";
  const tv = document.createElement("div");
  tv.className = "time-value";
  tv.textContent = time;
  const tl = document.createElement("div");
  tl.className = "time-label";
  tl.textContent = label;
  b.appendChild(tv);
  b.appendChild(tl);
  return b;
}

function createDurationLine(dur) {
  const l = document.createElement("div");
  l.className = "duration-line";
  const bar = document.createElement("div");
  bar.className = "duration-bar";
  const txt = document.createElement("div");
  txt.className = "duration-text";
  txt.textContent = dur;
  l.appendChild(bar);
  l.appendChild(txt);
  return l;
}

// ═══════════════════════════════════════════
// SORT / NAV
// ═══════════════════════════════════════════

function initSortSelect() {
  document.getElementById("sortSelect").addEventListener("change", (e) => {
    renderFlights(sortFlights(currentFlights, e.target.value));
  });
}

function sortFlights(flights, sortBy) {
  const s = [...flights];
  if (sortBy === "price") s.sort((a, b) => (a.prices?.adult || Infinity) - (b.prices?.adult || Infinity));
  else if (sortBy === "departure") s.sort((a, b) => new Date(a.departure) - new Date(b.departure));
  else if (sortBy === "duration") s.sort((a, b) => (a.duration || Infinity) - (b.duration || Infinity));
  return s;
}

function initBackButton() {
  document.getElementById("backBtn").addEventListener("click", () => {
    clearSavedResults();
    currentFlights = [];
    currentResults = null;
    hideAll();
    showSearchForm();
  });
}

function initRetryButton() {
  document.getElementById("retryBtn").addEventListener("click", startSearch);
}

function showError(msg) {
  hideAll();
  showSearchForm();
  document.getElementById("errorSection").style.display = "block";
  document.getElementById("errorText").textContent = msg;
}

function hideAll() {
  ["loadingSection", "resultsSection", "errorSection", "emptySection"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
  document.getElementById("searchForm").style.display = "none";
}

function showSearchForm() {
  document.getElementById("searchForm").style.display = "flex";
}
