# Map Architecture: MapLibre + OSM + Viewport API

This document describes the full map stack: **MapLibre + OpenStreetMap** on the client, **viewport-driven API** with **PostGIS** (optional) on the backend, and the **animated business-card carousel** on the map screen.

---

## Tech Stack

| Layer | Library / Tool | Purpose |
|-------|---------------|---------|
| Map renderer | `@maplibre/maplibre-react-native` | Native map view (vector/raster), camera control, gesture handling |
| Tiles | OpenStreetMap raster (`OSM_RASTER_STYLE`) | Free tile source; swap for a tile CDN in production |
| Markers | MapLibre `ShapeSource` + `SymbolLayer` / `CircleLayer` | GeoJSON-driven markers with custom pin icon (`salon-pin.png`) |
| Animations | `react-native-reanimated` v3 | 60 fps card carousel on the UI thread via shared values and worklets |
| Navigation | `expo-router` (`useRouter`, `useLocalSearchParams`) | Deep-linkable routes (`/map-search`, `/salon/[id]`) |
| Location | `expo-location` via `addressService.getCurrentLocation()` | GPS fix for "Locate me" and initial camera centering |
| Geocoding | Backend Nominatim proxy (`GET /places/suggest`) | Address autocomplete without Mapbox dependency |
| Viewport API | `GET /businesses/viewport` | Fetch businesses inside the visible map bounding box |
| State | React `useState` / `useRef` | Lightweight; no external state library needed for the map screen |
| UI toolkit | `react-native-safe-area-context`, `@expo/vector-icons` (Ionicons) | Safe-area insets, icon set |

---

## Backend

### Viewport endpoint

- **Route:** `GET /businesses/viewport?north=&south=&east=&west=&zoom=&query=&category=`
- **Behavior:** Returns businesses with at least one location whose `lat`/`lng` falls inside the bounding box.
- **Implementation:** `BusinessesService.findInViewport()` uses a Prisma `where` filter on `locations.lat` / `locations.lng` (no PostGIS required). An optional PostGIS migration adds `locations.geom` (Point, SRID 4326) and a GIST index for future spatial queries (distance ordering, clustering).

### Geocoding (Nominatim)

- **Proxy:** `GET /places/suggest?q=&limit=` implemented in `PlacesService`; calls Nominatim.
- **Caching:** In-memory cache, 24 h TTL, 1 req/s rate limit, required `User-Agent`. Set `NOMINATIM_EMAIL` in env for Nominatim policy compliance.
- **No Mapbox:** All geocoding goes through the Nominatim proxy.

---

## Mobile — Map Screen (`MapSearchScreen.tsx`)

### File structure

```
src/features/search/
├── pages/
│   ├── MapSearchScreen.tsx          # Full map screen with carousel
│   └── SearchResultsScreen.tsx      # List/map toggle; embeds MapSearchScreen
├── components/
│   ├── RendezSalonCard.tsx          # Card used in list view and carousel slots
│   ├── SalonImageCarousel.tsx       # Horizontal FlatList image carousel (salon detail)
│   ├── BusinessCard.tsx             # Basic business card for list views
│   └── index.ts                     # Barrel exports + ApiBusinessListItem type
├── services/
│   ├── viewportService.ts           # fetchViewportBusinesses() — calls GET /businesses/viewport
│   └── addressService.ts            # getCurrentLocation(), geocoding helpers
└── constants/
    ├── index.ts                     # DEFAULT_SALON_IMAGES, shared constants
    └── mapStyle.ts                  # OSM_RASTER_STYLE (MapLibre JSON style)
```

### Conditional MapLibre loading

MapLibre requires a **native dev build** — it is not available in Expo Go. The screen detects this at module level:

```ts
const isExpoGo = Constants.appOwnership === 'expo';
if (!isExpoGo) {
  const ML = require('@maplibre/maplibre-react-native');
  MapView = ML.MapView;  Camera = ML.Camera;  // ...
}
```

When MapLibre is unavailable, a placeholder is rendered and businesses are loaded via `GET /businesses` (city/query fallback) so the card still works.

### Markers (GeoJSON + ShapeSource)

Businesses are converted to a GeoJSON `FeatureCollection` and rendered as a single `ShapeSource`:

- **With SymbolLayer:** Custom pin icon (`salon-pin.png`) with zoom-interpolated `iconSize` (0.032 at z10 → 0.088 at z18).
- **Fallback CircleLayer:** Black circles with white stroke when `SymbolLayer` or `Images` are unavailable.
- **Tap handling:** `ShapeSource.onPress` fires `handleMarkerPress` with the tapped feature's `businessId` property.

### Viewport-driven loading

| Trigger | Debounce | Details |
|---------|----------|---------|
| `onRegionDidChange` | 400 ms | Fires after pan/zoom ends; debounced via `setTimeout` ref |
| "Search in this zone" button | none | Immediate; uses current `getVisibleBounds()` |
| Initial load | 600 ms after camera settle | Only when no `initialBusinesses` were passed from the list view |

Bounds come from `mapRef.getVisibleBounds()`. If that fails (some Android devices), a fallback ±0.05° delta around the last known center is used.

Viewport results **never wipe** the marker list — if the API returns zero results, the previous markers are kept so pins don't disappear.

### Camera initialization

1. If `initialBusinesses` have locations → center on their centroid (400 ms fly).
2. Else → await GPS fix (started on mount in parallel via `pendingLocationRef`) and fly there (600 ms).
3. Else → default to Paris center (48.8566, 2.3522), no animation.

A `userHasInteractedRef` guard prevents a slow GPS fix from overriding a manual pan.

### "Locate me"

Calls `getCurrentLocation()` → flies camera to user position (800 ms, zoom 14).

---

## Carousel Animation System

The bottom card uses a **3-slot strip** animated with `react-native-reanimated` shared values so all motion runs on the native UI thread at 60 fps.

### Layout

```
cardSlideContainer  (overflow: hidden, width = cardWidth)
└── Animated.View "strip"  (width = 3 × cardWidth, translateX = stripTranslate)
    ├── slot1  (width = cardWidth)  →  selectedBusiness (always populated)
    ├── slot2  (width = cardWidth)  →  previousBusiness ?? selectedBusiness
    └── slot3  (width = cardWidth)  →  empty placeholder
```

- `cardWidth = SCREEN_WIDTH - 32` (16 px margin each side).
- The visible window is one `cardWidth` wide; `overflow: hidden` clips the rest.

### States

| State | `stripTranslate` | slot1 | slot2 | What user sees |
|-------|-------------------|-------|-------|----------------|
| **Idle** | `-cardWidth` | selectedBusiness (off-screen) | selectedBusiness | Current card |
| **Animating** | `-cardWidth → 0` | new selectedBusiness (sliding in) | old previousBusiness (sliding out) | Slide transition |
| **Reset** | snap to `-cardWidth` | selectedBusiness (off-screen) | selectedBusiness | Current card (no visible change) |

### Animation flow (pin tap)

```
handleMarkerPress
  ├── setPreviousBusiness(currentSelected)
  └── setSelectedBusiness(newBusiness)
         │
         ▼
useLayoutEffect [previousBusiness changed]
  ├── stripTranslate.value = -cardWidth        // snap: show slot2 (old) before paint
  └── stripTranslate.value = withTiming(0)     // 420 ms, Easing.out(cubic)
         │
         ▼  (animation completes on UI thread)
worklet callback (finished = true)
  └── runOnJS(clearPrevious)()
         │
         ▼
clearPrevious
  └── setPreviousBusiness(null)
         │
         ▼
useLayoutEffect [previousBusiness = null]
  └── stripTranslate.value = -cardWidth        // instant snap back to idle
```

### Key design decisions

1. **`useLayoutEffect` for both trigger and reset** — runs after React commits the new tree but *before* the browser paints. This guarantees that the strip position and slot content are always in sync. Using `useEffect` would leave a gap where the strip position doesn't match the rendered slots, causing a flash of wrong data.

2. **Slot1 always renders `selectedBusiness`** — never an empty placeholder. When idle, slot1 is off-screen (strip at `-cardWidth`) so its content is invisible. But if the Reanimated shared-value snap arrives one UI-thread frame late, the user sees the correct card instead of a grey blink. This eliminates the atomicity problem between React state (JS thread) and shared values (UI thread).

3. **No intermediate `resettingStrip` state** — earlier versions used an extra boolean to keep slot1 populated during reset, requiring an additional render cycle. Since slot1 is now always populated, the extra state and its timing window are gone.

4. **Animation easing:** `Easing.out(Easing.cubic)` — fast start, gentle deceleration. The card feels like it's entering the screen with momentum.

5. **Quick-tap handling:** If the user taps a second pin before the first animation finishes, the `useLayoutEffect` re-runs: it cancels the in-flight `withTiming`, snaps to `-cardWidth`, and starts a new 420 ms animation. Because slot content is updated in the same React commit, no stale data is shown.

### The atomicity problem (and why the design is the way it is)

React state updates commit on the **JS thread**. Reanimated shared value updates apply on the **UI thread**. These two cannot be made atomic — there will always be at least one frame where one has updated and the other hasn't.

The carousel solves this by ensuring **every slot always contains valid data**:

- Slot1 = `selectedBusiness` (always correct).
- Slot2 = `previousBusiness ?? selectedBusiness` (correct in both animating and idle states).

So regardless of which frame the strip translate lands on, the user sees a real business card — never stale data, never an empty placeholder.

---

## Database (optional PostGIS)

Migration `20260313000000_add_postgis_viewport`:

- Creates PostGIS extension (comment out if your DB doesn't have PostGIS).
- Adds `locations.geom` (Point, SRID 4326) and populates from `lat`/`lng`.
- Adds GIST index on `geom`.

The viewport logic does **not** depend on PostGIS; it uses a simple lat/lng bounding box in Prisma. PostGIS is for future improvements (server-side clustering, distance sort).

---

## Running

1. **API:** Apply migrations (`npx prisma migrate deploy`). If PostGIS is not installed, comment out the PostGIS parts in the migration SQL.
2. **Mobile:** Install deps (`pnpm install`), then create a **dev build** (`npx expo run:android` or `npx expo run:ios`) to use the native map. In Expo Go you'll see the placeholder and list-only behavior.
3. **Geocoding:** Optionally set `NOMINATIM_EMAIL` in `apps/api/.env` for Nominatim usage policy.

---

## Production notes

- **Tiles:** Put a tile CDN (or your own cache) in front of OSM to reduce load and respect usage policy.
- **Clustering:** For high marker density, add server-side clustering by zoom level (return cluster points at low zoom, individual markers at high zoom).
- **Caching:** Geocoding cache is in-memory; for multi-instance APIs, use a shared cache (Redis) for `/places/suggest`.
- **Pin images:** The current `salon-pin.png` is a single icon for all businesses. Consider category-specific pins or selected-state pins for better UX.
