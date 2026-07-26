// Jalali Date Picker Component
// Creates a Persian calendar date picker without inline event handlers

class JalaliDatePicker {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onChange = options.onChange || (() => {});
    this.minDate = options.minDate || null;

    const today = JalaliDate.todayJalali();
    this.currentYear = today.jy;
    this.currentMonth = today.jm;
    this.selectedJy = null;
    this.selectedJm = null;
    this.selectedJd = null;

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = "";
    this.container.classList.add("jalali-datepicker");

    // Input display
    const inputWrap = document.createElement("div");
    inputWrap.className = "jalali-input-wrap";

    const input = document.createElement("input");
    input.type = "text";
    input.readOnly = true;
    input.className = "jalali-input";
    input.placeholder = "انتخاب تاریخ";
    this.input = input;

    const icon = document.createElement("span");
    icon.className = "jalali-input-icon";
    icon.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>`;

    inputWrap.appendChild(input);
    inputWrap.appendChild(icon);

    // Dropdown
    const dropdown = document.createElement("div");
    dropdown.className = "jalali-dropdown";
    dropdown.style.display = "none";
    this.dropdown = dropdown;

    this.container.appendChild(inputWrap);
    this.container.appendChild(dropdown);

    this.renderCalendar();
  }

  bindEvents() {
    this.input.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener("click", (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.dropdown.style.display === "none") {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    this.dropdown.style.display = "block";
    this.renderCalendar();
  }

  close() {
    this.dropdown.style.display = "none";
  }

  renderCalendar() {
    this.dropdown.innerHTML = "";

    // Header with month navigation
    const header = document.createElement("div");
    header.className = "jalali-header";

    const prevBtn = document.createElement("button");
    prevBtn.className = "jalali-nav-btn";
    prevBtn.textContent = "‹";
    prevBtn.setAttribute("type", "button");

    const nextBtn = document.createElement("button");
    nextBtn.className = "jalali-nav-btn";
    nextBtn.textContent = "›";
    nextBtn.setAttribute("type", "button");

    const monthYear = document.createElement("span");
    monthYear.className = "jalali-month-year";
    monthYear.textContent = `${JalaliDate.monthNames[this.currentMonth - 1]} ${this.currentYear}`;

    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.prevMonth();
    });

    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.nextMonth();
    });

    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);

    // Day names row
    const dayNamesRow = document.createElement("div");
    dayNamesRow.className = "jalali-day-names";

    JalaliDate.dayNames.forEach(name => {
      const span = document.createElement("span");
      span.className = "jalali-day-name";
      span.textContent = name;
      dayNamesRow.appendChild(span);
    });

    // Days grid
    const daysGrid = document.createElement("div");
    daysGrid.className = "jalali-days";

    const daysInMonth = JalaliDate.daysInJalaliMonth(this.currentYear, this.currentMonth);
    const firstDayOfMonth = this.getFirstDayOfMonth(this.currentYear, this.currentMonth);

    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      const empty = document.createElement("span");
      empty.className = "jalali-day empty";
      daysGrid.appendChild(empty);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("button");
      dayCell.className = "jalali-day";
      dayCell.textContent = this.toPersianNum(day);
      dayCell.setAttribute("type", "button");
      dayCell.dataset.day = day;

      // Check if this is today
      const today = JalaliDate.todayJalali();
      if (this.currentYear === today.jy && this.currentMonth === today.jm && day === today.jd) {
        dayCell.classList.add("today");
      }

      // Check if selected
      if (this.selectedJy === this.currentYear && this.selectedJm === this.currentMonth && this.selectedJd === day) {
        dayCell.classList.add("selected");
      }

      // Check if disabled (before min date)
      if (this.minDate && this.isBeforeMin(this.currentYear, this.currentMonth, day)) {
        dayCell.classList.add("disabled");
        dayCell.disabled = true;
      }

      dayCell.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectDay(day);
      });

      daysGrid.appendChild(dayCell);
    }

    this.dropdown.appendChild(header);
    this.dropdown.appendChild(dayNamesRow);
    this.dropdown.appendChild(daysGrid);
  }

  prevMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.renderCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.renderCalendar();
  }

  selectDay(day) {
    this.selectedJy = this.currentYear;
    this.selectedJm = this.currentMonth;
    this.selectedJd = day;

    const isoDate = JalaliDate.toISO(this.selectedJy, this.selectedJm, this.selectedJd);
    const displayDate = JalaliDate.formatJalaliDate(this.selectedJy, this.selectedJm, this.selectedJd);

    this.input.value = displayDate;
    this.input.dataset.iso = isoDate;
    this.input.dataset.jalali = `${this.selectedJy}/${String(this.selectedJm).padStart(2, "0")}/${String(this.selectedJd).padStart(2, "0")}`;

    this.close();
    this.onChange(isoDate);
  }

  getFirstDayOfMonth(jy, jm) {
    // Convert first day of Jalali month to day of week
    const { gy, gm, gd } = JalaliDate.jalaliToGregorian(jy, jm, 1);
    const date = new Date(gy, gm - 1, gd);
    let day = date.getDay(); // 0=Sun, 6=Sat
    // Convert to Saturday=0 system (Iran)
    day = (day + 1) % 7;
    return day;
  }

  isBeforeMin(jy, jm, jd) {
    if (!this.minDate) return false;
    const { jy: minJy, jm: minJm, jd: minJd } = this.minDate;
    if (jy < minJy) return true;
    if (jy > minJy) return false;
    if (jm < minJm) return true;
    if (jm > minJm) return false;
    return jd < minJd;
  }

  toPersianNum(num) {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, d => persianDigits[d]);
  }

  getValue() {
    return this.input.dataset.iso || null;
  }

  setValue(isoDate) {
    const { jy, jm, jd } = JalaliDate.fromISO(isoDate);
    this.selectedJy = jy;
    this.selectedJm = jm;
    this.selectedJd = jd;
    this.currentYear = jy;
    this.currentMonth = jm;

    this.input.value = JalaliDate.formatJalaliDate(jy, jm, jd);
    this.input.dataset.iso = isoDate;
    this.input.dataset.jalali = `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
  }

  setMinDate(isoDate) {
    if (isoDate) {
      this.minDate = JalaliDate.fromISO(isoDate);
    } else {
      this.minDate = null;
    }
  }
}
