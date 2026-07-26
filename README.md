# Flights Aggregator Chrome Extension

A Chrome/Chromium extension for comparing domestic Iranian flight prices across multiple platforms.

<img width="425" height="503" alt="Screenshot 2026-07-26 174944" src="https://github.com/user-attachments/assets/b9ecdb96-5545-446c-9760-7464222aa632" />
<img width="431" height="608" alt="Screenshot 2026-07-26 175011" src="https://github.com/user-attachments/assets/50ef7889-b8e0-4460-b5dc-a0947422a9e1" />


## Overview

Compares results from **Alibaba**, **FlyToday**, and **MrBilit** in a single popup interface.

## Features

- Parallel search across multiple providers
- Jalali calendar support
- Airport/city selector with localized data
- Passenger selection
- Result sorting and retry controls
- Result persistence in `chrome.storage.local`
- Screenshot/export support

## Project Structure
```text
flights-aggregator/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── service-worker.js
├── generate-icons.js
├── adapters/
│   ├── alibaba.js
│   ├── flytoday.js
│   └── mrbilit.js
└── utils/
├── airports.js
├── datepicker.js
├── jalali.js
└── normalizer.js
```
## How It Works

1. User enters search criteria in the popup
2. Popup sends `SEARCH_FLIGHTS` message to the service worker
3. Service worker runs all provider adapters in parallel
4. Results are normalized and returned to the popup

## Technical Specifications

| Property | Value |
|---|---|
| Type | Chrome Extension |
| Manifest | V3 |
| Language | Vanilla JavaScript |
| Background | Service Worker |
| Storage | `chrome.storage.local` |
| Calendar | Jalali |

### Chrome APIs Used

- `chrome.runtime`
- `chrome.storage.local`
- `chrome.tabs`

### Permissions

json
"permissions": ["storage"]

### Host Permissions


*://*.alibaba.ir/*
*://*.ws.alibaba.ir/*
*://*.flytoday.ir/*
*://*.atighgasht.com/*
*://*.mrbilit.com/*

## Installation

1. Clone or download the project
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the project folder

## Icons

Required sizes: `16px`, `48px`, `128px`
If missing, generate using `generate-icons.js`.

## Known Limitations

- Depends on third-party provider structures — adapters may need updates if providers change their APIs or HTML
- No automated test suite included

## Disclaimer

Ensure your usage complies with the terms of service of each travel platform.

## License

No license included.
